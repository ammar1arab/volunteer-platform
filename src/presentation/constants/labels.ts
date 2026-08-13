import {
  JordanianCity,
  Gender,
  EducationLevel,
  DomainFeaturedPostCategory,
  DayOfWeek,
  MeetingPlatform,
  ParticipationStatus,
  AttendanceStatus,
  ActivityType,
  ActivityStatus,
  AdminPermission,
  UserRole,
  MeetingLinkSource,
  MeetingSyncStatus
} from "@/core/domain/enums";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.VOLUNTEER]: "متطوع",
  [UserRole.ADMIN]: "مشرف"
};

import { NotificationType } from "@/core/domain/enums";

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  [NotificationType.WELCOME]: "ترحيب",
  [NotificationType.CERTIFICATE_ISSUED]: "شهادة تطوعية",
  [NotificationType.ANNOUNCEMENT]: "إعلان",
  [NotificationType.ACTIVITY_REMINDER]: "تذكير بنشاط",
  [NotificationType.PARTICIPATION_APPROVED]: "قبول مشاركة",
  [NotificationType.PARTICIPATION_REJECTED]: "رد على طلب",
  [NotificationType.ACTIVITY_CANCELLED]: "إلغاء نشاط",
  [NotificationType.HOURS_MILESTONE]: "إنجاز تطوعي",
  [NotificationType.ACTIVITY_FULL]: "اكتملت الأماكن"
};

export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  MANAGE_POSTS: "إدارة المنشورات",
  MANAGE_SPOTLIGHT: "إدارة أبرز المتطوعين",
  MANAGE_MAGAZINE: "إدارة حصاد العطاء",
  MANAGE_ACTIVITIES: "إدارة الفرص التطوعية",
  MANAGE_REQUESTS: "إدارة طلبات الانضمام",
  MANAGE_NOTIFICATIONS: "إدارة الإشعارات",
  MANAGE_EMAILS: "إدارة الإيميلات",
  MANAGE_USERS: "إدارة المستخدمين",
  MANAGE_MEETINGS: "إدارة الاجتماعات"
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "ذكر",
  [Gender.FEMALE]: "أنثى"
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  [EducationLevel.KINDERGARTEN]: "رياض الأطفال",
  [EducationLevel.GRADE_1]: "الصف الأول",
  [EducationLevel.GRADE_2]: "الصف الثاني",
  [EducationLevel.GRADE_3]: "الصف الثالث",
  [EducationLevel.GRADE_4]: "الصف الرابع",
  [EducationLevel.GRADE_5]: "الصف الخامس",
  [EducationLevel.GRADE_6]: "الصف السادس",
  [EducationLevel.GRADE_7]: "الصف السابع",
  [EducationLevel.GRADE_8]: "الصف الثامن",
  [EducationLevel.GRADE_9]: "الصف التاسع",
  [EducationLevel.GRADE_10]: "الصف العاشر",
  [EducationLevel.GRADE_11]: "الصف الحادي عشر",
  [EducationLevel.GRADE_12]: "الصف الثاني عشر / توجيهي",
  [EducationLevel.DIPLOMA]: "دبلوم",
  [EducationLevel.BACHELOR]: "بكالوريوس",
  [EducationLevel.MASTER]: "ماجستير",
  [EducationLevel.PHD]: "دكتوراه",
  [EducationLevel.OTHER]: "أخرى"
};
export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  [ActivityStatus.DRAFT]: "مسودة",
  [ActivityStatus.PUBLISHED]: "منشور",
  [ActivityStatus.CANCELLED]: "ملغي",
  [ActivityStatus.COMPLETED]: "مكتمل"
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  [ActivityType.IN_PERSON]: "وجاهي",
  [ActivityType.ONLINE]: "إلكتروني"
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.NOT_MARKED]: "لم يُسجَّل",
  [AttendanceStatus.ATTENDED]: "حضر",
  [AttendanceStatus.ABSENT]: "غائب"
};

export const PARTICIPATION_STATUS_LABELS: Record<ParticipationStatus, string> = {
  [ParticipationStatus.PENDING]: "قيد المراجعة",
  [ParticipationStatus.APPROVED]: "مقبول",
  [ParticipationStatus.REJECTED]: "مرفوض",
  [ParticipationStatus.CANCELLED]: "ملغي"
};

export const MEETING_PLATFORM_LABELS: Record<MeetingPlatform, string> = {
  [MeetingPlatform.ZOOM]: "Zoom",
  [MeetingPlatform.GOOGLE_MEET]: "Google Meet",
  [MeetingPlatform.TEAMS]: "Microsoft Teams",
  [MeetingPlatform.OTHER]: "أخرى"
};

