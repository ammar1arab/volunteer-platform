"use client";
import { revokeImagePreview } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";

export type ActivityFormData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: string;
  date: string;
  startTime: string;
  endTime: string;
  placeName: string;
  address: string;
  latitude: number;
  longitude: number;
  targetAudience: string;
  maxVolunteers: number;
};

const getDefaultDate = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().split("T")[0];
};

const EMPTY_FORM: ActivityFormData = {
  id: "",
  title: "",
  description: "",
  imageUrl: "",
  dayOfWeek: "MONDAY",
  date: getDefaultDate(),
  startTime: "",
  endTime: "",
  placeName: "",
  address: "",
  latitude: 31.9454,
  longitude: 35.9284,
  targetAudience: "",
  maxVolunteers: 20,
};

type Props = {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
  onClose: () => void;
};

export const useActivityModal = ({ initialData, onSubmit, onImageUpload }: Props) => {
  const [form, setForm]                   = useState<ActivityFormData>(EMPTY_FORM);
  const [preview, setPreview]             = useState("");
  const [uploading, setUploading]         = useState(false);
  const [locating, setLocating]           = useState(false);
  const [locationError, setLocationError] = useState("");
  const [searchQuery, setSearchQuery]     = useState("");
  const [searching, setSearching]         = useState(false);
  const [searchError, setSearchError]     = useState("");

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ ...EMPTY_FORM, date: getDefaultDate() });
      setPreview("");
      setLocationError("");
      setSearchQuery("");
    }
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (preview) revokeImagePreview(preview);
    };
  }, [preview]);

  const handleImage = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (preview) revokeImagePreview(preview);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setUploading(true);
      const url = await onImageUpload(file);
      setUploading(false);
      if (url) setForm((p) => ({ ...p, imageUrl: url }));
    },
    [preview, onImageUpload]
  );

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setLocating(false);
      },
      (err) => {
        const msgs: Record<number, string> = {
          1: "تم رفض الإذن، يرجى السماح للموقع بالوصول إلى موقعك",
          2: "تعذّر تحديد الموقع، جرّب البحث بالعنوان",
          3: "انتهت المهلة، حاول مجدداً",
        };
        setLocationError(msgs[err.code] || "خطأ غير معروف");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);

  const searchByAddress = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
        { headers: { "Accept-Language": "ar" } }
      );
      const data = await res.json();
      if (data.length === 0) {
        setSearchError("لم يتم العثور على الموقع، جرب عنواناً أكثر تفصيلاً");
      } else {
        setForm((p) => ({
          ...p,
          latitude:  parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        }));
      }
    } catch {
      setSearchError("فشل الاتصال، تحقق من الإنترنت");
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(form);
    },
    [form, onSubmit]
  );

  return {
    form,
    preview,
    uploading,
    locating,
    locationError,
    searchQuery,
    searching,
    searchError,
    setForm,
    setSearchQuery,
    handleImage,
    detectLocation,
    searchByAddress,
    handleSubmit,
  };
};