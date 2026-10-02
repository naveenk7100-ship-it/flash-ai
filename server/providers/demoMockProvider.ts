import type {
  IAIProvider,
  GenerateContentInput,
  GeneratedContentPackage,
  DailyBatchParams
} from './types.js';
import { varietyEngine } from '../varietyEngine.js';

export class DemoMockProvider implements IAIProvider {
  public readonly name = 'FLASH.Ai Intelligent Demo Provider (Creator-Grade)';
  private modelName = 'flash-ai-production-engine-v1';

  public isAvailable(): boolean {
    return true; // Always available without API keys
  }

  public async generate(input: GenerateContentInput): Promise<GeneratedContentPackage> {
    const angle = varietyEngine.getNextAngle(input.angle);
    const topic = input.topic || 'How AI Automates Inbound Lead Qualification';
    const cta = input.cta || 'DM "AUTOMATE"';
    const pillar = input.pillar || 'AI Automation';

    // Build creator-grade 5-block timed script
    const script = [
      `[00:00 - 00:03] HOOK: If you still handle ${this.cleanTopic(topic)} manually in 2026, you are burning 15+ hours every week.`,
      `[00:03 - 00:08] PROBLEM/CONTEXT: Most founders and clinic owners lose up to 60% of prospective clients due to slow response times and scattered manual spreadsheets.`,
      `[00:08 - 00:20] DEMO/VALUE: Watch what happens with FLASH.Ai. The moment an inquiry arrives, our autonomous AI agent validates buyer intent, confirms details, and logs the lead in under 2 seconds.`,
      `[00:20 - 00:27] RESULT/PAYOFF: Zero missed leads, 24/7 responsiveness, and your operational team gets hours back every single day.`,
      `[00:27 - 00:30] CTA: Want this exact system built for your business? ${cta} to get our full blueprint.`
    ].join('\n\n');

    const onScreenText = [
      `00:00 - ⚠️ Stop Doing ${this.cleanTopic(topic)} Manually`,
      `00:04 - 📉 The Problem: Slow response & lost clients`,
      `00:10 - ⚡ The Solution: Instant 2-second AI execution`,
      `00:22 - 📈 The Result: 100% lead capture 24/7`,
      `00:27 - 👉 ${cta} | @flash_ai_digital`
    ];

    const caption = `Stop wasting 15+ hours every week on manual ${this.cleanTopic(topic)}. 👇

Here is how modern businesses scale operations in 2026 using autonomous AI agents from @flash_ai_digital:

⚡ 1. Zero Response Latency: Automated intake qualifies prospects in under 2 seconds.
⚡ 2. Reliable Execution: Direct sync with your CRM, calendar, and WhatsApp.
⚡ 3. Measurable ROI: Zero missed opportunities during nights, weekends, and holidays.

👉 ${cta} and we will send you our complete step-by-step implementation blueprint!

Save this Reel for later 📌`;

    return {
      suggestedTitle: topic.slice(0, 50),
      hook: `If you still handle ${this.cleanTopic(topic)} manually in 2026, you are burning 15+ hours every week.`,
      visualCue: `Presenter pointing directly at split screen: Left shows chaotic manual spreadsheet, Right shows green automated AI webhook execution.`,
      concept: `Creator-style practical walkthrough showing how ${topic} is automated on autopilot without hiring more staff.`,
      script,
      onScreenText,
      caption,
      CTA: cta,
      contentPillar: pillar,
      hashtags: {
        niche: ['#AIAutomation', '#WorkflowAutomation', '#AgencyAutomation', '#FLASHai'],
        broad: ['#ArtificialIntelligence', '#BusinessGrowth', '#SmallBusinessTips'],
        viral: ['#TechReels', '#ProductivityHacks', '#Automation2026']
      },
      angle,
      qualityScore: 98,
      usedRealAI: false,
      modelName: this.modelName,
      generatedAt: new Date().toISOString()
    };
  }

  public async generateBatchDaily(params: DailyBatchParams): Promise<GeneratedContentPackage[]> {
    const total = params.postsPerDay * params.daysCount;
    const results: GeneratedContentPackage[] = [];

    const defaultTopics = [
      'How Local Clinics Use AI WhatsApp Agents to Handle 40+ Inquiries Nightly',
      '3 Fatal Mistakes Founders Make When Automating Client Onboarding',
      'Live Demo: Building a 24/7 AI Lead Qualifier in 60 Seconds with FLASH.Ai',
      'Why Website Contact Forms Are Dead in 2026 and What Replaces Them',
      'Top 3 Free AI Tools That Replace 20 Hours of Weekly Admin Work',
      'Inside Our 4-Step Agency Automation Pipeline for Client Retention'
    ];

    for (let i = 0; i < total; i++) {
      const topic = defaultTopics[i % defaultTopics.length];
      const pillar = params.selectedPillars[i % params.selectedPillars.length] || 'AI Automation';

      const pkg = await this.generate({
        topic: `${topic} (Reel ${i + 1})`,
        targetAudience: params.targetAudience,
        pillar,
        platform: 'Instagram Reels',
        duration: params.defaultDuration || '30s',
        tone: params.defaultTone || 'Authoritative & Sharp',
        cta: params.defaultCTA || 'DM "AUTOMATE"'
      });

      results.push(pkg);
    }

    return results;
  }

  private cleanTopic(topic: string): string {
    return topic
      .replace(/^how to /i, '')
      .replace(/^building a /i, '')
      .slice(0, 30);
  }
}