export const MEETING_LINK_SOURCE_LABELS: Record<MeetingLinkSource, string> = {
  [MeetingLinkSource.MANUAL]: "رابط يدوي",
  [MeetingLinkSource.GOOGLE_MEET_AUTO]: "Google Meet تلقائي"
};

export const MEETING_SYNC_STATUS_LABELS: Record<MeetingSyncStatus, string> = {
  [MeetingSyncStatus.NONE]: "بدون مزامنة",
  [MeetingSyncStatus.PENDING]: "قيد المزامنة",
  [MeetingSyncStatus.SYNCED]: "مزامن",
  [MeetingSyncStatus.FAILED]: "فشل المزامنة",
  [MeetingSyncStatus.CANCELLED]: "ملغى"
};

export const MEETING_LINK_SOURCE_CREATE_LABELS: Record<MeetingLinkSource, string> = {
  [MeetingLinkSource.MANUAL]: "رابط يدوي",
  [MeetingLinkSource.GOOGLE_MEET_AUTO]: "إنشاء Google Meet تلقائياً"
};

export const PRESENTER_ROLE_LABELS: Record<string, string> = {
  PRIMARY: "مقدم رئيسي",
  CO_PRESENTER: "مقدم مشارك",
  MODERATOR: "مشرف"
};

export const ACTIVITY_PRESENTER_LABEL = "مقدم النشاط";
export const ACTIVITY_PRESENTER_PLACEHOLDER = "ابحث بالاسم أو البريد...";
export const ACTIVITY_PRESENTER_NONE = "بدون مقدم";
export const ACTIVITY_PRESENTER_HINT =
  "المقدم متطوع عادي من المنصة. يفتح قاعة الاجتماع ليشرح للمشاركين دون طلب انضمام، ويُضاف لدعوة التقويم. بعد انتهاء الجلسة ينتهي دوره."

export const CITY_LABELS: Record<JordanianCity, string> = {
  [JordanianCity.AMMAN]: "عمّان",
  [JordanianCity.ZARQA]: "الزرقاء",
  [JordanianCity.IRBID]: "إربد",
  [JordanianCity.AQABA]: "العقبة",
  [JordanianCity.SALT]: "البلقاء",
  [JordanianCity.MAFRAQ]: "المفرق",
  [JordanianCity.KARAK]: "الكرك",
  [JordanianCity.MADABA]: "مادبا",
  [JordanianCity.JERASH]: "جرش",
  [JordanianCity.AJLOUN]: "عجلون",
  [JordanianCity.TAFILAH]: "الطفيلة",
  [JordanianCity.MAAN]: "معان",
  [JordanianCity.RAMTHA]: "الرمثا",
  [JordanianCity.OUTOFJORDAN]: "من خارج الأردن"
};

export const CATEGORY_LABELS: Record<DomainFeaturedPostCategory, string> = {
  [DomainFeaturedPostCategory.HEALTH]: "صحة",
  [DomainFeaturedPostCategory.EDUCATION]: "تعليم",
  [DomainFeaturedPostCategory.TECHNOLOGY]: "تكنولوجيا",
  [DomainFeaturedPostCategory.ENVIRONMENT]: "بيئة",
  [DomainFeaturedPostCategory.ENTREPRENEURSHIP]: "ريادة أعمال",
  [DomainFeaturedPostCategory.SELF_DEVELOPMENT]: "تطوير ذات",
  [DomainFeaturedPostCategory.ARTS]: "فنون",
  [DomainFeaturedPostCategory.SPORTS]: "رياضة",
  [DomainFeaturedPostCategory.ENTERTAINMENT]: "ترفيه",
  [DomainFeaturedPostCategory.DISABILITY]: "ذوي الإعاقة",
  [DomainFeaturedPostCategory.ECONOMY]: "اقتصاد",
  [DomainFeaturedPostCategory.LAW]: "قانون",
  [DomainFeaturedPostCategory.CULTURE]: "ثقافي",
  [DomainFeaturedPostCategory.SPECIAL_EVENTS]: "مناسبات خاصة"
};

export const DAY_LABELS: Record<DayOfWeek, string> = {
  [DayOfWeek.SUNDAY]: "الأحد",
  [DayOfWeek.MONDAY]: "الإثنين",
  [DayOfWeek.TUESDAY]: "الثلاثاء",
  [DayOfWeek.WEDNESDAY]: "الأربعاء",
  [DayOfWeek.THURSDAY]: "الخميس",
  [DayOfWeek.FRIDAY]: "الجمعة",
  [DayOfWeek.SATURDAY]: "السبت"
};

