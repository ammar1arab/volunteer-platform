"use client";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
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
      <button className={styles.menuBtn} onClick={onMenuClick}>
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      
      <h1 className={styles.title}>لوحة التحكم</h1>
      
      <div className={styles.userBadge}>
        <span className={styles.userName}>{name}</span>
      </div>
    </header>
  );
};

export default AdminTopbar;