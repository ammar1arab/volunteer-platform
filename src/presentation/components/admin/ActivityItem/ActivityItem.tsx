import { Calendar, Clock, MapPin } from "lucide-react";
import styles from "./ActivityItem.module.scss";
import { Badge } from "@/presentation/components";
import { getMonthLabel } from "@/presentation/constants";

type Status = "PENDING" | "APPROVED" | "REJECTED";

type Props = {
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  status: Status;
  requestedAt: string;
};

const ActivityItem = ({ title, description, date, startTime, endTime, placeName, status, requestedAt }: Props) => {
  const formatDate = (d: string) => {
    const dt = new Date(d);
    return `${dt.getDate()} ${getMonthLabel(dt.getMonth() + 1)} ${dt.getFullYear()}`;
  };

  const getStatusVariant = (): "success" | "danger" | "warning" => {
    if (status === "APPROVED") return "success";
    if (status === "REJECTED") return "danger";
    return "warning";
  };

  const getStatusLabel = (): string => {
    if (status === "APPROVED") return "موافق عليه";
    if (status === "REJECTED") return "مرفوض";
    return "قيد الانتظار";
  };

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <Badge variant={getStatusVariant()}>{getStatusLabel()}</Badge>
      </div>

      <p className={styles.description}>{description}</p>

      <div className={styles.details}>
        <div className={styles.detail}>
          <Calendar size={14} />
          <span>{formatDate(date)}</span>
        </div>
        <div className={styles.detail}>
          <Clock size={14} />
          <span>{startTime} - {endTime}</span>
        </div>
        <div className={styles.detail}>
          <MapPin size={14} />
          <span>{placeName}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.requested}>طلب الانضمام: {formatDate(requestedAt)}</span>
      </div>
    </div>
  );
};

export default ActivityItem;