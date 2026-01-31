"use client";

import { useState, useEffect, useCallback } from "react";
import { revokeImagePreview } from "@/lib";

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

const EMPTY_FORM: ActivityFormData = {
  id: "",
  title: "",
  description: "",
  imageUrl: "",
  dayOfWeek: "MONDAY",
  date: "",
  startTime: "",
  endTime: "",
  placeName: "",
  address: "",
  latitude: 31.9454,
  longitude: 35.9284,
  targetAudience: "",
  maxVolunteers: 20,
};

export const DAYS = [
  { value: "SUNDAY", label: "الأحد" },
  { value: "MONDAY", label: "الإثنين" },
  { value: "TUESDAY", label: "الثلاثاء" },
  { value: "WEDNESDAY", label: "الأربعاء" },
  { value: "THURSDAY", label: "الخميس" },
  { value: "FRIDAY", label: "الجمعة" },
  { value: "SATURDAY", label: "السبت" },
];

type Props = {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
  onClose: () => void;
};

export const useActivityModal = ({ initialData, onSubmit, onImageUpload, onClose }: Props) => {
  const [form, setForm] = useState<ActivityFormData>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [useCustomLocation, setUseCustomLocation] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm(EMPTY_FORM);
      setPreview("");
      setUseCustomLocation(false);
    }
  }, [initialData]);

  useEffect(() => {
    return () => {
      if (preview) revokeImagePreview(preview);
    };
  }, [preview]);

  const handleImage = useCallback(async (file: File | null) => {
    if (!file) return;

    if (preview) revokeImagePreview(preview);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    setUploading(true);
    const url = await onImageUpload(file);
    setUploading(false);

    if (url) {
      setForm((p) => ({ ...p, imageUrl: url }));
    }
  }, [preview, onImageUpload]);

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((p) => ({
          ...p,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
      }
    );
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  }, [form, onSubmit]);

  return {
    form,
    preview,
    uploading,
    useCustomLocation,
    setForm,
    setUseCustomLocation,
    handleImage,
    detectLocation,
    handleSubmit,
  };
};