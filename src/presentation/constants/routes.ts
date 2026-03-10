import { UserRole } from "@/core/domain/enums";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/signin",
  SIGNUP: "/signup",
  ABOUT: "/about",
  POSTS: "/posts",
  MAGAZINES: "/magazines",
  POST_DETAILS: (id: string) => `/posts/${id}`,
  ACTIVITIES: "/activities",
  ACTIVITY_DETAILS: (id: string) => `/activities/${id}`,
  SPOTLIGHT: {
    BASE: "/spotlight",
    DETAILS: (id: string) => `/spotlight/${id}`
  },

  ADMIN: {
    ROOT: "/admin/dashboard",
    FEATURED_POSTS: "/admin/dashboard/featured-posts",
    VOLUNTEER_SPOTLIGHT: "/admin/dashboard/volunteer-spotlight",
    MONTHLY_MAGAZINE: "/admin/dashboard/monthly-magazine",
    ACTIVITIES: "/admin/dashboard/activities",
    REQUESTS: "/admin/dashboard/requests",
    USERS: "/admin/dashboard/users",
    USER_DETAILS: (id: string) => `/admin/dashboard/users/${id}`
  },

  VOLUNTEER: {
    ROOT: "/volunteer",
    PROFILE: "/volunteer/profile",
    REQUESTS: "/volunteer/requests",
    ACTIVITIES: "/volunteer/activities"
  },

  redirectByRole(role?: UserRole) {
    if (role === UserRole.ADMIN) return this.ADMIN.FEATURED_POSTS;
    return this.VOLUNTEER.PROFILE;
  }
} as const;
