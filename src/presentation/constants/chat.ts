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

export const CHAT_TEXT = {
  promo: "أهلاً بك، كيف أقدر أساعدك؟",
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
