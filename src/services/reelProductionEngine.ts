/**
 * FLASH.Ai Reel Production & Script Engine
 * 
 * Implements the mandatory Reel Structure:
 * HOOK → PROBLEM/CONTEXT → DEMO/VALUE → RESULT/PAYOFF → CTA
 * 
 * Supports all 7 visual sources:
 * - Website screen recordings
 * - Product/demo recordings
 * - Images
 * - Short video clips
 * - UI screenshots
 * - Generated visual placeholders
 * - Text-only scenes
 * 
 * Pacing: Practical, modern, fast-paced, creator-like.
 * Duration: Approximately 20–60 seconds.
 * Aspect Ratio: 9:16 (1080x1920).
 * Operates with 100% realistic fidelity in DEMO MODE with zero external API keys needed.
 */

import { FLASH_AI_BRAND } from '../constants/brandConfig';
import {
  reelFormatEngine,
  type ReelFormatId,
  type ReelFormatDefinition,
  type ReelStructureBlock,
  type VisualSourceType
} from './reelFormatEngine';
import { contentMemoryService } from './contentMemoryService';

export interface ProductionScene {
  sceneNumber: number;
  block: ReelStructureBlock;
  durationSeconds: number;
  visualSource: VisualSourceType;
  textOverlay: string;
  voiceoverText: string;
  visualInstruction: string;
  transition: 'cut' | 'zoom_in' | 'slide_left' | 'slide_right' | 'pop' | 'ken_burns' | 'pulse' | 'fade' | 'wipe';
  audioInstruction: string;
}

export interface ProductionReelPackage {
  id: string;
  topic: string;
  format: ReelFormatDefinition;
  pillarId: string;
  targetAudience: string;
  aspectRatio: '9:16';
  resolution: { width: number; height: number };
  hook: string;
  hookRetentionCue: string;
  conceptSummary: string;
  scenes: ProductionScene[];
  totalDurationSeconds: number;
  cta: string;
  caption: string;
  hashtags: {
    niche: string[];
    broad: string[];
    viral: string[];
  };
  qcStatus: 'PASSED' | 'FAILED' | 'PENDING';
  qcErrors?: string[];
  mode: 'DEMO' | 'AI';
  createdAt: string;
}

