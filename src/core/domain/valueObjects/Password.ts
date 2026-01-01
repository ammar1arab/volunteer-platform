class Password {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(plainPassword: string): Password {
    return new Password(plainPassword);
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  compare(plainPassword: string): boolean {
    return this.value === plainPassword;
  }

  getValue(): string {
    return this.value;
  }
}

export default Password;