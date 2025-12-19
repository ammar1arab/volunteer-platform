export class ValidationHelper {
  static validateId(id: string, fieldName: string = "Id"): string | null {
    if (!id?.trim()) return `${fieldName} is required`;
    return null;
  }

  static validateStringLength(
    value: string,
    min: number,
    max: number,
    fieldName: string
  ): string | null {
    if (!value?.trim()) return `${fieldName} is required`;
    if (value.length < min || value.length > max) {
      return `${fieldName} must be ${min}-${max} characters`;
    }
    return null;
  }

  static validateNumber(
    value: number,
    min: number,
    max: number,
    fieldName: string
  ): string | null {
    if (value < min || value > max) {
      return `${fieldName} must be ${min}-${max}`;
    }
    return null;
  }

  static validateRequired(value: any, fieldName: string): string | null {
    if (!value?.toString()?.trim()) return `${fieldName} is required`;
    return null;
  }
}