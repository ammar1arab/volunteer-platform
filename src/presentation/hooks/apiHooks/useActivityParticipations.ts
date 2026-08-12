"use client";

import { useCallback, useMemo, useRef } from "react";
import type { ActivityParticipationDto } from "@/core/application/dtos";
import { participationApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useBooleanMutation,
  useFetchData
} from "@/presentation/query";

type RequestType = "my-requests" | "pending";

interface UseActivityParticipationsOptions {
  enabled?: boolean;
  autoFetch?: boolean;
  type?: RequestType;
}

const INVALIDATE_ON_WRITE = [queryKeys.participations.all, queryKeys.activities.all] as const;

export const useActivityParticipations = (options: UseActivityParticipationsOptions = {}) => {
  const { type = "my-requests" } = options;
  const enabled = options.enabled ?? options.autoFetch ?? false;

  const query = useFetchData<ActivityParticipationDto[]>({
    queryKey: queryKeys.participations.list(type),
    request: async () => {
      const res = type === "pending" ? await participationApi.getPending() : await participationApi.getMyRequests();
      return unwrapResult(res).requests;
    },
    options: { enabled, staleTime: 20_000 }
  });

  const createMutation = useBooleanMutation<string>({
    request: async (activityId) => unwrapResult(await participationApi.create(activityId)),
    invalidateQueries: [...INVALIDATE_ON_WRITE],
    fallbackError: "فشل في إنشاء الطلب"
  });

  const approveMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await participationApi.approve(id)),
    invalidateQueries: [...INVALIDATE_ON_WRITE],
    fallbackError: "فشل في الموافقة"
  });

  const rejectMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await participationApi.reject(id)),
    invalidateQueries: [...INVALIDATE_ON_WRITE],
    fallbackError: "فشل في الرفض"
  });

  const cancelMutation = useBooleanMutation<string>({
    request: async (id) => unwrapResult(await participationApi.cancel(id)),
    invalidateQueries: [...INVALIDATE_ON_WRITE],
    fallbackError: "فشل في إلغاء الطلب"
  });

  const attendanceMutation = useBooleanMutation<{ id: string; attended: boolean }>({
    request: async ({ id, attended }) =>
      unwrapResult(await participationApi.markAttendance(id, attended)),
    invalidateQueries: [...INVALIDATE_ON_WRITE],
    fallbackError: "فشل في تسجيل الحضور"
  });

  const requests = (query.data ?? EMPTY_ARRAY) as ActivityParticipationDto[];
  const requestsRef = useRef(requests);
  requestsRef.current = requests;

  const getRequestForActivity = useCallback(
    (activityId: string) => requestsRef.current.find((r) => r.activityId === activityId),
    []
  );

  const mutationError =
    createMutation.error ||
    approveMutation.error ||
    rejectMutation.error ||
    cancelMutation.error ||
    attendanceMutation.error;

  const queryError = query.error ? getErrorMessage(query.error, "فشل في جلب البيانات") : "";
  const refetch = query.refetch;

  const createRequest = useCallback(
    (activityId: string) => createMutation.run(activityId),
    [createMutation.run]
  );
  const approve = useCallback((id: string) => approveMutation.run(id), [approveMutation.run]);
  const reject = useCallback((id: string) => rejectMutation.run(id), [rejectMutation.run]);
  const cancelRequest = useCallback(
    (id: string) => cancelMutation.run(id),
    [cancelMutation.run]
  );
  const markAttendance = useCallback(
    (id: string, attended: boolean) => attendanceMutation.run({ id, attended }),
    [attendanceMutation.run]
  );
  const refresh = useCallback(() => refetch(), [refetch]);

  const submitting =
    createMutation.submitting ||
    approveMutation.submitting ||
    rejectMutation.submitting ||
    cancelMutation.submitting ||
    attendanceMutation.submitting;

  return useMemo(
    () => ({
      requests,
      loading: query.isLoading,
      submitting,
      error: queryError || mutationError,
      refresh,
      createRequest,
      approve,
      reject,
      cancelRequest,
      markAttendance,
      getRequestForActivity
    }),
    [
      requests,
      query.isLoading,
      submitting,
      queryError,
      mutationError,
      refresh,
      createRequest,
      approve,
      reject,
      cancelRequest,
      markAttendance,
      getRequestForActivity
    ]
  );
};
