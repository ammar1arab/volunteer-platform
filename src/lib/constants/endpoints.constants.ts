export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
  },

  USERS: {
    ME: "/api/users/me",
    BASE: "/api/users",
    BY_ID: (id: string) => `/api/users/${id}`,
    ACTIVITIES: (id: string) => `/api/users/${id}/activities`,
  },

  FEATURED_POSTS: {
    BASE: "/api/featured-posts",
    BY_ID: (id: string) => `/api/featured-posts/${id}`,
  },

  ACTIVITIES: {
    BASE: "/api/activities",
    BY_ID: (id: string) => `/api/activities/${id}`,
    PUBLISH: (id: string) => `/api/activities/${id}/publish`,
    CANCEL: (id: string) => `/api/activities/${id}/cancel`,
    PUBLISHED: "/api/activities?filter=published",
  },

  ACTIVITY_PARTICIPATIONS: {
    BASE: "/api/activity-participations",
    BY_ID: (id: string) => `/api/activity-participations/${id}`,
    PENDING: "/api/activity-participations/pending",
    APPROVE: (id: string) => `/api/activity-participations/${id}/approve`,
    REJECT: (id: string) => `/api/activity-participations/${id}/reject`,
    MY_REQUESTS: "/api/activity-participations/my-requests",
  },

  UPLOADS: {
    BY_SCOPE: (scope: "featured-posts" | "activities" | "profiles") =>
      `/api/uploads/${scope}`,
    FEATURED_IMAGE: "/api/uploads/featured-posts",
    ACTIVITY_IMAGE: "/api/uploads/activities",
    PROFILE_PICTURE: "/api/uploads/profiles",
  },

  VOLUNTEER_PROFILE: {
    BASE: "/api/volunteer-profile",
    PICTURE: "/api/volunteer-profile/picture",
  },
} as const;
