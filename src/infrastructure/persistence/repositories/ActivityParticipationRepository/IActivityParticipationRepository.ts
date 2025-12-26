import { ActivityParticipation } from "@/core/domain/entities";

interface IActivityParticipationRepository {
  findById(id: string): Promise<ActivityParticipation | null>;
  findByActivityAndVolunteer(activityId: string, volunteerId: string): Promise<ActivityParticipation | null>;
  findPendingByActivity(activityId: string): Promise<ActivityParticipation[]>;
  findAllPending(): Promise<ActivityParticipation[]>;
  findByVolunteer(volunteerId: string): Promise<ActivityParticipation[]>;
  create(participation: ActivityParticipation): Promise<ActivityParticipation>;
  update(participation: ActivityParticipation): Promise<ActivityParticipation>;
  delete(id: string): Promise<boolean>;
}

export default IActivityParticipationRepository;