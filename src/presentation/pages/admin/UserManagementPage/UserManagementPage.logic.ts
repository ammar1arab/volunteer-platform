"use client";

import { useMemo, useCallback } from "react";
import { UserRole, JordanianCity } from "@/core/domain/enums";
import { useUsers, useToast, useAuth, usePageReset } from "@/presentation/hooks";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import type { UserAnalyticsDto } from "@/core/application/dtos";
import { formatDate } from "@/lib/utils/date";
import { getCityLabel, getEducationLevelLabel } from "@/presentation/constants";
import type { ExcelExportRow } from "@/presentation/components/admin/ExportUsersButton/ExportUsersButton.logic";

type SortOption = "default" | "oldest" | "newest" | "name" | "age" | "most-active" | "most-hours" | "most-certs";

const calculateAge = (dateOfBirth?: string): number => {
  if (!dateOfBirth) return 0;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const sortUsers = (users: UserAnalyticsDto[], sortBy: SortOption): UserAnalyticsDto[] => {
  return [...users].sort((a, b) => {
    switch (sortBy) {
      case "default":
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "name":
        return a.fullName.localeCompare(b.fullName, "ar");
      case "age": {
        const ageA = calculateAge(a.volunteerProfile?.dateOfBirth);
        const ageB = calculateAge(b.volunteerProfile?.dateOfBirth);
        return ageB - ageA;
      }
      case "most-active":
        return b.stats.approvedActivities - a.stats.approvedActivities;
      case "most-hours":
        return b.stats.totalHours - a.stats.totalHours;
      case "most-certs":
        return b.stats.certificatesCount - a.stats.certificatesCount;
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
};

export const useUserManagementPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, removeToast } = useToast();
  const { users, loading } = useUsers();
  const [sortBy, setSortByState] = useSessionStorageState<SortOption>(
    "filters.admin.userManagement.sortBy",
    "newest"
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.userManagement.currentPage",
    1
  );
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.admin.userManagement.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearchState] = useSessionStorageState(
    "filters.admin.userManagement.appliedSearch",
    ""
  );
  const [activeCity, setActiveCityState] = useSessionStorageState(
    "filters.admin.userManagement.activeCity",
    "all"
  );
  const setSortBy = usePageReset(setSortByState, setCurrentPage);
  const setAppliedSearch = usePageReset(setAppliedSearchState, setCurrentPage);
  const setActiveCity = usePageReset(setActiveCityState, setCurrentPage);

  const ITEMS_PER_PAGE = 32;

  const volunteers = useMemo(() => {
    let result = users.filter((u) => u.role === "VOLUNTEER");

    if (activeCity !== "all") {
      result = result.filter((u) => u.volunteerProfile?.city === activeCity);
    }

    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.volunteerProfile?.membershipNumber?.toLowerCase().includes(q) ||
          u.volunteerProfile?.occupation?.toLowerCase().includes(q) ||
          (u.volunteerProfile?.educationLevel &&
            getEducationLevelLabel(u.volunteerProfile.educationLevel).toLowerCase().includes(q)) ||
          u.volunteerProfile?.educationLevel?.toLowerCase().includes(q) ||
          u.volunteerProfile?.languages?.some((l) => l.toLowerCase().includes(q)) ||
          u.volunteerProfile?.preferredVolunteerTypes?.some((t) => t.toLowerCase().includes(q)) ||
          u.volunteerProfile?.skills?.some((s) => s.toLowerCase().includes(q))
      );
    }

    return sortUsers(result, sortBy);
  }, [users, sortBy, appliedSearch, activeCity]);

  const admins = useMemo(
    () =>
      sortUsers(
        users.filter((u) => u.role === "ADMIN"),
        sortBy
      ),
    [users, sortBy]
  );

  const cityOptions = useMemo(() => {
    const allVolunteers = users.filter((u) => u.role === "VOLUNTEER");
    const counts = new Map<JordanianCity, number>();
    allVolunteers.forEach((u) => {
      const city = u.volunteerProfile?.city;
      if (city) counts.set(city, (counts.get(city) || 0) + 1);
    });
    return [
      { key: "all", label: "الجميع", count: allVolunteers.length },
      ...Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([city, count]) => ({ key: city, label: getCityLabel(city), count }))
    ];
  }, [users]);

  const paginatedVolunteers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return volunteers.slice(start, start + ITEMS_PER_PAGE);
  }, [volunteers, currentPage]);

  const exportData = useMemo(
    (): ExcelExportRow[] =>
      volunteers.map((user) => ({
        fullName: user.fullName,
        age: calculateAge(user.volunteerProfile?.dateOfBirth),
        phone: user.phone,
        email: user.email,
        membershipNumber: user.volunteerProfile?.membershipNumber || "-",
        city: user.volunteerProfile?.city ? getCityLabel(user.volunteerProfile.city) : "-",
        educationLevel: user.volunteerProfile?.educationLevel
          ? getEducationLevelLabel(user.volunteerProfile.educationLevel)
          : "-",
        occupation: user.volunteerProfile?.occupation || "-",
        hasVolunteerExperience: user.volunteerProfile?.hasVolunteerExperience ? "نعم" : "لا",
        totalHours: user.stats.totalHours || 0,
        approvedActivities: user.stats.approvedActivities || 0,
        skills: user.volunteerProfile?.skills?.join(", ") || "-",
        interests: user.volunteerProfile?.interests?.join(", ") || "-",
        languages: user.volunteerProfile?.languages?.join(", ") || "-",
        preferredVolunteerTypes: user.volunteerProfile?.preferredVolunteerTypes?.join(", ") || "-",
        createdAt: formatDate(user.createdAt),
        certificatesCount: user.stats.certificatesCount || 0,
      })),
    [volunteers]
  );

  const handleSortChange = useCallback((key: string) => {
    setSortBy(key as SortOption);
  }, [setSortBy]);

  return {
    status,
    loading,
    volunteers,
    admins,
    paginatedVolunteers,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    sortBy,
    setSortBy: handleSortChange,
    exportData,
    toasts,
    removeToast,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch,
    activeCity,
    setActiveCity,
    cityOptions
  };
};
