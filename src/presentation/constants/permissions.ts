import type { AdminPermission } from "@/core/domain/enums";
import { ADMIN_PERMISSIONS } from "@/core/domain/enums";
import { ROUTES } from "./routes";

export { PERMISSION_LABELS, getPermissionLabel } from "./labels";

export const PERMISSION_ROUTE_MAP = {
  MANAGE_POSTS:         ROUTES.ADMIN.FEATURED_POSTS,
  MANAGE_SPOTLIGHT:     ROUTES.ADMIN.VOLUNTEER_SPOTLIGHT,
  MANAGE_MAGAZINE:      ROUTES.ADMIN.MONTHLY_MAGAZINE,
  MANAGE_ACTIVITIES:    ROUTES.ADMIN.ACTIVITIES,
  MANAGE_REQUESTS:      ROUTES.ADMIN.REQUESTS,
  MANAGE_NOTIFICATIONS: ROUTES.ADMIN.NOTIFICATIONS,
  MANAGE_EMAILS:        ROUTES.ADMIN.EMAILS,
  MANAGE_USERS:         ROUTES.ADMIN.USERS,
  MANAGE_MEETINGS:      ROUTES.ADMIN.GOOGLE_MEET,
} as const satisfies Record<AdminPermission, string>;

export function getRequiredPermission(pathname: string): AdminPermission | undefined {
  for (const permission of ADMIN_PERMISSIONS) {
    const route = PERMISSION_ROUTE_MAP[permission];
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return permission;
    }
  }
  return undefined;
}

export function getFirstAllowedAdminRoute(permissions: string[]): string | null {
  for (const permission of ADMIN_PERMISSIONS) {
    if (permissions.includes(permission)) {
      return PERMISSION_ROUTE_MAP[permission];
    }
  }
  return null;
}

export function canAccessRoute(
  pathname: string,
  isSuperAdmin: boolean,
  permissions: string[]
): boolean {
  if (isSuperAdmin) return true;
  const required = getRequiredPermission(pathname);
  if (!required) return true;
  return permissions.includes(required);
}