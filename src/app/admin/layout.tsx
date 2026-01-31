"use client";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";

import styles from "./layout.module.scss";
import { AdminSidebar, AdminTopbar } from "@/presentation/components";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SessionProvider>
      <div className={styles.shell}>
        <AdminSidebar 
          isOpen={sidebarOpen}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className={styles.main}>
          <AdminTopbar 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            isMenuOpen={sidebarOpen}
          />
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </SessionProvider>
  );
}