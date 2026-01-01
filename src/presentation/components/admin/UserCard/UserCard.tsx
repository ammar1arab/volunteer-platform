import Link from "next/link";
import { User, Mail, Phone, Calendar, Activity, ChevronRight, CheckCircle, Clock, XCircle } from "lucide-react";
import styles from "./UserCard.module.scss";
import type { UserAnalyticsDto } from "@/core/application/dtos";

interface UserCardProps {
  user: UserAnalyticsDto;
}

const UserCard = ({ user }: UserCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-JO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isAdmin = user.role === "ADMIN";

  const cardContent = (
    <>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          <User size={28} />
        </div>
        <div className={styles.details}>
          <div className={styles.nameGroup}>
            <h3 className={styles.name}>{user.fullName}</h3>
            <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase()]}`}>
              {user.role === "ADMIN" ? "ADMIN" : "متطوع"}
            </span>
            {!user.isActive && (
              <span className={styles.inactiveBadge}>غير نشط</span>
            )}
          </div>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
            <div className={styles.contactItem}>
              <Phone size={14} />
              <span>{user.phone}</span>
            </div>
            <div className={styles.contactItem}>
              <Calendar size={14} />
              <span>انضم {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {!isAdmin && (
        <>
          <div className={styles.statsGroup}>
            <div className={styles.statCard} data-variant="total">
              <Activity size={18} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{user.stats.totalActivities}</span>
                <span className={styles.statLabel}>إجمالي</span>
              </div>
            </div>

            <div className={styles.statCard} data-variant="success">
              <CheckCircle size={18} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{user.stats.approvedActivities}</span>
                <span className={styles.statLabel}>مقبول</span>
              </div>
            </div>

            <div className={styles.statCard} data-variant="warning">
              <Clock size={18} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{user.stats.pendingRequests}</span>
                <span className={styles.statLabel}>انتظار</span>
              </div>
            </div>

            <div className={styles.statCard} data-variant="danger">
              <XCircle size={18} />
              <div className={styles.statContent}>
                <span className={styles.statValue}>{user.stats.rejectedRequests}</span>
                <span className={styles.statLabel}>مرفوض</span>
              </div>
            </div>
          </div>

          <div className={styles.action}>
            <ChevronRight size={20} />
          </div>
        </>
      )}
    </>
  );

  if (isAdmin) {
    return (
      <div className={`${styles.row} ${styles.nonClickable}`}>
        {cardContent}
      </div>
    );
  }

  return (
    <Link href={`/admin/dashboard/users/${user.id}`} className={styles.row}>
      {cardContent}
    </Link>
  );
};

export default UserCard;