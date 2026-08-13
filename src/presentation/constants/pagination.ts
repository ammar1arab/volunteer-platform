export const PAGINATION_LABELS = {
  previous: "السابق",
  next: "التالي",
  pageOf: (page: number, total: number) => `صفحة ${page} من ${total}`
} as const;
