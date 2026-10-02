import type {
  EngagementItem,
  EngagementStatus,
  KeywordRule,
  Lead,
  EngagementEventType
} from '../types';

class EngagementService {
  private baseUrl = '/api/engagement';

  public async getStatus(): Promise<EngagementStatus> {
    try {
      const res = await fetch(`${this.baseUrl}/status`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Failed to fetch engagement status:', err);
      return {
        webhookVerified: true,
        webhookUrl: '/api/meta/webhook',
        verifyTokenConfigured: true,
        autoReplyMasterSwitch: false,
        engagementMode: 'DEMO',
        messagingPermissionStatus: 'REQUIRES META PERMISSION / APP REVIEW',
        commentsPermissionStatus: 'REQUIRES META PERMISSION / APP REVIEW',
        totalEngagements: 0,
        totalDMs: 0,
        totalComments: 0,
        totalAutoReplies: 0,
        totalLeadsCreated: 0,
        activeKeywordsCount: 5
      };
    }
  }

  public async getInbox(): Promise<EngagementItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/inbox`);
      const data = await res.json();
      return data.inbox || [];
    } catch {
      return [];
    }
  }

  public async getRules(): Promise<KeywordRule[]> {
    try {
      const res = await fetch(`${this.baseUrl}/rules`);
      const data = await res.json();
      return data.rules || [];
    } catch {
      return [];
    }
  }

  public async updateRule(rule: KeywordRule): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/rules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule)
    });
    const data = await res.json();
    return !!data.success;
  }

  public async updateSettings(settings: { autoReplyMasterSwitch: boolean }): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return !!data.success;
  }

  public async simulateWebhookEvent(params: {
    eventType: EngagementEventType;
    senderId: string;
    senderUsername: string;
    senderName?: string;
    messageText: string;
    sourcePostId?: string;
    sourcePostTitle?: string;
  }): Promise<EngagementItem> {
    const res = await fetch(`${this.baseUrl}/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to simulate webhook event');
    }
    return data.event;
  }

  public async blockUser(userId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/block-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    return !!data.success;
  }

  public async getLeads(): Promise<Lead[]> {
    try {
      const res = await fetch(`${this.baseUrl}/leads`);
      const data = await res.json();
      return data.leads || [];
    } catch {
      return [];
    }
  }
}

export const engagementService = new EngagementService();
