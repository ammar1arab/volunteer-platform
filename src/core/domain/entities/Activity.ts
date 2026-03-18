import { BaseEntity } from "@/core/domain/entities";
import { ActivityProps } from "@/core/domain/interfaces";
import { Time } from "@/core/domain/valueObjects";
import {
  DayOfWeek,
  ActivityStatus,
  ActivityType,
  DomainFeaturedPostCategory,
  JordanianCity
} from "@/core/domain/enums";

class Activity extends BaseEntity {
  private props: ActivityProps;

  constructor(props: ActivityProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.title?.trim()) throw new Error("Title is required");
    if (props.title.length < 2 || props.title.length > 300) throw new Error("Title must be 2-300 characters");

    if (!props.description?.trim()) throw new Error("Description is required");
    if (props.description.length < 5) throw new Error("Description must be at least 5 characters");

    if (!props.imageUrl?.trim()) throw new Error("Image is required");

    if (props.maxVolunteers < 1) throw new Error("Max volunteers must be at least 1");

    if (props.currentVolunteers > props.maxVolunteers) throw new Error("Current volunteers cannot exceed max");

    if (props.durationHours < 0) throw new Error("Duration hours must be positive");

    const startTime = new Time(props.startTime);
    const endTime = new Time(props.endTime);
    if (!startTime.isBefore(endTime)) throw new Error("Start time must be before end time");

