"use client";

import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Clock, Trash2 } from "lucide-react";
import styles from "./NotificationDropdown.module.scss";
import type { NotificationDto } from "@/core/application/dtos";
import { relativeTime } from "@/lib/utils";

interface Props {
  list: NotificationDto[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => Promise<boolean>;
  onMarkAllAsRead: () => Promise<boolean>;
  onClearHistory: () => Promise<boolean>;
  onClose: () => void;
}

const NotificationDropdown = ({
  list,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearHistory,
  onClose,
}: Props) => {
  const router = useRouter();
  const hasUnread = list.some((n) => !n.isRead);

  const handleItem = (e: React.MouseEvent, n: NotificationDto) => {
    e.stopPropagation();
    onClose();
    if (!n.isRead) onMarkAsRead(n.id);
    if (n.link) router.push(n.link);
  };

  const handleMarkAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onMarkAllAsRead();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClearHistory();
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
        <div className={styles.actions}>
          {hasUnread && (
            <button className={styles.actionBtn} onMouseDown={handleMarkAll}>
              <CheckCheck size={13} />
              قراءة الكل
            </button>
          )}
          {list.length > 0 && (
            <button
              className={`${styles.actionBtn} ${styles.danger}`}
              onMouseDown={handleClear}
            >
              <Trash2 size={13} />
              مسح الكل
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
          list.map((n) => (
            <div
              key={n.id}
              className={`${styles.item} ${!n.isRead ? styles.unread : ""} ${n.link ? styles.clickable : ""
                }`}
              onMouseDown={(e) => handleItem(e, n)}
            >
              <div className={styles.iconWrap}>
                <Bell size={15} />
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