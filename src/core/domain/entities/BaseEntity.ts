abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public updatedAt: Date;
  public isActive: boolean;

  protected constructor(
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
    isActive: boolean = true
  ) {
    this.id = id ?? crypto.randomUUID();
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
    this.isActive = isActive;
  }

  protected touch(): void {
    this.updatedAt = new Date();
  }

  protected setActive(value: boolean): void {
    this.isActive = value;
    this.touch();
  }
}

export default BaseEntity;
