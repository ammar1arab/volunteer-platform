"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  ArrowRight, Mail, Phone, MapPin, Calendar, 
  Activity, CheckCircle, Clock, XCircle, Shield, User 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.scss";
import { ROUTES, JORDANIAN_CITIES } from "@/lib";
import { useUserDetails, useToast } from "@/presentation/hooks";
import { LoadingState, ToastContainer } from "@/presentation/components";

const UserDetailsPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { user, activities, isLoadingUser, isLoadingActivities, error } = useUserDetails(userId);

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
      showToast(error, "error");
    }
  }, [error, showToast]);

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (status === "loading" || isLoadingUser) {
    return <LoadingState message="جاري التحميل..." />;
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <div className={styles.errorIcon}>
          <User size={64} />
        </div>
        <h2>المستخدم غير موجود</h2>
        <p>لم نتمكن من العثور على المستخدم المطلوب</p>
        <Link href={ROUTES.ADMIN.USERS} className={styles.backLink}>
          <ArrowRight size={18} />
          العودة للقائمة
        </Link>
      </div>
    );
  }

  const cityLabel = user.volunteerProfile?.city
    ? JORDANIAN_CITIES.find((c) => c.value === user.volunteerProfile?.city)?.label
    : undefined;

  const age = user.volunteerProfile?.dateOfBirth 
    ? calculateAge(user.volunteerProfile.dateOfBirth)
    : undefined;

  const approvalRate = user.stats.totalActivities > 0
    ? Math.round((user.stats.approvedActivities / user.stats.totalActivities) * 100)
    : 0;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className={styles.header}>
        <Link href={ROUTES.ADMIN.USERS} className={styles.back}>
          <ArrowRight size={20} />
          العودة
        </Link>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileBanner} />
        
        <div className={styles.profileContent}>
          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            {user.volunteerProfile?.profilePictureUrl ? (
              <Image
                src={user.volunteerProfile.profilePictureUrl}
                alt={user.fullName}
                width={120}
                height={120}
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {user.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* User Info */}
          <div className={styles.userInfo}>
            <h1 className={styles.userName}>{user.fullName}</h1>
            <div className={styles.badges}>
              <span className={styles.roleBadge}>
                <Shield size={14} />
                {user.role === "ADMIN" ? "مدير" : "متطوع"}
              </span>
              {!user.isActive && (
                <span className={styles.inactiveBadge}>غير نشط</span>
              )}
            </div>
          </div>

          {/* Contact Grid */}
          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <Mail size={18} />
              <div>
                <span className={styles.contactLabel}>البريد الإلكتروني</span>
                <span className={styles.contactValue}>{user.email}</span>
              </div>
            </div>

            <div className={styles.contactCard}>
              <Phone size={18} />
              <div>
                <span className={styles.contactLabel}>رقم الهاتف</span>
                <span className={styles.contactValue}>{user.phone}</span>
              </div>
            </div>

            <div className={styles.contactCard}>
              <Calendar size={18} />
              <div>
                <span className={styles.contactLabel}>تاريخ الانضمام</span>
                <span className={styles.contactValue}>
                  {new Date(user.createdAt).toLocaleDateString("ar-JO")}
                </span>
              </div>
            </div>

            {cityLabel && (
              <div className={styles.contactCard}>
                <MapPin size={18} />
                <div>
                  <span className={styles.contactLabel}>المدينة</span>
                  <span className={styles.contactValue}>{cityLabel}</span>
                </div>
              </div>
            )}

            {age && (
              <div className={styles.contactCard}>
                <User size={18} />
                <div>
                  <span className={styles.contactLabel}>العمر</span>
                  <span className={styles.contactValue}>{age} سنة</span>
                </div>
              </div>
            )}

            {user.volunteerProfile?.gender && (
              <div className={styles.contactCard}>
                <Shield size={18} />
                <div>
                  <span className={styles.contactLabel}>الجنس</span>
                  <span className={styles.contactValue}>
                    {user.volunteerProfile.gender === "MALE" ? "ذكر" : "أنثى"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards - للمتطوعين فقط */}
      {user.role === "VOLUNTEER" && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <div className={styles.statIcon}>
              <Activity size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{user.stats.totalActivities}</span>
              <span className={styles.statLabel}>إجمالي الأنشطة</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statApproved}`}>
            <div className={styles.statIcon}>
              <CheckCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{user.stats.approvedActivities}</span>
              <span className={styles.statLabel}>موافق عليها</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statPending}`}>
            <div className={styles.statIcon}>
              <Clock size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{user.stats.pendingRequests}</span>
              <span className={styles.statLabel}>معلقة</span>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.statRejected}`}>
            <div className={styles.statIcon}>
              <XCircle size={24} />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{user.stats.rejectedRequests}</span>
              <span className={styles.statLabel}>مرفوضة</span>
            </div>
          </div>
        </div>
      )}

      {/* Approval Rate - للمتطوعين فقط */}
      {user.role === "VOLUNTEER" && user.stats.totalActivities > 0 && (
        <div className={styles.approvalCard}>
          <div className={styles.approvalHeader}>
            <span className={styles.approvalLabel}>نسبة القبول</span>
            <span className={styles.approvalValue}>{approvalRate}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${approvalRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Activities List - للمتطوعين فقط */}
      {user.role === "VOLUNTEER" && (
        <div className={styles.activitiesSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <Activity size={24} />
              سجل الأنشطة
            </h2>
            <span className={styles.activityCount}>{activities.length}</span>
          </div>

          {isLoadingActivities ? (
            <LoadingState variant="skeleton" count={3} />
          ) : activities.length === 0 ? (
            <div className={styles.emptyActivities}>
              <Activity size={48} />
              <p>لا توجد أنشطة</p>
            </div>
          ) : (
            <div className={styles.activitiesList}>
              {activities.map((activity) => (
                <div key={activity.id} className={styles.activityCard}>
                  <div className={styles.activityInfo}>
                    {/* <h3 className={styles.activityTitle}>{activity.title}</h3>
                    <span className={styles.activityDate}>
                      {new Date(activity.date).toLocaleDateString("ar-JO")}
                    </span> */}
                  </div>
                  <span className={`${styles.statusBadge} ${styles[activity.status.toLowerCase()]}`}>
                    {activity.status === "APPROVED" && "مقبول"}
                    {activity.status === "PENDING" && "معلق"}
                    {activity.status === "REJECTED" && "مرفوض"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;