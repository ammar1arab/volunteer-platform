"use client";

import styles from "./AdminSidebar.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/presentation/constants";
import type { AdminPermission } from "@/core/domain/enums";
import { ConfirmDialog } from "@/presentation/components";
import { useState } from "react";
import {
  FileText,
  Activity,
  Users,
  UserCheck,
  X,
  LogOut,
  Trophy,
  BookOpen,
  Bell,
  Mail,
  ShieldCheck,
  PanelRightClose,
  PanelRightOpen,
  LayoutDashboard,
  Video
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  permission?: AdminPermission;
  superAdminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات", icon: FileText, permission: "MANAGE_POSTS" },
  { href: ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT, label: "أبرز المتطوعين", icon: Trophy, permission: "MANAGE_SPOTLIGHT" },
  { href: ROUTES.ADMIN.MONTHLY_MAGAZINE, label: "حصاد العطاء", icon: BookOpen, permission: "MANAGE_MAGAZINE" },
  { href: ROUTES.ADMIN.REQUESTS, label: "طلبات الانضمام", icon: UserCheck, permission: "MANAGE_REQUESTS" },
  { href: ROUTES.ADMIN.ACTIVITIES, label: "الفرص التطوعية", icon: Activity, permission: "MANAGE_ACTIVITIES" },
  { href: ROUTES.ADMIN.GOOGLE_MEET, label: "الاجتماعات", icon: Video, permission: "MANAGE_MEETINGS" },
  { href: ROUTES.ADMIN.EMAILS, label: "الإيميلات", icon: Mail, permission: "MANAGE_EMAILS" },
  { href: ROUTES.ADMIN.NOTIFICATIONS, label: "الإشعارات", icon: Bell, permission: "MANAGE_NOTIFICATIONS" },
  { href: ROUTES.ADMIN.USERS, label: "المستخدمون", icon: Users, permission: "MANAGE_USERS" },
  { href: ROUTES.ADMIN.PERMISSIONS, label: "الصلاحيات", icon: ShieldCheck, superAdminOnly: true }
];

type Props = {
  isOpen: boolean;
  isCollapsed: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  onToggleCollapse: () => void;
  onClose: () => void;
};

const AdminSidebar = ({
  isOpen,
  isCollapsed,
  isSuperAdmin,
  permissions,
  onToggleCollapse,
  onClose
}: Props) => {
  const [showLogout, setShowLogout] = useState(false);
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => {
    if (item.superAdminOnly) return isSuperAdmin;
    return isSuperAdmin || (item.permission ? permissions.includes(item.permission) : false);
  });

  return (
    <>
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isOpen ? styles.open : ""}`}
        aria-label="القائمة"
      >
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className={styles.head}>
          <button
            type="button"
            className={styles.brand}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
            title={isCollapsed ? "توسيع" : "طي"}
          >
            <span className={styles.brandIcon}>
              <LayoutDashboard size={15} strokeWidth={1.75} />
            </span>
          </button>

          <button
            type="button"
            className={styles.collapseBtn}
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
            title={isCollapsed ? "توسيع" : "طي"}
          >
            {isCollapsed ? (
              <PanelRightOpen size={15} strokeWidth={1.75} />
            ) : (
              <PanelRightClose size={15} strokeWidth={1.75} />
            )}
          </button>
        </div>

        <nav className={styles.nav}>
          {items.map((item, i) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${active ? styles.active : ""}`}
                style={{ "--i": i } as React.CSSProperties}
                title={isCollapsed ? item.label : undefined}
                aria-current={active ? "page" : undefined}
              >
                <span className={styles.icon}>
                  <item.icon size={16} strokeWidth={1.75} />
                </span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.logout}
            onClick={() => setShowLogout(true)}
            title={isCollapsed ? "تسجيل الخروج" : undefined}
          >
            <span className={styles.icon}>
              <LogOut size={16} strokeWidth={1.75} />
            </span>
            <span className={styles.label}>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {isOpen && (
        <button
          type="button"
          className={styles.overlay}
          data-lock-scroll=""
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          aria-label="إغلاق القائمة"
        />
      )}

      <ConfirmDialog
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => signOut({ callbackUrl: "/" })}
        title="تسجيل الخروج"
        message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        variant="danger"
      />
    </>
  );
};

export default AdminSidebar;
