import { Activity } from "@/core/domain/entities";

interface IActivityRepository {
  findById(id: string): Promise<Activity | null>;
  findAll(): Promise<Activity[]>;
  findPublished(): Promise<Activity[]>;
  findByCreator(creatorId: string): Promise<Activity[]>;
  create(activity: Activity): Promise<Activity>;
  update(activity: Activity): Promise<Activity>;
  delete(id: string): Promise<boolean>;
}

export default IActivityRepository;