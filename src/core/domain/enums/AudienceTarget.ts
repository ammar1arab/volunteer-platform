import { isGender } from "./Gender";
import { isJordanianCity } from "./JordanianCity";

export const AUDIENCE_TARGETS = [
  "ALL",
  "CITY",
  "GENDER",
  "HOURS",
  "USERS",
  "ACTIVITY_PENDING",
  "ACTIVITY_APPROVED"
] as const;

export type AudienceTarget = (typeof AUDIENCE_TARGETS)[number];

export function isAudienceTarget(value: string): value is AudienceTarget {
  return (AUDIENCE_TARGETS as readonly string[]).includes(value);
}

export function audienceTargetNeedsValue(target: AudienceTarget): boolean {
  return (
    target === "CITY" ||
    target === "GENDER" ||
    target === "HOURS" ||
    target === "ACTIVITY_PENDING" ||
    target === "ACTIVITY_APPROVED"
  );
}

export function audienceTargetError(
  target: string,
  targetValue?: string,
  userIds?: string[]
): string | null {
  if (!isAudienceTarget(target)) return "نوع الاستهداف غير صحيح";
  if (userIds?.length) return null;
  if (target === "USERS") return "يجب تحديد مستخدم واحد على الأقل";
  if (target === "CITY" && !isJordanianCity(targetValue ?? "")) return "القيمة مطلوبة";
  if (target === "GENDER" && !isGender(targetValue ?? "")) return "القيمة مطلوبة";
  if (target === "HOURS") {
    const n = parseFloat(targetValue ?? "");
    if (!Number.isFinite(n) || n < 0) return "قيمة الساعات غير صحيحة";
  }
  if ((target === "ACTIVITY_PENDING" || target === "ACTIVITY_APPROVED") && !targetValue) {
    return "يجب اختيار نشاط";
  }
  return null;
}
