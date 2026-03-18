export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
  },
  USERS: {
    ME:         "/api/users/me",
    BASE:       "/api/users",
    BY_ID:      (id: string) => `/api/users/${id}`,
    ACTIVITIES: (id: string) => `/api/users/${id}/activities`,
  },
  VOLUNTEER_PROFILE: {
    BASE:    "/api/volunteer-profile",
    PICTURE: "/api/volunteer-profile/picture",
  },
  ACTIVITIES: {
    BASE:      "/api/activities",
    BY_ID:     (id: string) => `/api/activities/${id}`,
    PUBLISH:   (id: string) => `/api/activities/${id}/publish`,
    CANCEL:    (id: string) => `/api/activities/${id}/cancel`,
    RESTORE:   (id: string) => `/api/activities/${id}/restore`,
    COMPLETE:  (id: string) => `/api/activities/${id}/complete`,
    VOLUNTEERS:(id: string) => `/api/activities/${id}/volunteers`,
    PUBLISHED: "/api/activities?filter=published",
  },
  ACTIVITY_PARTICIPATIONS: {
    BASE:                "/api/activity-participations",
    BY_ID:               (id: string) => `/api/activity-participations/${id}`,
    PENDING:             "/api/activity-participations/pending",
    APPROVE:             (id: string) => `/api/activity-participations/${id}/approve`,
    REJECT:              (id: string) => `/api/activity-participations/${id}/reject`,
    MY_REQUESTS:         "/api/activity-participations/my-requests",
    CANCEL:              (id: string) => `/api/activity-participations/${id}/cancel`,
    MARK_ATTENDANCE:     (id: string) => `/api/activity-participations/${id}/mark-attendance`,
    BULK_MARK_ATTENDANCE:"/api/activity-participations/bulk-mark-attendance",
  },
  CERTIFICATES: {
    BASE:  "/api/certificates",
    BY_ID: (id: string) => `/api/certificates/${id}`,
  },
  FEATURED_POSTS: {
    BASE:  "/api/featured-posts",
    BY_ID: (id: string) => `/api/featured-posts/${id}`,
  },
  VOLUNTEER_SPOTLIGHT: {
    BASE:  "/api/volunteer-spotlight",
    BY_ID: (id: string) => `/api/volunteer-spotlight/${id}`,
  },
  MONTHLY_MAGAZINES: {
    BASE:   "/api/monthly-magazines",
    BY_ID:  (id: string) => `/api/monthly-magazines/${id}`,
    UPLOAD: "/api/uploads/magazines",
  },
  UPLOADS: {
    BY_SCOPE: (scope: "featured-posts" | "activities" | "profiles" | "volunteer-spotlight" | "magazines") =>
      `/api/uploads/${scope}`,
  },
  NOTIFICATIONS: {
    BASE:          "/api/notifications",
    BROADCASTS:    "/api/notifications?broadcasts=1",
    MARK_AS_READ:  (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: "/api/notifications/read-all",
    CLEAR:         "/api/notifications",
  },
  EMAILS: {
    BASE: "/api/emails",
    PREVIEW: (target: string, targetValue?: string, minHours?: number, skillFilter?: string) => {
      const q = new URLSearchParams({ target });
      if (targetValue) q.set("targetValue", targetValue);
      if (minHours)    q.set("minHours",    String(minHours));
      if (skillFilter) q.set("skillFilter", skillFilter);
      return `/api/emails?${q.toString()}`;
    },
  },
  DOWNLOAD: {
    PRESIGN: (key: string) => `/api/download?key=${encodeURIComponent(key)}`,
  },
} as const;