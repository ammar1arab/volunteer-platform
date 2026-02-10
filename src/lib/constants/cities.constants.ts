import { JordanianCity } from "@/core/domain/enums";

export const JORDANIAN_CITIES = [
  { value: JordanianCity.AMMAN, label: "عمّان" },
  { value: JordanianCity.ZARQA, label: "الزرقاء" },
  { value: JordanianCity.IRBID, label: "إربد" },
  { value: JordanianCity.AQABA, label: "العقبة" },
  { value: JordanianCity.SALT, label: "السلط" },
  { value: JordanianCity.MAFRAQ, label: "المفرق" },
  { value: JordanianCity.KARAK, label: "الكرك" },
  { value: JordanianCity.MADABA, label: "مادبا" },
  { value: JordanianCity.JERASH, label: "جرش" },
  { value: JordanianCity.AJLOUN, label: "عجلون" },
  { value: JordanianCity.TAFILAH, label: "الطفيلة" },
  { value: JordanianCity.MAAN, label: "معان" },
  { value: JordanianCity.OUTOFJORDAN, label: "من خارج الأردن" },
];

export const getCityLabel = (cityValue: JordanianCity): string => {
  const city = JORDANIAN_CITIES.find((c) => c.value === cityValue);
  return city?.label || cityValue;
};