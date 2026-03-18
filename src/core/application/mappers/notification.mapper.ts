import { Notification } from "@/core/domain/entities";
import { NotificationType } from "@/core/domain/enums";
import type { NotificationDto, BroadcastDto } from "@/core/application/dtos";
import { ROUTES } from "@/presentation/constants";

function resolveLink(
  type: NotificationType,
  metadata: Record<string, unknown> | null
): string | null {
  switch (type) {
    case NotificationType.CERTIFICATE_ISSUED: {
      const id = metadata?.certificateId as string | undefined;
      return id ? ROUTES.VERIFY(id) : ROUTES.VOLUNTEER.CERTIFICATES;
    }
    case NotificationType.ANNOUNCEMENT:
      return (metadata?.link as string | undefined) ?? null;
    default:
      return null;
  }
}

export function toNotificationDto(entity: Notification): NotificationDto {
  return {
    id:        entity.id,
    userId:    entity.userId,
    type:      entity.type,
    title:     entity.title,
    message:   entity.message,
    isRead:    entity.isRead,
    metadata:  entity.metadata,
    createdAt: entity.createdAt.toISOString(),
    link:      resolveLink(entity.type, entity.metadata),
  };
}

export function toBroadcastDto(entity: Notification): BroadcastDto {
  const meta = entity.metadata ?? {};
  return {
    broadcastId:     (meta.broadcastId as string) ?? entity.id,
    title:           entity.title,
    message:         entity.message,
    totalRecipients: (meta.totalRecipients as number) ?? 0,
    target:          (meta.target as string) ?? "ALL",
    targetValue:     (meta.targetValue as string | undefined) ?? null,
    link:            (meta.link as string | undefined) ?? null,
    createdAt:       entity.createdAt.toISOString(),
  };
}