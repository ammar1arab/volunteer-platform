import {
  JordanianCity,
  Gender,
  DomainFeaturedPostCategory,
  DayOfWeek,
  MeetingPlatform,
  ParticipationStatus,
  AttendanceStatus,
  ActivityType,
  ActivityStatus,
  AdminPermission,
  UserRole
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
  MANAGE_POSTS: "المنشورات",
  MANAGE_SPOTLIGHT: "أبرز المتطوعين",
  MANAGE_MAGAZINE: "حصاد العطاء",
  MANAGE_ACTIVITIES: "الفرص التطوعية",
  MANAGE_REQUESTS: "طلبات الانضمام",
  MANAGE_NOTIFICATIONS: "إدارة الإشعارات",
  MANAGE_EMAILS: "إدارة الإيميلات",
  MANAGE_USERS: "إدارة المستخدمين"
};

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "ذكر",
  [Gender.FEMALE]: "أنثى"
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

// Helper functions for components
export const getGenderLabel = (gender: Gender) => GENDER_LABELS[gender] || gender;
export const getCityLabel = (city: JordanianCity) => CITY_LABELS[city] || city;
export const getCategoryLabel = (cat: DomainFeaturedPostCategory) => CATEGORY_LABELS[cat] || cat;
export const getDayLabel = (day: DayOfWeek) => DAY_LABELS[day] || day;
export const getMonthLabel = (month: number) => MONTH_LABELS[month] || String(month);
export const getActivityStatusLabel = (s: ActivityStatus) => ACTIVITY_STATUS_LABELS[s] || s;
export const getActivityTypeLabel = (t: ActivityType) => ACTIVITY_TYPE_LABELS[t] || t;
export const getAttendanceStatusLabel = (s: AttendanceStatus) => ATTENDANCE_STATUS_LABELS[s] || s;
export const getParticipationStatusLabel = (s: ParticipationStatus) => PARTICIPATION_STATUS_LABELS[s] || s;
export const getMeetingPlatformLabel = (p: MeetingPlatform) => MEETING_PLATFORM_LABELS[p] || p;

export const ACTIVITY_TYPE_OPTIONS = Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => ({ value, label }));
export const MEETING_PLATFORM_OPTIONS = Object.entries(MEETING_PLATFORM_LABELS).map(([value, label]) => ({
  value,
  label
}));
export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }));
export const CITY_OPTIONS = Object.entries(CITY_LABELS).map(([value, label]) => ({ value, label }));
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
export const DAY_OPTIONS = Object.entries(DAY_LABELS).map(([value, label]) => ({ value, label }));

export const getPermissionLabel = (permission: AdminPermission) => PERMISSION_LABELS[permission] ?? permission;
export const getUserRoleLabel = (role: UserRole | string) => USER_ROLE_LABELS[role as UserRole] ?? role;
export const getNotificationTypeLabel = (type: NotificationType | string) =>
  NOTIFICATION_TYPE_LABELS[type as NotificationType] ?? type;
