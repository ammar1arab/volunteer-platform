import type { Result } from "./base.dto";

// ─── DTO ──────────────────────────────────────────────────────
export interface MonthlyMagazineDto {
  id: string;
  title: string;
  pdfUrl: string;
  monthYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Create / Update ──────────────────────────────────────────
export interface CreateMonthlyMagazineRequest {
  title: string;
  pdfUrl: string;
  monthYear: Date;
  isActive?: boolean;
}

export type UpdateMonthlyMagazineRequest = Partial<CreateMonthlyMagazineRequest>;

// ─── Responses ────────────────────────────────────────────────
export type CreateMonthlyMagazineResponse  = Result<{ magazine: MonthlyMagazineDto }>;
export type UpdateMonthlyMagazineResponse  = Result<{ magazine: MonthlyMagazineDto }>;
export type GetMonthlyMagazineResponse     = Result<{ magazine: MonthlyMagazineDto }>;
export type GetAllMonthlyMagazinesResponse = Result<{ magazines: MonthlyMagazineDto[] }>;
export type DeleteMonthlyMagazineResponse  = Result<{ deleted: boolean }>;