import { MeetingIntegration } from "@/core/domain/entities";

interface IMeetingIntegrationRepository {
  findByProvider(provider?: string): Promise<MeetingIntegration | null>;
  create(integration: MeetingIntegration): Promise<MeetingIntegration>;
  update(integration: MeetingIntegration): Promise<MeetingIntegration>;
  upsertByProvider(integration: MeetingIntegration): Promise<MeetingIntegration>;
}

export default IMeetingIntegrationRepository;
