export const ROUTES = {
  HOME: "/",
  LOGIN: "/signin",
  SIGNUP: "/signup",

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    FEATURED_POSTS: "/admin/dashboard/featured-posts",
    ACTIVITIES: "/admin/dashboard/activities",
    REQUESTS: "/admin/dashboard/requests",
  },

  VOLUNTEER: {
    PROFILE: "/volunteer/profile",
    REQUESTS: "/volunteer/requests",
  },
} as const;