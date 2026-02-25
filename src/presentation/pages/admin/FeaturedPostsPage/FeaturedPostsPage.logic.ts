"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DomainFeaturedPostCategory, UserRole } from "@/core/domain/enums";

import { useFeaturedPosts, useToast, useAuth } from "@/presentation/hooks";
import { FeaturedPostDto } from "@/core/application/dtos";
import { normalizeWhitespace, processImageForUpload, revokeImagePreview } from "@/lib/utils";
import { CATEGORY_OPTIONS } from "@/presentation/constants";

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
  title: string;
  description: string;
  isActive: boolean;
  categories: DomainFeaturedPostCategory[];
}

const EMPTY_FORM: FormState = {
  id: "",
  imageUrl: "",
  title: "",
  description: "",
  isActive: true,
  categories: [DomainFeaturedPostCategory.EDUCATION]
};

export const useFeaturedPostsPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();
  const ITEMS_PER_PAGE = 20;

  const { list, loading, submitting, uploading, error, uploadImage, create, update, remove } = useFeaturedPosts();

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({
    message: ""
  });
  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

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
    return result;
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
  }, [activeCategory, appliedSearch]);

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

  const openEdit = useCallback(
    (post: FeaturedPostDto) => {
      if (preview) revokeImagePreview(preview);
      setMode("edit");
      setForm({ ...post });
      setPreview("");
      setShowModal(true);
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
      categories: form.categories
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
        isActive: !post.isActive
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
