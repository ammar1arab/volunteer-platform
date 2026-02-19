import { JordanianCity, Gender, DomainFeaturedPostCategory, DayOfWeek } from "@/core/domain/enums";

export const GENDER_LABELS: Record<Gender, string> = {
  [Gender.MALE]: "ذكر",
  [Gender.FEMALE]: "أنثى"
};

export const CITY_LABELS: Record<JordanianCity, string> = {
  [JordanianCity.AMMAN]: "عمّان",
  [JordanianCity.ZARQA]: "الزرقاء",
  [JordanianCity.IRBID]: "إربد",
  [JordanianCity.AQABA]: "العقبة",
  [JordanianCity.SALT]: "السلط",
  [JordanianCity.MAFRAQ]: "المفرق",
  [JordanianCity.KARAK]: "الكرك",
  [JordanianCity.MADABA]: "مادبا",
  [JordanianCity.JERASH]: "جرش",
  [JordanianCity.AJLOUN]: "عجلون",
  [JordanianCity.TAFILAH]: "الطفيلة",
  [JordanianCity.MAAN]: "معان",
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
  [DomainFeaturedPostCategory.LAW]: "قانون"
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

// Helper functions for components
export const getGenderLabel = (gender: Gender) => GENDER_LABELS[gender] || gender;
export const getCityLabel = (city: JordanianCity) => CITY_LABELS[city] || city;
export const getCategoryLabel = (cat: DomainFeaturedPostCategory) => CATEGORY_LABELS[cat] || cat;
export const getDayLabel = (day: DayOfWeek) => DAY_LABELS[day] || day;

// For select inputs in forms
export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({ value, label }));
export const CITY_OPTIONS = Object.entries(CITY_LABELS).map(([value, label]) => ({ value, label }));
export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
export const DAY_OPTIONS = Object.entries(DAY_LABELS).map(([value, label]) => ({ value, label }));
