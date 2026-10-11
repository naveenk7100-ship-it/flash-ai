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
      // 5 Cohesive Distinct Presentation Styles
      'cinematic-storytelling': {
        templateId: 'cinematic-storytelling',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Atmospheric Dark Slate Aesthetic', 'Layered Glassmorphic Depth', 'Macro Industry Shift', 'High-Impact Takeaway'],
        sceneStructure: ['Vision Hook', 'Current State', 'Paradigm Shift', 'Real-World Impact', 'Closing Thought']
      },
      'clean-editorial': {
        templateId: 'clean-editorial',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Refined Editorial Typography', 'Structured Numbered Cards (01, 02, 03)', 'Concept Mental Models', 'Zero-Jargon Takeaway'],
        sceneStructure: ['Editorial Hook', '01 Core Principle', '02 Mental Model', '03 Practical Benefit', 'Conclusion']
      },
      'product-workflow-demo': {
        templateId: 'product-workflow-demo',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Real-Time Interface Interaction', 'Glide Cursor & Action Pulses', 'Split-Screen Live Workspace', 'Zero-Friction Workflow'],
        sceneStructure: ['Hook', 'Interface Overview', 'Live Prompt Execution', 'Interactive Result', 'Takeaway']
      },
      'developer-studio': {
        templateId: 'developer-studio',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Dark IDE with Syntax Highlighting', 'Real Terminal CLI Execution ($)', 'Execution Latency Badge', 'Verified GitHub Attribution'],
        sceneStructure: ['Code Hook', 'Terminal Command ($)', 'Code Implementation', 'Execution Benchmark', 'GitHub Takeaway']
      },
      'trend-breakdown': {
        templateId: 'trend-breakdown',
        score: 10,
        matchedKeywords: [],
        reasons: [],
        visualHighlights: ['Milestone Progression Timeline', 'Side-by-Side Comparison Bars', 'Verified Source Badges', 'Market Trajectory'],
        sceneStructure: ['Trend Hook', 'Milestone Timeline', 'Side-by-Side Specs', 'Speed & Accuracy Bars', 'Takeaway']
      },

      // Existing template formats
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
      if (formatId === 'developer-studio' || formatId.includes('developer') || formatId.includes('code') || formatId.includes('terminal')) {
        candidates['developer-studio'].score += 60;
        candidates['developer-studio'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId === 'trend-breakdown' || formatId.includes('trend-breakdown') || formatId.includes('breakdown')) {
        candidates['trend-breakdown'].score += 60;
        candidates['trend-breakdown'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId === 'product-workflow-demo' || formatId.includes('workflow-demo')) {
        candidates['product-workflow-demo'].score += 60;
        candidates['product-workflow-demo'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId === 'cinematic-storytelling' || formatId.includes('storytelling')) {
        candidates['cinematic-storytelling'].score += 60;
        candidates['cinematic-storytelling'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId === 'clean-editorial' || formatId.includes('editorial')) {
        candidates['clean-editorial'].score += 60;
        candidates['clean-editorial'].reasons.push(`Direct matching with format '${formatId}'`);
      } else if (formatId.includes('demo') || formatId.includes('tool-discovery')) {
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

    // PRODUCT DEMO: e.g. "How an AI workspace turns natural language into...", "Product Demo", "UI Walkthrough"
    const isProductDemo = Boolean(
      /\b(natural-language\s*request|turns\s*(a\s*)?.*into|workspace\s*turns|product\s*demo|command\s*palette|ui\s*walkthrough|search\s*bar|pro\s*search|deep\s*research)\b/i.test(fullText)
    );
    if (isProductDemo) {
      candidates['product-demo'].score += 70;
      candidates['product-demo'].matchedKeywords.push('tool-demo', 'ui-walkthrough', 'interactive');
      candidates['product-demo'].reasons.push('Focused on hands-on software interaction and output generation');
    }

    // LISTICLE: e.g. "Five practical AI tools", "3 Free AI Websites", "5 Tools", "Number one... Number two"
    const isListicle = Boolean(
      /\b((five|three|four|5|3|4|10)\s*(practical\s*|useful\s*|free\s*)?(ai\s*)?(tools|websites|apps|prompts|tips|ways|resources)|top\s*\d|\d\s*best)\b/i.test(fullText) ||
      /\b(number\s*(one|1)|number\s*(two|2)|number\s*(three|3))\b/i.test(script)
    );
    if (isListicle) {
      candidates['listicle'].score += 65;
      candidates['listicle'].matchedKeywords.push('curated-list', 'countdown', 'multiple-tools');
      candidates['listicle'].reasons.push('Contains numbered list structure (e.g. 5 practical tools)');
    }

    // AUTOMATION WORKFLOW: e.g. "Trigger → AI processing → decision → automated action", "Workflow Pipeline"
    const isAutomation = Boolean(
      /\b(trigger\s*(→|->|to)\s*ai|pipeline|webhooks?|automation\s*pipeline|automation\s*workflow|n8n|zapier|make\.com|trigger.*automated\s*action|autonomous\s*agent|multi-agent)\b/i.test(fullText) ||
      (/\b(node\s*(one|1|two|2)|trigger|webhook)\b/i.test(script) && /\b(workflow|pipeline|automation)\b/i.test(fullText))
    );
    if (isAutomation) {
      candidates['automation-workflow'].score += 75;
      candidates['automation-workflow'].matchedKeywords.push('workflow', 'pipeline', 'webhook', 'automation');
      candidates['automation-workflow'].reasons.push('Demonstrates connected automation nodes or pipelines');
    }

    // COMPARISON: e.g. "Manual workflow vs AI-assisted workflow", "Claude vs GPT"
    const isComparison = Boolean(
      /\b(vs\.?|versus|compared\s*to|comparison|better\s*than|difference\s*between|which\s*is\s*better|side-by-side)\b/i.test(fullText)
    );
    if (isComparison) {
      candidates['comparison'].score += 70;
      candidates['comparison'].matchedKeywords.push('comparison', 'versus', 'matchup');
      candidates['comparison'].reasons.push('Contains side-by-side comparison cues (e.g. Manual vs AI workflow)');
    }

    // BEFORE-AFTER: e.g. "Before and after automating a repetitive task"
    const isBeforeAfter = Boolean(
      /\b(before\s*(and|vs|\/)\s*after|old\s*way\s*vs|manual\s*vs\s*ai|switch\s*from|traditional\s*way|automating\s*a\s*repetitive\s*task)\b/i.test(fullText)
    );
    if (isBeforeAfter) {
      candidates['before-after'].score += 70;
      candidates['before-after'].matchedKeywords.push('before-after', 'manual-vs-ai', 'transformation');
      candidates['before-after'].reasons.push('Contains clear before vs after transformation theme');
    }

    // AI PRODUCT / MODEL UPDATE: e.g. "A new AI model update improves everyday workflow capabilities"
    const isAIUpdate = Boolean(
      /\b(model\s*update|ai\s*model\s*update|version\s*\d|changelog|new\s*model\s*update|model\s*release|canvas|artifacts|product\s*update)\b/i.test(fullText)
    );
    if (isAIUpdate) {
      candidates['ai-update'].score += 65;
      candidates['ai-update'].matchedKeywords.push('model-update', 'capabilities-upgrade', 'new-feature');
      candidates['ai-update'].reasons.push('Major model update or capability upgrade announcement');
    }

    // NEWS UPDATE: e.g. "A new AI feature changes how people work with documents", "Breaking AI"
    const isNews = Boolean(
      /\b(new\s*ai\s*feature\s*changes|breaking|news\s*update|officially\s*(releases|released|launches|launched|announced)|just\s*(launched|released|unveiled)|announcement|today)\b/i.test(topicOnly) ||
      /\b(just\s*officially\s*(launched|released)|announced\s*today)\b/i.test(script)
    );
    if (isNews && !isAIUpdate) {
      candidates['news-update'].score += 65;
      candidates['news-update'].matchedKeywords.push('breaking-news', 'announcement', 'industry-update');
      candidates['news-update'].reasons.push('Breaking industry development or company announcement');
    }

    // HOW-TO TUTORIAL: e.g. "How to summarize a long document with AI in three steps"
    const isHowTo = Boolean(
      /\b(how\s*to\s*summarize|how\s*to|in\s*three\s*steps|tutorial|guide|walkthrough|set\s*up|3-step)\b/i.test(topicOnly) ||
      /\b(step\s*(one|1|two|2|three|3))\b/i.test(script)
    );
    if (isHowTo && !isAutomation) {
      candidates['how-to'].score += 65;
      candidates['how-to'].matchedKeywords.push('how-to', 'tutorial', 'step-by-step');
      candidates['how-to'].reasons.push('Actionable step-by-step tutorial intent');
    }

    // DATA & BENCHMARK INSIGHT: e.g. "Synthetic benchmark analysis comparing AI inference speed and token throughput"
    const isData = Boolean(
      /\b(synthetic\s*benchmark|benchmark\s*(analysis|test|results?|evals?)|accuracy\s*test|speed\s*test|token\s*throughput|reasoning\s*score|evals?\s*show)\b/i.test(topicOnly)
    );
    if (isData) {
      candidates['data-insight'].score += 70;
      candidates['data-insight'].matchedKeywords.push('benchmark', 'tokens-sec', 'speed', 'accuracy');
      candidates['data-insight'].reasons.push('Contains quantitative benchmark statistics or speed metrics');
    }

    // EXPLAINER: e.g. "How an AI assistant processes a document", "How RAG Works"
    const isExplainer = Boolean(
      /\b(how\s*an\s*ai\s*assistant\s*processes|what\s*is|how\s*(it|ai)\s*works|why\s*(it|this)\s*matters|concept\s*breakdown|mental\s*model|rag|context\s*window)\b/i.test(topicOnly)
    );
    if (isExplainer && !isHowTo && !isProductDemo) {
      candidates['explainer'].score += 65;
      candidates['explainer'].matchedKeywords.push('concept-explainer', 'what-is', 'how-it-works');
      candidates['explainer'].reasons.push('Educational breakdown of core AI concept');
    }

    // TOOL SHOWCASE: e.g. "Three useful AI tools for everyday productivity"
    const isToolShowcase = Boolean(
      /\b(three\s*useful\s*ai\s*tools|useful\s*ai\s*tools|showcase|spotlight|everyday\s*tool)\b/i.test(fullText)
    );
    if (isToolShowcase && !isProductDemo && !isListicle) {
      candidates['tool-showcase'].score += 60;
      candidates['tool-showcase'].matchedKeywords.push('tool-showcase', 'spotlight', 'everyday-tools');
      candidates['tool-showcase'].reasons.push('Spotlights key everyday capabilities and practical applications');
    }

    // DEVELOPER & CODE STUDIO: e.g. "Run local LLMs with terminal command", "Python / Rust / TS code snippet", "CLI execution"
    const isDeveloperStudio = Boolean(
      /\b(terminal|cli|command\s*line|ollama|llama\.cpp|docker|python|rust|typescript|javascript|bash|shell|github|git\s*clone|npm\s*run|pip\s*install|bun|syntax|code\s*snippet|compile|debug|ide|vscode|api\s*endpoint|sdk)\b/i.test(fullText)
    );
    if (isDeveloperStudio) {
      candidates['developer-studio'].score += 80;
      candidates['developer-studio'].matchedKeywords.push('terminal', 'cli', 'code-ide', 'developer-tool');
      candidates['developer-studio'].reasons.push('Demonstrates developer code, terminal CLI execution, or syntax workflow');
    }

    // DYNAMIC TREND & DATA BREAKDOWN: e.g. "Fastest growing AI models", "Benchmark comparison", "Hacker News top", "Timeline"
    const isTrendBreakdown = Boolean(
      /\b(trend\s*breakdown|milestones?|timeline|fastest\s*growing|top\s*(models|llms)|speed\s*test|tokens?\/sec|latency|hacker\s*news|stars\s*growth|rankings?|market\s*share|synthetic\s*benchmark)\b/i.test(fullText)
    );
    if (isTrendBreakdown) {
      candidates['trend-breakdown'].score += 80;
      candidates['trend-breakdown'].matchedKeywords.push('trend-timeline', 'benchmark-bars', 'community-stats');
      candidates['trend-breakdown'].reasons.push('Features high-velocity trend trajectory, timeline milestones, or comparative metrics');
    }

    // PRODUCT & WORKFLOW DEMO: e.g. "Interactive workspace", "UI click walkthrough", "Prompt to app"
    const isProductWorkflow = Boolean(
      /\b(workflow\s*demo|interactive.*(workspace|ui|canvas|app|demo)|workspace\s*turns|turn\s*(a\s*)?prompt\s*into|prompt\s*to\s*(app|code)|live\s*demo|screen\s*walkthrough)\b/i.test(fullText) ||
      (isProductDemo && /\b(workflow|interactive|workspace|canvas|react|app)\b/i.test(fullText))
    );
    if (isProductWorkflow) {
      candidates['product-workflow-demo'].score += 85;
      candidates['product-workflow-demo'].matchedKeywords.push('workflow-demo', 'interactive-ui', 'live-canvas');
      candidates['product-workflow-demo'].reasons.push('Walkthrough of interactive app UI, cursor actions, and live workspace output');
    }

    // CINEMATIC TECH STORYTELLING: e.g. "Paradigm shift in AI", "The future of autonomous agents", "Deep tech transformation"
    const isCinematicStory = Boolean(
      /\b(cinematic|paradigm\s*shift|future\s*of\s*ai|autonomous\s*agents|breakthrough|macro\s*shift|ai\s*revolution|deep\s*tech|vision\s*2026|industry\s*shift|transforming\s*the\s*way)\b/i.test(topicOnly) ||
      /\b(shift\s*makes\s*practical\s*ai|paradigm\s*shift|accessible\s*directly\s*inside\s*daily\s*workflows)\b/i.test(script)
    );
    if (isCinematicStory && !isDeveloperStudio && !isProductWorkflow) {
      candidates['cinematic-storytelling'].score += 75;
      candidates['cinematic-storytelling'].matchedKeywords.push('cinematic-vision', 'paradigm-shift', 'macro-impact');
      candidates['cinematic-storytelling'].reasons.push('High-concept macro storytelling on AI paradigm shifts and transformative technology');
    }

    // CLEAN EDITORIAL EXPLAINER: e.g. "How AI reasoning works", "Mental model for RAG", "Core architecture breakdown"
    const isEditorialExplainer = Boolean(
      /\b(editorial|mental\s*model|framework|principles|concept\s*breakdown|how\s*it\s*works|deep\s*explanation|architecture\s*deep\s*dive|understanding\s*ai)\b/i.test(topicOnly)
    );
    if (isEditorialExplainer && !isDeveloperStudio) {
      candidates['clean-editorial'].score += 75;
      candidates['clean-editorial'].matchedKeywords.push('editorial-explainer', 'mental-model', 'structured-cards');
      candidates['clean-editorial'].reasons.push('Clean editorial breakdown with numbered concepts, diagrams, and clear mental models');
    }

    // CINEMATIC / MACRO TREND EXPLAINER (Legacy alias support)
    const isCinematic = Boolean(
      /\b(becoming\s*easier\s*to\s*use|everyday\s*workflows|future\s*of|evolution|trend|industry\s*shift|paradigm|transforming|landscape)\b/i.test(topicOnly) ||
      /\b(shift\s*makes\s*practical\s*ai|paradigm\s*shift|accessible\s*directly\s*inside\s*daily\s*workflows)\b/i.test(script)
    );
    if (isCinematic && !isListicle && !isComparison && !isNews && !isAIUpdate && !isProductDemo) {
      candidates['cinematic-explainer'].score += 60;
      candidates['cinematic-explainer'].matchedKeywords.push('macro-trend', 'easier-to-use', 'everyday-work', 'industry-shift');
      candidates['cinematic-explainer'].reasons.push('Analyzes the broader evolution of AI tools becoming accessible for everyday knowledge workers');
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
