/**
 * FLASH.Ai Reel Format Engine
 * 
 * Supports the 15 core high-retention creator formats for Instagram Reels:
 * 1. I Built This With AI
 * 2. Before / After
 * 3. AI Automation Demo
 * 4. Website Showcase
 * 5. AI Tool Discovery
 * 6. Workflow Reveal
 * 7. Mini Tutorial
 * 8. Business Automation
 * 9. Case Study
 * 10. Problem → AI Solution
 * 11. Screen Recording Demo
 * 12. 3 Tools / 3 Tips
 * 13. AI News / Update
 * 14. Myth vs Reality
 * 15. Quick Explainer
 * 
 * Includes intelligent format rotation to guarantee variety and prevent daily repetition.
 */

export type ReelFormatId =
  | 'i-built-this-with-ai'
  | 'before-after'
  | 'ai-automation-demo'
  | 'website-showcase'
  | 'ai-tool-discovery'
  | 'workflow-reveal'
  | 'mini-tutorial'
  | 'business-automation'
  | 'case-study'
  | 'problem-ai-solution'
  | 'screen-recording-demo'
  | 'three-tools-three-tips'
  | 'ai-news-update'
  | 'myth-vs-reality'
  | 'quick-explainer';

export type ReelStructureBlock =
  | 'HOOK'
  | 'PROBLEM_CONTEXT'
  | 'DEMO_VALUE'
  | 'RESULT_PAYOFF'
  | 'CTA';

export type VisualSourceType =
  | 'website_recording'
  | 'product_demo'
  | 'image'
  | 'video_clip'
  | 'ui_screenshot'
  | 'visual_placeholder'
  | 'text_only';

export interface ReelFormatDefinition {
  id: ReelFormatId;
  name: string;
  category: 'Build & Demo' | 'Workflow & Systems' | 'Discovery & Tips' | 'Proof & ROI' | 'Insights & News';
  description: string;
  hookFormula: string;
  retentionCue: string;
  recommendedDurationSeconds: number;
  primaryVisualSource: VisualSourceType;
  secondaryVisualSources: VisualSourceType[];
  idealPillars: string[];
  structureBreakdown: {
    hookDuration: number;
    problemDuration: number;
    demoDuration: number;
    resultDuration: number;
    ctaDuration: number;
  };
  sampleTopic: string;
}

