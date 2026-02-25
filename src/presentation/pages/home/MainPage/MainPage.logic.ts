"use client";
import { useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  useFeaturedPosts,
  useActivities,
  useActivityParticipations,
  useToast,
  useVolunteerSpotlight,
  useMonthlyMagazines
} from "@/presentation/hooks";
import type { ActivityDto } from "@/core/application/dtos";
import { ROUTES } from "@/presentation/constants";

const ACTIVITIES_LIMIT = 4;
const POSTS_LIMIT = 8;
const SPOTLIGHT_LIMIT = 3;
const MAGAZINES_LIMIT = 5;

export const useMainPage = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToast();

  const { list: allPosts, loading: postsLoading } = useFeaturedPosts({ activeOnly: true });
  const { list: allActivities, loading: activitiesLoading } = useActivities({ filter: "published" });
  const { list: allSpotlights, loading: spotlightsLoading } = useVolunteerSpotlight({ activeOnly: true });
  const { list: allMagazines, loading: magazinesLoading } = useMonthlyMagazines({ activeOnly: true });
  const { submitting, createRequest, getRequestForActivity } = useActivityParticipations({ autoFetch: !!session });

  const posts = useMemo(() => allPosts.slice(0, POSTS_LIMIT), [allPosts]);
  const activities = useMemo(() => allActivities.slice(0, ACTIVITIES_LIMIT), [allActivities]);
  const spotlights = useMemo(() => allSpotlights.slice(0, SPOTLIGHT_LIMIT), [allSpotlights]);
  const magazines = useMemo(() => allMagazines.slice(0, MAGAZINES_LIMIT), [allMagazines]);

  const handleJoin = useCallback(
    async (activity: ActivityDto) => {
      if (!session) { router.push(ROUTES.LOGIN); return; }
      const success = await createRequest(activity.id);
      showToast(success ? "تم إرسال طلب الانضمام" : "فشل إرسال الطلب", success ? "success" : "error");
    },
    [session, router, createRequest, showToast]
  );

  const getActionButton = useCallback(
    (activity: ActivityDto) => {
      if (!session) return { variant: "secondary" as const, label: "تسجيل الدخول", disabled: false, onClick: () => router.push(ROUTES.LOGIN) };
      const request = getRequestForActivity(activity.id);
      if (activity.isFull) return { variant: "ghost" as const, label: "اكتمل العدد", disabled: true };
      if (request?.status === "PENDING") return { variant: "ghost" as const, label: "قيد المراجعة", disabled: true };
      if (request?.status === "APPROVED") return { variant: "ghost" as const, label: "أنت مشارك", disabled: true };
      return { variant: "primary" as const, label: "انضم الآن", disabled: false, onClick: () => handleJoin(activity) };
    },
    [session, router, getRequestForActivity, handleJoin]
  );

  return {
    posts,
    activities,
    spotlights,
    magazines,
    hasMorePosts: allPosts.length > POSTS_LIMIT,
    hasMoreActivities: allActivities.length > ACTIVITIES_LIMIT,
    hasMoreSpotlights: allSpotlights.length > SPOTLIGHT_LIMIT,
    hasMoreMagazines: allMagazines.length > MAGAZINES_LIMIT,
    loading: postsLoading || activitiesLoading || spotlightsLoading || magazinesLoading,
    submitting,
    getActionButton
  };
};