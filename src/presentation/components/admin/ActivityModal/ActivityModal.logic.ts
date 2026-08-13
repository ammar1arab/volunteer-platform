"use client";
import { useState, useCallback } from "react";
import {
  ActivityType,
  DayOfWeek,
  DomainFeaturedPostCategory,
  JordanianCity,
  MeetingLinkSource,
  MeetingPlatform,
  MeetingSyncStatus
} from "@/core/domain/enums";
import { MEETING_LINK_SOURCE_CREATE_LABELS } from "@/presentation/constants/labels";
import { dayOfWeekFromDate } from "@/lib/utils";

export type MeetingLinkSourceForm = "" | MeetingLinkSource;

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
  meetingLinkSource: MeetingLinkSourceForm;
  primaryPresenterId: string;
  meetingSyncStatus?: MeetingSyncStatus;
  meetingSyncError?: string | null;
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
  meetingPlatform: "",
  meetingLinkSource: "",
  primaryPresenterId: ""
};

export const MEETING_LINK_SOURCE_OPTIONS = [
  {
    value: MeetingLinkSource.GOOGLE_MEET_AUTO,
    label: MEETING_LINK_SOURCE_CREATE_LABELS[MeetingLinkSource.GOOGLE_MEET_AUTO]
  },
  {
    value: MeetingLinkSource.MANUAL,
    label: MEETING_LINK_SOURCE_CREATE_LABELS[MeetingLinkSource.MANUAL]
  }
];

function toForm(initialData: ActivityFormData | null | undefined): ActivityFormData {
  if (!initialData) {
    return { ...EMPTY_FORM, dayOfWeek: dayOfWeekFromDate(EMPTY_FORM.date) };
  }
  const formattedDate = initialData.date.toString().split("T")[0];
  const isOnline = initialData.activityType === ActivityType.ONLINE;
  const source =
    initialData.meetingLinkSource ||
    (isOnline ? MeetingLinkSource.MANUAL : "");
  return {
    ...EMPTY_FORM,
    ...initialData,
    date: formattedDate,
    dayOfWeek: dayOfWeekFromDate(formattedDate),
    meetingLink: initialData.meetingLink ?? "",
    meetingPlatform: initialData.meetingPlatform ?? "",
    meetingLinkSource: source,
    placeName: initialData.placeName ?? "",
    city: initialData.city ?? "",
    primaryPresenterId: initialData.primaryPresenterId ?? ""
  };
}

export const useActivityModal = ({ initialData, onSubmit, onImageUpload }: {
  initialData?: ActivityFormData | null;
  onSubmit: (form: ActivityFormData) => Promise<void>;
  onImageUpload: (file: File) => Promise<string | null>;
  onClose?: () => void;
}) => {
  const [form, setForm] = useState<ActivityFormData>(() => toForm(initialData));
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);

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
