"use client";

import React, { useState, useMemo } from "react";
import { Modal, LoadingState, EmptyState, Pagination, Search } from "@/presentation/components";
import { Download, ArrowUpDown, ArrowUp, ArrowDown, LucideIcon } from "lucide-react";
import { useFetchData } from "@/presentation/hooks";
import styles from "./SharedDataModal.module.scss";

export interface Column<T> {
  key: string;
  header: string;
  accessor: (item: T) => React.ReactNode;
  sortable?: boolean;
  sortValue?: (item: T) => string | number;
}

interface Props<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: LucideIcon | React.ElementType;
  fetchUrl: string;
  dataKey: string;
  columns: Column<T>[];
  emptyTitle: string;
  emptyMessage: string;
  exportFileName?: string;
  itemsPerPage?: number;
}

export function SharedDataModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  icon: Icon,
  fetchUrl,
  dataKey,
  columns,
  emptyTitle,
  emptyMessage,
  exportFileName = "export",
  itemsPerPage = 5,
}: Props<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data, isLoading } = useFetchData<{ items: T[] }>({
    queryKey: ["admin", "sharedModal", fetchUrl],
    request: async () => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      return { items: json.data?.[dataKey] || json.data || [] };
    },
  });

  const processedData = useMemo(() => {
    let result = [...(data?.items || [])];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some(
          (val) => val && String(val).toLowerCase().includes(lowerSearch)
        )
      );
    }

    if (sortKey) {
      const col = columns.find((c) => c.key === sortKey);
      if (col && col.sortValue) {
        result.sort((a, b) => {
          const valA = col.sortValue!(a);
          const valB = col.sortValue!(b);
          if (valA < valB) return sortOrder === "asc" ? -1 : 1;
          if (valA > valB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        });
      }
    }

    return result;
  }, [data?.items, searchTerm, sortKey, sortOrder, columns]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage, itemsPerPage]);

  const handleSort = (key: string) => {
    const col = columns.find((c) => c.key === key);
    if (!col?.sortable) return;

    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const exportToCSV = () => {
    if (!processedData.length) return;
    
    // Extract headers
    const headers = columns.map(c => c.header).join(",");
    
    // Extract rows (using sortValue for primitive representation, fallback to stringified accessor if possible, or simple empty string)
    const rows = processedData.map(item => {
      return columns.map(col => {
        let val = col.sortValue ? col.sortValue(item) : "";
        if (typeof val === "string") val = `"${val.replace(/"/g, '""')}"`;
        return val;
      }).join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${exportFileName}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className={styles.container}>
        <div className={styles.controls}>
          <div className={styles.search}>
            <Search
              value={searchTerm}
              onChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              onSearch={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="ابحث..."
            />
          </div>
          <button className={styles.exportBtn} onClick={exportToCSV} disabled={!processedData.length}>
            <Download size={18} />
            تصدير إلى Excel
          </button>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : processedData.length === 0 ? (
          <EmptyState icon={Icon as any} title={emptyTitle} message={emptyMessage} />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key} onClick={() => handleSort(col.key)} style={{ cursor: col.sortable ? "pointer" : "default" }}>
                      {col.header}
                      {col.sortable && (
                        <span className={styles.sortIcon}>
                          {sortKey === col.key ? (
                            sortOrder === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} />
                          )}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, idx) => (
                  <tr key={item.id || idx}>
                    {columns.map((col) => (
                      <td key={col.key}>{col.accessor(item)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {processedData.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalItems={processedData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            sticky
          />
        )}
      </div>
    </Modal>
  );
}
