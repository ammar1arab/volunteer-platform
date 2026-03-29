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
  LayoutDashboard, FileText, Activity, Users,
  UserCheck, X, LogOut, Trophy, BookOpen, Bell, Mail, ShieldCheck
} from "lucide-react";

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: React.ElementType;
  permission: AdminPermission;
  color: string;
}[] = [
    { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات", icon: FileText, permission: "MANAGE_POSTS", color: "#6366f1" },
    { href: ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT, label: "أبرز المتطوعين", icon: Trophy, permission: "MANAGE_SPOTLIGHT", color: "#f59e0b" },
    { href: ROUTES.ADMIN.MONTHLY_MAGAZINE, label: "حصاد العطاء", icon: BookOpen, permission: "MANAGE_MAGAZINE", color: "#ec4899" },
    { href: ROUTES.ADMIN.REQUESTS, label: "طلبات الانضمام", icon: UserCheck, permission: "MANAGE_REQUESTS", color: "#3b82f6" },
    { href: ROUTES.ADMIN.ACTIVITIES, label: "الفرص التطوعية", icon: Activity, permission: "MANAGE_ACTIVITIES", color: "#10b981" },
    { href: ROUTES.ADMIN.EMAILS, label: "إدارة الإيميلات", icon: Mail, permission: "MANAGE_EMAILS", color: "#8b5cf6" },
    { href: ROUTES.ADMIN.NOTIFICATIONS, label: "إدارة الإشعارات", icon: Bell, permission: "MANAGE_NOTIFICATIONS", color: "#f97316" },
    { href: ROUTES.ADMIN.USERS, label: "إدارة المستخدمين", icon: Users, permission: "MANAGE_USERS", color: "#14b8a6" },
  ];

const PERMISSIONS_ITEM = {
  href: ROUTES.ADMIN.PERMISSIONS,
  label: "إدارة الصلاحيات",
  icon: ShieldCheck,
  color: "#64748b",
};

type Props = {
  isOpen: boolean;
  isCollapsed: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  onToggleCollapse: () => void;
  onClose: () => void;
};

const AdminSidebar = ({ isOpen, isCollapsed, isSuperAdmin, permissions, onToggleCollapse, onClose }: Props) => {
  const [showLogout, setShowLogout] = useState(false);
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(({ permission }) =>
    isSuperAdmin || permissions.includes(permission)
  );

  const closeOnMobile = () => { if (window.innerWidth < 1024) onClose(); };

  const renderLink = (item: typeof visibleItems[0] | typeof PERMISSIONS_ITEM, i: number) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`${styles.link} ${isActive ? styles.active : ""}`}
        style={{ "--c": item.color, "--i": i } as React.CSSProperties}
        onClick={closeOnMobile}
      >
        <span className={styles.iconWrap}>
          <item.icon size={17} />
        </span>
        <span className={styles.label}>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
          <X size={18} />
        </button>

        <button className={styles.brand} onClick={onToggleCollapse}>
          <LayoutDashboard size={20} />
          <span>لوحة التحكم</span>
        </button>

        <nav className={styles.nav}>
          {visibleItems.map((item, i) => renderLink(item, i))}
          {isSuperAdmin && renderLink(PERMISSIONS_ITEM, visibleItems.length)}
        </nav>

        <div className={styles.footer}>
          <button className={styles.logout} onClick={() => setShowLogout(true)}>
            <LogOut size={17} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {isOpen && <div className={styles.overlay} onClick={onClose} />}

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