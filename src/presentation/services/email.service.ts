import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  GetEmailRecipientsResponse,
  SendBulkEmailApiResponse,
  SendBulkEmailInput,
  EmailRecipientFilters
} from "@/core/application/dtos";

export const emailApi = {
  previewRecipients: (
    filters: Omit<EmailRecipientFilters, "interests"> & { interests?: string[] }
  ): Promise<GetEmailRecipientsResponse> =>
    apiClient.get<GetEmailRecipientsResponse>(API_ENDPOINTS.EMAILS.PREVIEW(filters)),

  sendBulk: (body: SendBulkEmailInput): Promise<SendBulkEmailApiResponse> =>
    apiClient.post<SendBulkEmailApiResponse>(API_ENDPOINTS.EMAILS.BASE, body)
};
