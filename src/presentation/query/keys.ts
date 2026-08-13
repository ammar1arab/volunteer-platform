export const queryKeys = {
  activities: {
    all: ["activities"] as const,
    list: (filter: "all" | "published") => ["activities", "list", filter] as const,
    detail: (id: string) => ["activities", "detail", id] as const,
    volunteers: (id: string) => ["activities", "volunteers", id] as const
  },
  users: {
    all: ["users"] as const,
    list: () => ["users", "list"] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    activities: (id: string) => ["users", "activities", id] as const
  },
  featuredPosts: {
    all: ["featured-posts"] as const,
    list: (activeOnly: boolean) => ["featured-posts", "list", { activeOnly }] as const,
    detail: (id: string) => ["featured-posts", "detail", id] as const
  },
  magazines: {
    all: ["magazines"] as const,
    list: (activeOnly: boolean) => ["magazines", "list", { activeOnly }] as const,
    detail: (id: string) => ["magazines", "detail", id] as const
  },
  spotlights: {
    all: ["spotlights"] as const,
    list: (activeOnly: boolean) => ["spotlights", "list", { activeOnly }] as const,
    detail: (id: string) => ["spotlights", "detail", id] as const
  },
  certificates: {
    all: ["certificates"] as const,
    byUser: () => ["certificates", "by-user"] as const
  },
  participations: {
    all: ["participations"] as const,
    list: (type: "my-requests" | "pending") => ["participations", "list", type] as const
  },
  notifications: {
    all: ["notifications"] as const,
    recent: () => ["notifications", "recent"] as const,
    broadcasts: () => ["notifications", "broadcasts"] as const,
    activityFilter: () => ["notifications", "activity-filter"] as const,
    broadcastRecipients: (id: string) => ["notifications", "broadcast-recipients", id] as const
  },
  profile: {
    me: () => ["profile", "me"] as const
  },
  auth: {
    checkEmail: (email: string) => ["auth", "check-email", email.toLowerCase()] as const
  },
  meetings: {
    all: ["meetings"] as const,
    list: (filter: "upcoming" | "finished" | "all") => ["meetings", "list", filter] as const,
    launch: (activityId: string) => ["meetings", "launch", activityId] as const,
    report: (activityId: string) => ["meetings", "report", activityId] as const,
    googleStatus: () => ["meetings", "google-status"] as const
  }
} as const;
