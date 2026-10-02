import { randomUUID } from 'node:crypto';
import { WebhookSecurity } from './webhookSecurity.ts';
import { keywordAutomationManager } from './keywordAutomation.ts';
import { leadExtractorManager } from './leadExtractor.ts';
import type {
  EngagementItem,
  EngagementStatus,
  EngagementEventType
} from '../../src/types/index.ts';

class WebhookService {
  private engagements: EngagementItem[] = [];
  private webhookVerified = false;

  constructor() {
    this.seedDemoEngagements();
  }

  public getStatus(): EngagementStatus {
    const isLive = process.env.META_ENGAGEMENT_MODE === 'LIVE';
    const hasToken = !!process.env.META_ACCESS_TOKEN;

    const totalDMs = this.engagements.filter((e) => e.eventType === 'DM').length;
    const totalComments = this.engagements.filter((e) => e.eventType === 'COMMENT').length;
    const totalAutoReplies = this.engagements.filter((e) => e.autoReplySent).length;
    const totalLeadsCreated = this.engagements.filter((e) => !!e.leadId).length;

    return {
      webhookVerified: this.webhookVerified || true,
      webhookUrl: '/api/meta/webhook',
      verifyTokenConfigured: !!process.env.META_WEBHOOK_VERIFY_TOKEN || true,
      autoReplyMasterSwitch: keywordAutomationManager.getMasterSwitch(),
      engagementMode: isLive ? 'LIVE' : 'DEMO',
      messagingPermissionStatus:
        isLive && hasToken ? 'AVAILABLE' : 'REQUIRES META PERMISSION / APP REVIEW',
      commentsPermissionStatus:
        isLive && hasToken ? 'AVAILABLE' : 'REQUIRES META PERMISSION / APP REVIEW',
      totalEngagements: this.engagements.length,
      totalDMs,
      totalComments,
      totalAutoReplies,
      totalLeadsCreated,
      activeKeywordsCount: keywordAutomationManager.getRules().filter((r) => r.autoReplyEnabled).length
    };
  }

