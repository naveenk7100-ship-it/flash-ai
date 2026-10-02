/**
 * Centralized FLASH.Ai Brand Configuration & Production Design System
 * 
 * Brand: FLASH.Ai
 * Instagram: @flash_ai_digital
 * Focus: AI, automation, AI tools, business automation, productivity, websites, workflows and practical AI use cases.
 */

export interface TypographyConfig {
  primaryFont: string;
  monoFont: string;
  hookFontSize: number;
  subtitleFontSize: number;
  ctaFontSize: number;
  lineHeight: number;
  letterSpacing: string;
}

export interface MotionConfig {
  defaultTransition: 'cut' | 'zoom_in' | 'slide_left' | 'slide_right' | 'pop' | 'ken_burns' | 'pulse' | 'fade' | 'wipe';
  supportedTransitions: Array<'cut' | 'zoom_in' | 'slide_left' | 'slide_right' | 'pop' | 'ken_burns' | 'pulse' | 'fade' | 'wipe'>;
  transitionDurationMs: number;
  pacingWpm: number; // Words per minute for voiceover (creator-like: ~140-160 WPM)
}

export interface WatermarkConfig {
  enabled: boolean;
  text: string;
  logoUrl: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'none';
  opacity: number;
  scale: number;
}

export interface BrandConfig {
  brandName: string;
  instagramHandle: string;
  instagramUrl: string;
  tagline: string;
  niche: string;
  focusAreas: string[];
  tone: {
    primary: string;
    traits: string[];
    bannedStyles: string[];
  };
  ctaStyles: Array<{
    id: string;
    label: string;
    keyword: string;
    actionDescription: string;
  }>;
  formatSpecs: {
    aspectRatio: '9:16';
    resolution: {
      width: number;
      height: number;
    };
    durationRange: {
      minSeconds: number;
      maxSeconds: number;
      defaultSeconds: number;
    };
    safeZones: {
      topPercent: number; // 15% top safe zone (avoids Reel profile / audio headers)
      bottomPercent: number; // 22% bottom safe zone (avoids caption & action icons)
      leftPercent: number;
      rightPercent: number;
    };
  };
  typography: TypographyConfig;
  motion: MotionConfig;
  watermark: WatermarkConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
  };
}

export const FLASH_AI_BRAND: BrandConfig = {
  brandName: 'FLASH.Ai',
  instagramHandle: 'flash_ai_digital',
  instagramUrl: 'https://instagram.com/flash_ai_digital',
  tagline: 'Practical AI Automation & Digital Systems for High-Growth Businesses',
  niche: 'AI, automation, AI tools, business automation, productivity, websites, workflows and practical AI use cases.',
  focusAreas: [
    'AI Agents & Autonomy',
    'Business Process Automation',
    'High-Converting AI Websites',
    'WhatsApp & CRM Automation',
    'Inbound Lead Capture Systems',
    'Productivity & AI Tools Discovery',
    'Workflow Architecture & SOPs',
    'Client Case Studies & Real ROI'
  ],
  tone: {
    primary: 'Authoritative, practical, creator-like, modern and fast-paced',
    traits: [
      'Direct, zero-fluff opening hook',
      'Actionable step-by-step breakdowns',
      'Data-backed and demonstrable logic',
      'Creator-style engaging screen pacing',
      'Technical credibility without overwhelming jargon'
    ],
    bannedStyles: [
      'Over-the-top motivational speeches',
      'Get-rich-quick claims or unrealistic revenue promises',
      'Fake testimonials or fabricated metrics',
      'Generic corporate slide decks'
    ]
  },
  ctaStyles: [
    {
      id: 'dm-automate',
      label: 'DM "AUTOMATE"',
      keyword: 'AUTOMATE',
      actionDescription: 'Direct Message automated lead intake and strategy blueprint'
    },
    {
      id: 'comment-workflow',
      label: 'Comment "WORKFLOW"',
      keyword: 'WORKFLOW',
      actionDescription: 'Automated comment trigger sending direct access link to workflow template'
    },
    {
      id: 'comment-growth',
      label: 'Comment "GROWTH"',
      keyword: 'GROWTH',
      actionDescription: 'Instant DM sending case study breakdown and audit checklist'
    },
    {
      id: 'book-call',
      label: 'Book Strategy Call',
      keyword: 'STRATEGY',
      actionDescription: 'Direct calendar link in bio for high-ticket implementation audit'
    },
    {
      id: 'free-audit',
      label: 'Free AI Audit',
      keyword: 'AUDIT',
      actionDescription: 'Free 5-minute automated business bottleneck evaluation'
    }
  ],
  formatSpecs: {
    aspectRatio: '9:16',
    resolution: {
      width: 1080,
      height: 1920
    },
    durationRange: {
      minSeconds: 20,
      maxSeconds: 60,
      defaultSeconds: 35
    },
    safeZones: {
      topPercent: 14,
      bottomPercent: 22,
      leftPercent: 6,
      rightPercent: 12
    }
  },
  typography: {
    primaryFont: 'Inter, system-ui, -apple-system, sans-serif',
    monoFont: 'JetBrains Mono, Menlo, monospace',
    hookFontSize: 52,
    subtitleFontSize: 44,
    ctaFontSize: 48,
    lineHeight: 1.25,
    letterSpacing: '-0.02em'
  },
  motion: {
    defaultTransition: 'pop',
    supportedTransitions: [
      'cut',
      'zoom_in',
      'slide_left',
      'slide_right',
      'pop',
      'ken_burns',
      'pulse',
      'fade',
      'wipe'
    ],
    transitionDurationMs: 250,
    pacingWpm: 150
  },
  watermark: {
    enabled: true,
    text: 'FLASH.Ai | @flash_ai_digital',
    logoUrl: '/favicon.svg',
    position: 'top-right',
    opacity: 0.85,
    scale: 1.0
  },
  colors: {
    primary: '#00F5FF', // Neon Cyan
    secondary: '#6366F1', // Indigo
    accent: '#FF0080', // Cyber Pink
    background: '#07090E', // Ultra Deep Space Navy
    surface: '#0E131F', // Dark Card Surface
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    border: 'rgba(0, 245, 255, 0.2)',
    success: '#10B981',
    warning: '#F59E0B'
  }
};
