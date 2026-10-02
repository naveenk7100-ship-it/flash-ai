import type { ContentPillar, ContentAngle } from '../types';

export const CONTENT_PILLARS: ContentPillar[] = [
  {
    id: 'ai-tools',
    name: 'AI Tools & Utilities',
    description: 'Curated reviews, practical breakdowns, and feature walkthroughs of the newest AI software and useful websites.',
    color: 'from-purple-500 to-fuchsia-600',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
    iconName: 'Wrench',
    defaultAudience: 'Creators, developers & productivity enthusiasts',
    suggestedTopics: [
      '5 AI Tools That Save Hours Every Week',
      'Top Useful AI Websites for Everyday Productivity',
      'Claude 3.5 Sonnet vs GPT-4o: Key Differences in 30 Seconds',
      'Free AI tools that replace expensive $99/mo SaaS subscriptions'
    ]
  },
  {
    id: 'ai-automation',
    name: 'Automation Workflows',
    description: 'Practical multi-step AI pipelines, webhook triggers, API integrations, and autonomous data processing.',
    color: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderColor: 'border-cyan-500/40',
    iconName: 'Cpu',
    defaultAudience: 'Founders, builders & operations engineers',
    suggestedTopics: [
      'How AI Can Turn a Messy Spreadsheet Into Useful Insights',
      'How Autonomous AI Workflows Actually Connect APIs',
      'Building an Automated Document Summarization Pipeline in 5 Minutes',
      'Connecting Webhooks to AI Models for Instant Data Formatting'
    ]
  },
  {
    id: 'ai-news-update',
    name: 'AI News & Launches',
    description: 'Breaking AI model updates, open-source releases, major product launches, and industry trends.',
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
    iconName: 'TrendingUp',
    defaultAudience: 'Tech enthusiasts, engineers & early adopters',
    suggestedTopics: [
      'New AI Models & Features You Should Know This Week',
      'Major Open-Source Model Drop: What Changed and Why It Matters',
      'The Shift to Agentic Workflows: What You Need to Know',
      'Top 3 AI Breakthroughs Announced This Month'
    ]
  },
  {
    id: 'practical-tutorials',
    name: 'Practical AI Tutorials',
    description: 'Step-by-step how-to walkthroughs, prompt techniques, and practical AI implementations.',
    color: 'from-indigo-500 to-violet-600',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/40',
    iconName: 'Layout',
    defaultAudience: 'Learners, builders & everyday professionals',
    suggestedTopics: [
      'How to Write Better Prompts Using Chain-of-Thought Reasoning',
      'Step-by-Step: Extract Structured JSON from Unstructured Text with AI',
      'Turn Raw Voice Recordings into Structured Meeting Notes in 60s',
      'How to Build a Local RAG System for Your Personal Documents'
    ]
  },
  {
    id: 'ai-explainers',
    name: 'Simple AI Explainers',
    description: 'Clear, jargon-free visual explainers demystifying AI concepts, architectures, and capabilities.',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
    iconName: 'Zap',
    defaultAudience: 'Curious learners & non-technical professionals',
    suggestedTopics: [
      'What is an AI Agent? (Explained in 30 Seconds)',
      'Vector Databases Explained Simply with Visual Diagrams',
      'Why Context Window Size Matters for Modern AI Models',
      'Fine-Tuning vs RAG: When to Use Which'
    ]
  },
  {
    id: 'flash-builds',
    name: 'FLASH.Ai Architecture',
    description: 'Behind the scenes engineering, multi-agent pipelines, automated media rendering, and technical deep dives.',
    color: 'from-cyan-400 to-emerald-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/40',
    borderColor: 'border-cyan-400/50',
    iconName: 'Code',
    defaultAudience: 'Software developers & AI system architects',
    suggestedTopics: [
      'Inside the FLASH.Ai Real-Time 9:16 Media Muxing Engine',
      'How We Orchestrate Multi-Agent Verification Pipelines',
      'Benchmarking ElevenLabs Voice Latency with Cached Local Streams',
      'Designing Zero-Drift Video Timelines with Canvas Rasterization'
    ]
  }
];

export const CONTENT_ANGLES: ContentAngle[] = [
  'Problem',
  'Mistake',
  'Before/After',
  'How-to',
  'Demo',
  'Myth',
  'Comparison',
  'Case study',
  'Behind the scenes',
  'Tool discovery'
];

export const PLATFORMS = [
  'Instagram Reels',
  'Instagram Carousels',
  'Instagram Stories',
  'Instagram Single Post',
  'LinkedIn Post',
  'Twitter/X Thread'
] as const;

export const VIDEO_DURATIONS = ['15s', '30s', '60s', '90s'] as const;

export const TONES = [
  'Authoritative & Sharp',
  'High Energy & Viral',
  'Educational & Step-by-Step',
  'Conversational & Storytelling',
  'Problem-Agitate-Solve'
] as const;

export const CTAS = [
  'Save for Your Next Project',
  'Follow @flash_ai_digital',
  'Explore Curated AI Tools',
  'Try This AI Workflow',
  'Which Tool Would You Use?',
  'Check Link in Bio'
] as const;

export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'REPLIED',
  'QUALIFIED',
  'PROPOSAL',
  'WON',
  'LOST'
] as const;

export const CONTENT_STATUSES = [
  'IDEA',
  'SCRIPT',
  'CREATIVE',
  'REVIEW',
  'APPROVED',
  'PUBLISHED',
  'REJECTED'
] as const;
