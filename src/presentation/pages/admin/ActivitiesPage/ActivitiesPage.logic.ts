"use client";

import { useCallback, useMemo, useState } from "react";
import { ActivityStatus, ActivityType, DayOfWeek, MeetingLinkSource, MeetingPlatform, UserRole } from "@/core/domain/enums";
import { useActivities, useToast, useAuth, useConfirmDialog, usePageReset } from "@/presentation/hooks";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";
import type { ActivityDto, CreateActivityRequest, UpdateActivityRequest } from "@/core/application/dtos";
import { processImageForUpload } from "@/lib/utils";
import { ACTIVITY_STATUS_LABELS } from "@/presentation/constants";

export const FILTERS = [
  { key: ActivityStatus.PUBLISHED, label: ACTIVITY_STATUS_LABELS[ActivityStatus.PUBLISHED] },
  { key: ActivityStatus.DRAFT, label: ACTIVITY_STATUS_LABELS[ActivityStatus.DRAFT] },
  { key: ActivityStatus.CANCELLED, label: ACTIVITY_STATUS_LABELS[ActivityStatus.CANCELLED] },
  { key: ActivityStatus.COMPLETED, label: ACTIVITY_STATUS_LABELS[ActivityStatus.COMPLETED] },
  { key: "all", label: "الكل" }
];

export const STATUS_MAP = {
  [ActivityStatus.DRAFT]: { label: ACTIVITY_STATUS_LABELS[ActivityStatus.DRAFT], class: "draft" },
  [ActivityStatus.PUBLISHED]: { label: ACTIVITY_STATUS_LABELS[ActivityStatus.PUBLISHED], class: "published" },
  [ActivityStatus.CANCELLED]: { label: ACTIVITY_STATUS_LABELS[ActivityStatus.CANCELLED], class: "cancelled" },
  [ActivityStatus.COMPLETED]: { label: ACTIVITY_STATUS_LABELS[ActivityStatus.COMPLETED], class: "completed" }
} as const;

const VALIDATION_RULES = [
  { field: "title", message: "العنوان مطلوب" },
  { field: "description", message: "الوصف مطلوب" },
  { field: "imageUrl", message: "الصورة مطلوبة" },
  { field: "date", message: "التاريخ مطلوب" },
  { field: "startTime", message: "الوقت مطلوب" },
  { field: "endTime", message: "الوقت مطلوب" },
  { field: "durationHours", message: "عدد الساعات مطلوب" },
  { field: "activityType", message: "نوع النشاط مطلوب" }
];

