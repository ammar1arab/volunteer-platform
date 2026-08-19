import { BaseEntity } from "@/core/domain/entities";
import { ActivityProps } from "@/core/domain/interfaces";
import { Time } from "@/core/domain/valueObjects";
import {
  DayOfWeek,
  ActivityStatus,
  ActivityType,
  DomainFeaturedPostCategory,
  JordanianCity,
  MeetingLinkSource,
  MeetingSyncStatus,
  MeetingPlatform
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
      meetingLinkSource: props.meetingLinkSource ?? MeetingLinkSource.MANUAL,
      meetingCode: props.meetingCode ?? null,
      meetingSpaceName: props.meetingSpaceName ?? null,
      meetingSyncStatus: props.meetingSyncStatus ?? MeetingSyncStatus.NONE,
      meetingSyncError: props.meetingSyncError ?? null,
      meetingSyncedAt: props.meetingSyncedAt ?? null,
      timeZone: props.timeZone?.trim() || Activity.DEFAULT_TIME_ZONE,
      deletedAt: props.deletedAt ?? null,
      views: props.views ?? 0
    };
  }

  static readonly DEFAULT_TIME_ZONE = "Asia/Amman";

  static reconstitute(props: ActivityProps): Activity {
    return new Activity(props);
  }

  static create(
    input: Omit<ActivityProps, "id" | "createdAt" | "updatedAt" | "currentVolunteers" | "status" | "views">
  ): Activity {
    if (input.activityType === ActivityType.IN_PERSON) {
      if (!input.placeName?.trim()) throw new Error("Place name is required for in-person activities");
      if (!input.city) throw new Error("City is required for in-person activities");
    }
    if (input.activityType === ActivityType.ONLINE) {
      const isAutomatic = input.meetingLinkSource === MeetingLinkSource.GOOGLE_MEET_AUTO;
      if (!isAutomatic && !input.meetingLink?.trim())
        throw new Error("Meeting link is required for online activities");
    }

    return new Activity({
      ...input,
      id: crypto.randomUUID(),
      currentVolunteers: 0,
      status: ActivityStatus.DRAFT,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      views: 0
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

  usesAutomaticMeeting(): boolean {
    return (
      this.props.activityType === ActivityType.ONLINE &&
      this.props.meetingLinkSource === MeetingLinkSource.GOOGLE_MEET_AUTO
    );
  }

  enableAutomaticMeeting(): void {
    if (this.props.activityType !== ActivityType.ONLINE)
      throw new Error("Automatic meetings are only available for online activities");
    this.props.meetingLinkSource = MeetingLinkSource.GOOGLE_MEET_AUTO;
    this.props.meetingPlatform = MeetingPlatform.GOOGLE_MEET;
    this.props.meetingSyncStatus = MeetingSyncStatus.NONE;
    this.props.meetingSyncError = null;
    this.touch();
  }

  markMeetingSyncPending(): void {
    if (!this.usesAutomaticMeeting()) return;
    this.props.meetingSyncStatus = MeetingSyncStatus.PENDING;
    this.props.meetingSyncError = null;
    this.touch();
  }

  attachProvisionedMeeting(input: {
    meetingLink: string;
    externalMeetingId: string;
    meetingCode: string | null;
    meetingSpaceName: string | null;
  }): void {
    if (!input.meetingLink?.trim()) throw new Error("Provisioned meeting link is required");
    if (!input.externalMeetingId?.trim()) throw new Error("Provisioned meeting id is required");

    this.props.meetingLink = input.meetingLink.trim();
    this.props.externalMeetingId = input.externalMeetingId.trim();
    this.props.meetingCode = input.meetingCode?.trim() ?? null;
    this.props.meetingSpaceName = input.meetingSpaceName?.trim() ?? null;
    this.props.meetingPlatform = MeetingPlatform.GOOGLE_MEET;
    this.props.meetingLinkSource = MeetingLinkSource.GOOGLE_MEET_AUTO;
    this.props.meetingSyncStatus = MeetingSyncStatus.SYNCED;
    this.props.meetingSyncError = null;
    this.props.meetingSyncedAt = new Date();
    this.touch();
  }

  markMeetingSyncFailed(reason: string): void {
    this.props.meetingSyncStatus = MeetingSyncStatus.FAILED;
    this.props.meetingSyncError = reason.slice(0, 500);
    this.touch();
  }

  markMeetingCancelled(): void {
    this.props.meetingSyncStatus = MeetingSyncStatus.CANCELLED;
    this.props.meetingSyncError = null;
    this.props.meetingSyncedAt = new Date();
    this.touch();
  }

  detachMeeting(): void {
    this.props.meetingLink = null;
    this.props.externalMeetingId = null;
    this.props.meetingCode = null;
    this.props.meetingSpaceName = null;
    this.props.meetingLinkSource = MeetingLinkSource.MANUAL;
    this.props.meetingSyncStatus = MeetingSyncStatus.NONE;
    this.props.meetingSyncError = null;
    this.props.meetingSyncedAt = null;
    this.touch();
  }

  canBeEdited(): boolean {
    return (
      this.props.status === ActivityStatus.DRAFT ||
      this.props.status === ActivityStatus.PUBLISHED ||
      this.props.status === ActivityStatus.CANCELLED
    );
  }

  update(input: Partial<Omit<ActivityProps, "id" | "createdAt" | "currentVolunteers" | "status" | "createdBy" | "views">>): void {
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

    let scheduleChanged = false;

    if (input.startTime !== undefined || input.endTime !== undefined) {
      const newStart = input.startTime ?? this.props.startTime;
      const newEnd = input.endTime ?? this.props.endTime;
      if (!new Time(newStart).isBefore(new Time(newEnd))) throw new Error("Start time must be before end time");
      scheduleChanged = newStart !== this.props.startTime || newEnd !== this.props.endTime;
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
      scheduleChanged = scheduleChanged || input.date.getTime() !== this.props.date.getTime();
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
    if (input.meetingLinkSource !== undefined) {
      this.props.meetingLinkSource = input.meetingLinkSource;
      changed = true;
    }
    if (input.timeZone !== undefined) {
      scheduleChanged = scheduleChanged || input.timeZone !== this.props.timeZone;
      this.props.timeZone = input.timeZone?.trim() || Activity.DEFAULT_TIME_ZONE;
      changed = true;
    }
    if (input.isActive !== undefined) {
      this.setActive(input.isActive);
      this.props.isActive = this.isActive;
      changed = true;
    }

    if (input.title !== undefined || input.description !== undefined) scheduleChanged = true;

    if (scheduleChanged && this.usesAutomaticMeeting() && this.props.externalMeetingId) {
      this.props.meetingSyncStatus = MeetingSyncStatus.PENDING;
      this.props.meetingSyncError = null;
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
  get timeZone(): string {
    return this.props.timeZone;
  }

  get views(): number {
    return this.props.views;
  }

  incrementViews(): void {
    this.props.views += 1;
    this.touch();
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
