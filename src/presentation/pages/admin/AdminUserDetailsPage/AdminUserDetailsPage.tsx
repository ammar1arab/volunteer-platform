"use client";
import styles from "./AdminUserDetailsPage.module.scss";
import { useAdminUserDetailsPage } from "./AdminUserDetailsPage.logic";

import Link from "next/link";
import { LoadingState, EmptyState, ProfileHeader, StatsCard, Dropdown, InfoCard, ActivityItem, ToastContainer, Pagination, ExportUsersButton } from "@/presentation/components";
import { ArrowRight, Activity, CheckCircle, Clock, XCircle, Mail, Phone, MapPin, Calendar, User } from "lucide-react";
import { ROUTES } from "@/presentation/constants";
import { getCityLabel } from "@/presentation/constants/labels";
import { JordanianCity } from "@/core/domain/enums";

const AdminUserDetailsPage = () => {
  const {
    status,
    user,
    activities,
    allActivities,
    totalFilteredItems,
    loadingUser,
    loadingActivities,
    activeFilter,
    setActiveFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    toasts,
    removeToast,
    exportData
  } = useAdminUserDetailsPage();

  if (status === "loading" || loadingUser) return <LoadingState />;

  if (!user) {
    return (
      <div className={styles.error}>
        <User size={64} />
        <h2>المستخدم غير موجود</h2>
        <Link href={ROUTES.ADMIN.USERS} className={styles.backLink}>
          <ArrowRight size={18} />
          العودة للقائمة
        </Link>
      </div>
    );
  }

  const volunteerProfile = user.volunteerProfile;
  const cityLabel = volunteerProfile?.city
    ? getCityLabel(volunteerProfile.city as JordanianCity)
    : undefined;

  const filterItems = [
    { key: "all", label: "الكل", count: allActivities.length },
    { key: "PENDING", label: "قيد الانتظار", count: allActivities.filter((a) => a.status === "PENDING").length },
    { key: "APPROVED", label: "موافق عليه", count: allActivities.filter((a) => a.status === "APPROVED").length },
    { key: "REJECTED", label: "مرفوض", count: allActivities.filter((a) => a.status === "REJECTED").length },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.header}>
        <Link href={ROUTES.ADMIN.USERS} className={styles.back}>
          <ArrowRight size={18} />
          العودة
        </Link>
        <ExportUsersButton
          data={exportData}
          columns={[
            { key: "fullName", label: "الاسم" },
            { key: "email", label: "البريد الإلكتروني" },
            { key: "phone", label: "رقم الهاتف" },
            { key: "city", label: "المدينة" },
            { key: "dateOfBirth", label: "تاريخ الميلاد" },
            { key: "gender", label: "الجنس" },
            { key: "bio", label: "النبذة" },
            { key: "interests", label: "الاهتمامات" },
            { key: "skills", label: "المهارات" },
            { key: "activities", label: "الفرص التطوعية" },
            { key: "createdAt", label: "تاريخ الانضمام" },
          ]}
          buttonText="Export Excel"
        />
      </div>


      <ProfileHeader
        fullName={user.fullName}
        role={user.role}
        profilePictureUrl={volunteerProfile?.profilePictureUrl}
        createdAt={user.createdAt}
        isEditable={false}
      />

      <div className={styles.statsGrid}>
        <StatsCard icon={Activity} value={user.stats.totalActivities} label="إجمالي الفرص" variant="blue" />
        <StatsCard icon={CheckCircle} value={user.stats.approvedActivities} label="موافق عليه" variant="green" />
        <StatsCard icon={Clock} value={user.stats.pendingRequests} label="قيد الانتظار" variant="yellow" />
        <StatsCard icon={XCircle} value={user.stats.rejectedRequests} label="مرفوض" variant="red" />
      </div>

      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>معلومات التواصل</h3>
            <div className={styles.infoList}>
              <InfoCard icon={Mail} label="البريد الإلكتروني" value={user.email} />
              <InfoCard icon={Phone} label="رقم الهاتف" value={user.phone} />
              {cityLabel && <InfoCard icon={MapPin} label="المدينة" value={cityLabel} />}
              <InfoCard icon={Calendar} label="تاريخ الانضمام" value={new Date(user.createdAt).toLocaleDateString("ar")} />
            </div>
          </div>

          {volunteerProfile?.bio && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>النبذة</h3>
              <p className={styles.bio}>{volunteerProfile.bio}</p>
            </div>
          )}

          {volunteerProfile?.skills && volunteerProfile.skills.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>المهارات</h3>
              <div className={styles.tags}>
                {volunteerProfile.skills.map((skill) => (
                  <span key={skill} className={styles.tag}>{skill}</span>
                ))}
              </div>
            </div>
          )}

          {volunteerProfile?.interests && volunteerProfile.interests.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>الاهتمامات</h3>
              <div className={styles.tags}>
                {volunteerProfile.interests.map((interest) => (
                  <span key={interest} className={styles.tag}>{interest}</span>
                ))}
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

            {loadingActivities ? (
              <LoadingState />
            ) : activities.length === 0 ? (
              <EmptyState icon={Activity} message="لا توجد فرص" />
            ) : (
              <>
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
                      status={item.status as "PENDING" | "APPROVED" | "REJECTED"}
                      requestedAt={item.requestedAt}
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
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUserDetailsPage;