import React from "react";
import { Modal, LoadingState, EmptyState } from "@/presentation/components";
import SystemLogsTable from "../SystemLogsTable/SystemLogsTable";
import { ShieldAlert } from "lucide-react";
import { useFetchData } from "@/presentation/hooks";
import type { SystemLog, PaginationData } from "@/presentation/pages/admin/ReportsPage/ReportsPage.logic";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SystemErrorsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [page, setPage] = React.useState(1);

  const { data, isLoading } = useFetchData<{ logs: SystemLog[]; pagination: PaginationData }>({
    queryKey: ["reports", "logs", "errors", page],
    request: async () => {
      // Fetch only ERROR and FAILURE logs
      const res = await fetch(`/api/reports/logs?page=${page}&limit=10&status=ERROR`);
      const errorData = await res.json();
      
      const resFail = await fetch(`/api/reports/logs?page=${page}&limit=10&status=FAILURE`);
      const failData = await resFail.json();

      // Simple merge for modal demo purposes
      const combinedLogs = [...(errorData.data || []), ...(failData.data || [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      return {
        logs: combinedLogs,
        pagination: { total: combinedLogs.length, page: 1, limit: 10, totalPages: 1 }
      };
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="أخطاء النظام الحالية" size="lg">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "70vh", overflowY: "auto" }}>
        {isLoading ? (
          <LoadingState />
        ) : data?.logs.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="لا توجد أخطاء"
            message="النظام يعمل بكفاءة ولا توجد أخطاء مسجلة حالياً."
          />
        ) : (
          <SystemLogsTable
            logs={data?.logs || []}
            isLoading={false}
            pagination={data?.pagination}
            onPageChange={setPage}
          />
        )}
      </div>
    </Modal>
  );
};

export default SystemErrorsModal;
