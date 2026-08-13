import {
  ActivityRepository,
  ActivityParticipationRepository,
  ActivityPresenterRepository,
  MeetingIntegrationRepository,
  MeetingSyncOperationRepository
} from "@/infrastructure/persistence/repositories";
import { GoogleMeetingProvider } from "@/infrastructure/external";
import { encrypt, decrypt } from "@/infrastructure/security";
import { MeetingIntegration } from "@/core/domain/entities";
import { serviceError, guard } from "@/core/application/common";
import {
  ok,
  fail,
  GetMeetingIntegrationStatusResponse,
  GetGoogleConnectUrlResponse,
  DisconnectGoogleMeetResponse,
  HandleGoogleOAuthCallbackResponse,
  ListOnlineMeetingsResponse,
  OnlineMeetingFilter,
  OnlineMeetingListItemDto,
  RetryMeetingSyncResponse,
  GetMeetingLaunchUrlResponse,
  EnqueueMeetingSyncResponse,
  GetMeetingReportResponse,
  ImportMeetingReportResponse,
  RequestMeetingReportImportResponse,
  MatchMeetingAttendeeResponse,
  MeetingReportDto,
  MeetingReportSummaryDto
} from "@/core/application/dtos";
import {
  ActivityStatus,
  ActivityType,
  MeetingAttendeeMatchStatus,
  MeetingIntegrationStatus,
  MeetingLinkSource,
  MeetingReportStatus,
  MeetingSyncOperationType,
  MeetingSyncStatus,
  ParticipationStatus,
  UserRole
} from "@/core/domain/enums";
import type { IMeetingProvider, ProvisionMeetingInput } from "@/core/domain/interfaces";
import { prisma } from "@/infrastructure/persistence/prisma";
import { inngest } from "@/lib/inngest/client";
import { logger } from "@/lib/utils";

class MeetingUseCase {
  private static readonly SCOPE = "MeetingUseCase";
  private static readonly PROVIDER = "GOOGLE_MEET";

  constructor(
    private integrationRepository: MeetingIntegrationRepository,
    private syncOperationRepository: MeetingSyncOperationRepository,
    private activityRepository: ActivityRepository,
    private presenterRepository: ActivityPresenterRepository,
    private participationRepository: ActivityParticipationRepository,
    private meetingProvider: IMeetingProvider = new GoogleMeetingProvider()
  ) {}

  private toStatusDto(integration: MeetingIntegration | null) {
    if (!integration || integration.status === MeetingIntegrationStatus.DISCONNECTED) {
      return {
        connected: false,
        provider: MeetingUseCase.PROVIDER,
        organizerEmail: null,
        calendarId: null,
        status: integration?.status ?? null,
        lastError: integration?.lastError ?? null,
        lastCheckedAt: integration?.lastCheckedAt?.toISOString() ?? null,
        connectedById: integration?.connectedById ?? null,
        scopes: [] as string[]
      };
    }

    return {
      connected: integration.status === MeetingIntegrationStatus.CONNECTED,
      provider: integration.provider,
      organizerEmail: integration.organizerEmail,
      calendarId: integration.calendarId,
      status: integration.status,
      lastError: integration.lastError,
      lastCheckedAt: integration.lastCheckedAt?.toISOString() ?? null,
      connectedById: integration.connectedById,
      scopes: integration.scopes
    };
  }

  private buildDateTime(date: Date, timeHHmm: string, timeZone: string): string {
    const [hours, minutes] = timeHHmm.split(":").map(Number);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    const hh = String(hours ?? 0).padStart(2, "0");
    const mm = String(minutes ?? 0).padStart(2, "0");
    // Local wall-clock in activity timezone; Google Calendar accepts dateTime + timeZone.
    return `${y}-${m}-${d}T${hh}:${mm}:00`;
  }

  private toProvisionInput(activity: {
    id: string;
    title: string;
    description: string;
    date: Date;
    startTime: string;
    endTime: string;
    timeZone: string;
  }): ProvisionMeetingInput {
    return {
      activityId: activity.id,
      title: activity.title,
      description: activity.description,
      startDateTime: this.buildDateTime(activity.date, activity.startTime, activity.timeZone),
      endDateTime: this.buildDateTime(activity.date, activity.endTime, activity.timeZone),
      timeZone: activity.timeZone,
      requestId: `activity-${activity.id}-${Date.now()}`
    };
  }

