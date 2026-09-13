import type { StoredChatMessageDto } from "@/core/application/dtos";

export const CHAT_ASSISTANT_NAME = "رفيق بصمات";
export const CHAT_ASSISTANT_ROLE = "مساعدك الرقمي في المنصة";
export const CHAT_MAX_INPUT = 500;
export const CHAT_HISTORY_WINDOW = 6;
export const CHAT_DEFAULT_LIMIT = 50;
export const CHAT_LOW_QUOTA = 10;

export const CHAT_BOT_POSES = {
  idle: "/images/agent/idle.png",
  run: "/images/agent/run.png",
  invite: "/images/agent/invite.png",
  cheer: "/images/agent/cheer.png",
  think: "/images/agent/think.png",
  thinking: "/images/agent/thinking.png",
  search: "/images/agent/search.png",
  rest: "/images/agent/rest.png",
  torch: "/images/agent/torch.png",
  wave: "/images/agent/wave.png",
  greeting: "/images/agent/greeting.png",
  success: "/images/agent/success.png",
  bust: "/images/agent/bust.png",
  worried: "/images/agent/worried.png",
  plant: "/images/agent/plant.png",
  thumbs: "/images/agent/thumbs.png",
  "thumbs-close": "/images/agent/thumbs-close.png",
  read: "/images/agent/read.png",
  idea: "/images/agent/idea.png",
  point: "/images/agent/point.png",
  jump: "/images/agent/jump.png",
  celebrate: "/images/agent/celebrate.png",
  snack: "/images/agent/snack.png",
  laugh: "/images/agent/laugh.png",
  ponder: "/images/agent/ponder.png",
  shy: "/images/agent/shy.png"
} as const;

export type BotPose = keyof typeof CHAT_BOT_POSES;

export const CHAT_BOT_POSE_KEYS = Object.keys(CHAT_BOT_POSES) as BotPose[];

export type BotJourneyBeat = {
  pose: BotPose;
  hold: number;
};

export const CHAT_BOT_JOURNEYS: readonly (readonly BotJourneyBeat[])[] = [
  [
    { pose: "jump", hold: 0.9 },
    { pose: "celebrate", hold: 1.2 },
    { pose: "thumbs", hold: 1.4 },
    { pose: "idle", hold: 1.8 }
  ],
  [
    { pose: "shy", hold: 1.2 },
    { pose: "wave", hold: 1.3 },
    { pose: "invite", hold: 1.6 },
    { pose: "idle", hold: 1.6 }
  ],
  [
    { pose: "plant", hold: 2.4 },
    { pose: "thumbs", hold: 1.2 },
    { pose: "wave", hold: 1.2 }
  ],
  [
    { pose: "read", hold: 2.6 },
    { pose: "idea", hold: 1.4 },
    { pose: "point", hold: 1.5 },
    { pose: "idle", hold: 1.4 }
  ],
  [
    { pose: "snack", hold: 2.2 },
    { pose: "laugh", hold: 1.3 },
    { pose: "idle", hold: 1.6 }
  ],
  [
    { pose: "ponder", hold: 1.8 },
    { pose: "idea", hold: 1.3 },
    { pose: "thumbs-close", hold: 1.4 }
  ],
  [
    { pose: "search", hold: 1.4 },
    { pose: "point", hold: 1.3 },
    { pose: "invite", hold: 1.5 }
  ],
  [
    { pose: "greeting", hold: 1.2 },
    { pose: "wave", hold: 1.2 },
    { pose: "celebrate", hold: 1.3 },
    { pose: "idle", hold: 1.5 }
  ],
  [
    { pose: "worried", hold: 1.4 },
    { pose: "ponder", hold: 1.3 },
    { pose: "idea", hold: 1.3 },
    { pose: "thumbs", hold: 1.4 }
  ],
  [
    { pose: "torch", hold: 1.3 },
    { pose: "run", hold: 0.8 },
    { pose: "jump", hold: 0.9 },
    { pose: "success", hold: 1.4 }
  ],
  [
    { pose: "rest", hold: 1.8 },
    { pose: "read", hold: 2 },
    { pose: "idle", hold: 1.4 }
  ],
  [
    { pose: "laugh", hold: 1.2 },
    { pose: "cheer", hold: 1.2 },
    { pose: "idle", hold: 1.4 }
  ],
  [
    { pose: "point", hold: 1.3 },
    { pose: "invite", hold: 1.5 },
    { pose: "thumbs", hold: 1.3 }
  ],
  [
    { pose: "shy", hold: 1.4 },
    { pose: "laugh", hold: 1.2 },
    { pose: "wave", hold: 1.3 }
  ],
  [
    { pose: "snack", hold: 1.8 },
    { pose: "plant", hold: 2 },
    { pose: "idle", hold: 1.4 }
  ],
  [
    { pose: "idea", hold: 1.3 },
    { pose: "celebrate", hold: 1.3 },
    { pose: "thumbs-close", hold: 1.4 }
  ]
];

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

export const CHAT_BOT_TIP_MOMENTS: readonly BotPose[] = [
  "invite",
  "wave",
  "greeting",
  "cheer",
  "idea",
  "point",
  "thumbs",
  "laugh"
];

export const CHAT_PROMO_PAGE_TIPS: ReadonlyArray<[string, string]> = [
  ["/activities", "activities"],
  ["/volunteer/certificates", "certificates"],
  ["/volunteer/profile", "profile"],
  ["/magazines", "magazines"],
  ["/posts", "posts"],
  ["/spotlight", "spotlight"],
  ["/about", "about"]
];

export const CHAT_PROMO_GAP_MS = 20_000;
export const CHAT_PROMO_SHOW_MS = 12_000;

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

