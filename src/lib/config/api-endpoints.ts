export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    SEND_OTP: "/api/auth/send-otp",
    VERIFY_OTP: "/api/auth/verify-otp",
    CHECK_OTP: "/api/auth/check-otp",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD: "/api/auth/reset-password"
  },
  USERS: {
    ME: "/api/users/me",
    BASE: "/api/users",
    BY_ID: (id: string) => `/api/users/${id}`,
    ACTIVITIES: (id: string) => `/api/users/${id}/activities`
  },
  VOLUNTEER_PROFILE: {
    BASE: "/api/volunteer-profile",
    PICTURE: "/api/volunteer-profile/picture"
  },
  ACTIVITIES: {
    BASE: "/api/activities",
    BY_ID: (id: string) => `/api/activities/${id}`,
    PUBLISH: (id: string) => `/api/activities/${id}/publish`,
    CANCEL: (id: string) => `/api/activities/${id}/cancel`,
    RESTORE: (id: string) => `/api/activities/${id}/restore`,
    COMPLETE: (id: string) => `/api/activities/${id}/complete`,
    VOLUNTEERS: (id: string) => `/api/activities/${id}/volunteers`,
    PUBLISHED: "/api/activities?filter=published"
  },
  ACTIVITY_PARTICIPATIONS: {
    BASE: "/api/activity-participations",
    BY_ID: (id: string) => `/api/activity-participations/${id}`,
    PENDING: "/api/activity-participations/pending",
    APPROVE: (id: string) => `/api/activity-participations/${id}/approve`,
    REJECT: (id: string) => `/api/activity-participations/${id}/reject`,
    MY_REQUESTS: "/api/activity-participations/my-requests",
    CANCEL: (id: string) => `/api/activity-participations/${id}/cancel`,
    MARK_ATTENDANCE: (id: string) => `/api/activity-participations/${id}/mark-attendance`,
    BULK_MARK_ATTENDANCE: "/api/activity-participations/bulk-mark-attendance"
  },
  CERTIFICATES: {
    BASE: "/api/certificates",
    BY_ID: (id: string) => `/api/certificates/${id}`
  },
  FEATURED_POSTS: {
    BASE: "/api/featured-posts",
    BY_ID: (id: string) => `/api/featured-posts/${id}`
  },
  VOLUNTEER_SPOTLIGHT: {
    BASE: "/api/volunteer-spotlight",
    BY_ID: (id: string) => `/api/volunteer-spotlight/${id}`
  },
  MONTHLY_MAGAZINES: {
    BASE: "/api/monthly-magazines",
    BY_ID: (id: string) => `/api/monthly-magazines/${id}`,
    UPLOAD: "/api/uploads/magazines"
  },
  UPLOADS: {
    BY_SCOPE: (scope: "featured-posts" | "activities" | "profiles" | "volunteer-spotlight" | "magazines") =>
      `/api/uploads/${scope}`
  },
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    BROADCASTS: "/api/notifications?broadcasts=1",
    MARK_AS_READ: (id: string) => `/api/notifications/${id}/read`,
    MARK_ALL_AS_READ: "/api/notifications/read-all",
    CLEAR: "/api/notifications"
  },
  EMAILS: {
    BASE: "/api/emails",
    PREVIEW: (filters: {
      target: string;
      targetValue?: string;
      genderFilter?: string;
      cityFilter?: string;
      minHours?: number;
      minAge?: number;
      maxAge?: number;
      interests?: string[];
      hasExperience?: boolean;
    }) => {
      const q = new URLSearchParams({ target: filters.target });
      if (filters.targetValue) q.set("targetValue", filters.targetValue);
      if (filters.genderFilter) q.set("genderFilter", filters.genderFilter);
      if (filters.cityFilter) q.set("cityFilter", filters.cityFilter);
      if (filters.minHours) q.set("minHours", String(filters.minHours));
      if (filters.minAge) q.set("minAge", String(filters.minAge));
      if (filters.maxAge) q.set("maxAge", String(filters.maxAge));
      if (filters.interests?.length) q.set("interests", filters.interests.join(","));
      if (filters.hasExperience !== undefined) q.set("hasExperience", String(filters.hasExperience));
      return `/api/emails?preview=1&${q.toString()}`;
    }
  },
  DOWNLOAD: {
    PRESIGN: (key: string) => `/api/download?key=${encodeURIComponent(key)}`
  },
  INTEGRATIONS: {
    GOOGLE: {
      STATUS: "/api/integrations/google/status",
      CONNECT: "/api/integrations/google/connect",
      DISCONNECT: "/api/integrations/google/disconnect"
    }
  },
  MEETINGS: {
    LIST: (filter: "upcoming" | "finished" | "all" | "failed" = "upcoming") =>
      `/api/meetings?filter=${filter}`,
    RETRY: (activityId: string) => `/api/meetings/${activityId}/retry`,
    LAUNCH: (activityId: string) => `/api/meetings/${activityId}/launch`,
    SESSION: (activityId: string) => `/api/meetings/${activityId}/session`,
    REPORT: (activityId: string) => `/api/meetings/${activityId}/report`,
    IMPORT_REPORT: (activityId: string) => `/api/meetings/${activityId}/import-report`,
    MATCH_ATTENDEE: (activityId: string, attendeeId: string) =>
      `/api/meetings/${activityId}/report/attendees/${attendeeId}`
  }
} as const;
