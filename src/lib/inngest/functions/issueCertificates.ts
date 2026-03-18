import { prisma } from "@/infrastructure/persistence/prisma";
import {
  R2StorageService,
  ResendClient,
  CertificateGeneratorService,
} from "@/infrastructure/external";
import { inngest } from "@/lib/inngest/client";
import { buildCertificateEmail } from "@/lib/templates";
import { logger } from "@/lib/utils";

const SCOPE = "issueCertificates";

interface VolunteerData {
  userId:   string;
  fullName: string;
  email:    string;
  gender:   "MALE" | "FEMALE" | null;
}

interface UploadedVolunteer {
  userId:   string;
  fullName: string;
  email:    string;
  pngUrl:   string;
}

function toDate(date: Date): string {
  const d = new Date(date);
  return `${d.getFullYear()} / ${d.getMonth() + 1} / ${d.getDate()}`;
}

export const issueCertificates = inngest.createFunction(
  { id: "issue-certificates", name: "Issue Certificates", retries: 3 },
  { event: "activity/completed" },
  async ({ event, step }) => {
    const { activityId } = event.data as { activityId: string };
    logger.info(SCOPE, "start", `activityId=${activityId}`);

    const { activity, volunteers } = await step.run("fetch-data", async () => {
      const activityData = await prisma.activity.findUnique({
        where:  { id: activityId },
        select: { id: true, title: true, date: true, durationHours: true },
      });

      if (!activityData) throw new Error(`Activity not found: ${activityId}`);

      const participations = await prisma.activityParticipation.findMany({
        where:   { activityId, attendanceStatus: "ATTENDED" },
        include: {
          volunteer: {
            select: {
              id:               true,
              fullName:         true,
              email:            true,
              volunteerProfile: { select: { gender: true } },
            },
          },
        },
      });

      const volunteers: VolunteerData[] = participations.map((p) => ({
        userId:   p.volunteerId,
        fullName: p.volunteer.fullName,
        email:    p.volunteer.email,
        gender:   p.volunteer.volunteerProfile?.gender as "MALE" | "FEMALE" | null,
      }));

      logger.info(SCOPE, "fetch-data", `Found ${volunteers.length} attended for activityId=${activityId}`);
      return { activity: activityData, volunteers };
    });

    if (!volunteers.length) {
      logger.info(SCOPE, "no-volunteers", `Skipping activityId=${activityId}`);
      return { issued: 0 };
    }

    const activityDate = toDate(new Date(activity.date));
    const issueDate    = toDate(new Date());

    const results = await Promise.all(
      volunteers.map((v) =>
        step.run(`generate-upload-${v.userId}`, async () => {
          try {
            const generator = new CertificateGeneratorService();
            const storage   = new R2StorageService();

            const pngBuffer = await generator.generatePNG({
              volunteerName: v.fullName,
              activityTitle: activity.title,
              activityDate,
              durationHours: activity.durationHours,
              issueDate,
              certificateId: `${activityId}-${v.userId}`,
              gender:        v.gender,
            });

            const pngRes = await storage.upload(
              pngBuffer, "certificates", `${v.userId}-${activityId}.png`
            );

            if (!pngRes.success) throw new Error(`R2 upload failed for userId=${v.userId}`);

            logger.info(SCOPE, `generate-upload-${v.userId}`, `Done: ${v.fullName}`);
            return { userId: v.userId, fullName: v.fullName, email: v.email, pngUrl: pngRes.url! };
          } catch (err) {
            logger.warn(SCOPE, `generate-upload-${v.userId}`, `Failed: ${err}`);
            return null;
          }
        })
      )
    );

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

    await step.run("save-to-db", async () => {
      const uploadedWithIds = uploaded.map((u) => ({
        ...u,
        certificateId: crypto.randomUUID(),
      }));

      await prisma.$transaction([
        prisma.certificate.createMany({
          data: uploadedWithIds.map((u) => ({
            id:         u.certificateId,
            userId:     u.userId,
            activityId,
            pngUrl:     u.pngUrl,
            status:     "COMPLETED",
          })),
          skipDuplicates: true,
        }),
        prisma.notification.createMany({
          data: uploadedWithIds.map((u) => ({
            userId:  u.userId,
            type:    "CERTIFICATE_ISSUED",
            title:   "شهادتك التطوعية جاهزة",
            message: `تم إصدار شهادة مشاركتك في نشاط ${activity.title}`,
            metadata: { certificateId: u.certificateId },
          })),
        }),
      ]);

      logger.info(SCOPE, "save-to-db", `Saved ${uploadedWithIds.length} certificates + notifications`);
    });

    await step.run("send-emails", async () => {
      const resend     = ResendClient.getInstance();
      const BATCH_SIZE = 100;

      for (let i = 0; i < uploaded.length; i += BATCH_SIZE) {
        const batch = uploaded.slice(i, i + BATCH_SIZE);
        await resend.batch.send(
          batch.map((u) => ({
            from:    "certificates@youthprints.online",
            to:      u.email,
            subject: `شهادتك التطوعية جاهزة - ${activity.title}`,
            html:    buildCertificateEmail(u.fullName, activity.title, u.pngUrl),
          }))
        );
        logger.info(SCOPE, "send-emails", `Sent batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} emails`);
      }
    });

    logger.info(SCOPE, "complete", `Issued ${uploaded.length}/${volunteers.length} certificates for activityId=${activityId}`);
    return { issued: uploaded.length };
  }
);