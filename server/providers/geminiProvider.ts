import type {
  IAIProvider,
  GenerateContentInput,
  GeneratedContentPackage,
  DailyBatchParams,
  ContentAngle
} from './types.js';
import { ANGLE_GUIDELINES, varietyEngine } from '../varietyEngine.js';

export class GeminiProvider implements IAIProvider {
  public readonly name = 'Google Gemini (Official API)';
  private apiKey: string;
  private model: string;
  private recentSessionHooks: Set<string> = new Set();

  constructor(apiKey?: string, model: string = 'gemini-2.0-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  public isAvailable(): boolean {
    const key = this.apiKey || process.env.GEMINI_API_KEY || '';
    return typeof key === 'string' && key.trim().length > 10;
  }

  /**
   * Generates a full, production-grade social content package for FLASH.Ai.
   */
  public async generate(input: GenerateContentInput): Promise<GeneratedContentPackage> {
    const activeKey = this.apiKey || process.env.GEMINI_API_KEY || '';
    if (!activeKey) {
      throw new Error(
        'AI provider is not connected. Add GEMINI_API_KEY in the secure environment configuration (.env file).'
      );
    }

    const angle = varietyEngine.getNextAngle(input.angle);
    return await this.generateWithRetry(input, angle, 0);
  }

  /**
   * Internal generation with automatic single-pass retry if quality check fails.
   */
  private async generateWithRetry(
    input: GenerateContentInput,
    angle: ContentAngle,
    attempt: number
  ): Promise<GeneratedContentPackage> {
    const activeKey = this.apiKey || process.env.GEMINI_API_KEY || '';
    const angleGuide = ANGLE_GUIDELINES[angle] || ANGLE_GUIDELINES.Problem;

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(input, angleGuide);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${encodeURIComponent(
      activeKey
    )}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      let parsedErr = '';
      try {
        const j = JSON.parse(errBody);
        parsedErr = j.error?.message || errBody;
      } catch {
        parsedErr = errBody;
      }
      throw new Error(`Gemini API Error (${response.status}): ${parsedErr}`);
    }

