export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const calculateAge = (dateOfBirth: Date | string): number => {
  const today = new Date();
  const birthDate =
    typeof dateOfBirth === "string" ? new Date(dateOfBirth) : dateOfBirth;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const getMinDateOfBirth = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 10);
  return formatDateForInput(date);
};

export const getMaxDateOfBirth = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 100);
  return formatDateForInput(date);
};

export const formatDateArabic = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-JO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};
