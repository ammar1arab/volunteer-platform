import { Activity, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/presentation/components";
import styles from "./UserStatsCard.module.scss";

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  variant: "primary" | "success" | "warning" | "danger";
  percentage?: number;
}

interface UserStatsCardProps {
  stats: {
    totalActivities: number;
    approvedActivities: number;
    pendingRequests: number;
    rejectedRequests: number;
  };
}

const UserStatsCard = ({ stats }: UserStatsCardProps) => {
  const totalRequests = stats.approvedActivities + stats.pendingRequests + stats.rejectedRequests;
  const approvalRate = totalRequests > 0 
    ? Math.round((stats.approvedActivities / totalRequests) * 100) 
    : 0;

  const statItems: StatItem[] = [
    {
      label: "إجمالي الفرص",
      value: stats.totalActivities,
      icon: <Activity size={24} />,
      variant: "primary",
    },
    {
      label: "تم القبول",
      value: stats.approvedActivities,
      icon: <CheckCircle size={24} />,
      variant: "success",
      percentage: approvalRate,
    },
    {
      label: "قيد الانتظار",
      value: stats.pendingRequests,
      icon: <Clock size={24} />,
      variant: "warning",
    },
    {
      label: "تم الرفض",
      value: stats.rejectedRequests,
      icon: <XCircle size={24} />,
      variant: "danger",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {statItems.map((item, index) => (
          <div key={index} className={styles.card} data-variant={item.variant}>
            <div className={styles.cardInner}>
              <div className={styles.iconWrapper}>
                {item.icon}
              </div>
              <div className={styles.content}>
                <div className={styles.valueGroup}>
                  <span className={styles.value}>{item.value}</span>
                  {item.percentage !== undefined && (
                    <Badge variant="success">
                      <TrendingUp size={12} />
                      <span>{item.percentage}%</span>
                    </Badge>
                  )}
                </div>
                <span className={styles.label}>{item.label}</span>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ 
                  width: `${item.percentage !== undefined ? item.percentage : (item.value / (stats.totalActivities || 1)) * 100}%` 
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserStatsCard;