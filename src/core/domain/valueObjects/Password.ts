import bcrypt from "bcryptjs";

class Password {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  static async create(plainPassword: string): Promise<Password> {
    if (!this.isValid(plainPassword)) {
      throw new Error(
        "Password must be at least 8 chars with uppercase, lowercase, and number"
      );
    }
    const hashed = await bcrypt.hash(plainPassword, 12);
    return new Password(hashed);
  }

  private static isValid(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.value);
  }

  getValue(): string {
    return this.value;
  }
}

export default Password;