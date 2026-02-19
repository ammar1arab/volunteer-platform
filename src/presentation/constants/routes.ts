import { UserRole } from "@/core/domain/enums";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/signin",
  SIGNUP: "/signup",
  ABOUT: "/about",
  POSTS: "/posts",
  POST_DETAILS: (id: string) => `/posts/${id}`,
  ACTIVITIES: "/activities",
  ACTIVITY_DETAILS: (id: string) => `/activities/${id}`,
  
  ADMIN: {
    ROOT: "/admin/dashboard",
    FEATURED_POSTS: "/admin/dashboard/featured-posts",
    SUCCESS_STORIES: "/admin/dashboard/success-stories",
    MAGAZINE: "/admin/dashboard/magazine",
    ACTIVITIES: "/admin/dashboard/activities",
    REQUESTS: "/admin/dashboard/requests",
    USERS: "/admin/dashboard/users",
    USER_DETAILS: (id: string) => `/admin/dashboard/users/${id}`,
  },
  
  VOLUNTEER: {
    ROOT: "/volunteer",
    PROFILE: "/volunteer/profile",
    REQUESTS: "/volunteer/requests",
  },
  
  redirectByRole(role?: UserRole) {
    if (role === UserRole.ADMIN) return this.ADMIN.FEATURED_POSTS;
    return this.VOLUNTEER.PROFILE;
  },
} as const;