"use client";
import { useVolunteerSpotlight } from "@/presentation/hooks";

export const useVolunteerSpotlightPublicPage = () => {
  const { list, loading } = useVolunteerSpotlight({ activeOnly: true });
  return { spotlights: list, loading };
};