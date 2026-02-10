import { useState, useEffect } from "react";
import { activityApi } from "@/lib";
import type { ActivityVolunteerDto } from "@/core/application/dtos";

export const useVolunteersModal = (activityId: string, isOpen: boolean) => {
  const [volunteers, setVolunteers] = useState<ActivityVolunteerDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !activityId) return;

    const fetchVolunteers = async () => {
      setLoading(true);
      try {
        const result = await activityApi.getVolunteers(activityId);
        if (result.success && result.volunteers) {
          setVolunteers(result.volunteers);
        }
      } catch (error) {
        setVolunteers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, [isOpen, activityId]);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return { volunteers, loading, calculateAge };
};