  private async notifySyncRequested(operationId: string): Promise<void> {
    try {
      await inngest.send({ name: "meeting/sync.requested", data: { operationId } });
    } catch (error) {
      logger.warn(MeetingUseCase.SCOPE, "notifySyncRequested", String(error));
    }
  }

  private async enqueueAttendeeSyncQuietly(activityId: string): Promise<void> {
    try {
      const type = MeetingSyncOperationType.SYNC_ATTENDEES;
      const operation = await this.syncOperationRepository.enqueue({
        activityId,
        type,
        dedupeKey: `${activityId}:${type}`,
        payload: { activityId, type }
      });
      await this.notifySyncRequested(operation.id);
    } catch (error) {
      logger.warn(MeetingUseCase.SCOPE, "enqueueAttendeeSyncQuietly", String(error));
    }
  }

  private async collectAttendees(activityId: string) {
    const [presenters, approved] = await Promise.all([
      this.presenterRepository.findByActivity(activityId),
      this.participationRepository.findApprovedVolunteers(activityId)
    ]);

    const presenterIds = presenters.map((p) => p.presenterId);
    const presenterUsers = presenterIds.length
      ? await prisma.user.findMany({
          where: { id: { in: presenterIds } },
          select: { id: true, email: true, fullName: true }
        })
      : [];

    const byEmail = new Map<string, { email: string; displayName?: string }>();
    for (const user of presenterUsers) {
      if (!user.email) continue;
      byEmail.set(user.email.toLowerCase(), { email: user.email, displayName: user.fullName });
    }
    for (const volunteer of approved) {
      if (!volunteer.email) continue;
      byEmail.set(volunteer.email.toLowerCase(), {
        email: volunteer.email,
        displayName: volunteer.fullName
      });
    }
    return [...byEmail.values()];
  }

  private async notifyReportRequested(activityId: string): Promise<void> {
    try {
      await inngest.send({ name: "meeting/report.requested", data: { activityId } });
    } catch (error) {
      logger.warn(MeetingUseCase.SCOPE, "notifyReportRequested", String(error));
    }
  }

  private buildComparableDateTime(date: Date, timeHHmm: string): Date {
    const [h, m] = timeHHmm.split(":").map(Number);
    const end = new Date(date);
    end.setHours(h || 0, m || 0, 0, 0);
    return end;
  }

  private toReportDto(report: {
    activityId: string;
    conferenceId: string | null;
    startedAt: Date | null;
    endedAt: Date | null;
    status: string;
    lastError: string | null;
    importedAt: Date | null;
    attendees: Array<{
      id: string;
      displayName: string;
      signedInEmail: string | null;
      matchedUserId: string | null;
      attendedSeconds: number;
      firstJoinedAt: Date | null;
      lastLeftAt: Date | null;
      matchStatus: string;
    }>;
  }): MeetingReportDto {
    const matchedCount = report.attendees.filter(
      (a) => a.matchStatus === MeetingAttendeeMatchStatus.MATCHED
    ).length;
    const unmatchedCount = report.attendees.length - matchedCount;
    return {
      activityId: report.activityId,
      conferenceId: report.conferenceId,
      startedAt: report.startedAt?.toISOString() ?? null,
      endedAt: report.endedAt?.toISOString() ?? null,
      status: report.status as MeetingReportStatus,
      lastError: report.lastError,
      importedAt: report.importedAt?.toISOString() ?? null,
      attendeeCount: report.attendees.length,
      matchedCount,
      unmatchedCount,
      attendees: report.attendees.map((a) => ({
        id: a.id,
        displayName: a.displayName,
        signedInEmail: a.signedInEmail,
        matchedUserId: a.matchedUserId,
        attendedSeconds: a.attendedSeconds,
        firstJoinedAt: a.firstJoinedAt?.toISOString() ?? null,
        lastLeftAt: a.lastLeftAt?.toISOString() ?? null,
        matchStatus: a.matchStatus
      }))
    };
  }

  private toReportSummary(
    report:
      | {
          status: string;
          importedAt: Date | null;
          attendees: Array<{ matchStatus: string }>;
        }
      | null
      | undefined
  ): MeetingReportSummaryDto | null {
    if (!report) return null;
    const matchedCount = report.attendees.filter(
      (a) => a.matchStatus === MeetingAttendeeMatchStatus.MATCHED
    ).length;
    return {
      status: report.status,
      importedAt: report.importedAt?.toISOString() ?? null,
      attendeeCount: report.attendees.length,
      matchedCount,
      unmatchedCount: report.attendees.length - matchedCount
    };
  }

