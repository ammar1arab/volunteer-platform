"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useUserDetails, useToast, useAuth } from "@/presentation/hooks";
import { UserRole } from "@/core/domain/enums";

export const useAdminUserDetailsPage = () => {
  const params = useParams();
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();

  const userId = params.id as string;
  const { user, activities, loadingUser, loadingActivities, error } = useUserDetails(userId);

  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (error && error.trim()) {
      showToast(error, "error");
    }
  }, [error, showToast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const filteredActivities = useMemo(() => {
    return activeFilter === "all" ? activities : activities.filter((a) => a.status === activeFilter);
  }, [activities, activeFilter]);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  const exportData = useMemo(() => {
    if (!user) return [];
    return [
      {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        city: user.volunteerProfile?.city || "-",
        dateOfBirth: user.volunteerProfile?.dateOfBirth
          ? new Date(user.volunteerProfile.dateOfBirth).toLocaleDateString("ar")
          : "-",
        gender: user.volunteerProfile?.gender || "-",
        bio: user.volunteerProfile?.bio || "-",
        interests: user.volunteerProfile?.interests?.join(", ") || "-",
        skills: user.volunteerProfile?.skills?.join(", ") || "-",
        activities: activities.map((a) => a.activity.title).join(", ") || "-",
        createdAt: new Date(user.createdAt).toLocaleDateString("ar")
      }
    ];
  }, [user, activities]);

  return {
    status,
    user,
    activities: paginatedActivities,
    allActivities: activities,
    totalFilteredItems: filteredActivities.length,
    loadingUser,
    loadingActivities,
    activeFilter,
    setActiveFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    toasts,
    removeToast,
    exportData
  };
};
