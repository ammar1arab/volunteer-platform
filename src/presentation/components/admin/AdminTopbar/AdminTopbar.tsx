"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import styles from "./AdminTopbar.module.scss";
import { ROUTES, getPermissionLabel, getRequiredPermission } from "@/presentation/constants";

type Props = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const AdminTopbar = ({ onMenuClick, isMenuOpen }: Props) => {
  const { data } = useSession();
  const pathname = usePathname();
  const name = data?.user?.name || "Admin";
  const requiredPermission = getRequiredPermission(pathname);
  const title =
    pathname === ROUTES.ADMIN.PERMISSIONS || pathname.startsWith(`${ROUTES.ADMIN.PERMISSIONS}/`)
      ? "إدارة الصلاحيات"
      : requiredPermission
        ? getPermissionLabel(requiredPermission)
        : "لوحة التحكم";

  return (
    <header className={styles.bar}>
      <div className={styles.start}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {isMenuOpen ? <X size={18} strokeWidth={1.75} /> : <Menu size={18} strokeWidth={1.75} />}
        </button>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>لوحة التحكم</p>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </div>

      <div className={styles.user}>
        <span className={styles.userName}>{name}</span>
      </div>
    </header>
  );
};

export default AdminTopbar;
