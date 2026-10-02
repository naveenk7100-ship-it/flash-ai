import type { PipelineStage } from '../types';

export const AUTOMATION_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: '1-topic-finder',
    name: '1. Topic Finder',
    description: 'Monitors viral trends, industry bottlenecks, and target audience questions across AI automation & business niches.',
    status: 'active',
    icon: 'Compass',
    substeps: [
      'Scan Reddit/Twitter/Instagram for SMB automation pain points',
      'Categorize by 8 FLASH.Ai Content Pillars',
      'Score virality potential and audience relevance'
    ]
  },
  {
    id: '2-content-planner',
    name: '2. Content Planner',
    description: 'Schedules calendar slots, assigns pillar weights, manages idea statuses, and prevents content overlap.',
    status: 'active',
    icon: 'Calendar',
    substeps: [
      'Assign posting date & target platform',
      'Track lifecycle: IDEA ➔ SCRIPT ➔ CREATIVE ➔ REVIEW',
      'Balance pillar distribution for consistent authority'
    ]
  },
  {
    id: '3-ai-script-generator',
    name: '3. AI Script Generator',
    description: 'Generates high-retention hooks, problem-solution breakdowns, and time-stamped video scripts.',
    status: 'active',
    icon: 'Sparkles',
    substeps: [
      'Formulate retention-engineered visual hooks (0-3s)',
      'Construct timed script sections (Problem, Demo, Proof)',
      'Integrate specific FLASH.Ai trigger keywords for DM lead capture'
    ]
  },
  {
    id: '4-creative-generator',
    name: '4. Creative Generator',
    description: 'Prepares on-screen text overlays, caption formatting, slide layouts, and targeted hashtag packages.',
    status: 'active',
    icon: 'Layers',
    substeps: [
      'Generate timed on-screen text cues',
      'Format Instagram-optimized caption with bulleted takeaways',
      'Bundle niche, broad, and viral hashtag clusters'
    ]
  },
  {
    id: '5-approval-queue',
    name: '5. Approval Queue',
    description: 'Human-in-the-loop review station ensuring brand integrity, tone precision, and compliance before publication.',
    status: 'manual_review',
    icon: 'CheckCircle2',
    substeps: [
      'Simulate mobile Instagram feed / Reels view',
      'Single-click Approve, Edit, Regenerate, or Reject',
      'Maintain strict editorial quality control'
    ]
  },
  {
    id: '6-instagram-publisher',
    name: '6. Instagram Publisher (Meta Graph API)',
    description: 'Official Meta Graph API v21.0 publishing container workflow with automatic status polling & live publishing.',
    status: 'active',
    icon: 'Share2',
    substeps: [
      'Upload media to Meta Graph API media container (/media)',
      'Poll container transcoding status until FINISHED',
      'Dispatch /media_publish request with safety switch (DEMO/LIVE)'
    ]
  },
  {
    id: '7-engagement-webhooks',
    name: '7. Meta Webhook & Engagement Receiver',
    description: 'Real-time webhook listener for comments and direct messages with HMAC-SHA256 signature verification.',
    status: 'active',
    icon: 'Zap',
    substeps: [
      'Meta Graph API v21.0 webhook challenge verification',
      'HMAC-SHA256 signature security check',
      'Ingest Reel comments and Direct Messages in real-time'
    ]
  },
  {
    id: '8-keyword-intent-classifier',
    name: '8. Keyword & Intent Classifier',
    description: 'Natural language intent classification and keyword extraction engine with safety cooldown and anti-looping.',
    status: 'active',
    icon: 'Sparkles',
    substeps: [
      'Detect trigger keywords (AUTOMATE, WHATSAPP, PRICE, DEMO)',
      'Classify client intent (AUTOMATION, PRICING, DEMO, etc.)',
      'Dispatch automated template response with 3-minute cooldown'
    ]
  },
  {
    id: '9-analytics-collector',
    name: '9. Analytics & Performance Collector',
    description: 'Collects organic video views, reach, saves, shares, comments, and profile click metrics via Graph API.',
    status: 'active',
    icon: 'BarChart3',
    substeps: [
      'Fetch 24h, 7d, and 30d performance snapshots',
      'Track engagement rate (%) vs account baseline',
      'Correlate video topics with subsequent lead generation'
    ]
  },
  {
    id: '10-lead-tracker',
    name: '10. Lead CRM & Activity Timeline',
    description: 'Deduplicates inbound prospects by Instagram ID, creates CRM leads, and logs full activity audit timeline.',
    status: 'active',
    icon: 'Users',
    substeps: [
      'Auto-create/deduplicate leads from Instagram DMs and comments',
      'Track deal pipeline: NEW ➔ CONTACTED ➔ QUALIFIED ➔ WON',
      'Attribute closed revenue and log full interaction timeline'
    ]
  }
];
