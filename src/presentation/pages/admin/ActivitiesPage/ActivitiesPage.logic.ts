"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DayOfWeek, UserRole } from "@/core/domain/enums";
import { processImageForUpload } from "@/lib";
import {
  useActivities,
  useToast,
  useAuth,
} from "@/presentation/hooks";
import type {
  ActivityDto,
  CreateActivityRequest,
  UpdateActivityRequest,
} from "@/core/application/dtos";

export const FILTERS = [
  { key: "PUBLISHED", label: "منشور" },
  { key: "DRAFT", label: "مسودة" },
  { key: "CANCELLED", label: "ملغي" },
  { key: "all", label: "الكل" },
];

export const STATUS_MAP = {
  DRAFT: { label: "مسودة", class: "draft" },
  PUBLISHED: { label: "منشور", class: "published" },
  CANCELLED: { label: "ملغي", class: "cancelled" },
} as const;

const VALIDATION_RULES = [
  { field: "title", message: "العنوان مطلوب" },
  { field: "description", message: "الوصف مطلوب" },
  { field: "imageUrl", message: "الصورة مطلوبة" },
  { field: "placeName", message: "اسم المكان مطلوب" },
  { field: "address", message: "العنوان مطلوب" },
  { field: "date", message: "التاريخ مطلوب" },
  { field: "startTime", message: "الوقت مطلوب" },
  { field: "endTime", message: "الوقت مطلوب" },
  { field: "targetAudience", message: "الفئة المستهدفة مطلوبة" },
];

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

export const useActivitiesPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  const {
    list,
    loading,
    submitting,
    uploadImage,
    create,
    update,
    remove,
    publish,
    cancel,
    restore,
  } = useActivities({ filter: "all" });

  const [activeFilter, setActiveFilter] = useState("PUBLISHED");
  const [currentPage, setCurrentPage] = useState(1);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [showModal, setShowModal] = useState(false);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDto | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ message: "" });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return list;
    return list.filter((a) => a.status === activeFilter);
  }, [list, activeFilter]);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setConfirmOptions(opts);
    setIsConfirmOpen(true);
    return new Promise<boolean>((resolve) => {
      setConfirmResolver(() => resolve);
    });
  }, []);

  const handleConfirmDialog = useCallback(() => {
    setIsConfirmOpen(false);
    confirmResolver?.(true);
    setConfirmResolver(null);
  }, [confirmResolver]);

  const handleCancelDialog = useCallback(() => {
    setIsConfirmOpen(false);
    confirmResolver?.(false);
    setConfirmResolver(null);
  }, [confirmResolver]);

  const openCreateModal = useCallback(() => {
    setMode("create");
    setEditData(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((activity: ActivityDto) => {
    if (activity.status !== "DRAFT") {
      showToast("فقط المسودات يمكن تعديلها", "warning");
      return;
    }
    setMode("edit");
    setEditData({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      imageUrl: activity.imageUrl,
      dayOfWeek: activity.dayOfWeek,
      date: new Date(activity.date).toISOString().slice(0, 10),
      startTime: activity.startTime,
      endTime: activity.endTime,
      placeName: activity.placeName,
      address: activity.location.address,
      latitude: activity.location.latitude,
      longitude: activity.location.longitude,
      targetAudience: activity.targetAudience,
      maxVolunteers: activity.maxVolunteers,
    });
    setShowModal(true);
  }, [showToast]);

  const handleImageUpload = useCallback(async (file: File): Promise<string | null> => {
    const result = await processImageForUpload(file, { maxSizeMB: 5, quality: 0.85 });
    if (result.error) {
      showToast(result.error, "error");
      return null;
    }
    const url = await uploadImage(result.file);
    if (url) {
      showToast("تم رفع الصورة", "success");
      return url;
    }
    return null;
  }, [uploadImage, showToast]);

  const validate = useCallback((form: any): string | null => {
    for (const rule of VALIDATION_RULES) {
      const value = form[rule.field];
      if (!value || (typeof value === "string" && !value.trim())) return rule.message;
    }
    if (form.startTime >= form.endTime) return "وقت البداية يجب أن يسبق النهاية";
    if (form.maxVolunteers < 1) return "العدد الأقصى يجب أن يكون 1 أو أكثر";
    return null;
  }, []);

  const handleModalSubmit = useCallback(async (formData: any) => {
    const error = validate(formData);
    if (error) {
      showToast(error, "warning");
      return;
    }

    const payload: CreateActivityRequest | UpdateActivityRequest = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      imageUrl: formData.imageUrl,
      dayOfWeek: formData.dayOfWeek as DayOfWeek,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      placeName: formData.placeName.trim(),
      location: {
        address: formData.address.trim(),
        latitude: formData.latitude,
        longitude: formData.longitude,
      },
      targetAudience: formData.targetAudience.trim(),
      maxVolunteers: formData.maxVolunteers,
    };

    try {
      const success = mode === "create"
        ? await create(payload as CreateActivityRequest)
        : await update(formData.id, payload as UpdateActivityRequest);

      if (success) {
        showToast(mode === "create" ? "تم الإنشاء" : "تم التحديث", "success");
        setShowModal(false);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "حدث خطأ", "error");
    }
  }, [mode, create, update, showToast, validate]);

  const handleDelete = useCallback(async (activity: ActivityDto) => {
    const ok = await confirm({
      title: "حذف الفرصة",
      message: `هل تريد حذف "${activity.title}"؟`,
      confirmText: "حذف",
      cancelText: "إلغاء",
      variant: "danger",
    });
    if (ok && (await remove(activity.id))) showToast("تم الحذف", "success");
  }, [confirm, remove, showToast]);

  const handlePublish = useCallback(async (activity: ActivityDto) => {
    if (activity.status !== "DRAFT") return;
    if (await publish(activity.id)) showToast("تم النشر", "success");
  }, [publish, showToast]);

  const handleCancelActivity = useCallback(async (activity: ActivityDto) => {
    if (activity.status === "CANCELLED") return;
    const ok = await confirm({
      title: "إلغاء الفرصة",
      message: `هل تريد إلغاء "${activity.title}"؟ يمكنك استعادتها لاحقاً.`,
      confirmText: "إلغاء الفرصة",
      cancelText: "رجوع",
      variant: "danger",
    });
    if (ok && (await cancel(activity.id))) showToast("تم الإلغاء", "success");
  }, [confirm, cancel, showToast]);

  const handleRestore = useCallback(async (activity: ActivityDto) => {
    if (activity.status !== "CANCELLED") return;
    const ok = await confirm({
      title: "استعادة الفرصة",
      message: `هل تريد استعادة "${activity.title}" كمسودة؟`,
      confirmText: "استعادة",
      cancelText: "إلغاء",
      variant: "primary",
    });
    if (ok && (await restore(activity.id))) showToast("تم الاستعادة كمسودة", "success");
  }, [confirm, restore, showToast]);

  const handleViewVolunteers = useCallback((activity: ActivityDto) => {
    setSelectedActivity(activity);
    setShowVolunteersModal(true);
  }, []);

  return {
    status,
    loading,
    submitting,
    activeFilter,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    mode,
    showModal,
    showVolunteersModal,
    selectedActivity,
    editData,
    filtered,
    paginatedActivities,
    toasts,
    removeToast,
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog,
    },
    setActiveFilter,
    setCurrentPage,
    setShowModal,
    setShowVolunteersModal,
    openCreateModal,
    handleEdit,
    handleImageUpload,
    handleModalSubmit,
    handleDelete,
    handlePublish,
    handleCancel: handleCancelActivity,
    handleRestore,
    handleViewVolunteers,
  };
};