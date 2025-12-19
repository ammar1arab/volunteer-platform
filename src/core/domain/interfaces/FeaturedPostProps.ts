import { BaseEntityProps } from "./BaseEntityProps";

export interface FeaturedPostProps extends BaseEntityProps {
  imageUrl: string;
  title: string;
  description: string;
}
