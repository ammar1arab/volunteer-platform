"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CertificateDto } from "@/core/application/dtos";
import { certificateApi } from "@/presentation/services";

interface CertificatesState {
  list: CertificateDto[];
  totalHours: number;
  loading: boolean;
  error: string;
}

const getErrMsg = (err: unknown, fallback = "حدث خطأ غير متوقع") => {
  if (err instanceof Error) return err.message;
  return fallback;
};

export const useCertificates = () => {
  const [state, setState] = useState<CertificatesState>({
    list: [],
    totalHours: 0,
    loading: true,
    error: ""
  });

  const hasLoadedRef = useRef(false);

  const refresh = useCallback(async () => {
    setState((p) => ({ ...p, loading: true, error: "" }));
    try {
      const res = await certificateApi.getByUser();
      const list: CertificateDto[] =
        (res as { data?: { certificates?: CertificateDto[] } })?.data?.certificates ?? [];
      const totalHours: number =
        (res as { data?: { totalHours?: number } })?.data?.totalHours ?? 0;
      setState((p) => ({ ...p, list, totalHours, loading: false }));
    } catch (err) {
      setState((p) => ({
        ...p,
        loading: false,
        error: getErrMsg(err, "فشل في جلب الشهادات")
      }));
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refresh();
    }
  }, [refresh]);

  return {
    list: state.list,
    totalHours: state.totalHours,
    loading: state.loading,
    error: state.error,
    refresh
  };
};