"use client";
import { useCallback, useEffect, useState } from "react";
import styles from "./layout.module.scss";
import { AdminSidebar, AdminTopbar } from "@/presentation/components";

const COLLAPSE_KEY = "admin.sidebar.collapsed";

interface Props {
  children: React.ReactNode;
  isSuperAdmin: boolean;
  permissions: string[];
}

export default function AdminLayoutClient({ children, isSuperAdmin, permissions }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {

    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {

      }
      return next;
    });
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className={styles.shell}>
      <AdminSidebar
        isOpen={sidebarOpen}
        isCollapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        onClose={closeSidebar}
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
