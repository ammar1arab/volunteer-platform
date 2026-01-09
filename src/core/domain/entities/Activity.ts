import { BaseEntity } from "@/core/domain/entities";
import { ActivityProps } from "@/core/domain/interfaces";
import { DayOfWeek } from "@/core/domain/enums";
import { Time } from "@/core/domain/valueObjects";

class Activity extends BaseEntity {
  private props: ActivityProps;

  constructor(props: ActivityProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.title?.trim()) throw new Error("Title is required");
    if (props.title.length < 2 || props.title.length > 300) {
      throw new Error("Title must be 2-300 characters");
    }

    if (!props.description?.trim()) throw new Error("Description is required");
    if (props.description.length < 5) {
      throw new Error("Description must be at least 5 characters");
    }

    if (!props.imageUrl?.trim()) throw new Error("Image is required");
    if (!props.placeName?.trim()) throw new Error("Place name is required");

    if (props.maxVolunteers < 1) {
      throw new Error("Max volunteers must be at least 1");
    }

    if (props.currentVolunteers > props.maxVolunteers) {
      throw new Error("Current volunteers cannot exceed max");
    }

    const startTime = new Time(props.startTime);
    const endTime = new Time(props.endTime);
    if (!startTime.isBefore(endTime)) {
      throw new Error("Start time must be before end time");
    }

    this.props = {
      ...props,
      title: props.title.trim(),
      description: props.description.trim(),
      placeName: props.placeName.trim(),
    };
  }

  static create(
    input: Omit<
      ActivityProps,
      "id" | "createdAt" | "updatedAt" | "currentVolunteers" | "status"
    >
  ): Activity {
    return new Activity({
      ...input,
      id: crypto.randomUUID(),
      currentVolunteers: 0,
      status: "DRAFT",
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
  }

  publish(): void {
    if (this.props.status !== "DRAFT") {
      throw new Error("Only draft activities can be published");
    }

    this.props.status = "PUBLISHED";
    this.touch();
  }

  cancel(): void {
    if (this.props.status === "COMPLETED") {
      throw new Error("Cannot cancel completed activity");
    }

    if (this.props.status === "CANCELLED") {
      throw new Error("Activity is already cancelled");
    }

    this.props.status = "CANCELLED";
    this.touch();
  }
  
  restore(): void {
  if (this.props.status !== "CANCELLED") {
    throw new Error("Only cancelled activities can be restored");
  }

  this.props.status = "DRAFT";
  this.touch();
}

  addVolunteer(): void {
    if (this.props.status !== "PUBLISHED") {
      throw new Error("Can only join published activities");
    }

    if (this.isFull()) {
      throw new Error("Activity is full");
    }

    this.props.currentVolunteers++;
    this.touch();
  }

  removeVolunteer(): void {
    if (this.props.currentVolunteers === 0) {
      throw new Error("No volunteers to remove");
    }

    this.props.currentVolunteers--;
    this.touch();
  }

  isFull(): boolean {
    return this.props.currentVolunteers >= this.props.maxVolunteers;
  }

  canBeEdited(): boolean {
    return this.props.status === "DRAFT";
  }

  update(
    input: Partial<
      Omit<
        ActivityProps,
        "id" | "createdAt" | "currentVolunteers" | "status" | "createdBy"
      >
    >
  ): void {
    if (!this.canBeEdited()) {
      throw new Error("Only draft activities can be edited");
    }

    if (input.title !== undefined) {
      if (
        !input.title?.trim() ||
        input.title.length < 2 ||
        input.title.length > 300
      ) {
        throw new Error("Title must be 2-300 characters");
      }
      this.props.title = input.title.trim();
    }

    if (input.description !== undefined) {
      if (!input.description?.trim() || input.description.length < 5) {
        throw new Error("Description must be at least 5 characters");
      }
      this.props.description = input.description.trim();
    }

    if (input.maxVolunteers !== undefined) {
      if (input.maxVolunteers < this.props.currentVolunteers) {
        throw new Error("Cannot set max volunteers below current volunteers");
      }
      this.props.maxVolunteers = input.maxVolunteers;
    }

    if (input.startTime && input.endTime) {
      const start = new Time(input.startTime);
      const end = new Time(input.endTime);
      if (!start.isBefore(end)) {
        throw new Error("Start time must be before end time");
      }
      this.props.startTime = input.startTime;
      this.props.endTime = input.endTime;
    }

    if (input.imageUrl !== undefined) this.props.imageUrl = input.imageUrl;
    if (input.dayOfWeek !== undefined) {
      if (!Object.values(DayOfWeek).includes(input.dayOfWeek)) {
        throw new Error("Invalid day of week");
      }
      this.props.dayOfWeek = input.dayOfWeek;
    }
    if (input.date !== undefined) this.props.date = input.date;
    if (input.placeName !== undefined)
      this.props.placeName = input.placeName.trim();
    if (input.location !== undefined) this.props.location = input.location;
    if (input.targetAudience !== undefined)
      this.props.targetAudience = input.targetAudience;

    if (input.isActive !== undefined) {
      this.setActive(input.isActive);
      this.props.isActive = this.isActive;
      return;
    }

    this.touch();
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
  get status(): string {
    return this.props.status;
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

  toObject(): ActivityProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }
}

export default Activity;
