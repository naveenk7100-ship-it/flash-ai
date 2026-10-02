/**
 * FLASH.Ai Semantic AI Topic & Script Template Selector
 * 
 * Analyzes topic semantics, natural user script sentences, keywords, entities, numbers,
 * and content intent to select the optimal visual template from the 12 clean AI formats.
 */

import type {
  ReelTemplateId,
  TemplateSelectionInfo
} from '../types/reelProduction.ts';
import { reelTemplateRegistry } from './reelTemplateRegistry.ts';

export interface TopicAnalysisInput {
  topic?: string;
  script?: string;
  hook?: string;
  formatId?: string;
  pillarId?: string;
  category?: string;
  targetAudience?: string;
  cta?: string;
  hasScreenRecording?: boolean;
  hasStats?: boolean;
  hasStepNumbers?: boolean;
}

interface TemplateScoreCandidate {
  templateId: ReelTemplateId;
  score: number;
  matchedKeywords: string[];
  reasons: string[];
  visualHighlights: string[];
  sceneStructure: string[];
}

export class TopicTemplateSelector {
  /**
   * Analyzes content parameters and automatically selects the most suitable template with detailed reasoning.
   */
  public selectTemplate(input: TopicAnalysisInput): TemplateSelectionInfo {
    const topic = (input.topic || '').trim();
    const script = (input.script || '').trim();
    const hook = (input.hook || '').trim();
    const formatId = (input.formatId || '').toLowerCase().trim();
    const fullText = `${topic} ${script} ${hook} ${formatId}`.toLowerCase();
    const topicOnly = `${topic} ${hook}`.toLowerCase();

    // Candidates initialization
    const candidates: Record<string, TemplateScoreCandidate> = {
      'product-demo': {
        templateId: 'product-demo',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Interactive UI Walkthrough', 'Prompt Input to Output Demo', 'Feature Callouts', 'Natural Takeaway'],
        sceneStructure: ['Hook', 'Interface Overview', 'Live Feature Demo', 'Output Result', 'Summary Takeaway']
      },
      'tool-showcase': {
        templateId: 'tool-showcase',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Hero Tool Spotlight', 'Core Feature Badges', 'Everyday Use-Cases', 'Clean Wrap-up'],
        sceneStructure: ['Hook', 'Hero Spotlight', '3 Capabilities', 'Best Use Cases', 'Wrap-up']
      },
      'news-update': {
        templateId: 'news-update',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Breaking Headline Card', 'Verified Source Badge', '3-Point Ticker', 'Industry Impact'],
        sceneStructure: ['Headline Hook', 'Verified Context', 'The Development', 'Industry Impact', 'Summary']
      },
      'ai-update': {
        templateId: 'ai-update',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Model Update Canvas', 'New Capabilities Demo', 'Version Comparison', 'Everyday Benefits'],
        sceneStructure: ['Update Announcement', 'What Changed', 'Live Feature Demo', 'Key Improvements', 'Conclusion']
      },
      'explainer': {
        templateId: 'explainer',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Concept Mental Model', 'How It Works Diagram', 'Why It Matters Card', 'Practical Takeaway'],
        sceneStructure: ['Concept Hook', 'What It Is', 'How It Works', 'Why It Matters', 'Clear Takeaway']
      },
      'how-to': {
        templateId: 'how-to',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Step 1 2 3 Progression', 'Exact UI Actions', 'Zero Jargon Directions', 'Verified Result'],
        sceneStructure: ['Hook', 'Step 1 Setup', 'Step 2 Action', 'Step 3 Execute', 'Final Outcome']
      },
      'listicle': {
        templateId: 'listicle',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Numbered Badges (1, 2, 3)', 'Rapid Visual Switches', 'Instant Utility Summary', 'Resource Review'],
        sceneStructure: ['List Hook', 'Tool 1 Spotlight', 'Tool 2 Spotlight', 'Tool 3 Spotlight', 'Summary Card']
      },
      'comparison': {
        templateId: 'comparison',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Split-Screen Matchup', 'Side-by-Side Specs', 'Pros & Cons Matrix', 'Best Use Winner'],
        sceneStructure: ['Matchup Hook', 'Key Differences', 'Side-by-Side Test', 'Which One to Use', 'Conclusion']
      },
      'before-after': {
        templateId: 'before-after',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Manual Frustration Card', 'Instant AI Transformation', 'Time/Effort Contrast', 'Clean Output'],
        sceneStructure: ['Hook', 'The Old Manual Way', 'The AI Transformation', 'Time Saved', 'Summary']
      },
      'automation-workflow': {
        templateId: 'automation-workflow',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Webhook Trigger Node', 'AI Processing Layer', 'Output Dispatch Node', 'Hands-Free Demo'],
        sceneStructure: ['Workflow Hook', 'Trigger Intake', 'AI Processing Node', 'Automated Action', 'Result']
      },
      'data-insight': {
        templateId: 'data-insight',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Benchmark Bar Charts', 'Tokens/Sec Speed Metrics', 'Accuracy Percentages', 'Evidence Summary'],
        sceneStructure: ['Finding Hook', 'Benchmark Test', 'Data Breakdown', 'What Numbers Mean', 'Takeaway']
      },
      'cinematic-explainer': {
        templateId: 'cinematic-explainer',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['High-Concept Visuals', 'Macro Industry Perspective', 'Clean Minimalist Style', 'Thoughtful Outro'],
        sceneStructure: ['Big Idea Hook', 'Macro Context', 'Deep Shift', 'Creator Impact', 'Closing Thought']
      }
    };

    // 1. Explicit formatId matching if provided
    if (formatId) {
      if (formatId.includes('demo') || formatId.includes('tool-discovery')) {
        candidates['product-demo'].score += 50;
        candidates['product-demo'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('showcase') || formatId.includes('website')) {
        candidates['tool-showcase'].score += 50;
        candidates['tool-showcase'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('news') || formatId.includes('trend')) {
        candidates['news-update'].score += 50;
        candidates['news-update'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('update')) {
        candidates['ai-update'].score += 50;
        candidates['ai-update'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('how-to') || formatId.includes('tutorial')) {
        candidates['how-to'].score += 50;
        candidates['how-to'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('list') || formatId.includes('top-5') || formatId.includes('three-tools')) {
        candidates['listicle'].score += 50;
        candidates['listicle'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('vs') || formatId.includes('compare') || formatId.includes('myth')) {
        candidates['comparison'].score += 50;
        candidates['comparison'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('before-after')) {
        candidates['before-after'].score += 50;
        candidates['before-after'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('workflow')) {
        candidates['automation-workflow'].score += 50;
        candidates['automation-workflow'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('case-study') || formatId.includes('data')) {
        candidates['data-insight'].score += 50;
        candidates['data-insight'].reasons.push(`Direct matching with format '${formatId}'`);
      }
    }

    // 2. High-Precedence Feature Discrimination

    // LISTICLE: e.g. "3 Free AI Websites", "5 Tools", "Number one... Number two"
    const isListicle = Boolean(
      /\b(\d+\s*(free\s*)?(ai\s*)?(websites|tools|apps|prompts|tips|ways|resources)|top\s*\d|\d\s*best)\b/i.test(fullText) ||
      /\b(number\s*(one|1)|number\s*(two|2)|number\s*(three|3))\b/i.test(script)
    );
    if (isListicle) {
      candidates['listicle'].score += 65;
      candidates['listicle'].matchedKeywords.push('curated-list', 'countdown', 'multiple-tools');
      candidates['listicle'].reasons.push('Contains numbered list structure (e.g. 3 tools / 5 websites)');
    }

    // AUTOMATION WORKFLOW: e.g. "AI Research Workflow with Webhooks", "Automation Pipeline", "Node one... Node two"
    const isAutomation = Boolean(
      /\b(workflow|pipeline|webhooks?|automation|n8n|zapier|make\.com|trigger|autonomous\s*agent|multi-agent)\b/i.test(topicOnly) ||
      (/\b(node\s*(one|1|two|2)|trigger|webhook)\b/i.test(script) && /\b(workflow|pipeline|automation)\b/i.test(fullText))
    );
    if (isAutomation) {
      candidates['automation-workflow'].score += 65;
      candidates['automation-workflow'].matchedKeywords.push('workflow', 'pipeline', 'webhook', 'automation');
      candidates['automation-workflow'].reasons.push('Demonstrates connected automation nodes or pipelines');
    }

    // COMPARISON: e.g. "Claude 3.5 Sonnet vs OpenAI o1", "ChatGPT vs Gemini"
    const isComparison = Boolean(
      /\b(vs\.?|versus|compared\s*to|comparison|better\s*than|difference\s*between|which\s*is\s*better)\b/i.test(fullText)
    );
    if (isComparison) {
      candidates['comparison'].score += 60;
      candidates['comparison'].matchedKeywords.push('comparison', 'versus', 'matchup');
      candidates['comparison'].reasons.push('Contains side-by-side comparison cues (e.g. Tool A vs Tool B)');
    }

    // BEFORE-AFTER
    const isBeforeAfter = Boolean(
      /\b(before\s*(and|vs|\/)\s*after|old\s*way\s*vs|manual\s*vs\s*ai|switch\s*from|traditional\s*way)\b/i.test(fullText)
    );
    if (isBeforeAfter) {
      candidates['before-after'].score += 55;
      candidates['before-after'].matchedKeywords.push('before-after', 'manual-vs-ai', 'transformation');
      candidates['before-after'].reasons.push('Contains clear before vs after transformation theme');
    }

    // AI PRODUCT UPDATE: Canvas, Artifacts, Workspaces, Product Update
    const isAIUpdate = Boolean(
      /\b(canvas|artifacts|product\s*update|feature\s*update|new\s*feature|workspace|released\s*an\s*official\s*(canvas|update|feature))\b/i.test(fullText)
    );
    if (isAIUpdate && !isListicle && !isComparison) {
      candidates['ai-update'].score += 55;
      candidates['ai-update'].matchedKeywords.push('product-update', 'canvas-workspace', 'new-feature');
      candidates['ai-update'].reasons.push('Major product feature expansion or interactive canvas workspace');
    }

    // NEWS UPDATE: Breaking company announcement or major model launch
    const isNews = Boolean(
      /\b(officially\s*(releases|released|launches|launched|announced)|breaking|news|just\s*(launched|released|unveiled)|announcement|today)\b/i.test(topicOnly) ||
      /\b(just\s*officially\s*(launched|released)|announced\s*today)\b/i.test(script)
    );
    if (isNews && !isListicle && !isAutomation && !isComparison && !isAIUpdate) {
      candidates['news-update'].score += 55;
      candidates['news-update'].matchedKeywords.push('breaking-news', 'announcement', 'industry-update');
      candidates['news-update'].reasons.push('Breaking industry development or company announcement');
    }

    // HOW-TO TUTORIAL: e.g. "How to connect...", "Step 1... Step 2" (when not an automation workflow)
    const isHowTo = Boolean(
      (/\b(how\s*to|tutorial|guide|walkthrough|set\s*up|connect|install)\b/i.test(topicOnly) ||
      /\b(step\s*(one|1|two|2|three|3))\b/i.test(script)) && !isAutomation
    );
    if (isHowTo) {
      candidates['how-to'].score += 50;
      candidates['how-to'].matchedKeywords.push('how-to', 'tutorial', 'step-by-step');
      candidates['how-to'].reasons.push('Actionable step-by-step tutorial intent');
    }

    // DATA & BENCHMARK INSIGHT: e.g. Benchmark speed tests, tokens/sec evals
    const isData = Boolean(
      /\b(benchmark\s*(test|results?|evals?)|accuracy\s*test|speed\s*test|reasoning\s*score|evals?\s*show)\b/i.test(topicOnly)
    );
    if (isData && !isNews) {
      candidates['data-insight'].score += 50;
      candidates['data-insight'].matchedKeywords.push('benchmark', 'tokens-sec', 'speed', 'accuracy');
      candidates['data-insight'].reasons.push('Contains quantitative benchmark statistics or speed metrics');
    }

    // PRODUCT DEMO: e.g. Perplexity Pro Search, Cursor AI, UI Walkthrough
    const isProductDemo = Boolean(
      /\b(search\s*bar|pro\s*search|deep\s*research|interactive\s*prompt|generate(s)?|turn(s)?\s*(a\s*)?text\s*into)\b/i.test(fullText)
    );
    if (isProductDemo && !isListicle && !isComparison && !isNews && !isAutomation) {
      candidates['product-demo'].score += 45;
      candidates['product-demo'].matchedKeywords.push('tool-demo', 'ui-walkthrough', 'interactive');
      candidates['product-demo'].reasons.push('Focused on hands-on software interaction and output generation');
    }

    // CINEMATIC / MACRO TREND EXPLAINER: e.g. "becoming easier to use", "future of work", "paradigm shift", "evolution"
    const isCinematic = Boolean(
      /\b(becoming|easier\s*to\s*use|everyday\s*work|future\s*of|evolution|trend|industry\s*shift|paradigm|transforming|landscape)\b/i.test(topicOnly) ||
      /\b(shift\s*makes\s*practical\s*ai|paradigm\s*shift|accessible\s*directly\s*inside\s*daily\s*workflows)\b/i.test(script)
    );
    if (isCinematic && !isListicle && !isComparison && !isNews) {
      candidates['cinematic-explainer'].score += 55;
      candidates['cinematic-explainer'].matchedKeywords.push('macro-trend', 'easier-to-use', 'everyday-work', 'industry-shift');
      candidates['cinematic-explainer'].reasons.push('Analyzes the broader evolution of AI tools becoming accessible for everyday knowledge workers');
    }

    // TOOL SHOWCASE: e.g. "3 Capabilities", "Everyday AI Tools", "Feature Spotlight"
    const isToolShowcase = Boolean(
      /\b(showcase|spotlight|useful\s*ai\s*(tool|website|app)|everyday\s*tool)\b/i.test(fullText)
    );
    if (isToolShowcase && !isListicle && !isComparison && !isNews) {
      candidates['tool-showcase'].score += 45;
      candidates['tool-showcase'].matchedKeywords.push('tool-showcase', 'spotlight', 'everyday-tools');
      candidates['tool-showcase'].reasons.push('Spotlights key everyday capabilities and practical applications');
    }

    // EXPLAINER: e.g. "What is Context Window", "How RAG Works"
    const isExplainer = Boolean(
      /\b(what\s*is|how\s*(it|ai)\s*works|why\s*(it|this)\s*matters|explained|concept|rag|context\s*window)\b/i.test(topicOnly)
    );
    if (isExplainer) {
      candidates['explainer'].score += 40;
      candidates['explainer'].matchedKeywords.push('concept-explainer', 'what-is', 'how-it-works');
      candidates['explainer'].reasons.push('Educational breakdown of core AI concept');
    }

    // Rank candidates
    const sorted = Object.values(candidates).sort((a, b) => b.score - a.score);
    const winner = sorted[0] || candidates['product-demo'];

    const templateDef = reelTemplateRegistry.getTemplateById(winner.templateId);
    const confidence = Math.min(0.99, Math.max(0.85, winner.score / 60));
    const reasonText = winner.reasons.length > 0 ? winner.reasons.join('. ') : templateDef.description;

    return {
      templateId: templateDef.id,
      templateName: templateDef.name,
      category: templateDef.category,
      confidence,
      reason: reasonText,
      matchedKeywords: winner.matchedKeywords,
      visualHighlights: winner.visualHighlights,
      sceneStructure: winner.sceneStructure,
      selectedAt: new Date().toISOString()
    };
  }
}

export const topicTemplateSelector = new TopicTemplateSelector();
