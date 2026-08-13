"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserRole, MeetingSyncStatus } from "@/core/domain/enums";
import {
  useAuth,
  useToast,
  useMeetings,
  useGoogleIntegrationStatus,
  useConfirmDialog,
  usePageReset
} from "@/presentation/hooks";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import type { MeetingsFilter, MeetingListItemDto } from "@/presentation/services/meetings.service";
import { activityApi } from "@/presentation/services";
import {
  getMeetingSyncStatusLabel,
  MEETING_SYNC_STATUS_FILTER_OPTIONS
} from "@/presentation/constants/labels";
import { queryKeys, unwrapResult, useFetchData } from "@/presentation/query";
import type { ActivityVolunteerDto } from "@/core/application/dtos";

export type GoogleMeetView = "upcoming" | "finished" | "settings";

export const VIEW_ITEMS = [
  { key: "upcoming", label: "قادمة / مباشرة" },
  { key: "finished", label: "منتهية / مراجعة" },
  { key: "settings", label: "الإعدادات" }
];

export const SYNC_FILTER_ITEMS = MEETING_SYNC_STATUS_FILTER_OPTIONS;

function oauthMessage(connected: string | null, oauthError: string | null) {
  if (connected === "1") return { type: "success" as const, message: "تم ربط حساب Google بنجاح" };
  if (!oauthError) return null;
  const decoded = decodeURIComponent(oauthError);
  const message = /access_denied/i.test(decoded)
    ? "تم رفض الوصول. تأكد أن الحساب مضاف كـ Test user في Google Cloud وأن التطبيق في وضع Testing."
    : /redirect_uri_mismatch/i.test(decoded)
      ? "رابط الإرجاع غير مطابق. أضف رابط الـ callback في Google Cloud Credentials."
      : `فشل الربط: ${decoded}`;
  return { type: "error" as const, message };
}

