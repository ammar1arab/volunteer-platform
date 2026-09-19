"use client";

import { SelectInput, Search, Button } from "@/presentation/components";
import { SystemLogStatus } from "@/core/domain/enums";
import { Trash2 } from "lucide-react";
import styles from "./SystemLogsFilters.module.scss";

const STATUS_OPTIONS = [
  { value: "ALL", label: "كل الحالات" },
  { value: SystemLogStatus.SUCCESS, label: "نجاح" },
  { value: SystemLogStatus.ERROR, label: "خطأ" },
  { value: SystemLogStatus.FAILURE, label: "فشل" },
];

type Props = {
  filterAction: string;
  filterStatus: string;
  onFilterChange: (action: string, status: string) => void;
  onClearRequest: () => void;
  isClearing: boolean;
};

const SystemLogsFilters = ({
  filterAction,
  filterStatus,
  onFilterChange,
  onClearRequest,
  isClearing,
}: Props) => (
  <div className={styles.filters}>
    <Search
      value={filterAction}
      onChange={(val) => onFilterChange(val, filterStatus)}
      onSearch={(val) => onFilterChange(val, filterStatus)}
      placeholder="ابحث في السجلات..."
    />
    <SelectInput
      label=""
      options={STATUS_OPTIONS}
      value={filterStatus}
      onChange={(val) => onFilterChange(filterAction, val)}
    />
    <Button
      variant="danger"
      size="md"
      icon={<Trash2 size={16} />}
      onClick={onClearRequest}
      disabled={isClearing}
      loading={isClearing}
    >
      {isClearing ? "جاري المسح..." : "مسح السجلات"}
    </Button>
  </div>
);

export default SystemLogsFilters;
