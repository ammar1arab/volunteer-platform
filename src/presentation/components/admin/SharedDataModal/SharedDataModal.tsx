"use client";

import React, { useMemo, useState } from "react";
import { Modal, LoadingState, EmptyState, Pagination, Search, Button } from "@/presentation/components";
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
  customListRenderer?: (data: T[]) => React.ReactNode;
  defaultSortKey?: string;
  defaultSortOrder?: "asc" | "desc";
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
  itemsPerPage = 8,
  customListRenderer,
  defaultSortKey,
  defaultSortOrder = "asc",
}: Props<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey ?? null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(defaultSortOrder);

  const { data, isLoading } = useFetchData<{ items: T[] }>({
    queryKey: ["admin", "sharedModal", fetchUrl],
    request: async () => {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error("Failed to fetch data");
      const json = await res.json();
      const raw = json.data?.[dataKey] ?? json.data ?? [];
      return { items: Array.isArray(raw) ? raw : [] };
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

    const headers = columns.map((c) => c.header).join(",");
    const rows = processedData.map((item) => {
      return columns.map((col) => {
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

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortKey !== columnKey) return <ArrowUpDown size={13} />;
    return sortOrder === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  };

  const sortableColumns = columns.filter((column) => column.sortable);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isLoading ? title : `${title} · ${processedData.length}`} size="xl">
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
          <Button variant="secondary" size="sm" onClick={exportToCSV} disabled={!processedData.length} icon={<Download size={16} />}>
            Export
          </Button>
        </div>

        {sortableColumns.length > 0 && (
          <div className={styles.mobileSort} aria-label="ترتيب النتائج">
            {sortableColumns.map((column) => (
              <button
                key={column.key}
                type="button"
                className={sortKey === column.key ? styles.sortActive : undefined}
                onClick={() => handleSort(column.key)}
              >
                {column.header}
                <SortIcon columnKey={column.key} />
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <LoadingState />
        ) : processedData.length === 0 ? (
          <EmptyState icon={Icon as any} title={emptyTitle} message={emptyMessage} />
        ) : customListRenderer ? (
          <div className={styles.customList}>{customListRenderer(paginatedData)}</div>
        ) : (
          <>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className={col.sortable ? styles.sortable : undefined}
                      >
                        {col.header}
                        {col.sortable && (
                          <span className={styles.sortIcon}>
                            <SortIcon columnKey={col.key} />
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

            <div className={styles.mobileCards}>
              {paginatedData.map((item, idx) => (
                <article key={item.id || idx} className={styles.itemCard}>
                  {columns.map((col, colIdx) => (
                    <div
                      key={col.key}
                      className={colIdx === 0 ? styles.itemPrimary : styles.itemRow}
                    >
                      {colIdx !== 0 && <span className={styles.itemLabel}>{col.header}</span>}
                      <span className={styles.itemValue}>{col.accessor(item)}</span>
                    </div>
                  ))}
                </article>
              ))}
            </div>
          </>
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
