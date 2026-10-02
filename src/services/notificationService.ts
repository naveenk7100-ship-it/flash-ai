/**
 * FLASH.Ai Review & Alert Notification Service (Requirements 2 & 9)
 * 
 * Supports:
 * - INotificationProvider abstraction
 * - DashboardNotificationProvider (in-app notifications)
 * - WhatsAppNotificationProvider (Meta WhatsApp Cloud API integration if configured)
 * - NotificationManager (dispatches multi-channel human review notifications)
 * - Zero-credential fallback: dashboard review works out of the box
 * - Security: Never exposes API tokens, phone numbers, or webhook secrets in UI/logs
 */

export interface ReviewNotificationPayload {
  reelId: string;
  title: string;
  topic: string;
  formatName: string;
  targetPublishTime: string; // e.g. "9:00 PM IST"
  reviewUrl: string;
  videoUrl?: string;
  captionPreview: string;
}

export interface NotificationResult {
  provider: 'dashboard' | 'whatsapp';
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface INotificationProvider {
  readonly id: string;
  readonly name: string;
  readonly type: 'dashboard' | 'whatsapp';
  isConfigured(): boolean;
  sendReviewNotification(payload: ReviewNotificationPayload): Promise<NotificationResult>;
}

declare const process: any;

function getSafeEnv(key: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return String(process.env[key]).trim();
  }
  return '';
}

// =========================================================================
// 1. DASHBOARD NOTIFICATION PROVIDER
// =========================================================================

export interface StoredDashboardNotification {
  id: string;
  reelId: string;
  title: string;
  message: string;
  targetPublishTime: string;
  reviewUrl: string;
  actions: Array<'APPROVE' | 'REJECT' | 'REGENERATE'>;
  read: boolean;
  createdAt: string;
}

const DASHBOARD_NOTIF_STORAGE_KEY = 'flash_ai_dashboard_notifications';

export class DashboardNotificationProvider implements INotificationProvider {
  public readonly id = 'dashboard-notification-provider';
  public readonly name = 'In-App Dashboard Notification Provider';
  public readonly type = 'dashboard' as const;
  private notifications: StoredDashboardNotification[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public isConfigured(): boolean {
    return true;
  }

  public async sendReviewNotification(payload: ReviewNotificationPayload): Promise<NotificationResult> {
    const notif: StoredDashboardNotification = {
      id: `notif-rev-${payload.reelId}-${Date.now()}`,
      reelId: payload.reelId,
      title: '🔥 FLASH.Ai Reel Ready for Review',
      message: `Today's Reel "${payload.title}" is ready.\n\nPublish time: ${payload.targetPublishTime}\n\nReview:\n${payload.reviewUrl}`,
      targetPublishTime: payload.targetPublishTime,
      reviewUrl: payload.reviewUrl,
      actions: ['APPROVE', 'REJECT', 'REGENERATE'],
      read: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.unshift(notif);
    if (this.notifications.length > 50) this.notifications.pop();
    this.saveToStorage();

    return {
      provider: 'dashboard',
      success: true,
      messageId: notif.id
    };
  }

  public getNotifications(): StoredDashboardNotification[] {
    return [...this.notifications];
  }

  public markAsRead(id: string): void {
    const item = this.notifications.find((n) => n.id === id);
    if (item) {
      item.read = true;
      this.saveToStorage();
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(DASHBOARD_NOTIF_STORAGE_KEY);
      if (raw) this.notifications = JSON.parse(raw);
    } catch {
      // Storage fallback
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(DASHBOARD_NOTIF_STORAGE_KEY, JSON.stringify(this.notifications));
    } catch {
      // Storage fallback
    }
  }
}

// =========================================================================
// 2. WHATSAPP NOTIFICATION PROVIDER (Meta WhatsApp Cloud API)
// =========================================================================

export class WhatsAppNotificationProvider implements INotificationProvider {
  public readonly id = 'whatsapp-notification-provider';
  public readonly name = 'Meta WhatsApp Cloud Notification Provider';
  public readonly type = 'whatsapp' as const;

  private get apiToken(): string {
    return getSafeEnv('WHATSAPP_API_TOKEN') || getSafeEnv('META_ACCESS_TOKEN');
  }

  private get phoneNumberId(): string {
    return getSafeEnv('WHATSAPP_PHONE_NUMBER_ID');
  }

  private get recipientNumber(): string {
    return getSafeEnv('WHATSAPP_RECIPIENT_NUMBER') || getSafeEnv('WHATSAPP_PHONE_NUMBER');
  }

  public isConfigured(): boolean {
    return Boolean(this.apiToken && this.phoneNumberId && this.recipientNumber);
  }

  public async sendReviewNotification(payload: ReviewNotificationPayload): Promise<NotificationResult> {
    if (!this.isConfigured()) {
      return {
        provider: 'whatsapp',
        success: false,
        error: 'WhatsApp credentials (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_RECIPIENT_NUMBER) not configured in environment.'
      };
    }

    const messageText = `🔥 *FLASH.Ai Reel Ready for Review*\n\nToday's Reel is ready.\n\n*Topic:* ${payload.title}\n*Publish time:* ${payload.targetPublishTime}\n\n*Review & Approve:*\n${payload.reviewUrl}\n\n*Actions Available:*\n• APPROVE (Schedules for 9:00 PM IST)\n• REJECT\n• REGENERATE`;

    try {
      const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: this.recipientNumber,
          type: 'text',
          text: { body: messageText }
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          provider: 'whatsapp',
          success: false,
          error: data.error?.message || `WhatsApp API error HTTP ${res.status}`
        };
      }

      return {
        provider: 'whatsapp',
        success: true,
        messageId: data.messages?.[0]?.id || `wa-msg-${Date.now()}`
      };
    } catch (err: any) {
      return {
        provider: 'whatsapp',
        success: false,
        error: err.message || 'WhatsApp network dispatch failed'
      };
    }
  }

