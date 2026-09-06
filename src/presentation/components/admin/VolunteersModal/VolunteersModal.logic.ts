"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import type { ActivityVolunteerDto } from "@/core/application/dtos";
import { activityApi, participationApi, meetingsApi } from "@/presentation/services";
import { AttendanceStatus, Gender, MeetingAttendeeMatchStatus } from "@/core/domain/enums";
import { useToast } from "@/presentation/hooks";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import { getAttendanceStatusLabel, getCityLabel, getGenderLabel } from "@/presentation/constants";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useFetchData
} from "@/presentation/query";

export type MeetAttendanceSuggestion = {
  attendedSeconds: number;
  displayName: string;
};

type AttendanceDraft = {
  overrides: Record<string, boolean | null>;
  updatedAt: number;
};

const EMPTY_DRAFT: AttendanceDraft = {
  overrides: {},
  updatedAt: 0
};

const attendanceDraftKey = (activityId: string) => `draft.admin.attendance.${activityId}`;

const VOLUNTEERS_PER_PAGE = 15;
const SUGGEST_ATTENDED_SECONDS = 60;

function applyAttendanceOverrides(
  list: readonly ActivityVolunteerDto[],
  overrides: Record<string, boolean | null>,
  rejectedIds: readonly string[]
): ActivityVolunteerDto[] {
  const rejected = new Set(rejectedIds);
  return list
    .filter((v) => !rejected.has(v.participationId))
    .map((v) => {
      if (!(v.participationId in overrides)) return v;
      const val = overrides[v.participationId];
      return {
        ...v,
        attendanceStatus:
          val === true
            ? AttendanceStatus.ATTENDED
            : val === false
              ? AttendanceStatus.ABSENT
              : AttendanceStatus.NOT_MARKED
      };
    });
}