  async getIntegrationStatus(): Promise<GetMeetingIntegrationStatusResponse> {
    try {
      const integration = await this.integrationRepository.findByProvider(MeetingUseCase.PROVIDER);
      return ok({ integration: this.toStatusDto(integration) });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "getIntegrationStatus", error, "تعذر جلب حالة التكامل");
    }
  }

  async getConnectUrl(
    userId: string,
    redirectUri?: string
  ): Promise<GetGoogleConnectUrlResponse> {
    try {
      guard(userId, "معرّف المستخدم مطلوب");
      const resolvedRedirect =
        redirectUri?.trim() ||
        `${(process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")}/api/integrations/google/callback`;
      const state = Buffer.from(
        JSON.stringify({
          userId,
          nonce: crypto.randomUUID(),
          ts: Date.now(),
          redirectUri: resolvedRedirect
        }),
        "utf8"
      ).toString("base64url");
      const url = this.meetingProvider.getAuthUrl(state, resolvedRedirect);
      return ok({ url, state });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "getConnectUrl", error, "تعذر إنشاء رابط الربط");
    }
  }

  async handleOAuthCallback(
    code: string,
    connectedById: string,
    redirectUri?: string
  ): Promise<HandleGoogleOAuthCallbackResponse> {
    try {
      guard(code, "رمز التفويض مطلوب");
      guard(connectedById, "معرّف المستخدم مطلوب");

      const exchanged = await this.meetingProvider.exchangeCode(code, redirectUri);
      const encryptedRefreshToken = encrypt(exchanged.refreshToken);

      const existing = await this.integrationRepository.findByProvider(MeetingUseCase.PROVIDER);
      if (existing) {
        existing.markConnected({
          organizerEmail: exchanged.email,
          encryptedRefreshToken,
          scopes: exchanged.scopes,
          connectedById
        });
        await this.integrationRepository.update(existing);
      } else {
        const created = MeetingIntegration.create({
          organizerEmail: exchanged.email,
          encryptedRefreshToken,
          scopes: exchanged.scopes,
          connectedById
        });
        await this.integrationRepository.create(created);
      }

      logger.info(MeetingUseCase.SCOPE, "handleOAuthCallback", `Connected ${exchanged.email}`);
      return ok({ connected: true, email: exchanged.email });
    } catch (error) {
      logger.error(
        MeetingUseCase.SCOPE,
        "handleOAuthCallback",
        error instanceof Error ? error : String(error)
      );
      return serviceError(MeetingUseCase.SCOPE, "handleOAuthCallback", error, "فشل ربط حساب Google");
    }
  }

  async disconnect(): Promise<DisconnectGoogleMeetResponse> {
    try {
      const integration = await this.integrationRepository.findByProvider(MeetingUseCase.PROVIDER);
      if (!integration) return ok({ disconnected: true });
      integration.markDisconnected();
      await this.integrationRepository.update(integration);
      return ok({ disconnected: true });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "disconnect", error, "تعذر قطع ربط Google Meet");
    }
  }

  async enqueueProvision(
    activityId: string,
    type: MeetingSyncOperationType
  ): Promise<EnqueueMeetingSyncResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");
      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (!activity.usesAutomaticMeeting()) {
        return fail("INVALID_STATE", "النشاط لا يستخدم اجتماعات Google التلقائية");
      }

      const dedupeKey = `${activityId}:${type}`;
      const operation = await this.syncOperationRepository.enqueue({
        activityId,
        type,
        dedupeKey,
        payload: { activityId, type }
      });

      activity.markMeetingSyncPending();
      await this.activityRepository.update(activity);
      await this.notifySyncRequested(operation.id);

      return ok({ operationId: operation.id });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "enqueueProvision", error, "تعذر جدولة مزامنة الاجتماع");
    }
  }

  async processSyncOperation(operationId: string): Promise<{ success: boolean; message?: string }> {
    try {
      guard(operationId, "معرّف العملية مطلوب");
      const operation = await this.syncOperationRepository.findById(operationId);
      if (!operation) return { success: false, message: "Operation not found" };

      await this.syncOperationRepository.markProcessing(operationId);

      const activity = await this.activityRepository.findById(operation.activityId);
      if (!activity) {
        await this.syncOperationRepository.markFailed(operationId, "Activity not found");
        return { success: false, message: "Activity not found" };
      }

      const integration = await this.integrationRepository.findByProvider(MeetingUseCase.PROVIDER);
      if (!integration || integration.status !== MeetingIntegrationStatus.CONNECTED) {
        const msg = "Google Meet integration is not connected";
        if (operation.type !== MeetingSyncOperationType.SYNC_ATTENDEES) {
          activity.markMeetingSyncFailed(msg);
          await this.activityRepository.update(activity);
        }
        await this.syncOperationRepository.markFailed(operationId, msg);
        return { success: false, message: msg };
      }

      const refreshToken = decrypt(integration.encryptedRefreshToken);
      const props = activity.toObject();
      const input = this.toProvisionInput({
        id: props.id,
        title: props.title,
        description: props.description,
        date: props.date,
        startTime: props.startTime,
        endTime: props.endTime,
        timeZone: props.timeZone
      });

      try {
        if (operation.type === MeetingSyncOperationType.SYNC_ATTENDEES) {
          if (!props.externalMeetingId) {
            await this.syncOperationRepository.markCompleted(operationId);
            return { success: true, message: "No external meeting to sync attendees" };
          }

          const attendees = await this.collectAttendees(activity.id);
          await this.meetingProvider.syncAttendees(
            refreshToken,
            integration.calendarId,
            props.externalMeetingId,
            attendees
          );
          await this.syncOperationRepository.markCompleted(operationId);
          return { success: true };
        }

        if (operation.type === MeetingSyncOperationType.CREATE) {
          const result = await this.meetingProvider.createMeeting(
            refreshToken,
            integration.calendarId,
            input
          );
          activity.attachProvisionedMeeting(result);
        } else if (operation.type === MeetingSyncOperationType.UPDATE) {
          if (!props.externalMeetingId) {
            const result = await this.meetingProvider.createMeeting(
              refreshToken,
              integration.calendarId,
              input
            );
            activity.attachProvisionedMeeting(result);
          } else {
            const result = await this.meetingProvider.updateMeeting(
              refreshToken,
              integration.calendarId,
              props.externalMeetingId,
              input
            );
            activity.attachProvisionedMeeting(result);
          }
        } else if (operation.type === MeetingSyncOperationType.CANCEL) {
          if (props.externalMeetingId) {
            await this.meetingProvider.cancelMeeting(
              refreshToken,
              integration.calendarId,
              props.externalMeetingId
            );
          }
          activity.markMeetingCancelled();
        } else {
          await this.syncOperationRepository.markCompleted(operationId);
          return { success: true, message: `Skipped unsupported type ${operation.type}` };
        }

        await this.activityRepository.update(activity);
        await this.syncOperationRepository.markCompleted(operationId);

        // After provision, refresh calendar attendees (presenters + approved).
        if (
          operation.type === MeetingSyncOperationType.CREATE ||
          operation.type === MeetingSyncOperationType.UPDATE
        ) {
          await this.enqueueAttendeeSyncQuietly(activity.id);
        }

        return { success: true };
      } catch (providerError) {
        const message = providerError instanceof Error ? providerError.message : String(providerError);

        if (operation.type !== MeetingSyncOperationType.SYNC_ATTENDEES) {
          activity.markMeetingSyncFailed(message);
          await this.activityRepository.update(activity);
        }

        await this.syncOperationRepository.markFailed(operationId, message);

        if (/invalid_grant|reauth|unauthorized/i.test(message)) {
          integration.markNeedsReauth(message);
          await this.integrationRepository.update(integration);
        }

        return { success: false, message };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(MeetingUseCase.SCOPE, "processSyncOperation", message);
      try {
        await this.syncOperationRepository.markFailed(operationId, message);
      } catch {
        /* ignore */
      }
      return { success: false, message };
    }
  }

  async retryActivitySync(activityId: string): Promise<RetryMeetingSyncResponse> {
    try {
      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (!activity.usesAutomaticMeeting()) {
        return fail("INVALID_STATE", "النشاط لا يستخدم اجتماعات Google التلقائية");
      }

      const type = activity.toObject().externalMeetingId
        ? MeetingSyncOperationType.UPDATE
        : MeetingSyncOperationType.CREATE;

      const enqueued = await this.enqueueProvision(activityId, type);
      if (!enqueued.success) return enqueued;
      return ok({ operationId: enqueued.data.operationId, activityId });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "retryActivitySync", error, "تعذر إعادة مزامنة الاجتماع");
    }
  }

  async listOnlineMeetings(filter: OnlineMeetingFilter = "all"): Promise<ListOnlineMeetingsResponse> {
    try {
      const now = new Date();
      const rows = await prisma.activity.findMany({
        where: {
          deletedAt: null,
          activityType: ActivityType.ONLINE,
          OR: [
            { meetingLink: { not: null } },
            { meetingLinkSource: MeetingLinkSource.GOOGLE_MEET_AUTO }
          ]
        },
        include: {
          presenters: {
            where: { isActive: true, role: "PRIMARY" },
            take: 1,
            include: {
              presenter: { select: { id: true, fullName: true, email: true } }
            }
          },
          meetingReport: {
            select: {
              status: true,
              importedAt: true,
              attendees: { select: { matchStatus: true } }
            }
          },
          _count: {
            select: {
              participations: { where: { status: ParticipationStatus.APPROVED } }
            }
          }
        },
        orderBy: { date: "asc" }
      });

      const meetings: OnlineMeetingListItemDto[] = rows
        .filter((row) => {
          if (filter === "all") return true;
          const end = this.buildComparableDateTime(row.date, row.endTime);
          if (filter === "upcoming") return end >= now;
          return end < now;
        })
        .map((row) => {
          const primary = row.presenters[0];
          return {
            activityId: row.id,
            title: row.title,
            date: row.date.toISOString(),
            startTime: row.startTime,
            endTime: row.endTime,
            timeZone: row.timeZone || "Asia/Amman",
            status: row.status as ActivityStatus,
            activityType: row.activityType as ActivityType,
            meetingLink: row.meetingLink,
            meetingPlatform: row.meetingPlatform as OnlineMeetingListItemDto["meetingPlatform"],
            meetingLinkSource: row.meetingLinkSource as MeetingLinkSource,
            meetingSyncStatus: row.meetingSyncStatus as MeetingSyncStatus,
            meetingSyncError: row.meetingSyncError,
            meetingSyncedAt: row.meetingSyncedAt?.toISOString() ?? null,
            externalMeetingId: row.externalMeetingId,
            meetingCode: row.meetingCode,
            approvedCount: row._count.participations,
            presenter: primary?.presenter
              ? {
                  presenterId: primary.presenter.id,
                  fullName: primary.presenter.fullName,
                  email: primary.presenter.email
                }
              : null,
            reportSummary: this.toReportSummary(row.meetingReport)
          };
        });

      return ok({ meetings });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "listOnlineMeetings", error, "تعذر جلب قائمة الاجتماعات");
    }
  }

  async getMeetingLaunchUrl(
    activityId: string,
    userId: string,
    role: string
  ): Promise<GetMeetingLaunchUrlResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");
      guard(userId, "معرّف المستخدم مطلوب");

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");

      const props = activity.toObject();
      const link = props.meetingLink;
      if (!link) return fail("NOT_FOUND", "رابط الاجتماع غير متوفر بعد");

      const payload = {
        url: link,
        title: props.title,
        date: props.date instanceof Date ? props.date.toISOString() : String(props.date),
        startTime: props.startTime,
        endTime: props.endTime
      };

      if (role === UserRole.ADMIN) {
        return ok(payload);
      }

      const presenter = await this.presenterRepository.findByActivityAndPresenter(activityId, userId);
      if (presenter?.isActive) return ok(payload);

      const participation = await this.participationRepository.findByActivityAndVolunteer(
        activityId,
        userId
      );
      if (participation && participation.status === ParticipationStatus.APPROVED) {
        return ok(payload);
      }

      return fail("FORBIDDEN", "ليس لديك صلاحية للانضمام إلى هذا الاجتماع");
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "getMeetingLaunchUrl", error, "تعذر جلب رابط الاجتماع");
    }
  }

  async requestReportImport(activityId: string): Promise<RequestMeetingReportImportResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");
      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");
      if (!activity.toObject().meetingCode && !activity.toObject().externalMeetingId) {
        return fail("INVALID_STATE", "لا يوجد اجتماع مرتبط بهذا النشاط");
      }
      await this.notifyReportRequested(activityId);
      return ok({ queued: true, activityId });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "requestReportImport", error, "تعذر جدولة استيراد التقرير");
    }
  }

  async getMeetingReport(activityId: string): Promise<GetMeetingReportResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");
      const report = await prisma.activityMeetingReport.findUnique({
        where: { activityId },
        include: { attendees: { orderBy: { attendedSeconds: "desc" } } }
      });
      if (!report) return ok({ report: null });
      return ok({ report: this.toReportDto(report) });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "getMeetingReport", error, "تعذر جلب تقرير الحضور");
    }
  }

  async importReport(activityId: string): Promise<ImportMeetingReportResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");

      const activity = await this.activityRepository.findById(activityId);
      if (!activity) return fail("NOT_FOUND", "النشاط غير موجود");

      const props = activity.toObject();
      const meetingCode = props.meetingCode;
      if (!meetingCode) {
        return fail("INVALID_STATE", "رمز الاجتماع غير متوفر لهذا النشاط");
      }

      const integration = await this.integrationRepository.findByProvider(MeetingUseCase.PROVIDER);
      if (!integration || integration.status !== MeetingIntegrationStatus.CONNECTED) {
        return fail("INVALID_STATE", "تكامل Google Meet غير متصل");
      }

      const refreshToken = decrypt(integration.encryptedRefreshToken);

      // Window: activity day start - 6h through end + 6h to catch early/late conferences
      const windowStart = this.buildComparableDateTime(props.date, props.startTime);
      windowStart.setHours(windowStart.getHours() - 6);
      const windowEnd = this.buildComparableDateTime(props.date, props.endTime);
      windowEnd.setHours(windowEnd.getHours() + 6);

      let providerResult;
      try {
        providerResult = await this.meetingProvider.importReport(
          refreshToken,
          meetingCode,
          windowStart.toISOString(),
          windowEnd.toISOString()
        );
      } catch (providerError) {
        const message =
          providerError instanceof Error ? providerError.message : String(providerError);
        await prisma.activityMeetingReport.upsert({
          where: { activityId },
          create: {
            activityId,
            status: MeetingReportStatus.FAILED,
            lastError: message
          },
          update: {
            status: MeetingReportStatus.FAILED,
            lastError: message
          }
        });

        if (/invalid_grant|reauth|unauthorized/i.test(message)) {
          integration.markNeedsReauth(message);
          await this.integrationRepository.update(integration);
        }

        return fail("EXTERNAL_ERROR", message);
      }

      const emails = Array.from(
        new Set(
          providerResult.participants
            .map((p) => p.signedInEmail?.toLowerCase().trim())
            .filter((e): e is string => Boolean(e))
        )
      );

      const usersByEmail = new Map<string, string>();
      if (emails.length) {
        const users = await prisma.user.findMany({
          where: {
            OR: emails.map((email) => ({
              email: { equals: email, mode: "insensitive" as const }
            }))
          },
          select: { id: true, email: true }
        });
        for (const user of users) {
          usersByEmail.set(user.email.toLowerCase(), user.id);
        }
      }

      const approvedParticipants = await prisma.activityParticipation.findMany({
        where: {
          activityId,
          status: ParticipationStatus.APPROVED
        },
        select: {
          volunteerId: true,
          volunteer: { select: { id: true, fullName: true, email: true } }
        }
      });

      const normalizeName = (value: string) =>
        value
          .toLowerCase()
          .replace(/[^\p{L}\p{N}\s]/gu, "")
          .replace(/\s+/g, " ")
          .trim();

      const usersByName = new Map<string, string>();
      for (const row of approvedParticipants) {
        const name = normalizeName(row.volunteer.fullName || "");
        if (!name) continue;
        if (!usersByName.has(name)) usersByName.set(name, row.volunteer.id);
        else usersByName.set(name, "");
      }

      const startedAt = providerResult.startedAt ? new Date(providerResult.startedAt) : null;
      const endedAt = providerResult.endedAt ? new Date(providerResult.endedAt) : null;
      const hasParticipants = providerResult.participants.length > 0;
      const status =
        providerResult.conferenceId || hasParticipants
          ? MeetingReportStatus.IMPORTED
          : MeetingReportStatus.UNAVAILABLE;

      const report = await prisma.$transaction(async (tx) => {
        const upserted = await tx.activityMeetingReport.upsert({
          where: { activityId },
          create: {
            activityId,
            conferenceId: providerResult.conferenceId,
            startedAt,
            endedAt,
            status,
            lastError: null,
            importedAt: status === MeetingReportStatus.IMPORTED ? new Date() : null
          },
          update: {
            conferenceId: providerResult.conferenceId,
            startedAt,
            endedAt,
            status,
            lastError: null,
            importedAt: status === MeetingReportStatus.IMPORTED ? new Date() : null
          }
        });

        await tx.activityMeetingAttendee.deleteMany({ where: { reportId: upserted.id } });

        if (providerResult.participants.length) {
          await tx.activityMeetingAttendee.createMany({
            data: providerResult.participants.map((p) => {
              const email = p.signedInEmail?.toLowerCase().trim() || null;
              let matchedUserId = email ? usersByEmail.get(email) ?? null : null;
              if (!matchedUserId && p.displayName) {
                const byName = usersByName.get(normalizeName(p.displayName));
                if (byName) matchedUserId = byName;
              }
              return {
                reportId: upserted.id,
                displayName: p.displayName || "Unknown",
                signedInEmail: email,
                matchedUserId,
                matchStatus: matchedUserId
                  ? MeetingAttendeeMatchStatus.MATCHED
                  : MeetingAttendeeMatchStatus.UNMATCHED,
                attendedSeconds: p.attendedSeconds || 0,
                firstJoinedAt: p.firstJoinedAt ? new Date(p.firstJoinedAt) : null,
                lastLeftAt: p.lastLeftAt ? new Date(p.lastLeftAt) : null
              };
            })
          });
        }

        return tx.activityMeetingReport.findUniqueOrThrow({
          where: { id: upserted.id },
          include: { attendees: { orderBy: { attendedSeconds: "desc" } } }
        });
      });

      logger.info(
        MeetingUseCase.SCOPE,
        "importReport",
        `activity=${activityId} status=${status} attendees=${report.attendees.length}`
      );

      return ok({ report: this.toReportDto(report) });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "importReport", error, "تعذر استيراد تقرير الحضور");
    }
  }

  async matchAttendee(
    activityId: string,
    attendeeId: string,
    userId: string | null
  ): Promise<MatchMeetingAttendeeResponse> {
    try {
      guard(activityId, "معرّف النشاط مطلوب");
      guard(attendeeId, "معرّف الحضور مطلوب");

      const report = await prisma.activityMeetingReport.findUnique({
        where: { activityId },
        include: { attendees: true }
      });
      if (!report) return fail("NOT_FOUND", "تقرير الحضور غير موجود");

      const attendee = report.attendees.find((a) => a.id === attendeeId);
      if (!attendee) return fail("NOT_FOUND", "سجل الحضور غير موجود");

      if (userId) {
        const participation = await prisma.activityParticipation.findFirst({
          where: {
            activityId,
            volunteerId: userId,
            status: ParticipationStatus.APPROVED
          }
        });
        if (!participation) {
          return fail("INVALID_STATE", "المتطوع غير معتمد في هذا النشاط");
        }
      }

      await prisma.activityMeetingAttendee.update({
        where: { id: attendeeId },
        data: {
          matchedUserId: userId,
          matchStatus: userId
            ? MeetingAttendeeMatchStatus.MATCHED
            : MeetingAttendeeMatchStatus.UNMATCHED
        }
      });

      const refreshed = await prisma.activityMeetingReport.findUniqueOrThrow({
        where: { activityId },
        include: { attendees: { orderBy: { attendedSeconds: "desc" } } }
      });

      const updated = refreshed.attendees.find((a) => a.id === attendeeId)!;
      return ok({
        attendee: {
          id: updated.id,
          displayName: updated.displayName,
          signedInEmail: updated.signedInEmail,
          matchedUserId: updated.matchedUserId,
          attendedSeconds: updated.attendedSeconds,
          firstJoinedAt: updated.firstJoinedAt?.toISOString() ?? null,
          lastLeftAt: updated.lastLeftAt?.toISOString() ?? null,
          matchStatus: updated.matchStatus
        },
        report: this.toReportDto(refreshed)
      });
    } catch (error) {
      return serviceError(MeetingUseCase.SCOPE, "matchAttendee", error, "تعذر مطابقة الحضور");
    }
  }
}

export default MeetingUseCase;
