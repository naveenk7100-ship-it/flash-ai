import type {
  KeywordRule,
  EngagementIntent
} from '../../src/types/index.js';

export const DEFAULT_KEYWORD_RULES: KeywordRule[] = [
  {
    id: 'kw-automate',
    keyword: 'AUTOMATE',
    intent: 'AUTOMATION',
    responseTemplate:
      "Hey! 👋 Thanks for reaching out to FLASH.Ai.\n\nWe help businesses automate repetitive workflows using AI, custom WhatsApp bots, and autonomous lead engines.\n\nSend us your business type + what you'd like to automate and our engineering team will share a free blueprint.",
    autoReplyEnabled: true,
    leadEstimatedValue: 50000
  },
  {
    id: 'kw-website',
    keyword: 'WEBSITE',
    intent: 'WEBSITE',
    responseTemplate:
      "Absolutely! 🚀 FLASH.Ai builds modern, high-converting digital solutions and AI-integrated websites for businesses.\n\nTell us what kind of business you operate and what you'd like your website to achieve.",
    autoReplyEnabled: true,
    leadEstimatedValue: 35000
  },
  {
    id: 'kw-whatsapp',
    keyword: 'WHATSAPP',
    intent: 'WHATSAPP',
    responseTemplate:
      'Yes! 💬 We build 24/7 autonomous WhatsApp automation systems for inquiries, bookings, customer support, and catalog orders.\n\nDrop your business type and what you want automated.',
    autoReplyEnabled: true,
    leadEstimatedValue: 30000
  },
  {
    id: 'kw-leads',
    keyword: 'LEADS',
    intent: 'LEAD_GENERATION',
    responseTemplate:
      'Targeted inbound lead generation is our specialty! 📈 We build automated acquisition funnels that capture and qualify prospects directly from social media.\n\nWhat is your target customer profile?',
    autoReplyEnabled: true,
    leadEstimatedValue: 45000
  },
  {
    id: 'kw-ai',
    keyword: 'AI',
    intent: 'AI_TOOLS',
    responseTemplate:
      'Hey! ⚡ FLASH.Ai develops bespoke AI automation systems and specialized digital tooling for growing companies.\n\nWhat workflow or bottleneck would you like AI to solve for you?',
    autoReplyEnabled: true,
    leadEstimatedValue: 40000
  },
  {
    id: 'kw-demo',
    keyword: 'DEMO',
    intent: 'DEMO',
    responseTemplate:
      "We'd love to show you a live interactive demo! 🎯 Send us your industry and we will send over a walkthrough of our automation engine.",
    autoReplyEnabled: true,
    leadEstimatedValue: 25000
  },
  {
    id: 'kw-price',
    keyword: 'PRICE',
    intent: 'PRICING',
    responseTemplate:
      'Pricing depends directly on the workflow scope and integrations required. 💼 Tell us what systems you currently use and what you need built, and we will prepare an exact project scope.',
    autoReplyEnabled: false, // Default human review recommended for custom pricing
    leadEstimatedValue: 35000
  }
];

export interface ConversationState {
  userId: string;
  threadId?: string;
  lastMessageAt: number;
  lastReplyAt: number;
  replyCount: number;
  status: 'ACTIVE' | 'COOLDOWN' | 'BLOCKED';
}

export class KeywordAutomationManager {
  private rules: Map<string, KeywordRule> = new Map();
  private conversationStates: Map<string, ConversationState> = new Map();
  private autoReplyMasterSwitch = false; // Default OFF until verified
  private cooldownMs = 3 * 60 * 1000; // 3 minutes cooldown between auto-replies
  private maxRepliesPerUser = 3; // Maximum automated replies per thread before requiring human takeover

  constructor() {
    DEFAULT_KEYWORD_RULES.forEach((r) => this.rules.set(r.keyword.toUpperCase(), r));
  }

  public getRules(): KeywordRule[] {
    return Array.from(this.rules.values());
  }

  public updateRule(rule: KeywordRule): void {
    this.rules.set(rule.keyword.toUpperCase(), rule);
  }

  public setMasterSwitch(enabled: boolean): void {
    this.autoReplyMasterSwitch = enabled;
  }

  public getMasterSwitch(): boolean {
    return this.autoReplyMasterSwitch;
  }

