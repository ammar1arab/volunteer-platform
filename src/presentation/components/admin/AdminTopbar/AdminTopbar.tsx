"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, User } from "lucide-react";
import styles from "./AdminTopbar.module.scss";
import { ROUTES } from "@/lib";

type Props = { title?: string };

const AdminTopbar: React.FC<Props> = ({ title = "لوحة الإدارة" }) => {
  const { data } = useSession();
  const name = data?.user?.name ?? "المسؤول";
  const role = data?.user?.role ?? "ADMIN";

  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.right}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <User size={16} />
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{name}</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.logout}
          onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
          aria-label="تسجيل الخروج"
        >
          <LogOut size={16} />
          <span className={styles.logoutText}>خروج</span>
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;