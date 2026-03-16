import { ActivityParticipation } from "@/core/domain/entities";
import type { ApprovedVolunteerRow } from "@/core/application/dtos";

interface IActivityParticipationRepository {
  findById(id: string): Promise<ActivityParticipation | null>;
  sumAttendedHours(userId: string): Promise<number>;
  findByActivityAndVolunteer(activityId: string, volunteerId: string): Promise<ActivityParticipation | null>;
  findPendingByActivity(activityId: string): Promise<ActivityParticipation[]>;
  findAllPending(): Promise<ActivityParticipation[]>;
  findByVolunteer(volunteerId: string): Promise<ActivityParticipation[]>;
  findApprovedVolunteers(activityId: string): Promise<ApprovedVolunteerRow[]>;
  create(participation: ActivityParticipation): Promise<ActivityParticipation>;
  update(participation: ActivityParticipation): Promise<ActivityParticipation>;
  delete(id: string): Promise<boolean>;
}

export default IActivityParticipationRepository;