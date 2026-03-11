"use client";
import { useState, useMemo } from "react";
import { useVolunteerSpotlight } from "@/presentation/hooks";
import { CITY_OPTIONS } from "@/presentation/constants/labels";

export const useVolunteerSpotlightPublicPage = () => {
  const { list, loading } = useVolunteerSpotlight({ activeOnly: true });

  const [searchQuery, setSearchQuery] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [activeCity, setActiveCity] = useState("all");

  const cityOptions = useMemo(() => [
    { key: "all", label: "الجميع" },
    ...CITY_OPTIONS.map((c) => ({ key: c.value, label: c.label })),
  ], []);

  const filtered = useMemo(() => {
    let result = activeCity === "all" ? list : list.filter((s) => s.city === activeCity);
    if (appliedSearch.trim()) {
      const q = appliedSearch.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return result;
  }, [list, activeCity, appliedSearch]);

  return {
    spotlights: filtered,
    loading,
    searchQuery,
    setSearchQuery,
    setAppliedSearch,
    activeCity,
    setActiveCity,
    cityOptions,
  };
};