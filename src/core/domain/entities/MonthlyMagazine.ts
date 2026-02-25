import { BaseEntity } from "@/core/domain/entities";
import { MonthlyMagazineProps } from "@/core/domain/interfaces";

class MonthlyMagazine extends BaseEntity {
  private props: MonthlyMagazineProps;

  constructor(props: MonthlyMagazineProps) {
    super(props.id, props.createdAt, props.updatedAt, props.isActive ?? true);

    if (!props.title?.trim()) throw new Error("Title is required");
    if (props.title.length < 2 || props.title.length > 300) {
      throw new Error("Title must be 2-300 characters");
    }

    if (!props.pdfUrl?.trim()) throw new Error("PDF file is required");
    if (!props.monthYear) throw new Error("Month and year are required");

    this.props = {
      ...props,
      title: props.title.trim(),
      pdfUrl: props.pdfUrl.trim(),
      monthYear: MonthlyMagazine.normalizeMonthYear(props.monthYear),
    };
  }

  private static normalizeMonthYear(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  static create(
    input: Omit<MonthlyMagazineProps, "id" | "createdAt" | "updatedAt">
  ): MonthlyMagazine {
    return new MonthlyMagazine({
      ...input,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: input.isActive ?? true,
    });
  }

  update(
    input: Partial<
      Pick<MonthlyMagazineProps, "title" | "pdfUrl" | "monthYear" | "isActive">
    >
  ): void {
    let changed = false;

    if (input.title !== undefined) {
      if (!input.title.trim() || input.title.length < 2 || input.title.length > 300) {
        throw new Error("Title must be 2-300 characters");
      }
      this.props.title = input.title.trim();
      changed = true;
    }

    if (input.pdfUrl !== undefined) {
      if (!input.pdfUrl.trim()) throw new Error("PDF file is required");
      this.props.pdfUrl = input.pdfUrl.trim();
      changed = true;
    }

    if (input.monthYear !== undefined) {
      this.props.monthYear = MonthlyMagazine.normalizeMonthYear(input.monthYear);
      changed = true;
    }

    if (input.isActive !== undefined) {
      this.setActive(input.isActive);
      this.props.isActive = this.isActive;
      changed = true;
    }

    if (changed) {
      this.touch();
    }
  }

  get title(): string {
    return this.props.title;
  }

  get pdfUrl(): string {
    return this.props.pdfUrl;
  }

  get monthYear(): Date {
    return this.props.monthYear;
  }

  toObject(): MonthlyMagazineProps {
    return {
      ...this.props,
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }
}

export default MonthlyMagazine;