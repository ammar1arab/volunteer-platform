export class InputSanitizer {
  static sanitizeEmail(email: string): string {
    return String(email).toLowerCase().trim();
  }

  static sanitizePhone(phone: string): string {
    let value = String(phone).replace(/[^\d+]/g, '').trim();

    if (value.startsWith('+962')) value = '0' + value.slice(4);
    if (value.startsWith('00962')) value = '0' + value.slice(5);
    if (value.startsWith('7') && value.length === 9) value = '0' + value;

    return value;
  }

  static sanitizeString(input: string): string {
    return String(input).trim().replace(/\s+/g, ' ');
  }

}
