"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Upload, Edit2, Eye, EyeOff, Trash2, FileImage } from "lucide-react";
import styles from "./FeaturedPostsPage.module.scss";
import { ROUTES, type FeaturedPostDto } from "@/lib";
import { useConfirmDialog, useFeaturedPosts, useToast } from "@/presentation/hooks";
import { FeaturedPostCard, ToastContainer, Modal, LoadingState, EmptyState } from "@/presentation/components";
import { processImageForUpload, revokeImagePreview } from "@/lib";

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

const FeaturedPostsPage = () => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { confirm, ConfirmDialog } = useConfirmDialog();

  const { list, isLoading, isSubmitting, isUploading, error, uploadImage, create, update, remove } = useFeaturedPosts();
  const role = session?.user?.role ?? "VOLUNTEER";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (role !== "ADMIN") {
      router.replace(ROUTES.VOLUNTEER.PROFILE);
    }
  }, [status, role, router]);

  useEffect(() => {
    if (error && error.trim()) {
      console.error("Error detected:", error);
      showToast(error, "error");
    }
  }, [error, showToast]);

  useEffect(() => {
    return () => {
      if (preview) revokeImagePreview(preview);
    };
  }, [preview]);

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

      console.log("📤 Uploading file:", file.name);

      const result = await processImageForUpload(file, { maxSizeMB: 5, quality: 0.85 });
      if (result.error) {
        showToast(result.error, "error");
        return;
      }

      if (preview) revokeImagePreview(preview);
      setPreview(result.previewUrl);

      const uploaded = await uploadImage(result.file);
      if (uploaded) {
        setForm((prev) => ({ ...prev, imageUrl: uploaded }));
        showToast("تم رفع الصورة بنجاح ", "success");
        console.log("✅ Image uploaded:", uploaded);
      } else {
        showToast("فشل رفع الصورة", "error");
      }
    },
    [uploadImage, showToast, preview]
  );

  const handleSubmit = useCallback(async () => {
    console.log("🚀 Submitting form:", { mode, form });

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
      isActive: form.isActive
    };

    console.log("📦 Payload:", payload);

    try {
      let success = false;

      if (mode === "create") {
        success = await create(payload);
      } else if (form.id) {
        success = await update(form.id, payload);
      }

      if (success) {
        showToast(mode === "create" ? "تم الإنشاء بنجاح" : "تم التحديث بنجاح", "success");
        resetForm();
      } else {
        showToast(mode === "create" ? "فشل الإنشاء" : "فشل التحديث", "error");
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      showToast(err instanceof Error ? err.message : "حدث خطأ", "error");
    }
  }, [mode, form, create, update, resetForm, showToast]);

  const handleToggle = useCallback(
    async (post: FeaturedPostDto) => {
      const success = await update(post.id, { ...post, isActive: !post.isActive });
      if (success) {
        showToast(post.isActive ? "تم الإخفاء" : "تم التفعيل", "success");
      }
    },
    [update, showToast]
  );

  const handleDelete = useCallback(
    async (post: FeaturedPostDto) => {
      const ok = await confirm({
        title: "تأكيد الحذف",
        message: `هل تريد حذف "${post.title}"؟`,
        confirmText: "حذف",
        cancelText: "إلغاء",
        variant: "danger",
      });

      if (!ok) return;

      const success = await remove(post.id);
      if (success) {
        showToast("تم الحذف بنجاح ", "success");
        if (form.id === post.id) resetForm();
      }
    },
    [confirm, form.id, remove, resetForm, showToast]
  );


  if (status === "loading") return <LoadingState message="جاري التحميل..." />;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.header}>
        <h1 className={styles.title}>المنشورات</h1>
        <button
          className={styles.btnCreate}
          onClick={openCreate}
          disabled={isSubmitting}
        >
          <Plus size={18} />
          إضافة منشور جديد
        </button>
      </div>

      {isLoading ? (
        <div className={styles.grid}>
          <LoadingState variant="skeleton" count={6} />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon={FileImage}
          message="لا توجد منشورات"
          action={{ label: "إضافة منشور", onClick: openCreate }}
        />
      ) : (
        <div className={styles.grid}>
          {list.map((post) => (
            <FeaturedPostCard
              key={post.id}
              imageUrl={post.imageUrl}
              title={post.title}
              description={post.description}
              meta={
                <span className={`${styles.badge} ${post.isActive ? styles.active : styles.inactive}`}>
                  {post.isActive ? "نشط" : "مخفي"}
                </span>
              }
              actions={
                <div className={styles.actions}>
                  <button
                    className={styles.btn}
                    onClick={() => openEdit(post)}
                    disabled={isSubmitting}
                    title="تعديل"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className={styles.btn}
                    onClick={() => handleToggle(post)}
                    disabled={isSubmitting}
                    title={post.isActive ? "إخفاء" : "تفعيل"}
                  >
                    {post.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button
                    className={styles.btnDanger}
                    onClick={() => handleDelete(post)}
                    disabled={isSubmitting}
                    title="حذف"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={resetForm}
        title={mode === "create" ? "إضافة منشور" : "تعديل المنشور"}
        size="lg"
      >
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>العنوان *</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="عنوان المنشور"
              disabled={isSubmitting || isUploading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الوصف *</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="وصف المنشور"
              rows={4}
              disabled={isSubmitting || isUploading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الصورة *</label>
            {(preview || form.imageUrl) && (
              <div className={styles.preview}>
                <Image
                  src={preview || form.imageUrl}
                  alt="Preview"
                  fill
                  className={styles.previewImg}
                />
              </div>
            )}
            <label className={styles.btnUpload}>
              <Upload size={16} />
              {isUploading ? "جاري الرفع..." : "رفع صورة"}
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                disabled={isSubmitting || isUploading}
              />
            </label>
          </div>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              disabled={isSubmitting || isUploading}
            />
            <span className={styles.slider} />
            <span>نشط</span>
          </label>

          <div className={styles.actions}>
            <button
              className={styles.btnCancel}
              onClick={resetForm}
              disabled={isSubmitting || isUploading}
            >
              إلغاء
            </button>
            <button
              className={styles.btnSubmit}
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading || !form.imageUrl}
            >
              {isSubmitting ? "جاري الحفظ..." : mode === "create" ? "إنشاء" : "حفظ التعديلات"}
            </button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog />
    </div>
  );
};

export default FeaturedPostsPage;