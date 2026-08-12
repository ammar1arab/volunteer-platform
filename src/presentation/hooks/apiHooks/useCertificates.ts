"use client";

import { useCallback, useMemo } from "react";
import type { CertificateDto } from "@/core/application/dtos";
import { certificateApi } from "@/presentation/services";
import {
  EMPTY_ARRAY,
  getErrorMessage,
  queryKeys,
  unwrapResult,
  useFetchData
} from "@/presentation/query";

interface CertificatesData {
  list: CertificateDto[];
  totalHours: number;
}

export const useCertificates = (options: { enabled?: boolean } = {}) => {
  const query = useFetchData<CertificatesData>({
    queryKey: queryKeys.certificates.byUser(),
    request: async () => {
      const data = unwrapResult(await certificateApi.getByUser());
      return { list: data.certificates, totalHours: data.totalHours };
    },
    options: { enabled: options.enabled ?? true, staleTime: 60_000 }
  });

  const refetch = query.refetch;
  const list = (query.data?.list ?? EMPTY_ARRAY) as CertificateDto[];
  const totalHours = query.data?.totalHours ?? 0;
  const error = query.error ? getErrorMessage(query.error, "فشل في جلب الشهادات") : "";
  const refresh = useCallback(() => refetch(), [refetch]);

  return useMemo(
    () => ({
      list,
      totalHours,
      loading: query.isLoading,
      error,
      refresh
    }),
    [list, totalHours, query.isLoading, error, refresh]
  );
};
