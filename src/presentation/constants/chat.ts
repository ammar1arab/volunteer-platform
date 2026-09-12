import type { StoredChatMessageDto } from "@/core/application/dtos";

export const CHAT_ASSISTANT_NAME = "رفيق بصمات";
export const CHAT_ASSISTANT_ROLE = "مساعدك الرقمي في المنصة";
export const CHAT_MAX_INPUT = 500;
export const CHAT_HISTORY_WINDOW = 6;
export const CHAT_DEFAULT_LIMIT = 50;
export const CHAT_LOW_QUOTA = 10;

export const CHAT_BOT_POSES = {
  idle: "/images/basmat-agent-idle.png",
  run: "/images/basmat-agent-run.png",
  invite: "/images/basmat-agent-invite.png",
  cheer: "/images/basmat-agent-cheer.png",
  think: "/images/basmat-agent-think.png",
  thinking: "/images/basmat-agent-thinking.png",
  search: "/images/basmat-agent-search.png",
  rest: "/images/basmat-agent-rest.png",
  torch: "/images/basmat-agent-torch.png",
  wave: "/images/basmat-agent-wave.png",
  greeting: "/images/basmat-agent-greeting.png",
  success: "/images/basmat-agent-success.png"
} as const;

export type BotPose = keyof typeof CHAT_BOT_POSES;

export const CHAT_BOT_POSE_KEYS = Object.keys(CHAT_BOT_POSES) as BotPose[];

export const CHAT_WELCOME: StoredChatMessageDto = {
  id: "welcome",
  role: "assistant",
  content:
    "أهلاً بك 👋 أنا **رفيق بصمات**. اسألني عن التسجيل أو الأنشطة أو الشهادات، وأستطيع مساعدتك في أي سؤال آخر أيضاً."
};

export type ChatPromoIcon =
  | "Smile"
  | "HeartHandshake"
  | "Award"
  | "UserRound"
  | "CalendarDays"
  | "BookOpen"
  | "Sparkles"
  | "Newspaper";

export type ChatPromoAction = { type: "chat" } | { type: "href"; href: string };

export type ChatPromoTip = {
  id: string;
  text: string;
  icon: ChatPromoIcon;
  action: ChatPromoAction;
};

export const CHAT_TEXT = {
  promo: "أهلاً بك. كيف يمكنني مساعدتك؟",
  placeholder: "اكتب سؤالك هنا",
  placeholderBlocked: "انتهت رسائل اليوم",
  historyTitle: "محادثاتي",
  historyNote: "محفوظة على هذا الجهاز فقط.",
  historyEmpty: "لا توجد محادثات محفوظة بعد.",
  historyEmptyTitle: "لا محادثات بعد",
  historyLoading: "جاري تحميل المحادثات...",
  quotaLabel: "المتبقي اليوم",
  copied: "تم نسخ الرد",
  copyFailed: "تعذّر النسخ، يمكنك تحديد النص ونسخه يدوياً",
  discoveryTitle: "ما أقرب مجال إلى اهتمامك؟",
  discoveryEmpty: "لا توجد فرص مطابقة حالياً، جرّب مجالاً آخر أو تصفّح كل الفرص.",
  deleteTitle: "حذف المحادثة",
  deleteMessage: "سيتم حذف هذه المحادثة نهائياً ولا يمكن استرجاعها. هل تريد المتابعة؟",
  deleteConfirm: "حذف",
  cancel: "إلغاء",
  onlineActivity: "نشاط إلكتروني",
  sendFailed: "تعذّر الوصول إلى المساعد حالياً."
} as const;

export const CHAT_TIPS = {
  quota: "الرسائل المتبقية لك اليوم. نضع حداً يومياً لإدارة تكلفة الخدمة والحفاظ على جودتها.",
  cta: "اطلب AI Bot",
  ctaNudge: "Buy your AI bot",
  history: "محادثاتي",
  newChat: "محادثة جديدة",
  minimize: "تصغير النافذة",
  close: "إغلاق المساعد",
  open: "فتح المساعد",
  copy: "نسخ الرد",
  delete: "حذف المحادثة",
  stop: "إيقاف الرد",
  regenerate: "إعادة توليد الرد",
  send: "إرسال"
} as const;

