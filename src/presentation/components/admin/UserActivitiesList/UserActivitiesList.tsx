import { Calendar, MapPin, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react";
import styles from "./UserActivitiesList.module.scss";
import type { UserActivityDto } from "@/core/application/dtos";

interface UserActivitiesListProps {
  activities: UserActivityDto[];
  isLoading?: boolean;
}

const UserActivitiesList = ({ activities, isLoading }: UserActivitiesListProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("ar-JO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("ar-JO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APPROVED":
        return {
          icon: <CheckCircle size={20} />,
          text: "تم القبول",
          variant: "success",
        };
      case "PENDING":
        return {
          icon: <Clock size={20} />,
          text: "قيد الانتظار",
          variant: "warning",
        };
      case "REJECTED":
        return {
          icon: <XCircle size={20} />,
          text: "تم الرفض",
          variant: "danger",
        };
      default:
        return {
          icon: <Clock size={20} />,
          text: status,
          variant: "warning",
        };
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>جاري تحميل الأنشطة...</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <MapPin size={48} />
        </div>
        <h3>لا توجد أنشطة</h3>
        <p>لم يشارك المستخدم في أي أنشطة بعد</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {activities.map((activity, index) => {
        const statusConfig = getStatusConfig(activity.status);
        
        return (
          <div 
            key={activity.id} 
            className={styles.item} 
            data-status={activity.status.toLowerCase()}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className={styles.statusIndicator} data-variant={statusConfig.variant} />
            
            <div className={styles.content}>
              <div className={styles.header}>
                <h4 className={styles.title}>{activity.activityTitle}</h4>
                <div className={styles.statusBadge} data-variant={statusConfig.variant}>
                  {statusConfig.icon}
                  <span>{statusConfig.text}</span>
                </div>
              </div>

              <div className={styles.details}>
                <div className={styles.detailRow}>
                  <Calendar size={16} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>تاريخ النشاط</span>
                    <span className={styles.detailValue}>{formatDate(activity.activityDate)}</span>
                  </div>
                </div>

                <div className={styles.detailRow}>
                  <Clock size={16} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>تاريخ الطلب</span>
                    <span className={styles.detailValue}>
                      {formatDate(activity.requestedAt)} • {formatTime(activity.requestedAt)}
                    </span>
                  </div>
                </div>

                {activity.respondedAt && (
                  <div className={styles.detailRow}>
                    <CheckCircle size={16} />
                    <div className={styles.detailContent}>
                      <span className={styles.detailLabel}>تاريخ الرد</span>
                      <span className={styles.detailValue}>
                        {formatDate(activity.respondedAt)} • {formatTime(activity.respondedAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.arrow}>
              <ArrowRight size={18} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UserActivitiesList;