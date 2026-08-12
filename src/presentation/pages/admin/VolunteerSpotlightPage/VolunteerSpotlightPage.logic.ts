"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { JordanianCity, UserRole } from "@/core/domain/enums";
import { useVolunteerSpotlight, useToast, useAuth } from "@/presentation/hooks";
import { VolunteerSpotlightDto } from "@/core/application/dtos";
import { normalizeWhitespace, processImageForUpload, revokeImagePreview } from "@/lib/utils";
import { CITY_OPTIONS } from "@/presentation/constants/labels";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

interface FormState {
  id: string;
  imageUrl: string;
  name: string;
  description: string;
  month: string;
  year: string;
  city: JordanianCity;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  id: "",
  imageUrl: "",
  name: "",
  description: "",
  month: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  city: JordanianCity.AMMAN,
  isActive: true
};

export const useVolunteerSpotlightPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  const { list, loading, submitting, uploading, error, uploadImage, create, update, remove } = useVolunteerSpotlight();

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.volunteerSpotlight.currentPage",
    1
  );
  const [activeCity, setActiveCity] = useSessionStorageState(
    "filters.admin.volunteerSpotlight.activeCity",
    "all"
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({
    message: ""
  });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.admin.volunteerSpotlight.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearch] = useSessionStorageState(
    "filters.admin.volunteerSpotlight.appliedSearch",
    ""
  );

  const filteredList = useMemo(() => {
    let result = activeCity === "all" ? list : list.filter((s) => s.city === activeCity);
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return result;
  }, [list, activeCity, appliedSearch]);

  const paginatedList = useMemo(() => {
    if (!Array.isArray(filteredList)) return [];
    return filteredList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

  useEffect(() => {
    if (error && error.trim()) {
      showToast(error, "error");
    }
  }, [error, showToast]);

  useEffect(() => {
    return () => {
      if (preview) revokeImagePreview(preview);
    };
  }, [preview]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCity, appliedSearch]);

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

  const resetForm = useCallback(() => {
    setMode("create");
    setForm(EMPTY_FORM);
    if (preview) revokeImagePreview(preview);
    setPreview("");
    setShowModal(false);
  }, [preview]);

  const openCreate = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const handleFileChange = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const result = await processImageForUpload(file, {
        maxSizeMB: 5,
        quality: 0.85
      });
      if (result.error) {
        showToast(result.error, "error");
        return;
      }
      if (preview) revokeImagePreview(preview);
      setPreview(result.previewUrl);
      const uploaded = await uploadImage(result.file);
      if (uploaded) {
        setForm((prev) => ({ ...prev, imageUrl: uploaded }));
        showToast("تم رفع الصورة", "success");
      } else {
        showToast("فشل رفع الصورة", "error");
      }
    },
    [uploadImage, showToast, preview]
  );

  const handleSubmit = useCallback(async () => {
    const payload = {
      imageUrl: form.imageUrl,
      name: normalizeWhitespace(form.name),
      description: form.description.trim(),
      // FIXED: Creates date on the 1st of the month, ignoring the day entirely
      spotlightDate: new Date(parseInt(form.year), parseInt(form.month) - 1, 1),
      city: form.city,
      isActive: form.isActive
    };

    try {
      let success = false;
      if (mode === "create") {
        success = await create(payload);
      } else if (form.id) {
        success = await update(form.id, payload);
      }

      if (success) {
        showToast(mode === "create" ? "تم الإنشاء" : "تم التحديث", "success");
        resetForm();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "حدث خطأ", "error");
    }
  }, [mode, form, create, update, resetForm, showToast]);

  // Update this function inside useVolunteerSpotlightPage
  const openEdit = useCallback(
    (spotlight: VolunteerSpotlightDto) => {
      if (preview) revokeImagePreview(preview);
      const date = new Date(spotlight.spotlightDate);
      setMode("edit");
      setForm({
        id: spotlight.id,
        imageUrl: spotlight.imageUrl,
        name: spotlight.name,
        description: spotlight.description,
        month: String(date.getMonth() + 1), // Only Month
        year: String(date.getFullYear()), // Only Year
        city: spotlight.city,
        isActive: spotlight.isActive
      });
      setPreview("");
      setShowModal(true);
    },
    [preview]
  );

  const handleToggle = useCallback(
    async (spotlight: VolunteerSpotlightDto) => {
      const payload = {
        imageUrl: spotlight.imageUrl,
        name: spotlight.name,
        description: spotlight.description,
        spotlightDate: spotlight.spotlightDate,
        city: spotlight.city,
        isActive: !spotlight.isActive
      };

      const success = await update(spotlight.id, payload);
      if (success) {
        showToast(spotlight.isActive ? "تم الإخفاء" : "تم التفعيل", "success");
      }
    },
    [update, showToast]
  );

  const handleDelete = useCallback(
    async (spotlight: VolunteerSpotlightDto) => {
      const ok = await confirm({
        title: "حذف المتطوع",
        message: `هل تريد حذف "${spotlight.name}"؟`,
        confirmText: "حذف",
        cancelText: "إلغاء",
        variant: "danger"
      });
      if (!ok) return;
      if (await remove(spotlight.id)) {
        showToast("تم الحذف", "success");
        if (form.id === spotlight.id) resetForm();
      }
    },
    [confirm, form.id, remove, resetForm, showToast]
  );

  return {
    status,
    isLoading: loading,
    isSubmitting: submitting,
    isUploading: uploading,
    mode,
    form,
    preview,
    showModal,
    list,
    filteredList,
    paginatedList,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    activeCity,
    setActiveCity,
    cityOptions: CITY_OPTIONS,
    toasts,
    removeToast,
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog
    },
    setForm,
    setCurrentPage,
    resetForm,
    openCreate,
    openEdit,
    handleFileChange,
    handleSubmit,
    handleToggle,
    handleDelete,
    searchQuery,
    setSearchQuery,
    setAppliedSearch
  };
};
