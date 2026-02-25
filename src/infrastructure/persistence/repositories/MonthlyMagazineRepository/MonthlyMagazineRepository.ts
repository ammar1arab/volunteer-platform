import IMonthlyMagazineRepository from "./IMonthlyMagazineRepository";
import type { MonthlyMagazine as PrismaMonthlyMagazine } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { MonthlyMagazine } from "@/core/domain/entities";

class MonthlyMagazineRepository implements IMonthlyMagazineRepository {
  private mapToEntity(data: PrismaMonthlyMagazine): MonthlyMagazine {
    return new MonthlyMagazine({ ...data });
  }

  async findById(id: string): Promise<MonthlyMagazine | null> {
    const data = await prisma.monthlyMagazine.findUnique({ where: { id } });
    return data ? this.mapToEntity(data) : null;
  }

  async findAll(): Promise<MonthlyMagazine[]> {
    const rows = await prisma.monthlyMagazine.findMany({
      orderBy: { monthYear: "desc" }
    });
    return rows.map((row) => this.mapToEntity(row));
  }

  async create(magazine: MonthlyMagazine): Promise<MonthlyMagazine> {
    const props = magazine.toObject();
    const created = await prisma.monthlyMagazine.create({
      data: {
        id: props.id,
        title: props.title,
        pdfUrl: props.pdfUrl,
        monthYear: props.monthYear,
        isActive: props.isActive,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      }
    });
    return this.mapToEntity(created);
  }

  async update(magazine: MonthlyMagazine): Promise<MonthlyMagazine> {
    const props = magazine.toObject();
    const updated = await prisma.monthlyMagazine.update({
      where: { id: props.id },
      data: {
        title: props.title,
        pdfUrl: props.pdfUrl,
        monthYear: props.monthYear,
        isActive: props.isActive,
        updatedAt: new Date()
      }
    });
    return this.mapToEntity(updated);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.monthlyMagazine.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export default MonthlyMagazineRepository;