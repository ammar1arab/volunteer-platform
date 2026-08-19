import React from "react";
import { Modal, LoadingState, EmptyState } from "@/presentation/components";
import ParticipationRequestItem from "../ParticipationRequestItem/ParticipationRequestItem";
import { Clock } from "lucide-react";
import { useFetchData } from "@/presentation/hooks";
import type { ActivityParticipationDto } from "@/core/application/dtos";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, name: string, volunteerCity?: string, activityCity?: string) => void;
  onReject: (id: string, name: string) => void;
}

const PendingRequestsModal: React.FC<Props> = ({ isOpen, onClose, onApprove, onReject }) => {
  const { data, isLoading } = useFetchData<{ requests: ActivityParticipationDto[] }>({
    queryKey: ["admin", "participations", "pending"],
    request: async () => {
      const res = await fetch("/api/activity-participations/pending");
      if (!res.ok) throw new Error("Failed to fetch pending requests");
      const json = await res.json();
      return { requests: json.data?.requests || [] };
    },
  });

  const requests = data?.requests || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="الطلبات المعلقة">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "60vh", overflowY: "auto", padding: "0.5rem" }}>
        {isLoading ? (
          <LoadingState />
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <ParticipationRequestItem
              key={req.id}
              request={req}
              onApprove={onApprove}
              onReject={onReject}
            />
          ))
        ) : (
          <EmptyState
            icon={Clock}
            title="لا توجد طلبات معلقة"
            message="جميع طلبات المشاركة تم التعامل معها بنجاح."
          />
        )}
      </div>
    </Modal>
  );
};

export default PendingRequestsModal;
