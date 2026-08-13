"use client";
import { useMemo, useCallback } from "react";
import { useFeaturedPosts } from "@/presentation/hooks";
import { CATEGORY_OPTIONS, getMonthLabel, isFeaturedPostCategory } from "@/presentation/constants";
import { useSessionStorageState } from "@/presentation/hooks/useSessionStorageState";

const ITEMS_PER_PAGE = 20;

export const useFeaturedPostsPublicPage = () => {
  const { list, loading, error, refresh } = useFeaturedPosts({ activeOnly: true });

  const [selectedMonth, setSelectedMonth] = useSessionStorageState(
    "filters.public.featuredPosts.month",
    "all"
  );
  const [selectedCategory, setSelectedCategory] = useSessionStorageState(
    "filters.public.featuredPosts.category",
    "all"
  );
  const [searchQuery, setSearchQuery] = useSessionStorageState(
    "filters.public.featuredPosts.searchQuery",
    ""
  );
  const [appliedSearch, setAppliedSearch] = useSessionStorageState(
    "filters.public.featuredPosts.appliedSearch",
    ""
  );
  const [currentPage, setCurrentPage] = useSessionStorageState(
    "filters.public.featuredPosts.currentPage",
    1
  );

  const monthOptions = useMemo(() => {
    const months = new Map<string, string>();
    list.forEach((post) => {
      const date = new Date(post.publishedAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = `${getMonthLabel(date.getMonth() + 1)} ${date.getFullYear()}`;
      months.set(key, label);
    });
    return [
      { key: "all", label: "جميع الأشهر" },
      ...Array.from(months.entries())
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, label]) => ({ key, label }))
    ];
  }, [list]);

  const categoryOptions = useMemo(
    () => [
      { key: "all", label: "جميع التصنيفات" },
      ...CATEGORY_OPTIONS.map((cat) => ({ key: cat.value, label: cat.label }))
    ],
    []
  );

  const filtered = useMemo(() => {
    let result = [...list];

    if (selectedMonth !== "all") {
      result = result.filter((post) => {
        const date = new Date(post.publishedAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        return key === selectedMonth;
      });
    }

    if (selectedCategory !== "all" && isFeaturedPostCategory(selectedCategory)) {
      result = result.filter((post) => post.categories.includes(selectedCategory));
    }

    if (appliedSearch.trim()) {
      const q = appliedSearch.trim().toLowerCase();
      result = result.filter(
        (post) => post.title.toLowerCase().includes(q) || post.description?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });
  }, [list, selectedMonth, selectedCategory, appliedSearch]);

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
  const handleSearch = useCallback((value: string) => {
    setAppliedSearch(value);
    setCurrentPage(1);
  }, []);
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return {
    posts: paginated,
    loading,
    error,
    refresh,
    monthOptions,
    categoryOptions,
    selectedMonth,
    selectedCategory,
    searchQuery,
    appliedSearch,
    currentPage,
    setCurrentPage,
    totalItems: filtered.length,
    itemsPerPage: ITEMS_PER_PAGE,
    handleMonthChange,
    handleCategoryChange,
    handleSearch,
    handleSearchChange
  };
};