    this.props = {
      ...props,
      title: props.title.trim(),
      description: props.description.trim(),
      placeName: props.placeName?.trim() ?? null,
      meetingLink: props.meetingLink?.trim() ?? null,
      categories: props.categories ?? [],
      externalMeetingId: props.externalMeetingId ?? null,
      deletedAt: props.deletedAt ?? null
    };
  }

  static reconstitute(props: ActivityProps): Activity {
    return new Activity(props);
  }

  static create(
    input: Omit<ActivityProps, "id" | "createdAt" | "updatedAt" | "currentVolunteers" | "status">
  ): Activity {
    if (input.activityType === ActivityType.IN_PERSON) {
      if (!input.placeName?.trim()) throw new Error("Place name is required for in-person activities");
      if (!input.city) throw new Error("City is required for in-person activities");
    }
    if (input.activityType === ActivityType.ONLINE) {
      if (!input.meetingLink?.trim()) throw new Error("Meeting link is required for online activities");
    }

    return new Activity({
      ...input,
      id: crypto.randomUUID(),
      currentVolunteers: 0,
      status: ActivityStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  publish(): void {
    if (this.props.status !== ActivityStatus.DRAFT) throw new Error("Only draft activities can be published");
    this.props.status = ActivityStatus.PUBLISHED;
    this.touch();
  }

  cancel(): void {
    if (this.props.status === ActivityStatus.COMPLETED) throw new Error("Cannot cancel a completed activity");
    if (this.props.status === ActivityStatus.CANCELLED) throw new Error("Activity is already cancelled");
    this.props.status = ActivityStatus.CANCELLED;
    this.touch();
  }

  restore(): void {
    if (this.props.status !== ActivityStatus.CANCELLED) throw new Error("Only cancelled activities can be restored");
    this.props.status = ActivityStatus.DRAFT;
    this.touch();
  }

  complete(): void {
    if (this.props.status !== ActivityStatus.PUBLISHED) throw new Error("Only published activities can be completed");
    this.props.status = ActivityStatus.COMPLETED;
    this.touch();
  }

  softDelete(): void {
    this.props.deletedAt = new Date();
    this.touch();
  }

  addVolunteer(): void {
    if (this.props.status !== ActivityStatus.PUBLISHED) throw new Error("Can only join published activities");
    if (this.isFull()) throw new Error("Activity is full");
    this.props.currentVolunteers++;
    this.touch();
  }

  removeVolunteer(): void {
    if (this.props.currentVolunteers === 0) throw new Error("No volunteers to remove");
    this.props.currentVolunteers--;
    this.touch();
  }

  isFull(): boolean {
    return this.props.currentVolunteers >= this.props.maxVolunteers;
  }

  canBeEdited(): boolean {
    return (
      this.props.status === ActivityStatus.DRAFT ||
      this.props.status === ActivityStatus.PUBLISHED ||
      this.props.status === ActivityStatus.CANCELLED
    );
  }

  update(input: Partial<Omit<ActivityProps, "id" | "createdAt" | "currentVolunteers" | "status" | "createdBy">>): void {
    if (!this.canBeEdited()) throw new Error("Cannot edit a cancelled or completed activity");

    let changed = false;

    if (input.title !== undefined) {
      if (!input.title?.trim() || input.title.length < 2 || input.title.length > 300)
        throw new Error("Title must be 2-300 characters");
      this.props.title = input.title.trim();
      changed = true;
    }

    if (input.description !== undefined) {
      if (!input.description?.trim() || input.description.length < 5)
        throw new Error("Description must be at least 5 characters");
      this.props.description = input.description.trim();
      changed = true;
    }

    if (input.maxVolunteers !== undefined) {
      if (input.maxVolunteers < this.props.currentVolunteers)
        throw new Error("Cannot set max volunteers below current volunteers");
      this.props.maxVolunteers = input.maxVolunteers;
      changed = true;
    }

    if (input.durationHours !== undefined) {
      if (input.durationHours < 0) throw new Error("Duration hours must be positive");
      this.props.durationHours = input.durationHours;
      changed = true;
    }

    if (input.startTime !== undefined || input.endTime !== undefined) {
      const newStart = input.startTime ?? this.props.startTime;
      const newEnd = input.endTime ?? this.props.endTime;
      if (!new Time(newStart).isBefore(new Time(newEnd))) throw new Error("Start time must be before end time");
      this.props.startTime = newStart;
      this.props.endTime = newEnd;
      changed = true;
    }

    if (input.imageUrl !== undefined) {
      this.props.imageUrl = input.imageUrl;
      changed = true;
    }
    if (input.dayOfWeek !== undefined) {
      if (!Object.values(DayOfWeek).includes(input.dayOfWeek)) throw new Error("Invalid day of week");
      this.props.dayOfWeek = input.dayOfWeek;
      changed = true;
    }
    if (input.date !== undefined) {
      this.props.date = input.date;
      changed = true;
    }
    if (input.placeName !== undefined) {
      this.props.placeName = input.placeName?.trim() ?? null;
      changed = true;
    }
    if (input.city !== undefined) {
      this.props.city = input.city;
      changed = true;
    }
    if (input.latitude !== undefined) {
      this.props.latitude = input.latitude;
      changed = true;
    }
    if (input.longitude !== undefined) {
      this.props.longitude = input.longitude;
      changed = true;
    }
    if (input.meetingLink !== undefined) {
      this.props.meetingLink = input.meetingLink?.trim() ?? null;
      changed = true;
    }
    if (input.meetingPlatform !== undefined) {
      this.props.meetingPlatform = input.meetingPlatform;
      changed = true;
    }
    if (input.externalMeetingId !== undefined) {
      this.props.externalMeetingId = input.externalMeetingId;
      changed = true;
    }
    if (input.categories !== undefined) {
      this.props.categories = input.categories;
      changed = true;
    }
    if (input.activityType !== undefined) {
      this.props.activityType = input.activityType;
      changed = true;
    }
    if (input.isActive !== undefined) {
      this.setActive(input.isActive);
      this.props.isActive = this.isActive;
      changed = true;
    }

    if (changed) this.touch();
  }

  get title(): string {
    return this.props.title;
  }
  get description(): string {
    return this.props.description;
  }
  get imageUrl(): string {
    return this.props.imageUrl;
  }
  get date(): Date {
    return this.props.date;
  }
  get status(): ActivityStatus {
    return this.props.status;
  }
  get activityType(): ActivityType {
    return this.props.activityType;
  }
  get currentVolunteers(): number {
    return this.props.currentVolunteers;
  }
  get maxVolunteers(): number {
    return this.props.maxVolunteers;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get durationHours(): number {
    return this.props.durationHours;
  }
  get categories(): DomainFeaturedPostCategory[] {
    return this.props.categories;
  }
  get placeName(): string | null {
    return this.props.placeName;
  }
  get city(): JordanianCity | null {
    return this.props.city;
  }
  get latitude(): number | null {
    return this.props.latitude;
  }
  get longitude(): number | null {
    return this.props.longitude;
  }
  get meetingLink(): string | null {
    return this.props.meetingLink;
  }
  get meetingPlatform(): string | null {
    return this.props.meetingPlatform;
  }
  get externalMeetingId(): string | null {
    return this.props.externalMeetingId;
  }
  get dayOfWeek(): DayOfWeek {
    return this.props.dayOfWeek;
  }
  get startTime(): string {
    return this.props.startTime;
  }
  get endTime(): string {
    return this.props.endTime;
  }

  toObject(): ActivityProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
      deletedAt: this.props.deletedAt ?? null
    };
  }
}

export default Activity;