  /**
   * Evaluates incoming message text, detects keywords, and classifies intent.
   */
  public analyzeMessage(messageText: string): {
    detectedKeyword?: string;
    detectedIntent: EngagementIntent;
    confidenceScore: number;
    matchedRule?: KeywordRule;
    shouldAutoReply: boolean;
    responseTemplate?: string;
    cooldownActive: boolean;
  } {
    const cleanText = (messageText || '').toUpperCase().trim();
    const words = cleanText.split(/[\s,.;!?"]+/).filter(Boolean);

    // 1. Direct Keyword Matching
    for (const rule of this.rules.values()) {
      const kw = rule.keyword.toUpperCase();
      if (words.includes(kw) || cleanText === kw || cleanText.includes(`"${kw}"`) || cleanText.startsWith(kw)) {
        return {
          detectedKeyword: rule.keyword,
          detectedIntent: rule.intent,
          confidenceScore: 0.98,
          matchedRule: rule,
          shouldAutoReply: this.autoReplyMasterSwitch && rule.autoReplyEnabled,
          responseTemplate: rule.responseTemplate,
          cooldownActive: false
        };
      }
    }

    // 2. Intent Heuristic Matching
    if (/whatsapp|wa bot|catalog/i.test(messageText)) {
      const rule = this.rules.get('WHATSAPP');
      return {
        detectedKeyword: 'WHATSAPP',
        detectedIntent: 'WHATSAPP',
        confidenceScore: 0.88,
        matchedRule: rule,
        shouldAutoReply: this.autoReplyMasterSwitch && (rule?.autoReplyEnabled ?? false),
        responseTemplate: rule?.responseTemplate,
        cooldownActive: false
      };
    }

    if (/website|web app|landing page|redesign/i.test(messageText)) {
      const rule = this.rules.get('WEBSITE');
      return {
        detectedKeyword: 'WEBSITE',
        detectedIntent: 'WEBSITE',
        confidenceScore: 0.88,
        matchedRule: rule,
        shouldAutoReply: this.autoReplyMasterSwitch && (rule?.autoReplyEnabled ?? false),
        responseTemplate: rule?.responseTemplate,
        cooldownActive: false
      };
    }

    if (/cost|pricing|charges|budget|quote|fees/i.test(messageText)) {
      const rule = this.rules.get('PRICE');
      return {
        detectedKeyword: 'PRICE',
        detectedIntent: 'PRICING',
        confidenceScore: 0.85,
        matchedRule: rule,
        shouldAutoReply: this.autoReplyMasterSwitch && (rule?.autoReplyEnabled ?? false),
        responseTemplate: rule?.responseTemplate,
        cooldownActive: false
      };
    }

    if (/lead|clients|sales|inbound/i.test(messageText)) {
      const rule = this.rules.get('LEADS');
      return {
        detectedKeyword: 'LEADS',
        detectedIntent: 'LEAD_GENERATION',
        confidenceScore: 0.85,
        matchedRule: rule,
        shouldAutoReply: this.autoReplyMasterSwitch && (rule?.autoReplyEnabled ?? false),
        responseTemplate: rule?.responseTemplate,
        cooldownActive: false
      };
    }

    if (/automate|automation|workflow|bot/i.test(messageText)) {
      const rule = this.rules.get('AUTOMATE');
      return {
        detectedKeyword: 'AUTOMATE',
        detectedIntent: 'AUTOMATION',
        confidenceScore: 0.85,
        matchedRule: rule,
        shouldAutoReply: this.autoReplyMasterSwitch && (rule?.autoReplyEnabled ?? false),
        responseTemplate: rule?.responseTemplate,
        cooldownActive: false
      };
    }

    return {
      detectedIntent: 'GENERAL',
      confidenceScore: 0.5,
      shouldAutoReply: false,
      cooldownActive: false
    };
  }

  /**
   * Conversation Safety Check: Cooldown & Loop Prevention
   */
  public canSendAutoReply(userId: string): { allowed: boolean; reason?: string } {
    if (!this.autoReplyMasterSwitch) {
      return { allowed: false, reason: 'Auto-reply master switch is DISABLED.' };
    }

    const state = this.conversationStates.get(userId);
    const now = Date.now();

    if (!state) {
      return { allowed: true };
    }

    if (state.status === 'BLOCKED') {
      return { allowed: false, reason: 'Automation is manually blocked for this user.' };
    }

    if (state.replyCount >= this.maxRepliesPerUser) {
      return {
        allowed: false,
        reason: `Maximum automated reply threshold (${this.maxRepliesPerUser}) reached. Human takeover required.`
      };
    }

    if (now - state.lastReplyAt < this.cooldownMs) {
      const remainingSec = Math.round((this.cooldownMs - (now - state.lastReplyAt)) / 1000);
      return {
        allowed: false,
        reason: `Cooldown active (${remainingSec}s remaining before next reply).`
      };
    }

    return { allowed: true };
  }

  public recordReply(userId: string): void {
    const now = Date.now();
    const existing = this.conversationStates.get(userId);
    if (existing) {
      existing.lastReplyAt = now;
      existing.replyCount += 1;
      this.conversationStates.set(userId, existing);
    } else {
      this.conversationStates.set(userId, {
        userId,
        lastMessageAt: now,
        lastReplyAt: now,
        replyCount: 1,
        status: 'ACTIVE'
      });
    }
  }

  public blockUser(userId: string): void {
    const existing = this.conversationStates.get(userId);
    if (existing) {
      existing.status = 'BLOCKED';
    } else {
      this.conversationStates.set(userId, {
        userId,
        lastMessageAt: Date.now(),
        lastReplyAt: 0,
        replyCount: 0,
        status: 'BLOCKED'
      });
    }
  }
}

export const keywordAutomationManager = new KeywordAutomationManager();
