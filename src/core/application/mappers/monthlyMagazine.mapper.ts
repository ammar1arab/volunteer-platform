import type { MonthlyMagazine } from "@/core/domain/entities";
import type { MonthlyMagazineDto } from "@/core/application/dtos";

export const toMonthlyMagazineDto = (entity: MonthlyMagazine): MonthlyMagazineDto => {
  const p = entity.toObject();
  return {
    id: p.id,
    title: p.title,
    pdfUrl: p.pdfUrl,
    monthYear: p.monthYear.toISOString(),
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  };
};

export const toMonthlyMagazineDtoList = (
  entities: MonthlyMagazine[]
): MonthlyMagazineDto[] => entities.map(toMonthlyMagazineDto);