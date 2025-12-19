export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
  },

  FEATURED_POSTS: {
    BASE: "/api/featured-posts",
    BY_ID: (id: string) => `/api/featured-posts/${id}`,
  },

  UPLOADS: {
    FEATURED_IMAGE: "/api/uploads",
  },
} as const;
