"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  User,
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
  const { user, activities, isLoadingUser, isLoadingActivities, error } =
    useUserDetails(userId);

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
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
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

  /* ✅ FIX: narrow volunteerProfile once */
  const volunteerProfile = user.volunteerProfile;

  const cityLabel = volunteerProfile?.city
    ? JORDANIAN_CITIES.find((c) => c.value === volunteerProfile.city)?.label
    : undefined;

  const age =
    volunteerProfile?.dateOfBirth !== undefined
      ? calculateAge(volunteerProfile.dateOfBirth)
      : undefined;

  const approvalRate =
    user.stats.totalActivities > 0
      ? Math.round(
          (user.stats.approvedActivities / user.stats.totalActivities) * 100
        )
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
          <div className={styles.avatarWrapper}>
            {volunteerProfile?.profilePictureUrl ? (
              <Image
                src={volunteerProfile.profilePictureUrl}
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

            {age !== undefined && (
              <div className={styles.contactCard}>
                <User size={18} />
                <div>
                  <span className={styles.contactLabel}>العمر</span>
                  <span className={styles.contactValue}>{age} سنة</span>
                </div>
              </div>
            )}

            {volunteerProfile?.gender && (
              <div className={styles.contactCard}>
                <Shield size={18} />
                <div>
                  <span className={styles.contactLabel}>الجنس</span>
                  <span className={styles.contactValue}>
                    {volunteerProfile.gender === "MALE" ? "ذكر" : "أنثى"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BIO */}
      {volunteerProfile?.bio && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>النبذة</h3>
          <p className={styles.bioText}>{volunteerProfile.bio}</p>
        </div>
      )}

      {/* SKILLS */}
      {volunteerProfile?.skills && volunteerProfile.skills.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>المهارات</h3>
          <div className={styles.tags}>
            {volunteerProfile.skills.map((skill) => (
              <span key={skill} className={styles.tag}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* INTERESTS */}
      {volunteerProfile?.interests && volunteerProfile.interests.length > 0 && (
        <div className={styles.sectionCard}>
          <h3 className={styles.sectionTitle}>الاهتمامات</h3>
          <div className={styles.tags}>
            {volunteerProfile.interests.map((interest) => (
              <span key={interest} className={styles.tag}>
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STATS */}
      {user.role === "VOLUNTEER" && (
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statTotal}`}>
            <Activity size={24} />
            <span>{user.stats.totalActivities}</span>
          </div>

          <div className={`${styles.statCard} ${styles.statApproved}`}>
            <CheckCircle size={24} />
            <span>{user.stats.approvedActivities}</span>
          </div>

          <div className={`${styles.statCard} ${styles.statPending}`}>
            <Clock size={24} />
            <span>{user.stats.pendingRequests}</span>
          </div>

          <div className={`${styles.statCard} ${styles.statRejected}`}>
            <XCircle size={24} />
            <span>{user.stats.rejectedRequests}</span>
          </div>
        </div>
      )}

      {user.role === "VOLUNTEER" && user.stats.totalActivities > 0 && (
        <div className={styles.approvalCard}>
          <div className={styles.approvalHeader}>
            <span>نسبة القبول</span>
            <span>{approvalRate}%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${approvalRate}%` }}
            />
          </div>
        </div>
      )}

      {user.role === "VOLUNTEER" && (
        <div className={styles.activitiesSection}>
          <h2>سجل الأنشطة</h2>

          {isLoadingActivities ? (
            <LoadingState variant="skeleton" count={3} />
          ) : activities.length === 0 ? (
            <p>لا توجد أنشطة</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id}>{activity.status}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;
