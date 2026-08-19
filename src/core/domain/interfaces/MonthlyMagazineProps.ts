import { BaseEntityProps } from "./BaseEntityProps";

export interface MonthlyMagazineProps extends BaseEntityProps {
  title: string;
  pdfUrl: string;
  monthYear: Date;
  downloads?: number;
}