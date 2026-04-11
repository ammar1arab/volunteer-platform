"use client";
import { useState } from "react";
import styles from "./layout.module.scss";
import { AdminSidebar, AdminTopbar } from "@/presentation/components";

interface Props {
  children: React.ReactNode;
  isSuperAdmin: boolean;
  permissions: string[];
}

export default function AdminLayoutClient({ children, isSuperAdmin, permissions }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={styles.shell}>
      <AdminSidebar
        isOpen={sidebarOpen}
        isCollapsed={collapsed}
        onToggleCollapse={() => setCollapsed((p) => !p)}
        onClose={() => setSidebarOpen(false)}
        isSuperAdmin={isSuperAdmin}
        permissions={permissions}
      />
      <div className={styles.main}>
        <AdminTopbar
          onMenuClick={() => setSidebarOpen((p) => !p)}
          isMenuOpen={sidebarOpen}
        />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}