  public async sendTextMessage(text: string, to?: string): Promise<NotificationResult> {
    const target = to || this.recipientNumber;
    if (!this.apiToken || !this.phoneNumberId || !target) {
      const missing: string[] = [];
      if (!this.phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
      if (!target) missing.push('WHATSAPP_RECIPIENT_NUMBER');
      if (!this.apiToken) missing.push('WHATSAPP_API_TOKEN / META_ACCESS_TOKEN');
      return {
        provider: 'whatsapp',
        success: false,
        error: `WhatsApp configuration missing: ${missing.join(', ')}`
      };
    }

    try {
      const url = `https://graph.facebook.com/v21.0/${this.phoneNumberId}/messages`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: target,
          type: 'text',
          text: { body: text }
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        return {
          provider: 'whatsapp',
          success: false,
          error: data.error?.message || `WhatsApp API error HTTP ${res.status}`
        };
      }

      return {
        provider: 'whatsapp',
        success: true,
        messageId: data.messages?.[0]?.id || `wa-msg-${Date.now()}`
      };
    } catch (err: any) {
      return {
        provider: 'whatsapp',
        success: false,
        error: err.message || 'WhatsApp network dispatch failed'
      };
    }
  }
}

// =========================================================================
// 3. NOTIFICATION MANAGER (DASHBOARD-ONLY REVIEW CHANNEL)
// =========================================================================

export class NotificationManager {
  private dashboardProvider = new DashboardNotificationProvider();

  public getDashboardProvider(): DashboardNotificationProvider {
    return this.dashboardProvider;
  }

  public isWhatsAppConfigured(): boolean {
    return false;
  }

  public async sendReviewNotification(payload: ReviewNotificationPayload): Promise<{
    dashboard: NotificationResult;
  }> {
    // Dashboard in-app alert is the sole active human review notification channel
    const dashResult = await this.dashboardProvider.sendReviewNotification(payload);

    return {
      dashboard: dashResult
    };
  }
}

export const notificationManager = new NotificationManager();
