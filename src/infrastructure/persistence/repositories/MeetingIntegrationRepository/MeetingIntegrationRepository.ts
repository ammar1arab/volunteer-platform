import IMeetingIntegrationRepository from "./IMeetingIntegrationRepository";
import type { MeetingIntegration as PrismaMeetingIntegration } from "@prisma/client";
import { prisma } from "@/infrastructure/persistence/prisma";
import { MeetingIntegration } from "@/core/domain/entities";
import { MeetingIntegrationStatus } from "@/core/domain/enums";

class MeetingIntegrationRepository implements IMeetingIntegrationRepository {
  private mapToEntity(data: PrismaMeetingIntegration): MeetingIntegration {
    return MeetingIntegration.reconstitute({
      id: data.id,
      provider: data.provider,
      organizerEmail: data.organizerEmail,
      calendarId: data.calendarId,
      encryptedRefreshToken: data.encryptedRefreshToken,
      scopes: data.scopes ?? [],
      status: data.status as MeetingIntegrationStatus,
      lastError: data.lastError ?? null,
      lastCheckedAt: data.lastCheckedAt ?? null,
      connectedById: data.connectedById ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isActive: true
    });
  }

  async findByProvider(provider = "GOOGLE_MEET"): Promise<MeetingIntegration | null> {
    const data = await prisma.meetingIntegration.findUnique({ where: { provider } });
    return data ? this.mapToEntity(data) : null;
  }

  async create(integration: MeetingIntegration): Promise<MeetingIntegration> {
    const props = integration.toObject();
    const created = await prisma.meetingIntegration.create({
      data: {
        id: props.id,
        provider: props.provider,
        organizerEmail: props.organizerEmail,
        calendarId: props.calendarId,
        encryptedRefreshToken: props.encryptedRefreshToken,
        scopes: props.scopes,
        status: props.status,
        lastError: props.lastError,
        lastCheckedAt: props.lastCheckedAt,
        connectedById: props.connectedById,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      }
    });
    return this.mapToEntity(created);
  }

  async update(integration: MeetingIntegration): Promise<MeetingIntegration> {
    const props = integration.toObject();
    const updated = await prisma.meetingIntegration.update({
      where: { id: props.id },
      data: {
        organizerEmail: props.organizerEmail,
        calendarId: props.calendarId,
        encryptedRefreshToken: props.encryptedRefreshToken,
        scopes: props.scopes,
        status: props.status,
        lastError: props.lastError,
        lastCheckedAt: props.lastCheckedAt,
        connectedById: props.connectedById,
        updatedAt: new Date()
      }
    });
    return this.mapToEntity(updated);
  }

  async upsertByProvider(integration: MeetingIntegration): Promise<MeetingIntegration> {
    const props = integration.toObject();
    const upserted = await prisma.meetingIntegration.upsert({
      where: { provider: props.provider },
      create: {
        id: props.id,
        provider: props.provider,
        organizerEmail: props.organizerEmail,
        calendarId: props.calendarId,
        encryptedRefreshToken: props.encryptedRefreshToken,
        scopes: props.scopes,
        status: props.status,
        lastError: props.lastError,
        lastCheckedAt: props.lastCheckedAt,
        connectedById: props.connectedById,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      },
      update: {
        organizerEmail: props.organizerEmail,
        calendarId: props.calendarId,
        encryptedRefreshToken: props.encryptedRefreshToken,
        scopes: props.scopes,
        status: props.status,
        lastError: props.lastError,
        lastCheckedAt: props.lastCheckedAt,
        connectedById: props.connectedById,
        updatedAt: new Date()
      }
    });
    return this.mapToEntity(upserted);
  }
}

export default MeetingIntegrationRepository;
