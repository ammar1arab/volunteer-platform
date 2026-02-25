"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserRole } from "@/core/domain/enums";
import { useMonthlyMagazines, useToast, useAuth } from "@/presentation/hooks";
import { MonthlyMagazineDto } from "@/core/application/dtos";
import { processPdfForUpload } from "@/lib/utils";

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
};

interface FormState {
  id: string;
  title: string;
  pdfUrl: string;
  month: string;
  year: string;
  isActive: boolean;
}

const currentMonthYear = () => {
  const now = new Date();
  return {
    month: String(now.getMonth() + 1),
    year: String(now.getFullYear())
  };
};

const EMPTY_FORM: FormState = {
  id: "",
  title: "",
  pdfUrl: "",
  month: currentMonthYear().month,
  year: currentMonthYear().year,
  isActive: true
};

export const useMagazinesPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  const { list, loading, submitting, uploading, error, uploadPdf, create, update, remove } = useMonthlyMagazines();

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ message: "" });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const paginatedList = useMemo(() => {
    if (!Array.isArray(list)) return [];
    return list.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [list, currentPage]);

  useEffect(() => {
    if (error && error.trim()) showToast(error, "error");
  }, [error, showToast]);

  // ── Confirm Dialog ──────────────────────────────────────────────────────────

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

  // ── Form ────────────────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setMode("create");
    setForm(EMPTY_FORM);
    setShowModal(false);
  }, []);

  const openCreate = useCallback(() => {
    resetForm();
    setShowModal(true);
  }, [resetForm]);

  const openEdit = useCallback((magazine: MonthlyMagazineDto) => {
    const date = new Date(magazine.monthYear);
    setMode("edit");
    setForm({
      id: magazine.id,
      title: magazine.title,
      pdfUrl: magazine.pdfUrl,
      month: String(date.getMonth() + 1),
      year: String(date.getFullYear()),
      isActive: magazine.isActive
    });
    setShowModal(true);
  }, []);
  // ── PDF Upload ──────────────────────────────────────────────────────────────

  const handlePdfUpload = useCallback(
    async (file: File | null) => {
      if (!file) return;

      const { error: validationError } = processPdfForUpload(file, { maxSizeMB: 50 });
      if (validationError) {
        showToast(validationError, "error");
        return;
      }

      const uploaded = await uploadPdf(file);
      if (uploaded) {
        setForm((prev) => ({ ...prev, pdfUrl: uploaded }));
        showToast("تم رفع الملف بنجاح", "success");
      } else {
        showToast("فشل رفع الملف", "error");
      }
    },
    [uploadPdf, showToast]
  );

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const payload = {
      title: form.title.trim(),
      pdfUrl: form.pdfUrl,
      monthYear: new Date(`${form.year}-${form.month.padStart(2, "0")}-01`),
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
        showToast(mode === "create" ? "تم إنشاء المجلة" : "تم تحديث المجلة", "success");
        resetForm();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "حدث خطأ", "error");
    }
  }, [mode, form, create, update, resetForm, showToast]);

  // ── Toggle ──────────────────────────────────────────────────────────────────

  const handleToggle = useCallback(
    async (magazine: MonthlyMagazineDto) => {
      const success = await update(magazine.id, {
        title: magazine.title,
        pdfUrl: magazine.pdfUrl,
        monthYear: new Date(magazine.monthYear),
        isActive: !magazine.isActive
      });
      if (success) {
        showToast(magazine.isActive ? "تم الإخفاء" : "تم التفعيل", "success");
      }
    },
    [update, showToast]
  );

  // ── Delete ──────────────────────────────────────────────────────────────────

  const handleDelete = useCallback(
    async (magazine: MonthlyMagazineDto) => {
      const ok = await confirm({
        title: "حذف المجلة",
        message: `هل تريد حذف "${magazine.title}"؟`,
        confirmText: "حذف",
        cancelText: "إلغاء",
        variant: "danger"
      });
      if (!ok) return;
      if (await remove(magazine.id)) {
        showToast("تم الحذف", "success");
        if (form.id === magazine.id) resetForm();
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
    showModal,
    list,
    paginatedList,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
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
    handlePdfUpload,
    handleSubmit,
    handleToggle,
    handleDelete
  };
};
