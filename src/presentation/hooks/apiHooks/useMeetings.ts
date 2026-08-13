"use client";

import { useCallback, useMemo } from "react";
import { MeetingIntegrationStatus, MeetingSyncStatus } from "@/core/domain/enums";
import {
  meetingsApi,
  type MeetingsFilter,
  type MeetingListItemDto,
  type GoogleIntegrationStatusDto,
  type MeetingLaunchDto,
  type MeetingReportDto
} from "@/presentation/services/meetings.service";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useBooleanMutation,
  useApiMutation,
  useCacheUpdater,
  useFetchData
} from "@/presentation/query";

const DISCONNECTED_STATUS: GoogleIntegrationStatusDto = {
  connected: false,
  status: MeetingIntegrationStatus.DISCONNECTED,
  organizerEmail: "",
  scopes: [],
  lastError: null,
  lastCheckedAt: null
};

export const useGoogleIntegrationStatus = (opts?: { enabled?: boolean }) => {
  const query = useFetchData<GoogleIntegrationStatusDto>({
    queryKey: queryKeys.meetings.googleStatus(),
    request: async () => unwrapResult(await meetingsApi.getGoogleStatus()).integration,
    options: {
      enabled: opts?.enabled ?? true,
      staleTime: 10_000,
      refetchOnMount: "always"
    }
  });

  const refetch = query.refetch;

  return useMemo(
    () => ({
      status: query.data ?? null,
      loading: query.isLoading,
      fetching: query.isFetching,
      error: query.error ? getErrorMessage(query.error, "فشل في جلب حالة الاتصال") : "",
      refresh: () => refetch()
    }),
    [query.data, query.isLoading, query.isFetching, query.error, refetch]
  );
};

export const useMeetingsQuery = (opts?: { filter?: MeetingsFilter; enabled?: boolean }) => {
  const filter = opts?.filter ?? "upcoming";

  const query = useFetchData<MeetingListItemDto[]>({
    queryKey: queryKeys.meetings.list(filter),
    request: async () => unwrapResult(await meetingsApi.getMeetings(filter)).meetings,
    options: {
      enabled: opts?.enabled ?? true,
      staleTime: 20_000,
      keepPrevious: false,
      refetchInterval: (query) => {
        const rows = query.state.data;
        if (!Array.isArray(rows)) return false;
        return rows.some((row) => row.meetingSyncStatus === MeetingSyncStatus.PENDING) ? 5000 : false;
      }
    }
  });

  const refetch = query.refetch;
  const list = (query.data ?? EMPTY_ARRAY) as MeetingListItemDto[];

  return useMemo(
    () => ({
      list,
      loading: query.isLoading,
      fetching: query.isFetching,
      error: query.error ? getErrorMessage(query.error, "فشل في جلب الاجتماعات") : "",
      refresh: () => refetch()
    }),
    [list, query.isLoading, query.isFetching, query.error, refetch]
  );
};

