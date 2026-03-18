"use client";

import { useEffect, useRef, useState } from "react";
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
  const [animate, setAnimate] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const { list, unreadCount, loading, markAsRead, markAllAsRead, clearHistory } =
    useNotificationsContext();

  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setAnimate(true);
      prevCountRef.current = unreadCount;
      const t = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(t);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={`${styles.bell} ${animate ? styles.pulse : ""} ${isOpen ? styles.active : ""}`}
        onClick={onToggle}
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