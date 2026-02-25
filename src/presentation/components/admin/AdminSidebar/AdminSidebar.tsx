"use client";

import styles from "./AdminSidebar.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ROUTES } from "@/presentation/constants";
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

const navItems = [
  { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات", icon: FileText },
  { href: ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT, label: "أبرز المتطوعين", icon: Trophy },
  { href: ROUTES.ADMIN.MONTHLY_MAGAZINE, label: "المجلة الشهرية", icon: BookOpen },
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
  const pathname = usePathname();

  return (
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

          <button className={`${styles.link} ${styles.logout}`} onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;