"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import styles from "./AdminTopbar.module.scss";
import { ROUTES } from "@/presentation/constants";

const navItems = [
  { href: ROUTES.ADMIN.FEATURED_POSTS, label: "المنشورات" },
  { href: ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT, label: "أبرز المتطوعين" },
  { href: ROUTES.ADMIN.MONTHLY_MAGAZINE, label: "حصاد العطاء" },
  { href: ROUTES.ADMIN.ACTIVITIES, label: "الفرص التطوعية" },
  { href: ROUTES.ADMIN.REQUESTS, label: "طلبات الانضمام" },
  { href: ROUTES.ADMIN.USERS, label: "إدارة المستخدمين" },
];

type Props = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const AdminTopbar = ({ onMenuClick, isMenuOpen }: Props) => {
  const { data } = useSession();
  const pathname = usePathname();
  const name = data?.user?.name || "Ammar";

  const currentItem = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  return (
    <header className={styles.bar}>
      <div className={styles.rightSide}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className={styles.title}>{currentItem?.label || "لوحة التحكم"}</h1>
      </div>

      <div className={styles.userBadge}>
        <span className={styles.userName}>{name}</span>
      </div>
    </header>
  );
};

export default AdminTopbar;