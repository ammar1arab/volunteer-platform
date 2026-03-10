import { useState, useEffect, useCallback, useRef } from "react";
import type { ActivityVolunteerDto } from "@/core/application/dtos";
import { activityApi, participationApi } from "@/presentation/services";
import { AttendanceStatus } from "@/core/domain/enums";
import { useToast } from "@/presentation/hooks";

const cache = new Map<string, Record<string, boolean | null>>();

const getCache = (activityId: string) => {
  if (!cache.has(activityId)) cache.set(activityId, {});
  return cache.get(activityId)!;
};

export const useVolunteersModal = (activityId: string, isOpen: boolean) => {
  const [volunteers, setVolunteers]               = useState<ActivityVolunteerDto[]>([]);
  const [loading, setLoading]                     = useState(false);
  const [completing, setCompleting]               = useState(false);
  const [rejecting, setRejecting]                 = useState<string | null>(null);
  const [confirmStep, setConfirmStep]             = useState<0 | 1 | 2>(0);
  const [attendanceWarning, setAttendanceWarning] = useState(false);
  const { toasts, showToast, removeToast }        = useToast();
  const prefetchRef                               = useRef<Promise<void> | null>(null);

  const applyCache = useCallback((list: ActivityVolunteerDto[]) => {
    const overrides = getCache(activityId);
    return list.map(v => {
      if (!(v.participationId in overrides)) return v;
      const val = overrides[v.participationId];
      return {
        ...v,
        attendanceStatus:
          val === true  ? AttendanceStatus.ATTENDED  :
          val === false ? AttendanceStatus.ABSENT     :
                          AttendanceStatus.NOT_MARKED,
      };
    });
  }, [activityId]);

  const fetchVolunteers = useCallback(async () => {
    if (!activityId) return;
    setLoading(true);
    try {
      const res = await activityApi.getVolunteers(activityId);
      setVolunteers(
        res.success && res.data?.volunteers
          ? applyCache(res.data.volunteers)
          : []
      );
    } catch {
      showToast("حدث خطأ أثناء جلب المتطوعين", "error");
      setVolunteers([]);
    } finally {
      setLoading(false);
    }
  }, [activityId, applyCache, showToast]);

  useEffect(() => {
    if (!isOpen || !activityId) return;
    setConfirmStep(0);
    setAttendanceWarning(false);
    prefetchRef.current = null;
    fetchVolunteers();
  }, [isOpen, activityId, fetchVolunteers]);

  const setAttendance = useCallback((participationId: string, attended: boolean | null) => {
    getCache(activityId)[participationId] = attended;
    setVolunteers(prev =>
      prev.map(v =>
        v.participationId !== participationId ? v : {
          ...v,
          attendanceStatus:
            attended === true  ? AttendanceStatus.ATTENDED  :
            attended === false ? AttendanceStatus.ABSENT     :
                                 AttendanceStatus.NOT_MARKED,
        }
      )
    );
    setAttendanceWarning(false);
  }, [activityId]);

  const rejectVolunteer = useCallback(async (participationId: string, volunteerName: string) => {
    setRejecting(participationId);
    try {
      const res = await participationApi.reject(participationId);
      if (res.success) {
        getCache(activityId);
        delete getCache(activityId)[participationId];
        setVolunteers(prev => prev.filter(v => v.participationId !== participationId));
        showToast(`تم إزالة ${volunteerName} من النشاط`, "success");
      } else {
        showToast("حدث خطأ أثناء إزالة المتطوع", "error");
      }
    } catch {
      showToast("حدث خطأ غير متوقع", "error");
    } finally {
      setRejecting(null);
    }
  }, [activityId, showToast]);

  const flushAttendance = useCallback(() => {
    const overrides = getCache(activityId);
    const entries = Object.entries(overrides).filter(([, val]) => val !== null);
    if (!entries.length) return Promise.resolve();
    return Promise.all(
      entries.map(([participationId, attended]) =>
        participationApi.markAttendance(participationId, attended as boolean)
      )
    ).then(() => undefined);
  }, [activityId]);

  const requestComplete = useCallback(() => {
    const hasUnmarked = volunteers.some(v => v.attendanceStatus === AttendanceStatus.NOT_MARKED);
    if (hasUnmarked) { setAttendanceWarning(true); return; }
    setAttendanceWarning(false);
    prefetchRef.current = flushAttendance();
    setConfirmStep(1);
  }, [volunteers, flushAttendance]);

  const confirmStep1   = useCallback(() => setConfirmStep(2), []);
  const cancelConfirm  = useCallback(() => { prefetchRef.current = null; setConfirmStep(0); }, []);
  const dismissWarning = useCallback(() => setAttendanceWarning(false), []);

  const confirmComplete = useCallback(async (
    onComplete: () => Promise<boolean>,
    onClose: () => void
  ) => {
    setCompleting(true);
    try {
      await prefetchRef.current;
      const success = await onComplete();
      if (success) {
        cache.delete(activityId);
        onClose();
      } else {
        showToast("حدث خطأ أثناء إكمال النشاط", "error");
      }
    } catch {
      showToast("حدث خطأ غير متوقع", "error");
    } finally {
      setCompleting(false);
      setConfirmStep(0);
      prefetchRef.current = null;
    }
  }, [activityId, showToast]);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const unmarkedCount = volunteers.filter(
    v => v.attendanceStatus === AttendanceStatus.NOT_MARKED
  ).length;

  return {
    volunteers, loading, completing, rejecting, confirmStep, attendanceWarning, unmarkedCount,
    toasts, removeToast,
    setAttendance, rejectVolunteer, requestComplete, confirmStep1, cancelConfirm,
    confirmComplete, dismissWarning, calculateAge,
  };
};