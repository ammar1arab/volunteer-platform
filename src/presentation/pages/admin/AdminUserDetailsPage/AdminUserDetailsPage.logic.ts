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
  const { user, activities, isLoadingUser, isLoadingActivities, error } =
    useUserDetails(userId);

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
    return activeFilter === "all"
      ? activities
      : activities.filter((a) => a.status === activeFilter);
  }, [activities, activeFilter]);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActivities.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredActivities, currentPage]);

  return {
    status,
    user,
    activities: paginatedActivities,
    allActivities: activities,
    totalFilteredItems: filteredActivities.length,
    isLoadingUser,
    isLoadingActivities,
    activeFilter,
    setActiveFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    toasts,
    removeToast,
  };
};
