"use client";
import styles from "./AdminUserDetailsPage.module.scss";
import { useAdminUserDetailsPage } from "./AdminUserDetailsPage.logic";
import Link from "next/link";
import {
  LoadingState, EmptyState, ProfileHeader, StatsCard, Dropdown,
  ActivityItem, ToastContainer, Pagination, ExportUsersButton, ConfirmDialog,
} from "@/presentation/components";
import {
  ArrowRight, Activity, CheckCircle, Clock, XCircle,
  Mail, Phone, User, Edit2, Check, X, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { ROUTES, getMonthLabel, getParticipationStatusLabel, getUserRoleLabel } from "@/presentation/constants";
import { ParticipationStatus } from "@/core/domain/enums";

const FILTER_OPTIONS = [
  { key: "all",                         label: "الكل"                                                       },
  { key: ParticipationStatus.PENDING,   label: getParticipationStatusLabel(ParticipationStatus.PENDING)   },
  { key: ParticipationStatus.APPROVED,  label: getParticipationStatusLabel(ParticipationStatus.APPROVED)  },
  { key: ParticipationStatus.REJECTED,  label: getParticipationStatusLabel(ParticipationStatus.REJECTED)  },
  { key: ParticipationStatus.CANCELLED, label: getParticipationStatusLabel(ParticipationStatus.CANCELLED) },
];

const EXPORT_COLUMNS = [
  { key: "fullName",    label: "الاسم"             },
  { key: "email",       label: "البريد الإلكتروني" },
  { key: "phone",       label: "رقم الهاتف"        },
  { key: "city",        label: "المدينة"            },
  { key: "dateOfBirth", label: "تاريخ الميلاد"     },
  { key: "gender",      label: "الجنس"              },
  { key: "bio",         label: "النبذة"             },
  { key: "interests",   label: "الاهتمامات"        },
  { key: "skills",      label: "المهارات"           },
  { key: "activities",  label: "الفرص التطوعية"     },
  { key: "createdAt",   label: "تاريخ الانضمام"     },
];

const formatDate = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${getMonthLabel(dt.getMonth() + 1)} ${dt.getFullYear()}`;
};

const AdminUserDetailsPage = () => {
  const {
    status, user, activities, allActivities, totalFilteredItems,
    loadingUser, loadingActivities, activeFilter, setActiveFilter,
    currentPage, setCurrentPage, itemsPerPage, toasts, removeToast,
    exportData, totalHours,
    editingField, isSaving, startEditing, cancelEditing, updateFieldValue, saveField,
    confirmToggleActive, isTogglingActive, showToggleConfirm, setShowToggleConfirm,
    deleteUser, isDeleting, showDeleteConfirm, setShowDeleteConfirm,
  } = useAdminUserDetailsPage();

  if (status === "loading" || loadingUser) return <LoadingState />;

  if (!user) return (
    <div className={styles.notFound}>
      <User size={56} strokeWidth={1.5} />
      <h2>المستخدم غير موجود</h2>
      <Link href={ROUTES.ADMIN.USERS} className={styles.backLink}>
        <ArrowRight size={16} /> العودة للقائمة
      </Link>
    </div>
  );

  const vp = user.volunteerProfile;
  const ef = {
    editingField, isSaving,
    onStartEdit: startEditing, onCancel: cancelEditing,
    onUpdate: updateFieldValue, onSave: saveField,
  };

  const filterItems = FILTER_OPTIONS.map(opt => ({
    ...opt,
    count: opt.key === "all"
      ? allActivities.length
      : allActivities.filter(a => a.status === opt.key).length,
  }));

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <ConfirmDialog
        isOpen={showToggleConfirm}
        onClose={() => setShowToggleConfirm(false)}
        onConfirm={confirmToggleActive}
        title={user.isActive ? "تعطيل الحساب" : "تفعيل الحساب"}
        message={user.isActive
          ? `هل تريد تعطيل حساب ${user.fullName}؟ لن يتمكن من تسجيل الدخول.`
          : `هل تريد تفعيل حساب ${user.fullName}؟`
        }
        confirmText={user.isActive ? "تعطيل" : "تفعيل"}
        variant={user.isActive ? "danger" : "primary"}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteUser}
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف ${user.fullName}؟`}
        warning="لا يمكن التراجع عن هذا الإجراء وستُحذف جميع البيانات المرتبطة به."
        confirmText={isDeleting ? "جارٍ الحذف..." : "حذف"}
        variant="danger"
      />

      <div className={styles.header}>
        <Link href={ROUTES.ADMIN.USERS} className={styles.back}>
          <ArrowRight size={16} /> العودة
        </Link>
        <div className={styles.actions}>
          <button
            className={user.isActive ? styles.btnDeactivate : styles.btnActivate}
            onClick={() => setShowToggleConfirm(true)}
            disabled={isTogglingActive}
          >
            {isTogglingActive
              ? <span className={styles.spinner} />
              : user.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />
            }
            <span>{user.isActive ? "تعطيل" : "تفعيل"}</span>
          </button>
          <button className={styles.btnDanger} onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
            <Trash2 size={13} />
            <span>حذف</span>
          </button>
          <ExportUsersButton data={exportData} columns={EXPORT_COLUMNS} buttonText="Excel" />
        </div>
      </div>

      <ProfileHeader
        fullName={user.fullName}
        role={getUserRoleLabel(user.role)}
        profilePictureUrl={vp?.profilePictureUrl}
        createdAt={user.createdAt}
        isEditable={false}
        totalHours={totalHours}
      />

      <div className={styles.statsGrid}>
        <StatsCard icon={Activity}    value={user.stats.totalActivities}    label="إجمالي الفرص"  variant="blue"   />
        <StatsCard icon={CheckCircle} value={user.stats.approvedActivities} label="موافق عليه"    variant="green"  />
        <StatsCard icon={Clock}       value={user.stats.pendingRequests}     label="قيد الانتظار" variant="yellow" />
        <StatsCard icon={XCircle}     value={user.stats.rejectedRequests}    label="مرفوض"        variant="red"    />
      </div>

      <div className={styles.grid}>
        <div className={styles.left}>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>معلومات التواصل</h3>
            <div className={styles.infoList}>
              <EField icon={<Mail size={14} />}  label="البريد"  field="email"    value={user.email}    {...ef} />
              <EField icon={<Phone size={14} />} label="الهاتف"  field="phone"    value={user.phone}    {...ef} />
              <EField icon={<User size={14} />}  label="الاسم"   field="fullName" value={user.fullName} {...ef} />
            </div>
          </section>

          {vp?.bio && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>النبذة</h3>
              <p className={styles.bio}>{vp.bio}</p>
            </section>
          )}

          {!!vp?.skills?.length && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>المهارات</h3>
              <div className={styles.tags}>
                {vp.skills.map(s => <span key={s} className={styles.tag}>{s}</span>)}
              </div>
            </section>
          )}

          {!!vp?.interests?.length && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>الاهتمامات</h3>
              <div className={styles.tags}>
                {vp.interests.map(i => <span key={i} className={styles.tag}>{i}</span>)}
              </div>
            </section>
          )}

        </div>

        <div className={styles.right}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>سجل الفرص</h2>
              <Dropdown
                items={filterItems}
                active={activeFilter}
                onChange={setActiveFilter}
                placeholder="الحالة"
                compact
              />
            </div>

            {loadingActivities ? <LoadingState /> : activities.length === 0 ? (
              <EmptyState icon={Activity} message="لا توجد فرص" />
            ) : (
              <div className={styles.listWrapper}>
                <div className={styles.list}>
                  {activities.map(item => (
                    <ActivityItem
                      key={item.id}
                      title={item.activity.title}
                      description={item.activity.description}
                      date={item.activity.date}
                      startTime={item.activity.startTime}
                      endTime={item.activity.endTime}
                      placeName={item.activity.placeName}
                      status={item.status as ParticipationStatus}
                      requestedAt={item.requestedAt}
                      respondedAt={item.respondedAt}
                      volunteerHours={item.volunteerHours}
                    />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalItems={totalFilteredItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  sticky
                />
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;

const EField = ({ icon, label, value, field, editingField, isSaving, onStartEdit, onCancel, onUpdate, onSave }: any) => {
  const isEditing = editingField?.field === field;
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>{icon}</div>
      <div className={styles.infoContent}>
        <span className={styles.infoLabel}>{label}</span>
        {isEditing ? (
          <div className={styles.inlineEdit}>
            <input
              type="text"
              className={styles.input}
              value={editingField.value as string}
              onChange={e => onUpdate(e.target.value)}
              disabled={isSaving}
              autoFocus
            />
            <button className={styles.btnCheck} onClick={onSave}   disabled={isSaving}><Check size={12} /></button>
            <button className={styles.btnX}     onClick={onCancel} disabled={isSaving}><X size={12} /></button>
          </div>
        ) : (
          <div className={styles.infoValueRow}>
            <span className={styles.infoText}>{value || "—"}</span>
            <button className={styles.btnEditIcon} onClick={() => onStartEdit(field, value)}>
              <Edit2 size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};