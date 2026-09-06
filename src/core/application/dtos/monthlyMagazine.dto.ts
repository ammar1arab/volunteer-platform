import type { Result } from "./base.dto";


export interface MonthlyMagazineDto {
  id: string;
  title: string;
  pdfUrl: string;
  monthYear: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface CreateMonthlyMagazineRequest {
  title: string;
  pdfUrl: string;
  monthYear: Date;
  isActive?: boolean;
}

export type UpdateMonthlyMagazineRequest = Partial<CreateMonthlyMagazineRequest>;


export type CreateMonthlyMagazineResponse  = Result<{ magazine: MonthlyMagazineDto }>;
export type UpdateMonthlyMagazineResponse  = Result<{ magazine: MonthlyMagazineDto }>;
export type GetMonthlyMagazineResponse     = Result<{ magazine: MonthlyMagazineDto }>;
export type GetAllMonthlyMagazinesResponse = Result<{ magazines: MonthlyMagazineDto[] }>;
export type DeleteMonthlyMagazineResponse  = Result<{ deleted: boolean }>;