export const PAGINATION_LABELS = {
  previous: "السابق",
  next: "التالي",
  showing: (start: number, end: number, total: number) => `عرض ${start} - ${end} من ${total}`,
  pageOf: (page: number, total: number) => `صفحة ${page} من ${total}`
} as const;
