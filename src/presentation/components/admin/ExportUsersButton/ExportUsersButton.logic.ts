"use client";

import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

interface Column {
  key: string;
  label: string;
}

export type ExcelCellValue = string | number;
export type ExcelExportRow = Record<string, ExcelCellValue>;

export const useExportUsersButton = (data: ExcelExportRow[], allColumns: Column[]) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    () => allColumns.map(col => col.key)
  );

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const toggleColumn = useCallback((key: string) => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedColumns(allColumns.map(col => col.key));
  }, [allColumns]);

  const deselectAll = useCallback(() => {
    setSelectedColumns([]);
  }, []);

  const exportToExcel = useCallback(() => {
    const columns = allColumns.filter(col => selectedColumns.includes(col.key));
    
    const exportData = data.map((item) => {
      const row: ExcelExportRow = {};
      columns.forEach((col) => {
        const cell = item[col.key];
        row[col.label] = cell === undefined || cell === "" ? "-" : cell;
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المستخدمين");

    const filename = `users-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);

    closeModal();
  }, [data, allColumns, selectedColumns, closeModal]);

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