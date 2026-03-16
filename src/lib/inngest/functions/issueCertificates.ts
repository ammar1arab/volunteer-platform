import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { R2StorageService, ResendClient } from "@/infrastructure/external";
import CertificateGeneratorService from "@/infrastructure/external/certificate/CertificateGeneratorService";
import CertificatePDFService from "@/infrastructure/external/certificate/CertificatePDFService";
import { logger } from "@/lib/utils";
import { buildCertificateEmail } from "@/lib/templates";

const SCOPE = "issueCertificates";

interface VolunteerData {
  userId: string;
  fullName: string;
  email: string;
  gender: "MALE" | "FEMALE" | null;
}

interface UploadedVolunteer {
  userId: string;
  fullName: string;
  email: string;
  pngUrl: string;
  pdfUrl: string;
}

function toDate(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`;
}

export const issueCertificates = inngest.createFunction(
  {
    id: "issue-certificates",
    name: "Issue Certificates",
    // retry failed steps up to 3 times before giving up
    retries: 3
  },
  { event: "activity/completed" },
  async ({ event, step }) => {
    const { activityId } = event.data as { activityId: string };
    logger.info(SCOPE, "start", `activityId=${activityId}`);

    // ─── STEP 1: FETCH DATA ───────────────────────────────────────────────────
    // One DB read — fast, well within 10s
    const { activity, volunteers } = await step.run("fetch-data", async () => {
      const activityData = await prisma.activity.findUnique({
        where: { id: activityId },
        select: { id: true, title: true, date: true, durationHours: true }
      });

      if (!activityData) throw new Error(`Activity not found: ${activityId}`);

      const participations = await prisma.activityParticipation.findMany({
        where: { activityId, attendanceStatus: "ATTENDED" },
        include: {
          volunteer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              volunteerProfile: { select: { gender: true } }
            }
          }
        }
      });

      const volunteers: VolunteerData[] = participations.map((p) => ({
        userId: p.volunteerId,
        fullName: p.volunteer.fullName,
        email: p.volunteer.email,
        gender: p.volunteer.volunteerProfile?.gender as "MALE" | "FEMALE" | null
      }));

      logger.info(SCOPE, "fetch-data", `Found ${volunteers.length} attended for activityId=${activityId}`);
      return { activity: activityData, volunteers };
    });

    if (!volunteers.length) {
      logger.info(SCOPE, "no-volunteers", `Skipping activityId=${activityId}`);
      return { issued: 0 };
    }

    // ─── STEP 2: FAN-OUT — one step per volunteer ─────────────────────────────
    // KEY: Each step.run gets a UNIQUE ID per volunteer.
    // Inngest executes each as a separate Vercel invocation.
    // 100 volunteers = 100 invocations × ~5s each = all within 10s limit.
    // If one fails, only that volunteer's step retries — others are unaffected.
    const activityDate = toDate(new Date(activity.date));
    const issueDate = toDate(new Date());

    const results = await Promise.all(
      volunteers.map((v) =>
        step.run(`generate-upload-${v.userId}`, async () => {
          try {
            const generator = new CertificateGeneratorService();
            const pdfService = new CertificatePDFService();
            const storage = new R2StorageService();

            const pngBuffer = await generator.generatePNG({
              volunteerName: v.fullName,
              activityTitle: activity.title,
              activityDate,
              durationHours: activity.durationHours,
              issueDate,
              certificateId: `${activityId}-${v.userId}`,
              gender: v.gender
            });

            const pdfBuffer = await pdfService.generatePDF(pngBuffer);

            const [pngRes, pdfRes] = await Promise.all([
              storage.upload(pngBuffer, "certificates", `${v.userId}-${activityId}.png`),
              storage.upload(pdfBuffer, "certificates", `${v.userId}-${activityId}.pdf`)
            ]);

            if (!pngRes.success || !pdfRes.success) {
              // throwing causes Inngest to retry this specific step
              throw new Error(`R2 upload failed for userId=${v.userId}`);
            }

            logger.info(SCOPE, `generate-upload-${v.userId}`, `Done: ${v.fullName}`);
            return {
              userId: v.userId,
              fullName: v.fullName,
              email: v.email,
              pngUrl: pngRes.url!,
              pdfUrl: pdfRes.url!
            } as UploadedVolunteer;
          } catch (err) {
            // log and return null — let other volunteers continue
            logger.warn(SCOPE, `generate-upload-${v.userId}`, `Failed: ${err}`);
            return null;
          }
        })
      )
    );

    // filter out any failed volunteers
    const uploaded = results.filter((r): r is UploadedVolunteer => r !== null);

    logger.info(
      SCOPE,
      "generate-upload-complete",
      `success=${uploaded.length} failed=${volunteers.length - uploaded.length} total=${volunteers.length}`
    );

    if (!uploaded.length) {
      logger.warn(SCOPE, "all-failed", `No certificates generated for activityId=${activityId}`);
      return { issued: 0 };
    }

    // ─── STEP 3: SAVE TO DATABASE ─────────────────────────────────────────────
    // Two createMany calls — one DB round trip, fast
    await step.run("save-to-db", async () => {
      // ← ولّد IDs مسبقاً حتى نستخدمها بالـ notification
      const uploadedWithIds = uploaded.map((u) => ({
        ...u,
        certificateId: crypto.randomUUID()
      }));

      await prisma.$transaction([
        prisma.certificate.createMany({
          data: uploadedWithIds.map((u) => ({
            id: u.certificateId, // ← حط الـ ID صراحةً
            userId: u.userId,
            activityId,
            pngUrl: u.pngUrl,
            pdfUrl: u.pdfUrl,
            status: "COMPLETED"
          })),
          skipDuplicates: true
        }),
        prisma.notification.createMany({
          data: uploadedWithIds.map((u) => ({
            userId: u.userId,
            type: "CERTIFICATE_ISSUED",
            title: "شهادتك التطوعية جاهزة",
            message: `تم إصدار شهادة مشاركتك في نشاط ${activity.title}`,
            metadata: {
              certificateId: u.certificateId // ← هاد اللي كان ناقص
            }
          }))
        })
      ]);

      logger.info(SCOPE, "save-to-db", `Saved ${uploadedWithIds.length} certificates + notifications`);
    });

    // ─── STEP 4: SEND EMAILS ──────────────────────────────────────────────────
    // Resend batch: 1 API call for up to 100 emails
    await step.run("send-emails", async () => {
      const resend = ResendClient.getInstance();

      // Resend batch limit is 100 — chunk if needed
      const BATCH_SIZE = 100;
      for (let i = 0; i < uploaded.length; i += BATCH_SIZE) {
        const batch = uploaded.slice(i, i + BATCH_SIZE);
        await resend.batch.send(
          batch.map((u) => ({
            from: "certificates@youthprints.online",
            to: u.email,
            subject: `شهادتك التطوعية جاهزة - ${activity.title}`,
            html: buildCertificateEmail(u.fullName, activity.title, u.pngUrl, u.pdfUrl)
          }))
        );
        logger.info(SCOPE, "send-emails", `Sent batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} emails`);
      }
    });

    logger.info(
      SCOPE,
      "complete",
      `Issued ${uploaded.length}/${volunteers.length} certificates for activityId=${activityId}`
    );
    return { issued: uploaded.length };
  }
);
