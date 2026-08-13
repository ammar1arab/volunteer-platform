"use client";

import { useCallback, useMemo, useState } from "react";
import { DomainFeaturedPostCategory, UserRole } from "@/core/domain/enums";

import { useFeaturedPosts, useToast, useAuth, useConfirmDialog, usePageReset } from "@/presentation/hooks";
import { FeaturedPostDto } from "@/core/application/dtos";
import { normalizeWhitespace, processImageForUpload, revokeImagePreview } from "@/lib/utils";
import { CATEGORY_OPTIONS, MONTH_LABELS } from "@/presentation/constants";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

interface FormState {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  isActive: boolean;
  categories: DomainFeaturedPostCategory[];
  day: string;
  month: string;
  year: string;
}

const now = new Date();
const EMPTY_FORM: FormState = {
  id: "",
  imageUrl: "",
  title: "",
  description: "",
  isActive: true,
  categories: [DomainFeaturedPostCategory.EDUCATION],
  day: String(now.getDate()).padStart(2, "0"),
  month: String(now.getMonth() + 1).padStart(2, "0"),
  year: String(now.getFullYear())
};

export const useFeaturedPostsPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  const { list, loading, submitting, uploading, uploadImage, create, update, remove } = useFeaturedPosts();

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.admin.featuredPosts.currentPage",
    1
  );
  const [activeCategory, setActiveCategoryState] = useSessionStorageState(
    "filters.admin.featuredPosts.activeCategory",
    "all"
  );
  const { confirm, confirmDialog } = useConfirmDialog();
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.admin.featuredPosts.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearchState] = useSessionStorageState(
    "filters.admin.featuredPosts.appliedSearch",
    ""
  );
  const setActiveCategory = usePageReset(setActiveCategoryState, setCurrentPage);
  const setAppliedSearch = usePageReset(setAppliedSearchState, setCurrentPage);

  const filteredList = useMemo(() => {
    let result =
      activeCategory === "all"
        ? list
        : list.filter((post) => post.categories.includes(activeCategory as DomainFeaturedPostCategory));
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (post) => post.title.toLowerCase().includes(q) || post.description.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });
  }, [list, activeCategory, appliedSearch]);

  const paginatedList = useMemo(() => {
    if (!Array.isArray(filteredList)) return [];
    return filteredList
      .map((post) => ({
        ...post,
        categories:
          Array.isArray(post.categories) && post.categories.length
            ? post.categories
            : [DomainFeaturedPostCategory.EDUCATION]
      }))
      .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  }, [filteredList, currentPage]);

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

  const openEdit = useCallback(
    (post: FeaturedPostDto) => {
      if (preview) revokeImagePreview(preview);
      const date = new Date(post.publishedAt);

      setMode("edit");
      setPreview("");
      setShowModal(true);
      setForm({
        ...post,
        day: String(date.getDate()).padStart(2, "0"),
        month: String(date.getMonth() + 1).padStart(2, "0"),
        year: String(date.getFullYear())
      });
    },
    [preview]
  );
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
      title: normalizeWhitespace(form.title),
      description: form.description.trim(),
      isActive: form.isActive,
      categories: form.categories,
      publishedAt: new Date(Number(form.year), Number(form.month) - 1, Number(form.day))
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

  const handleToggle = useCallback(
    async (post: FeaturedPostDto) => {
      const payload = {
        imageUrl: post.imageUrl,
        title: post.title,
        description: post.description,
        categories: post.categories,
        isActive: !post.isActive,
        publishedAt: new Date(post.publishedAt)
      };

      const success = await update(post.id, payload);
      if (success) {
        showToast(post.isActive ? "تم الإخفاء" : "تم التفعيل", "success");
      }
    },
    [update, showToast]
  );

  const handleDelete = useCallback(
    async (post: FeaturedPostDto) => {
      const ok = await confirm({
        title: "حذف المنشور",
        message: `هل تريد حذف "${post.title}"؟`,
        confirmText: "حذف",
        cancelText: "إلغاء",
        variant: "danger"
      });
      if (!ok) return;
      if (await remove(post.id)) {
        showToast("تم الحذف", "success");
        if (form.id === post.id) resetForm();
      }
    },
    [confirm, form.id, remove, resetForm, showToast]
  );

  const dayOptions = Array.from({ length: 31 }, (_, i) => {
    const d = String(i + 1).padStart(2, "0");
    return { value: d, label: d };
  });
  const monthOptions = Object.entries(MONTH_LABELS).map(([value, label]) => ({ value, label }));
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = String(new Date().getFullYear() - 2 + i);
    return { value: y, label: y };
  });

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
    activeCategory,
    setActiveCategory,
    categoryOptions: CATEGORY_OPTIONS,
    toasts,
    removeToast,
    confirmDialog,
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
    setAppliedSearch,
    yearOptions,
    dayOptions,
    monthOptions
  };
};
