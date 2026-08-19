"use client";

import React from "react";
import { Modal, LoadingState, EmptyState } from "@/presentation/components";
import { Users, User as UserIcon } from "lucide-react";
import { useFetchData } from "@/presentation/hooks";
import { formatDateArabic } from "@/lib/utils";
import styles from "./AnalyticsModals.module.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UsersAnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useFetchData<{ recentUsers: { id: string; fullName: string; email: string; createdAt: string }[] }>({
    queryKey: ["admin", "users", "recent"],
    request: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      return { recentUsers: json.data?.users?.slice(0, 10) || [] };
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إحصائيات المستخدمين" size="md">
      <div className={styles.container}>
        <h3 className={styles.title}>أحدث المنضمين</h3>
        {isLoading ? (
          <LoadingState />
        ) : data?.recentUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="لا يوجد مستخدمين"
            message="لم ينضم أي مستخدمين جدد مؤخراً."
          />
        ) : (
          <div className={styles.list}>
            {data?.recentUsers.map((user) => (
              <div key={user.id} className={styles.listItem}>
                <div className={styles.iconWrapper}>
                  <UserIcon size={20} />
                </div>
                <div className={styles.content}>
                  <div className={styles.primaryText}>{user.fullName}</div>
                  <div className={styles.secondaryText}>{user.email}</div>
                </div>
                <div className={styles.metaText} dir="ltr">
                  {formatDateArabic(user.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default UsersAnalyticsModal;
