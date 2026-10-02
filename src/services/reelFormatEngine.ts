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
    description: 'First-person build reveal showcasing an AI workflow, script, or automated tool built in hours.',
    hookFormula: 'I built an autonomous document analysis tool in 48 hours—here is how it works.',
    retentionCue: 'Split screen of developer terminal and working live web interface with instant results.',
    recommendedDurationSeconds: 40,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'website_recording'],
    idealPillars: ['flash-builds', 'ai-automation', 'ai-tools'],
    structureBreakdown: { hookDuration: 4, problemDuration: 8, demoDuration: 18, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Building a local document question-answering assistant with open-source models'
  },
  {
    id: 'before-after',
    name: 'Before / After',
    category: 'Proof & ROI',
    description: 'High-contrast visual juxtaposition of chaotic manual operations vs streamlined AI execution.',
    hookFormula: 'Before: 4 hours formatting messy spreadsheet columns. After: 3 seconds with AI.',
    retentionCue: 'Fast split screen comparison: Stressed manual spreadsheet editing vs instant structured charts.',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'screen_recording_demo' as any,
    secondaryVisualSources: ['ui_screenshot', 'video_clip'],
    idealPillars: ['ai-automation', 'ai-tools'],
    structureBreakdown: { hookDuration: 3, problemDuration: 6, demoDuration: 13, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'Messy raw CSV data transformed into clean executive summary in 3 seconds'
  },
  {
    id: 'ai-automation-demo',
    name: 'AI Automation Demo',
    category: 'Build & Demo',
    description: 'Live end-to-end trigger-to-completion demonstration of an automated AI workflow in action.',
    hookFormula: 'Watch what happens when an unstructured email arrives at our AI pipeline.',
    retentionCue: 'Live cursor clicking trigger, followed by instant multi-step LLM extraction and database sync.',
    recommendedDurationSeconds: 45,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'website_recording'],
    idealPillars: ['ai-automation', 'flash-builds'],
    structureBreakdown: { hookDuration: 4, problemDuration: 8, demoDuration: 21, resultDuration: 8, ctaDuration: 4 },
    sampleTopic: 'Multi-step webhook extracting parameters, validating schema, and dispatching results'
  },
  {
    id: 'website-showcase',
    name: 'Website Showcase',
    category: 'Build & Demo',
    description: 'Interactive feature tour of a useful AI web tool or modern developer interface.',
    hookFormula: 'This new AI website turns raw text into interactive UI components in real-time.',
    retentionCue: 'Smooth viewport scroll showing prompt entry generating live interactive UI canvas.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'website_recording',
    secondaryVisualSources: ['ui_screenshot', 'product_demo'],
    idealPillars: ['ai-tools', 'practical-tutorials'],
    structureBreakdown: { hookDuration: 4, problemDuration: 7, demoDuration: 14, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Top useful AI websites that generate fully responsive UI from natural language prompts'
  },
  {
    id: 'ai-tool-discovery',
    name: 'AI Tool Discovery',
    category: 'Discovery & Tips',
    description: 'Curated breakdown of a high-utility AI tool that saves hours of manual work.',
    hookFormula: 'This free AI tool feels like an unfair productivity advantage in 2026.',
    retentionCue: 'Presenter pointing up as tool dashboard appears with animated highlight box.',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['website_recording', 'ui_screenshot'],
    idealPillars: ['ai-tools', 'practical-tutorials'],
    structureBreakdown: { hookDuration: 3, problemDuration: 6, demoDuration: 13, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'High-speed AI voice transcription tool that auto-generates structured markdown notes'
  },
  {
    id: 'workflow-reveal',
    name: 'Workflow Reveal',
    category: 'Workflow & Systems',
    description: 'Visual blueprint walkthrough of an internal AI pipeline with step-by-step nodes.',
    hookFormula: 'Steal this 4-step AI workflow to research and summarize 50 papers in 2 minutes.',
    retentionCue: 'Zoom in on animated node flow graph connecting Ingestion -> Embedding -> LLM -> Export.',
    recommendedDurationSeconds: 40,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['product_demo', 'video_clip'],
    idealPillars: ['ai-automation', 'flash-builds'],
    structureBreakdown: { hookDuration: 4, problemDuration: 7, demoDuration: 18, resultDuration: 7, ctaDuration: 4 },
    sampleTopic: 'Automated research pipeline from arXiv search to structured executive brief'
  },
  {
    id: 'mini-tutorial',
    name: 'Mini Tutorial',
    category: 'Discovery & Tips',
    description: 'Bite-sized, zero-fluff educational tutorial teaching one specific actionable AI skill.',
    hookFormula: 'How to extract structured JSON from messy PDFs in 60 seconds with AI.',
    retentionCue: 'Numbered step counter (Step 1 of 3) overlays top-left of screen.',
    recommendedDurationSeconds: 45,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['screen_recording_demo' as any, 'ui_screenshot'],
    idealPillars: ['practical-tutorials', 'ai-tools'],
    structureBreakdown: { hookDuration: 4, problemDuration: 6, demoDuration: 23, resultDuration: 8, ctaDuration: 4 },
    sampleTopic: 'Using structured output schemas with modern LLM APIs in 3 simple steps'
  },
  {
    id: 'business-automation',
    name: 'Business Automation',
    category: 'Workflow & Systems',
    description: 'Analysis of tedious operational bottlenecks solved through intelligent system architecture.',
    hookFormula: 'Stop manually re-typing unstructured invoices. Here is the modern AI pipeline.',
    retentionCue: 'Receipt scanning animation showing instant data extraction into structured database.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'image'],
    idealPillars: ['ai-automation', 'flash-builds'],
    structureBreakdown: { hookDuration: 4, problemDuration: 8, demoDuration: 13, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Automating multi-format document extraction with multi-modal AI vision'
  },
  {
    id: 'case-study',
    name: 'Case Study',
    category: 'Proof & ROI',
    description: 'Real-world AI implementation breakdown with verifiable benchmarks and performance metrics.',
    hookFormula: 'How this engineering team cut research cycle times by 80% using local embeddings.',
    retentionCue: 'Benchmark graph showing latency drop from 45 minutes to 18 seconds.',
    recommendedDurationSeconds: 50,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['website_recording', 'product_demo'],
    idealPillars: ['ai-tools', 'flash-builds'],
    structureBreakdown: { hookDuration: 4, problemDuration: 10, demoDuration: 22, resultDuration: 10, ctaDuration: 4 },
    sampleTopic: 'Replacing manual data categorization with zero-shot classification pipelines'
  },
  {
    id: 'problem-ai-solution',
    name: 'Problem → AI Solution',
    category: 'Workflow & Systems',
    description: 'Direct callout of a painful daily productivity bottleneck followed by the AI solution.',
    hookFormula: 'You spend 10 hours a week summarizing meetings and tracking tasks. Here is the fix.',
    retentionCue: 'Audio waveform converting in real-time into organized action items and Jira tickets.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['text_only', 'ui_screenshot'],
    idealPillars: ['ai-automation', 'ai-tools'],
    structureBreakdown: { hookDuration: 3, problemDuration: 8, demoDuration: 14, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Eliminating manual meeting notes with instant transcript-to-action-item workflows'
  },
  {
    id: 'screen-recording-demo',
    name: 'Screen Recording Demo',
    category: 'Build & Demo',
    description: 'Raw, authentic screen-capture walkthrough showing exact keystrokes, dashboards, and live tools.',
    hookFormula: 'Watch our AI engine render a full 9:16 vertical video with audio in 12 seconds.',
    retentionCue: 'Full-screen browser recording with fast neon timeline playback and synced waveform.',
    recommendedDurationSeconds: 40,
    primaryVisualSource: 'website_recording',
    secondaryVisualSources: ['product_demo', 'ui_screenshot'],
    idealPillars: ['flash-builds', 'ai-tools'],
    structureBreakdown: { hookDuration: 3, problemDuration: 7, demoDuration: 20, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'Behind-the-scenes walkthrough of FLASH.Ai automated video rendering pipeline'
  },
  {
    id: 'three-tools-three-tips',
    name: '3 Tools / 3 Tips',
    category: 'Discovery & Tips',
    description: 'High-density, fast-paced listicle delivering maximum value and bookmarkable reference utility.',
    hookFormula: '3 AI tools that will save you 15 hours this week.',
    retentionCue: 'Rapid 3-tier visual card stack with kinetic sound effects and tool badges.',
    recommendedDurationSeconds: 45,
    primaryVisualSource: 'product_demo',
    secondaryVisualSources: ['ui_screenshot', 'website_recording'],
    idealPillars: ['ai-tools', 'practical-tutorials'],
    structureBreakdown: { hookDuration: 4, problemDuration: 5, demoDuration: 24, resultDuration: 8, ctaDuration: 4 },
    sampleTopic: '3 free AI tools to automate data extraction, voice transcription, and visual mockups'
  },
  {
    id: 'ai-news-update',
    name: 'AI News / Update',
    category: 'Insights & News',
    description: 'Practical breakdown of breaking AI releases, model benchmarks, and what they mean.',
    hookFormula: 'A major new AI model update just dropped. Here is what changed and why it matters.',
    retentionCue: 'Bold news headline card transition into live practical feature test.',
    recommendedDurationSeconds: 35,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['website_recording', 'product_demo'],
    idealPillars: ['ai-news-update', 'ai-tools'],
    structureBreakdown: { hookDuration: 4, problemDuration: 6, demoDuration: 15, resultDuration: 6, ctaDuration: 4 },
    sampleTopic: 'New multimodal reasoning model benchmarked on coding and spreadsheet tasks'
  },
  {
    id: 'myth-vs-reality',
    name: 'Myth vs Reality',
    category: 'Insights & News',
    description: 'Debunking expensive industry misconceptions and presenting practical, accessible AI alternatives.',
    hookFormula: 'Myth: You need a cluster of GPUs to run local AI. Reality: Modern quantized models run on your laptop.',
    retentionCue: 'Graphic stamp "MYTH" with red buzz, followed by green "REALITY" stamp with live tool demo.',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'text_only',
    secondaryVisualSources: ['product_demo', 'ui_screenshot'],
    idealPillars: ['ai-explainers', 'ai-tools'],
    structureBreakdown: { hookDuration: 3, problemDuration: 7, demoDuration: 12, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'Debunking the myth that local AI models require massive enterprise server clusters'
  },
  {
    id: 'quick-explainer',
    name: 'Quick Explainer',
    category: 'Discovery & Tips',
    description: 'Crisp, jargon-free explanation of an essential AI concept using real-world analogies.',
    hookFormula: 'What is an AI Agent and how does it actually make decisions autonomously?',
    retentionCue: 'Simple kinetic motion diagram: Chatbot (reactive) vs AI Agent (takes autonomous action).',
    recommendedDurationSeconds: 30,
    primaryVisualSource: 'ui_screenshot',
    secondaryVisualSources: ['visual_placeholder', 'text_only'],
    idealPillars: ['ai-explainers', 'ai-tools'],
    structureBreakdown: { hookDuration: 3, problemDuration: 7, demoDuration: 12, resultDuration: 5, ctaDuration: 3 },
    sampleTopic: 'Difference between static prompt-response chatbots and autonomous goal-seeking AI agents'
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
