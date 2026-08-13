const DEFAULT_JITSI_HOST = "meet.jit.si";
const DEFAULT_ROOM_PREFIX = "YouthPrints";
const DEFAULT_LOAD_TIMEOUT_MS = 12_000;

const readEnv = (key: "NEXT_PUBLIC_JITSI_HOST" | "NEXT_PUBLIC_JITSI_ROOM_PREFIX") => {
  const value = process.env[key];
  return value?.trim() || "";
};

export const DEFAULT_ACTIVITY_TIME_ZONE = "Asia/Amman";

export const getJitsiHost = () =>
  (readEnv("NEXT_PUBLIC_JITSI_HOST") || DEFAULT_JITSI_HOST)
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

export const getJitsiRoomPrefix = () => readEnv("NEXT_PUBLIC_JITSI_ROOM_PREFIX") || DEFAULT_ROOM_PREFIX;

export const getMeetingEmbedTimeoutMs = () => DEFAULT_LOAD_TIMEOUT_MS;

export const MEETING_GATE_POLL_MS = 3_000;

export const JITSI_LANGUAGE = "ar";

export const getJitsiRoomName = (activityId: string) =>
  `${getJitsiRoomPrefix()}${activityId.replace(/-/g, "")}`;

export const getJitsiExternalApiSrc = () => `https://${getJitsiHost()}/external_api.js`;

export const MEETING_PHASES = ["upcoming", "live", "ended"] as const;
export type MeetingPhase = (typeof MEETING_PHASES)[number];

export const MEETING_PHASE_LABELS: Record<MeetingPhase, string> = {
  upcoming: "قادم",
  live: "مباشر",
  ended: "منتهٍ"
};

export const MEETING_LABELS = {
  roomTitle: "قاعة الاجتماع",
  leave: "مغادرة القاعة",
  back: "العودة",
  retry: "إعادة المحاولة",
  rejoin: "العودة للقاعة",
  notFound: "النشاط غير موجود",
  emptyLink: "رابط الاجتماع غير متوفر بعد",
  forbidden: "ليس لديك صلاحية للانضمام إلى هذا الاجتماع",
  launchError: "تعذر فتح هذا الاجتماع حالياً",
  loadError: "تعذر تحميل القاعة",
  loadErrorMessage: "تحقق من الاتصال ثم أعد المحاولة.",
  leftTitle: "غادرت القاعة",
  leftMessage: "يمكنك العودة للقاعة أو مغادرة الصفحة.",
  guestName: "متطوع",
  participants: "مشاركون",
  leaveTitle: "مغادرة القاعة",
  leaveMessage: "هل تريد مغادرة قاعة الاجتماع؟",
  leaveConfirm: "مغادرة",
  leaveCancel: "البقاء",
  leaveWarning: "سيتم إغلاق الكاميرا والميكروفون.",
  hostBadge: "مضيف",
  enterAsHost: "ادخل كمضيف",
  identityVia: "الدخول عبر",
  fullscreen: "ملء الشاشة",
  exitFullscreen: "إنهاء ملء الشاشة",
  dateLabel: "التاريخ",
  timeLabel: "الوقت",
  waitingHostTitle: "بانتظار المضيف",
  waitingHostMessage: "المضيف لم يدخل القاعة بعد. سيظهر طلبك في قائمة الانتظار فور وصوله.",
  waitingAdmitTitle: "بانتظار الموافقة",
  waitingAdmitMessage: "المضيف داخل القاعة. سيتم إدخالك بعد الموافقة على طلبك.",
  deniedTitle: "لم يتم قبول دخولك",
  deniedMessage: "المضيف رفض انضمامك إلى هذا الاجتماع.",
  dockTitle: "بانتظار الدخول",
  admit: "قبول",
  deny: "رفض",
  emptyWaiting: "لا يوجد منتظرون"
} as const;

export const MEETING_GATE_COPY = {
  waiting_host: {
    title: MEETING_LABELS.waitingHostTitle,
    message: MEETING_LABELS.waitingHostMessage
  },
  waiting_admit: {
    title: MEETING_LABELS.waitingAdmitTitle,
    message: MEETING_LABELS.waitingAdmitMessage
  },
  denied: {
    title: MEETING_LABELS.deniedTitle,
    message: MEETING_LABELS.deniedMessage
  }
} as const;

export const MEETING_TOASTS = {
  joined: "تم الانضمام إلى القاعة",
  left: "غادرت القاعة",
  cancelled: "تم إلغاء الانضمام",
  failed: "تعذر تشغيل القاعة",
  retrying: "جاري إعادة المحاولة",
  admitted: "تم قبول المشارك",
  rejected: "تم رفض المشارك"
} as const;

export const JITSI_TOOLBAR_BUTTONS = [
  "microphone",
  "camera",
  "desktop",
  "chat",
  "raisehand",
  "participants-pane",
  "tileview",
  "toggle-camera",
  "select-background",
  "videoquality",
  "filmstrip",
  "noisesuppression",
  "settings",
  "hangup"
] as const;

export const JITSI_CONFIG_OVERWRITE = {
  prejoinConfig: { enabled: false },
  prejoinPageEnabled: false,
  disableDeepLinking: true,
  startWithAudioMuted: true,
  startWithVideoMuted: true,
  defaultLanguage: JITSI_LANGUAGE,
  disableInviteFunctions: true,
  enableWelcomePage: false,
  enableClosePage: false,
  welcomePageEnabled: false,
  hideConferenceName: true,
  analytics: { disabled: true },
  hideConferenceSubject: false,
  toolbarButtons: [...JITSI_TOOLBAR_BUTTONS]
} as const;

export const JITSI_INTERFACE_OVERWRITE = {
  SHOW_JITSI_WATERMARK: false,
  SHOW_BRAND_WATERMARK: false,
  SHOW_POWERED_BY: false,
  SHOW_CHROME_EXTENSION_BANNER: false,
  MOBILE_APP_PROMO: false,
  DISPLAY_WELCOME_FOOTER: false,
  DISPLAY_WELCOME_PAGE_CONTENT: false,
  DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
  CLOSE_PAGE_GUEST_HINT: false,
  DEFAULT_REMOTE_DISPLAY_NAME: MEETING_LABELS.guestName
} as const;