export const useMeetingActions = () => {
  const statusCache = useCacheUpdater<GoogleIntegrationStatusDto>(queryKeys.meetings.googleStatus());

  const retryMutation = useBooleanMutation<string>({
    request: async (activityId) => unwrapResult(await meetingsApi.retrySync(activityId)),
    invalidateQueries: [queryKeys.meetings.all, queryKeys.activities.all],
    fallbackError: "فشل إعادة المزامنة"
  });

  const importReportMutation = useBooleanMutation<string>({
    request: async (activityId) => unwrapResult(await meetingsApi.importReport(activityId)),
    invalidateQueries: queryKeys.meetings.all,
    fallbackError: "فشل استيراد تقرير الحضور"
  });

  const connectMutation = useBooleanMutation<void>({
    request: async () => {
      const { url } = unwrapResult(await meetingsApi.getGoogleConnectUrl());
      if (!url) throw new Error("رابط الاتصال غير متوفر");
      window.location.href = url;
    },
    fallbackError: "فشل بدء الاتصال بـ Google"
  });

  const disconnectMutation = useBooleanMutation<void>({
    request: async () => unwrapResult(await meetingsApi.disconnectGoogle()),
    invalidateQueries: [queryKeys.meetings.googleStatus(), queryKeys.meetings.all],
    fallbackError: "فشل قطع الاتصال",
    onMutate: () => {
      const prev = statusCache.getData();
      statusCache.updateData({
        ...DISCONNECTED_STATUS,
        organizerEmail: prev?.organizerEmail ?? ""
      });
      return prev;
    },
    onError: (_error, _variables, prev) => {
      if (prev && typeof prev === "object") {
        statusCache.updateData(prev as GoogleIntegrationStatusDto);
      }
    }
  });

  const retry = useCallback((activityId: string) => retryMutation.run(activityId), [retryMutation.run]);
  const importReport = useCallback(
    (activityId: string) => importReportMutation.run(activityId),
    [importReportMutation.run]
  );
  const connect = useCallback(() => connectMutation.run(), [connectMutation.run]);
  const disconnect = useCallback(() => disconnectMutation.run(), [disconnectMutation.run]);

  const launch = useCallback(async (activityId: string): Promise<string | null> => {
    try {
      const data = unwrapResult(await meetingsApi.getLaunchUrl(activityId));
      return data.url || null;
    } catch {
      return null;
    }
  }, []);

  return useMemo(
    () => ({
      submitting:
        retryMutation.submitting ||
        importReportMutation.submitting ||
        connectMutation.submitting ||
        disconnectMutation.submitting,
      error:
        retryMutation.error ||
        importReportMutation.error ||
        connectMutation.error ||
        disconnectMutation.error,
      retry,
      importReport,
      connect,
      disconnect,
      launch
    }),
    [
      retryMutation.submitting,
      importReportMutation.submitting,
      connectMutation.submitting,
      disconnectMutation.submitting,
      retryMutation.error,
      importReportMutation.error,
      connectMutation.error,
      disconnectMutation.error,
      retry,
      importReport,
      connect,
      disconnect,
      launch
    ]
  );
};

export const useMeetingReport = (activityId: string, opts?: { enabled?: boolean }) => {
  const query = useFetchData<MeetingReportDto | null>({
    queryKey: queryKeys.meetings.report(activityId),
    request: async () => unwrapResult(await meetingsApi.getReport(activityId)).report,
    options: {
      enabled: (opts?.enabled ?? true) && Boolean(activityId),
      staleTime: 20_000
    }
  });

  const refetch = query.refetch;

  return useMemo(
    () => ({
      report: query.data ?? null,
      loading: query.isLoading,
      error: query.error ? getErrorMessage(query.error, "تعذر جلب تقرير الحضور") : "",
      refresh: () => refetch()
    }),
    [query.data, query.isLoading, query.error, refetch]
  );
};

export const useMeetingLaunch = (activityId: string, opts?: { enabled?: boolean }) => {
  const query = useFetchData<MeetingLaunchDto>({
    queryKey: queryKeys.meetings.launch(activityId),
    request: async () => unwrapResult(await meetingsApi.getLaunchUrl(activityId)),
    options: {
      enabled: (opts?.enabled ?? true) && Boolean(activityId),
      staleTime: 15_000,
      retry: false
    }
  });

  const refetch = query.refetch;

  return useMemo(
    () => ({
      launch: query.data ?? null,
      loading: query.isLoading,
      error: query.error ? getErrorMessage(query.error, "تعذر تحميل رابط الاجتماع") : "",
      isNotFound: query.isNotFound,
      refresh: () => refetch()
    }),
    [query.data, query.isLoading, query.error, query.isNotFound, refetch]
  );
};

export const useMatchAttendee = (activityId: string) => {
  const mutation = useApiMutation<
    MeetingReportDto,
    { attendeeId: string; userId: string | null }
  >({
    request: async ({ attendeeId, userId }) =>
      unwrapResult(await meetingsApi.matchAttendee(activityId, attendeeId, userId)).report,
    invalidateQueries: [queryKeys.meetings.report(activityId), queryKeys.meetings.all]
  });

  const match = useCallback(
    (attendeeId: string, userId: string | null) => mutation.mutateAsync({ attendeeId, userId }),
    [mutation.mutateAsync]
  );

  return useMemo(
    () => ({
      match,
      submitting: mutation.isPending,
      error: mutation.error ? getErrorMessage(mutation.error, "تعذر حفظ المطابقة") : ""
    }),
    [match, mutation.isPending, mutation.error]
  );
};
