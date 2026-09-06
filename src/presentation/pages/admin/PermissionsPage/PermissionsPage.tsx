"use client";

import styles from "./PermissionsPage.module.scss";
import { usePermissionsPage } from "./PermissionsPage.logic";
import { PermissionsPanel } from "@/presentation/components";
import {
  LoadingState, EmptyState, ToastContainer,
  Modal, ConfirmDialog, Search,
} from "@/presentation/components";
import { Plus, Users, Trash2, Edit2 } from "lucide-react";
import { ADMIN_PERMISSIONS } from "@/core/domain/enums";
import type { AdminPermission } from "@/core/domain/enums";
import { PERMISSION_LABELS } from "@/presentation/constants";

const PermissionsPage = () => {
  const {
    status, loading, admins,
    showCreateModal, setShowCreateModal,
    showEditModal, editTarget,
    createForm, setCreateForm,
    editForm, setEditForm,
    submitting,
    emailStatus, checkEmail,
    searchQuery, setSearchQuery, setAppliedSearch,
    toggleCreatePermission,
    handleCreate, handleEdit, handleDelete,
    openEdit, resetCreateForm, resetEditForm,
    toasts, removeToast, showToast,
    confirmDialog,
  } = usePermissionsPage();

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
            placeholder="ابحث باسم أو بريد..."
          />
          <div className={styles.actionsEnd}>
            <button className={styles.btnCreate} onClick={() => setShowCreateModal(true)}>
              <Plus size={18} /> إضافة أدمن
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <LoadingState />
      ) : admins.length === 0 ? (
        <EmptyState
          icon={Users}
          message="لا يوجد أدمن آخر حتى الآن"
          action={{ label: "إضافة أدمن", onClick: () => setShowCreateModal(true) }}
        />
      ) : (
        <div className={styles.grid}>
          {admins.map((admin) => {
            const initial     = admin.fullName.charAt(0).toUpperCase();
            const activeCount = (admin.permissions ?? []).length;
            return (
              <div key={admin.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.avatar}>{initial}</div>
                  <div className={styles.adminMeta}>
                    <span className={styles.adminName}>{admin.fullName}</span>
                    <span className={styles.adminEmail}>{admin.email}</span>
                  </div>
                  <div className={styles.cardActions}>
                    <span className={styles.permBadge}>
                      {activeCount}/{ADMIN_PERMISSIONS.length}
                    </span>
                    <button className={styles.btnEdit} onClick={() => openEdit(admin)} title="تعديل البيانات">
                      <Edit2 size={14} />
                    </button>
                    <button className={styles.btnDanger} onClick={() => handleDelete(admin)} title="حذف الأدمن">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <PermissionsPanel
                    userId={admin.id}
                    initialPermissions={admin.permissions ?? []}
                    onSuccess={() => showToast("تم تحديث الصلاحيات", "success")}
                    onError={(msg) => showToast(msg, "error")}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showCreateModal} onClose={resetCreateForm} title="إضافة أدمن جديد" size="md">
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>الاسم الكامل</label>
            <input
              className={styles.input}
              value={createForm.fullName}
              onChange={(e) => setCreateForm((p) => ({ ...p, fullName: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>البريد الإلكتروني</label>
            <input
              className={`${styles.input} ${
                emailStatus === "taken"     ? styles.inputError   :
                emailStatus === "available" ? styles.inputSuccess  : ""
              }`}
              type="email"
              dir="ltr"
              value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
              onBlur={(e) => checkEmail(e.target.value)}
              disabled={submitting}
            />
            {emailStatus === "checking"  && <span className={styles.hint}>جاري التحقق...</span>}
            {emailStatus === "taken"     && <span className={`${styles.hint} ${styles.hintError}`}>البريد مستخدم مسبقاً</span>}
            {emailStatus === "available" && <span className={`${styles.hint} ${styles.hintSuccess}`}>البريد متاح</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>رقم الهاتف</label>
            <input
              className={styles.input}
              value={createForm.phone}
              onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>كلمة المرور</label>
            <input
              className={styles.input}
              type="password"
              dir="ltr"
              value={createForm.password}
              onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>الصلاحيات</label>
            <div className={styles.permGrid}>
              {ADMIN_PERMISSIONS.map((permission) => {
                const isOn = createForm.permissions.includes(permission);
                return (
                  <button
                    key={permission}
                    type="button"
                    className={`${styles.permChip} ${isOn ? styles.chipOn : styles.chipOff}`}
                    onClick={() => toggleCreatePermission(permission as AdminPermission)}
                    disabled={submitting}
                  >
                    <span className={styles.chipDot} />
                    {PERMISSION_LABELS[permission as AdminPermission]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button className={styles.btnCancel} onClick={resetCreateForm} disabled={submitting}>
              إلغاء
            </button>
            <button
              className={styles.btnSubmit}
              onClick={handleCreate}
              disabled={
                submitting ||
                emailStatus === "taken" ||
                emailStatus === "checking" ||
                !createForm.fullName.trim() ||
                !createForm.email.trim() ||
                !createForm.password.trim() ||
                !createForm.phone.trim()
              }
            >
              {submitting ? "جاري الإنشاء..." : "إنشاء"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={resetEditForm}
        title={`تعديل بيانات ${editTarget?.fullName ?? ""}`}
        size="sm"
      >
        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>الاسم الكامل</label>
            <input
              className={styles.input}
              value={editForm.fullName}
              onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>البريد الإلكتروني</label>
            <input
              className={styles.input}
              type="email"
              dir="ltr"
              value={editForm.email}
              onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>رقم الهاتف</label>
            <input
              className={styles.input}
              value={editForm.phone}
              onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>
              كلمة المرور الجديدة
              <span className={styles.optional}> (اتركها فارغة إن لم تريد التغيير)</span>
            </label>
            <input
              className={styles.input}
              type="password"
              dir="ltr"
              value={editForm.password}
              onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))}
              disabled={submitting}
            />
          </div>
          <div className={styles.modalActions}>
            <button className={styles.btnCancel} onClick={resetEditForm} disabled={submitting}>
              إلغاء
            </button>
            <button
              className={styles.btnSubmit}
              onClick={handleEdit}
              disabled={submitting || !editForm.fullName.trim() || !editForm.email.trim() || !editForm.phone.trim()}
            >
              {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
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

export default PermissionsPage;