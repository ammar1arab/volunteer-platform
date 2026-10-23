"use client";

import { ExternalLink } from "lucide-react";
import type { ActivityDto } from "@/core/application/dtos";
import { ActivityType } from "@/core/domain/enums";

type Props = {
  activity: Pick<ActivityDto, "activityType" | "meetingLink">;
  className?: string;
};

export const ActivityMeetingLink = ({ activity, className }: Props) => {
  const href = activity.meetingLink?.trim();
  if (
    activity.activityType !== ActivityType.ONLINE ||
    !href ||
    !/^https?:\/\//i.test(href) ||
    !URL.canParse(href)
  ) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={(event) => event.stopPropagation()}
      aria-label="رابط النشاط (يفتح في علامة تبويب جديدة)"
    >
      <ExternalLink size={14} aria-hidden="true" />
      <span>رابط النشاط</span>
    </a>
  );
};
