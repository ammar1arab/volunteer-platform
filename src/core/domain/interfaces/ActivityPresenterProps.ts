import { BaseEntityProps } from "./BaseEntityProps";
import { PresenterRole } from "@/core/domain/enums";

export interface ActivityPresenterProps extends BaseEntityProps {
  activityId: string;
  presenterId: string;
  role: PresenterRole;
  topic: string | null;
}
