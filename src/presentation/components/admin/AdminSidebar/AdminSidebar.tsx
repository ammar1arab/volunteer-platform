"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AdminSidebar.module.scss";
import { ROUTES } from "@/lib";

const AdminSidebar = () => {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className={styles.sidebar} aria-label="لوحة إدارة">
      <Link href={ROUTES.ADMIN.DASHBOARD} className={styles.brand}>
        Admin Dashboard
      </Link>

      <nav className={styles.nav}>
        <Link
          href={ROUTES.ADMIN.FEATURED_POSTS}
          className={`${styles.link} ${isActive(ROUTES.ADMIN.FEATURED_POSTS) ? styles.active : ""}`}
        >
          إدارة المنشورات
        </Link>
        <Link
          href={ROUTES.ADMIN.ACTIVITIES}
          className={`${styles.link} ${isActive(ROUTES.ADMIN.ACTIVITIES) ? styles.active : ""}`}
        >
          إدارة الأنشطة
        </Link>
        <Link
          href={ROUTES.ADMIN.REQUESTS}
          className={`${styles.link} ${isActive(ROUTES.ADMIN.REQUESTS) ? styles.active : ""}`}
        >
          طلبات الانضمام
        </Link>
        <Link
          href={ROUTES.ADMIN.USERS}
          className={`${styles.link} ${isActive(ROUTES.ADMIN.USERS) ? styles.active : ""}`}
        >
          إدارة المستخدمين
        </Link>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
