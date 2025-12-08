abstract class BaseEntity {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
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
}

export default BaseEntity;
