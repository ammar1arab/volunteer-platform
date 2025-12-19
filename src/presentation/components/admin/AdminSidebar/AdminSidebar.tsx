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
      </nav>
    </aside>
  );
};

export default AdminSidebar;
