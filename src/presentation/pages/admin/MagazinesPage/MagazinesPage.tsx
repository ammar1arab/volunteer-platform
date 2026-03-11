"use client";
import styles from "./MagazinesPage.module.scss";
import { useMagazinesPage } from "./MagazinesPage.logic";
import { AdminMagazineCard, ToastContainer, Modal, LoadingState, EmptyState, Pagination, ConfirmDialog, SelectInput, Search, Dropdown } from "@/presentation/components";
import { Plus, Upload, Edit2, Eye, EyeOff, Trash2, BookOpen, FileText } from "lucide-react";
import { MONTH_LABELS } from "@/presentation/constants/labels";

const MagazinesPage = () => {
  const {
    status, isLoading, isSubmitting, isUploading, mode, form, showModal,
    list, paginatedList, filteredByYear, currentPage, itemsPerPage,
    toasts, removeToast, confirmDialog, activeYear, setActiveYear, yearFilterOptions,
    setForm, setCurrentPage, resetForm, openCreate, openEdit,
    handlePdfUpload, handleSubmit, handleToggle, handleDelete,
    searchQuery, setSearchQuery, setAppliedSearch,
  } = useMagazinesPage();

  if (status === "loading") return <LoadingState />;

  const monthOptions = Object.entries(MONTH_LABELS).map(([value, label]) => ({ value, label }));
  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = String(new Date().getFullYear() - 2 + i);
    return { value: y, label: y };
  });

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className={styles.header}>
        <div className={styles.actions}>
          <Search value={searchQuery} onChange={setSearchQuery} onSearch={setAppliedSearch} placeholder="ابحث عن مجلة..." />
          <div className={styles.actionsEnd}>
            <Dropdown
              items={yearFilterOptions}
              active={activeYear}
              onChange={setActiveYear}
              placeholder="السنة"
              compact
            />
            <button className={styles.btnCreate} onClick={openCreate} disabled={isSubmitting}>
              <Plus size={18} /> إضافة مجلة جديدة
            </button>
          </div>
        </div>
      </header>

      {isLoading ? (
        <LoadingState />
      ) : filteredByYear.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          message={searchQuery ? "لا توجد نتائج للبحث" : activeYear !== "all" ? "لا توجد مجلات لهذه السنة" : "لا توجد مجلات منشورة"}
          action={{ label: "إضافة مجلة", onClick: openCreate }}
        />
      ) : (
        <>
          <div className={styles.grid}>
            {paginatedList.map((magazine) => (
              <AdminMagazineCard
                key={magazine.id}
                title={magazine.title}
                monthYear={magazine.monthYear}
                pdfUrl={magazine.pdfUrl}
                actions={
                  <div className={styles.cardActions}>
                    <button className={styles.btn} onClick={() => openEdit(magazine)} disabled={isSubmitting}>
                      <Edit2 size={14} />
                    </button>
                    <button className={styles.btn} onClick={() => handleToggle(magazine)} disabled={isSubmitting}>
                      {magazine.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button className={styles.btnDanger} onClick={() => handleDelete(magazine)} disabled={isSubmitting}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                }
              />
            ))}
          </div>
          <Pagination currentPage={currentPage} totalItems={filteredByYear.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} sticky />
        </>
      )}

      <Modal isOpen={showModal} onClose={resetForm} title={mode === "create" ? "إضافة مجلة جديدة" : "تعديل المجلة"} size="md">
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>عنوان المجلة</label>
            <input className={styles.input} value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              disabled={isSubmitting || isUploading} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الشهر والسنة</label>
            <div className={styles.row}>
              <SelectInput label="" value={form.month} options={monthOptions}
                onChange={(val) => setForm((p) => ({ ...p, month: val }))}
                disabled={isSubmitting || isUploading} />
              <SelectInput label="" value={form.year} options={yearOptions}
                onChange={(val) => setForm((p) => ({ ...p, year: val }))}
                disabled={isSubmitting || isUploading} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>ملف PDF</label>
            <div className={styles.uploadSection}>
              <div className={styles.uploadIcon}><FileText size={22} /></div>
              <div className={styles.uploadContent}>
                <span className={styles.uploadFileName}>
                  {isUploading ? "جاري الرفع..." : form.pdfUrl ? "✓ تم رفع الملف" : "لم يتم اختيار ملف"}
                </span>
                <span className={styles.uploadHint}>PDF فقط — الحد الأقصى 50MB</span>
                <label className={styles.btnUpload}>
                  <Upload size={13} />
                  {form.pdfUrl ? "استبدال الملف" : "رفع PDF"}
                  <input type="file" accept="application/pdf" className={styles.fileInput}
                    onChange={(e) => handlePdfUpload(e.target.files?.[0] ?? null)}
                    disabled={isSubmitting || isUploading} />
                </label>
              </div>
            </div>
          </div>

          <label className={styles.toggle}>
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))}
              disabled={isSubmitting || isUploading} />
            <span className={styles.slider} />
            <span>تفعيل المجلة لتظهر في الموقع</span>
          </label>

          <div className={styles.modalActions}>
            <button className={styles.btnCancel} onClick={resetForm} disabled={isSubmitting || isUploading}>إلغاء</button>
            <button className={styles.btnSubmit} onClick={handleSubmit}
              disabled={isSubmitting || isUploading || !form.title.trim() || !form.pdfUrl || !form.month || !form.year}>
              {isSubmitting ? "جاري الحفظ..." : mode === "create" ? "إنشاء" : "حفظ التعديلات"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={confirmDialog.isOpen} onClose={confirmDialog.handleCancel}
        onConfirm={confirmDialog.handleConfirm} title={confirmDialog.options.title}
        message={confirmDialog.options.message} confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText} variant={confirmDialog.options.variant} />
    </>
  );
};

export default MagazinesPage;