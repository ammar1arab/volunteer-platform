import { R2StorageService } from "@/infrastructure/external";
import { InputSanitizer } from "@/infrastructure/security";
import { MonthlyMagazineRepository } from "@/infrastructure/persistence/repositories";

import { MonthlyMagazine } from "@/core/domain/entities";
import { guard, serviceError, GuardError } from "@/core/application/common";
import { toMonthlyMagazineDto, toMonthlyMagazineDtoList } from "@/core/application/mappers";
import {
  ok,
  fail,
  CreateMonthlyMagazineRequest,
  CreateMonthlyMagazineResponse,
  UpdateMonthlyMagazineRequest,
  UpdateMonthlyMagazineResponse,
  GetMonthlyMagazineResponse,
  GetAllMonthlyMagazinesResponse,
  DeleteMonthlyMagazineResponse
} from "@/core/application/dtos";
import { logger } from "@/lib/utils";

class MonthlyMagazineUseCase {
  private static readonly SCOPE = "MonthlyMagazineUseCase";
  private storageService: R2StorageService;

  constructor(private magazineRepository: MonthlyMagazineRepository) {
    this.storageService = new R2StorageService();
  }

  private sanitize(input: Partial<CreateMonthlyMagazineRequest>) {
    return {
      title: input.title ? InputSanitizer.sanitizeString(input.title) : undefined,
      pdfUrl: input.pdfUrl ? InputSanitizer.sanitizeString(input.pdfUrl) : undefined,
      monthYear: input.monthYear,
      isActive: input.isActive
    };
  }

  private async tryDeletePdf(pdfUrl: string): Promise<void> {
    try {
      await this.storageService.delete(pdfUrl);
      logger.info(MonthlyMagazineUseCase.SCOPE, "tryDeletePdf", `Deleted: ${pdfUrl}`);
    } catch {
      logger.warn(MonthlyMagazineUseCase.SCOPE, "tryDeletePdf", `Failed to delete: ${pdfUrl}`);
    }
  }

  private async findOrFail(id: string): Promise<MonthlyMagazine> {
    guard(id, "المعرف مطلوب");
    const magazine = await this.magazineRepository.findById(id);
    if (!magazine)
      throw Object.assign(new Error(), {
        result: fail("NOT_FOUND", "المجلة غير موجودة")
      });
    return magazine;
  }

  async create(dto: CreateMonthlyMagazineRequest): Promise<CreateMonthlyMagazineResponse> {
    try {
      const sanitized = this.sanitize(dto);

      guard(sanitized.title, "العنوان مطلوب");
      guard(sanitized.pdfUrl, "ملف PDF مطلوب");

      if (!sanitized.monthYear) {
        throw new GuardError(fail("VALIDATION_ERROR", "الشهر والسنة مطلوبان"));
      }

      const magazine = MonthlyMagazine.create({
        title: sanitized.title,
        pdfUrl: sanitized.pdfUrl,
        monthYear: new Date(sanitized.monthYear),
        isActive: sanitized.isActive ?? true
      });

      const created = await this.magazineRepository.create(magazine);
      logger.info(MonthlyMagazineUseCase.SCOPE, "create", `Created: ${created.id}`);

      return ok({ magazine: toMonthlyMagazineDto(created) });
    } catch (error) {
      return serviceError(MonthlyMagazineUseCase.SCOPE, "create", error, "حدث خطأ أثناء إنشاء المجلة");
    }
  }

  async update(id: string, dto: Partial<UpdateMonthlyMagazineRequest>): Promise<UpdateMonthlyMagazineResponse> {
    try {
      const existing = await this.findOrFail(id);
      const sanitized = this.sanitize(dto);

      if (sanitized.pdfUrl && sanitized.pdfUrl !== existing.pdfUrl) {
        await this.tryDeletePdf(existing.pdfUrl);
      }

      existing.update({
        ...sanitized,
        monthYear: sanitized.monthYear ? new Date(sanitized.monthYear) : undefined 
      });

      const updated = await this.magazineRepository.update(existing);
      return ok({ magazine: toMonthlyMagazineDto(updated) });
    } catch (error) {
      return serviceError(MonthlyMagazineUseCase.SCOPE, "update", error, "حدث خطأ أثناء تحديث المجلة");
    }
  }

  async delete(id: string): Promise<DeleteMonthlyMagazineResponse> {
    try {
      guard(id, "المعرف مطلوب");

      const existing = await this.magazineRepository.findById(id);
      if (existing) await this.tryDeletePdf(existing.pdfUrl);

      const deleted = await this.magazineRepository.delete(id);
      if (!deleted) return fail("NOT_FOUND", "المجلة غير موجودة");

      logger.info(MonthlyMagazineUseCase.SCOPE, "delete", `Deleted: ${id}`);
      return ok({ deleted: true });
    } catch (error) {
      return serviceError(MonthlyMagazineUseCase.SCOPE, "delete", error, "حدث خطأ أثناء حذف المجلة");
    }
  }

  async getOne(id: string): Promise<GetMonthlyMagazineResponse> {
    try {
      const magazine = await this.findOrFail(id);
      return ok({ magazine: toMonthlyMagazineDto(magazine) });
    } catch (error) {
      return serviceError(MonthlyMagazineUseCase.SCOPE, "getOne", error, "حدث خطأ أثناء جلب المجلة");
    }
  }

  async getAll(): Promise<GetAllMonthlyMagazinesResponse> {
    try {
      const magazines = await this.magazineRepository.findAll();
      const items = toMonthlyMagazineDtoList(magazines);
      return ok({ magazines: items });
    } catch (error) {
      return serviceError(MonthlyMagazineUseCase.SCOPE, "getAll", error, "حدث خطأ أثناء جلب المجلات");
    }
  }
}

export default MonthlyMagazineUseCase;
