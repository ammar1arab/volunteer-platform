import { BaseEntity } from "@/core/domain/entities";
import { ActivityPresenterProps } from "@/core/domain/interfaces";
import { PresenterRole } from "@/core/domain/enums";

class ActivityPresenter extends BaseEntity {
  private props: ActivityPresenterProps;

  constructor(props: ActivityPresenterProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.activityId?.trim()) throw new Error("Activity ID is required");
    if (!props.presenterId?.trim()) throw new Error("Presenter ID is required");

    this.props = {
      ...props,
      activityId: props.activityId.trim(),
      presenterId: props.presenterId.trim(),
      role: props.role ?? PresenterRole.PRIMARY,
      topic: props.topic?.trim() ?? null
    };
  }

  static create(input: {
    activityId: string;
    presenterId: string;
    role?: PresenterRole;
    topic?: string | null;
  }): ActivityPresenter {
    return new ActivityPresenter({
      id: crypto.randomUUID(),
      activityId: input.activityId,
      presenterId: input.presenterId,
      role: input.role ?? PresenterRole.PRIMARY,
      topic: input.topic ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  static reconstitute(props: ActivityPresenterProps): ActivityPresenter {
    return new ActivityPresenter(props);
  }

  update(input: { role?: PresenterRole; topic?: string | null; isActive?: boolean }): void {
    let changed = false;
    if (input.role !== undefined) {
      this.props.role = input.role;
      changed = true;
    }
    if (input.topic !== undefined) {
      this.props.topic = input.topic?.trim() ?? null;
      changed = true;
    }
    if (input.isActive !== undefined) {
      this.setActive(input.isActive);
      this.props.isActive = this.isActive;
      changed = true;
    }
    if (changed) this.touch();
  }

  get activityId(): string {
    return this.props.activityId;
  }
  get presenterId(): string {
    return this.props.presenterId;
  }
  get role(): PresenterRole {
    return this.props.role;
  }
  get topic(): string | null {
    return this.props.topic;
  }

  toObject(): ActivityPresenterProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

export default ActivityPresenter;
