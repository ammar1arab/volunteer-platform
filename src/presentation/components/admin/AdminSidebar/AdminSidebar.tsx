"use client";

import styles from "./AdminSidebar.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/presentation/constants";
import { ConfirmDialog } from "@/presentation/components";
import { useState } from "react";
import {
  LayoutDashboard, FileText, Activity, Users,
  UserCheck, X, LogOut, Trophy, BookOpen, Bell, Mail
} from "lucide-react";

const navItems = [
  { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات", icon: FileText },
  { href: ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT, label: "أبرز المتطوعين", icon: Trophy },
  { href: ROUTES.ADMIN.MONTHLY_MAGAZINE, label: "حصاد العطاء", icon: BookOpen },
  { href: ROUTES.ADMIN.ACTIVITIES, label: "الفرص التطوعية", icon: Activity },
  { href: ROUTES.ADMIN.REQUESTS, label: "طلبات الانضمام", icon: UserCheck },
  { href: ROUTES.ADMIN.NOTIFICATIONS, label: "إدارة الإشعارات", icon: Bell },
  { href: ROUTES.ADMIN.EMAILS, label: "إدارة الإيميلات", icon: Mail },
  { href: ROUTES.ADMIN.USERS, label: "إدارة المستخدمين", icon: Users },
];

type Props = {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
};

const AdminSidebar = ({ isOpen, isCollapsed, onToggleCollapse, onClose }: Props) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.content}>
          <div className={styles.brand} onClick={onToggleCollapse}>
            <LayoutDashboard size={22} />
            <span>Admin Dashboard</span>
          </div>

          <nav className={styles.nav}>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.link} ${isActive ? styles.active : ""}`}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}

            <button
              className={`${styles.link} ${styles.logout}`}
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </nav>
        </div>
      </aside>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
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