"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Plus,
  Upload,
  Edit2,
  Trash2,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Send,
  Ban,
  Filter,
  MapPinned,
  UsersIcon,
  RotateCcw,
} from "lucide-react";

import styles from "./ActivitiesPage.module.scss";
import {
  ROUTES,
  processImageForUpload,
  revokeImagePreview,
  type ActivityDto,
} from "@/lib";
import { useActivities, useConfirmDialog, useToast, usePagination } from "@/presentation/hooks";
import { Modal, LoadingState, EmptyState, ToastContainer, ActivityCard, Pagination, VolunteersModal } from "@/presentation/components";
import type { CreateActivityRequest, UpdateActivityRequest } from "@/core/application/dtos";
import { DayOfWeek } from "@/core/domain/enums";

type FormData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  targetAudience: string;
  maxVolunteers: number;
};

const EMPTY_FORM: FormData = {
  id: "",
  title: "",
  description: "",
  imageUrl: "",
  dayOfWeek: "MONDAY",
  date: "",
  startTime: "",
  endTime: "",
  placeName: "",
  address: "",
  latitude: 31.9454,
  longitude: 35.9284,
  targetAudience: "",
  maxVolunteers: 20,
};

const DAYS = [
  { value: "SUNDAY", label: "الأحد" },
  { value: "MONDAY", label: "الإثنين" },
  { value: "TUESDAY", label: "الثلاثاء" },
  { value: "WEDNESDAY", label: "الأربعاء" },
  { value: "THURSDAY", label: "الخميس" },
  { value: "FRIDAY", label: "الجمعة" },
  { value: "SATURDAY", label: "السبت" },
];

const FILTERS = [
  { key: "all", label: "الكل", color: null },
  { key: "DRAFT", label: "مسودة", color: "#3b82f6" },
  { key: "PUBLISHED", label: "منشور", color: "#10b981" },
  { key: "CANCELLED", label: "ملغي", color: "#ef4444" },
];

const STATUS_MAP = {
  DRAFT: { label: "مسودة", class: "draft", color: "#3b82f6" },
  PUBLISHED: { label: "منشور", class: "published", color: "#10b981" },
  CANCELLED: { label: "ملغي", class: "cancelled", color: "#ef4444" },
};