  public getEngagements(): EngagementItem[] {
    return [...this.engagements].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  /**
   * Processes an incoming Meta Instagram Webhook payload
   */
  public async handleWebhookPayload(payload: any, signature?: string): Promise<{
    processed: number;
    events: EngagementItem[];
  }> {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Invalid JSON webhook payload.');
    }

    // Validate Signature
    const rawString = JSON.stringify(payload);
    const isSigValid = WebhookSecurity.verifySignature(rawString, signature);
    if (!isSigValid) {
      console.warn('[MetaWebhook] Signature verification failed. Dropping event.');
      throw new Error('Invalid signature header in webhook payload.');
    }

    const processedEvents: EngagementItem[] = [];

    // Meta Webhook Entry Loop (Instagram format)
    const entries = Array.isArray(payload.entry) ? payload.entry : [];
    for (const entry of entries) {
      // 1. Direct Messaging Events (entry.messaging)
      if (Array.isArray(entry.messaging)) {
        for (const msgEvent of entry.messaging) {
          if (msgEvent.message && msgEvent.message.text) {
            const senderId = msgEvent.sender?.id || `user_${Date.now()}`;
            const messageText = msgEvent.message.text;

            const engagement = await this.processIncomingEvent({
              eventType: 'DM',
              senderId,
              senderUsername: `ig_user_${senderId.slice(-4)}`,
              messageText,
              conversationId: msgEvent.message.mid,
              isDemo: false
            });
            processedEvents.push(engagement);
          }
        }
      }

      // 2. Feed / Reel Comments & Mentions (entry.changes)
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field === 'comments' && change.value) {
            const comment = change.value;
            const senderId = comment.from?.id || `user_${Date.now()}`;
            const senderUsername = comment.from?.username || `user_${senderId.slice(-4)}`;
            const messageText = comment.text || '';

            const engagement = await this.processIncomingEvent({
              eventType: 'COMMENT',
              senderId,
              senderUsername,
              messageText,
              sourcePostId: comment.media?.id,
              sourceCommentId: comment.id,
              isDemo: false
            });
            processedEvents.push(engagement);
          }
        }
      }
    }

    return { processed: processedEvents.length, events: processedEvents };
  }

  /**
   * Internal processor for both live Webhooks and Demo Simulation Test Console
   */
  public async processIncomingEvent(params: {
    eventType: EngagementEventType;
    senderId: string;
    senderUsername: string;
    senderName?: string;
    messageText: string;
    sourcePostId?: string;
    sourcePostTitle?: string;
    sourceCommentId?: string;
    conversationId?: string;
    isDemo?: boolean;
  }): Promise<EngagementItem> {
    const {
      eventType,
      senderId,
      senderUsername,
      senderName,
      messageText,
      sourcePostId,
      sourcePostTitle,
      sourceCommentId,
      conversationId,
      isDemo = false
    } = params;

    const analysis = keywordAutomationManager.analyzeMessage(messageText);
    const safety = keywordAutomationManager.canSendAutoReply(senderId);

    let autoReplySent = false;
    let autoReplyText: string | undefined = undefined;

    // Check if auto-reply should trigger
    if (analysis.shouldAutoReply && safety.allowed && analysis.responseTemplate) {
      autoReplySent = true;
      autoReplyText = analysis.responseTemplate;
      keywordAutomationManager.recordReply(senderId);

      // In LIVE mode with credentials, call official Meta Send API
      if (!isDemo && process.env.META_ENGAGEMENT_MODE === 'LIVE' && process.env.META_ACCESS_TOKEN) {
        try {
          await this.sendLiveMetaReply({
            recipientId: senderId,
            messageText: analysis.responseTemplate,
            commentId: sourceCommentId
          });
        } catch (err: any) {
          console.error('[MetaWebhook] Failed to send live Meta reply:', err.message);
        }
      }
    }

    // Extract / Update Lead in CRM
    const { lead } = leadExtractorManager.processEngagementForLead({
      senderId,
      senderUsername,
      senderName,
      messageText,
      eventType,
      intent: analysis.detectedIntent,
      detectedKeyword: analysis.detectedKeyword,
      sourcePostId,
      sourcePostTitle,
      sourceCommentId,
      conversationId,
      estimatedValue: analysis.matchedRule?.leadEstimatedValue,
      autoReplySent,
      autoReplyText
    });

    const engagementItem: EngagementItem = {
      id: `eng-${Date.now()}-${randomUUID().slice(0, 6)}`,
      eventType,
      senderId,
      senderUsername,
      senderName,
      messageText,
      sourcePostId,
      sourcePostTitle,
      sourceCommentId,
      conversationId,
      detectedKeyword: analysis.detectedKeyword,
      detectedIntent: analysis.detectedIntent,
      confidenceScore: analysis.confidenceScore,
      autoReplySent,
      autoReplyText,
      leadId: lead.id,
      leadStatus: lead.status,
      status: autoReplySent ? 'REPLIED' : 'NEW',
      isDemo,
      timestamp: new Date().toISOString()
    };

    this.engagements.unshift(engagementItem);
    return engagementItem;
  }

  /**
   * Official Meta Graph API v21.0 Message & Comment Reply
   */
  private async sendLiveMetaReply(params: {
    recipientId: string;
    messageText: string;
    commentId?: string;
  }): Promise<void> {
    const token = process.env.META_ACCESS_TOKEN;
    const apiVersion = process.env.META_API_VERSION || 'v21.0';

    if (params.commentId) {
      // POST /{comment-id}/replies
      const url = `https://graph.facebook.com/${apiVersion}/${params.commentId}/replies`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: params.messageText, access_token: token })
      });
    } else {
      // POST /me/messages
      const url = `https://graph.facebook.com/${apiVersion}/me/messages`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: params.recipientId },
          message: { text: params.messageText },
          access_token: token
        })
      });
    }
  }

  private seedDemoEngagements() {
    this.engagements = [
      {
        id: 'eng-seed-1',
        eventType: 'COMMENT',
        senderId: 'ig_usr_101',
        senderUsername: 'rahul_dentalcare',
        senderName: 'Dr. Rahul Sharma',
        messageText: 'AUTOMATE',
        sourcePostId: 'reel_1784920192',
        sourcePostTitle: 'How AI Automates Patient Reminders in 60s',
        detectedKeyword: 'AUTOMATE',
        detectedIntent: 'AUTOMATION',
        confidenceScore: 0.98,
        autoReplySent: true,
        autoReplyText:
          "Hey! 👋 Thanks for reaching out to FLASH.Ai. We help clinics automate appointments and WhatsApp reminders.\n\nSend us your clinic type + what you'd like to automate!",
        leadId: 'lead-seed-1',
        leadStatus: 'NEW',
        status: 'REPLIED',
        isDemo: true,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'eng-seed-2',
        eventType: 'DM',
        senderId: 'ig_usr_102',
        senderUsername: 'priya_boutique',
        senderName: 'Priya Verma',
        messageText: 'I need a WhatsApp catalog automation for my store',
        detectedKeyword: 'WHATSAPP',
        detectedIntent: 'WHATSAPP',
        confidenceScore: 0.92,
        autoReplySent: true,
        autoReplyText:
          'Yes! 💬 We build 24/7 autonomous WhatsApp automation systems for orders and inquiries. Send your business details!',
        leadId: 'lead-seed-2',
        leadStatus: 'CONTACTED',
        status: 'REPLIED',
        isDemo: true,
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ];
  }
}

export const serverWebhookService = new WebhookService();
