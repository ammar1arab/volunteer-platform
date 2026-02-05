"use client";
import styles from "./FeaturedPostsPage.module.scss";
import { useFeaturedPostsPage } from "./FeaturedPostsPage.logic";
import Image from "next/image";
import { FeaturedPostCard, ToastContainer, Modal, LoadingState, EmptyState, Pagination, ConfirmDialog } from "@/presentation/components";
import { Plus, Upload, Edit2, Eye, EyeOff, Trash2, FileImage } from "lucide-react";

const FeaturedPostsPage = () => {
  const {
    status,
    isLoading,
    isSubmitting,
    isUploading,
    mode,
    form,
    preview,
    showModal,
    list,
    paginatedList,
    currentPage,
    itemsPerPage,
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
  } = useFeaturedPostsPage();

  if (status === "loading") return <LoadingState />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <h1 className={styles.title}>المنشورات</h1>
        <div className={styles.actions}>
          <button className={styles.btnCreate} onClick={openCreate} disabled={isSubmitting}>
            <Plus size={18} />
            إضافة منشور جديد
          </button>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <EmptyState icon={FileImage} message="لا توجد منشورات" action={{ label: "إضافة منشور", onClick: openCreate }} />
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedList.map((post) => (
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
                  <div className={styles.cardActions}>
                    <button className={styles.btn} onClick={() => openEdit(post)} disabled={isSubmitting}>
                      <Edit2 size={14} />
                    </button>
                    <button className={styles.btn} onClick={() => handleToggle(post)} disabled={isSubmitting}>
                      {post.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button className={styles.btnDanger} onClick={() => handleDelete(post)} disabled={isSubmitting}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                }
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={list.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            sticky
          />
        </>
      )}

      <Modal isOpen={showModal} onClose={resetForm} title={mode === "create" ? "إضافة منشور" : "تعديل المنشور"} size="lg">
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
                <Image src={preview || form.imageUrl} alt="Preview" fill className={styles.previewImg} />
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
            <button className={styles.btnCancel} onClick={resetForm} disabled={isSubmitting || isUploading}>
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleCancel}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
      />
    </>
  );
};

export default FeaturedPostsPage;