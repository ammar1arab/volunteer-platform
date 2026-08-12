"use client";
import styles from "./AdminUserDetailsPage.module.scss";
import { useAdminUserDetailsPage } from "./AdminUserDetailsPage.logic";
import Link from "next/link";
import {
  LoadingState, EmptyState, ProfileHeader, StatsCard, Dropdown,
  ActivityItem, ToastContainer, Pagination, ExportUsersButton, ConfirmDialog, EditableField,
} from "@/presentation/components";
import {
  ArrowRight, Activity, CheckCircle, Clock, XCircle,
  Mail, Phone, User, Trash2,
  ToggleLeft, ToggleRight, MapPin, Calendar, User2, Hash, GraduationCap, Briefcase, Award,
} from "lucide-react";
import {
  ROUTES, CITY_OPTIONS, getMonthLabel, getParticipationStatusLabel,
  getUserRoleLabel, getCityLabel, getGenderLabel, getEducationLevelLabel,
  EDUCATION_LEVEL_OPTIONS, EXPERIENCE_OPTIONS,
} from "@/presentation/constants";
import { ParticipationStatus, JordanianCity, Gender } from "@/core/domain/enums";

const GENDER_OPTIONS = [
  { value: "",       label: "غير محدد" },
  { value: "MALE",   label: "ذكر"      },
  { value: "FEMALE", label: "أنثى"     },
];

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
  { key: "membershipNumber", label: "رقم الانتساب" },
  { key: "city",        label: "المدينة"            },
  { key: "dateOfBirth", label: "تاريخ الميلاد"     },
  { key: "gender",      label: "الجنس"              },
  { key: "educationLevel", label: "المستوى التعليمي" },
  { key: "occupation", label: "التخصص / المهنة" },
  { key: "hasVolunteerExperience", label: "خبرة تطوعية" },
  { key: "bio",         label: "النبذة"             },
  { key: "interests",   label: "الاهتمامات"        },
  { key: "skills",      label: "المهارات"           },
  { key: "languages",   label: "اللغات" },
  { key: "preferredVolunteerTypes", label: "أنواع التطوع المفضلة" },
  { key: "activities",  label: "الفرص التطوعية"     },
  { key: "createdAt",   label: "تاريخ الانضمام"     },
];

const fmt = (d: string) => {
  const dt = new Date(d);
  return `${dt.getDate()} ${getMonthLabel(dt.getMonth() + 1)} ${dt.getFullYear()}`;
};

const Empty = ({ text = "لا يوجد" }: { text?: string }) => (
  <span className={styles.emptyText}>{text}</span>
);

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
  const ef = { editingField, isSaving, onStartEdit: startEditing, onCancel: cancelEditing, onUpdate: updateFieldValue, onSave: saveField };

  const filterItems = FILTER_OPTIONS.map(opt => ({
    ...opt,
    count: opt.key === "all" ? allActivities.length : allActivities.filter(a => a.status === opt.key).length,
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
          : `هل تريد تفعيل حساب ${user.fullName}؟`}
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
            {isTogglingActive ? <span className={styles.spinner} /> : user.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            <span>{user.isActive ? "تعطيل" : "تفعيل"}</span>
          </button>
          <button className={styles.btnDanger} onClick={() => setShowDeleteConfirm(true)} disabled={isDeleting}>
            <Trash2 size={13} /><span>حذف</span>
          </button>
          <ExportUsersButton data={exportData} columns={EXPORT_COLUMNS} buttonText="Export Excel" />
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
              <EditableField icon={<Mail size={14} />} label="البريد" field="email" value={user.email} type="email" {...ef} />
              <EditableField icon={<Phone size={14} />} label="الهاتف" field="phone" value={user.phone} type="tel" {...ef} />
              <EditableField icon={<User size={14} />} label="الاسم الكامل" field="fullName" value={user.fullName} {...ef} />
              {vp && <>
                <EditableField
                  icon={<Hash size={14} />} label="رقم الانتساب"
                  field="membershipNumber" value={vp.membershipNumber || ""}
                  displayValue={vp.membershipNumber || "غير محدد"}
                  {...ef}
                />
                <EditableField
                  icon={<MapPin   size={14} />} label="المدينة"
                  field="city"        value={vp.city || ""}
                  displayValue={vp.city ? getCityLabel(vp.city as JordanianCity) : "غير محدد"}
                  type="select"       options={CITY_OPTIONS} {...ef}
                />
                <EditableField
                  icon={<Calendar size={14} />} label="تاريخ الميلاد"
                  field="dateOfBirth" value={vp.dateOfBirth?.split("T")[0] ?? ""}
                  displayValue={vp.dateOfBirth ? fmt(vp.dateOfBirth) : "غير محدد"}
                  type="date" {...ef}
                />
                <EditableField
                  icon={<User2    size={14} />} label="الجنس"
                  field="gender"      value={vp.gender || ""}
                  displayValue={vp.gender ? getGenderLabel(vp.gender as Gender) : "غير محدد"}
                  type="select"       options={GENDER_OPTIONS} {...ef}
                />
                <EditableField
                  icon={<GraduationCap size={14} />} label="المستوى التعليمي"
                  field="educationLevel" value={vp.educationLevel || ""}
                  displayValue={vp.educationLevel ? getEducationLevelLabel(vp.educationLevel) : "غير محدد"}
                  type="select" options={[{ value: "", label: "غير محدد" }, ...EDUCATION_LEVEL_OPTIONS]} {...ef}
                />
                <EditableField
                  icon={<Briefcase size={14} />} label="التخصص / المهنة"
                  field="occupation" value={vp.occupation || ""}
                  displayValue={vp.occupation || "غير محدد"}
                  {...ef}
                />
                <EditableField
                  icon={<Award size={14} />} label="خبرة تطوعية سابقة"
                  field="hasVolunteerExperience"
                  value={vp.hasVolunteerExperience ? "true" : "false"}
                  displayValue={vp.hasVolunteerExperience ? "نعم" : "لا"}
                  type="select" options={EXPERIENCE_OPTIONS} {...ef}
                />
              </>}
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>النبذة الشخصية</h3>
            {vp?.bio ? <p className={styles.bio}>{vp.bio}</p> : <Empty text="لم تُضف نبذة بعد" />}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>المهارات</h3>
            {vp?.skills?.length
              ? <div className={styles.tags}>{vp.skills.map(s => <span key={s} className={styles.tag}>{s}</span>)}</div>
              : <Empty text="لا توجد مهارات مضافة" />}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>الاهتمامات</h3>
            {vp?.interests?.length
              ? <div className={styles.tags}>{vp.interests.map(i => <span key={i} className={styles.tag}>{i}</span>)}</div>
              : <Empty text="لا توجد اهتمامات مضافة" />}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>اللغات</h3>
            {vp?.languages?.length
              ? <div className={styles.tags}>{vp.languages.map(l => <span key={l} className={styles.tag}>{l}</span>)}</div>
              : <Empty text="لا توجد لغات مضافة" />}
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>أنواع التطوع المفضلة</h3>
            {vp?.preferredVolunteerTypes?.length
              ? <div className={styles.tags}>{vp.preferredVolunteerTypes.map(t => <span key={t} className={styles.tag}>{t}</span>)}</div>
              : <Empty text="لا توجد أنواع مفضلة" />}
          </section>

        </div>

        <div className={styles.right}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>سجل الفرص</h2>
              <Dropdown items={filterItems} active={activeFilter} onChange={setActiveFilter} placeholder="الحالة" compact />
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