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
}