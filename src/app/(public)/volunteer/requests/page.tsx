"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Clock, Calendar, User, CheckCircle, XCircle, Loader2, LogOut } from "lucide-react";
import { Container, LoadingState, EmptyState } from "@/presentation/components";
import { useActivityParticipations } from "@/presentation/hooks";
import { ROUTES } from "@/lib";
import styles from "./page.module.scss";

const VolunteerRequestsPage = () => {
  const router = useRouter();
  const { status } = useSession();
  const { requests, loading } = useActivityParticipations({
    autoFetch: true,
    type: "my-requests",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.LOGIN);
    }
  }, [status, router]);

  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const approvedRequests = requests.filter((r) => r.status === "APPROVED");
  const rejectedRequests = requests.filter((r) => r.status === "REJECTED");

  if (status === "loading" || loading) {
    return <LoadingState message="جاري التحميل..." />;
  }

  return (
    <div className={styles.page}>
      <Container>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.title}>طلبات الانضمام</h1>
            <p className={styles.subtitle}>تابع حالة طلباتك للأنشطة التطوعية</p>
          </div>
          <div className={styles.pageActions}>
            <Link href={ROUTES.VOLUNTEER.PROFILE} className={styles.navBtn}>
              <User size={18} />
              الملف الشخصي
            </Link>
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
            >
              <LogOut size={18} />
              تسجيل الخروج
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            قيد المراجعة ({pendingRequests.length})
          </h2>
          {pendingRequests.length === 0 ? (
            <EmptyState
              icon={Loader2}
              message="لا توجد طلبات قيد المراجعة"
            />
          ) : (
            <div className={styles.grid}>
              {pendingRequests.map((request) => (
                <div key={request.id} className={`${styles.card} ${styles.pending}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{request.activity?.title}</h3>
                    <span className={`${styles.badge} ${styles.badgePending}`}>
                      قيد المراجعة
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>{new Date(request.activity?.date || "").toLocaleDateString("ar")}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock size={16} />
                      <span>تم الإرسال: {new Date(request.requestedAt).toLocaleDateString("ar")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            موافق عليها ({approvedRequests.length})
          </h2>
          {approvedRequests.length === 0 ? (
            <EmptyState
              icon={CheckCircle}
              message="لا توجد طلبات موافق عليها"
            />
          ) : (
            <div className={styles.grid}>
              {approvedRequests.map((request) => (
                <div key={request.id} className={`${styles.card} ${styles.approved}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{request.activity?.title}</h3>
                    <span className={`${styles.badge} ${styles.badgeApproved}`}>
                      موافق عليه
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>{new Date(request.activity?.date || "").toLocaleDateString("ar")}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock size={16} />
                      <span>تمت الموافقة: {new Date(request.respondedAt || "").toLocaleDateString("ar")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            مرفوضة ({rejectedRequests.length})
          </h2>
          {rejectedRequests.length === 0 ? (
            <EmptyState
              icon={XCircle}
              message="لا توجد طلبات مرفوضة"
            />
          ) : (
            <div className={styles.grid}>
              {rejectedRequests.map((request) => (
                <div key={request.id} className={`${styles.card} ${styles.rejected}`}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>{request.activity?.title}</h3>
                    <span className={`${styles.badge} ${styles.badgeRejected}`}>
                      مرفوض
                    </span>
                  </div>

                  <div className={styles.cardMeta}>
                    <div className={styles.metaItem}>
                      <Calendar size={16} />
                      <span>{new Date(request.activity?.date || "").toLocaleDateString("ar")}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <Clock size={16} />
                      <span>تم الرفض: {new Date(request.respondedAt || "").toLocaleDateString("ar")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default VolunteerRequestsPage;