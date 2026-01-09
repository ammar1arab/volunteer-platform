"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Activity, Users, UserCheck, ChevronDown, ChevronUp } from "lucide-react";
import styles from "./AdminSidebar.module.scss";
import { ROUTES } from "@/lib";

const AdminSidebar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const navItems = [
    {
      href: ROUTES.ADMIN.DASHBOARD,
      label: "لوحة التحكم",
      icon: LayoutDashboard,
    },
    {
      href: ROUTES.ADMIN.FEATURED_POSTS,
      label: "المنشورات",
      icon: FileText,
    },
    {
      href: ROUTES.ADMIN.ACTIVITIES,
      label: "الأنشطة",
      icon: Activity,
    },
    {
      href: ROUTES.ADMIN.REQUESTS,
      label: "الطلبات",
      icon: UserCheck,
    },
    {
      href: ROUTES.ADMIN.USERS,
      label: "المستخدمين",
      icon: Users,
    },
  ];

  const handleBrandClick = (e: React.MouseEvent) => {
    // Only toggle on mobile, on desktop navigate normally
    if (window.innerWidth <= 1024) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <aside className={styles.sidebar} aria-label="لوحة إدارة">
      <div 
        className={styles.brand}
        onClick={handleBrandClick}
      >
        <Link href={ROUTES.ADMIN.DASHBOARD} className={styles.brandLink}>
          <div className={styles.brandIcon}>
            <LayoutDashboard size={20} />
          </div>
          <span className={styles.brandText}>Admin</span>
        </Link>
        <button 
          className={styles.toggleIcon}
          onClick={handleBrandClick}
          aria-label={isOpen ? "Hide menu" : "Show menu"}
          type="button"
        >
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      <nav className={`${styles.nav} ${isOpen ? styles.navOpen : styles.navClosed}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.link} ${active ? styles.active : ""}`}
            >
              <Icon size={18} className={styles.linkIcon} />
              <span className={styles.linkText}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;