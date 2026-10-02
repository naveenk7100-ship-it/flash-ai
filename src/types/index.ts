export type ContentPillarId =
  | 'ai-tools'
  | 'ai-automation'
  | 'ai-news-update'
  | 'practical-tutorials'
  | 'ai-explainers'
  | 'flash-builds'
  | 'business-growth'
  | 'website-solutions'
  | 'whatsapp-automation'
  | 'lead-generation'
  | 'behind-the-scenes';

export type ContentStatus =
  | 'IDEA'
  | 'SCRIPT'
  | 'CREATIVE'
  | 'REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

export type PlatformType =
  | 'Instagram Reels'
  | 'Instagram Carousels'
  | 'Instagram Stories'
  | 'Instagram Single Post'
  | 'LinkedIn Post'
  | 'Twitter/X Thread';

export type VideoDuration = '15s' | '30s' | '60s' | '90s';

export type ToneType =
  | 'Authoritative & Sharp'
  | 'High Energy & Viral'
  | 'Educational & Step-by-Step'
  | 'Conversational & Storytelling'
  | 'Problem-Agitate-Solve';

export type CTAType =
  | 'Save for Your Next Project'
  | 'Save for your next project'
  | 'Follow @flash_ai_digital'
  | 'Explore Curated AI Tools'
  | 'Try This AI Workflow'
  | 'Which Tool Would You Use?'
  | 'Check Link in Bio'
  | 'Save for Later'
  | 'Book Strategy Call'
  | 'DM "AUTOMATE"'
  | 'Comment "GROWTH"'
  | 'Free AI Audit'
  | 'WhatsApp Us Directly';

export type ContentAngle =
  | 'Problem'
  | 'Mistake'
  | 'Before/After'
  | 'How-to'
  | 'Demo'
  | 'Myth'
  | 'Comparison'
  | 'Case study'
  | 'Behind the scenes'
  | 'Tool discovery';

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'REPLIED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'WON'
  | 'LOST';

export type LeadPlatform =
  | 'Instagram DM'
  | 'Instagram Comment'
  | 'Instagram Story Reply'
  | 'WhatsApp'
  | 'Website'
  | 'LinkedIn'
  | 'Referral';

export type PublishingStatus =
  | 'DRAFT'
  | 'READY'
  | 'QUEUED'
  | 'UPLOADING'
  | 'PROCESSING'
  | 'READY_TO_PUBLISH'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'CANCELLED';

export type MediaType = 'REELS' | 'IMAGE' | 'CAROUSEL' | 'STORY';

export type PublishingMode = 'DEMO' | 'LIVE';

export interface ContentPillar {
  id: ContentPillarId;
  name: string;
  description: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  iconName: string;
  defaultAudience: string;
  suggestedTopics: string[];
}

export interface ContentIdea {
  id: string;
  title: string;
  pillarId: ContentPillarId;
  platform: PlatformType;
  status: ContentStatus;
  scheduledDate?: string;
  targetAudience: string;
  estimatedDuration?: VideoDuration;
  notes?: string;
  angle?: ContentAngle;
  createdAt: string;
  updatedAt: string;
}

export interface ContentVariant {
  id: string;
  platform: PlatformType;
  hook: string;
  hookRetentionCue?: string;
  videoConcept: string;
  shortScript: string;
  onScreenText: string[];
  caption: string;
  cta: string;
  hashtags: {
    niche: string[];
    broad: string[];
    viral: string[];
  };
  angle?: ContentAngle;
  usedRealAI?: boolean;
  qualityScore?: number;
  modelName?: string;
}

