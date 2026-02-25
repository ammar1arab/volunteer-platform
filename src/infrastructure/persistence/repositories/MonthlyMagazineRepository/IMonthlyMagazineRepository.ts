import { MonthlyMagazine } from "@/core/domain/entities";

interface IMonthlyMagazineRepository {
  findById(id: string): Promise<MonthlyMagazine | null>;
  findAll(): Promise<MonthlyMagazine[]>;
  create(magazine: MonthlyMagazine): Promise<MonthlyMagazine>;
  update(magazine: MonthlyMagazine): Promise<MonthlyMagazine>;
  delete(id: string): Promise<boolean>;
}

export default IMonthlyMagazineRepository;