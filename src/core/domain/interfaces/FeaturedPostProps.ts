import { BaseEntityProps } from "./BaseEntityProps";
import { FeaturedPostCategory } from "@/core/domain/enums";

export interface FeaturedPostProps extends BaseEntityProps {
  imageUrl: string;
  title: string;
  categories: FeaturedPostCategory[];
  description: string;
}
