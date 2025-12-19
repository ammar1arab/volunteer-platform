import { useState, useCallback } from "react";

interface ResourceCRUDOptions<T, CreatePayload, UpdatePayload> {
  fetchAll: () => Promise<{ success: boolean; data?: T[]; error?: string }>;
  fetchOne?: (id: string) => Promise<{ success: boolean; data?: T; error?: string }>;
  createOne: (payload: CreatePayload) => Promise<{ success: boolean; data?: T; error?: string }>;
  updateOne: (id: string, payload: UpdatePayload) => Promise<{ success: boolean; data?: T; error?: string }>;
  deleteOne: (id: string) => Promise<{ success: boolean; error?: string }>;
  onSuccess?: (action: "create" | "update" | "delete", message?: string) => void;
  onError?: (error: string) => void;
  filterActive?: boolean;
}

export const useResourceCRUD = <T extends { id: string; isActive?: boolean }, CreatePayload, UpdatePayload>(
  options: ResourceCRUDOptions<T, CreatePayload, UpdatePayload>
) => {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const result = await options.fetchAll();

    if (result.success && result.data) {
      let filteredData = result.data;
      if (options.filterActive) {
        filteredData = result.data.filter((item) => item.isActive !== false);
      }
      setItems(filteredData);
    } else {
      setError(result.error || "فشل في جلب البيانات");
      if (options.onError) options.onError(result.error || "فشل في جلب البيانات");
    }

    setIsLoading(false);
  }, [options]);

  const create = useCallback(
    async (payload: CreatePayload) => {
      setIsSubmitting(true);
      setError("");

      const result = await options.createOne(payload);

      if (result.success) {
        await refresh();
        if (options.onSuccess) options.onSuccess("create", "تم الإنشاء بنجاح");
        setIsSubmitting(false);
        return true;
      }

      setError(result.error || "فشل في الإنشاء");
      if (options.onError) options.onError(result.error || "فشل في الإنشاء");
      setIsSubmitting(false);
      return false;
    },
    [options, refresh]
  );

  const update = useCallback(
    async (id: string, payload: UpdatePayload) => {
      setIsSubmitting(true);
      setError("");

      const result = await options.updateOne(id, payload);

      if (result.success) {
        await refresh();
        if (options.onSuccess) options.onSuccess("update", "تم التحديث بنجاح");
        setIsSubmitting(false);
        return true;
      }

      setError(result.error || "فشل في التحديث");
      if (options.onError) options.onError(result.error || "فشل في التحديث");
      setIsSubmitting(false);
      return false;
    },
    [options, refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      setIsSubmitting(true);
      setError("");

      const result = await options.deleteOne(id);

      if (result.success) {
        await refresh();
        if (options.onSuccess) options.onSuccess("delete", "تم الحذف بنجاح");
        setIsSubmitting(false);
        return true;
      }

      setError(result.error || "فشل في الحذف");
      if (options.onError) options.onError(result.error || "فشل في الحذف");
      setIsSubmitting(false);
      return false;
    },
    [options, refresh]
  );

  return {
    items,
    isLoading,
    isSubmitting,
    error,
    refresh,
    create,
    update,
    remove,
  };
};