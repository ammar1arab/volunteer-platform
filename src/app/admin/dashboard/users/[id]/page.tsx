"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, User, Mail, Phone, Calendar, Shield, Activity } from "lucide-react";
import Link from "next/link";
import styles from "./page.module.scss";
import { ROUTES } from "@/lib";
import { useUserDetails, useToast } from "@/presentation/hooks";
import {
  UserStatsCard,
  UserActivitiesList,
  LoadingState,
  ToastContainer,
} from "@/presentation/components";

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-JO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.header}>
        <Link href={ROUTES.ADMIN.USERS} className={styles.back}>
          <ArrowRight size={20} />
          <span>العودة</span>
        </Link>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <User size={56} />
            </div>
            <div className={styles.avatarGlow} />
          </div>

          <div className={styles.userInfo}>
            <div className={styles.nameSection}>
              <h1 className={styles.name}>{user.fullName}</h1>
              <div className={styles.badges}>
                <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()]}`}>
                  <Shield size={14} />
                  {user.role === "ADMIN" ? "مدير" : "متطوع"}
                </span>
                {!user.isActive && (
                  <span className={styles.inactiveBadge}>غير نشط</span>
                )}
              </div>
            </div>

            <div className={styles.contactGrid}>
              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <Mail size={18} />
                </div>
                <div className={styles.contactContent}>
                  <span className={styles.contactLabel}>البريد الإلكتروني</span>
                  <span className={styles.contactValue}>{user.email}</span>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <Phone size={18} />
                </div>
                <div className={styles.contactContent}>
                  <span className={styles.contactLabel}>رقم الهاتف</span>
                  <span className={styles.contactValue}>{user.phone}</span>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIcon}>
                  <Calendar size={18} />
                </div>
                <div className={styles.contactContent}>
                  <span className={styles.contactLabel}>تاريخ الانضمام</span>
                  <span className={styles.contactValue}>{formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserStatsCard stats={user.stats} />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleGroup}>
            <Activity size={24} />
            <h2 className={styles.sectionTitle}>سجل الأنشطة</h2>
          </div>
          <span className={styles.activityCount}>
            {activities.length} {activities.length === 1 }
          </span>
        </div>
        <UserActivitiesList activities={activities} isLoading={isLoadingActivities} />
      </section>
    </div>
  );
};

export default UserDetailsPage;