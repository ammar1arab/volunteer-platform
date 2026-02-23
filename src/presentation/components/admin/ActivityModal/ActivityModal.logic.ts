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
  maxVolunteers: 20
};

type Props = {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
  onClose: () => void;
};

export const useActivityModal = ({ initialData, onSubmit, onImageUpload }: Props) => {
  const [form, setForm] = useState<ActivityFormData>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ ...EMPTY_FORM, date: getDefaultDate() });
      setPreview("");
    }
  }, [initialData]);

  useEffect(
    () => () => {
      if (preview) revokeImagePreview(preview);
    },
    [preview]
  );

  const handleImage = useCallback(
    async (file: File | null) => {
      if (!file) return;
      if (preview) revokeImagePreview(preview);
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      const url = await onImageUpload(file);
      setUploading(false);
      if (url) setForm((p) => ({ ...p, imageUrl: url }));
    },
    [preview, onImageUpload]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await onSubmit(form);
    },
    [form, onSubmit]
  );

  return { form, preview, uploading, setForm, handleImage, handleSubmit };
};
