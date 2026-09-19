export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

const GENDER_VALUES = new Set<string>(Object.values(Gender));

export function isGender(value: string): value is Gender {
  return GENDER_VALUES.has(value);
}