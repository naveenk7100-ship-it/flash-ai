import type {
  ContentIdea,
  ContentItem,
  Lead,
  AnalyticsSnapshot,
  AutomationSetting,
  PublishingJob,
  PublishingActivityLogItem
} from '../types';

export const INITIAL_IDEAS: ContentIdea[] = [
  {
    id: 'idea-1',
    title: '5 AI Tools That Save Hours Every Week',
    pillarId: 'ai-tools',
    platform: 'Instagram Reels',
    status: 'SCRIPT',
    scheduledDate: '2026-09-28',
    targetAudience: 'Creators, developers & tech enthusiasts',
    estimatedDuration: '30s',
    notes: 'Highlight rapid PDF parsing, voice note to documentation, and spreadsheet analysis. Dynamic screen cards.',
    createdAt: '2026-09-25T10:00:00.000Z',
    updatedAt: '2026-09-25T14:30:00.000Z'
  },
  {
    id: 'idea-2',
    title: 'How AI Can Turn a Messy Spreadsheet Into Useful Insights',
    pillarId: 'ai-automation',
    platform: 'Instagram Reels',
    status: 'IDEA',
    scheduledDate: '2026-09-30',
    targetAudience: 'Data analysts, managers & operators',
    estimatedDuration: '30s',
    notes: 'Focus on automated anomaly detection, natural language querying, and instant chart generation.',
    createdAt: '2026-09-26T08:15:00.000Z',
    updatedAt: '2026-09-26T08:15:00.000Z'
  },
  {
    id: 'idea-3',
    title: 'New AI Models & Features You Should Know This Week',
    pillarId: 'ai-news-update',
    platform: 'Instagram Carousels',
    status: 'IDEA',
    scheduledDate: '2026-10-02',
    targetAudience: 'Tech founders, developers & builders',
    notes: '10-slide carousel breakdown comparing new benchmark scores, coding latency, and context window sizes.',
    createdAt: '2026-09-26T09:00:00.000Z',
    updatedAt: '2026-09-26T09:00:00.000Z'
  },
  {
    id: 'idea-4',
    title: 'Top Useful AI Websites for Everyday Productivity',
    pillarId: 'ai-tools',
    platform: 'Instagram Reels',
    status: 'APPROVED',
    scheduledDate: '2026-09-27',
    targetAudience: 'Students, professionals & creators',
    estimatedDuration: '30s',
    notes: 'Curated list of 3 high-utility web tools for instant UI generation, background cleanup, and document summarization.',
    createdAt: '2026-09-24T11:00:00.000Z',
    updatedAt: '2026-09-26T12:00:00.000Z'
  },
  {
    id: 'idea-5',
    title: 'How Autonomous AI Workflows Actually Connect APIs',
    pillarId: 'flash-builds',
    platform: 'Instagram Reels',
    status: 'IDEA',
    scheduledDate: '2026-10-05',
    targetAudience: 'Engineers, builders & automation architects',
    estimatedDuration: '30s',
    notes: 'Visual breakdown showing webhook trigger nodes, LLM schema parsing, and database sync.',
    createdAt: '2026-09-26T11:30:00.000Z',
    updatedAt: '2026-09-26T11:30:00.000Z'
  }
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'content-item-1',
    ideaId: 'idea-approval-1',
    title: '5 AI Tools That Save Hours Every Week',
    pillarId: 'ai-tools',
    platform: 'Instagram Reels',
    videoDuration: '30s',
    tone: 'Authoritative & Sharp',
    targetAudience: 'Creators, developers & tech enthusiasts',
    cta: 'Save for your next project',
    status: 'REVIEW',
    scheduledDate: '2026-09-28',
    scheduledTime: '11:30',
    timezone: 'Asia/Kolkata',
    mediaType: 'REELS',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43400-large.mp4',
    version: 1,
    createdAt: '2026-09-26T10:00:00.000Z',
    updatedAt: '2026-09-26T10:00:00.000Z',
    variant: {
      id: 'var-1',
      platform: 'Instagram Reels',
      hook: 'These 5 AI tools will save you at least 15 hours every single week.',
      hookRetentionCue: 'Fast kinetic card transitions showing 5 clean AI tool dashboards with instant utility.',
      videoConcept: 'High tempo breakdown of 5 practical AI tools for document parsing, intelligent code generation, voice synthesis, automated research, and spreadsheet analysis.',
      shortScript: `[00:00 - 00:04] HOOK: These 5 AI tools will save you at least 15 hours every single week. Save this before you forget.
[00:04 - 00:10] TOOL 1: Tool number one extracts clean tables and structured data directly from messy PDFs in seconds.
[00:10 - 00:16] TOOL 2: Tool number two turns raw messy voice notes into formatted documentation and team tasks.
[00:16 - 00:22] TOOL 3: Tool number three organizes unstructured spreadsheets and highlights anomalies automatically.
[00:22 - 00:26] TOOL 4-5: Plus tools for instant code refactoring and automated research summaries.
[00:26 - 00:30] CTA: These tools are moving AI directly into everyday workflows. Follow @flash_ai_digital for daily discoveries!`,
      onScreenText: [
        '00:00 - ⚡ 5 AI Tools (Save 15+ Hours/Wk)',
        '00:05 - 1. PDF ➡️ Structured Data 📄',
        '00:11 - 2. Voice Note ➡️ Formatted Docs 🎙️',
        '00:17 - 3. Messy CSV ➡️ Smart Insights 📊',
        '00:23 - 4. Automated Research & Code 🛠️',
        '00:27 - 💡 Save for Later | @flash_ai_digital'
      ],
      caption: `5 AI tools that make everyday work 10x faster 👇

Stop wasting hours on manual tasks that modern AI tools can handle in seconds:

⚡ 1. PDF Data Extractor: Pull structured tables and numbers from raw documents.
⚡ 2. Voice-to-Doc Engine: Transform voice notes into formatted SOPs.
⚡ 3. Smart Sheet Analyzer: Query raw CSV files with natural language.
⚡ 4. Code & Refactor Assistant: Instant syntax and logic optimizations.
⚡ 5. Research Synthesizer: Summarize multi-page papers in seconds.

Which of these 5 would help your workflow the most?

📌 Save this Reel for later!
Follow @flash_ai_digital for daily AI tools, model updates & tutorials.`,
      cta: 'Save this for your next project and follow @flash_ai_digital!',
      hashtags: {
        niche: ['#AITools', '#ProductivityTools', '#UsefulWebsites', '#FLASHai'],
        broad: ['#ArtificialIntelligence', '#MachineLearning', '#TechTrends'],
        viral: ['#TechReels', '#FutureOfWork', '#AIEveryday']
      },
      qualityScore: 98,
      usedRealAI: true,
      modelName: 'gemini-2.0-flash'
    }
  },
  {
    id: 'content-item-2',
    ideaId: 'idea-approval-2',
    title: 'How AI Can Turn a Messy Spreadsheet Into Useful Insights',
    pillarId: 'ai-automation',
    platform: 'Instagram Reels',
    videoDuration: '30s',
    tone: 'Educational & Step-by-Step',
    targetAudience: 'Data analysts, managers & operators',
    cta: 'Save for your next project',
    status: 'APPROVED',
    scheduledDate: '2026-09-27',
    scheduledTime: '18:45',
    timezone: 'Asia/Kolkata',
    mediaType: 'REELS',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4',
    version: 1,
    createdAt: '2026-09-26T11:00:00.000Z',
    updatedAt: '2026-09-26T14:20:00.000Z',
    variant: {
      id: 'var-2',
      platform: 'Instagram Reels',
      hook: 'Before AI: 4 hours formatting messy spreadsheet columns. After: 3 seconds.',
      hookRetentionCue: 'Split screen showing messy raw unformatted data instantly transforming into clean visual graphs.',
      videoConcept: 'Visual transformation showing messy unorganized rows converted into categorized data and automated charts in 3 seconds.',
      shortScript: `[00:00 - 00:04] HOOK: Before AI: 4 hours formatting messy spreadsheet columns. After: 3 seconds.
[00:04 - 00:12] THE PROBLEM: Raw exports come with missing headers, mismatched dates, and inconsistent categories.
[00:12 - 00:22] THE SOLUTION: Feed the raw data into an AI reasoning pipeline. It automatically parses schemas, normalizes formats, and generates instant executive charts.
[00:22 - 00:30] CTA: Save this workflow for your next spreadsheet project and follow @flash_ai_digital!`,
      onScreenText: [
        '00:00 - 📊 Messy Spreadsheet ➡️ Clean Insights',
        '00:05 - ⚠️ Unformatted Rows & Mismatched Data',
        '00:13 - ⚡ AI Auto-Normalization in 3 Seconds',
        '00:24 - 💡 Save for Later | @flash_ai_digital'
      ],
      caption: `Never spend hours cleaning up spreadsheet columns manually again. 📊

Here is how modern AI models turn messy raw CSV files into executive insights in seconds:
🔹 Instant schema detection
🔹 Automatic data normalization
🔹 Zero-shot trend & anomaly highlighting

📌 Save this workflow for later!
Follow @flash_ai_digital for practical AI tips & workflows.`,
      cta: 'Save this workflow for your next project!',
      hashtags: {
        niche: ['#DataAnalytics', '#SpreadsheetHacks', '#AIAutomation', '#FLASHai'],
        broad: ['#ProductivityTools', '#BusinessTech', '#TechTrends2026'],
        viral: ['#WorkSmarter', '#StartupGrowth', '#AITools']
      },
      qualityScore: 96,
      usedRealAI: true,
      modelName: 'gemini-2.0-flash'
    }
  },
  {
    id: 'content-item-3',
    ideaId: 'idea-pub-1',
    title: 'Why Traditional Contact Forms Are Dead: The WhatsApp AI Shift',
    pillarId: 'whatsapp-automation',
    platform: 'Instagram Reels',
    videoDuration: '30s',
    tone: 'Educational & Step-by-Step',
    targetAudience: 'Local service businesses, clinics & consultants',
    cta: 'WhatsApp Us Directly',
    status: 'PUBLISHED',
    scheduledDate: '2026-09-24',
    scheduledTime: '18:30',
    timezone: 'Asia/Kolkata',
    publishedAt: '2026-09-24T18:30:00.000Z',
    publishedMediaId: '18029384756192834',
    publishedUrl: 'https://instagram.com/p/DAX_MockOfficialPost1/',
    mediaType: 'REELS',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43400-large.mp4',
    version: 1,
    createdAt: '2026-09-23T14:00:00.000Z',
    updatedAt: '2026-09-24T18:30:00.000Z',
    variant: {
      id: 'var-3',
      platform: 'Instagram Reels',
      hook: 'No one wants to fill out a 10-field contact form and wait 3 business days for an email reply.',
      hookRetentionCue: 'Split screen showing a frustrating red "Submit Form" wheel spinning vs an instant green WhatsApp conversation.',
      videoConcept: 'Visual comparison between high friction contact forms vs immediate WhatsApp conversational qualification.',
      shortScript: `[00:00 - 00:05] HOOK: No one wants to fill out a 10-field contact form and wait 3 days for an email.
[00:05 - 00:12] THE PROBLEM: 78% of website visitors bounce the moment they see a tedious form asking for phone, company size, and budget.
[00:12 - 00:22] THE SOLUTION: When we swapped a static form for a 1-click WhatsApp AI button, lead conversion increased by 240%. The bot asks questions naturally and locks in the meeting on the spot.
[00:22 - 00:30] CTA: Want to experience it live? Tap our WhatsApp link in bio to test the FLASH.Ai smart assistant right now!`,
      onScreenText: [
        '00:00 - Contact Forms Are DEAD ☠️',
        '00:06 - 78% Bounce Rate on Long Forms 📉',
        '00:13 - WhatsApp AI = +240% Inquiries 🚀',
        '00:23 - Test the Live Bot in Bio 💬'
      ],
      caption: `If your website still relies on a "Contact Us" form from 2015, you are bleeding conversions every single day. 📉

Modern customers demand instant answers. When they see a 1-click WhatsApp button powered by a trained AI assistant:
✅ Response time drops from 6 hours to 2 seconds
✅ Lead completion rate jumps by over 200%
✅ Appointments get automatically confirmed in Google Calendar

Try it out yourself: Tap the WhatsApp button on our profile (@flash.ai) and chat with our assistant! ⚡`,
      cta: 'Tap the WhatsApp link on our profile to test the live assistant.',
      hashtags: {
        niche: ['#WhatsAppAutomation', '#ChatbotMarketing', '#LeadFunnel', '#WebsiteConversion'],
        broad: ['#BusinessAutomation', '#CustomerExperience', '#DigitalAgency'],
        viral: ['#ConversionRateOptimization', '#TechForBusiness']
      },
      qualityScore: 96,
      usedRealAI: true,
      modelName: 'gemini-2.0-flash'
    }
  }
];

