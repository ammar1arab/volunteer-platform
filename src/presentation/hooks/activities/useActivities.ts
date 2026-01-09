"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { activityApi, uploadApi } from "@/lib";
import type {
  ActivityDto,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@/core/application/dtos";

const getErr = (e: unknown) =>
  e instanceof Error ? e.message : "Unexpected error";

export type ActivitiesFilter = "all" | "published";

export const useActivities = (opts?: { filter?: ActivitiesFilter }) => {
  const [items, setItems] = useState<ActivityDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const filter = opts?.filter ?? "all";

  const list = useMemo(() => {
    return [...items].sort((a, b) => {
      const d1 = new Date(a.date).getTime();
      const d2 = new Date(b.date).getTime();
      if (d1 !== d2) return d1 - d2;
      return (a.startTime || "").localeCompare(b.startTime || "", "en");
    });
  }, [items]);

  const fetchList = useCallback(
    async (silent = false) => {
      setError("");
      if (!silent) setLoading(true);

      try {
        const res =
          filter === "published"
            ? await activityApi.getPublished()
            : await activityApi.getAll();

        if (!res.success) {
          if (!silent) setItems([]);
          setError(res.error || "Failed to load activities");
          return;
        }

        setItems(res.activities || []);
      } catch (e) {
        if (!silent) setItems([]);
        setError(getErr(e));
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    fetchList(false);
  }, [fetchList]);

  const refresh = useCallback(() => fetchList(false), [fetchList]);

  const uploadImage = useCallback(async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const res = await uploadApi.uploadActivityImage(file);
      if (!res.success || !res.data?.imageUrl)
        throw new Error(res.error || "Upload failed");
      return res.data.imageUrl;
    } catch (e) {
      setError(getErr(e));
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  const create = useCallback(
    async (payload: CreateActivityRequest) => {
      setError("");
      setSubmitting(true);
      try {
        const res = await activityApi.create(payload);
        if (!res.success || !res.activity)
          throw new Error(res.error || "Create failed");

        setItems((prev) => [res.activity!, ...prev]);
        await fetchList(true);

        return res.activity!;
      } catch (e) {
        setError(getErr(e));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchList]
  );

  const update = useCallback(
    async (id: string, payload: UpdateActivityRequest) => {
      setError("");
      setSubmitting(true);
      try {
        const res = await activityApi.update(id, payload);
        if (!res.success || !res.activity)
          throw new Error(res.error || "Update failed");

        setItems((prev) => prev.map((x) => (x.id === id ? res.activity! : x)));
        await fetchList(true);

        return res.activity!;
      } catch (e) {
        setError(getErr(e));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchList]
  );

  const remove = useCallback(
    async (id: string) => {
      setError("");
      setSubmitting(true);
      try {
        const res = await activityApi.delete(id);
        if (!res.success) throw new Error(res.error || "Delete failed");

        setItems((prev) => prev.filter((x) => x.id !== id));
        await fetchList(true);

        return true;
      } catch (e) {
        setError(getErr(e));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchList]
  );

  const publish = useCallback(
    async (id: string) => {
      setError("");
      setSubmitting(true);
      try {
        const res = await activityApi.publish(id);
        if (!res.success || !res.activity)
          throw new Error(res.error || "Publish failed");

        setItems((prev) => prev.map((x) => (x.id === id ? res.activity! : x)));
        await fetchList(true);

        return res.activity!;
      } catch (e) {
        setError(getErr(e));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchList]
  );

  const cancel = useCallback(
    async (id: string) => {
      setError("");
      setSubmitting(true);
      try {
        const res = await activityApi.cancel(id);
        if (!res.success || !res.activity)
          throw new Error(res.error || "Cancel failed");

        setItems((prev) => prev.map((x) => (x.id === id ? res.activity! : x)));
        await fetchList(true);

        return res.activity!;
      } catch (e) {
        setError(getErr(e));
        return null;
      } finally {
        setSubmitting(false);
      }
    },
    [fetchList]
  );

  const restore = useCallback(
  async (id: string) => {
    setError("");
    setSubmitting(true);
    try {
      const res = await activityApi.restore(id);
      if (!res.success || !res.activity)
        throw new Error(res.error || "Restore failed");

      setItems((prev) => prev.map((x) => (x.id === id ? res.activity! : x)));
      await fetchList(true);

      return res.activity!;
    } catch (e) {
      setError(getErr(e));
      return null;
    } finally {
      setSubmitting(false);
    }
  },
  [fetchList]
);

  return {
    list,
    loading,
    submitting,
    uploading,
    error,
    refresh,
    uploadImage,
    create,
    update,
    remove,
    publish,
    cancel,
    restore
  };
};