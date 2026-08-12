"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import styles from "./AdminTopbar.module.scss";
import { ROUTES } from "@/presentation/constants";

const TITLES: Record<string, string> = {
  [ROUTES.ADMIN.FEATURED_POSTS]: "المنشورات",
  [ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT]: "أبرز المتطوعين",
  [ROUTES.ADMIN.MONTHLY_MAGAZINE]: "حصاد العطاء",
  [ROUTES.ADMIN.ACTIVITIES]: "الفرص التطوعية",
  [ROUTES.ADMIN.REQUESTS]: "طلبات الانضمام",
  [ROUTES.ADMIN.NOTIFICATIONS]: "إدارة الإشعارات",
  [ROUTES.ADMIN.EMAILS]: "إدارة الإيميلات",
  [ROUTES.ADMIN.USERS]: "إدارة المستخدمين",
  [ROUTES.ADMIN.PERMISSIONS]: "إدارة الصلاحيات",
};

type Props = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const AdminTopbar = ({ onMenuClick, isMenuOpen }: Props) => {
  const { data } = useSession();
  const pathname = usePathname();
  const name = data?.user?.name || "Admin";
  const title =
    Object.entries(TITLES).find(([href]) => pathname === href || pathname.startsWith(`${href}/`))?.[1] ??
    "لوحة التحكم";

  return (
    <header className={styles.bar}>
      <div className={styles.start}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      <span className={styles.user}>{name}</span>
    </header>
  );
};

export default AdminTopbar;
