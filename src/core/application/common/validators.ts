import { JordanianCity } from "@/core/domain/enums";

export class SecurityValidator {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return {
        valid: false,
        message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل"
      };
    }
    return { valid: true };
  }

  static isValidPhone(phone: string): { valid: boolean; message?: string } {
    const cleanPhone = phone.replace(/\s/g, "");
    
    if (cleanPhone.length < 10) {
      return {
        valid: false,
        message: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"
      };
    }
    
    return { valid: true };
  }

  static isValidName(name: string): { valid: boolean; message?: string } {
    if (name.trim().length < 3) {
      return {
        valid: false,
        message: "الاسم يجب أن يكون 3 أحرف على الأقل"
      };
    }
    return { valid: true };
  }

  static isValidCity(city: string): { valid: boolean; message?: string } {
    const validCities = Object.values(JordanianCity);
    if (!validCities.includes(city as JordanianCity)) {
      return {
        valid: false,
        message: "المدينة المحددة غير صحيحة"
      };
    }
    return { valid: true };
  }

  static isValidDateOfBirth(dateOfBirth: Date): { valid: boolean; message?: string } {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 15) {
      return {
        valid: false,
        message: "يجب أن يكون عمرك 15 سنة على الأقل"
      };
    }

    if (age > 100) {
      return {
        valid: false,
        message: "تاريخ الميلاد غير صحيح"
      };
    }

    return { valid: true };
  }
}