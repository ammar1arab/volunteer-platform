import { BaseEntity } from "@/core/domain/entities";
import { ActivityParticipationProps } from "@/core/domain/interfaces";

class ActivityParticipation extends BaseEntity {
  private props: ActivityParticipationProps;

  constructor(props: ActivityParticipationProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.activityId?.trim()) throw new Error("Activity ID is required");
    if (!props.volunteerId?.trim()) throw new Error("Volunteer ID is required");

    this.props = { ...props };
  }

  static create(input: { activityId: string; volunteerId: string }): ActivityParticipation {
    return new ActivityParticipation({
      ...input,
      id: crypto.randomUUID(),
      status: "PENDING",
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
  }

  approve(): void {
    if (this.props.status !== "PENDING") {
      throw new Error("Only pending requests can be approved");
    }
    this.props.status = "APPROVED";
    this.props.respondedAt = new Date();
    this.touch();
  }

  reject(): void {
    if (this.props.status !== "PENDING") {
      throw new Error("Only pending requests can be rejected");
    }
    this.props.status = "REJECTED";
    this.props.respondedAt = new Date();
    this.touch();
  }

  get activityId(): string {
    return this.props.activityId;
  }

  get volunteerId(): string {
    return this.props.volunteerId;
  }

  get status(): string {
    return this.props.status;
  }

  toObject(): ActivityParticipationProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }
}

export default ActivityParticipation;