"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { ActivityVolunteerDto } from "@/core/application/dtos";
import { activityApi, participationApi } from "@/presentation/services";
import { AttendanceStatus, Gender } from "@/core/domain/enums";
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

const attendanceOverrides = new Map<string, Record<string, boolean | null>>();
const getOverrides = (activityId: string) => {
  if (!attendanceOverrides.has(activityId)) attendanceOverrides.set(activityId, {});
  return attendanceOverrides.get(activityId)!;
};

const VOLUNTEERS_PER_PAGE = 15;

function applyAttendanceOverrides(
  activityId: string,
  list: ActivityVolunteerDto[],
  rejectedIds: Set<string>
): ActivityVolunteerDto[] {
  const overrides = getOverrides(activityId);
  return list
    .filter((v) => !rejectedIds.has(v.participationId))
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
  const [overrideTick, setOverrideTick] = useState(0);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(() => new Set());
  const [completing, setCompleting] = useState(false);
  const [rejecting, setRejecting] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isOpen || !activityId) return;
    setConfirmStep(0);
    setAttendanceWarning(false);
    setRejectedIds(new Set());
    prefetchRef.current = null;
  }, [isOpen, activityId]);

  const serverList = (query.data ?? EMPTY_ARRAY) as ActivityVolunteerDto[];

  const volunteers = useMemo(
    () => applyAttendanceOverrides(activityId, serverList, rejectedIds),


    [activityId, serverList, rejectedIds, overrideTick]
  );

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
  }, []);

  const handleGenderFilter = useCallback((val: "ALL" | "MALE" | "FEMALE") => {
    setGenderFilter(val);
    setCurrentPage(1);
  }, []);

  const setAttendance = useCallback((participationId: string, attended: boolean | null) => {
    getOverrides(activityId)[participationId] = attended;
    setAttendanceWarning(false);
    setOverrideTick((n) => n + 1);
  }, [activityId]);

  const rejectVolunteer = useCallback(
    async (participationId: string, volunteerName: string) => {
      setRejecting(participationId);
      try {
        unwrapResult(await participationApi.reject(participationId));
        delete getOverrides(activityId)[participationId];
        setRejectedIds((prev) => new Set(prev).add(participationId));
        showToast(`تم إزالة ${volunteerName} من النشاط`, "success");
      } catch (err) {
        showToast(getErrorMessage(err, "حدث خطأ أثناء إزالة المتطوع"), "error");
      } finally {
        setRejecting(null);
      }
    },
    [activityId, showToast]
  );

  const flushAttendance = useCallback(() => {
    const overrides = getOverrides(activityId);
    const items = Object.entries(overrides)
      .filter(([, val]) => val !== null)
      .map(([participationId, attended]) => ({
        participationId,
        attended: attended as boolean
      }));
    if (!items.length) return Promise.resolve();
    return participationApi.bulkMarkAttendance(items).then(() => undefined);
  }, [activityId]);

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
          attendanceOverrides.delete(activityId);
          onClose();
        } else showToast("حدث خطأ أثناء إكمال النشاط", "error");
      } catch (err) {
        showToast(getErrorMessage(err, "حدث خطأ غير متوقع"), "error");
      } finally {
        setCompleting(false);
        setConfirmStep(0);
        prefetchRef.current = null;
      }
    },
    [activityId, showToast]
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
    rejectVolunteer,
    requestComplete,
    confirmStep1,
    cancelConfirm,
    confirmComplete,
    dismissWarning,
    calculateAge
  };
};
