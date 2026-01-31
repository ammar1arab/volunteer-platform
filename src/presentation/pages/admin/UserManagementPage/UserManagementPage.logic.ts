"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/lib";
import { useUsers, useToast, usePagination } from "@/presentation/hooks";
import type { UserAnalyticsDto } from "@/core/application/dtos";

const sortUsers = (users: UserAnalyticsDto[]): UserAnalyticsDto[] => {
  return [...users].sort((a, b) => {
    const aHasImage = !!a.volunteerProfile?.profilePictureUrl;
    const bHasImage = !!b.volunteerProfile?.profilePictureUrl;
    
    if (aHasImage !== bHasImage) {
      return aHasImage ? -1 : 1;
    }

    if (a.stats.approvedActivities !== b.stats.approvedActivities) {
      return b.stats.approvedActivities - a.stats.approvedActivities;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

export const useUserManagementPage = () => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { users, isLoading, error } = useUsers();

  const role = session?.user?.role ?? "VOLUNTEER";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.LOGIN);
    if (role !== "ADMIN") router.replace(ROUTES.VOLUNTEER.PROFILE);
  }, [status, role, router]);

  useEffect(() => {
    if (error && error.trim()) {
      showToast(error, "error");
    }
  }, [error, showToast]);

  const volunteers = sortUsers(users.filter((u) => u.role === "VOLUNTEER"));
  const admins = sortUsers(users.filter((u) => u.role === "ADMIN"));

  const volunteerPagination = usePagination({
    totalItems: volunteers.length,
    itemsPerPage: 20,
  });

  const paginatedVolunteers = volunteerPagination.paginateItems(volunteers);

  return {
    status,
    isLoading,
    volunteers,
    admins,
    paginatedVolunteers,
    volunteerPagination,
    toasts,
    removeToast,
  };
};