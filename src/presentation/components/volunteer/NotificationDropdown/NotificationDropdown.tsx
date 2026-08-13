"use client";
import { useRouter } from "next/navigation";
import {
  Bell, CheckCheck, Clock, Trash2,
  Gift, CheckCircle, XCircle, Award,
  Megaphone, Sprout, Flame, Crown, Rocket, Ban, Users,
} from "lucide-react";
import styles from "./NotificationDropdown.module.scss";
import type { NotificationDto } from "@/core/application/dtos";
import type { NotificationMetadata } from "@/core/domain/interfaces";
import { NotificationType } from "@/core/domain/enums";
import { relativeTime } from "@/lib/utils";

interface Props {
  list: NotificationDto[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => Promise<boolean>;
  onMarkAllAsRead: () => Promise<boolean>;
  onClearHistory: () => Promise<boolean>;
  onClose: () => void;
}

const getNotificationIcon = (type: string, metadata?: NotificationMetadata | null) => {
  if (type === NotificationType.HOURS_MILESTONE) {
    const map: Record<string, React.ReactNode> = {
      Sprout: <Sprout size={15} />,
      Award: <Award size={15} />,
      Flame: <Flame size={15} />,
      Crown: <Crown size={15} />,
      Rocket: <Rocket size={15} />,
    };
    return map[metadata?.icon ?? ""] ?? <Award size={15} />;
  }
  const map: Partial<Record<string, React.ReactNode>> = {
    [NotificationType.WELCOME]: <Gift size={15} />,
    [NotificationType.PARTICIPATION_APPROVED]: <CheckCircle size={15} />,
    [NotificationType.PARTICIPATION_REJECTED]: <XCircle size={15} />,
    [NotificationType.ACTIVITY_REMINDER]: <Bell size={15} />,
    [NotificationType.CERTIFICATE_ISSUED]: <Award size={15} />,
    [NotificationType.ANNOUNCEMENT]: <Megaphone size={15} />,
    [NotificationType.ACTIVITY_CANCELLED]: <Ban size={15} />,
    [NotificationType.ACTIVITY_FULL]: <Users size={15} />,
  };
  return map[type] ?? <Bell size={15} />;
};

const NotificationDropdown = ({
  list, isLoading, onMarkAsRead, onMarkAllAsRead, onClearHistory, onClose,
}: Props) => {
  const router = useRouter();
  const hasUnread = list.some(n => !n.isRead);

  const handleItem = (e: React.MouseEvent, n: NotificationDto) => {
    e.stopPropagation();
    onClose();
    if (!n.isRead) onMarkAsRead(n.id);
    if (n.link) router.push(n.link);
  };

  if (isLoading && list.length === 0) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.loadingWrap}><div className={styles.spinner} /></div>
      </div>
    );
  }

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <span className={styles.title}>الإشعارات</span>
        <div className={styles.actions}>
          {hasUnread && (
            <button className={styles.actionBtn} onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onMarkAllAsRead(); }}>
              <CheckCheck size={13} /> قراءة الكل
            </button>
          )}
          {list.length > 0 && (
            <button className={`${styles.actionBtn} ${styles.danger}`} onMouseDown={e => { e.preventDefault(); e.stopPropagation(); onClearHistory(); }}>
              <Trash2 size={13} /> مسح الكل
            </button>
          )}
        </div>
      </div>

      <div className={`${styles.list} no-scrollbar`}>
        {list.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={32} strokeWidth={1.5} />
            <span>لا توجد إشعارات</span>
          </div>
        ) : (
          list.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.isRead ? styles.unread : ""} ${n.link ? styles.clickable : ""}`}
              onMouseDown={e => handleItem(e, n)}
            >
              <div className={`${styles.iconWrap} ${styles[`icon_${n.type}`] ?? ""}`}>
                {getNotificationIcon(n.type, n.metadata ?? undefined)}
                {!n.isRead && <span className={styles.dot} />}
              </div>
              <div className={styles.content}>
                <p className={styles.itemTitle}>{n.title}</p>
                <p className={styles.message}>{n.message}</p>
                <span className={styles.time}>
                  <Clock size={10} /> {relativeTime(n.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;