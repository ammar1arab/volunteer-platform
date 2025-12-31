import { useState, useCallback, useEffect } from "react";
import { activityParticipationApi } from "@/lib/api";
import type { ActivityParticipationDto } from "@/core/application/dtos";

interface UseActivityParticipationsOptions {
  autoFetch?: boolean;
  type?: "my-requests" | "pending";
}

export const useActivityParticipations = (
  options: UseActivityParticipationsOptions = {}
) => {
  const { autoFetch = false, type = "my-requests" } = options;

  const [requests, setRequests] = useState<ActivityParticipationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        type === "pending"
          ? await activityParticipationApi.getPending()
          : await activityParticipationApi.getMyRequests();

      if (response.success && response.requests) {
        setRequests(response.requests);
      } else {
        setError(response.error || "Failed to fetch requests");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [type]);

  const createRequest = useCallback(
    async (activityId: string): Promise<boolean> => {
      try {
        setSubmitting(true);
        setError("");

        const response = await activityParticipationApi.createRequest(activityId);

        if (response.success) {
          await fetchRequests();
          return true;
        }

        setError(response.error || "Failed to create request");
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchRequests]
  );

  const approve = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setSubmitting(true);
        setError("");

        const response = await activityParticipationApi.approve(id);

        if (response.success) {
          await fetchRequests();
          return true;
        }

        setError(response.error || "Failed to approve request");
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchRequests]
  );

  const reject = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setSubmitting(true);
        setError("");

        const response = await activityParticipationApi.reject(id);

        if (response.success) {
          await fetchRequests();
          return true;
        }

        setError(response.error || "Failed to reject request");
        return false;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchRequests]
  );

  const getRequestForActivity = useCallback(
    (activityId: string): ActivityParticipationDto | undefined => {
      return requests.find((r) => r.activityId === activityId);
    },
    [requests]
  );

  useEffect(() => {
    if (autoFetch) {
      fetchRequests();
    }
  }, [autoFetch, fetchRequests]);

  return {
    requests,
    loading,
    submitting,
    error,
    fetchRequests,
    createRequest,
    approve,
    reject,
    getRequestForActivity,
  };
};