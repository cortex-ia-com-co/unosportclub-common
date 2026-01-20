export type NotificationPermission = 'default' | 'granted' | 'denied';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  url?: string;
  tag?: string;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp?: number;
}

export interface FCMTokenRequest {
  userId: string;
  token: string;
}

export interface FCMTokenResponse {
  success: boolean;
  message?: string;
}

export interface NotificationClickData {
  url?: string;
  route?: string;
  data?: Record<string, unknown>;
}
