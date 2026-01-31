"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import styles from "./AdminTopbar.module.scss";

type Props = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const AdminTopbar = ({ onMenuClick, isMenuOpen }: Props) => {
  const { data } = useSession();
  const name = data?.user?.name || "Admin";

  const handleSignOut = () => signOut({ callbackUrl: "/" });
  return (
    <header className={styles.bar}>
      <h1 className={styles.title}>لوحة التحكم</h1>

      <div className={styles.icons}>
        <button className={`${styles.menuBtn} ${isMenuOpen ? styles.open : ""}`} onClick={onMenuClick}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button className={styles.logoutMobile} onClick={handleSignOut} title="تسجيل الخروج">
          <LogOut size={20} />
        </button>
      </div>

      <span className={styles.mobileName}>{name}</span>

      <div className={styles.right}>
        <span className={styles.userName}>{name}</span>
        <button className={styles.logout} onClick={handleSignOut}>
          <LogOut size={18} />
          <span>خروج</span>
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;