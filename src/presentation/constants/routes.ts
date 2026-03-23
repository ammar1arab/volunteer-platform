import { UserRole } from "@/core/domain/enums";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/signin",
  SIGNUP: "/signup",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  ABOUT: "/about",
  CONTACT: "/contact",
  POSTS: "/posts",
  MAGAZINES: "/magazines",
  POST_DETAILS: (id: string) => `/posts/${id}`,
  ACTIVITIES: "/activities",
  ACTIVITY_DETAILS: (id: string) => `/activities/${id}`,
  SPOTLIGHT: {
    BASE: "/spotlight",
    DETAILS: (id: string) => `/spotlight/${id}`
  },
  VERIFY: (id: string) => `/verify/${id}`,
  ADMIN: {
    ROOT: "/admin/dashboard",
    FEATURED_POSTS: "/admin/dashboard/featured-posts",
    VOLUNTEER_SPOTLIGHT: "/admin/dashboard/volunteer-spotlight",
    MONTHLY_MAGAZINE: "/admin/dashboard/monthly-magazine",
    ACTIVITIES: "/admin/dashboard/activities",
    REQUESTS: "/admin/dashboard/requests",
    NOTIFICATIONS: "/admin/dashboard/notifications",
    EMAILS: "/admin/dashboard/emails",
    USERS: "/admin/dashboard/users",
    USER_DETAILS: (id: string) => `/admin/dashboard/users/${id}`,
    PERMISSIONS: "/admin/dashboard/permissions"
  },
  VOLUNTEER: {
    ROOT: "/volunteer",
    PROFILE: "/volunteer/profile",
    REQUESTS: "/volunteer/requests",
    ACTIVITIES: "/volunteer/activities",
    CERTIFICATES: "/volunteer/certificates"
  }
} as const;

export function redirectByRole(role?: UserRole): string {
  if (role === UserRole.ADMIN) return ROUTES.ADMIN.FEATURED_POSTS;
  return ROUTES.VOLUNTEER.PROFILE;
}
