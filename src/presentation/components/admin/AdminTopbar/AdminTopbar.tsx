"use client";

import { signOut, useSession } from "next-auth/react";
import styles from "./AdminTopbar.module.scss";
import { ROUTES } from "@/lib";

type Props = { title?: string };

const AdminTopbar: React.FC<Props> = ({ title = "لوحة الإدارة" }) => {
  const { data } = useSession();
  const name = data?.user?.name ?? "Ammar";
  const role = data?.user?.role ?? "Ammar";

  const roleLabel = role === "ADMIN" ? "Admin" : "Admin";

  return (
    <header className={styles.bar}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.right}>
        <span className={styles.user}>
          {name} - {roleLabel}
        </span>

        <button
          type="button"
          className={styles.logout}
          onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
        >
          تسجيل الخروج
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