export const useGoogleMeetPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const ITEMS_PER_PAGE = 20;
  const { confirm, confirmDialog } = useConfirmDialog();

  const [activeView, setActiveViewState] = useSessionStorageState<GoogleMeetView>(
    "filters.admin.googleMeet.activeTab",
    "upcoming"
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.googleMeet.currentPage",
    1
  );
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.admin.googleMeet.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearchState] = useSessionStorageState(
    "filters.admin.googleMeet.appliedSearch",
    ""
  );
  const [syncFilter, setSyncFilterState] = useSessionStorageState(
    "filters.admin.googleMeet.syncFilter",
    "ALL"
  );
  const setActiveView = usePageReset(setActiveViewState, setCurrentPage);
  const setAppliedSearch = usePageReset(setAppliedSearchState, setCurrentPage);
  const setSyncFilter = usePageReset(setSyncFilterState, setCurrentPage);

  const [reportMeeting, setReportMeeting] = useState<MeetingListItemDto | null>(null);
  const [volunteersMeeting, setVolunteersMeeting] = useState<MeetingListItemDto | null>(null);

  const meetingsFilter: MeetingsFilter =
    activeView === "settings" ? "all" : (activeView as MeetingsFilter);

  const {
    list,
    loading: meetingsLoading,
    submitting,
    refresh: refreshMeetings,
    retry,
    importReport,
    connect,
    disconnect,
    launch
  } = useMeetings({
    filter: meetingsFilter,
    enabled: true
  });

  const {
    status: integration,
    loading: integrationLoading,
    refresh: refreshIntegration
  } = useGoogleIntegrationStatus({ enabled: true });

  const volunteersQuery = useFetchData<ActivityVolunteerDto[]>({
    queryKey: queryKeys.activities.volunteers(reportMeeting?.activityId ?? ""),
    request: async () =>
      unwrapResult(await activityApi.getVolunteers(reportMeeting!.activityId)).volunteers,
    options: {
      enabled: Boolean(reportMeeting?.activityId),
      staleTime: 15_000,
      keepPrevious: true
    }
  });

  const matchOptions = useMemo(
    () =>
      (volunteersQuery.data ?? []).map((v) => ({
        value: v.id,
        label: `${v.fullName}${v.email ? ` · ${v.email}` : ""}`
      })),
    [volunteersQuery.data]
  );

  const connectedFlag = searchParams.get("connected");
  const oauthError = searchParams.get("error");
  const oauthFlash = oauthMessage(connectedFlag, oauthError);
  const displayedToasts = oauthFlash
    ? [...toasts, { id: "oauth-flash", message: oauthFlash.message, type: oauthFlash.type }]
    : toasts;

  const dismissToast = useCallback(
    (id: string) => {
      if (id === "oauth-flash") {
        router.replace(pathname);
        return;
      }
      removeToast(id);
    },
    [pathname, removeToast, router]
  );

  const filtered = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    return list.filter((m) => {
      if (syncFilter !== "ALL" && m.meetingSyncStatus !== syncFilter) return false;
      if (!q) return true;
      const syncLabel = getMeetingSyncStatusLabel(m.meetingSyncStatus || "").toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        syncLabel.includes(q) ||
        (m.presenter?.fullName?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [list, appliedSearch, syncFilter]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const organizerEmail = integration?.organizerEmail || "—";
  const connected = Boolean(integration?.connected);

  const handleConnect = useCallback(async () => {
    const ok = await connect();
    if (!ok) showToast("تعذر بدء الاتصال بـ Google", "error");
  }, [connect, showToast]);

  const handleDisconnect = useCallback(async () => {
    const ok = await confirm({
      title: "قطع اتصال Google",
      message: `هل تريد قطع اتصال حساب ${organizerEmail !== "—" ? organizerEmail : "Google"}؟ لن يتم إنشاء اجتماعات تلقائية حتى إعادة الاتصال.`,
      confirmText: "قطع الاتصال",
      cancelText: "إلغاء",
      variant: "danger"
    });
    if (!ok) return;
    if (await disconnect()) {
      showToast("تم قطع الاتصال", "success");
      refreshIntegration();
    }
  }, [confirm, disconnect, organizerEmail, refreshIntegration, showToast]);

  const handleRetry = useCallback(
    async (meeting: MeetingListItemDto) => {
      const ok = await confirm({
        title: "إعادة المزامنة",
        message: `هل تريد إعادة مزامنة اجتماع "${meeting.title}"؟`,
        confirmText: "إعادة المحاولة",
        cancelText: "إلغاء",
        variant: "primary"
      });
      if (!ok) return;
      if (await retry(meeting.activityId)) {
        showToast("تمت جدولة إعادة المزامنة", "success");
        refreshMeetings();
      }
    },
    [confirm, retry, refreshMeetings, showToast]
  );

  const handleImportReport = useCallback(
    async (meeting: MeetingListItemDto) => {
      const ok = await confirm({
        title: "استيراد الحضور",
        message: `هل تريد استيراد تقرير حضور اجتماع "${meeting.title}" من Google Meet؟`,
        confirmText: "استيراد",
        cancelText: "إلغاء",
        variant: "primary"
      });
      if (!ok) return;
      if (await importReport(meeting.activityId)) {
        showToast("تم استيراد تقرير الحضور", "success");
        refreshMeetings();
        setReportMeeting(meeting);
      }
    },
    [confirm, importReport, refreshMeetings, showToast]
  );

  const handleLaunch = useCallback(
    async (meeting: MeetingListItemDto) => {
      const url = await launch(meeting.activityId);
      if (!url) {
        showToast("تعذر فتح رابط الاجتماع", "error");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    },
    [launch, showToast]
  );

  const openReport = useCallback((meeting: MeetingListItemDto) => {
    setReportMeeting(meeting);
  }, []);

  const openVolunteers = useCallback((meeting: MeetingListItemDto) => {
    setVolunteersMeeting(meeting);
  }, []);

  const failedMeetings = useMemo(
    () => list.filter((m) => m.meetingSyncStatus === MeetingSyncStatus.FAILED),
    [list]
  );

  return {
    status,
    activeView,
    setActiveView,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch,
    syncFilter,
    setSyncFilter,
    syncFilterItems: SYNC_FILTER_ITEMS,
    viewItems: VIEW_ITEMS,
    filtered,
    paginated,
    meetingsLoading,
    integrationLoading,
    submitting,
    integration,
    organizerEmail,
    connected,
    failedMeetings,
    toasts: displayedToasts,
    removeToast: dismissToast,
    handleConnect,
    handleDisconnect,
    handleRetry,
    handleImportReport,
    handleLaunch,
    openReport,
    openVolunteers,
    reportMeeting,
    setReportMeeting,
    matchOptions,
    volunteersMeeting,
    setVolunteersMeeting,
    refreshMeetings,
    refreshIntegration,
    confirmDialog
  };
};