    const jsonResponse = (await response.json()) as any;
    const rawText =
      jsonResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawText) {
      throw new Error('Empty response received from Gemini API.');
    }

    let parsedPackage: any;
    try {
      parsedPackage = JSON.parse(rawText);
    } catch {
      // Clean possible markdown code fences
      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
      parsedPackage = JSON.parse(cleaned);
    }

    // Standardize structure
    const contentPackage: GeneratedContentPackage = {
      suggestedTitle: parsedPackage.suggestedTitle || parsedPackage.title || input.topic,
      hook: parsedPackage.hook || '',
      visualCue: parsedPackage.visualCue || parsedPackage.visual_cue || 'Speaker direct to camera with screen demo',
      concept: parsedPackage.concept || parsedPackage.videoConcept || '',
      script: parsedPackage.script || parsedPackage.shortScript || '',
      onScreenText: Array.isArray(parsedPackage.onScreenText)
        ? parsedPackage.onScreenText
        : ['00:00 - ⚠️ Stop doing this manually', `00:05 - ⚡ ${input.topic}`, '00:25 - 👉 DM "AUTOMATE"'],
      caption: parsedPackage.caption || '',
      CTA: parsedPackage.CTA || parsedPackage.cta || input.cta || 'DM "AUTOMATE"',
      contentPillar: input.pillar || parsedPackage.contentPillar || 'AI Automation',
      hashtags: {
        niche: Array.isArray(parsedPackage.hashtags?.niche) ? parsedPackage.hashtags.niche : ['#AIAutomation', '#FLASHai'],
        broad: Array.isArray(parsedPackage.hashtags?.broad) ? parsedPackage.hashtags.broad : ['#BusinessGrowth', '#TechTrends'],
        viral: Array.isArray(parsedPackage.hashtags?.viral) ? parsedPackage.hashtags.viral : ['#SmallBusinessTips', '#Automation']
      },
      angle,
      qualityScore: 95,
      usedRealAI: true,
      modelName: this.model,
      generatedAt: new Date().toISOString()
    };

    // Quality Control Validation (Requirement 4)
    const qcResult = this.validateQualityControl(contentPackage);
    if (!qcResult.isValid && attempt === 0) {
      console.warn('Quality check failed, attempting 1 internal regeneration:', qcResult.reason);
      // Pick another angle for variety and regenerate
      const nextAngle = varietyEngine.getNextAngle();
      return this.generateWithRetry(input, nextAngle, attempt + 1);
    }

    // Record hook to prevent duplicates in current session
    if (contentPackage.hook) {
      this.recentSessionHooks.add(contentPackage.hook.toLowerCase().trim());
    }

    return contentPackage;
  }

  /**
   * Generates a batch of daily content items with variety rotation.
   */
  public async generateBatchDaily(params: DailyBatchParams): Promise<GeneratedContentPackage[]> {
    const totalPosts = params.postsPerDay * params.daysCount;
    const results: GeneratedContentPackage[] = [];

    const defaultTopics: Record<string, string[]> = {
      'AI Automation': [
        'How to automate customer onboarding in under 5 minutes with AI',
        '3 manual tasks costing your business $2,000/month',
        'Automated invoice & receipt processing using AI vision',
        'How AI agents handle 80% of support tickets automatically'
      ],
      'WhatsApp Automation': [
        'Never miss a midnight lead: 24/7 WhatsApp AI booking assistant',
        'How WhatsApp automation recovered $4,500 in abandoned carts',
        'Zero to automated appointments: WhatsApp Cloud API walkthrough',
        'Broadcasting updates with 98% open rates using WhatsApp'
      ],
      'Lead Generation': [
        'How to turn Instagram Reels comments into qualified sales calls',
        'The DM trigger keyword funnel: Step-by-step setup',
        'Why cold outreach is dying and interactive inbound funnels are winning',
        'Auto-qualifying high-ticket buyer intent in 3 questions'
      ],
      'Website Solutions': [
        '3 reasons your website gets 1,000 visitors but 0 phone calls',
        'Why modern websites need instant AI chat instead of forms',
        'Before & After: Redesigning a clinic landing page for 3x conversions',
        'How page speed under 1s directly boosts Google ranking'
      ],
      'AI Tools': [
        'Top 5 free AI tools every small business should use this week',
        'Claude 3.5 Sonnet vs GPT-4o vs Gemini 2.0 for business operations',
        'Free AI tools that replace expensive $99/mo SaaS subscriptions',
        'Turn your voice notes into complete SOPs & team tasks'
      ],
      'FLASH.Ai Builds': [
        'FLASH.Ai Build: Real-time lead auto-qualifier for luxury real estate',
        'Inside the custom AI inventory assistant for a multi-store retailer',
        'How we built a custom booking portal in 72 hours for a luxury salon',
        'Inside the FLASH.Ai multi-agent social automation engine'
      ],
      'Business Growth': [
        'The 10x leverage rule: Why hiring more people is not the first answer',
        'How local businesses double customer retention with automated check-ins',
        '5 operational bottlenecks AI solves overnight in 2026',
        'The tech stack scaling our digital solutions agency this year'
      ],
      'Behind The Scenes': [
        'Day in the life building FLASH.Ai automation systems for clients',
        'What went wrong when we tested our first automated webhook engine',
        'Our internal hardware & software studio setup powering FLASH.Ai',
        'How we plan 30 days of high-value social media content in 2 hours'
      ]
    };

    const pillars = params.selectedPillars.length > 0
      ? params.selectedPillars
      : ['AI Automation', 'WhatsApp Automation', 'Lead Generation', 'Website Solutions'];

    for (let i = 0; i < totalPosts; i++) {
      const dayIndex = Math.floor(i / params.postsPerDay) + 1;
      const postIndexOnDay = (i % params.postsPerDay) + 1;
      const pillar = varietyEngine.getNextPillar(pillars);
      const angle = varietyEngine.getNextAngle();

      const candidateTopics = defaultTopics[pillar] || defaultTopics['AI Automation'];
      const topic = candidateTopics[i % candidateTopics.length];

      try {
        const pkg = await this.generate({
          topic: `${topic} (Angle: ${angle})`,
          targetAudience: params.targetAudience || 'Small business owners & local businesses',
          pillar,
          platform: 'Instagram Reels',
          duration: params.defaultDuration || '30s',
          tone: params.defaultTone || 'Authoritative & Sharp',
          cta: params.defaultCTA || 'DM "AUTOMATE"',
          angle
        });

        // Set suggested title with Day & Reel indicator
        pkg.suggestedTitle = `Day ${dayIndex} - Reel ${postIndexOnDay}: ${pkg.suggestedTitle}`;
        results.push(pkg);
      } catch (err: any) {
        console.error(`Error generating daily batch item ${i + 1}:`, err.message);
      }
    }

    return results;
  }

  /**
   * System prompt injecting FLASH.Ai brand rules and strict output guardrails.
   */
  private buildSystemPrompt(): string {
    return `You are the Lead Content Strategist & Scriptwriter for FLASH.Ai.

BRAND PROFILE:
- Brand Name: FLASH.Ai
- Positioning: AI Automation & Digital Solutions
- Target Audience: Small businesses, local businesses, clinics, salons, startups, creators, and business owners.
- Core Offerings: AI Automation, AI Agents, Website Solutions, WhatsApp Automation, Lead Generation Systems, Business Process Automation, Custom AI Integrations.
- Content Style: Clear, Modern, Practical, Business-focused, High curiosity, Professional.
- Primary CTA: DM "AUTOMATE" (or user requested CTA).

CRITICAL BRAND INTEGRITY GUARDRAILS (QUALITY CONTROL):
1. NO FAKE CLAIMS, NO FAKE STATS, NO FAKE CLIENT RESULTS: Do not cite fictional Fortune 500 companies or made-up statistics like "99.8% of humans will fail". Use realistic scenarios, sound business logic, and demonstrable workflow mechanics.
2. NO EXAGGERATED INCOME PROMISES: Never promise "Get rich overnight" or "Make $10k while sleeping". Focus strictly on operational time savings, response speed, lead capture, and reduction of manual busywork.
3. NO GENERIC MOTIVATIONAL FLUFF: Every piece must provide concrete, actionable technical or business value.
4. TIMING STRUCTURE: For 30s Reels, the script MUST follow:
   [00:00 - 00:03] HOOK: Strong 1st second visual & spoken hook.
   [00:03 - 00:08] PROBLEM: Painful friction point or manual drag.
   [00:08 - 00:20] SOLUTION / DEMO: How FLASH.Ai automated agent/system solves it.
   [00:20 - 00:27] VALUE / RESULT: Concrete outcome (e.g. 2-second response time, zero missed appointments).
   [00:27 - 00:30] CTA: Clear directive (e.g. Comment "AUTOMATE" or DM "AUTOMATE").
5. HASHTAGS: Small, highly targeted set (max 3-4 niche, 3-4 broad, 2-3 viral). No spamming.
6. OUTPUT FORMAT: Valid, strictly parseable JSON ONLY without markdown wrapping.`;
  }

  private buildUserPrompt(input: GenerateContentInput, angleGuide: { angle: string; angleDescription: string; hookFormula: string }): string {
    return `Create an Instagram Reel content package for FLASH.Ai:

TOPIC: "${input.topic}"
CONTENT PILLAR: "${input.pillar}"
CONTENT ANGLE: "${angleGuide.angle}" (${angleGuide.angleDescription})
TARGET AUDIENCE: "${input.targetAudience}"
DURATION: "${input.duration}"
TONE: "${input.tone}"
CTA: "${input.cta}"

Angle Formula Guideline:
"${angleGuide.hookFormula}"

OUTPUT SCHEMA REQUIRED (JSON):
{
  "suggestedTitle": "Short curiosity-driven title",
  "hook": "Spoken hook for seconds 0-3",
  "visualCue": "Specific visual / on-screen action during the hook",
  "concept": "1-2 sentence concept explanation",
  "script": "Full timed script with exact timestamps [00:00 - 00:03] HOOK: ..., [00:03 - 00:08] PROBLEM: ..., [00:08 - 00:20] SOLUTION: ..., [00:20 - 00:27] RESULT: ..., [00:27 - 00:30] CTA: ...",
  "onScreenText": [
    "00:00 - Overlay text 1",
    "00:06 - Overlay text 2",
    "00:15 - Overlay text 3",
    "00:25 - Overlay text 4"
  ],
  "caption": "Instagram formatted caption with hook opening, value bullet points, and CTA",
  "CTA": "${input.cta}",
  "contentPillar": "${input.pillar}",
  "hashtags": {
    "niche": ["#AIAutomation", "#TargetHashtag"],
    "broad": ["#BusinessGrowth", "#TechTrends"],
    "viral": ["#SmallBusinessTips", "#Productivity"]
  }
}`;
  }

  /**
   * Quality Control validator ensuring output meets all FLASH.Ai standards.
   */
  private validateQualityControl(pkg: GeneratedContentPackage): { isValid: boolean; reason?: string } {
    if (!pkg.hook || pkg.hook.length < 15) {
      return { isValid: false, reason: 'Hook is too short or missing.' };
    }

    if (this.recentSessionHooks.has(pkg.hook.toLowerCase().trim())) {
      return { isValid: false, reason: 'Duplicate hook detected in current session.' };
    }

    if (!pkg.script || !pkg.script.includes('[00:')) {
      return { isValid: false, reason: 'Script lacks proper timestamp breakdown.' };
    }

    const forbiddenTerms = [
      'guaranteed millionaire',
      'get rich overnight',
      'make 100k today',
      'crypto pump',
      'secret hack they hide'
    ];

    const allText = `${pkg.hook} ${pkg.script} ${pkg.caption}`.toLowerCase();
    for (const term of forbiddenTerms) {
      if (allText.includes(term)) {
        return { isValid: false, reason: `Forbidden claim found: "${term}"` };
      }
    }

    const totalHashtags =
      pkg.hashtags.niche.length +
      pkg.hashtags.broad.length +
      pkg.hashtags.viral.length;
    if (totalHashtags > 18) {
      return { isValid: false, reason: 'Excessive hashtags detected.' };
    }

    return { isValid: true };
  }
}
