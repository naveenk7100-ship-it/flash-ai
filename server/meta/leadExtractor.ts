import { randomUUID } from 'node:crypto';
import type {
  Lead,
  LeadActivityItem,
  EngagementIntent,
  EngagementEventType,
  LeadPlatform
} from '../../src/types/index.js';

export class LeadExtractorManager {
  private leads: Map<string, Lead> = new Map();

  /**
   * Extracts or updates a Lead record from an incoming Instagram engagement event.
   */
  public processEngagementForLead(params: {
    senderId: string;
    senderUsername: string;
    senderName?: string;
    messageText: string;
    eventType: EngagementEventType;
    intent: EngagementIntent;
    detectedKeyword?: string;
    sourcePostId?: string;
    sourcePostTitle?: string;
    sourceCommentId?: string;
    conversationId?: string;
    estimatedValue?: number;
    autoReplySent?: boolean;
    autoReplyText?: string;
  }): { lead: Lead; isNew: boolean } {
    const {
      senderId,
      senderUsername,
      senderName,
      messageText,
      eventType,
      intent,
      detectedKeyword,
      sourcePostId,
      sourcePostTitle,
      sourceCommentId,
      conversationId,
      estimatedValue,
      autoReplySent,
      autoReplyText
    } = params;

    const now = new Date().toISOString();
    const cleanUsername = senderUsername.replace(/^@/, '').trim();

    // 1. Check for Existing Lead (Deduplication by instagramUserId or instagramUsername)
    let existingLead: Lead | undefined;
    for (const lead of this.leads.values()) {
      if (
        (lead.instagramUserId && lead.instagramUserId === senderId) ||
        (lead.instagramUsername && lead.instagramUsername.toLowerCase() === cleanUsername.toLowerCase()) ||
        (lead.contactInfo?.handle && lead.contactInfo.handle.toLowerCase() === cleanUsername.toLowerCase())
      ) {
        existingLead = lead;
        break;
      }
    }

    const platformMap: Record<EngagementEventType, LeadPlatform> = {
      DM: 'Instagram DM',
      COMMENT: 'Instagram Comment',
      STORY_REPLY: 'Instagram Story Reply',
      MENTION: 'Instagram DM'
    };
    const leadPlatform = platformMap[eventType] || 'Instagram DM';

    if (existingLead) {
      // --- UPDATE EXISTING LEAD ---
      const timeline: LeadActivityItem[] = existingLead.activityTimeline || [];

      // Add received message event to timeline
      timeline.push({
        id: `act-${Date.now()}-${randomUUID().slice(0, 6)}`,
        type: eventType === 'DM' ? 'DM_RECEIVED' : 'COMMENT_RECEIVED',
        timestamp: now,
        title: `${eventType === 'DM' ? 'Direct Message' : 'Comment'} Received`,
        description: `"${messageText}"`,
        metadata: { sourcePostId, sourcePostTitle, sourceCommentId }
      });

      if (detectedKeyword) {
        timeline.push({
          id: `act-kw-${Date.now()}`,
          type: 'KEYWORD_DETECTED',
          timestamp: now,
          title: `Keyword Detected: "${detectedKeyword}"`,
          description: `Classified intent as ${intent}.`
        });
      }

      if (autoReplySent && autoReplyText) {
        timeline.push({
          id: `act-reply-${Date.now()}`,
          type: 'AUTO_REPLY_SENT',
          timestamp: now,
          title: 'Automated Response Sent',
          description: autoReplyText.slice(0, 100) + (autoReplyText.length > 100 ? '...' : '')
        });
      }

      existingLead.updatedAt = now;
      existingLead.intent = intent;
      existingLead.requirement = `Latest inquiry: ${messageText}`;
      if (estimatedValue && (!existingLead.estimatedDealValue || estimatedValue > existingLead.estimatedDealValue)) {
        existingLead.estimatedDealValue = estimatedValue;
      }
      existingLead.activityTimeline = timeline;

      this.leads.set(existingLead.id, existingLead);
      return { lead: existingLead, isNew: false };
    }

    // --- CREATE NEW LEAD ---
    const newLeadId = `lead-ig-${Date.now()}-${randomUUID().slice(0, 6)}`;
    const timeline: LeadActivityItem[] = [
      {
        id: `act-init-${Date.now()}`,
        type: 'LEAD_CREATED',
        timestamp: now,
        title: 'Lead Captured via Instagram',
        description: `Prospect engaged via ${leadPlatform} on post: ${sourcePostTitle || sourcePostId || 'FLASH.Ai Reel'}`
      },
      {
        id: `act-msg-${Date.now()}`,
        type: eventType === 'DM' ? 'DM_RECEIVED' : 'COMMENT_RECEIVED',
        timestamp: now,
        title: `${eventType === 'DM' ? 'Direct Message' : 'Comment'} Received`,
        description: `"${messageText}"`
      }
    ];

    if (detectedKeyword) {
      timeline.push({
        id: `act-kw-${Date.now()}`,
        type: 'KEYWORD_DETECTED',
        timestamp: now,
        title: `Keyword Detected: "${detectedKeyword}"`,
        description: `Classified intent as ${intent}.`
      });
    }

    if (autoReplySent && autoReplyText) {
      timeline.push({
        id: `act-reply-${Date.now()}`,
        type: 'AUTO_REPLY_SENT',
        timestamp: now,
        title: 'Automated Response Sent',
        description: autoReplyText.slice(0, 100) + '...'
      });
    }

    const newLead: Lead = {
      id: newLeadId,
      name: senderName || `@${cleanUsername}`,
      business: 'Inbound Prospect',
      platform: leadPlatform,
      source: sourcePostTitle ? `Instagram Reel: "${sourcePostTitle}"` : 'Instagram Reel',
      requirement: messageText,
      status: 'NEW',
      date: now.split('T')[0],
      notes: `Intent: ${intent}${detectedKeyword ? ` | Keyword: "${detectedKeyword}"` : ''}`,
      contactInfo: {
        handle: `@${cleanUsername}`
      },
      instagramUserId: senderId,
      instagramUsername: cleanUsername,
      sourcePostId,
      sourcePostTitle,
      sourceCommentId,
      conversationId,
      intent,
      activityTimeline: timeline,
      estimatedDealValue: estimatedValue || 35000,
      createdAt: now,
      updatedAt: now
    };

    this.leads.set(newLeadId, newLead);
    return { lead: newLead, isNew: true };
  }

  public getAllLeads(): Lead[] {
    return Array.from(this.leads.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  public getLead(id: string): Lead | undefined {
    return this.leads.get(id);
  }

  public updateLeadStatus(id: string, status: any): Lead | undefined {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    lead.activityTimeline = lead.activityTimeline || [];
    lead.activityTimeline.push({
      id: `act-st-${Date.now()}`,
      type: status === 'WON' ? 'WON' : status === 'LOST' ? 'LOST' : 'QUALIFIED',
      timestamp: new Date().toISOString(),
      title: `Status Updated to ${status}`,
      description: `Lead moved to stage ${status} in CRM pipeline.`
    });
    return lead;
  }
}

export const leadExtractorManager = new LeadExtractorManager();
