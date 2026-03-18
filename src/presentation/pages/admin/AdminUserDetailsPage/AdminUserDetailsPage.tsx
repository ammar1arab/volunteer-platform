"use client";
import styles from "./AdminUserDetailsPage.module.scss";
import { useAdminUserDetailsPage } from "./AdminUserDetailsPage.logic";
import Link from "next/link";
import {
  LoadingState, EmptyState, ProfileHeader, StatsCard, Dropdown,
  InfoCard, ActivityItem, ToastContainer, Pagination, ExportUsersButton,
} from "@/presentation/components";
import { ArrowRight, Activity, CheckCircle, Clock, XCircle, Mail, Phone, MapPin, Calendar, User } from "lucide-react";
import { ROUTES, getCityLabel, getMonthLabel, getParticipationStatusLabel } from "@/presentation/constants";
import { JordanianCity, ParticipationStatus } from "@/core/domain/enums";

const FILTER_OPTIONS = [
  { key: "all", label: "الكل" },
  { key: ParticipationStatus.PENDING,   label: getParticipationStatusLabel(ParticipationStatus.PENDING)   },
  { key: ParticipationStatus.APPROVED,  label: getParticipationStatusLabel(ParticipationStatus.APPROVED)  },
  { key: ParticipationStatus.REJECTED,  label: getParticipationStatusLabel(ParticipationStatus.REJECTED)  },
  { key: ParticipationStatus.CANCELLED, label: getParticipationStatusLabel(ParticipationStatus.CANCELLED) },
];

const EXPORT_COLUMNS = [
  { key: "fullName",    label: "الاسم"              },
  { key: "email",       label: "البريد الإلكتروني"  },
  { key: "phone",       label: "رقم الهاتف"         },
  { key: "city",        label: "المدينة"             },
  { key: "dateOfBirth", label: "تاريخ الميلاد"      },
  { key: "gender",      label: "الجنس"               },
  { key: "bio",         label: "النبذة"              },
  { key: "interests",   label: "الاهتمامات"         },
  { key: "skills",      label: "المهارات"            },
  { key: "activities",  label: "الفرص التطوعية"      },
  { key: "createdAt",   label: "تاريخ الانضمام"      },
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
  } = useAdminUserDetailsPage();

  if (status === "loading" || loadingUser) return <LoadingState />;

  if (!user) {
    return (
      <div className={styles.error}>
        <User size={64} />
        <h2>المستخدم غير موجود</h2>
        <Link href={ROUTES.ADMIN.USERS} className={styles.backLink}>
          <ArrowRight size={18} /> العودة للقائمة
        </Link>
      </div>
    );
  }

  const vp = user.volunteerProfile;
  const filterItems = FILTER_OPTIONS.map((opt) => ({
    ...opt,
    count: opt.key === "all"
      ? allActivities.length
      : allActivities.filter((a) => a.status === opt.key).length,
  }));

  return (
    <div className={styles.pageWrapper}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.header}>
        <Link href={ROUTES.ADMIN.USERS} className={styles.back}>
          <ArrowRight size={18} /> العودة
        </Link>
        <ExportUsersButton data={exportData} columns={EXPORT_COLUMNS} buttonText="Export Excel" />
      </div>

      <ProfileHeader
        fullName={user.fullName}
        role={user.role}
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
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>معلومات التواصل</h3>
            <div className={styles.infoList}>
              <InfoCard icon={Mail}     label="البريد الإلكتروني" value={user.email}                              />
              <InfoCard icon={Phone}    label="رقم الهاتف"        value={user.phone}                              />
              {vp?.city && <InfoCard icon={MapPin} label="المدينة" value={getCityLabel(vp.city as JordanianCity)} />}
              <InfoCard icon={Calendar} label="تاريخ الانضمام"    value={formatDate(user.createdAt)}              />
            </div>
          </div>

          {vp?.bio && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>النبذة</h3>
              <p className={styles.bio}>{vp.bio}</p>
            </div>
          )}

          {vp?.skills && vp.skills.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>المهارات</h3>
              <div className={styles.tags}>
                {vp.skills.map((s) => <span key={s} className={styles.tag}>{s}</span>)}
              </div>
            </div>
          )}

          {vp?.interests && vp.interests.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>الاهتمامات</h3>
              <div className={styles.tags}>
                {vp.interests.map((i) => <span key={i} className={styles.tag}>{i}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>سجل الفرص</h2>
              <Dropdown items={filterItems} active={activeFilter} onChange={setActiveFilter} placeholder="اختر الحالة" compact />
            </div>

            {loadingActivities ? <LoadingState /> : activities.length === 0 ? (
              <EmptyState icon={Activity} message="لا توجد فرص" />
            ) : (
              <div className={styles.listWrapper}>
                <div className={styles.list}>
                  {activities.map((item) => (
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUserDetailsPage;