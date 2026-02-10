import { Gender } from "@/core/domain/enums";

export const GENDER_OPTIONS = [
  { value: Gender.MALE, label: "ذكر" },
  { value: Gender.FEMALE, label: "أنثى" },
];

export const getGenderLabel = (genderValue: Gender): string => {
  const gender = GENDER_OPTIONS.find((g) => g.value === genderValue);
  return gender?.label || genderValue;
};