export interface ContentItem {
  id: string;
  ideaId?: string;
  title: string;
  pillarId: ContentPillarId;
  platform: PlatformType;
  videoDuration: VideoDuration;
  tone: ToneType;
  targetAudience: string;
  cta: CTAType;
  angle?: ContentAngle;
  status: ContentStatus;
  scheduledDate?: string;
  scheduledTime?: string;
  timezone?: string;
  publishedAt?: string;
  publishedMediaId?: string;
  publishedUrl?: string;
  mediaUrl?: string;
  mediaType?: MediaType;
  variant: ContentVariant;
  rejectionReason?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationHistoryItem {
  id: string;
  topic: string;
  pillarId: ContentPillarId;
  platform: PlatformType;
  videoDuration: VideoDuration;
  tone: ToneType;
  targetAudience: string;
  cta: CTAType;
  angle?: ContentAngle;
  variant: ContentVariant;
  usedRealAI: boolean;
  modelName?: string;
  generatedAt: string;
  status: 'draft' | 'approved' | 'rejected' | 'queued';
  performanceNotes?: string;
}

export interface PublishingJob {
  id: string;
  contentId: string;
  contentTitle: string;
  pillarId: ContentPillarId;
  mediaType: MediaType;
  mediaUrl: string;
  caption: string;
  status: PublishingStatus;
  createdAt: string;
  scheduledFor?: string;
  timezone?: string;
  startedAt?: string;
  completedAt?: string;
  externalMediaId?: string;
  containerId?: string;
  errorMessage?: string;
  retryCount: number;
  isDemo: boolean;
  permalink?: string;
  platform: PlatformType;
}

export interface PublishingActivityLogItem {
  id: string;
  timestamp: string;
  action: string;
  contentTitle: string;
  status: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROCESSING';
  message: string;
  jobId?: string;
  metaPostId?: string;
  isDemo?: boolean;
}

export interface MetaAccountInfo {
  id: string;
  username: string;
  name: string;
  accountType?: 'BUSINESS' | 'CREATOR' | 'PERSONAL' | 'UNKNOWN';
  profilePictureUrl?: string;
  mediaCount?: number;
  followersCount?: number;
  apiVersion: string;
  isConnected: boolean;
  mode: PublishingMode;
  permissions: string[];
  missingPermissions?: string[];
  tokenExpiresIn?: string;
  lastVerifiedAt?: string;
}

export interface AnalyticsSnapshot {
  id: string;
  contentItemId?: string;
  isDemoData: boolean;
  period: '7d' | '30d' | '90d' | 'all';
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profileVisits: number;
  followersGained: number;
  leadsGenerated: number;
  engagementRate: number;
  recordedAt: string;
}

export interface LeadActivityItem {
  id: string;
  type:
    | 'COMMENT_RECEIVED'
    | 'DM_RECEIVED'
    | 'KEYWORD_DETECTED'
    | 'AUTO_REPLY_SENT'
    | 'LEAD_CREATED'
    | 'LEAD_UPDATED'
    | 'MANUAL_CONTACT'
    | 'QUALIFIED'
    | 'PROPOSAL'
    | 'WON'
    | 'LOST';
  timestamp: string;
  title: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  name: string;
  business: string;
  platform: LeadPlatform;
  source: string;
  requirement: string;
  status: LeadStatus;
  date: string;
  notes: string;
  contactInfo?: {
    handle?: string;
    phone?: string;
    email?: string;
  };
  instagramUserId?: string;
  instagramUsername?: string;
  sourcePostId?: string;
  sourcePostTitle?: string;
  sourceCommentId?: string;
  conversationId?: string;
  intent?: string;
  activityTimeline?: LeadActivityItem[];
  estimatedDealValue?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationSetting {
  instagram: {
    isConnected: boolean;
    businessAccountId: string;
    pageId: string;
    appId: string;
    appSecretPlaceholder: string;
    userAccessTokenPlaceholder: string;
    tokenExpiryDate?: string;
    autoPublishEnabled: boolean;
    requireManualApproval: boolean;
    webhookUrl: string;
    apiVersion: string;
    publishingMode: PublishingMode;
    defaultTimezone: string;
  };
  aiProvider: {
    activeProvider: 'gemini' | 'openai' | 'anthropic' | 'local';
    apiKeyPlaceholder: string;
    model: string;
    temperature: number;
    maxTokens: number;
  };
  brandPreferences: {
    brandName: string;
    tagline: string;
    targetAudience: string;
    primaryGeography: string;
    defaultCTA: CTAType;
    customCTALink: string;
    whatsappNumber: string;
    brandKeywords: string[];
    forbiddenWords: string[];
    defaultHashtags: string[];
  };
  publishing: {
    defaultPostingHours: string[];
    timezone: string;
    autoHashtagPlacement: 'caption' | 'first-comment';
    defaultVideoUrl: string;
  };
  notifications: {
    emailAlerts: boolean;
    notificationEmail: string;
    telegramAlerts: boolean;
    telegramBotTokenPlaceholder: string;
    telegramChatId: string;
    soundEnabled: boolean;
  };
}

export interface GenerationRequest {
  topic: string;
  targetAudience: string;
  pillarId: ContentPillarId;
  platform: PlatformType;
  videoDuration: VideoDuration;
  tone: ToneType;
  cta: CTAType;
  angle?: ContentAngle;
  customInstructions?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'ready' | 'pending_integration' | 'manual_review';
  icon: string;
  substeps: string[];
}

export interface AIProviderStatus {
  isConnected: boolean;
  provider: string;
  model: string;
  availableProviders?: string[];
  errorMessage?: string;
}

// ==========================================
// MEDIA GENERATION ENGINE TYPES (STEP 4)
// ==========================================

export type MediaAssetType =
  | 'ai_image'
  | 'user_image'
  | 'user_video'
  | 'screen_recording'
  | 'gradient_bg'
  | 'ui_mockup'
  | 'text_scene';

export type SceneAnimationType =
  | 'zoom_in'
  | 'slide_left'
  | 'slide_right'
  | 'fade'
  | 'pop'
  | 'ken_burns'
  | 'pulse'
  | 'none';

export type SceneSectionType =
  | 'hook'
  | 'problem'
  | 'solution'
  | 'value'
  | 'cta'
  | 'body';

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  section: SceneSectionType;
  startTime: number; // in seconds
  endTime: number; // in seconds
  duration: number; // in seconds
  visualDescription: string;
  onScreenText: string;
  speechText: string;
  animation: SceneAnimationType;
  assetType: MediaAssetType;
  assetSource?: string;
  gradientPreset?: string;
  iconName?: string;
}

export interface VisualStoryboard {
  id: string;
  contentId: string;
  title: string;
  pillarId: ContentPillarId;
  aspectRatio: '9:16';
  resolution: {
    width: number;
    height: number;
  };
  totalDuration: number;
  scenes: StoryboardScene[];
  brandPresetId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  type: MediaAssetType;
  url: string;
  thumbnailUrl?: string;
  fileSize?: number;
  mimeType?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  tags: string[];
  sourceLicense?: string;
  createdAt: string;
}

export interface SubtitleCue {
  id: string;
  sceneId?: string;
  startTime: number;
  endTime: number;
  text: string;
  emphasisWords?: string[];
}

export type VoiceProviderType = 'google' | 'elevenlabs' | 'webspeech' | 'none';

export interface VoiceConfig {
  provider: VoiceProviderType;
  voiceId: string;
  language: string;
  speed: number;
  pitch: number;
  volume: number; // 0.0 - 1.0 (default: 1.0)
}

export interface MusicTrack {
  id: string;
  name: string;
  genre: string;
  mood: string;
  url: string;
  duration: number;
  isRoyaltyFree: boolean;
  author: string;
}

export interface MusicConfig {
  trackId?: string;
  trackUrl?: string;
  trackName?: string;
  volume: number; // 0.0 - 1.0 (default: 0.12 - 0.15)
  fadeInSeconds: number;
  fadeOutSeconds: number;
  startOffsetSeconds: number;
  enabled: boolean;
}

export interface SubtitleStyle {
  fontSize: number;
  fontColor: string;
  bgBox: boolean;
  bgBoxColor: string;
  positionYPercent: number; // percentage from top (safe zone 65% - 80%)
  uppercase: boolean;
  highlightColor: string;
  fontFamily: string;
}

export interface BrandPreset {
  id: string;
  name: string;
  isDefault?: boolean;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  fontFamily: string;
  secondaryFontFamily: string;
  logoUrl?: string;
  watermarkText?: string;
  watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'none';
  subtitleStyle: SubtitleStyle;
  ctaButtonColor: string;
  ctaTextColor: string;
}

export type RenderStage =
  | 'QUEUED'
  | 'PREPARING'
  | 'GENERATING_ASSETS'
  | 'GENERATING_VOICE'
  | 'CREATING_SUBTITLES'
  | 'RENDERING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface RenderJob {
  id: string;
  contentId: string;
  contentTitle: string;
  status: RenderStage;
  progress: number; // 0 - 100
  currentStage: string;
  stageMessage?: string;
  storyboard: VisualStoryboard;
  voiceConfig: VoiceConfig;
  musicConfig: MusicConfig;
  brandPreset: BrandPreset;
  subtitles: SubtitleCue[];
  outputVideoUrl?: string;
  outputVideoPath?: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSizeBytes?: number;
  resolution?: string;
  mode: 'DEMO' | 'LIVE';
  ffmpegAvailable: boolean;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface MediaEngineStatus {
  isConfigured: boolean;
  ffmpegAvailable: boolean;
  ffmpegVersion?: string;
  mediaMode: 'DEMO' | 'LIVE';
  activeJobsCount: number;
  completedJobsCount: number;
  imageProvider: {
    active: string;
    isAvailable: boolean;
  };
  voiceProvider: {
    active: string;
    isAvailable: boolean;
    availableVoices: Array<{ id: string; name: string; language: string }>;
  };
  musicProvider: {
    tracksCount: number;
  };
  storage: {
    assetsCount: number;
    rendersCount: number;
    totalSizeBytes: number;
  };
}

// ==========================================
// INSTAGRAM ENGAGEMENT & LEAD ENGINE (STEP 5)
// ==========================================

export type EngagementEventType =
  | 'DM'
  | 'COMMENT'
  | 'STORY_REPLY'
  | 'MENTION';

export type EngagementIntent =
  | 'AUTOMATION'
  | 'WEBSITE'
  | 'WHATSAPP'
  | 'LEAD_GENERATION'
  | 'AI_TOOLS'
  | 'PRICING'
  | 'DEMO'
  | 'GENERAL'
  | 'UNKNOWN';

export interface EngagementItem {
  id: string;
  eventType: EngagementEventType;
  senderId: string;
  senderUsername: string;
  senderName?: string;
  messageText: string;
  sourcePostId?: string;
  sourcePostTitle?: string;
  sourceCommentId?: string;
  conversationId?: string;
  detectedKeyword?: string;
  detectedIntent: EngagementIntent;
  confidenceScore: number;
  autoReplySent: boolean;
  autoReplyText?: string;
  leadId?: string;
  leadStatus?: LeadStatus;
  status: 'NEW' | 'REPLIED' | 'IGNORED' | 'BLOCKED';
  isDemo: boolean;
  timestamp: string;
}

export interface KeywordRule {
  id: string;
  keyword: string;
  intent: EngagementIntent;
  responseTemplate: string;
  autoReplyEnabled: boolean;
  leadEstimatedValue: number; // in INR
}

export interface EngagementStatus {
  webhookVerified: boolean;
  webhookUrl: string;
  verifyTokenConfigured: boolean;
  autoReplyMasterSwitch: boolean;
  engagementMode: 'DEMO' | 'LIVE';
  messagingPermissionStatus: 'AVAILABLE' | 'REQUIRES META PERMISSION / APP REVIEW';
  commentsPermissionStatus: 'AVAILABLE' | 'REQUIRES META PERMISSION / APP REVIEW';
  totalEngagements: number;
  totalDMs: number;
  totalComments: number;
  totalAutoReplies: number;
  totalLeadsCreated: number;
  activeKeywordsCount: number;
}

// ==========================================
// PERFORMANCE INTELLIGENCE ENGINE (STEP 6)
// ==========================================

export type DataQualityStatus = 'LIVE' | 'DEMO' | 'PARTIAL' | 'UNAVAILABLE';

export interface ContentPerformanceMetrics {
  views: number | null;
  reach: number | null;
  likes: number;
  comments: number;
  saves: number;
  shares: number;
  profileVisits: number | null;
  follows: number | null;
  engagementRate: number | null; // percentage
  engagementRateFormula: string;
  dataStatus: DataQualityStatus;
  lastSyncedAt: string;
}

export interface ContentPerformanceItem {
  id: string;
  contentId: string;
  title: string;
  pillarId: ContentPillarId;
  angle: ContentAngle | string;
  hook: string;
  duration: VideoDuration | string;
  cta: CTAType | string;
  publishedAt: string;
  permalink?: string;
  metrics: ContentPerformanceMetrics;
  performanceIndex: number; // 0 - 100 Content Performance Index (CPI)
  cpiBreakdown: {
    reachPoints: number;
    engagementPoints: number;
    savePoints: number;
    sharePoints: number;
    leadPoints: number;
    formula: string;
    explanation: string;
  };
  attributedLeadsCount: number;
  attributedQualifiedLeadsCount: number;
  attributedPipelineValue: number;
  attributedWonValue: number;
  isDemo: boolean;
}

export interface ContentPatternGroup {
  dimension: 'pillar' | 'angle' | 'duration' | 'hookType' | 'cta' | 'dayOfWeek' | 'timeSlot';
  groupKey: string;
  groupLabel: string;
  sampleSize: number;
  isSufficientSample: boolean; // false if N < 3
  medianReach: number;
  medianSaves: number;
  medianShares: number;
  avgEngagementRate: number;
  leadConversionRate: number;
  totalLeads: number;
  totalPipelineValue: number;
  observedInsight: string;
}

export interface AIAnalysisReport {
  id: string;
  generatedAt: string;
  dateRange: string;
  sampleSize: number;
  dataQuality: DataQualityStatus;
  summary: string;
  recurringPatterns: string[];
  strongHookPatterns: string[];
  weakHookPatterns: string[];
  audienceQuestions: string[];
  leadGenerationOpportunities: string[];
  contentGaps: string[];
  suggestedExperiments: string[];
}

export interface ContentRecommendation {
  id: string;
  recommendedTopic: string;
  recommendedPillar: ContentPillarId;
  suggestedAngle: ContentAngle;
  suggestedDuration: VideoDuration;
  suggestedHookPattern: string;
  suggestedCTA: CTAType;
  reason: string;
  empiricalEvidence: string;
  supportingMetrics: {
    sampleSize: number;
    historicalMedianReach?: number;
    historicalAvgSaves?: number;
    historicalLeadCount?: number;
  };
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'EXPERIMENTAL';
  status: 'PENDING_REVIEW' | 'APPROVED' | 'DISMISSED' | 'DRAFT_CREATED';
  createdAt: string;
}

export interface ContentExperiment {
  id: string;
  name: string;
  hypothesis: string;
  isolatedVariable: 'HOOK' | 'ANGLE' | 'DURATION' | 'CTA' | 'VISUAL_STYLE';
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'INCONCLUSIVE';
  startDate: string;
  endDate?: string;
  variantA: {
    id: string;
    label: string;
    contentTitle: string;
    contentId?: string;
    variableValue: string;
    metrics?: ContentPerformanceMetrics;
    leadsCount: number;
    pipelineValue: number;
  };
  variantB: {
    id: string;
    label: string;
    contentTitle: string;
    contentId?: string;
    variableValue: string;
    metrics?: ContentPerformanceMetrics;
    leadsCount: number;
    pipelineValue: number;
  };
  observedFinding?: string;
  dataStatus: DataQualityStatus;
}

export interface FatigueWarning {
  id: string;
  type: 'SIMILAR_TOPIC' | 'REPEATED_HOOK' | 'CONSECUTIVE_ANGLE' | 'CTA_OVERUSE';
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  affectedContentIds: string[];
  suggestion: string;
}

export interface DailyIntelligenceBrief {
  id: string;
  date: string;
  dataRange: string;
  contentPublishedCount: number;
  totalReach: number;
  totalEngagement: number;
  leadsCaptured: number;
  pipelineValue: number;
  observedPatterns: string[];
  audienceQuestions: string[];
  suggestedExperiments: string[];
  suggestedContentDirections: string[];
  dataLimitations: string;
  dataQuality: DataQualityStatus;
}

export interface SyncStatusInfo {
  syncStatus: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  lastSuccessfulSync: string | null;
  lastFailedSync: string | null;
  errorMessage: string | null;
  syncedItemsCount: number;
  isLiveConnected: boolean;
}

// ==========================================
// STEP 7: DAILY CONTENT OPERATING SYSTEM TYPES
// ==========================================

export type DailyRunStatus =
  | 'IDLE'
  | 'RUNNING'
  | 'WAITING_APPROVAL'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'FAILED';

export type DailyRunStepId =
  | 'DAILY_BRIEF'
  | 'CONTENT_PLAN'
  | 'AI_GENERATION'
  | 'REEL_GENERATION'
  | 'QUALITY_CONTROL'
  | 'HUMAN_APPROVAL'
  | 'SCHEDULE'
  | 'META_PUBLISH'
  | 'ENGAGEMENT_COLLECTION'
  | 'LEAD_CAPTURE'
  | 'ANALYTICS_SYNC'
  | 'PERFORMANCE_ANALYSIS'
  | 'NEXT_DAILY_BRIEF';

export interface DailyRunStep {
  stepId: DailyRunStepId;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'WAITING_ACTION';
  startedAt?: string;
  completedAt?: string;
  details?: string;
  itemsCount?: number;
  error?: string;
}

export interface DailyRunError {
  id: string;
  stepId: DailyRunStepId;
  contentId?: string;
  message: string;
  recoverable: boolean;
  timestamp: string;
  retryPayload?: any;
}

export interface PlannedDailyItem {
  id: string;
  topic: string;
  pillar: ContentPillarId;
  angle: ContentAngle;
  duration: VideoDuration;
  hookDirection: string;
  cta: CTAType;
  reason: string;
  evidence: string;
  contentId?: string;
  reelId?: string;
  mediaUrl?: string;
  caption?: string;
  hashtags?: {
    niche: string[];
    broad: string[];
    viral: string[];
  };
  qcStatus?: 'PENDING' | 'PASSED' | 'FAILED';
  qcErrors?: string[];
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  scheduledTime?: string;
  publishedUrl?: string;
}

export interface DailyRun {
  id: string;
  date: string;
  status: DailyRunStatus;
  startedAt: string;
  completedAt?: string;
  steps: DailyRunStep[];
  errors: DailyRunError[];
  plannedItems: PlannedDailyItem[];
  contentItemsGenerated: number;
  reelsRendered: number;
  itemsAwaitingApproval: number;
  itemsScheduled: number;
  publishedCount: number;
  leadsCaptured: number;
  analyticsSynced: number;
}

export interface AutomationSettings {
  dailyAutomationEnabled: boolean;
  reelsPerDay: 1 | 2 | 3;
  autoGenerate: boolean;
  autoRender: boolean;
  requireHumanApproval: boolean; // MUST default to true
  autoPublish: boolean; // MUST default to false
  publishingMode: 'DEMO' | 'LIVE';
  scheduleSlots: string[];
  preferredPillars: ContentPillarId[];
  concurrency: number; // default 1
}

export interface QCCheckItem {
  name: string;
  passed: boolean;
  message: string;
  fatal: boolean;
}

export interface QCReport {
  contentId: string;
  title: string;
  passed: boolean;
  checks: QCCheckItem[];
  checkedAt: string;
}

export interface InternalNotification {
  id: string;
  type:
    | 'GENERATION_COMPLETE'
    | 'RENDER_COMPLETE'
    | 'APPROVAL_REQUIRED'
    | 'SCHEDULED_POST_READY'
    | 'PUBLISH_SUCCESS'
    | 'PUBLISH_FAILURE'
    | 'NEW_LEAD'
    | 'ANALYTICS_SYNC_COMPLETE'
    | 'DAILY_BRIEF_READY';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  linkTab?: string;
}




