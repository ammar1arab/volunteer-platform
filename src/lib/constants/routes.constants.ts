export const ROUTES = {
  HOME: "/",
  LOGIN: "/signin",
  SIGNUP: "/signup",

  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    FEATURED_POSTS: "/admin/dashboard/featured-posts",
    ACTIVITIES: "/admin/dashboard/activities",
  },

  VOLUNTEER: {
    PROFILE: "/volunteer/profile",
  },
} as const;
