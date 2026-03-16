import { BaseEntity } from "@/core/domain/entities";
import { NotificationProps } from "@/core/domain/interfaces";
import { NotificationType } from "@/core/domain/enums";

class Notification extends BaseEntity {
  private props: NotificationProps;

  constructor(props: NotificationProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);
    if (!props.userId?.trim()) throw new Error("User ID is required");
    if (!props.title?.trim()) throw new Error("Title is required");
    if (!props.message?.trim()) throw new Error("Message is required");
    this.props = {
      ...props,
      metadata: props.metadata ?? null
    };
  }

  static create(input: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Notification {
    return new Notification({
      ...input,
      id: crypto.randomUUID(),
      isRead: false,
      metadata: input.metadata ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    });
  }

  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props);
  }

  markAsRead(): void {
    if (this.props.isRead) return;
    this.props.isRead = true;
    this.touch();
  }

  get userId(): string {
    return this.props.userId;
  }
  get type(): NotificationType {
    return this.props.type;
  }
  get title(): string {
    return this.props.title;
  }
  get message(): string {
    return this.props.message;
  }
  get isRead(): boolean {
    return this.props.isRead;
  }
  get metadata(): Record<string, unknown> | null {
    return this.props.metadata;
  }

  toObject(): NotificationProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive
    };
  }
}

export default Notification;
