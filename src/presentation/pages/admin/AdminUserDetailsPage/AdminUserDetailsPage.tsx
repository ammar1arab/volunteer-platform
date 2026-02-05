"use client";
import styles from "./AdminUserDetailsPage.module.scss";
import { useAdminUserDetailsPage } from "./AdminUserDetailsPage.logic";

import Link from "next/link";
import { ROUTES, JORDANIAN_CITIES } from "@/lib";
import { LoadingState, EmptyState, ProfileHeader, StatsCard, Dropdown, InfoCard, ActivityItem, ToastContainer, Pagination } from "@/presentation/components";
import { ArrowRight, Activity, CheckCircle, Clock, XCircle, Mail, Phone, MapPin, Calendar, User } from "lucide-react";

const AdminUserDetailsPage = () => {
  const { 
    status, 
    user, 
    activities, 
    allActivities, 
    totalFilteredItems,
    isLoadingUser, 
    isLoadingActivities, 
    activeFilter, 
    setActiveFilter, 
    currentPage,
    setCurrentPage,
    itemsPerPage,
    toasts, 
    removeToast 
  } = useAdminUserDetailsPage();

  if (status === "loading" || isLoadingUser) return <LoadingState />;

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
    ? JORDANIAN_CITIES.find((c) => c.value === volunteerProfile.city)?.label
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
      </div>

      <ProfileHeader
        fullName={user.fullName}
        role={user.role}
        profilePictureUrl={volunteerProfile?.profilePictureUrl}
        createdAt={user.createdAt}
        isEditable={false}
      />

      <div className={styles.statsGrid}>
        <StatsCard icon={Activity} value={user.stats.totalActivities} label="إجمالي الأنشطة" variant="blue" />
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
              <h2 className={styles.sectionTitle}>سجل الأنشطة</h2>
              <Dropdown items={filterItems} active={activeFilter} onChange={setActiveFilter} placeholder="اختر الحالة" compact />
            </div>

            {isLoadingActivities ? (
              <LoadingState />
            ) : activities.length === 0 ? (
              <EmptyState icon={Activity} message="لا توجد أنشطة" />
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