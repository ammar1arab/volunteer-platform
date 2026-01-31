"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

interface Column {
  key: string;
  label: string;
}

export const useExportUsersButton = (data: any[], allColumns: Column[]) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    allColumns.map(col => col.key)
  );

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAll = () => {
    setSelectedColumns(allColumns.map(col => col.key));
  };

  const deselectAll = () => {
    setSelectedColumns([]);
  };

  const exportToExcel = () => {
    // 1. Get selected columns
    const columns = allColumns.filter(col => selectedColumns.includes(col.key));

    // 2. Map data to only selected columns
    const exportData = data.map(item => {
      const row: any = {};
      columns.forEach(col => {
        row[col.label] = item[col.key] || "-";
      });
      return row;
    });

    // 3. Create Excel file
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المستخدمين");

    // 4. Download
    const filename = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    closeModal();
  };

  return {
    isModalOpen,
    selectedColumns,
    openModal,
    closeModal,
    toggleColumn,
    selectAll,
    deselectAll,
    exportToExcel,
  };
};