const ActivitiesPage = () => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const { list, loading, submitting, uploadImage, create, update, remove, publish, cancel, restore } =
    useActivities({ filter: "all" });

  const [activeFilter, setActiveFilter] = useState("all");
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDto | null>(null);

  const role = session?.user?.role ?? "VOLUNTEER";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.LOGIN);
    if (role !== "ADMIN") router.replace(ROUTES.VOLUNTEER.PROFILE);
  }, [status, role, router]);

  useEffect(() => {
    return () => {
      if (preview) revokeImagePreview(preview);
    };
  }, [preview]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return list;
    return list.filter((a) => a.status === activeFilter);
  }, [list, activeFilter]);

  // Pagination
  const pagination = usePagination({
    totalItems: filtered.length,
    itemsPerPage: 20,
  });

  const paginatedActivities = pagination.paginateItems(filtered);

  // Reset to page 1 when filter changes
  useEffect(() => {
    pagination.resetPage();
  }, [activeFilter]);

  const reset = useCallback(() => {
    setMode("create");
    setForm(EMPTY_FORM);
    setPreview("");
    setShowModal(false);
    setUseCustomLocation(false);
  }, []);

  const handleEdit = useCallback((activity: ActivityDto) => {
    if (activity.status !== "DRAFT") {
      showToast("فقط المسودات يمكن تعديلها", "warning");
      return;
    }

    setMode("edit");
    setForm({
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

  const handleImage = useCallback(async (file: File | null) => {
    if (!file) return;

    const result = await processImageForUpload(file, { maxSizeMB: 5, quality: 0.85 });
    if (result.error) {
      showToast(result.error, "error");
      return;
    }

    if (preview) revokeImagePreview(preview);
    setPreview(result.previewUrl);

    setUploading(true);
    const url = await uploadImage(result.file);
    setUploading(false);

    if (url) {
      setForm((p) => ({ ...p, imageUrl: url }));
      showToast("تم رفع الصورة", "success");
    }
  }, [preview, uploadImage, showToast]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast("المتصفح لا يدعم تحديد الموقع", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        showToast("تم تحديد موقعك", "success");
      },
      () => showToast("فشل تحديد الموقع", "error")
    );
  }, [showToast]);

  const validate = useCallback(() => {
    if (!form.title.trim()) return "العنوان مطلوب";
    if (!form.description.trim()) return "الوصف مطلوب";
    if (!form.imageUrl) return "الصورة مطلوبة";
    if (!form.placeName.trim()) return "اسم المكان مطلوب";
    if (!form.address.trim()) return "العنوان مطلوب";
    if (!form.date) return "التاريخ مطلوب";
    if (!form.startTime || !form.endTime) return "الوقت مطلوب";
    if (form.startTime >= form.endTime) return "وقت البداية يجب أن يسبق النهاية";
    if (!form.targetAudience.trim()) return "الفئة المستهدفة مطلوبة";
    if (form.maxVolunteers < 1) return "العدد الأقصى يجب أن يكون 1 أو أكثر";
    return null;
  }, [form]);

  const handleSubmit = useCallback(async () => {
    const error = validate();
    if (error) {
      showToast(error, "warning");
      return;
    }

    const payload: CreateActivityRequest | UpdateActivityRequest = {
      title: form.title.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl,
      dayOfWeek: form.dayOfWeek as DayOfWeek,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      placeName: form.placeName.trim(),
      location: {
        address: form.address.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
      },
      targetAudience: form.targetAudience.trim(),
      maxVolunteers: form.maxVolunteers,
    };

    try {
      const success = mode === "create"
        ? await create(payload as CreateActivityRequest)
        : await update(form.id, payload as UpdateActivityRequest);

      if (success) {
        showToast(mode === "create" ? "تم الإنشاء" : "تم التحديث", "success");
        reset();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "حدث خطأ", "error");
    }
  }, [mode, form, create, update, reset, showToast, validate]);

  const handleDelete = useCallback(async (activity: ActivityDto) => {
    const ok = await confirm({
      title: "حذف النشاط",
      message: `هل تريد حذف "${activity.title}"؟`,
      confirmText: "حذف",
      cancelText: "إلغاء",
      variant: "danger",
    });

    if (ok && await remove(activity.id)) {
      showToast("تم الحذف", "success");
    }
  }, [confirm, remove, showToast]);

  const handlePublish = useCallback(async (activity: ActivityDto) => {
    if (activity.status !== "DRAFT") return;
    if (await publish(activity.id)) {
      showToast("تم النشر", "success");
    }
  }, [publish, showToast]);

  const handleCancel = useCallback(async (activity: ActivityDto) => {
    if (activity.status === "CANCELLED") return;

    const ok = await confirm({
      title: "إلغاء النشاط",
      message: `هل تريد إلغاء "${activity.title}"؟ يمكنك استعادته لاحقاً.`,
      confirmText: "إلغاء النشاط",
      cancelText: "رجوع",
      variant: "danger",
    });

    if (ok && await cancel(activity.id)) {
      showToast("تم الإلغاء", "success");
    }
  }, [confirm, cancel, showToast]);

  const handleRestore = useCallback(async (activity: ActivityDto) => {
    if (activity.status !== "CANCELLED") return;

    const ok = await confirm({
      title: "استعادة النشاط",
      message: `هل تريد استعادة "${activity.title}" كمسودة؟`,
      confirmText: "استعادة",
      cancelText: "إلغاء",
      variant: "primary",
    });

    if (ok && await restore(activity.id)) {
      showToast("تم الاستعادة كمسودة", "success");
    }
  }, [confirm, restore, showToast]);

  const handleViewVolunteers = useCallback((activity: ActivityDto) => {
    setSelectedActivity(activity);
    setShowVolunteersModal(true);
  }, []);


  if (status === "loading") return <LoadingState message="جاري التحميل..." />;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>الأنشطة التطوعية</h1>
        </div>
        <button className={styles.btnCreate} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          نشاط جديد
        </button>
      </header>

      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${activeFilter === f.key ? styles.active : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.grid}>
          <LoadingState variant="skeleton" count={6} />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          message="لا توجد أنشطة"
          action={{ label: "إضافة نشاط", onClick: () => setShowModal(true) }}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedActivities.map((activity) => {
              const statusInfo = STATUS_MAP[activity.status as keyof typeof STATUS_MAP];

              return (
                <ActivityCard
                  key={activity.id}
                  imageUrl={activity.imageUrl}
                  title={activity.title}
                  description={activity.description}
                  meta={
                    <>
                      <div className={styles.metaRow}>
                        <span className={`${styles.status} ${styles[statusInfo.class]}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className={styles.metaRow}>
                        <CalendarDays size={14} />
                        <span>{new Date(activity.date).toISOString().slice(0, 10)}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <Clock size={14} />
                        <span>{activity.startTime} - {activity.endTime}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <MapPin size={14} />
                        <span>{activity.placeName}</span>
                      </div>
                      <div className={styles.metaRow}>
                        <Users size={14} />
                        <span>{activity.currentVolunteers}/{activity.maxVolunteers}</span>
                      </div>
                    </>
                  }
                  actions={
                    <>
                      {activity.status === "DRAFT" && (
                        <>
                          <button className={styles.btn} onClick={() => handleEdit(activity)} title="تعديل">
                            <Edit2 size={14} />
                          </button>
                          <button className={styles.btnSuccess} onClick={() => handlePublish(activity)} title="نشر">
                            <Send size={14} />
                          </button>
                        </>
                      )}

                      {activity.status === "PUBLISHED" && activity.currentVolunteers > 0 && (
                        <button
                          className={styles.btnInfo}
                          onClick={() => handleViewVolunteers(activity)}
                          title={`المتطوعون (${activity.currentVolunteers})`}
                        >
                          <UsersIcon size={14} />
                          <span className={styles.badgeCount}>{activity.currentVolunteers}</span>
                        </button>
                      )}

                      {activity.status === "CANCELLED" ? (
                        <button className={styles.btnRestore} onClick={() => handleRestore(activity)} title="استعادة">
                          <RotateCcw size={14} />
                        </button>
                      ) : (
                        <button className={styles.btnWarning} onClick={() => handleCancel(activity)} title="إلغاء">
                          <Ban size={14} />
                        </button>
                      )}

                      <button className={styles.btnDanger} onClick={() => handleDelete(activity)} title="حذف">
                        <Trash2 size={14} />
                      </button>
                    </>
                  }
                />
              );
            })}
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            onPageChange={pagination.goToPage}
            onPrevious={pagination.goToPrevious}
            onNext={pagination.goToNext}
            onFirst={pagination.goToFirst}
            onLast={pagination.goToLast}
            canGoPrevious={pagination.canGoPrevious}
            canGoNext={pagination.canGoNext}
            showInfo={true}
            startIndex={pagination.startIndex}
            endIndex={pagination.endIndex}
            totalItems={filtered.length}
          />
        </>
      )}

      <Modal
        isOpen={showModal}
        onClose={reset}
        title={mode === "create" ? "نشاط جديد" : "تعديل النشاط"}
        size="lg"
      >
        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>العنوان</label>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>الفئة المستهدفة</label>
              <input
                className={styles.input}
                value={form.targetAudience}
                onChange={(e) => setForm((p) => ({ ...p, targetAudience: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الوصف</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>اليوم</label>
              <select
                className={styles.input}
                value={form.dayOfWeek}
                onChange={(e) => setForm((p) => ({ ...p, dayOfWeek: e.target.value }))}
              >
                {DAYS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>التاريخ</label>
              <input
                className={styles.input}
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>العدد الأقصى</label>
              <input
                className={styles.input}
                type="number"
                min={1}
                value={form.maxVolunteers}
                onChange={(e) => setForm((p) => ({ ...p, maxVolunteers: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>وقت البداية</label>
              <input
                className={styles.input}
                type="time"
                value={form.startTime}
                onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>وقت النهاية</label>
              <input
                className={styles.input}
                type="time"
                value={form.endTime}
                onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>اسم المكان</label>
              <input
                className={styles.input}
                value={form.placeName}
                onChange={(e) => setForm((p) => ({ ...p, placeName: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>العنوان</label>
              <input
                className={styles.input}
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.location}>
            <div className={styles.locationHeader}>
              <label className={styles.label}>الموقع</label>
              <div className={styles.locationActions}>
                <button
                  type="button"
                  className={styles.btnLocation}
                  onClick={detectLocation}
                >
                  <MapPinned size={14} />
                  موقعي الحالي
                </button>
                <button
                  type="button"
                  className={styles.btnToggle}
                  onClick={() => setUseCustomLocation(!useCustomLocation)}
                >
                  {useCustomLocation ? "إخفاء الإحداثيات" : "إدخال يدوي"}
                </button>
              </div>
            </div>

            {useCustomLocation && (
              <div className={styles.coords}>
                <div className={styles.field}>
                  <label className={styles.labelSmall}>Latitude</label>
                  <input
                    className={styles.input}
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(e) => setForm((p) => ({ ...p, latitude: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.labelSmall}>Longitude</label>
                  <input
                    className={styles.input}
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(e) => setForm((p) => ({ ...p, longitude: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الصورة</label>
            {(preview || form.imageUrl) && (
              <div className={styles.preview}>
                <Image src={preview || form.imageUrl} alt="Preview" fill className={styles.previewImg} />
              </div>
            )}
            <label className={styles.btnUpload}>
              <Upload size={16} />
              {uploading ? "جاري الرفع..." : "رفع صورة"}
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.btnCancel} onClick={reset}>
              إلغاء
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={submitting || uploading}>
              {submitting ? "جاري الحفظ..." : mode === "create" ? "إنشاء" : "حفظ"}
            </button>
          </div>
        </form>
      </Modal>

      <VolunteersModal
        activityId={selectedActivity?.id || ""}
        activityTitle={selectedActivity?.title || ""}
        isOpen={showVolunteersModal}
        onClose={() => setShowVolunteersModal(false)}
      />

      <ConfirmDialog />
    </div>

  );
};

export default ActivitiesPage;