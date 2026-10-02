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
    title: 'How to Build a WhatsApp AI Booking Assistant in 15 Minutes',
    pillarId: 'whatsapp-automation',
    platform: 'Instagram Reels',
    status: 'SCRIPT',
    scheduledDate: '2026-09-28',
    targetAudience: 'Doctors, Salons, and Appointment-based businesses',
    estimatedDuration: '60s',
    notes: 'Highlight 24/7 instant response and zero missed bookings. Show live phone screen demo.',
    createdAt: '2026-09-25T10:00:00.000Z',
    updatedAt: '2026-09-25T14:30:00.000Z'
  },
  {
    id: 'idea-2',
    title: '5 Costly Manual Mistakes Local Business Owners Make Daily',
    pillarId: 'ai-automation',
    platform: 'Instagram Reels',
    status: 'IDEA',
    scheduledDate: '2026-09-30',
    targetAudience: 'Local business owners and retail operators',
    estimatedDuration: '30s',
    notes: 'Focus on manual data entry, missed inquiries after 8 PM, and delayed invoice follow-ups.',
    createdAt: '2026-09-26T08:15:00.000Z',
    updatedAt: '2026-09-26T08:15:00.000Z'
  },
  {
    id: 'idea-3',
    title: 'Why Slow Websites Destroy 60% of Your Ad Budget in 2026',
    pillarId: 'website-solutions',
    platform: 'Instagram Carousels',
    status: 'IDEA',
    scheduledDate: '2026-10-02',
    targetAudience: 'E-commerce founders and service providers spending on Meta ads',
    notes: '10-slide carousel teardown comparing 4-second load time vs 0.8s load time conversion rates.',
    createdAt: '2026-09-26T09:00:00.000Z',
    updatedAt: '2026-09-26T09:00:00.000Z'
  },
  {
    id: 'idea-4',
    title: 'FLASH.Ai Client Build: Lead Auto-Qualifier for Real Estate Agency',
    pillarId: 'flash-builds',
    platform: 'Instagram Reels',
    status: 'APPROVED',
    scheduledDate: '2026-09-27',
    targetAudience: 'High-ticket service firms & Realtors',
    estimatedDuration: '60s',
    notes: 'Case study format: 400+ leads processed, 80% spam filtered, sales team only speaks to qualified buyers.',
    createdAt: '2026-09-24T11:00:00.000Z',
    updatedAt: '2026-09-26T12:00:00.000Z'
  },
  {
    id: 'idea-5',
    title: 'Behind the Scenes: Inside the FLASH.Ai Multi-Agent Architecture',
    pillarId: 'behind-the-scenes',
    platform: 'Instagram Reels',
    status: 'IDEA',
    scheduledDate: '2026-10-05',
    targetAudience: 'Tech founders, developers & creators',
    estimatedDuration: '30s',
    notes: 'Show our dual-monitor terminal, code architecture, and AI agents collaborating in real-time.',
    createdAt: '2026-09-26T11:30:00.000Z',
    updatedAt: '2026-09-26T11:30:00.000Z'
  }
];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'content-item-1',
    ideaId: 'idea-approval-1',
    title: 'Turn Instagram Comments into Booked Sales Calls with AI',
    pillarId: 'lead-generation',
    platform: 'Instagram Reels',
    videoDuration: '30s',
    tone: 'Authoritative & Sharp',
    targetAudience: 'Coaches, Agencies, and B2B Consultants',
    cta: 'DM "AUTOMATE"',
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
      hook: 'If you still reply to Instagram DMs manually, you are leaving 70% of your revenue on the table.',
      hookRetentionCue: 'Start with a fast zoom on a smartphone showing 50 unread DMs blowing up.',
      videoConcept: 'Fast-paced demonstration showing how a user comments "AUTOMATE" and instantly receives an AI-guided consultation link and qualification question in 3 seconds.',
      shortScript: `[00:00 - 00:03] HOOK: If you still reply to Instagram DMs manually, you are losing 70% of your warmest leads.
[00:03 - 00:09] PROBLEM: When someone comments on your Reel at 11 PM, they want an answer right now. Waiting 8 hours to reply means they already hired your competitor.
[00:09 - 00:18] SOLUTION: Here is how FLASH.Ai solves this: When a prospect comments "AUTOMATE", our agent instantly delivers the exact resource, asks 2 qualification questions, and schedules them into your calendar.
[00:18 - 00:25] VALUE: Zero manual triage. 24/7 speed. 3x higher booking rate.
[00:25 - 00:30] CTA: DM "AUTOMATE" and we'll send you our free DM automation setup blueprint!`,
      onScreenText: [
        '00:00 - ⚠️ Manual DMs = Lost Revenue',
        '00:04 - ⏰ Instant Reply vs 8-Hour Delay',
        '00:10 - 🤖 AI Lead Auto-Qualifier in Action',
        '00:20 - 📈 3x Higher Booking Rate',
        '00:26 - 👉 DM "AUTOMATE" for Free Blueprint'
      ],
      caption: `Most founders lose high-ticket clients not because their service is bad, but because they reply too slow. ⏳

When a warm prospect reaches out on Instagram at 11:30 PM, they want an answer immediately. If you reply the next morning, the buying impulse is gone.

Here is what our FLASH.Ai automated lead qualification engine does in 2 seconds flat:
1️⃣ Detects comment triggers automatically
2️⃣ Sends private DM with personalized resource
3️⃣ Qualifies budget & timeline in 2 natural questions
4️⃣ Syncs booking straight to your calendar & CRM

Stop losing revenue to slow response times.

💬 DM "AUTOMATE" to get our step-by-step DM Automation Blueprint!

---
Follow @flash.ai for real business automation workflows.`,
      cta: 'DM "AUTOMATE" to get the free setup blueprint.',
      hashtags: {
        niche: ['#AIAutomation', '#InstagramAutomation', '#LeadGenEngine', '#FLASHai'],
        broad: ['#BusinessAutomation', '#SmallBusinessGrowth', '#MarketingTech'],
        viral: ['#AgencyGrowth', '#SalesFunnel', '#ProductivityHacks']
      },
      qualityScore: 98,
      usedRealAI: true,
      modelName: 'gemini-2.0-flash'
    }
  },
  {
    id: 'content-item-2',
    ideaId: 'idea-approval-2',
    title: '3 Zero-Cost AI Workflows Every Small Business Should Run This Week',
    pillarId: 'ai-tools',
    platform: 'Instagram Reels',
    videoDuration: '30s',
    tone: 'Educational & Step-by-Step',
    targetAudience: 'Small business owners, solo founders, freelancers',
    cta: 'Check Link in Bio',
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
      hook: 'These 3 free AI tools will save your business at least 20 hours every single week.',
      hookRetentionCue: 'Presenter points up as 3 neon glowing tool cards appear on screen with sound effects.',
      videoConcept: 'High tempo breakdown of 3 practical AI tools for document parsing, instant voice note transcription to SOP, and automated invoice extraction.',
      shortScript: `[00:00 - 00:04] HOOK: These 3 free AI tools will save your business 20 hours a week. Bookmark this before you forget.
[00:04 - 00:14] TOOL 1: Tool number one is automated voice-to-SOP. Record a messy 2-minute voice note, and it turns into a formatted operational procedure and team task in ClickUp.
[00:14 - 00:24] TOOL 2: Tool number two is multi-modal invoice reader. Take a photo of any receipt, and it auto-logs vendor, tax, and total directly into your Google Sheet.
[00:24 - 00:34] TOOL 3: Tool number three is 24/7 customer triage agent that handles first-line inquiries across WhatsApp & Instagram.
[00:34 - 00:45] CTA: We built a curated library of these 20+ automation templates. Tap the link in bio to grab your free copy!`,
      onScreenText: [
        '00:00 - 3 Free AI Tools (Save 20 hrs/wk) ⏱️',
        '00:05 - 1. Voice Note ➡️ Standard Operating Procedure 🎙️',
        '00:15 - 2. Receipt Scan ➡️ Auto Spreadsheet 📊',
        '00:25 - 3. Multi-Channel 24/7 AI Triage 🤖',
        '00:35 - Free Template Library in Bio 🔗'
      ],
      caption: `Stop wasting founder hours on admin tasks a smart script can do in 3 seconds. ⚡

Here are 3 zero-cost AI automations every small business should run:
🔹 Voice-to-SOP: Turn raw ramblings into crystal-clear team documentation.
🔹 Smart Receipt Parser: Never manually type expense receipts into spreadsheets again.
🔹 First-Line Customer Triage: Instant replies across Instagram and WhatsApp without hiring extra support.

Which of these 3 would help your workflow the most? Drop your answer in the comments! 👇

🔗 Grab our full curated AI Automation Toolkit from the link in bio (@flash.ai).`,
      cta: 'Tap the link in bio to download the complete AI Automation Toolkit.',
      hashtags: {
        niche: ['#AIToolsForBusiness', '#WorkflowAutomation', '#NoCodeAI', '#SmallBizOps'],
        broad: ['#ProductivityTools', '#BusinessTech', '#TechTrends2026', '#AutomationEngine'],
        viral: ['#WorkSmarter', '#StartupGrowth', '#AITools']
      },
      qualityScore: 95,
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
    isConnected: false,
    businessAccountId: '17841400000000000',
    pageId: '109283746501928',
    appId: '891029384756102',
    appSecretPlaceholder: '••••••••••••••••••••••••••••••••',
    userAccessTokenPlaceholder: 'EAAG...[Enter Long-Lived Meta User Token]',
    autoPublishEnabled: false,
    requireManualApproval: true,
    webhookUrl: 'https://api.flash.ai/v1/webhooks/instagram',
    apiVersion: 'v21.0',
    publishingMode: 'DEMO',
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
    tagline: 'AI Automation & Digital Solutions',
    targetAudience: 'Small businesses, local clinics, startups, creators and business owners',
    primaryGeography: 'India, US, Global Remote',
    defaultCTA: 'DM "AUTOMATE"',
    customCTALink: 'https://flash.ai/audit',
    whatsappNumber: '+91 98000 00000',
    brandKeywords: ['AI Automation', 'Speed', 'Direct ROI', 'Zero Busywork', 'WhatsApp Systems'],
    forbiddenWords: ['Crypto', 'Guaranteed Rich Overnight', 'Cheap', 'Free Forever'],
    defaultHashtags: ['#FLASHai', '#AIAutomation', '#BusinessGrowth', '#SmallBizTech', '#AutomationTools']
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
