import { Resend } from "resend";

class ResendClient {
  private static instance: Resend | null = null;

  static getInstance(): Resend {
    if (!this.instance) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) throw new Error("RESEND_API_KEY not configured");
      this.instance = new Resend(apiKey);
    }
    return this.instance;
  }
}

export default ResendClient;