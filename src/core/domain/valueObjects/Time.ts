class Time {
  private readonly hour: number;
  private readonly minute: number;

  constructor(timeString: string) {
    const match = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/.test(timeString);
    if (!match) {
      throw new Error("Invalid time format. Use HH:mm");
    }

    const [h, m] = timeString.split(':').map(Number);
    this.hour = h;
    this.minute = m;
  }

  isBefore(other: Time): boolean {
    if (this.hour < other.hour) return true;
    if (this.hour === other.hour && this.minute < other.minute) return true;
    return false;
  }

  toString(): string {
    return `${String(this.hour).padStart(2, '0')}:${String(this.minute).padStart(2, '0')}`;
  }

  getValue() {
    return { hour: this.hour, minute: this.minute };
  }
}

export default Time;