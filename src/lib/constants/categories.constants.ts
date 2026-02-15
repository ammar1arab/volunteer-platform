import { FeaturedPostCategory } from "@/core/domain/enums";

export const FEATURED_POST_CATEGORIES = [
  { value: FeaturedPostCategory.HEALTH, label: "صحة" },
  { value: FeaturedPostCategory.EDUCATION, label: "تعليم" },
  { value: FeaturedPostCategory.TECHNOLOGY, label: "تكنولوجيا" },
  { value: FeaturedPostCategory.ENVIRONMENT, label: "بيئة" },
  { value: FeaturedPostCategory.ENTREPRENEURSHIP, label: "ريادة أعمال" },
  { value: FeaturedPostCategory.SELF_DEVELOPMENT, label: "تطوير ذات" },
  { value: FeaturedPostCategory.ARTS, label: "فنون" },
  { value: FeaturedPostCategory.SPORTS, label: "رياضة" },
  { value: FeaturedPostCategory.ENTERTAINMENT, label: "ترفيه" },
  { value: FeaturedPostCategory.DISABILITY, label: "ذوي الإعاقة" },
  { value: FeaturedPostCategory.ECONOMY, label: "اقتصاد" },
  { value: FeaturedPostCategory.LAW, label: "قانون" },
];

export const getCategoryLabel = (category: FeaturedPostCategory): string => {
  const found = FEATURED_POST_CATEGORIES.find((c) => c.value === category);
  return found?.label || category;
};
