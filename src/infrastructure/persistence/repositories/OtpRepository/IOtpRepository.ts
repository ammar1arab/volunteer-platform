import { OtpType } from "@prisma/client";

export interface OtpValidRow {
  id: string;
  code: string;
  expiresAt: Date;
  attempts: number;
  isSupport: boolean;
}

interface IOtpRepository {
  create(email: string, code: string, type: OtpType, expiresAt: Date, isSupport?: boolean): Promise<void>;
  findValid(email: string, type: OtpType, code?: string): Promise<OtpValidRow | null>;
  markUsed(id: string): Promise<void>;
  incrementAttempts(id: string): Promise<number>;
  invalidatePrevious(email: string, type: OtpType, keepSupport?: boolean): Promise<void>;
  countRecentByEmail(email: string, windowMs: number): Promise<number>;
  getLastSentAt(email: string, type: OtpType): Promise<Date | null>;
  checkValid(email: string, code: string, type: OtpType): Promise<boolean>;
}

export default IOtpRepository;
