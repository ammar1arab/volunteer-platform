import { BaseEntityProps } from "./BaseEntityProps";
import { NotificationType } from "@/core/domain/enums";

export interface NotificationProps extends BaseEntityProps {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
}