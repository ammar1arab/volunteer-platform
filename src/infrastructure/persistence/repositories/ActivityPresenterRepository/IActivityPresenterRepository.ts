import { ActivityPresenter } from "@/core/domain/entities";

interface IActivityPresenterRepository {
  findById(id: string): Promise<ActivityPresenter | null>;
  findByActivity(activityId: string): Promise<ActivityPresenter[]>;
  findByActivityAndPresenter(activityId: string, presenterId: string): Promise<ActivityPresenter | null>;
  findActivePrimaryByActivities(activityIds: string[]): Promise<Map<string, ActivityPresenter>>;
  create(presenter: ActivityPresenter): Promise<ActivityPresenter>;
  update(presenter: ActivityPresenter): Promise<ActivityPresenter>;
  delete(id: string): Promise<boolean>;
}

export default IActivityPresenterRepository;
