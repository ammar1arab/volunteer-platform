import React from "react";
import { Modal, LoadingState, EmptyState, Badge } from "@/presentation/components";
import { Activity } from "lucide-react";
import { useFetchData } from "@/presentation/hooks";
import { getActivityStatusLabel } from "@/presentation/constants";
import { ActivityStatus } from "@/core/domain/enums";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ActivitiesAnalyticsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { data, isLoading } = useFetchData<{ recentActivities: { id: string; title: string; status: ActivityStatus; date: string; }[] }>({
    queryKey: ["admin", "activities", "recent"],
    request: async () => {
      const res = await fetch("/api/activities");
      if (!res.ok) throw new Error("Failed to fetch activities");
      const json = await res.json();
      return { recentActivities: json.data?.activities?.slice(0, 10) || [] };
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="إحصائيات الأنشطة" size="md">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "60vh", overflowY: "auto", padding: "0.5rem" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "0.5rem" }}>أحدث الأنشطة</h3>
        {isLoading ? (
          <LoadingState />
        ) : data?.recentActivities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="لا توجد أنشطة"
            message="لم يتم إنشاء أي أنشطة بعد."
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data?.recentActivities.map((activity) => (
              <div key={activity.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "var(--bg-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--success-light)", color: "var(--success)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Activity size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{activity.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "4px" }} dir="ltr">
                    {new Date(activity.date).toLocaleDateString("ar-EG")}
                  </div>
                </div>
                <div>
                  <Badge variant={activity.status === ActivityStatus.PUBLISHED ? "success" : activity.status === ActivityStatus.DRAFT ? "warning" : "danger"}>
                    {getActivityStatusLabel(activity.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ActivitiesAnalyticsModal;
