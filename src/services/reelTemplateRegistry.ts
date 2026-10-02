/**
 * FLASH.Ai Clean Information-First Production Template Registry
 * 
 * Defines the 12 genuinely different visual formats for daily AI tools, updates, news, explainers, and benchmarks:
 * 1. PRODUCT_DEMO (UI zoom + feature interaction + callout tags + clean result)
 * 2. TOOL_SHOWCASE (Hero visual + feature pills + practical use-case card)
 * 3. NEWS_UPDATE (Breaking headline card + verified source + 3-point ticker)
 * 4. AI_UPDATE (Model release / major feature update + live demo canvas)
 * 5. EXPLAINER (Concept breakdown: What is it → How it works → Why it matters)
 * 6. HOW_TO (Step 1 → Step 2 → Step 3 → Final Outcome)
 * 7. LISTICLE (Numbered progression 1️⃣ 2️⃣ 3️⃣ + fast visual transitions)
 * 8. COMPARISON (Side-by-side spec comparison + benchmark face-off)
 * 9. BEFORE_AFTER (Manual process vs AI automated workflow transformation)
 * 10. AUTOMATION_WORKFLOW (Node-by-node architecture: Trigger → Model → Output)
 * 11. DATA_INSIGHT (Benchmark charts + speed/accuracy metrics + research data)
 * 12. CINEMATIC_EXPLAINER (Macro AI trends + paradigm shifts + thoughtful takeaway)
 */

import type {
  ReelTemplateDefinition
} from '../types/reelProduction.ts';

