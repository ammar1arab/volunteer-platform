import { BaseEntityProps } from "./BaseEntityProps";
import { DayOfWeek } from "@/core/domain/enums";

export interface ActivityProps extends BaseEntityProps {
  title: string;
  description: string;
  imageUrl: string;
  dayOfWeek: DayOfWeek;
  date: Date;
  startTime: string;
  endTime: string;
  placeName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  targetAudience: string;
  maxVolunteers: number;
  currentVolunteers: number;
  status: string;
  createdBy: string;
}