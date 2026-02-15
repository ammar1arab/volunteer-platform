"use client";
import { useSession } from "next-auth/react";
import { Menu, X, User } from "lucide-react";
import styles from "./AdminTopbar.module.scss";

type Props = {
  onMenuClick: () => void;
  isMenuOpen: boolean;
};

const AdminTopbar = ({ onMenuClick, isMenuOpen }: Props) => {
  const { data } = useSession();
  const name = data?.user?.name || "Ammar";

  return (
    <header className={styles.bar}>
      <div className={styles.leftSection}>
        <button className={styles.menuBtn} onClick={onMenuClick}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h1 className={styles.title}>لوحة التحكم</h1>
      </div>

      <div className={styles.right}>
        <div className={styles.userBadge}>
          <span className={styles.userName}>{name}</span>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;