import { api } from "./api";

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber?: string | null;
}

export interface WhatsAppLinkCode {
  code: string;
  expiresAt: string;
}

export interface WhatsAppSimulationRequest {
  from: string;
  text: string;
  messageId: string;
}

export interface WhatsAppSimulationResponse {
  reply: string;
}

export const getWhatsAppStatus = async (): Promise<WhatsAppStatus> => {
  const response = await api.get<WhatsAppStatus>("/whatsapp/status");
  return response.data;
};

export const generateWhatsAppLinkCode =
  async (): Promise<WhatsAppLinkCode> => {
    const response = await api.post<WhatsAppLinkCode>("/whatsapp/link-code");
    return response.data;
  };

export const disconnectWhatsApp = async (): Promise<void> => {
  await api.delete("/whatsapp/disconnect");
};

export const simulateWhatsAppMessage = async (
  data: WhatsAppSimulationRequest,
): Promise<WhatsAppSimulationResponse> => {
  const response = await api.post<WhatsAppSimulationResponse>(
    "/dev/whatsapp/simulate",
    data,
  );
  return response.data;
};