export const CHAT_SUGGESTIONS = [
  "كيف أنضم لنشاط؟",
  "كيف أحصل على شهادة؟",
  "كيف أسجّل في المنصة؟",
  "ما هي أنواع الأنشطة؟"
] as const;

export const CHAT_AGENT_CTA = {
  title: "نفس حضور رفيق بصمات… لمشروعك",
  lead: "أصمّم مساعدين بشخصية واضحة وردود دقيقة وتجربة محترفة - من الفكرة حتى الإطلاق. نبدأ بفهم احتياجك، ثم نتفق بهدوء على العرض المناسب لمشروعك.",
  action: "تواصل معي",
  website: "https://ammararab.com",
  whatsapp:
    "https://wa.me/962788482930?text=" +
    encodeURIComponent("مرحباً عمّار، شاهدت رفيق بصمات وأرغب بمساعد ذكي مشابه لمشروعي.")
} as const;

export const CHAT_PAGE_PROMPTS: ReadonlyArray<[string, string]> = [
  ["/activities/", "أنا في صفحة تفاصيل نشاط. ما الذي يجب أن أتأكد منه قبل الانضمام؟"],
  ["/activities", "أنا في صفحة الفرص التطوعية. ساعدني في اختيار فرصة مناسبة."],
  ["/profile", "أنا في صفحة ملفي التطوعي. ما أهم خطوة أقوم بها الآن؟"]
];

export const CHAT_PAGE_PROMPT_FALLBACK = "أنا في منصة بصمات. من أين تنصحني أن أبدأ؟";

export const CHAT_PROMO_TIPS: readonly ChatPromoTip[] = [
  {
    id: "welcome",
    text: "أهلاً بك. كيف يمكنني مساعدتك؟",
    icon: "Smile",
    action: { type: "chat" }
  },
  {
    id: "activities",
    text: "فرص تطوعية بانتظارك. شارك معنا.",
    icon: "HeartHandshake",
    action: { type: "href", href: "/activities" }
  },
  {
    id: "profile",
    text: "أكمل ملفك التطوعي ليظهر حضورك.",
    icon: "UserRound",
    action: { type: "href", href: "/volunteer/profile" }
  },
  {
    id: "certificates",
    text: "شهاداتك محفوظة في حسابك.",
    icon: "Award",
    action: { type: "href", href: "/volunteer/certificates" }
  },
  {
    id: "magazines",
    text: "اطّلع على مجلتنا الدورية.",
    icon: "BookOpen",
    action: { type: "href", href: "/magazines" }
  },
  {
    id: "posts",
    text: "آخر منشوراتنا وإنجازات المنصة.",
    icon: "Newspaper",
    action: { type: "href", href: "/posts" }
  },
  {
    id: "spotlight",
    text: "قصص متطوعين مميزين هذا الشهر.",
    icon: "Sparkles",
    action: { type: "href", href: "/spotlight" }
  },
  {
    id: "about",
    text: "تعرّف إلى بصمات شبابية ورسالتها.",
    icon: "CalendarDays",
    action: { type: "href", href: "/about" }
  }
];

export const CHAT_BOT_TIP_MOMENTS: readonly BotPose[] = ["invite", "wave", "greeting", "cheer"];

export const CHAT_PROMO_FIRST_MS = 50_000;
export const CHAT_PROMO_CYCLE_MS = 150_000;
export const CHAT_PROMO_SHOW_MS = 18_000;

export const CHAT_CTA_NUDGE_FIRST_MS = 120_000;
export const CHAT_CTA_NUDGE_CYCLE_MS = 300_000;
export const CHAT_CTA_NUDGE_SHOW_MS = 1_800;

export type BotPresenceMode = "full" | "bot" | "hidden";

export const BOT_PRESENCE_KEY = "basmat-bot-presence";

export const BOT_PRESENCE_OPTIONS: readonly {
  id: BotPresenceMode;
  label: string;
  hint: string;
}[] = [
  { id: "full", label: "مع الدعوات", hint: "الروبوت مع رسائل قصيرة" },
  { id: "bot", label: "روبوت فقط", hint: "بدون رسائل دعوة" },
  { id: "hidden", label: "إخفاء", hint: "إخفاء رفيق بصمات" }
];