export const REEL_FORMATS: ReelFormatDefinition[] = [
  {
    id: 'i-built-this-with-ai',
    name: 'I Built This With AI',
    category: 'Build & Demo',
    description: 'First-person build reveal showcasing an AI agent, tool, or automation built in hours instead of weeks.',
    hookFormula: 'I built a 24/7 AI sales rep for a client in 48 hours—here is what happened.',
    retentionCue: 'Split screen of developer terminal and working live client interface with notifications popping.',
    recommendedDurationSeconds: 40,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'website_recording'],
    idealPillars: ['flash-builds', 'ai-automation', 'lead-generation'],
    structureBreakdown: { hookDuration: 4, problemDuration: 8, demoDuration: 18, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Building an automated appointment booking agent for a local dental clinic'
  },
  {
    id: 'before-after',
    name: 'Before / After',
    category: 'Proof & ROI',
    description: 'High-contrast visual juxtaposition of chaotic manual operations vs streamlined AI execution.',
    hookFormula: 'Before FLASH.Ai: 4 hours of manual data entry. After: 3 seconds on autopilot.',
    retentionCue: 'Fast split screen comparison: Stressed spreadsheet typing vs instant green checkmarks.',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'screen_recording_demo' as any,
    secondaryVisualSources: ['ui_screenshot', 'video_clip'],
    idealPillars: ['business-growth', 'ai-automation', 'whatsapp-automation'],
    structureBreakdown: { hookDuration: 3, problemDuration: 6, demoDuration: 13, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'Manual lead response vs instant automated WhatsApp qualification'
  },
  {
    id: 'ai-automation-demo',
    name: 'AI Automation Demo',
    category: 'Build & Demo',
    description: 'Live end-to-end trigger-to-completion demonstration of an AI workflow in action.',
    hookFormula: 'Watch what happens when a prospect submits this form at 11:30 PM.',
    retentionCue: 'Live cursor clicking submit, followed by instant webhook firing notification.',
    recommendedDurationSeconds: 45,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'website_recording'],
    idealPillars: ['ai-automation', 'lead-generation', 'whatsapp-automation'],
    structureBreakdown: { hookDuration: 4, problemDuration: 8, demoDuration: 21, resultDuration: 8, ctaDuration: 4 },
    sampleTopic: 'Multi-step webhook triggering CRM update and WhatsApp follow-up instantly'
  },
  {
    id: 'website-showcase',
    name: 'Website Showcase',
    category: 'Build & Demo',
    description: 'Interactive critique and feature tour of a high-conversion modern website with integrated AI.',
    hookFormula: 'Why this modern website generates 3x more calls than 90% of business sites.',
    retentionCue: 'Smooth mobile frame scroll through hero section, interactive booking widget, and AI chatbot.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'website_recording',
    secondaryVisualSources: ['ui_screenshot', 'product_demo'],
    idealPillars: ['website-solutions', 'business-growth'],
    structureBreakdown: { hookDuration: 4, problemDuration: 7, demoDuration: 14, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'High-converting aesthetic clinic landing page with integrated WhatsApp scheduler'
  },
  {
    id: 'ai-tool-discovery',
    name: 'AI Tool Discovery',
    category: 'Discovery & Tips',
    description: 'Curated breakdown of a high-utility AI tool that replaces manual labor or expensive software.',
    hookFormula: 'This free AI tool feels illegal to know for small business owners.',
    retentionCue: 'Presenter pointing up as tool dashboard appears with animated highlight box.',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['website_recording', 'ui_screenshot'],
    idealPillars: ['ai-tools', 'productivity'],
    structureBreakdown: { hookDuration: 3, problemDuration: 6, demoDuration: 13, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'AI voice agent builder that sounds 100% human and books calendar calls'
  },
  {
    id: 'workflow-reveal',
    name: 'Workflow Reveal',
    category: 'Workflow & Systems',
    description: 'Visual blueprint walkthrough of an internal business automation pipeline with step-by-step nodes.',
    hookFormula: 'Steal this 4-step automation pipeline we use to run our agency operations.',
    retentionCue: 'Zoom in on animated node flow graph connecting Webhook -> LLM -> CRM -> WhatsApp.',
    recommendedDurationSeconds: 40,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['product_demo', 'video_clip'],
    idealPillars: ['ai-automation', 'business-growth'],
    structureBreakdown: { hookDuration: 4, problemDuration: 7, demoDuration: 18, resultDuration: 7, ctaDuration: 4 },
    sampleTopic: 'Automated invoice extraction and client onboarding SOP'
  },
  {
    id: 'mini-tutorial',
    name: 'Mini Tutorial',
    category: 'Discovery & Tips',
    description: 'Bite-sized, zero-fluff educational tutorial teaching one specific actionable AI skill.',
    hookFormula: 'How to connect your Instagram DMs to Google Sheets in 60 seconds.',
    retentionCue: 'Numbered step counter (Step 1 of 3) overlays top-left of screen.',
    recommendedDurationSeconds: 45,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['screen_recording_demo' as any, 'ui_screenshot'],
    idealPillars: ['ai-automation', 'lead-generation'],
    structureBreakdown: { hookDuration: 4, problemDuration: 6, demoDuration: 23, resultDuration: 8, ctaDuration: 4 },
    sampleTopic: 'Setting up automated keyword trigger replies in Meta Business Suite'
  },
  {
    id: 'business-automation',
    name: 'Business Automation',
    category: 'Workflow & Systems',
    description: 'Strategic analysis of business bottlenecks solved through intelligent system architecture.',
    hookFormula: 'If you still hire humans to copy-paste invoice details, you are burning capital.',
    retentionCue: 'Receipt scanning animation showing instant data population into accounting software.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'image'],
    idealPillars: ['business-growth', 'ai-automation'],
    structureBreakdown: { hookDuration: 4, problemDuration: 8, demoDuration: 13, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Automating multi-store inventory sync with AI vision receipts'
  },
  {
    id: 'case-study',
    name: 'Case Study',
    category: 'Proof & ROI',
    description: 'Real-world client implementation breakdown with verifiable operational metrics and outcomes.',
    hookFormula: 'How an orthodontic practice added 38 booked consultations without running more ads.',
    retentionCue: 'Calendar view showing rapid booked appointment slots turning solid green.',
    recommendedDurationSeconds: 50,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['website_recording', 'product_demo'],
    idealPillars: ['business-growth', 'lead-generation', 'whatsapp-automation'],
    structureBreakdown: { hookDuration: 4, problemDuration: 10, demoDuration: 22, resultDuration: 10, ctaDuration: 4 },
    sampleTopic: 'Eliminating after-hours lead drop-off for a healthcare clinic'
  },
  {
    id: 'problem-ai-solution',
    name: 'Problem → AI Solution',
    category: 'Workflow & Systems',
    description: 'Direct callout of a painful daily headache followed immediately by the automated antidote.',
    hookFormula: 'You miss 60% of inbound inquiries because you are asleep. Here is the fix.',
    retentionCue: 'Digital clock showing 11:45 PM switching to instant automated AI reply with confirmed calendar booking.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['text_only', 'ui_screenshot'],
    idealPillars: ['ai-automation', 'whatsapp-automation'],
    structureBreakdown: { hookDuration: 3, problemDuration: 8, demoDuration: 14, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Zero lead response latency during weekends and holidays'
  },
  {
    id: 'screen-recording-demo',
    name: 'Screen Recording Demo',
    category: 'Build & Demo',
    description: 'Raw, authentic screen-capture walkthrough showing exact keystrokes, dashboards, and live tools.',
    hookFormula: 'Watch our AI engine generate and schedule 30 Reels in under 90 seconds.',
    retentionCue: 'Full-screen browser recording with fast neon cursor clicks and instant batch generation.',
    recommendedDurationSeconds: 40,
    primaryVisualSource: 'website_recording',
    secondaryVisualSources: ['product_demo', 'ui_screenshot'],
    idealPillars: ['flash-builds', 'ai-tools'],
    structureBreakdown: { hookDuration: 3, problemDuration: 7, demoDuration: 20, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Behind-the-scenes walkthrough of FLASH.Ai internal social intelligence OS'
  },
  {
    id: 'three-tools-three-tips',
    name: '3 Tools / 3 Tips',
    category: 'Discovery & Tips',
    description: 'High-density, fast-paced listicle delivering maximum value and bookmarkable reference utility.',
    hookFormula: '3 AI tools every agency founder needs to install before tomorrow morning.',
    retentionCue: 'Rapid 3-tier visual card stack with kinetic sound effects and tool badges.',
    recommendedDurationSeconds: 45,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'website_recording'],
    idealPillars: ['ai-tools', 'productivity'],
    structureBreakdown: { hookDuration: 4, problemDuration: 5, demoDuration: 24, resultDuration: 8, ctaDuration: 4 },
    sampleTopic: '3 free tools to automate customer research, transcript summarization, and SOP creation'
  },
  {
    id: 'ai-news-update',
    name: 'AI News / Update',
    category: 'Insights & News',
    description: 'Practical business breakdown of breaking AI releases, explaining what it means for SMBs.',
    hookFormula: 'Meta and OpenAI just changed Instagram marketing forever. Here is what you need to know.',
    retentionCue: 'Bold news headline card transition into live practical feature test.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['website_recording', 'product_demo'],
    idealPillars: ['ai-automation', 'ai-tools'],
    structureBreakdown: { hookDuration: 4, problemDuration: 6, demoDuration: 15, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Instagram opens direct DM automation APIs for creator accounts'
  },
  {
    id: 'myth-vs-reality',
    name: 'Myth vs Reality',
    category: 'Insights & News',
    description: 'Debunking expensive industry misconceptions and presenting practical, low-cost AI alternatives.',
    hookFormula: 'Myth: AI automation requires a $50k developer budget. Reality: You can launch it today for $20.',
    retentionCue: 'Graphic stamp "MYTH" with red buzz, followed by green "REALITY" stamp with live tool demo.',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'text_only',
    secondaryVisualSources: ['product_demo', 'ui_screenshot'],
    idealPillars: ['business-growth', 'ai-automation'],
    structureBreakdown: { hookDuration: 3, problemDuration: 7, demoDuration: 12, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'Debunking the myth that small local clinics cannot afford enterprise-grade AI booking bots'
  },
  {
    id: 'quick-explainer',
    name: 'Quick Explainer',
    category: 'Discovery & Tips',
    description: 'Crisp, jargon-free explanation of an essential AI concept using real-world analogies.',
    hookFormula: 'What is an AI Agent and why will every business own one by the end of 2026?',
    retentionCue: 'Simple kinetic motion diagram: Chatbot (reactive) vs AI Agent (takes autonomous action).',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['visual_placeholder', 'text_only'],
    idealPillars: ['ai-automation', 'ai-tools'],
    structureBreakdown: { hookDuration: 3, problemDuration: 7, demoDuration: 12, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'Difference between static chatbots and autonomous goal-seeking AI agents'
  }
];

export class ReelFormatEngine {
  private formatHistory: ReelFormatId[] = [];
  private maxHistoryLength = 15;

  public getAllFormats(): ReelFormatDefinition[] {
    return [...REEL_FORMATS];
  }

  public getFormatById(id: string): ReelFormatDefinition | undefined {
    return REEL_FORMATS.find((f) => f.id === id);
  }

  /**
   * Intelligently selects the next format ensuring:
   * 1. No immediate repeats (cooldown buffer of last 5 formats)
   * 2. Categorical rotation (avoids 2 of the same category back-to-back)
   * 3. Relevance to the specific content pillar if provided
   */
  public selectNextFormat(params?: {
    preferredFormatId?: string;
    pillarId?: string;
    recentFormatIds?: string[];
  }): ReelFormatDefinition {
    // 1. Explicit user override
    if (params?.preferredFormatId) {
      const explicit = this.getFormatById(params.preferredFormatId);
      if (explicit) {
        this.recordFormatUsed(explicit.id);
        return explicit;
      }
    }

    const effectiveHistory = params?.recentFormatIds && params.recentFormatIds.length > 0
      ? params.recentFormatIds
      : this.formatHistory;

    const cooldownList = effectiveHistory.slice(-5);
    const lastCategory = effectiveHistory.length > 0
      ? this.getFormatById(effectiveHistory[effectiveHistory.length - 1])?.category
      : null;

    // Filter candidate pool
    let candidates = REEL_FORMATS.filter((f) => !cooldownList.includes(f.id));

    // If pillar provided, prioritize matching pillars
    if (params?.pillarId) {
      const pillarMatches = candidates.filter((f) => f.idealPillars.includes(params.pillarId!));
      if (pillarMatches.length > 0) {
        candidates = pillarMatches;
      }
    }

    // Try to avoid repeating the same category consecutive times
    if (lastCategory && candidates.length > 1) {
      const categoryDiverse = candidates.filter((f) => f.category !== lastCategory);
      if (categoryDiverse.length > 0) {
        candidates = categoryDiverse;
      }
    }

    // Fallback if all formats are in cooldown
    if (candidates.length === 0) {
      candidates = REEL_FORMATS;
    }

    // Pick pseudorandomly from weighted candidate pool
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    this.recordFormatUsed(selected.id);
    return selected;
  }

  public recordFormatUsed(formatId: ReelFormatId): void {
    this.formatHistory.push(formatId);
    if (this.formatHistory.length > this.maxHistoryLength) {
      this.formatHistory.shift();
    }
  }

  public getRecentHistory(): ReelFormatId[] {
    return [...this.formatHistory];
  }

  public resetHistory(): void {
    this.formatHistory = [];
  }
}

export const reelFormatEngine = new ReelFormatEngine();
