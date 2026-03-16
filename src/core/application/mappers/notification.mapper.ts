import { Notification } from "@/core/domain/entities";
import { NotificationType } from "@/core/domain/enums";
import { NotificationDto } from "@/core/application/dtos";
import { ROUTES } from "@/presentation/constants";

function resolveLink(type: NotificationType, _metadata: Record<string, unknown> | null): string {
  switch (type) {
    case NotificationType.CERTIFICATE_ISSUED: {
      const id = _metadata?.certificateId as string | undefined;
      return id ? ROUTES.VERIFY(id) : ROUTES.VOLUNTEER.CERTIFICATES; 
    }
    default:
      return ROUTES.HOME;
  }
}

export function toNotificationDto(entity: Notification): NotificationDto {
  return {
    id: entity.id,
    userId: entity.userId,
    type: entity.type as NotificationType,
    title: entity.title,
    message: entity.message,
    isRead: entity.isRead,
    metadata: entity.metadata,
    createdAt: entity.createdAt.toISOString(),
    link: resolveLink(entity.type as NotificationType, entity.metadata)
  };
}