export const useActivitiesPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  const { list, loading, submitting, uploadImage, create, update, remove, publish, cancel, restore, complete } =
    useActivities({ filter: "all" });

  const [activeFilter, setActiveFilterState] = useSessionStorageState<string>(
    "filters.admin.activities.activeFilter",
    ActivityStatus.PUBLISHED
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.activities.currentPage",
    1
  );
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [showModal, setShowModal] = useState(false);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDto | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.admin.activities.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearchState] = useSessionStorageState(
    "filters.admin.activities.appliedSearch",
    ""
  );

  const { confirm, confirmDialog } = useConfirmDialog();
  const setActiveFilter = usePageReset(setActiveFilterState, setCurrentPage);
  const setAppliedSearch = usePageReset(setAppliedSearchState, setCurrentPage);

  const filtered = useMemo(() => {
    let result = activeFilter === "all" ? list : list.filter((a) => a.status === activeFilter);
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.placeName?.toLowerCase().includes(q) ?? false)
      );
    }
    return result;
  }, [list, activeFilter, appliedSearch]);

  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const openCreateModal = useCallback(() => {
    setMode("create");
    setEditData(null);
    setShowModal(true);
  }, []);

  const handleEdit = useCallback((activity: ActivityDto) => {
    if (activity.status === ActivityStatus.COMPLETED) return;
    setMode("edit");
    setEditData({
      id: activity.id,
      title: activity.title,
      description: activity.description,
      imageUrl: activity.imageUrl,
      dayOfWeek: activity.dayOfWeek,
      date: activity.date.toString().split("T")[0],
      startTime: activity.startTime,
      endTime: activity.endTime,
      durationHours: activity.durationHours,
      activityType: activity.activityType,
      categories: activity.categories,
      maxVolunteers: activity.maxVolunteers,
      placeName: activity.placeName,
      city: activity.city,
      latitude: activity.latitude,
      longitude: activity.longitude,
      meetingLink: activity.meetingLink,
      meetingPlatform: activity.meetingPlatform,
      meetingLinkSource: activity.meetingLinkSource ?? MeetingLinkSource.MANUAL,
      primaryPresenterId: activity.primaryPresenterId ?? ""
    });
    setShowModal(true);
  }, []);

  const handlePublish = useCallback(
    async (activity: ActivityDto) => {
      if (activity.status !== ActivityStatus.DRAFT) return;
      const ok = await confirm({
        title: "نشر الفرصة",
        message: `هل تريد نشر "${activity.title}"؟ سيتمكن المتطوعون من رؤيتها والتسجيل فيها.`,
        confirmText: "نشر الآن",
        cancelText: "إلغاء",
        variant: "primary"
      });
      if (ok && (await publish(activity.id))) showToast("تم النشر بنجاح", "success");
    },
    [confirm, publish, showToast]
  );

  const handleImageUpload = useCallback(
    async (file: File): Promise<string | null> => {
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
    },
    [uploadImage, showToast]
  );

  const validate = useCallback((form: any): string | null => {
    for (const rule of VALIDATION_RULES) {
      const value = form[rule.field];
      if (!value || (typeof value === "string" && !value.trim())) return rule.message;
    }
    if (form.activityType === ActivityType.IN_PERSON && !form.placeName?.trim())
      return "اسم المكان مطلوب للنشاط الوجاهي";
    if (form.activityType === ActivityType.IN_PERSON && !form.city) return "المدينة مطلوبة للنشاط الوجاهي";
    if (form.activityType === ActivityType.ONLINE) {
      if (!form.meetingLinkSource) return "مصدر رابط الاجتماع مطلوب";
      if (form.meetingLinkSource === MeetingLinkSource.MANUAL) {
        if (!form.meetingPlatform) return "منصة الاجتماع مطلوبة للرابط اليدوي";
        if (!form.meetingLink?.trim()) return "رابط الاجتماع مطلوب للنشاط الإلكتروني";
      }
    }
    if (form.startTime >= form.endTime) return "وقت البداية يجب أن يسبق النهاية";
    if (form.maxVolunteers < 1) return "العدد الأقصى يجب أن يكون 1 أو أكثر";
    return null;
  }, []);

  const handleModalSubmit = useCallback(
    async (formData: any) => {
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
        durationHours: Number(formData.durationHours),
        activityType: formData.activityType as ActivityType,
        categories: formData.categories ?? [],
        maxVolunteers: formData.maxVolunteers,

        placeName: formData.activityType === ActivityType.IN_PERSON ? formData.placeName?.trim() || null : null,
        city: formData.activityType === ActivityType.IN_PERSON ? formData.city || null : null,
        latitude: formData.activityType === ActivityType.IN_PERSON ? (formData.latitude ?? null) : null,
        longitude: formData.activityType === ActivityType.IN_PERSON ? (formData.longitude ?? null) : null,
        meetingLink:
          formData.activityType === ActivityType.ONLINE &&
          formData.meetingLinkSource === MeetingLinkSource.MANUAL
            ? formData.meetingLink?.trim() || null
            : null,
        meetingPlatform:
          formData.activityType === ActivityType.ONLINE
            ? formData.meetingLinkSource === MeetingLinkSource.GOOGLE_MEET_AUTO
              ? MeetingPlatform.GOOGLE_MEET
              : formData.meetingPlatform || null
            : null,
        meetingLinkSource:
          formData.activityType === ActivityType.ONLINE
            ? (formData.meetingLinkSource as MeetingLinkSource) || MeetingLinkSource.MANUAL
            : undefined,
        primaryPresenterId:
          formData.activityType === ActivityType.ONLINE
            ? formData.primaryPresenterId?.trim() || null
            : null
      };

      try {
        const success =
          mode === "create"
            ? await create(payload as CreateActivityRequest)
            : await update(formData.id, payload as UpdateActivityRequest);

        if (success) {
          showToast(mode === "create" ? "تم الإنشاء" : "تم التحديث", "success");
          setShowModal(false);
        }
      } catch (err) {
        showToast(err instanceof Error ? err.message : "حدث خطأ", "error");
      }
    },
    [mode, create, update, showToast, validate]
  );

  const handleDelete = useCallback(
    async (activity: ActivityDto) => {
      const ok = await confirm({
        title: "حذف الفرصة",
        message: `هل تريد حذف "${activity.title}"؟`,
        confirmText: "حذف",
        cancelText: "إلغاء",
        variant: "danger"
      });
      if (ok && (await remove(activity.id))) showToast("تم الحذف", "success");
    },
    [confirm, remove, showToast]
  );

  const handleCancelActivity = useCallback(
    async (activity: ActivityDto) => {
      if (activity.status === ActivityStatus.CANCELLED) return;
      const ok = await confirm({
        title: "إلغاء الفرصة",
        message: `هل تريد إلغاء "${activity.title}"؟ يمكنك استعادتها لاحقاً.`,
        confirmText: "إلغاء الفرصة",
        cancelText: "رجوع",
        variant: "danger"
      });
      if (ok && (await cancel(activity.id))) showToast("تم الإلغاء", "success");
    },
    [confirm, cancel, showToast]
  );

  const handleRestore = useCallback(
    async (activity: ActivityDto) => {
      if (activity.status !== ActivityStatus.CANCELLED) return;
      const ok = await confirm({
        title: "استعادة الفرصة",
        message: `هل تريد استعادة "${activity.title}" كمسودة؟`,
        confirmText: "استعادة",
        cancelText: "إلغاء",
        variant: "primary"
      });
      if (ok && (await restore(activity.id))) showToast("تم الاستعادة كمسودة", "success");
    },
    [confirm, restore, showToast]
  );

  const handleComplete = useCallback(
    async (activity: ActivityDto) => {
      if (activity.status !== ActivityStatus.PUBLISHED) return;
      const ok = await confirm({
        title: "إكمال النشاط",
        message: `هل تريد إكمال "${activity.title}"؟ تأكد من تسجيل حضور جميع المتطوعين أولاً.`,
        confirmText: "إكمال",
        cancelText: "إلغاء",
        variant: "primary"
      });
      if (ok && (await complete(activity.id))) showToast("تم إكمال النشاط بنجاح", "success");
    },
    [confirm, complete, showToast]
  );

  const handleViewVolunteers = useCallback((activity: ActivityDto) => {
    setSelectedActivity(activity);
    setShowVolunteersModal(true);
  }, []);

  const completeActivity = useCallback(
    async (id: string): Promise<boolean> => {
      const success = await complete(id);
      if (success) showToast("تم إكمال النشاط بنجاح", "success");
      return success ?? false;
    },
    [complete, showToast]
  );

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
    confirmDialog,
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
    handleComplete,
    handleViewVolunteers,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    appliedSearch,
    completeActivity
  };
};