export const INITIAL_PUBLISHING_JOBS: PublishingJob[] = [
  {
    id: 'job-seed-1',
    contentId: 'content-item-3',
    contentTitle: 'Why Traditional Contact Forms Are Dead: The WhatsApp AI Shift',
    pillarId: 'whatsapp-automation',
    platform: 'Instagram Reels',
    mediaType: 'REELS',
    mediaUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-computer-43400-large.mp4',
    caption: 'If your website still relies on a Contact Us form from 2015, you are bleeding conversions every single day. 📉',
    status: 'PUBLISHED',
    createdAt: '2026-09-24T18:00:00.000Z',
    startedAt: '2026-09-24T18:28:00.000Z',
    completedAt: '2026-09-24T18:30:00.000Z',
    externalMediaId: '18029384756192834',
    containerId: '179998822334455',
    retryCount: 0,
    isDemo: true,
    permalink: 'https://instagram.com/p/DAX_MockOfficialPost1/'
  }
];

export const INITIAL_ACTIVITY_LOGS: PublishingActivityLogItem[] = [
  {
    id: 'log-seed-1',
    timestamp: '2026-09-24T18:30:00.000Z',
    action: 'Published successfully',
    contentTitle: 'Why Traditional Contact Forms Are Dead: The WhatsApp AI Shift',
    status: 'SUCCESS',
    message: 'Media published to Instagram Reels container ID: 179998822334455. External Media ID: 18029384756192834 (Demo Mode).',
    jobId: 'job-seed-1',
    metaPostId: '18029384756192834',
    isDemo: true
  },
  {
    id: 'log-seed-2',
    timestamp: '2026-09-26T10:00:00.000Z',
    action: 'Connection verified',
    contentTitle: 'Meta Graph API Engine',
    status: 'INFO',
    message: 'Meta Instagram Service initialized in DEMO mode. Real credentials pending in environment variables.',
    isDemo: true
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Dr. Arjun Verma',
    business: 'Aura Skin & Dental Clinics (3 locations)',
    platform: 'Instagram DM',
    source: 'Reel: WhatsApp AI Assistant',
    requirement: 'Automated 24/7 appointment scheduling & consultation deposit collection across 3 branches.',
    status: 'QUALIFIED',
    date: '2026-09-26',
    notes: 'Very interested in reducing front-desk workload. Requested demo call for Tuesday 4 PM.',
    contactInfo: {
      handle: '@dr.arjun_auraclinic',
      phone: '+91 98201 44521',
      email: 'arjun@auraclinics.in'
    },
    estimatedDealValue: 85000,
    createdAt: '2026-09-26T09:30:00.000Z',
    updatedAt: '2026-09-26T11:00:00.000Z'
  },
  {
    id: 'lead-2',
    name: 'Sarah Chen',
    business: 'Elevate Commerce (Shopify Brand)',
    platform: 'Instagram Comment',
    source: 'Reel: DM Automation',
    requirement: 'Auto-reply to Instagram comments on ad campaigns with direct discount code link and customer support routing.',
    status: 'PROPOSAL',
    date: '2026-09-25',
    notes: 'Sent formal proposal for FLASH.Ai custom DM workflow. Follow-up scheduled for Monday.',
    contactInfo: {
      handle: '@sarah_elevateshop',
      email: 'sarah@elevatebrand.co'
    },
    estimatedDealValue: 120000,
    createdAt: '2026-09-25T15:00:00.000Z',
    updatedAt: '2026-09-26T10:15:00.000Z'
  },
  {
    id: 'lead-3',
    name: 'Rajesh Mehta',
    business: 'Mehta Logistics & Warehousing',
    platform: 'WhatsApp',
    source: 'Website Bio Link (WhatsApp Direct)',
    requirement: 'Automated consignment status tracking bot for shipment updates via WhatsApp API.',
    status: 'WON',
    date: '2026-09-24',
    notes: 'Contract signed! Deployment sprint started. Milestone 1 scheduled for delivery next Friday.',
    contactInfo: {
      phone: '+91 98765 12345',
      email: 'rajesh@mehtalogistics.com'
    },
    estimatedDealValue: 210000,
    createdAt: '2026-09-24T10:00:00.000Z',
    updatedAt: '2026-09-25T17:00:00.000Z'
  },
  {
    id: 'lead-4',
    name: 'Vikram Malhotra',
    business: 'Apex Fitness Studios',
    platform: 'Instagram Story Reply',
    source: 'Story: Client Build Teardown',
    requirement: 'Membership inquiry triage and class trial booking automation.',
    status: 'CONTACTED',
    date: '2026-09-26',
    notes: 'Sent initial questions regarding current CRM and trial booking flow.',
    contactInfo: {
      handle: '@vikram_apexfit',
      phone: '+91 98450 67123'
    },
    estimatedDealValue: 40000,
    createdAt: '2026-09-26T12:00:00.000Z',
    updatedAt: '2026-09-26T13:45:00.000Z'
  },
  {
    id: 'lead-5',
    name: 'Kavita Joshi',
    business: 'LegalEase Corporate Consultants',
    platform: 'Website',
    source: 'Direct Website Strategy Form',
    requirement: 'Document summarizer & client intake automated workflow.',
    status: 'NEW',
    date: '2026-09-26',
    notes: 'New inquiry received 1 hour ago. Needs review and initial qualification response.',
    contactInfo: {
      email: 'kavita@legalease.co.in',
      phone: '+91 98190 55678'
    },
    estimatedDealValue: 95000,
    createdAt: '2026-09-26T14:00:00.000Z',
    updatedAt: '2026-09-26T14:00:00.000Z'
  }
];