export class ReelProductionEngine {
  /**
   * Generates a complete, ready-to-produce Reel package following the strict 5-block structure.
   */
  public generateReelPackage(params: {
    topic: string;
    pillarId?: string;
    formatId?: ReelFormatId;
    targetAudience?: string;
    targetDurationSeconds?: number;
    cta?: string;
    preferredMode?: 'DEMO' | 'AI';
  }): ProductionReelPackage {
    const topic = params.topic.trim();
    const pillarId = params.pillarId || 'ai-automation';
    const targetAudience = params.targetAudience || 'Small business owners & founders';
    const targetDuration = Math.min(60, Math.max(20, params.targetDurationSeconds || 35));

    // 1. Select Format using smart rotation engine
    const format = params.formatId
      ? reelFormatEngine.getFormatById(params.formatId) || reelFormatEngine.selectNextFormat({ pillarId })
      : reelFormatEngine.selectNextFormat({ pillarId });

    // 2. Select CTA
    const cta = params.cta || FLASH_AI_BRAND.ctaStyles[0].label;

    // 3. Craft tailored 5-block scenes based on format and topic
    const scenes = this.buildScenes(topic, format, targetDuration, cta);
    const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

    const hook = scenes[0]?.voiceoverText || `Here is how AI is transforming ${topic}.`;
    const hookRetentionCue = scenes[0]?.visualInstruction || format.retentionCue;
    const conceptSummary = `${format.name} breakdown showing ${topic} implemented with FLASH.Ai automated architecture.`;

    // 4. Generate Caption
    const caption = this.generateCaption(topic, format, scenes, cta);

    // 5. Generate Categorized Hashtags
    const hashtags = this.generateHashtags(pillarId, format.id);

    // 6. Memory & Quality Check
    const memoryCheck = contentMemoryService.evaluateCandidate({
      topic,
      hook,
      formatId: format.id,
      scriptConcept: conceptSummary,
      visualConcept: scenes[1]?.visualInstruction
    });

    const qcErrors: string[] = [];
    if (!memoryCheck.passed) {
      qcErrors.push(...memoryCheck.reasons);
    }
    if (totalDuration < 20 || totalDuration > 60) {
      qcErrors.push(`Duration ${totalDuration}s is outside valid 20s-60s window.`);
    }
    if (scenes.length < 3) {
      qcErrors.push('Reel must contain at least 3 distinct scenes.');
    }
    if (scenes.some((s) => !s.textOverlay || !s.voiceoverText || s.durationSeconds <= 0)) {
      qcErrors.push('Contains empty or invalid scene parameters.');
    }

    const reelPackage: ProductionReelPackage = {
      id: `reel-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      topic,
      format,
      pillarId,
      targetAudience,
      aspectRatio: '9:16',
      resolution: { width: 1080, height: 1920 },
      hook,
      hookRetentionCue,
      conceptSummary,
      scenes,
      totalDurationSeconds: totalDuration,
      cta,
      caption,
      hashtags,
      qcStatus: qcErrors.length === 0 ? 'PASSED' : 'FAILED',
      qcErrors: qcErrors.length > 0 ? qcErrors : undefined,
      mode: params.preferredMode || 'DEMO',
      createdAt: new Date().toISOString()
    };

    // Auto-record to memory if passed
    if (reelPackage.qcStatus === 'PASSED') {
      contentMemoryService.recordItem({
        id: reelPackage.id,
        topic: reelPackage.topic,
        hook: reelPackage.hook,
        formatId: format.id,
        formatName: format.name,
        scriptConcept: reelPackage.conceptSummary,
        visualConcept: scenes[2]?.visualInstruction || format.retentionCue,
        pillarId,
        status: 'PLANNED'
      });
    }

    return reelPackage;
  }

  /**
   * Constructs the 5 scenes conforming to:
   * HOOK → PROBLEM/CONTEXT → DEMO/VALUE → RESULT/PAYOFF → CTA
   */
  private buildScenes(
    topic: string,
    format: ReelFormatDefinition,
    targetDuration: number,
    cta: string
  ): ProductionScene[] {
    // Proportional splits according to format
    const breakdown = format.structureBreakdown;
    const sum = breakdown.hookDuration + breakdown.problemDuration + breakdown.demoDuration + breakdown.resultDuration + breakdown.ctaDuration;
    const scale = targetDuration / sum;

    const dHook = Math.max(3, Math.round(breakdown.hookDuration * scale));
    const dProblem = Math.max(5, Math.round(breakdown.problemDuration * scale));
    const dDemo = Math.max(10, Math.round(breakdown.demoDuration * scale));
    const dResult = Math.max(5, Math.round(breakdown.resultDuration * scale));
    const dCta = Math.max(3, Math.round(breakdown.ctaDuration * scale));

    const scenes: ProductionScene[] = [
      // 1. HOOK (00:00 - ~00:03)
      {
        sceneNumber: 1,
        block: 'HOOK',
        durationSeconds: dHook,
        visualSource: format.primaryVisualSource,
        textOverlay: this.generateHookOverlay(topic, format),
        voiceoverText: this.generateHookVoiceover(topic, format),
        visualInstruction: format.retentionCue,
        transition: 'pop',
        audioInstruction: 'Sharp upbeat punch audio cue, zero silence at second zero, voiceover starts instantly.'
      },

      // 2. PROBLEM / CONTEXT (00:03 - ~00:09)
      {
        sceneNumber: 2,
        block: 'PROBLEM_CONTEXT',
        durationSeconds: dProblem,
        visualSource: 'ui_screenshot',
        textOverlay: `The Bottleneck: 15+ Hours Wasted on Manual ${this.extractCoreSubject(topic)}`,
        voiceoverText: `Most businesses lose hours every single week dealing with messy manual handoffs, slow response times, and unorganized inquiries.`,
        visualInstruction: 'Red highlight box zooms into manual spreadsheet or backlog of 40 unread messages.',
        transition: 'slide_left',
        audioInstruction: 'Subtle tension drone with quick notification buzz sound effect.'
      },

      // 3. DEMO / VALUE (00:09 - ~00:25)
      {
        sceneNumber: 3,
        block: 'DEMO_VALUE',
        durationSeconds: dDemo,
        visualSource: format.primaryVisualSource === 'website_recording' ? 'website_recording' : 'product_demo',
        textOverlay: `FLASH.Ai Automated Workflow: Instant Trigger → AI Processing → Confirmation`,
        voiceoverText: `Here is how we automate it with FLASH.Ai. The moment an inquiry arrives, our AI agent validates the intent, extracts the parameters, and triggers the next step in under 2 seconds.`,
        visualInstruction: 'Live screen recording showing automated webhook executing with neon terminal logs turning green.',
        transition: 'zoom_in',
        audioInstruction: 'Fast keyboard clatter SFX, upbeat tech house riser, clear energetic voiceover pacing.'
      },

      // 4. RESULT / PAYOFF (00:25 - ~00:31)
      {
        sceneNumber: 4,
        block: 'RESULT_PAYOFF',
        durationSeconds: dResult,
        visualSource: 'image',
        textOverlay: `The Payoff: 2-Second Response Time • 0 Missed Leads • 24/7 Autopilot`,
        voiceoverText: `The result? Zero missed opportunities, 24/7 reliability, and your team gets 15 hours back every single week.`,
        visualInstruction: 'High-contrast metrics graphic card with animated +38% conversion badge and calendar booked slots.',
        transition: 'fade',
        audioInstruction: 'Positive success chime, bright harmonic resolution.'
      },

      // 5. CTA (00:31 - ~00:35)
      {
        sceneNumber: 5,
        block: 'CTA',
        durationSeconds: dCta,
        visualSource: 'visual_placeholder',
        textOverlay: `👉 ${cta} for the Complete Blueprint | @flash_ai_digital`,
        voiceoverText: `Want this exact automation built for your business? ${cta} and we will send you the complete blueprint.`,
        visualInstruction: 'Cyber navy card with pulsing cyan CTA button and animated cursor click on @flash_ai_digital.',
        transition: 'pulse',
        audioInstruction: 'Bass drop with distinct double-click sound effect. Clean audio fade-out.'
      }
    ];

    return scenes;
  }

  private generateHookOverlay(topic: string, format: ReelFormatDefinition): string {
    switch (format.id) {
      case 'i-built-this-with-ai':
        return `⚡ I Built This AI Agent in 48 Hours`;
      case 'before-after':
        return `⚠️ Manual Workflow vs ⚡ AI Autopilot`;
      case 'ai-automation-demo':
        return `👀 Watch This AI Automate in Real-Time`;
      case 'website-showcase':
        return `🚀 Modern Website Setup for 3x Bookings`;
      case 'ai-tool-discovery':
        return `🔥 Free AI Tool You Need to Install`;
      case 'workflow-reveal':
        return `📂 Steal Our Exact 4-Step Agency Pipeline`;
      case 'three-tools-three-tips':
        return `🛠️ 3 AI Tools That Save 20 Hours/Week`;
      case 'myth-vs-reality':
        return `❌ Myth vs ✅ Reality: AI Automation`;
      default:
        return `⚠️ Stop Doing ${this.extractCoreSubject(topic)} Manually`;
    }
  }

  private generateHookVoiceover(topic: string, format: ReelFormatDefinition): string {
    switch (format.id) {
      case 'i-built-this-with-ai':
        return `I built a complete automated AI workflow for ${this.extractCoreSubject(topic)} in under 48 hours. Here is how it works.`;
      case 'before-after':
        return `Before FLASH.Ai: 4 hours of tedious manual busywork. After: 3 seconds on full autopilot.`;
      case 'ai-automation-demo':
        return `Watch what happens in real-time when our AI agent handles this entire workflow automatically.`;
      case 'website-showcase':
        return `Here is why this modern website converts 3 times more leads than traditional static sites.`;
      case 'ai-tool-discovery':
        return `This free AI tool feels like an unfair advantage for small business owners in 2026.`;
      case 'workflow-reveal':
        return `Steal this exact 4-step automation pipeline we use to eliminate 15 hours of manual work.`;
      case 'three-tools-three-tips':
        return `Here are 3 practical AI tools every founder needs to start using this week.`;
      case 'myth-vs-reality':
        return `The biggest myth in business right now is that AI automation costs thousands. Here is the reality.`;
      default:
        return `If you still handle ${this.extractCoreSubject(topic)} manually in 2026, you are burning valuable hours.`;
    }
  }

  private extractCoreSubject(topic: string): string {
    return topic
      .replace(/^how to /i, '')
      .replace(/^building a /i, '')
      .replace(/^inside the /i, '')
      .slice(0, 35);
  }

  private generateCaption(
    _topic: string,
    format: ReelFormatDefinition,
    scenes: ProductionScene[],
    cta: string
  ): string {
    return `${scenes[0].voiceoverText} 👇

Most businesses spend 15+ hours every week trapped in manual handoffs, slow response times, and repetitive admin work. 

Here is how we solve it at @flash_ai_digital with autonomous AI systems:

⚡ 1. Instant Trigger: Inquiries and data are ingested automatically with zero latency.
⚡ 2. Intelligent Agent Logic: AI qualifies intent, verifies details, and prepares execution.
⚡ 3. Direct Outcome: Automated CRM sync, instant client reply, and verified time saved.

Format: ${format.name}
Built by: FLASH.Ai (@flash_ai_digital)

👉 ${cta} and we'll send you our step-by-step implementation blueprint!

Save this Reel for later 📌`;
  }

  private generateHashtags(pillarId: string, _formatId?: string): { niche: string[]; broad: string[]; viral: string[] } {
    const nicheMap: Record<string, string[]> = {
      'ai-automation': ['#AIAutomation', '#WorkflowAutomation', '#AgencyAutomation', '#FLASHai'],
      'whatsapp-automation': ['#WhatsAppAutomation', '#ChatbotMarketing', '#InboundLeads', '#FLASHai'],
      'lead-generation': ['#LeadGeneration', '#B2BAutomation', '#InboundMarketing', '#SalesPipeline'],
      'website-solutions': ['#WebDesign', '#HighConvertingWebsite', '#CRO', '#DigitalAgency'],
      'ai-tools': ['#AITools', '#ProductivityHacks', '#ArtificialIntelligence', '#TechTools'],
      'business-growth': ['#BusinessGrowth', '#ScalingUp', '#Entrepreneurship', '#StartupOps']
    };

    return {
      niche: nicheMap[pillarId] || ['#AIAutomation', '#BusinessSystems', '#FLASHai'],
      broad: ['#ArtificialIntelligence', '#SmallBusinessTips', '#Automation'],
      viral: ['#TechReels', '#ProductivityTips', '#FutureOfWork']
    };
  }
}

export const reelProductionEngine = new ReelProductionEngine();