export const MONTH_LABELS: Record<number, string> = {
  1: "يناير",
  2: "فبراير",
  3: "مارس",
  4: "أبريل",
  5: "مايو",
  6: "يونيو",
  7: "يوليو",
  8: "أغسطس",
  9: "سبتمبر",
  10: "أكتوبر",
  11: "نوفمبر",
  12: "ديسمبر"
};


export const getGenderLabel = (gender: Gender) => GENDER_LABELS[gender] || gender;
export const getEducationLevelLabel = (level: EducationLevel | string) => {
  if (level === "HIGH_SCHOOL") return "الصف الثاني عشر / توجيهي";
  return EDUCATION_LEVEL_LABELS[level as EducationLevel] || level;
};
export const getCityLabel = (city: JordanianCity) => CITY_LABELS[city] || city;

export { isJordanianCity } from "@/core/domain/enums";

const FEATURED_CATEGORY_VALUES = new Set<string>(Object.values(DomainFeaturedPostCategory));
export function isFeaturedPostCategory(value: string): value is DomainFeaturedPostCategory {
  return FEATURED_CATEGORY_VALUES.has(value);
}
export const getCategoryLabel = (cat: DomainFeaturedPostCategory) => CATEGORY_LABELS[cat] || cat;
export const getDayLabel = (day: DayOfWeek) => DAY_LABELS[day] || day;
export const getMonthLabel = (month: number) => MONTH_LABELS[month] || String(month);
export const getActivityStatusLabel = (s: ActivityStatus) => ACTIVITY_STATUS_LABELS[s] || s;
export const getActivityTypeLabel = (t: ActivityType) => ACTIVITY_TYPE_LABELS[t] || t;
export const getAttendanceStatusLabel = (s: AttendanceStatus) => ATTENDANCE_STATUS_LABELS[s] || s;
export const getParticipationStatusLabel = (s: ParticipationStatus) => PARTICIPATION_STATUS_LABELS[s] || s;
export const getMeetingPlatformLabel = (p: MeetingPlatform) => MEETING_PLATFORM_LABELS[p] || p;
export const getMeetingLinkSourceLabel = (source: MeetingLinkSource | string) =>
  MEETING_LINK_SOURCE_LABELS[source as MeetingLinkSource] || source;
export const getMeetingSyncStatusLabel = (status: MeetingSyncStatus | string) =>
  MEETING_SYNC_STATUS_LABELS[status as MeetingSyncStatus] || status;

export const MEETING_SYNC_STATUS_FILTER_OPTIONS = [
  { key: "ALL", label: "كل الحالات" },
  ...Object.entries(MEETING_SYNC_STATUS_LABELS).map(([key, label]) => ({ key, label }))
];

export const ACTIVITY_TYPE_OPTIONS = Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
export const MEETING_PLATFORM_OPTIONS = Object.entries(MEETING_PLATFORM_LABELS).map(([value, label]) => ({
  value,
  label
}));
export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }));
export const EDUCATION_LEVEL_OPTIONS = Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => ({
  value,
  label
}));
export const CITY_OPTIONS = Object.entries(CITY_LABELS).map(([value, label]) => ({ value, label }));
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
export const DAY_OPTIONS = Object.entries(DAY_LABELS).map(([value, label]) => ({ value, label }));

export const LANGUAGE_SUGGESTIONS = ["العربية", "الإنجليزية", "الفرنسية", "الألمانية", "التركية"];
export const VOLUNTEER_TYPE_SUGGESTIONS = [
  "تعليمي",
  "صحي",
  "بيئي",
  "اجتماعي",
  "تقني",
  "فعاليات",
  "إغاثة"
];
export const SKILL_SUGGESTIONS = ["تنظيم فعاليات", "تصوير", "كتابة محتوى", "تصميم", "قيادة فرق", "ترجمة"];
export const INTEREST_SUGGESTIONS = ["شباب", "تعليم", "بيئة", "صحة", "ريادة", "ثقافة"];

export const EXPERIENCE_OPTIONS = [
  { value: "true", label: "نعم، لدي خبرة تطوعية" },
  { value: "false", label: "لا، هذه بدايتي" }
];

export const getPermissionLabel = (permission: AdminPermission) => PERMISSION_LABELS[permission] ?? permission;
export const getUserRoleLabel = (role: UserRole | string) => USER_ROLE_LABELS[role as UserRole] ?? role;
export const getNotificationTypeLabel = (type: NotificationType | string) =>
  NOTIFICATION_TYPE_LABELS[type as NotificationType] ?? type;
