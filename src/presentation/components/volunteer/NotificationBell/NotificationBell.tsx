"use client";
import { Bell } from "lucide-react";
import styles from "./NotificationBell.module.scss";
import { useNotificationsContext } from "@/presentation/context/NotificationsContext";
import NotificationDropdown from "../NotificationDropdown/NotificationDropdown";

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const NotificationBell = ({ isOpen, onToggle, onClose }: Props) => {
  const { list, unreadCount, loading, markAsRead, markAllAsRead, clearHistory } =
    useNotificationsContext();

  return (
    <div className={styles.wrapper}>
      <button
        key={unreadCount}
        className={`${styles.bell} ${unreadCount > 0 ? styles.pulse : ""} ${isOpen ? styles.active : ""}`}
        onMouseDown={(e) => { e.stopPropagation(); onToggle(); }}
        aria-label="الإشعارات"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          list={list}
          isLoading={loading}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearHistory={clearHistory}
          onClose={onClose}
        />
      )}
    </div>
  );
};

export default NotificationBell;