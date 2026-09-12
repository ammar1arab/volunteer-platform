import type { StoredChatMessageDto } from "@/core/application/dtos";

export const CHAT_ASSISTANT_NAME = "رفيق بصمات";
export const CHAT_ASSISTANT_ROLE = "مساعدك الرقمي في المنصة";
export const CHAT_MAX_INPUT = 500;
export const CHAT_HISTORY_WINDOW = 6;
export const CHAT_DEFAULT_LIMIT = 50;
export const CHAT_LOW_QUOTA = 10;

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
    text: "تصفّح الفرص التطوعية المتاحة، وشارك معنا.",
    icon: "HeartHandshake",
    action: { type: "href", href: "/activities" }
  },
  {
    id: "profile",
    text: "أكمل ملفك التطوعي ليظهر حضورك بوضوح.",
    icon: "UserRound",
    action: { type: "href", href: "/volunteer/profile" }
  },
  {
    id: "certificates",
    text: "شهاداتك محفوظة في حسابك، ويمكنك الرجوع إليها في أي وقت.",
    icon: "Award",
    action: { type: "href", href: "/volunteer/certificates" }
  },
  {
    id: "magazines",
    text: "لا يفوتك الاطلاع على مجلتنا الدورية.",
    icon: "BookOpen",
    action: { type: "href", href: "/magazines" }
  },
  {
    id: "posts",
    text: "اطّلع على آخر منشوراتنا وإنجازات المنصة.",
    icon: "Newspaper",
    action: { type: "href", href: "/posts" }
  },
  {
    id: "spotlight",
    text: "تعرّف إلى قصص المتطوعين المميزين هذا الشهر.",
    icon: "Sparkles",
    action: { type: "href", href: "/spotlight" }
  },
  {
    id: "about",
    text: "تعرّف إلى منصة بصمات شبابية ورسالتها.",
    icon: "CalendarDays",
    action: { type: "href", href: "/about" }
  }
];

export const CHAT_PROMO_ROTATE_MS = 9000;

export const BOT_RIVE = {
  src: "/rive/basmat-agent.riv",
  stateMachine: "mascot",
  poseInput: "pose",
  pokeTrigger: "poke",
  poses: {
    idle: 0,
    run: 1,
    invite: 2,
    cheer: 3,
    think: 4,
    thinking: 5,
    search: 6,
    rest: 7,
    torch: 8,
    wave: 9,
    greeting: 10,
    success: 11
  }
} as const;
