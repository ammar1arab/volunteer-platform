"use client";

import { useCallback, useMemo, useState } from "react";
import { UserRole, type AudienceTarget } from "@/core/domain/enums";
import type { PreviewUserDto, UserAnalyticsDto } from "@/core/application/dtos";
import { userApi, activityApi, emailApi, notificationApi } from "@/presentation/services";
import { queryKeys, unwrapResult, useFetchData } from "@/presentation/query";
import { usePageReset } from "@/presentation/hooks/uiHooks/usePageReset";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

const VOLUNTEERS_PER_PAGE = 20;

interface ActivityFilterData {
  activities: { id: string; title: string }[];
  pending: Set<string>;
  approved: Set<string>;
}

function mapVolunteerPreview(u: UserAnalyticsDto): PreviewUserDto {
  return {
    id: u.id,
    name: u.fullName,
    email: u.email,
    phone: u.phone,
    avatarUrl: u.volunteerProfile?.profilePictureUrl || undefined,
    certifications: u.stats?.certificatesCount ?? 0,
    city: u.volunteerProfile?.city ?? null,
    gender: u.volunteerProfile?.gender ?? null,
    hours: u.stats?.totalHours ?? 0
  };
}

export function useAudienceTargetFields(
  target: AudienceTarget,
  storageKey: string,
  options?: { verifiedOnly?: boolean }
) {
  const [volunteerSearch, setVolunteerSearchState] = useSessionStorageState(
    `${storageKey}.volunteerSearch`,
    ""
  );
  const [volunteersPage, setVolunteersPage] = useState(1);
  const setVolunteerSearch = usePageReset(setVolunteerSearchState, setVolunteersPage);
  const [directSelectedIds, setDirectSelectedIds] = useState<Set<string>>(new Set());

  const volunteersQuery = useFetchData<PreviewUserDto[]>({
    queryKey: [...queryKeys.users.list(), "volunteers-preview", options?.verifiedOnly ? "verified" : "all"],
    request: async () => {
      if (options?.verifiedOnly) {
        const res = await emailApi.previewRecipients({ target: "ALL" });
        if (!res.success) throw new Error(res.error.message);
        return res.data.recipients;
      }
      const users = unwrapResult(await userApi.getAll()).users;
      return users
        .filter((u) => u.role === UserRole.VOLUNTEER && u.isActive)
        .map(mapVolunteerPreview);
    },
    options: { enabled: target === "USERS" }
  });

  const activitiesQuery = useFetchData<ActivityFilterData>({
    queryKey: queryKeys.notifications.activityFilter(),
    request: async () => {
      const [actRes, filter] = await Promise.all([
        activityApi.getPublished(),
        notificationApi.getActivityFilter().then(unwrapResult)
      ]);
      const activities = unwrapResult(actRes).activities.map((a) => ({ id: a.id, title: a.title }));
      return {
        activities,
        pending: new Set(filter.pending),
        approved: new Set(filter.approved)
      };
    },
    options: { enabled: target === "ACTIVITY_PENDING" || target === "ACTIVITY_APPROVED" }
  });

  const allVolunteers = volunteersQuery.data ?? [];
  const allActivities = activitiesQuery.data?.activities ?? [];
  const activityIdsWithPending = activitiesQuery.data?.pending ?? new Set<string>();
  const activityIdsWithApproved = activitiesQuery.data?.approved ?? new Set<string>();

  const activityOptions = useMemo(() => {
    const filterSet =
      target === "ACTIVITY_PENDING"
        ? activityIdsWithPending
        : target === "ACTIVITY_APPROVED"
          ? activityIdsWithApproved
          : null;

    return allActivities
      .filter((a) => !filterSet || filterSet.has(a.id))
      .map((a) => ({ value: a.id, label: a.title }));
  }, [allActivities, target, activityIdsWithPending, activityIdsWithApproved]);

  const activityTitleMap = useMemo(
    () => new Map(allActivities.map((a) => [a.id, a.title])),
    [allActivities]
  );

  const filteredVolunteers = useMemo(() => {
    const q = volunteerSearch.trim().toLowerCase();
    return q ? allVolunteers.filter((v) => v.name.toLowerCase().includes(q)) : allVolunteers;
  }, [allVolunteers, volunteerSearch]);

  const paginatedVolunteers = useMemo(
    () =>
      filteredVolunteers.slice(
        (volunteersPage - 1) * VOLUNTEERS_PER_PAGE,
        volunteersPage * VOLUNTEERS_PER_PAGE
      ),
    [filteredVolunteers, volunteersPage]
  );

  const allDirectVisible =
    filteredVolunteers.length > 0 &&
    filteredVolunteers.every((v) => directSelectedIds.has(v.id));

  const toggleDirectUser = useCallback((id: string) => {
    setDirectSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAllDirect = useCallback(() => {
    setDirectSelectedIds((prev) => {
      const visibleIds = filteredVolunteers.map((v) => v.id);
      const allSelected = visibleIds.every((id) => prev.has(id));
      const next = new Set(prev);
      allSelected
        ? visibleIds.forEach((id) => next.delete(id))
        : visibleIds.forEach((id) => next.add(id));
      return next;
    });
  }, [filteredVolunteers]);

  const resetDirectSelection = useCallback(() => {
    setDirectSelectedIds(new Set());
    setVolunteerSearch("");
  }, [setVolunteerSearch]);

  return {
    activityOptions,
    activityTitleMap,
    loadingActivities: activitiesQuery.isLoading,
    allVolunteers,
    filteredVolunteers,
    paginatedVolunteers,
    loadingVolunteers: volunteersQuery.isLoading,
    volunteerSearch,
    setVolunteerSearch,
    volunteersPage,
    setVolunteersPage,
    volunteersPerPage: VOLUNTEERS_PER_PAGE,
    directSelectedIds,
    toggleDirectUser,
    toggleAllDirect,
    allDirectVisible,
    resetDirectSelection
  };
}

export type AudienceTargetFieldsState = ReturnType<typeof useAudienceTargetFields>;
