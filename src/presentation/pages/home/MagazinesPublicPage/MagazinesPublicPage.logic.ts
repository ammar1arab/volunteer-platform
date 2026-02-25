"use client";

import { useState, useMemo } from "react";
import { useMonthlyMagazines } from "@/presentation/hooks";

const ITEMS_PER_PAGE = 20;

export const useMagazinesPublicPage = () => {
  const { list, loading } = useMonthlyMagazines({ activeOnly: true });
  const [currentPage, setCurrentPage] = useState(1);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return list.slice(start, start + ITEMS_PER_PAGE);
  }, [list, currentPage]);

  return {
    magazines: paginated,
    loading,
    currentPage,
    totalItems: list.length,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage
  };
};