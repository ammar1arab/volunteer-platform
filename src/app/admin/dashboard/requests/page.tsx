"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react";
import { LoadingState, EmptyState, ToastContainer } from "@/presentation/components";
import { useActivityParticipations, useConfirmDialog, useToast } from "@/presentation/hooks";
import { ROUTES } from "@/lib";
import styles from "./page.module.scss";

const AdminRequestsPage = () => {
  const router = useRouter();
  const { status, data: session } = useSession();
  const { toasts, showToast, removeToast } = useToast();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const { requests, loading, approve, reject } = useActivityParticipations({
    autoFetch: true,
    type: "pending",
  });

  const [filter, setFilter] = useState<string>("all");

  const role = session?.user?.role ?? "VOLUNTEER";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.LOGIN);
    if (role !== "ADMIN") router.replace(ROUTES.VOLUNTEER.PROFILE);
  }, [status, role, router]);

  const handleApprove = async (id: string, volunteerName: string) => {
    const ok = await confirm({
      title: "موافقة على الطلب",
      message: `هل تريد الموافقة على طلب ${volunteerName}؟`,
      confirmText: "موافقة",
      cancelText: "إلغاء",
    });

    if (!ok) return;

    const success = await approve(id);
    if (success) {
      showToast("تمت الموافقة على الطلب", "success");
    } else {
      showToast("فشلت الموافقة", "error");
    }
  };

  const handleReject = async (id: string, volunteerName: string) => {
    const ok = await confirm({
      title: "رفض الطلب",
      message: `هل تريد رفض طلب ${volunteerName}؟`,
      confirmText: "رفض",
      cancelText: "إلغاء",
      variant: "danger",
    });

    if (!ok) return;

    const success = await reject(id);
    if (success) {
      showToast("تم رفض الطلب", "success");
    } else {
      showToast("فشل الرفض", "error");
    }
  };

  const filteredRequests = filter === "all"
    ? requests
    : requests.filter((r) => r.activityId === filter);

  const activities = Array.from(
    new Set(requests.map((r) => r.activityId))
  ).map((id) => {
    const request = requests.find((r) => r.activityId === id);
    return {
      id,
      title: request?.activity?.title || "نشاط",
    };
  });

  if (status === "loading" || loading) {
    return <LoadingState message="جاري التحميل..." />;
  }

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.header}>
          <h1 className={styles.title}>طلبات الانضمام</h1>
      </div>

      <div className={styles.filters}>
        <Filter size={16} className={styles.filterIcon} />
        <button
          className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
          onClick={() => setFilter("all")}
        >
          الكل ({requests.length})
        </button>
        {activities.map((activity) => (
          <button
            key={activity.id}
            className={`${styles.filterBtn} ${filter === activity.id ? styles.active : ""}`}
            onClick={() => setFilter(activity.id)}
          >
            {activity.title} ({requests.filter((r) => r.activityId === activity.id).length})
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          message="لا توجد طلبات معلقة"
        />
      ) : (
        <div className={styles.grid}>
          {filteredRequests.map((request) => (
            <div key={request.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.activityTitle}>
                  {request.activity?.title}
                </h3>
                <span className={styles.badge}>
                  <Clock size={14} />
                  {new Date(request.requestedAt).toLocaleDateString("ar")}
                </span>
              </div>

              <div className={styles.volunteerInfo}>
                <div className={styles.infoRow}>
                  <User size={18} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>اسم المتطوع</span>
                    <span className={styles.infoValue}>
                      {request.volunteer?.fullName}
                    </span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <Mail size={18} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>البريد الإلكتروني</span>
                    <span className={styles.infoValue}>
                      {request.volunteer?.email}
                    </span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <Phone size={18} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>رقم الهاتف</span>
                    <span className={styles.infoValue}>
                      {request.volunteer?.phone}
                    </span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <Calendar size={18} />
                  <div className={styles.infoContent}>
                    <span className={styles.infoLabel}>موعد النشاط</span>
                    <span className={styles.infoValue}>
                      {new Date(request.activity?.date || "").toLocaleDateString("ar")}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.btnReject}
                  onClick={() =>
                    handleReject(request.id, request.volunteer?.fullName || "")
                  }
                >
                  <XCircle size={18} />
                  رفض
                </button>
                <button
                  className={styles.btnApprove}
                  onClick={() =>
                    handleApprove(request.id, request.volunteer?.fullName || "")
                  }
                >
                  <CheckCircle size={18} />
                  موافقة
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog />
    </div>
  );
};

export default AdminRequestsPage;