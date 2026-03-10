"use client";
import styles from "./FeaturedPostsPage.module.scss";
import { useFeaturedPostsPage } from "./FeaturedPostsPage.logic";
import Image from "next/image";
import { DomainFeaturedPostCategory } from "@/core/domain/enums";
import { AdminFeaturedPostCard, ToastContainer, Modal, LoadingState, EmptyState, Pagination, ConfirmDialog, MultiSelectInput, Dropdown, Search } from "@/presentation/components";
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
    filteredList,
    paginatedList,
    currentPage,
    itemsPerPage,
    activeCategory,
    setActiveCategory,
    categoryOptions,
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
    setAppliedSearch
  } = useFeaturedPostsPage();

  if (status === "loading") return <LoadingState />;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <div className={styles.actions}>
          <Search
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setAppliedSearch}
            placeholder="ابحث عن منشور..."
          />    <div className={styles.actionsEnd}>
            <Dropdown
              items={[
                { key: "all", label: "الجميع" },
                ...categoryOptions.map((cat) => ({ key: cat.value, label: cat.label })),
              ]}
              active={activeCategory}
              onChange={setActiveCategory}
              placeholder="التصنيف"
              compact
            />
            <button className={styles.btnCreate} onClick={openCreate} disabled={isSubmitting}>
              <Plus size={18} />
              إضافة منشور جديد
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : filteredList.length === 0 ? (
        <EmptyState
          icon={FileImage}
          message={activeCategory !== "all" ? "لا توجد منشورات بهذا التصنيف" : "لا توجد منشورات"}
          action={{ label: "إضافة منشور", onClick: openCreate }}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedList.map((post) => (
              <AdminFeaturedPostCard
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
            totalItems={filteredList.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            sticky
          />
        </>
      )}

      <Modal isOpen={showModal} onClose={resetForm} title={mode === "create" ? "إنشاء منشور جديد" : "تعديل المنشور"} size="lg">
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>العنوان</label>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              disabled={isSubmitting || isUploading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>التصنيفات</label>
            <MultiSelectInput
              values={form.categories || []}
              options={categoryOptions}
              onChange={(values) => setForm((p) => ({ ...p, categories: values as DomainFeaturedPostCategory[] }))}
              disabled={isSubmitting || isUploading}
              maxSelections={3}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الوصف</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              disabled={isSubmitting || isUploading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>صورة الغلاف</label>
            <div className={styles.uploadSection}>
              {(preview || form.imageUrl) && (
                <div className={styles.preview}>
                  <Image src={preview || form.imageUrl} alt="Preview" fill className={styles.previewImg} loading="eager" />
                </div>
              )}
              <div className={styles.uploadControls}>
                <span className={styles.uploadHint}>
                  {isUploading ? "جاري رفع الملف..." : "يفضل استخدام صور عالية الجودة بمقاس عريض"}
                </span>
                <label className={styles.btnUpload}>
                  <Upload size={16} />
                  {form.imageUrl ? "تغيير الصورة" : "رفع صورة"}
                  <input
                    type="file"
                    accept="image/*"
                    className={styles.fileInput}
                    onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                    disabled={isSubmitting || isUploading}
                  />
                </label>
              </div>
            </div>
          </div>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              disabled={isSubmitting || isUploading}
            />
            <span className={styles.slider} />
            <span>تفعيل المنشور ليظهر في الموقع</span>
          </label>

          <div className={styles.modalActions}>
            <button className={styles.btnCancel} onClick={resetForm} disabled={isSubmitting || isUploading}>
              إلغاء
            </button>
            <button className={styles.btnSubmit} onClick={handleSubmit} disabled={isSubmitting || isUploading || !form.imageUrl || !form.title.trim()}>
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