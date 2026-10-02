import type { ContentPillar, ContentAngle } from '../types';

export const CONTENT_PILLARS: ContentPillar[] = [
  {
    id: 'ai-automation',
    name: 'AI Automation',
    description: 'Replacing manual business busywork with intelligent agentic workflows and automated pipelines.',
    color: 'from-cyan-500 to-blue-600',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderColor: 'border-cyan-500/40',
    iconName: 'Cpu',
    defaultAudience: 'Small business owners & operations managers',
    suggestedTopics: [
      'How to automate customer onboarding in under 5 minutes with AI',
      '3 manual tasks costing your business $2,000/month (and how to automate them)',
      'Automated invoice & receipt processing using AI vision models',
      'How AI agents handle 80% of support tickets automatically'
    ]
  },
  {
    id: 'business-growth',
    name: 'Business Growth',
    description: 'Scaling revenue, operational efficiency, and customer lifetime value using modern tech systems.',
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    borderColor: 'border-emerald-500/40',
    iconName: 'TrendingUp',
    defaultAudience: 'Founders, agency owners & service businesses',
    suggestedTopics: [
      'The 10x leverage rule: Why hiring more people is no longer the first answer',
      'How local businesses double retention with automated follow-ups',
      '5 business bottlenecks AI solves overnight in 2026',
      'The exact tech stack scaling our digital agency this year'
    ]
  },
  {
    id: 'website-solutions',
    name: 'Website Solutions',
    description: 'High-converting websites, landing page teardowns, interactive UI, and speed optimizations.',
    color: 'from-indigo-500 to-violet-600',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderColor: 'border-indigo-500/40',
    iconName: 'Layout',
    defaultAudience: 'Local shops, clinics, service providers & startups',
    suggestedTopics: [
      '3 reasons your website gets 1,000 visitors but 0 phone calls',
      'Why modern websites need instant AI chat instead of boring contact forms',
      'Before & After: Redesigning a local clinic landing page for 3x conversions',
      'How page speed under 1s directly boosts Google ranking & ad ROI'
    ]
  },
  {
    id: 'whatsapp-automation',
    name: 'WhatsApp Automation',
    description: 'Direct response chatbots, instant lead qualification, catalog ordering, and smart appointment booking.',
    color: 'from-green-500 to-emerald-600',
    badgeBg: 'bg-green-500/10 text-green-400 border-green-500/30',
    borderColor: 'border-green-500/40',
    iconName: 'MessageSquare',
    defaultAudience: 'D2C brands, doctors, salons, real estate & local stores',
    suggestedTopics: [
      'Never miss a midnight lead: 24/7 WhatsApp AI booking assistant',
      'How our WhatsApp automation recovered $4,500 in abandoned carts in 48 hours',
      'Zero to automated appointments: WhatsApp Cloud API walkthrough',
      'Broadcasting updates with 98% open rates using WhatsApp business API'
    ]
  },
  {
    id: 'lead-generation',
    name: 'Lead Generation',
    description: 'Attracting high-intent inquiries, inbound funnels, DM automation, and conversion mechanics.',
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderColor: 'border-amber-500/40',
    iconName: 'Zap',
    defaultAudience: 'B2B consultants, real estate agents & high-ticket services',
    suggestedTopics: [
      'How to turn Instagram Reels comments into qualified sales calls automatically',
      'The DM trigger keyword funnel: Step-by-step setup',
      'Why cold outreach is dying and interactive inbound lead magnets are winning',
      'Scraping & enriching high-intent B2B leads ethically with AI'
    ]
  },
  {
    id: 'ai-tools',
    name: 'AI Tools',
    description: 'Curated reviews, practical tutorials, and breakdowns of the newest AI software for real business ROI.',
    color: 'from-purple-500 to-fuchsia-600',
    badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    borderColor: 'border-purple-500/40',
    iconName: 'Wrench',
    defaultAudience: 'Creators, tech enthusiasts & solopreneurs',
    suggestedTopics: [
      'Top 5 AI tools every small business should start using this week',
      'Claude 3.5 Sonnet vs GPT-4o vs Gemini 2.0: Which one for coding & workflows?',
      'Free AI tools that replace expensive $99/mo SaaS subscriptions',
      'Turn your voice notes into complete SOPs & emails with this AI tool'
    ]
  },
  {
    id: 'flash-builds',
    name: 'FLASH.Ai Builds',
    description: 'Case studies, live client build demonstrations, custom dashboards, and technical showcase.',
    color: 'from-cyan-400 to-emerald-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/40',
    borderColor: 'border-cyan-400/50',
    iconName: 'Code',
    defaultAudience: 'Potential clients looking for proven custom digital solutions',
    suggestedTopics: [
      'Inside the custom AI inventory assistant built for a multi-store retailer',
      'FLASH.Ai Build: Real-time lead hunter & verification pipeline demo',
      'How we built a custom booking portal in 72 hours for a luxury salon',
      'Architecting a multi-agent social media engine with real-time approval'
    ]
  },
  {
    id: 'behind-the-scenes',
    name: 'Behind The Scenes',
    description: 'Transparent engineering, founder lessons, agency workflows, client wins, and day-in-the-life.',
    color: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    borderColor: 'border-rose-500/40',
    iconName: 'Video',
    defaultAudience: 'Followers, business peers & prospective team/partners',
    suggestedTopics: [
      'Day in the life building FLASH.Ai automation systems for clients',
      'What went wrong when we tested our first automated webhook engine',
      'Our internal setup: The hardware & software powering FLASH.Ai studio',
      'How we plan 30 days of high-value social media content in 2 hours'
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
  'Book Strategy Call',
  'DM "AUTOMATE"',
  'Comment "GROWTH"',
  'Check Link in Bio',
  'Free AI Audit',
  'WhatsApp Us Directly'
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
