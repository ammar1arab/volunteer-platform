"use client";

import { useCallback, useEffect, useState } from "react";

import { UserRole } from "@/core/domain/enums";
import {
  processImageForUpload,
  revokeImagePreview,
  type FeaturedPostDto,
} from "@/lib";
import {
  useFeaturedPosts,
  useToast,
  usePagination,
  useAuth,
} from "@/presentation/hooks";

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
}

const EMPTY_FORM: FormState = {
  id: "",
  imageUrl: "",
  title: "",
  description: "",
  isActive: true,
};

export const useFeaturedPostsPage = () => {
  const { status } = useAuth({ requireRole: UserRole.ADMIN });
  const { toasts, showToast, removeToast } = useToast();

  const {
    list,
    isLoading,
    isSubmitting,
    isUploading,
    error,
    uploadImage,
    create,
    update,
    remove,
  } = useFeaturedPosts();

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions>({message: "",});


  const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

  const pagination = usePagination({
    totalItems: list.length,
    itemsPerPage: 20,
  });

  const paginatedList = pagination.paginateItems(list);

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
    [preview],
  );

  const handleFileChange = useCallback(
    async (file: File | null) => {
      if (!file) return;

      const result = await processImageForUpload(file, {
        maxSizeMB: 5,
        quality: 0.85,
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
    [uploadImage, showToast, preview],
  );

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) {
      showToast("يرجى إدخال العنوان", "warning");
      return;
    }

    if (!form.description.trim()) {
      showToast("يرجى إدخال الوصف", "warning");
      return;
    }

    if (!form.imageUrl) {
      showToast("يرجى رفع صورة", "warning");
      return;
    }

    const payload = {
      imageUrl: form.imageUrl,
      title: form.title,
      description: form.description,
      isActive: form.isActive,
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
      const success = await update(post.id, {
        ...post,
        isActive: !post.isActive,
      });
      if (success) {
        showToast(post.isActive ? "تم الإخفاء" : "تم التفعيل", "success");
      }
    },
    [update, showToast],
  );

  const handleDelete = useCallback(
    async (post: FeaturedPostDto) => {
      const ok = await confirm({
        title: "حذف المنشور",
        message: `هل تريد حذف "${post.title}"؟`,
        confirmText: "حذف",
        cancelText: "إلغاء",
        variant: "danger",
      });

      if (!ok) return;

      const success = await remove(post.id);
      if (success) {
        showToast("تم الحذف", "success");
        if (form.id === post.id) resetForm();
      }
    },
    [confirm, form.id, remove, resetForm, showToast],
  );

  return {
    status,
    isLoading,
    isSubmitting,
    isUploading,
    mode,
    form,
    preview,
    showModal,
    paginatedList,
    pagination,
    toasts,
    removeToast,
    confirmDialog: {
      isOpen: isConfirmOpen,
      options: confirmOptions,
      handleConfirm: handleConfirmDialog,
      handleCancel: handleCancelDialog,
    },
    setForm,
    setShowModal,
    resetForm,
    openCreate,
    openEdit,
    handleFileChange,
    handleSubmit,
    handleToggle,
    handleDelete,
  };
};