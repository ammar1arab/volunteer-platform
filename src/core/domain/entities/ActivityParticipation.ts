import { BaseEntity } from "@/core/domain/entities";
import { ActivityParticipationProps } from "@/core/domain/interfaces";
import { ParticipationStatus, AttendanceStatus } from "@/core/domain/enums";

class ActivityParticipation extends BaseEntity {
  private props: ActivityParticipationProps;

  constructor(props: ActivityParticipationProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.activityId?.trim()) throw new Error("Activity ID is required");
    if (!props.volunteerId?.trim()) throw new Error("Volunteer ID is required");

    this.props = {
      ...props,
      attendanceStatus: props.attendanceStatus ?? AttendanceStatus.NOT_MARKED,
      volunteerHours: props.volunteerHours ?? null,
      markedAt: props.markedAt ?? null
    };
  }

  static create(input: { activityId: string; volunteerId: string }): ActivityParticipation {
    return new ActivityParticipation({
      ...input,
      id: crypto.randomUUID(),
      status: ParticipationStatus.PENDING,
      attendanceStatus: AttendanceStatus.NOT_MARKED,
      volunteerHours: null,
      markedAt: null,
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  approve(): void {
    if (this.props.status !== ParticipationStatus.PENDING) throw new Error("Only pending requests can be approved");
    this.props.status = ParticipationStatus.APPROVED;
    this.props.respondedAt = new Date();
    this.touch();
  }

  reject(): void {
    if (this.props.status !== ParticipationStatus.PENDING && this.props.status !== ParticipationStatus.APPROVED)
      throw new Error("Can only reject pending or approved requests");
    this.props.status = ParticipationStatus.REJECTED;
    this.props.respondedAt = new Date();
    this.props.attendanceStatus = AttendanceStatus.NOT_MARKED;
    this.props.volunteerHours = null;
    this.props.markedAt = null;
    this.touch();
  }

  cancelRequest(): void {
    if (this.props.status !== ParticipationStatus.PENDING && this.props.status !== ParticipationStatus.APPROVED)
      throw new Error("يمكن إلغاء الطلبات المعلقة أو الموافق عليها فقط");

    this.props.status = ParticipationStatus.CANCELLED;
    this.props.attendanceStatus = AttendanceStatus.NOT_MARKED;
    this.props.volunteerHours = null;
    this.props.markedAt = null;
    this.touch();
  }

  reactivate(): void {
    if (this.props.status !== ParticipationStatus.CANCELLED && this.props.status !== ParticipationStatus.REJECTED)
      throw new Error("يمكن إعادة التفعيل فقط للطلبات الملغاة أو المرفوضة");

    this.props.status = ParticipationStatus.PENDING;
    this.props.requestedAt = new Date();
    this.props.respondedAt = undefined;
    this.props.attendanceStatus = AttendanceStatus.NOT_MARKED;
    this.props.volunteerHours = null;
    this.props.markedAt = null;
    this.touch();
  }

  markAttended(durationHours: number): void {
    if (this.props.status !== ParticipationStatus.APPROVED)
      throw new Error("Can only mark attendance for approved participants");
    this.props.attendanceStatus = AttendanceStatus.ATTENDED;
    this.props.volunteerHours = durationHours;
    this.props.markedAt = new Date();
    this.touch();
  }

  markAbsent(): void {
    if (this.props.status !== ParticipationStatus.APPROVED)
      throw new Error("Can only mark attendance for approved participants");
    this.props.attendanceStatus = AttendanceStatus.ABSENT;
    this.props.volunteerHours = null;
    this.props.markedAt = new Date();
    this.touch();
  }

  isMarked(): boolean {
    return this.props.attendanceStatus !== AttendanceStatus.NOT_MARKED;
  }

  wasAttended(): boolean {
    return this.props.attendanceStatus === AttendanceStatus.ATTENDED;
  }

  get activityId(): string {
    return this.props.activityId;
  }
  get volunteerId(): string {
    return this.props.volunteerId;
  }
  get status(): ParticipationStatus {
    return this.props.status;
  }
  get attendanceStatus(): AttendanceStatus {
    return this.props.attendanceStatus;
  }
  get volunteerHours(): number | null {
    return this.props.volunteerHours;
  }
  get markedAt(): Date | null {
    return this.props.markedAt;
  }
  get requestedAt(): Date {
    return this.props.requestedAt;
  }
  get respondedAt(): Date | undefined {
    return this.props.respondedAt;
  }

  toObject(): ActivityParticipationProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

export default ActivityParticipation;
