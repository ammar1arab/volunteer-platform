"use client";

import { FileDown, Download } from "lucide-react";
import { Modal } from "@/presentation/components";
import { useExportUsersButton } from "./ExportUsersButton.logic";
import styles from "./ExportUsersButton.module.scss";

interface Column {
  key: string;
  label: string;
}

interface ExportUsersButtonProps {
  data: any[];
  columns: Column[];
  buttonText?: string;
}

const ExportUsersButton = ({ 
  data, 
  columns, 
  buttonText = "تصدير Excel" 
}: ExportUsersButtonProps) => {
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

  return (
    <>
      <button className={styles.btn} onClick={openModal}>
        <FileDown size={18} />
        {buttonText}
      </button>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="اختر الحقول للتصدير" size="md">
        <div className={styles.actions}>
          <button className={styles.selectBtn} onClick={selectAll}>
            تحديد الكل
          </button>
          <button className={styles.selectBtn} onClick={deselectAll}>
            إلغاء التحديد
          </button>
        </div>

        <div className={styles.columns}>
          {columns.map((col) => (
            <label key={col.key} className={styles.checkbox}>
              <input
                type="checkbox"
                checked={selectedColumns.includes(col.key)}
                onChange={() => toggleColumn(col.key)}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.label}>{col.label}</span>
            </label>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={closeModal}>
            إلغاء
          </button>
          <button
            className={styles.exportBtn}
            onClick={exportToExcel}
            disabled={selectedColumns.length === 0}
          >
            <Download size={18} />
            تصدير ({selectedColumns.length})
          </button>
        </div>
      </Modal>
    </>
  );
};

export default ExportUsersButton;