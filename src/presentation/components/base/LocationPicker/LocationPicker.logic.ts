"use client";
import { useReducer, useState, useCallback } from "react";
import { useIsClient } from "@/presentation/query";

export type LatLng = { lat: number; lng: number };
export type SearchResult = { label: string; lat: number; lng: number };

interface State {
  searchQuery:   string;
  searchResults: SearchResult[];
  searching:     boolean;
  searchError:   string;
  locating:      boolean;
  locationError: string;
  linkInput:     string;
  linkError:     string;
  mapOpen:       boolean;
  markerPos:     LatLng;
  mapCenter:     LatLng;
}

type Action =
  | { type: "SET_QUERY";    payload: string }
  | { type: "SET_RESULTS";  payload: SearchResult[] }
  | { type: "START_SEARCH" }
  | { type: "SEARCH_ERR";   payload: string }
  | { type: "START_LOCATE" }
  | { type: "LOCATE_ERR";   payload: string }
  | { type: "LOCATE_DONE" }
  | { type: "SET_LINK";     payload: string }
  | { type: "LINK_ERR";     payload: string }
  | { type: "TOGGLE_MAP";   payload: boolean }
  | { type: "SET_COORDS";   payload: LatLng };

const init = (lat: number, lng: number): State => ({
  searchQuery: "", searchResults: [], searching: false, searchError: "",
  locating: false, locationError: "", linkInput: "", linkError: "",
  mapOpen: false,
  markerPos:  { lat: lat || 31.9539, lng: lng || 35.9106 },
  mapCenter:  { lat: lat || 31.9539, lng: lng || 35.9106 },
});

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "SET_QUERY":    return { ...s, searchQuery: a.payload, searchError: "" };
    case "START_SEARCH": return { ...s, searching: true, searchError: "", searchResults: [] };
    case "SET_RESULTS":  return { ...s, searching: false, searchResults: a.payload };
    case "SEARCH_ERR":   return { ...s, searching: false, searchError: a.payload };
    case "START_LOCATE": return { ...s, locating: true, locationError: "" };
    case "LOCATE_ERR":   return { ...s, locating: false, locationError: a.payload };
    case "LOCATE_DONE":  return { ...s, locating: false, locationError: "" };
    case "SET_LINK":     return { ...s, linkInput: a.payload, linkError: "" };
    case "LINK_ERR":     return { ...s, linkError: a.payload };
    case "TOGGLE_MAP":   return { ...s, mapOpen: a.payload };
    case "SET_COORDS":   return { ...s, markerPos: a.payload, mapCenter: a.payload };
    default:             return s;
  }
}

type Props = { latitude: number; longitude: number; onChange: (lat: number, lng: number) => void };

export const useLocationPicker = ({ latitude, longitude, onChange }: Props) => {
  const isClient = useIsClient();
  const [state, dispatch] = useReducer(reducer, init(latitude, longitude));
  const [prevLat, setPrevLat] = useState(latitude);
  const [prevLng, setPrevLng] = useState(longitude);

  if (latitude !== prevLat || longitude !== prevLng) {
    setPrevLat(latitude);
    setPrevLng(longitude);
    if (latitude && longitude) {
      dispatch({ type: "SET_COORDS", payload: { lat: latitude, lng: longitude } });
    }
  }

  const searchByAddress = useCallback(async () => {
    if (!state.searchQuery.trim()) return;
    dispatch({ type: "START_SEARCH" });
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(state.searchQuery)}&limit=5`,
        { headers: { "Accept-Language": "ar" } }
      );
      const data = await res.json();
      if (!data.length) dispatch({ type: "SEARCH_ERR", payload: "لم يتم العثور على نتائج" });
      else dispatch({ type: "SET_RESULTS", payload: data.map((d: any) => ({
        label: d.display_name, lat: parseFloat(d.lat), lng: parseFloat(d.lon),
      }))});
    } catch {
      dispatch({ type: "SEARCH_ERR", payload: "فشل الاتصال، تحقق من الإنترنت" });
    }
  }, [state.searchQuery]);

  const selectResult = useCallback((r: SearchResult) => {
    dispatch({ type: "SET_COORDS", payload: { lat: r.lat, lng: r.lng } });
    dispatch({ type: "SET_RESULTS", payload: [] });
    dispatch({ type: "SET_QUERY", payload: r.label.split(",")[0] });
    onChange(r.lat, r.lng);
  }, [onChange]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      dispatch({ type: "LOCATE_ERR", payload: "المتصفح لا يدعم تحديد الموقع" });
      return;
    }
    dispatch({ type: "START_LOCATE" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        dispatch({ type: "SET_COORDS", payload: p });
        dispatch({ type: "LOCATE_DONE" });
        onChange(p.lat, p.lng);
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "تم رفض الإذن، يرجى السماح للموقع بالوصول",
          2: "تعذّر تحديد الموقع، جرّب البحث بالعنوان",
          3: "انتهت المهلة، حاول مجدداً",
        };
        dispatch({ type: "LOCATE_ERR", payload: msgs[err.code] || "خطأ غير معروف" });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, [onChange]);

  const parseMapsLink = useCallback((link: string) => {
    const patterns = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/,
    ];
    for (const p of patterns) {
      const m = link.match(p);
      if (m) {
        const pos = { lat: parseFloat(m[1]), lng: parseFloat(m[2]) };
        dispatch({ type: "SET_COORDS", payload: pos });
        dispatch({ type: "SET_LINK", payload: "" });
        onChange(pos.lat, pos.lng);
        return;
      }
    }
    dispatch({ type: "LINK_ERR", payload: "لم يتم التعرف على الرابط" });
  }, [onChange]);

  return { state, dispatch, searchByAddress, selectResult, detectLocation, parseMapsLink, isClient };
};
