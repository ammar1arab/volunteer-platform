import { Activity } from "@/core/domain/entities";

interface IActivityRepository {
  findById(id: string): Promise<Activity | null>;
  findAll(): Promise<Activity[]>;
  findSummaryById(id: string): Promise<{ title: string; activityType: string; durationHours: number } | null>;
  findPublished(): Promise<Activity[]>;
  findByCreator(creatorId: string): Promise<Activity[]>;
  create(activity: Activity): Promise<Activity>;
  update(activity: Activity): Promise<Activity>;
  delete(id: string): Promise<boolean>;
}

export default IActivityRepository;