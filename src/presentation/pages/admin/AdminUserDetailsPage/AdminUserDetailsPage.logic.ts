"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/lib";
import { useUserDetails, useToast, usePagination } from "@/presentation/hooks";

export const useAdminUserDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();

  const userId = params.id as string;
  const { user, activities, isLoadingUser, isLoadingActivities, error } = useUserDetails(userId);

  const [activeFilter, setActiveFilter] = useState("all");

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

  const filteredActivities = activeFilter === "all" ? activities : activities.filter((a) => a.status === activeFilter);

  const pagination = usePagination({
    totalItems: filteredActivities.length,
    itemsPerPage: 5,
  });

  const paginatedActivities = pagination.paginateItems(filteredActivities);

  return {
    status,
    user,
    activities: paginatedActivities,
    allActivities: activities,
    isLoadingUser,
    isLoadingActivities,
    activeFilter,
    setActiveFilter,
    pagination,
    toasts,
    removeToast,
  };
};