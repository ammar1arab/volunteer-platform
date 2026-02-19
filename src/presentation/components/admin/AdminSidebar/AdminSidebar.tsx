"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, FileText, Activity, Users, UserCheck, X, LogOut, Trophy, BookOpen } from "lucide-react";
import styles from "./AdminSidebar.module.scss";
import { ROUTES } from "@/presentation/constants";

const navItems = [
  { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات", icon: FileText },
  { href: ROUTES.ADMIN.ACTIVITIES, label: "الفرص التطوعية", icon: Activity },
  { href: ROUTES.ADMIN.MAGAZINE, label: "المجلة الشهرية", icon: BookOpen },
  { href: ROUTES.ADMIN.SUCCESS_STORIES, label: "ابرز المتطوعين", icon: Trophy },
  { href: ROUTES.ADMIN.REQUESTS, label: "طلبات الانضمام", icon: UserCheck },
  { href: ROUTES.ADMIN.USERS, label: "ادارة المستخدمين", icon: Users },
  { href: ROUTES.HOME, label: "تسجيل الخروج", icon: LogOut, isLogout: true },
];

type Props = {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
};

const AdminSidebar = ({ isOpen, isCollapsed, onToggleCollapse, onClose }: Props) => {
  const pathname = usePathname();

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.isLogout) {
      signOut({ callbackUrl: "/" });
    } else {
      onClose();
    }
  };

  // ملاحظة: قمنا بإزالة الشروط (!isCollapsed &&) من جميع العناصر النصية
  // CSS هو المسؤول الآن عن إخفائها وتوسيط الأيقونات

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isOpen ? styles.open : ""}`}>
      <button className={styles.closeBtn} onClick={onClose}>
        <X size={22} />
      </button>

      <div className={styles.content}>
        <button className={styles.brand} onClick={onToggleCollapse}>
          <LayoutDashboard size={20} />
          <span>لوحة التحكم</span>
        </button>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.isLogout && (pathname === item.href || pathname.startsWith(`${item.href}/`));

            if (item.isLogout) {
              return (
                <button key={item.label} className={`${styles.link} ${styles.logout}`} onClick={() => handleItemClick(item)}>
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <Link key={item.href} href={item.href} className={`${styles.link} ${isActive ? styles.active : ""}`} onClick={() => handleItemClick(item)}>
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default AdminSidebar;