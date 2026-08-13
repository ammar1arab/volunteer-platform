import { BaseEntityProps } from "./BaseEntityProps";
import { NotificationType } from "@/core/domain/enums";

export interface NotificationMetadata {
  activityId?: string;
  activityType?: string;
  link?: string | null;
  certificateId?: string;
  hours?: number;
  icon?: string;
  broadcastId?: string;
  totalRecipients?: number;
  target?: string;
  targetValue?: string | null;
}

export interface NotificationProps extends BaseEntityProps {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: NotificationMetadata | null;
}
