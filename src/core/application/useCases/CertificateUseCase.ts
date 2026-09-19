import { CertificateRepository } from "@/infrastructure/persistence/repositories";
import { ActivityRepository } from "@/infrastructure/persistence/repositories";
import { ActivityParticipationRepository } from "@/infrastructure/persistence/repositories";
import { NotificationRepository } from "@/infrastructure/persistence/repositories";
import { R2StorageService } from "@/infrastructure/external/cloudFlare";
import { serviceError, guard } from "@/core/application/common";
import { toCertificateDto } from "@/core/application/mappers";
import { ActivityStatus, AttendanceStatus, CertificateStatus, NotificationType, SystemLogStatus } from "@/core/domain/enums";
import type { EmailUseCase, SystemLogUseCase } from "@/core/application/useCases";
import {
  ok,
  fail,
  GetUserCertificatesResponse,
  GetCertificateByIdResponse,
  IssueCertificateResponse
} from "@/core/application/dtos";
import { formatCertificateDate, logger } from "@/lib/utils";
import { sendPushToUser } from "@/lib/webpush";
import {
  CERTIFICATE_READY_TITLE,
  certificateReadyMessage,
  certificateReadyPushBody,
  ROUTES
} from "@/presentation/constants";

class CertificateUseCase {
  private static readonly SCOPE = "CertificateUseCase";

  constructor(
    private certificateRepository: CertificateRepository,
    private activityRepository: ActivityRepository,
    private participationRepository: ActivityParticipationRepository,
    private notificationRepository: NotificationRepository = new NotificationRepository(),
    private emailUseCase?: EmailUseCase,
    private systemLogUseCase?: SystemLogUseCase
  ) {}

  async getByUser(userId: string): Promise<GetUserCertificatesResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");

      const certs = await this.certificateRepository.findByUserId(userId);

      const activityIds = [...new Set(certs.map((c) => c.activityId))];
      const summaries = await Promise.all(
        activityIds.map((id) => this.activityRepository.findSummaryById(id))
      );
      const activityMap = new Map(activityIds.map((id, i) => [id, summaries[i]]));

      const certificates = certs.map((c) => {
        const summary = activityMap.get(c.activityId);
        return toCertificateDto(c, summary?.title ?? "", summary?.activityType ?? null, summary?.durationHours ?? null);
      });

      const totalHours = await this.participationRepository.sumAttendedHours(userId);

      logger.info(CertificateUseCase.SCOPE, "getByUser", `Found ${certificates.length} for: ${userId}`);
      return ok({ certificates, totalHours });
    } catch (error) {
      return serviceError(CertificateUseCase.SCOPE, "getByUser", error, "حدث خطأ أثناء جلب الشهادات");
    }
  }

  async getById(id: string): Promise<GetCertificateByIdResponse> {
    try {
      guard(id, "معرّف الشهادة مطلوب");

      const cert = await this.certificateRepository.findById(id);
      if (!cert) return fail("NOT_FOUND", "الشهادة غير موجودة");

      const summary = await this.activityRepository.findSummaryById(cert.activityId);

      logger.info(CertificateUseCase.SCOPE, "getById", `id=${id}`);
      return ok({
        certificate: toCertificateDto(cert, summary?.title ?? "", summary?.activityType ?? null, summary?.durationHours ?? null)
      });
    } catch (error) {
      return serviceError(CertificateUseCase.SCOPE, "getById", error, "حدث خطأ أثناء جلب الشهادة");
    }
  }

  async issueForVolunteer(activityId: string, userId: string): Promise<IssueCertificateResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");
      guard(userId, "معرّف المتطوع مطلوب");

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (activity.status !== ActivityStatus.COMPLETED)
        return fail("INVALID_STATE", "يمكن إصدار الشهادات للأنشطة المكتملة فقط");

      const volunteers = await this.participationRepository.findApprovedVolunteers(activityId);
      const volunteer = volunteers.find((row) => row.id === userId);
      if (!volunteer) return fail("NOT_FOUND", "المتطوع غير مسجّل في هذا النشاط");
      if (volunteer.attendanceStatus !== AttendanceStatus.ATTENDED)
        return fail("INVALID_STATE", "لا يمكن إصدار شهادة لمتطوع لم يُسجَّل حضوره");

      const existing = await this.certificateRepository.findByUserAndActivity(userId, activityId);
      if (existing?.status === CertificateStatus.COMPLETED && existing.pngUrl)
        return fail("CONFLICT", "الشهادة صادرة مسبقاً");

      const { default: CertificateGeneratorService } = await import("@/infrastructure/external/certificate/CertificateGeneratorService");
      const pngBuffer = await new CertificateGeneratorService().generatePNG({
        volunteerName: volunteer.fullName,
        activityTitle: activity.title,
        activityDate: formatCertificateDate(activity.date),
        durationHours: activity.durationHours,
        issueDate: formatCertificateDate(new Date()),
        certificateId: `${activityId}-${userId}`,
        gender: volunteer.gender === "MALE" || volunteer.gender === "FEMALE" ? volunteer.gender : null
      });

      const upload = await new R2StorageService().upload(
        pngBuffer,
        "certificates",
        `${userId}-${activityId}.png`
      );
      if (!upload.success || !upload.url) return fail("STORAGE_ERROR", "فشل رفع الشهادة إلى التخزين");

      const certificate = await this.certificateRepository.saveIssued({
        userId,
        activityId,
        pngUrl: upload.url
      });

      await this.notificationRepository.createMany([
        {
          userId,
          type: NotificationType.CERTIFICATE_ISSUED,
          title: CERTIFICATE_READY_TITLE,
          message: certificateReadyMessage(activity.title),
          metadata: { certificateId: certificate.id, activityId }
        }
      ]);

      void sendPushToUser(userId, {
        title: CERTIFICATE_READY_TITLE,
        body: certificateReadyPushBody(activity.title),
        url: ROUTES.VOLUNTEER.CERTIFICATES,
        tag: `cert-${activityId}`
      });

      const emailSent = await this.sendCertificateEmail(volunteer.email, volunteer.fullName, activity.title, upload.url);

      await this.systemLogUseCase?.logAction({
        action: "CERTIFICATE_ISSUED",
        status: SystemLogStatus.SUCCESS,
        message: `إصدار شهادة لنشاط: ${activity.title}`,
        userId,
        metadata: { activityId, certificateId: certificate.id, emailSent }
      });

      logger.info(
        CertificateUseCase.SCOPE,
        "issueForVolunteer",
        `activityId=${activityId} userId=${userId} emailSent=${emailSent}`
      );
      return ok({ certificateId: certificate.id, emailSent });
    } catch (error) {
      return serviceError(CertificateUseCase.SCOPE, "issueForVolunteer", error, "حدث خطأ أثناء إصدار الشهادة");
    }
  }

  private async sendCertificateEmail(
    email: string,
    fullName: string,
    activityTitle: string,
    pngUrl: string
  ): Promise<boolean> {
    if (!this.emailUseCase) return false;
    try {
      await this.emailUseCase.sendCertificateEmail(email, fullName, activityTitle, pngUrl);
      return true;
    } catch (error) {
      logger.warn(CertificateUseCase.SCOPE, "sendCertificateEmail", `Failed for ${email}: ${error}`);
      return false;
    }
  }
}

export default CertificateUseCase;
