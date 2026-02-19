import { JordanianCity } from "@/core/domain/enums";
import { BaseEntityProps } from "./BaseEntityProps";

export interface VolunteerSpotlightProps extends BaseEntityProps {
  imageUrl: string;
  name: string;
  description: string,
  spotlightDate: Date,
  city: JordanianCity;
}
