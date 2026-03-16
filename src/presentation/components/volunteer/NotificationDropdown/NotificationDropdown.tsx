'use client';

import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import styles from './NotificationDropdown.module.scss';
import type { NotificationDto } from '@/core/application/dtos';

interface Props {
  list: NotificationDto[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => Promise<boolean>;
  onMarkAllAsRead: () => Promise<boolean>;
  onClose: () => void;
}

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'منذ لحظات';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

const NotificationDropdown = ({ list, isLoading, onMarkAsRead, onMarkAllAsRead, onClose }: Props) => {
  const router = useRouter();
  const hasUnread = list.some(n => !n.isRead);

  const handleItemMouseDown = (e: React.MouseEvent, n: NotificationDto) => {
    e.stopPropagation(); // ← stops the NotificationBell outside-click handler
    onClose();
    if (!n.isRead) onMarkAsRead(n.id);
    router.push(n.link);
  };

  if (isLoading && list.length === 0) {
    return (
      <div className={styles.dropdown}>
        <div className={styles.loadingWrap}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dropdown}>
      <div className={styles.header}>
        <span className={styles.title}>الإشعارات</span>
        {hasUnread && (
          <button
            className={styles.markAllBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMarkAllAsRead();
            }}
          >
            <CheckCheck size={14} />
            تحديد الكل
          </button>
        )}
      </div>

      <div className={styles.list}>
        {list.length === 0 ? (
          <div className={styles.empty}>
            <Bell size={32} strokeWidth={1.5} />
            <span>لا توجد إشعارات حالياً</span>
          </div>
        ) : (
          list.map(n => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.isRead ? styles.unread : ''}`}
              onMouseDown={(e) => handleItemMouseDown(e, n)}
            >
              <div className={styles.iconWrap}>
                <Bell size={16} />
                {!n.isRead && <span className={styles.dot} />}
              </div>
              <div className={styles.content}>
                <p className={styles.itemTitle}>{n.title}</p>
                <p className={styles.message}>{n.message}</p>
                <span className={styles.time}>
                  <Clock size={10} />
                  {relativeTime(n.createdAt)}
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
