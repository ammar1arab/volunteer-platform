// import { useState, useCallback } from "react";
// import { ApiError } from "@/lib";

// interface ResourceCRUDOptions<T, CreatePayload, UpdatePayload> {
//   fetchAll: () => Promise<{ success: boolean; data?: T[]; error?: string }>;
//   fetchOne?: (
//     id: string
//   ) => Promise<{ success: boolean; data?: T; error?: string }>;
//   createOne: (
//     payload: CreatePayload
//   ) => Promise<{ success: boolean; data?: T; error?: string }>;
//   updateOne: (
//     id: string,
//     payload: UpdatePayload
//   ) => Promise<{ success: boolean; data?: T; error?: string }>;
//   deleteOne: (id: string) => Promise<{ success: boolean; error?: string }>;
//   onSuccess?: (
//     action: "create" | "update" | "delete",
//     message?: string
//   ) => void;
//   onError?: (error: string) => void;
//   filterActive?: boolean;
// }

// const getErrMsg = (err: unknown, fallback: string) => {
//   if (err instanceof ApiError) return err.message;
//   if (err instanceof Error) return err.message;
//   return fallback;
// };

// export const useResourceCRUD = <
//   T extends { id: string; isActive?: boolean },
//   CreatePayload,
//   UpdatePayload
// >(
//   options: ResourceCRUDOptions<T, CreatePayload, UpdatePayload>
// ) => {
//   const [items, setItems] = useState<T[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");

//   const refresh = useCallback(async () => {
//     setIsLoading(true);
//     setError("");

//     try {
//       const result = await options.fetchAll();

//       // ✅ المهم: طالما success true اعتبرها نجاح وخذ data أو []
//       if (result.success) {
//         const data = result.data ?? [];
//         const filtered = options.filterActive
//           ? data.filter((x) => x.isActive !== false)
//           : data;
//         setItems(filtered);
//         return;
//       }

//       const msg = result.error || "فشل في جلب البيانات";
//       setError(msg);
//       options.onError?.(msg);
//     } catch (err: unknown) {
//       const msg = getErrMsg(err, "حدث خطأ غير متوقع");
//       setError(msg);
//       options.onError?.(msg);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [options]);

//   const create = useCallback(
//     async (payload: CreatePayload) => {
//       setIsSubmitting(true);
//       setError("");

//       try {
//         const result = await options.createOne(payload);

//         if (result.success) {
//           await refresh();
//           options.onSuccess?.("create", "تم الإنشاء بنجاح");
//           return true;
//         }

//         const msg = result.error || "فشل في الإنشاء";
//         setError(msg);
//         options.onError?.(msg);
//         return false;
//       } catch (err: unknown) {
//         const msg = getErrMsg(err, "حدث خطأ غير متوقع");
//         setError(msg);
//         options.onError?.(msg);
//         return false;
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [options, refresh]
//   );

//   const update = useCallback(
//     async (id: string, payload: UpdatePayload) => {
//       setIsSubmitting(true);
//       setError("");

//       try {
//         const result = await options.updateOne(id, payload);

//         if (result.success) {
//           await refresh();
//           options.onSuccess?.("update", "تم التحديث بنجاح");
//           return true;
//         }

//         const msg = result.error || "فشل في التحديث";
//         setError(msg);
//         options.onError?.(msg);
//         return false;
//       } catch (err: unknown) {
//         const msg = getErrMsg(err, "حدث خطأ غير متوقع");
//         setError(msg);
//         options.onError?.(msg);
//         return false;
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [options, refresh]
//   );

//   const remove = useCallback(
//     async (id: string) => {
//       setIsSubmitting(true);
//       setError("");

//       try {
//         const result = await options.deleteOne(id);

//         if (result.success) {
//           await refresh();
//           options.onSuccess?.("delete", "تم الحذف بنجاح");
//           return true;
//         }

//         const msg = result.error || "فشل في الحذف";
//         setError(msg);
//         options.onError?.(msg);
//         return false;
//       } catch (err: unknown) {
//         const msg = getErrMsg(err, "حدث خطأ غير متوقع");
//         setError(msg);
//         options.onError?.(msg);
//         return false;
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [options, refresh]
//   );

//   return {
//     items,
//     isLoading,
//     isSubmitting,
//     error,
//     refresh,
//     create,
//     update,
//     remove,
//   };
// };
