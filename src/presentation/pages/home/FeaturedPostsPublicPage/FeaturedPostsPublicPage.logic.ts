"use client";

import { useState, useMemo, useCallback } from "react";
import { useFeaturedPosts } from "@/presentation/hooks";
import { FEATURED_POST_CATEGORIES } from "@/lib/constants/categories.constants";

const ITEMS_PER_PAGE = 20;

export const useFeaturedPostsPublicPage = () => {
  const { list, loading, error, refresh } = useFeaturedPosts({ activeOnly: true });
  
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();
    
    list.forEach((post) => {
      const date = new Date(post.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("ar-JO", { year: "numeric", month: "long" });
      months.set(key, label);
    });

    return [
      { key: "all", label: "جميع الأشهر" },
      ...Array.from(months.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, label]) => ({ key, label })),
    ];
  }, [list]);

  const categoryOptions = useMemo(
    () => [
      { key: "all", label: "جميع التصنيفات" },
      ...FEATURED_POST_CATEGORIES.map((cat) => ({ key: cat.value, label: cat.label })),
    ],
    []
  );

  const filtered = useMemo(() => {
    let result = [...list];

    if (selectedMonth !== "all") {
      result = result.filter((post) => {
        const date = new Date(post.createdAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return key === selectedMonth;
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter((post) => post.categories.includes(selectedCategory as any));
    }

    return result;
  }, [list, selectedMonth, selectedCategory]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const handleMonthChange = useCallback((value: string) => {
    setSelectedMonth(value);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setSelectedCategory(value);
    setCurrentPage(1);
  }, []);

  return {
    posts: paginated,
    loading,
    error,
    monthOptions,
    categoryOptions,
    selectedMonth,
    selectedCategory,
    currentPage,
    totalItems: filtered.length,
    itemsPerPage: ITEMS_PER_PAGE,
    setCurrentPage,
    handleMonthChange,
    handleCategoryChange,
    refresh,
  };
};