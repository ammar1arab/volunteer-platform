"use client";

import styles from "./AdminSidebar.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/presentation/constants";
import { ConfirmDialog } from "@/presentation/components";

import {
  LayoutDashboard,
  FileText,
  Activity,
  Users,
  UserCheck,
  X,
  LogOut,
  Trophy,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات", icon: FileText },
  { href: ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT, label: "أبرز المتطوعين", icon: Trophy },
  { href: ROUTES.ADMIN.MONTHLY_MAGAZINE, label: "حصاد العطاء", icon: BookOpen },
  { href: ROUTES.ADMIN.ACTIVITIES, label: "الفرص التطوعية", icon: Activity },
  { href: ROUTES.ADMIN.REQUESTS, label: "طلبات الانضمام", icon: UserCheck },
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.link} ${isActive ? styles.active : ""}`}
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
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