"use client";
import { revokeImagePreview } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import {
  ActivityType,
  DayOfWeek,
  DomainFeaturedPostCategory,
  JordanianCity,
  MeetingPlatform
} from "@/core/domain/enums";

export type ActivityFormData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  activityType: ActivityType;
  categories: DomainFeaturedPostCategory[];
  maxVolunteers: number;
  placeName: string;
  city: JordanianCity | "";
  latitude: number;
  longitude: number;
  meetingLink: string;
  meetingPlatform: MeetingPlatform | "";
};

const EMPTY_FORM: ActivityFormData = {
  id: "",
  title: "",
  description: "",
  imageUrl: "",
  dayOfWeek: DayOfWeek.SUNDAY,
  date: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endTime: "11:00",
  durationHours: 2,
  activityType: ActivityType.IN_PERSON,
  categories: [],
  maxVolunteers: 20,
  placeName: "",
  city: "",
  latitude: 31.9454,
  longitude: 35.9284,
  meetingLink: "",
  meetingPlatform: ""
};

export const useActivityModal = ({ initialData, onSubmit, onImageUpload, onClose }: any) => {
  const [form, setForm] = useState<ActivityFormData>(EMPTY_FORM);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initialData) {
      const formattedDate =
        initialData.date instanceof Date ? initialData.date.toISOString().split("T")[0] : initialData.date;

      setForm({ ...EMPTY_FORM, ...initialData, date: formattedDate });
    } else {
      setForm(EMPTY_FORM);
      setPreview("");
    }
  }, [initialData]);

  const handleImage = useCallback(
    async (file: File | null) => {
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      setUploading(true);
      const url = await onImageUpload(file);
      setUploading(false);
      if (url) setForm((p) => ({ ...p, imageUrl: url }));
    },
    [onImageUpload]
  );

  const toggleCategory = (cat: DomainFeaturedPostCategory) => {
    setForm((p) => ({
      ...p,
      categories: p.categories.includes(cat) ? p.categories.filter((c) => c !== cat) : [...p.categories, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return { form, preview, uploading, setForm, handleImage, toggleCategory, handleSubmit };
};