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
}[] = [
  { href: ROUTES.ADMIN.FEATURED_POSTS,      label: "المنشورات",        icon: FileText,  permission: "MANAGE_POSTS"         },
  { href: ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT, label: "أبرز المتطوعين",   icon: Trophy,    permission: "MANAGE_SPOTLIGHT"     },
  { href: ROUTES.ADMIN.MONTHLY_MAGAZINE,    label: "حصاد العطاء",      icon: BookOpen,  permission: "MANAGE_MAGAZINE"      },
  { href: ROUTES.ADMIN.ACTIVITIES,          label: "الفرص التطوعية",   icon: Activity,  permission: "MANAGE_ACTIVITIES"    },
  { href: ROUTES.ADMIN.REQUESTS,            label: "طلبات الانضمام",   icon: UserCheck, permission: "MANAGE_REQUESTS"      },
  { href: ROUTES.ADMIN.NOTIFICATIONS,       label: "إدارة الإشعارات",  icon: Bell,      permission: "MANAGE_NOTIFICATIONS" },
  { href: ROUTES.ADMIN.EMAILS,              label: "إدارة الإيميلات",  icon: Mail,      permission: "MANAGE_EMAILS"        },
  { href: ROUTES.ADMIN.USERS,               label: "إدارة المستخدمين", icon: Users,     permission: "MANAGE_USERS"         },
];

type Props = {
  isOpen: boolean;
  isCollapsed: boolean;
  isSuperAdmin: boolean;
  permissions: string[];
  onToggleCollapse: () => void;
  onClose: () => void;
};

const AdminSidebar = ({ isOpen, isCollapsed, isSuperAdmin, permissions, onToggleCollapse, onClose }: Props) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(({ permission }) =>
    isSuperAdmin || permissions.includes(permission)
  );

  const handleClose = () => { if (window.innerWidth < 1024) onClose(); };

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
            {visibleItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.link} ${isActive ? styles.active : ""}`}
                  onClick={handleClose}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              );
            })}

            {isSuperAdmin && (
              <Link
                href={ROUTES.ADMIN.PERMISSIONS}
                className={`${styles.link} ${pathname.startsWith(ROUTES.ADMIN.PERMISSIONS) ? styles.active : ""}`}
                onClick={handleClose}
              >
                <ShieldCheck size={20} />
                <span>الصلاحيات</span>
              </Link>
            )}

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