export const useVolunteersModal = (
  activityId: string,
  isOpen: boolean,
  activityTitle: string,
  _activityStatus: string,
  activityDate: string,
  activityType: string,
  durationHours: number
) => {
  const [draft, setDraft] = useSessionStorageState<AttendanceDraft>(
    attendanceDraftKey(activityId),
    EMPTY_DRAFT
  );
  const [completing, setCompleting] = useState(false);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0);
  const [attendanceWarning, setAttendanceWarning] = useState(false);
  const [search, setSearch] = useSessionStorageState(
    "filters.admin.volunteersModal.search",
    ""
  );
  const [genderFilter, setGenderFilter] = useSessionStorageState<"ALL" | "MALE" | "FEMALE">(
    "filters.admin.volunteersModal.gender",
    "ALL"
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.volunteersModal.currentPage",
    1
  );
  const { toasts, showToast, removeToast } = useToast();
  const prefetchRef = useRef<Promise<void> | null>(null);

  const query = useFetchData<ActivityVolunteerDto[]>({
    queryKey: queryKeys.activities.volunteers(activityId),
    request: async () => unwrapResult(await activityApi.getVolunteers(activityId)).volunteers,
    options: {
      enabled: isOpen && Boolean(activityId),
      staleTime: 15_000
    }
  });

  const reportQuery = useFetchData({
    queryKey: queryKeys.meetings.report(activityId),
    request: async () => unwrapResult(await meetingsApi.getReport(activityId)).report,
    options: {
      enabled: isOpen && Boolean(activityId),
      staleTime: 30_000,
      retry: false
    }
  });

  const serverList = query.data ?? EMPTY_ARRAY;

  const meetSuggestions = useMemo(() => {
    const map = new Map<string, MeetAttendanceSuggestion>();
    const attendees = reportQuery.data?.attendees ?? [];
    for (const attendee of attendees) {
      if (
        attendee.matchStatus !== MeetingAttendeeMatchStatus.MATCHED &&
        attendee.matchStatus !== MeetingAttendeeMatchStatus.CONFIRMED
      ) {
        continue;
      }
      if (
        !attendee.matchedUserId ||
        attendee.attendedSeconds < SUGGEST_ATTENDED_SECONDS
      ) {
        continue;
      }
      const existing = map.get(attendee.matchedUserId);
      if (!existing || attendee.attendedSeconds > existing.attendedSeconds) {
        map.set(attendee.matchedUserId, {
          attendedSeconds: attendee.attendedSeconds,
          displayName: attendee.displayName
        });
      }
    }
    return map;
  }, [reportQuery.data]);

  const unmatchedMeetCount = useMemo(
    () => reportQuery.data?.unmatchedCount ?? 0,
    [reportQuery.data]
  );

  const volunteers = useMemo(
    () => applyAttendanceOverrides(serverList, draft.overrides, rejectedIds),
    [serverList, draft.overrides, rejectedIds]
  );

  const pendingMeetSuggestions = useMemo(() => {
    return volunteers.filter(
      (v) =>
        v.attendanceStatus === AttendanceStatus.NOT_MARKED && meetSuggestions.has(v.id)
    );
  }, [volunteers, meetSuggestions]);

  const filteredVolunteers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return volunteers.filter((v) => {
      const matchName = !q || v.fullName.toLowerCase().includes(q);
      const matchGender = genderFilter === "ALL" || v.gender === genderFilter;
      return matchName && matchGender;
    });
  }, [volunteers, search, genderFilter]);

  const paginatedVolunteers = useMemo(() => {
    const start = (currentPage - 1) * VOLUNTEERS_PER_PAGE;
    return filteredVolunteers.slice(start, start + VOLUNTEERS_PER_PAGE);
  }, [filteredVolunteers, currentPage]);

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    setCurrentPage(1);
  }, [setSearch, setCurrentPage]);

  const handleGenderFilter = useCallback((val: "ALL" | "MALE" | "FEMALE") => {
    setGenderFilter(val);
    setCurrentPage(1);
  }, [setGenderFilter, setCurrentPage]);

  const setAttendance = useCallback((participationId: string, attended: boolean | null) => {
    setDraft((prev) => ({
      overrides: { ...prev.overrides, [participationId]: attended },
      updatedAt: Date.now()
    }));
    setAttendanceWarning(false);
  }, [setDraft]);

  const applyMeetSuggestion = useCallback(
    (volunteerUserId: string) => {
      const volunteer = volunteers.find((v) => v.id === volunteerUserId);
      if (!volunteer || !meetSuggestions.has(volunteerUserId)) return;
      if (volunteer.attendanceStatus !== AttendanceStatus.NOT_MARKED) return;
      setAttendance(volunteer.participationId, true);
      showToast(`تم تسجيل حضور ${volunteer.fullName} حسب Meet`, "success");
    },
    [volunteers, meetSuggestions, setAttendance, showToast]
  );

  const applyAllMeetSuggestions = useCallback(() => {
    const additions: Record<string, boolean> = {};
    let applied = 0;
    for (const volunteer of volunteers) {
      if (
        volunteer.attendanceStatus === AttendanceStatus.NOT_MARKED &&
        meetSuggestions.has(volunteer.id)
      ) {
        additions[volunteer.participationId] = true;
        applied += 1;
      }
    }
    if (!applied) {
      showToast("لا توجد اقتراحات قابلة للتطبيق", "info");
      return;
    }
    setDraft((prev) => ({
      overrides: { ...prev.overrides, ...additions },
      updatedAt: Date.now()
    }));
    setAttendanceWarning(false);
    showToast(`تم تطبيق ${applied} اقتراح حضور من Meet`, "success");
  }, [volunteers, meetSuggestions, setDraft, showToast]);

  const rejectVolunteer = useCallback(
    async (participationId: string, volunteerName: string) => {
      setRejecting(participationId);
      try {
        unwrapResult(await participationApi.reject(participationId));
        setDraft((prev) => {
          const overrides = { ...prev.overrides };
          delete overrides[participationId];
          return {
            overrides,
            updatedAt: Date.now()
          };
        });
        setRejectedIds((previous) => previous.includes(participationId)
          ? previous
          : [...previous, participationId]
        );
        showToast(`تم إزالة ${volunteerName} من النشاط`, "success");
      } catch (err) {
        showToast(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ أثناء إزالة المتطوع"), "error");
      } finally {
        setRejecting(null);
      }
    },
    [setDraft, showToast]
  );

  const flushAttendance = useCallback(() => {
    const items = Object.entries(draft.overrides)
      .filter(([, val]) => val !== null)
      .map(([participationId, attended]) => ({
        participationId,
        attended: attended as boolean
      }));
    if (!items.length) return Promise.resolve();
    return participationApi.bulkMarkAttendance(items).then(() => undefined);
  }, [draft.overrides]);

  const requestComplete = useCallback(() => {
    const hasUnmarked = volunteers.some((v) => v.attendanceStatus === AttendanceStatus.NOT_MARKED);
    if (hasUnmarked) {
      setAttendanceWarning(true);
      return;
    }
    setAttendanceWarning(false);
    prefetchRef.current = flushAttendance();
    setConfirmStep(1);
  }, [volunteers, flushAttendance]);

  const confirmStep1 = useCallback(() => setConfirmStep(2), []);
  const cancelConfirm = useCallback(() => {
    prefetchRef.current = null;
    setConfirmStep(0);
  }, []);
  const dismissWarning = useCallback(() => setAttendanceWarning(false), []);

  const confirmComplete = useCallback(
    async (onComplete: () => Promise<boolean>, onClose: () => void) => {
      setCompleting(true);
      try {
        await prefetchRef.current;
        const success = await onComplete();
        if (success) {
          setDraft(EMPTY_DRAFT);
          setRejectedIds([]);
          onClose();
        } else showToast("حدث خطأ أثناء إكمال النشاط", "error");
      } catch (err) {
        showToast(getErrorMessage(err instanceof Error ? err : String(err), "حدث خطأ غير متوقع"), "error");
      } finally {
        setCompleting(false);
        setConfirmStep(0);
        prefetchRef.current = null;
      }
    },
    [setDraft, showToast]
  );

  const calculateAge = useCallback((dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, []);

  const unmarkedCount = useMemo(
    () => volunteers.filter((v) => v.attendanceStatus === AttendanceStatus.NOT_MARKED).length,
    [volunteers]
  );

  const exportData = useMemo(
    () =>
      volunteers.map((v) => ({
        activityTitle,
        activityDate,
        activityType,
        durationHours,
        fullName: v.fullName,
        email: v.email,
        phone: v.phone,
        age: v.dateOfBirth ? calculateAge(v.dateOfBirth) : "-",
        city: v.city ? getCityLabel(v.city) : "-",
        gender: v.gender ? getGenderLabel(v.gender as Gender) : "-",
        attendanceStatus: getAttendanceStatusLabel(v.attendanceStatus)
      })),
    [volunteers, activityTitle, activityDate, activityType, durationHours, calculateAge]
  );

  return {
    volunteers: paginatedVolunteers,
    allVolunteers: volunteers,
    filteredCount: filteredVolunteers.length,
    exportData,
    loading: query.isLoading,
    completing,
    rejecting,
    confirmStep,
    attendanceWarning,
    unmarkedCount,
    meetSuggestions,
    unmatchedMeetCount,
    pendingMeetSuggestionsCount: pendingMeetSuggestions.length,
    toasts,
    removeToast,
    search,
    handleSearch,
    genderFilter,
    handleGenderFilter,
    currentPage,
    setCurrentPage,
    volunteersPerPage: VOLUNTEERS_PER_PAGE,
    setAttendance,
    applyMeetSuggestion,
    applyAllMeetSuggestions,
    rejectVolunteer,
    requestComplete,
    confirmStep1,
    cancelConfirm,
    confirmComplete,
    dismissWarning,
    calculateAge
  };
};
