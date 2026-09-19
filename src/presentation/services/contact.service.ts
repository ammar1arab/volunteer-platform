import { apiClient } from "./client.service";
import { API_ENDPOINTS } from "@/lib/config";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export const contactApi = {
  send: (data: ContactMessage) => apiClient.post<{ success: true }>(API_ENDPOINTS.CONTACT, data)
};
