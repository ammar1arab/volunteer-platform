"use client";

import { createPortal } from "react-dom";
import { useIsClient } from "@/presentation/query";
import { FileDown, Download } from "lucide-react";
import { Modal, Button } from "@/presentation/components";
import { useExportUsersButton, type ExcelExportRow } from "./ExportUsersButton.logic";
import styles from "./ExportUsersButton.module.scss";

interface Column {
  key: string;
  label: string;
}

interface ExportUsersButtonProps {
  data: ExcelExportRow[];
  columns: Column[];
  buttonText?: string;
}

const ExportUsersButton = ({
  data,
  columns,
  buttonText = "Export",
}: ExportUsersButtonProps) => {
  const mounted = useIsClient();
  const {
    isModalOpen,
    selectedColumns,
    openModal,
    closeModal,
    toggleColumn,
    selectAll,
    deselectAll,
    exportToExcel,
  } = useExportUsersButton(data, columns);

  const modal = (
    <Modal isOpen={isModalOpen} onClose={closeModal} title="اختر الحقول للتصدير" size="md">
      <div className={styles.body}>
        <div className={styles.toolbar}>
          <button type="button" className={styles.selectBtn} onClick={selectAll}>
            تحديد الكل
          </button>
          <button type="button" className={styles.selectBtn} onClick={deselectAll}>
            إلغاء التحديد
          </button>
        </div>

        <div className={styles.chipGrid}>
          {columns.map((col) => {
            const isOn = selectedColumns.includes(col.key);
            return (
              <button
                key={col.key}
                type="button"
                className={`${styles.chip} ${isOn ? styles.chipOn : styles.chipOff}`}
                onClick={() => toggleColumn(col.key)}
              >
                <span className={styles.chipDot} />
                {col.label}
              </button>
            );
          })}
        </div>

        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={closeModal}>
            إلغاء
          </Button>
          <Button
            variant="primary"
            onClick={exportToExcel}
            disabled={selectedColumns.length === 0}
            icon={<Download size={16} />}
          >
            Export ({selectedColumns.length})
          </Button>
        </div>
      </div>
    </Modal>
  );

  return (
    <>
      <Button variant="secondary" onClick={openModal} icon={<FileDown size={18} />}>
        {buttonText}
      </Button>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
};

export default ExportUsersButton;
