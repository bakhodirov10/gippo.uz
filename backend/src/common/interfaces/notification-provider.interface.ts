export interface SendNotificationPayload {
  userId: string;
  recipientEmail?: string;
  recipientPhone?: string;
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

export interface NotificationProvider {
  send(payload: SendNotificationPayload): Promise<boolean>;
}
