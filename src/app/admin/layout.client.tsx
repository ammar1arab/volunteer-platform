"use client";
import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import styles from "./layout.module.scss";
import { AdminSidebar, AdminTopbar } from "@/presentation/components";

const COLLAPSE_KEY = "admin.sidebar.collapsed";
const listeners = new Set<() => void>();

const subscribeCollapse = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const emitCollapse = () => listeners.forEach((listener) => listener());

const getCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    return false;
  }
};

interface Props {
  children: React.ReactNode;
  isSuperAdmin: boolean;
  permissions: string[];
}

export default function AdminLayoutClient({ children, isSuperAdmin, permissions }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const collapsed = useSyncExternalStore(subscribeCollapse, getCollapsed, () => false);

  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (sidebarOpen) setSidebarOpen(false);
  }

  const toggleCollapse = useCallback(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, getCollapsed() ? "0" : "1");
    } catch {
      /* ignore */
    }
    emitCollapse();
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