export const INITIAL_ANALYTICS: AnalyticsSnapshot = {
  id: 'snap-current',
  isDemoData: true,
  period: '30d',
  views: 48920,
  reach: 34150,
  likes: 2840,
  comments: 418,
  shares: 612,
  saves: 1145,
  profileVisits: 3290,
  followersGained: 462,
  leadsGenerated: 24,
  engagementRate: 5.8,
  recordedAt: '2026-09-26T12:00:00.000Z'
};

export const INITIAL_SETTINGS: AutomationSetting = {
  instagram: {
    isConnected: true,
    businessAccountId: '17841436234295944',
    pageId: '109283746501928',
    appId: '1086941427246430',
    appSecretPlaceholder: '••••••••••••••••••••••••••••••••',
    userAccessTokenPlaceholder: 'EAAG...[Long-Lived Meta User Token Configured]',
    autoPublishEnabled: false,
    requireManualApproval: true,
    webhookUrl: 'https://flash-ai.app/api/meta/webhook',
    apiVersion: 'v21.0',
    publishingMode: 'LIVE',
    defaultTimezone: 'Asia/Kolkata'
  },
  aiProvider: {
    activeProvider: 'gemini',
    apiKeyPlaceholder: 'AIzaSy...[Your Google Gemini API Key]',
    model: 'gemini-2.0-flash',
    temperature: 0.7,
    maxTokens: 2048
  },
  brandPreferences: {
    brandName: 'FLASH.Ai',
    tagline: 'Curated AI Tools & Autonomous Workflows',
    targetAudience: 'Creators, developers, founders & productivity seekers',
    primaryGeography: 'Global, US, India Remote',
    defaultCTA: 'Save for Your Next Project',
    customCTALink: 'https://flash.ai',
    whatsappNumber: '+91 98000 00000',
    brandKeywords: ['AI Tools', 'Model Updates', 'Productivity', 'Agentic Workflows', 'Tutorials'],
    forbiddenWords: ['Crypto', 'Guaranteed Rich Overnight', 'Get Rich Quick', 'Spam DM'],
    defaultHashtags: ['#FLASHai', '#AITools', '#AIAutomation', '#TechTrends', '#Productivity']
  },
  publishing: {
    defaultPostingHours: ['11:30', '18:45', '21:15'],
    timezone: 'Asia/Kolkata (IST) UTC+5:30',
    autoHashtagPlacement: 'caption',
    defaultVideoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42898-large.mp4'
  },
  notifications: {
    emailAlerts: true,
    notificationEmail: 'team@flash.ai',
    telegramAlerts: true,
    telegramBotTokenPlaceholder: '••••••••••••:•••••••••••••••••••••••••••••••••••',
    telegramChatId: '198273645',
    soundEnabled: true
  }
};
