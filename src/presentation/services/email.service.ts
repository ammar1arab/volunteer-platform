import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";
import type {
  GetEmailRecipientsResponse,
  SendBulkEmailApiResponse,
  SendBulkEmailInput,
} from "@/core/application/dtos";

export const emailApi = {
  previewRecipients: (params: {
    target:       string;
    targetValue?: string;
    minHours?:    number;
    skillFilter?: string;
  }): Promise<GetEmailRecipientsResponse> =>
    apiClient.get<GetEmailRecipientsResponse>(
      API_ENDPOINTS.EMAILS.PREVIEW(params.target, params.targetValue, params.minHours, params.skillFilter)
    ),

  sendBulk: (body: SendBulkEmailInput): Promise<SendBulkEmailApiResponse> =>
    apiClient.post<SendBulkEmailApiResponse>(API_ENDPOINTS.EMAILS.BASE, body),
};