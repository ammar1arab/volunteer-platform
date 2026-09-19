import { isEducationLevel } from "./EducationLevel";
import { isGender } from "./Gender";
import { isJordanianCity } from "./JordanianCity";

export const AUDIENCE_TARGETS = [
  "ALL",
  "CITY",
  "GENDER",
  "AGE",
  "HOURS",
  "EDUCATION",
  "EXPERIENCE",
  "INTEREST",
  "SKILL",
  "LANGUAGE",
  "VOLUNTEER_TYPE",
  "USERS",
  "ACTIVITY_PENDING",
  "ACTIVITY_APPROVED"
] as const;

export type AudienceTarget = (typeof AUDIENCE_TARGETS)[number];

export function isAudienceTarget(value: string): value is AudienceTarget {
  return (AUDIENCE_TARGETS as readonly string[]).includes(value);
}

export function audienceTargetNeedsValue(target: AudienceTarget): boolean {
  return target !== "ALL" && target !== "USERS";
}

function isNonNegativeNumber(value?: string): boolean {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) && n >= 0;
}

export function audienceTargetError(
  target: string,
  targetValue?: string,
  userIds?: string[]
): string | null {
  if (!isAudienceTarget(target)) return "نوع الاستهداف غير صحيح";
  if (userIds?.length) return null;
  if (target === "USERS") return "يجب تحديد مستخدم واحد على الأقل";
  if (target === "ALL") return null;
  if (target === "CITY" && !isJordanianCity(targetValue ?? "")) return "القيمة مطلوبة";
  if (target === "GENDER" && !isGender(targetValue ?? "")) return "القيمة مطلوبة";
  if ((target === "AGE" || target === "HOURS") && !isNonNegativeNumber(targetValue)) {
    return "القيمة غير صحيحة";
  }
  if (target === "EDUCATION" && !isEducationLevel(targetValue ?? "")) return "القيمة مطلوبة";
  if (target === "EXPERIENCE" && targetValue !== "true" && targetValue !== "false") {
    return "القيمة مطلوبة";
  }
  if (
    (target === "INTEREST" ||
      target === "SKILL" ||
      target === "LANGUAGE" ||
      target === "VOLUNTEER_TYPE" ||
      target === "ACTIVITY_PENDING" ||
      target === "ACTIVITY_APPROVED") &&
    !targetValue
  ) {
    return target.startsWith("ACTIVITY") ? "يجب اختيار نشاط" : "القيمة مطلوبة";
  }
  return null;
}
