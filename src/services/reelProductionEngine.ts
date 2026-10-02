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
    const pillarId = params.pillarId || 'ai-tools';
    const targetAudience = params.targetAudience || 'Creators, developers & tech enthusiasts';
    const targetDuration = Math.min(60, Math.max(20, params.targetDurationSeconds || 30));

    // 1. Select Format using smart rotation engine
    const format = params.formatId
      ? reelFormatEngine.getFormatById(params.formatId) || reelFormatEngine.selectNextFormat({ pillarId })
      : reelFormatEngine.selectNextFormat({ pillarId });

    // 2. Select CTA (Default to educational/informative conclusion)
    const cta = params.cta || FLASH_AI_BRAND.ctaStyles[0].label;

    // 3. Craft tailored 5-block scenes based on format and topic
    const scenes = this.buildScenes(topic, format, targetDuration, cta);
    const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

    const hook = scenes[0]?.voiceoverText || `Here is what you need to know about ${topic}.`;
    const hookRetentionCue = scenes[0]?.visualInstruction || format.retentionCue;
    const conceptSummary = `${format.name} breakdown exploring ${topic} with practical visual insights.`;

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
        textOverlay: `The Challenge: Hours Lost on Manual ${this.extractCoreSubject(topic)}`,
        voiceoverText: `Keeping up with modern AI tools and manual workflows takes hours of tedious testing every single week.`,
        visualInstruction: 'Multi-window desktop interface showing tab overload and complex manual file handling.',
        transition: 'slide_left',
        audioInstruction: 'Subtle tension drone with quick UI transition sound effect.'
      },

      // 3. DEMO / VALUE (00:09 - ~00:25)
      {
        sceneNumber: 3,
        block: 'DEMO_VALUE',
        durationSeconds: dDemo,
        visualSource: format.primaryVisualSource === 'website_recording' ? 'website_recording' : 'product_demo',
        textOverlay: `AI Capabilities: Instant Processing & Smart Workflows`,
        voiceoverText: `Here is how modern AI models solve this directly. With clean prompt structures and connected nodes, tasks execute in seconds.`,
        visualInstruction: 'Live screen recording showing instant AI response with interactive canvas and structured output.',
        transition: 'zoom_in',
        audioInstruction: 'Fast keyboard clatter SFX, upbeat tech riser, clear energetic voiceover pacing.'
      },

      // 4. RESULT / PAYOFF (00:25 - ~00:31)
      {
        sceneNumber: 4,
        block: 'RESULT_PAYOFF',
        durationSeconds: dResult,
        visualSource: 'image',
        textOverlay: `The Takeaway: 10x Faster Output • Zero Manual Friction`,
        voiceoverText: `The result is cleaner workflows, structured data in seconds, and hours saved every single week.`,
        visualInstruction: 'High-contrast summary card showing 10x speedup metrics and polished final artifact.',
        transition: 'fade',
        audioInstruction: 'Positive success chime, bright harmonic resolution.'
      },

      // 5. CTA (00:31 - ~00:35)
      {
        sceneNumber: 5,
        block: 'CTA',
        durationSeconds: dCta,
        visualSource: 'visual_placeholder',
        textOverlay: `💡 ${cta} | @flash_ai_digital`,
        voiceoverText: `These tools are moving AI directly into everyday workflows. Follow @flash_ai_digital for daily AI discoveries.`,
        visualInstruction: 'Clean cyber card with highlighted takeaway badge and @flash_ai_digital handle.',
        transition: 'pulse',
        audioInstruction: 'Harmonic resolution chime with clean audio fade-out.'
      }
    ];

    return scenes;
  }

  private generateHookOverlay(topic: string, format: ReelFormatDefinition): string {
    switch (format.id) {
      case 'i-built-this-with-ai':
        return `⚡ Built With AI in Under 48 Hours`;
      case 'before-after':
        return `⚠️ Manual Work vs ⚡ AI in 3 Seconds`;
      case 'ai-automation-demo':
        return `👀 Watch This AI Workflow in Action`;
      case 'website-showcase':
        return `🚀 Useful AI Website You Need to Try`;
      case 'ai-tool-discovery':
        return `🔥 5 AI Tools That Save Hours`;
      case 'workflow-reveal':
        return `📂 Inside This 4-Step AI Pipeline`;
      case 'three-tools-three-tips':
        return `🛠️ 3 Free AI Tools to Try This Week`;
      case 'myth-vs-reality':
        return `❌ AI Myth vs ✅ Real AI Capability`;
      default:
        return `💡 How AI Solves ${this.extractCoreSubject(topic)}`;
    }
  }

  private generateHookVoiceover(topic: string, format: ReelFormatDefinition): string {
    switch (format.id) {
      case 'i-built-this-with-ai':
        return `Here is how you can build an automated AI workflow for ${this.extractCoreSubject(topic)} in under 48 hours.`;
      case 'before-after':
        return `Before: hours of repetitive manual data formatting. After: 3 seconds with AI.`;
      case 'ai-automation-demo':
        return `Watch what happens when you connect this AI model directly to your daily workflow.`;
      case 'website-showcase':
        return `This useful AI website lets you build interactive tools and workflows with plain English.`;
      case 'ai-tool-discovery':
        return `These practical AI tools feel like an unfair productivity advantage in 2026.`;
      case 'workflow-reveal':
        return `Here is the exact 4-step AI workflow to automate document analysis and research.`;
      case 'three-tools-three-tips':
        return `Here are 3 practical AI tools you should start using to speed up your everyday work.`;
      case 'myth-vs-reality':
        return `The biggest myth about modern AI is that you need complex infrastructure. Here is the reality.`;
      default:
        return `Here is how modern AI tools are transforming ${this.extractCoreSubject(topic)} in 2026.`;
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

Here is how modern AI models and automated workflows are transforming everyday productivity:

⚡ 1. Rapid Setup: Plug directly into existing tools without complex coding.
⚡ 2. Intelligent Processing: AI parses unstructured documents, code, and text in seconds.
⚡ 3. Real Productivity: Get hours back every single week.

Format: ${format.name}
Curated by: FLASH.Ai (@flash_ai_digital)

📌 ${cta}
Follow @flash_ai_digital for daily AI tools, model updates & practical tutorials!`;
  }

  private generateHashtags(pillarId: string, _formatId?: string): { niche: string[]; broad: string[]; viral: string[] } {
    const nicheMap: Record<string, string[]> = {
      'ai-tools': ['#AITools', '#ProductivityTools', '#UsefulWebsites', '#FLASHai'],
      'ai-automation': ['#AIAutomation', '#WorkflowAutomation', '#AgenticAI', '#FLASHai'],
      'ai-news-update': ['#AINews', '#ModelUpdates', '#TechTrends', '#FLASHai'],
      'practical-tutorials': ['#AITutorial', '#PromptEngineering', '#HowToAI', '#FLASHai'],
      'ai-explainers': ['#AIExplained', '#ArtificialIntelligence', '#TechTips', '#FLASHai'],
      'flash-builds': ['#TechStack', '#SoftwareEngineering', '#DeveloperTools', '#FLASHai']
    };

    return {
      niche: nicheMap[pillarId] || ['#AITools', '#AIAutomation', '#FLASHai'],
      broad: ['#ArtificialIntelligence', '#MachineLearning', '#ProductivityHacks'],
      viral: ['#TechReels', '#FutureOfWork', '#AIEveryday']
    };
  }
}

export const reelProductionEngine = new ReelProductionEngine();
