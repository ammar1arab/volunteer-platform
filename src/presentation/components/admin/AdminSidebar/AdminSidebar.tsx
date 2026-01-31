"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Activity, Users, UserCheck, X } from "lucide-react";
import styles from "./AdminSidebar.module.scss";
import { ROUTES } from "@/lib";

const navItems = [
  { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات", icon: FileText },
  { href: ROUTES.ADMIN.ACTIVITIES, label: "الأنشطة", icon: Activity },
  { href: ROUTES.ADMIN.REQUESTS, label: "الطلبات", icon: UserCheck },
  { href: ROUTES.ADMIN.USERS, label: "المستخدمين", icon: Users },
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
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isOpen ? styles.open : ""}`}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={24} />
        </button>

        <button className={styles.brand} onClick={onToggleCollapse}>
          <LayoutDashboard size={20} />
          {!isCollapsed && <span>Admin</span>}
        </button>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${isActive ? styles.active : ""}`}
                onClick={onClose}
              >
                <Icon size={18} />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;