export const TEMPLATE_REGISTRY: Record<string, ReelTemplateDefinition> = {
  'product-demo': {
    id: 'product-demo',
    name: 'Product Demo',
    description: 'Clean UI walkthrough of an AI software tool showing interactive prompt inputs, real-time generation, and clear output results.',
    category: 'Demo',
    visualLayoutType: 'product_demo_ui',
    themeColors: {
      primary: '#00F5FF',
      secondary: '#3B82F6',
      accent: '#8B5CF6',
      bgGradient: 'from-[#07090e] via-[#0a1226] to-[#020408]',
      cardBg: '#0f172a',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(0, 245, 255, 0.15)'
    },
    sampleHook: 'Here is how this new AI tool turns raw text into working code in 5 seconds.',
    keyHighlights: ['⚡ Direct Interface Interaction', '🔍 Feature Zoom & Inspection', '💡 Clear Output Demonstration', '🎙️ Synchronized Informational Voiceover'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 5,
      demoDuration: 18,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screen_recording', 'website_demo', 'screen_recording', 'visual_placeholder'],
    recommendedTransitions: ['pop', 'slide_left', 'zoom_in', 'fade', 'cut'],
    soundEffects: ['whoosh', 'click', 'click', 'pop', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#00F5FF'
    }
  },

  'tool-showcase': {
    id: 'tool-showcase',
    name: 'Tool Showcase',
    description: 'Spotlight on an essential AI tool featuring clean hero UI mockup, core capability pills, and practical use cases.',
    category: 'Showcase',
    visualLayoutType: 'tool_showcase_hero',
    themeColors: {
      primary: '#38BDF8',
      secondary: '#818CF8',
      accent: '#C084FC',
      bgGradient: 'from-[#060e18] via-[#0c182b] to-[#040810]',
      cardBg: '#0e1c31',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(56, 189, 248, 0.15)'
    },
    sampleHook: 'This free AI research tool gives you instant verified citations from 200 million papers.',
    keyHighlights: ['🌟 Hero Visual Spotlight', '🎯 3 Core Feature Callouts', '💼 Real-World Workflow Application', '📌 Simple Natural Conclusion'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 6,
      demoDuration: 16,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screenshot', 'screen_recording', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['zoom_in', 'slide_left', 'fade', 'pop', 'cut'],
    soundEffects: ['whoosh', 'chime', 'click', 'pop', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#38BDF8'
    }
  },

  'news-update': {
    id: 'news-update',
    name: 'AI News Update',
    description: 'Fast-paced AI news breakdown with headline cards, verified source badges, 3 key takeaways ticker, and industry context.',
    category: 'News',
    visualLayoutType: 'news_update_ticker',
    themeColors: {
      primary: '#F43F5E',
      secondary: '#FB7185',
      accent: '#FDA4AF',
      bgGradient: 'from-[#14060a] via-[#210911] to-[#0a0305]',
      cardBg: '#1f0d14',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(244, 63, 94, 0.18)'
    },
    sampleHook: 'OpenAI and Google both announced major model updates today. Here is what changed.',
    keyHighlights: ['📰 Breaking Headline Card', '🔍 Verified Source & Launch Date', '⚡ 3-Bullet Information Ticker', '🌐 Industry Impact Analysis'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 6,
      demoDuration: 14,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screenshot', 'website_demo', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['cut', 'slide_right', 'cut', 'fade', 'cut'],
    soundEffects: ['pop', 'whoosh', 'click', 'chime', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#F43F5E'
    }
  },

  'ai-update': {
    id: 'ai-update',
    name: 'AI Product Update',
    description: 'Focused breakdown of a major new model release or feature rollout (e.g. ChatGPT Canvas, Claude Artifacts, Gemini 2.0).',
    category: 'Update',
    visualLayoutType: 'ai_update_canvas',
    themeColors: {
      primary: '#10B981',
      secondary: '#06B6D4',
      accent: '#3B82F6',
      bgGradient: 'from-[#03150e] via-[#06261c] to-[#010c07]',
      cardBg: '#09251c',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(16, 185, 129, 0.2)'
    },
    sampleHook: 'ChatGPT just released an official Canvas update for real-time writing and code editing.',
    keyHighlights: ['✨ New Feature Announcement', '🖥️ Live Canvas Interaction', '📈 Capability Comparison', '🚀 Practical Everyday Benefits'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 6,
      demoDuration: 16,
      resultDuration: 5,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screen_recording', 'screen_recording', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['zoom_in', 'slide_left', 'fade', 'pop', 'cut'],
    soundEffects: ['whoosh', 'click', 'click', 'chime', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#10B981'
    }
  },

  'explainer': {
    id: 'explainer',
    name: 'AI Concept Explainer',
    description: 'Clear, intuitive explanation of an important AI concept: What is it, How does it work, Why does it matter to you.',
    category: 'Explainer',
    visualLayoutType: 'explainer_cards',
    themeColors: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      accent: '#EC4899',
      bgGradient: 'from-[#0d0718] via-[#1a0f2e] to-[#06030c]',
      cardBg: '#191129',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(139, 92, 246, 0.2)'
    },
    sampleHook: 'What is Context Window in AI models, and why does a 2-million token limit matter?',
    keyHighlights: ['💡 Simple Mental Model', '📊 Visual Information Breakdown', '🧠 Real-World Significance', '🎓 Clear Educational Takeaway'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 7,
      demoDuration: 15,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screenshot', 'screen_recording', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['fade', 'slide_left', 'zoom_in', 'fade', 'cut'],
    soundEffects: ['chime', 'whoosh', 'click', 'pop', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#8B5CF6'
    }
  },

  'how-to': {
    id: 'how-to',
    name: 'How-To Tutorial',
    description: 'Step-by-step practical guide: Step 1 → Step 2 → Step 3 with clear UI cues, keyboard shortcuts, and verified outputs.',
    category: 'Education',
    visualLayoutType: 'how_to_steps',
    themeColors: {
      primary: '#EAB308',
      secondary: '#F59E0B',
      accent: '#10B981',
      bgGradient: 'from-[#140f02] via-[#241a04] to-[#090701]',
      cardBg: '#1e1605',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(234, 179, 8, 0.2)'
    },
    sampleHook: 'How to connect your private documents to Claude in 3 easy steps.',
    keyHighlights: ['1️⃣ Step-by-Step Milestones', '🖱️ Exact Click Navigation', '⚡ Zero-Jargon Instructions', '✅ Verified Final Output'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 7,
      demoDuration: 18,
      resultDuration: 5,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screen_recording', 'screen_recording', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['slide_left', 'cut', 'slide_left', 'fade', 'cut'],
    soundEffects: ['whoosh', 'click', 'click', 'chime', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#EAB308'
    }
  },

  'listicle': {
    id: 'listicle',
    name: 'Top Tools Listicle',
    description: 'Curated 3 to 5 AI tools or websites with numbered badges (1️⃣ 2️⃣ 3️⃣), distinct UI cards, and quick utility summaries.',
    category: 'List',
    visualLayoutType: 'listicle_numbered',
    themeColors: {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FBBF24',
      bgGradient: 'from-[#140a02] via-[#241305] to-[#080401]',
      cardBg: '#1e1106',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(249, 115, 22, 0.2)'
    },
    sampleHook: 'Here are 3 free AI websites that feel illegal to know in 2026.',
    keyHighlights: ['🔢 Numbered Tool Countdowns', '⚡ Rapid Visual Card Switches', '🎯 Instant Utility Takeaways', '📁 Curated Resource Summary'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 7,
      demoDuration: 18,
      resultDuration: 5,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screen_recording', 'screen_recording', 'screen_recording', 'visual_placeholder'],
    recommendedTransitions: ['pop', 'slide_left', 'slide_left', 'slide_left', 'cut'],
    soundEffects: ['pop', 'whoosh', 'whoosh', 'whoosh', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#F97316'
    }
  },

  'comparison': {
    id: 'comparison',
    name: 'Model & Tool Comparison',
    description: 'Split-screen or card-by-card comparison (e.g. ChatGPT vs Claude, Speed vs Accuracy, Open Source vs Proprietary).',
    category: 'Comparison',
    visualLayoutType: 'comparison_split',
    themeColors: {
      primary: '#06B6D4',
      secondary: '#EC4899',
      accent: '#8B5CF6',
      bgGradient: 'from-[#03111b] via-[#091f2c] to-[#02090e]',
      cardBg: '#091c28',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(6, 182, 212, 0.2)'
    },
    sampleHook: 'ChatGPT vs Claude 3.5 Sonnet: We tested both on complex coding tasks.',
    keyHighlights: ['⚖️ Split-Screen UI Matchup', '📊 Side-by-Side Performance', '🎯 Strength & Weakness Breakdown', '🏆 Best Use Case Winner'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 7,
      demoDuration: 17,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screenshot', 'screen_recording', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['cut', 'slide_left', 'fade', 'pop', 'cut'],
    soundEffects: ['whoosh', 'click', 'chime', 'pop', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#06B6D4'
    }
  },

  'before-after': {
    id: 'before-after',
    name: 'Before vs After AI',
    description: 'Transformation reveal comparing slow, manual methods against instantaneous AI workflows.',
    category: 'Comparison',
    visualLayoutType: 'before_after_slider',
    themeColors: {
      primary: '#EF4444',
      secondary: '#10B981',
      accent: '#3B82F6',
      bgGradient: 'from-[#120505] via-[#1c0808] to-[#080202]',
      cardBg: '#1a0909',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(239, 68, 68, 0.2)'
    },
    sampleHook: 'Doing video editing the manual way versus letting an AI editor handle it.',
    keyHighlights: ['❌ Manual Frustration Visual', '⚡ Instant AI Transformation', '⏳ Time & Effort Comparison', '✨ Seamless Final Output'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 6,
      demoDuration: 16,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screenshot', 'screen_recording', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['slide_left', 'cut', 'zoom_in', 'fade', 'cut'],
    soundEffects: ['whoosh', 'click', 'chime', 'pop', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#10B981'
    }
  },

  'automation-workflow': {
    id: 'automation-workflow',
    name: 'Automation Workflow',
    description: 'Node-by-node architecture diagram revealing how Webhooks, AI Models, and APIs connect for hands-free workflows.',
    category: 'Workflow',
    visualLayoutType: 'workflow_nodes',
    themeColors: {
      primary: '#06B6D4',
      secondary: '#10B981',
      accent: '#3B82F6',
      bgGradient: 'from-[#03111b] via-[#082032] to-[#01080e]',
      cardBg: '#0b192c',
      textColor: '#F8FAFC',
      badgeBg: 'rgba(6, 182, 212, 0.2)'
    },
    sampleHook: 'How this 3-node AI pipeline automatically researches and summarizes tech articles.',
    keyHighlights: ['🔌 Webhook Trigger Node', '🧠 AI Classification & Summary', '🔄 Instant Output Routing', '📊 Complete Hands-Free Execution'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 6,
      demoDuration: 18,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screen_recording', 'screen_recording', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['zoom_in', 'slide_left', 'slide_left', 'fade', 'cut'],
    soundEffects: ['whoosh', 'click', 'click', 'chime', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#06B6D4'
    }
  },

  'data-insight': {
    id: 'data-insight',
    name: 'AI Benchmark & Data Insight',
    description: 'Clean data visualizations, charts, speed benchmarks, accuracy percentages, and verified research metrics.',
    category: 'Data',
    visualLayoutType: 'data_insight_charts',
    themeColors: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      accent: '#93C5FD',
      bgGradient: 'from-[#030c1c] via-[#071735] to-[#01050d]',
      cardBg: '#0a1a38',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(59, 130, 246, 0.2)'
    },
    sampleHook: 'New benchmark results: How Gemini 2.0 Flash compares to GPT-4o on reasoning speed.',
    keyHighlights: ['📈 Clean Benchmark Bar Charts', '⚡ Token Generation Speed Data', '🎯 Accuracy & Error Rate Stats', '📊 Evidence-Backed Summary'],
    defaultPacing: {
      hookDuration: 3,
      problemDuration: 6,
      demoDuration: 16,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screenshot', 'screenshot', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['pop', 'slide_left', 'zoom_in', 'fade', 'cut'],
    soundEffects: ['chime', 'click', 'pop', 'whoosh', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#3B82F6'
    }
  },

  'cinematic-explainer': {
    id: 'cinematic-explainer',
    name: 'Macro AI Trend & Explainer',
    description: 'High-concept storytelling on macro AI shifts, open-source trends, autonomous agents, and future developments.',
    category: 'Story',
    visualLayoutType: 'cinematic_narrative',
    themeColors: {
      primary: '#6366F1',
      secondary: '#818CF8',
      accent: '#A5B4FC',
      bgGradient: 'from-[#090a1a] via-[#111430] to-[#04040d]',
      cardBg: '#121636',
      textColor: '#FFFFFF',
      badgeBg: 'rgba(99, 102, 241, 0.2)'
    },
    sampleHook: 'Why the shift from chat assistants to autonomous coding agents changes everything in 2026.',
    keyHighlights: ['🌌 Clean Narrative Arc', '✨ Minimalist High-Contrast Visuals', '🔭 Macro Industry Perspective', '💭 Thoughtful Closing Takeaway'],
    defaultPacing: {
      hookDuration: 4,
      problemDuration: 7,
      demoDuration: 16,
      resultDuration: 6,
      ctaDuration: 4
    },
    visualSourceSequence: ['screenshot', 'screen_recording', 'screenshot', 'screenshot', 'visual_placeholder'],
    recommendedTransitions: ['fade', 'zoom_in', 'slide_left', 'fade', 'cut'],
    soundEffects: ['whoosh', 'chime', 'click', 'pop', 'none'],
    layoutPreset: {
      safeAreaTopPercent: 15,
      safeAreaBottomPercent: 20,
      safeAreaRightPercent: 15,
      captionYPercent: 72,
      ctaButtonColor: '#6366F1'
    }
  }
};

// Aliases for backwards compatibility
TEMPLATE_REGISTRY['ai-tool-demo'] = TEMPLATE_REGISTRY['product-demo'];
TEMPLATE_REGISTRY['product-showcase'] = TEMPLATE_REGISTRY['tool-showcase'];
TEMPLATE_REGISTRY['trending-news'] = TEMPLATE_REGISTRY['news-update'];
TEMPLATE_REGISTRY['how-to-tutorial'] = TEMPLATE_REGISTRY['how-to'];
TEMPLATE_REGISTRY['tutorial'] = TEMPLATE_REGISTRY['how-to'];
TEMPLATE_REGISTRY['list-top-5'] = TEMPLATE_REGISTRY['listicle'];
TEMPLATE_REGISTRY['case-study'] = TEMPLATE_REGISTRY['data-insight'];
TEMPLATE_REGISTRY['story-problem-solution'] = TEMPLATE_REGISTRY['cinematic-explainer'];
TEMPLATE_REGISTRY['build-showcase'] = TEMPLATE_REGISTRY['tool-showcase'];
TEMPLATE_REGISTRY['website-reveal'] = TEMPLATE_REGISTRY['product-demo'];

export class ReelTemplateRegistry {
  public getAllTemplates(): ReelTemplateDefinition[] {
    const uniqueIds = [
      'product-demo',
      'tool-showcase',
      'news-update',
      'ai-update',
      'explainer',
      'how-to',
      'listicle',
      'comparison',
      'before-after',
      'automation-workflow',
      'data-insight',
      'cinematic-explainer'
    ];
    return uniqueIds.map((id) => TEMPLATE_REGISTRY[id]).filter(Boolean);
  }

  public getTemplateById(id: string): ReelTemplateDefinition {
    const canonical = (id || '').toLowerCase().trim();
    return TEMPLATE_REGISTRY[canonical] || TEMPLATE_REGISTRY['product-demo'];
  }

  public generateTemplatePreviewSvg(templateId: string, title?: string): string {
    const tmpl = this.getTemplateById(templateId);
    const width = 1080;
    const height = 1920;
    const heading = title || tmpl.sampleHook;
    const primary = tmpl.themeColors.primary;
    const secondary = tmpl.themeColors.secondary;
    const highlights = tmpl.keyHighlights.slice(0, 4);

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad_${tmpl.id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#07090e" />
      <stop offset="40%" stop-color="#0b1329" />
      <stop offset="100%" stop-color="#030509" />
    </linearGradient>
    <linearGradient id="accentGrad_${tmpl.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${secondary}" />
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bgGrad_${tmpl.id})" />
  <circle cx="540" cy="400" r="420" fill="${primary}" opacity="0.06" />

  <!-- Top Safe Zone Branding -->
  <g transform="translate(90, 140)">
    <text x="0" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" fill="#94A3B8" letter-spacing="1.5">@flash__ai__digital</text>
    <rect x="0" y="50" width="300" height="46" rx="23" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.15)" stroke-width="1.5" />
    <text x="24" y="80" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="${primary}">${tmpl.name.toUpperCase()}</text>
  </g>

  <!-- Hook & Title Card -->
  <g transform="translate(90, 320)">
    <rect x="0" y="0" width="900" height="240" rx="28" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="2" />
    <text x="450" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800" fill="${primary}" text-anchor="middle" letter-spacing="2">FEATURED AI FORMAT</text>
    <text x="450" y="125" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF" text-anchor="middle">${heading.length > 40 ? heading.slice(0, 37) + '...' : heading}</text>
    <text x="450" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#94A3B8" text-anchor="middle">${tmpl.description.slice(0, 65)}...</text>
  </g>

  <!-- Visual Mockup Canvas -->
  <g transform="translate(90, 600)">
    <rect x="0" y="0" width="900" height="660" rx="32" fill="#0A0F1D" stroke="${primary}" stroke-width="2.5" opacity="0.95" />
    <circle cx="450" cy="330" r="220" fill="${primary}" opacity="0.04" />
    <rect x="40" y="40" width="820" height="580" rx="24" fill="#060A14" stroke="rgba(255, 255, 255, 0.08)" />

    <!-- Feature Grid -->
    ${highlights
      .map(
        (hl, i) => `
    <g transform="translate(70, ${100 + i * 110})">
      <rect x="0" y="0" width="760" height="85" rx="16" fill="rgba(255, 255, 255, 0.04)" stroke="rgba(255, 255, 255, 0.1)" stroke-width="1.5" />
      <circle cx="45" cy="42" r="16" fill="${primary}" opacity="0.2" />
      <text x="80" y="50" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#F8FAFC">${hl.replace(/<[^>]*>?/gm, '')}</text>
    </g>`
      )
      .join('')}
  </g>

  <!-- Informational Takeaway Bottom Card -->
  <g transform="translate(90, 1320)">
    <rect x="0" y="0" width="900" height="180" rx="24" fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="2" />
    <text x="450" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="700" fill="#38BDF8" text-anchor="middle">💡 CLEAN AI INFORMATION</text>
    <text x="450" y="115" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#CBD5E1" text-anchor="middle">Paced for maximum clarity • 1080x1920 9:16 Vertical Video</text>
  </g>

  <!-- Captions Preview -->
  <g transform="translate(90, 1540)">
    <rect x="0" y="0" width="900" height="100" rx="20" fill="rgba(0, 0, 0, 0.85)" stroke="rgba(255, 255, 255, 0.1)" />
    <text x="450" y="60" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#00F5FF" text-anchor="middle">💬 Synchronized ElevenLabs Voiceover Captions</text>
  </g>
</svg>`;
  }
}

export const reelTemplateRegistry = new ReelTemplateRegistry();
