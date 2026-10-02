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

export interface GenerateContentInput {
  topic: string;
  targetAudience: string;
  pillar: string;
  platform: string;
  duration: string;
  tone: string;
  cta: string;
  angle?: ContentAngle;
  brandContext?: {
    brandName?: string;
    positioning?: string;
    targetAudience?: string;
    primaryCTA?: string;
    forbiddenWords?: string[];
  };
}

export interface GeneratedContentPackage {
  hook: string;
  visualCue: string;
  concept: string;
  script: string;
  onScreenText: string[];
  caption: string;
  hashtags: {
    niche: string[];
    broad: string[];
    viral: string[];
  };
  suggestedTitle: string;
  CTA: string;
  contentPillar: string;
  angle?: ContentAngle;
  qualityScore: number;
  usedRealAI: boolean;
  modelName: string;
  generatedAt: string;
}

export interface DailyBatchParams {
  postsPerDay: number;
  daysCount: number;
  selectedPillars: string[];
  targetAudience: string;
  defaultDuration?: string;
  defaultTone?: string;
  defaultCTA?: string;
}

export interface IAIProvider {
  readonly name: string;
  isAvailable(): boolean;
  generate(input: GenerateContentInput): Promise<GeneratedContentPackage>;
  generateBatchDaily(params: DailyBatchParams): Promise<GeneratedContentPackage[]>;
}
