"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { UserRole } from "@/core/domain/enums";
import { useUsers, useToast, useAuth } from "@/presentation/hooks";
import type { UserAnalyticsDto } from "@/core/application/dtos";
import { getCityLabel } from "@/presentation/constants";

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
      case "default": {
        const aHasImage = !!a.volunteerProfile?.profilePictureUrl;
        const bHasImage = !!b.volunteerProfile?.profilePictureUrl;
        if (aHasImage !== bHasImage) return aHasImage ? -1 : 1;
        if (a.stats.approvedActivities !== b.stats.approvedActivities) {
          return b.stats.approvedActivities - a.stats.approvedActivities;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
        return 0;
    }
  });
};

export const useUserManagementPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const { users, loading, error } = useUsers();
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [activeCity, setActiveCity] = useState("all");

  const ITEMS_PER_PAGE = 32;

  useEffect(() => {
    if (error && error.trim()) {
      showToast(error, "error");
    }
  }, [error, showToast]);

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
          u.phone?.toLowerCase().includes(q)
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
    const counts = new Map<string, number>();
    allVolunteers.forEach((u) => {
      const city = u.volunteerProfile?.city;
      if (city) counts.set(city, (counts.get(city) || 0) + 1);
    });
    return [
      { key: "all", label: "الجميع", count: allVolunteers.length },
      ...Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([city, count]) => ({ key: city, label: getCityLabel(city as any), count }))
    ];
  }, [users]);

  const paginatedVolunteers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return volunteers.slice(start, start + ITEMS_PER_PAGE);
  }, [volunteers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, appliedSearch, activeCity]);

  const exportData = useMemo(
    () =>
      volunteers.map((user) => ({
        fullName: user.fullName,
        age: calculateAge(user.volunteerProfile?.dateOfBirth),
        phone: user.phone,
        email: user.email,
        city: getCityLabel(user.volunteerProfile?.city as any) || "-",
        totalHours: user.stats.totalHours || 0,
        approvedActivities: user.stats.approvedActivities || 0,
        skills: user.volunteerProfile?.skills?.join(", ") || "-",
        interests: user.volunteerProfile?.interests?.join(", ") || "-",
        createdAt: new Date(user.createdAt).toLocaleDateString("ar"),
        certificatesCount: user.stats.certificatesCount || 0,
      })),
    [volunteers]
  );

  const handleSortChange = useCallback((key: string) => {
    setSortBy(key as SortOption);
  }, []);

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
