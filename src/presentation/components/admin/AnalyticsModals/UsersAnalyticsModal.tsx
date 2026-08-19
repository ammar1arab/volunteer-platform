import React from "react";
import { Modal, LoadingState, EmptyState } from "@/presentation/components";
import { Users, User as UserIcon } from "lucide-react";
import { useFetchData } from "@/presentation/hooks";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UsersAnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useFetchData<{ recentUsers: { id: string; fullName: string; email: string; createdAt: string }[] }>({
    queryKey: ["admin", "users", "recent"],
    request: async () => {
      // Stubbing the endpoint call - assumes we'll expand the API
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const json = await res.json();
      return { recentUsers: json.data?.users?.slice(0, 10) || [] };
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إحصائيات المستخدمين" size="md">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "60vh", overflowY: "auto", padding: "0.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>أحدث المنضمين</h3>
        {isLoading ? (
          <LoadingState />
        ) : data?.recentUsers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="لا يوجد مستخدمين"
            message="لم ينضم أي مستخدمين جدد مؤخراً."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data?.recentUsers.map((user) => (
              <div key={user.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <UserIcon size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{user.fullName}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{user.email}</div>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }} dir="ltr">
                  {new Date(user.createdAt).toLocaleDateString("ar-EG")}
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
