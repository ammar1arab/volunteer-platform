export enum JordanianCity {
  AMMAN = "AMMAN",
  ZARQA = "ZARQA",
  IRBID = "IRBID",
  AQABA = "AQABA",
  SALT = "SALT",
  MAFRAQ = "MAFRAQ",
  KARAK = "KARAK",
  MADABA = "MADABA",
  JERASH = "JERASH",
  AJLOUN = "AJLOUN",
  TAFILAH = "TAFILAH",
  MAAN = "MAAN",
  RAMTHA = "RAMTHA",
  OUTOFJORDAN = "OUTOFJORDAN",
}

const JORDANIAN_CITY_VALUES = new Set<string>(Object.values(JordanianCity));

export function isJordanianCity(value: string): value is JordanianCity {
  return JORDANIAN_CITY_VALUES.has(value);
}