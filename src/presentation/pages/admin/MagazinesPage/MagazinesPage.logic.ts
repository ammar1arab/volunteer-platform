"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserRole } from "@/core/domain/enums";
import { useMonthlyMagazines, useToast, useAuth } from "@/presentation/hooks";
import { MonthlyMagazineDto } from "@/core/application/dtos";
import { processPdfForUpload } from "@/lib/utils";
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
  title: string;
  pdfUrl: string;
  month: string;
  year: string;
  isActive: boolean;
}

const currentMonthYear = () => {
  const now = new Date();
  return { month: String(now.getMonth() + 1), year: String(now.getFullYear()) };
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
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.magazines.currentPage",
    1
  );
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({ message: "" });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.admin.magazines.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearch] = useSessionStorageState(
    "filters.admin.magazines.appliedSearch",
    ""
  );
  const [activeYear, setActiveYear] = useSessionStorageState(
    "filters.admin.magazines.activeYear",
    "all"
  );

  const filteredList = useMemo(() => {
    if (!appliedSearch.trim()) return list;
    const q = appliedSearch.toLowerCase();
    return list.filter((m) => m.title.toLowerCase().includes(q));
  }, [list, appliedSearch]);

  const yearFilterOptions = useMemo(() => {
    const years = [...new Set(list.map(m => String(new Date(m.monthYear).getFullYear())))]
      .sort((a, b) => Number(b) - Number(a));
    return [{ key: "all", label: "الجميع" }, ...years.map(y => ({ key: y, label: y }))];
  }, [list]);

  const filteredByYear = useMemo(() => {
    if (activeYear === "all") return filteredList;
    return filteredList.filter(m => String(new Date(m.monthYear).getFullYear()) === activeYear);
  }, [filteredList, activeYear]);

  const paginatedList = useMemo(() => {
    if (!Array.isArray(filteredByYear)) return [];
    return filteredByYear.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredByYear, currentPage]);

  useEffect(() => {
    if (error && error.trim()) showToast(error, "error");
  }, [error, showToast]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedSearch, activeYear]);

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

  const handlePdfUpload = useCallback(async (file: File | null) => {
    if (!file) return;
    const { error: validationError } = processPdfForUpload(file, { maxSizeMB: 50 });
    if (validationError) { showToast(validationError, "error"); return; }
    const uploaded = await uploadPdf(file);
    if (uploaded) {
      setForm((prev) => ({ ...prev, pdfUrl: uploaded }));
      showToast("تم رفع الملف بنجاح", "success");
    } else {
      showToast("فشل رفع الملف", "error");
    }
  }, [uploadPdf, showToast]);

  const handleSubmit = useCallback(async () => {
    const payload = {
      title: form.title.trim(),
      pdfUrl: form.pdfUrl,
      monthYear: new Date(`${form.year}-${form.month.padStart(2, "0")}-01`),
      isActive: form.isActive
    };
    try {
      const success = mode === "create" ? await create(payload) : form.id ? await update(form.id, payload) : false;
      if (success) {
        showToast(mode === "create" ? "تم إنشاء المجلة" : "تم تحديث المجلة", "success");
        resetForm();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "حدث خطأ", "error");
    }
  }, [mode, form, create, update, resetForm, showToast]);

  const handleToggle = useCallback(async (magazine: MonthlyMagazineDto) => {
    const success = await update(magazine.id, {
      title: magazine.title,
      pdfUrl: magazine.pdfUrl,
      monthYear: new Date(magazine.monthYear),
      isActive: !magazine.isActive
    });
    if (success) showToast(magazine.isActive ? "تم الإخفاء" : "تم التفعيل", "success");
  }, [update, showToast]);

  const handleDelete = useCallback(async (magazine: MonthlyMagazineDto) => {
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
  }, [confirm, form.id, remove, resetForm, showToast]);

  return {
    status, isLoading: loading, isSubmitting: submitting, isUploading: uploading,
    mode, form, showModal, list, paginatedList, filteredByYear, currentPage,
    itemsPerPage: ITEMS_PER_PAGE, toasts, removeToast,
    confirmDialog: { isOpen: isConfirmOpen, options: confirmOptions, handleConfirm: handleConfirmDialog, handleCancel: handleCancelDialog },
    activeYear, setActiveYear, yearFilterOptions,
    setForm, setCurrentPage, resetForm, openCreate, openEdit,
    handlePdfUpload, handleSubmit, handleToggle, handleDelete,
    searchQuery, setSearchQuery, setAppliedSearch
  };
};