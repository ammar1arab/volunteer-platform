import { BaseEntityProps } from "./BaseEntityProps";
import { DomainFeaturedPostCategory } from "@/core/domain/enums";

export interface FeaturedPostProps extends BaseEntityProps {
  imageUrl: string;
  title: string;
  categories: DomainFeaturedPostCategory[];
  description: string;
}
