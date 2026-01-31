"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/lib";
import { useUsers, useToast, usePagination } from "@/presentation/hooks";
import type { UserAnalyticsDto } from "@/core/application/dtos";

type SortOption = "default" | "oldest" | "newest" | "name" | "age" | "most-active";

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
        return a.fullName.localeCompare(b.fullName, 'ar');
      
      case "age": {
        const ageA = calculateAge(a.volunteerProfile?.dateOfBirth);
        const ageB = calculateAge(b.volunteerProfile?.dateOfBirth);
        return ageB - ageA;
      }
      
      case "most-active":
        return b.stats.approvedActivities - a.stats.approvedActivities;
      
      default:
        return 0;
    }
  });
};

export const useUserManagementPage = () => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { users, isLoading, error } = useUsers();
  const [sortBy, setSortBy] = useState<SortOption>("default");

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

  const volunteers = sortUsers(
    users.filter((u) => u.role === "VOLUNTEER"),
    sortBy
  );
  
  const admins = sortUsers(
    users.filter((u) => u.role === "ADMIN"),
    sortBy
  );

  const volunteerPagination = usePagination({
    totalItems: volunteers.length,
    itemsPerPage: 20,
  });

  const paginatedVolunteers = volunteerPagination.paginateItems(volunteers);

  const exportData = volunteers.map(user => ({
    fullName: user.fullName,
    age: calculateAge(user.volunteerProfile?.dateOfBirth),
    phone: user.phone,
    email: user.email,
    city: user.volunteerProfile?.city || '-',
    skills: user.volunteerProfile?.skills?.join(', ') || '-',
    interests: user.volunteerProfile?.interests?.join(', ') || '-',
    approvedActivities: user.stats.approvedActivities,
    createdAt: new Date(user.createdAt).toLocaleDateString('ar'),
  }));

  const handleSortChange = (key: string) => {
    setSortBy(key as SortOption);
  };

  return {
    status,
    isLoading,
    volunteers,
    admins,
    paginatedVolunteers,
    volunteerPagination,
    sortBy,
    setSortBy: handleSortChange,
    exportData,
    toasts,
    removeToast,
  };
};