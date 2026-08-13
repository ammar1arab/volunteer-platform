"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserRole, MeetingSyncStatus } from "@/core/domain/enums";
import { useAuth, useToast, useMeetings, useGoogleIntegrationStatus } from "@/presentation/hooks";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import type { MeetingsFilter, MeetingListItemDto } from "@/presentation/services/meetings.service";
import { activityApi } from "@/presentation/services";
import {
  getMeetingSyncStatusLabel,
  MEETING_SYNC_STATUS_FILTER_OPTIONS
} from "@/presentation/constants/labels";
import { unwrapResult } from "@/presentation/query";

export type GoogleMeetView = "upcoming" | "finished" | "settings";

export const VIEW_ITEMS = [
  { key: "upcoming", label: "قادمة / مباشرة" },
  { key: "finished", label: "منتهية / مراجعة" },
  { key: "settings", label: "الإعدادات" }
];

export const SYNC_FILTER_ITEMS = MEETING_SYNC_STATUS_FILTER_OPTIONS;

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

export const useGoogleMeetPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  const [activeView, setActiveView] = useSessionStorageState<GoogleMeetView>(
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
  const [appliedSearch, setAppliedSearch] = useSessionStorageState(
    "filters.admin.googleMeet.appliedSearch",
    ""
  );
  const [syncFilter, setSyncFilter] = useSessionStorageState(
    "filters.admin.googleMeet.syncFilter",
    "ALL"
  );

  const [reportMeeting, setReportMeeting] = useState<MeetingListItemDto | null>(null);
  const [volunteersMeeting, setVolunteersMeeting] = useState<MeetingListItemDto | null>(null);
  const [matchOptions, setMatchOptions] = useState<{ value: string; label: string }[]>([]);

  const meetingsFilter: MeetingsFilter =
    activeView === "settings" ? "all" : (activeView as MeetingsFilter);

  const {
    list,
    loading: meetingsLoading,
    submitting,
    error: meetingsError,
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
    error: integrationError,
    refresh: refreshIntegration
  } = useGoogleIntegrationStatus({ enabled: true });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ message: "" });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  useEffect(() => {
    if (meetingsError?.trim()) showToast(meetingsError, "error");
  }, [meetingsError, showToast]);

  useEffect(() => {
    if (integrationError?.trim()) showToast(integrationError, "error");
  }, [integrationError, showToast]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const connectedFlag = params.get("connected");
    const oauthError = params.get("error");
    if (!connectedFlag && !oauthError) return;

    if (connectedFlag === "1") {
      showToast("تم ربط حساب Google بنجاح", "success");
      refreshIntegration();
      refreshMeetings();
    } else if (oauthError) {
      const decoded = decodeURIComponent(oauthError);
      const message =
        /access_denied/i.test(decoded)
          ? "تم رفض الوصول. تأكد أن الحساب مضاف كـ Test user في Google Cloud وأن التطبيق في وضع Testing."
          : /redirect_uri_mismatch/i.test(decoded)
            ? "رابط الإرجاع غير مطابق. أضف رابط الـ callback في Google Cloud Credentials."
            : `فشل الربط: ${decoded}`;
      showToast(message, "error");
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("connected");
    url.searchParams.delete("error");
    window.history.replaceState({}, "", url.pathname + url.search);
  }, [showToast, refreshIntegration, refreshMeetings]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, appliedSearch, syncFilter, setCurrentPage]);

  useEffect(() => {
    if (!reportMeeting) {
      setMatchOptions([]);
      return;
    }
    let cancelled = false;
    activityApi
      .getVolunteers(reportMeeting.activityId)
      .then((res) => {
        if (cancelled) return;
        const volunteers = unwrapResult(res).volunteers;
        setMatchOptions(
          volunteers.map((v) => ({
            value: v.id,
            label: `${v.fullName}${v.email ? ` · ${v.email}` : ""}`
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setMatchOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [reportMeeting]);

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

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmOptions(opts);
    setIsConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
      setConfirmResolver(() => resolve);
    });
  }, []);

  const handleConfirmDialog = useCallback(() => {
    setIsConfirmOpen(false);
    confirmResolver?.(true);
    setConfirmResolver(null);
  }, [confirmResolver]);

  const handleCancelDialog = useCallback(() => {
    setIsConfirmOpen(false);
    confirmResolver?.(false);
    setConfirmResolver(null);
  }, [confirmResolver]);

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

  const sectionTitle =
    activeView === "upcoming"
      ? "الاجتماعات القادمة"
      : activeView === "finished"
        ? "الاجتماعات المنتهية"
        : "إعدادات التكامل";

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
    sectionTitle,
    meetingsLoading,
    integrationLoading,
    submitting,
    integration,
    organizerEmail,
    connected,
    failedMeetings,
    toasts,
    removeToast,
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
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog
    }
  };
};
