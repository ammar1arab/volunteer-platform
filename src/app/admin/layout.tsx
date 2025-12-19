import type { ReactNode } from "react";
import styles from "./layout.module.scss";

import { AdminSidebar, AdminTopbar } from "@/presentation/components";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <div className={styles.main}>
        <AdminTopbar title="Admin Dashboard" />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
