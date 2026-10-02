import type { ContentAngle } from './providers/types.js';

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

export interface AnglePromptGuidance {
  angle: ContentAngle;
  angleDescription: string;
  hookFormula: string;
  retentionCueExample: string;
}

export const ANGLE_GUIDELINES: Record<ContentAngle, AnglePromptGuidance> = {
  Problem: {
    angle: 'Problem',
    angleDescription: 'Expose a painful, time-consuming operational bottleneck that SMB owners face daily.',
    hookFormula: 'If you still handle [Process] manually in 2026, you are losing 15+ hours every week.',
    retentionCueExample: 'Close-up of stressed business owner or messy spreadsheet with red error circle.'
  },
  Mistake: {
    angle: 'Mistake',
    angleDescription: 'Highlight a costly assumption or common mistake businesses make when trying to scale.',
    hookFormula: 'Stop doing this 1 thing with your client inquiries—it is costing you thousands.',
    retentionCueExample: 'Fast zoom on phone with missed call or unread message notification.'
  },
  'Before/After': {
    angle: 'Before/After',
    angleDescription: 'Contrast the chaotic manual workflow with the smooth, instant FLASH.Ai automated pipeline.',
    hookFormula: 'Before FLASH.Ai: 4-hour response time. After: 2-second automated qualification.',
    retentionCueExample: 'Split screen comparing slow manual typing vs instant automated AI agent response.'
  },
  'How-to': {
    angle: 'How-to',
    angleDescription: 'A direct, step-by-step practical implementation breakdown with zero fluff.',
    hookFormula: 'Here is the exact 3-step automation we use to qualify leads on WhatsApp 24/7.',
    retentionCueExample: 'Whiteboard or digital diagram showing 3 connected neon glow boxes.'
  },
  Demo: {
    angle: 'Demo',
    angleDescription: 'Showcase live software interaction, webhook triggers, and automated messages in real time.',
    hookFormula: 'Watch what happens when a prospect comments "AUTOMATE" on our Reel.',
    retentionCueExample: 'Screen recording showing real-time comment notification triggering instant DM.'
  },
  Myth: {
    angle: 'Myth',
    angleDescription: 'Debunk common misconceptions (e.g. "AI automation is only for enterprise companies with $50k budgets").',
    hookFormula: 'You don\'t need a 5-person support team to answer inquiries at 11 PM.',
    retentionCueExample: 'Speaker looks directly into camera shaking head with cross mark graphic.'
  },
  Comparison: {
    angle: 'Comparison',
    angleDescription: 'Compare legacy methods (contact forms, slow emails) against modern AI agents.',
    hookFormula: 'Website contact form vs 1-Click WhatsApp AI: Why forms are dead.',
    retentionCueExample: 'Side-by-side comparison graphics with conversion rate percentages.'
  },
  'Case study': {
    angle: 'Case study',
    angleDescription: 'Real-world deployment walkthrough showing workflow architecture and client outcome.',
    hookFormula: 'How we helped a local dental clinic book 40+ appointments a week on autopilot.',
    retentionCueExample: 'Calendar view showing automated booked time slots turning green.'
  },
  'Behind the scenes': {
    angle: 'Behind the scenes',
    angleDescription: 'Inside look into FLASH.Ai engineering, testing webhooks, prompt design, and architecture.',
    hookFormula: 'Inside the code: How our multi-agent automation engine actually functions.',
    retentionCueExample: 'Dual monitor setup with code terminal and live webhook debugger.'
  },
  'Tool discovery': {
    angle: 'Tool discovery',
    angleDescription: 'Introduce high-ROI automation tools and practical AI APIs for small businesses.',
    hookFormula: '3 free AI tools that will save your business 20 hours this week.',
    retentionCueExample: 'Speaker points upward as 3 floating tool cards appear with sound cues.'
  }
};

export class VarietyEngine {
  private usedAnglesHistory: ContentAngle[] = [];
  private usedPillarsHistory: string[] = [];

  /**
   * Selects the next content angle that differs from recently used angles.
   */
  public getNextAngle(preferredAngle?: ContentAngle): ContentAngle {
    if (preferredAngle) {
      this.recordAngle(preferredAngle);
      return preferredAngle;
    }

    const availableAngles = CONTENT_ANGLES.filter(
      (a) => !this.usedAnglesHistory.slice(-3).includes(a)
    );

    const chosen = availableAngles.length > 0
      ? availableAngles[Math.floor(Math.random() * availableAngles.length)]
      : CONTENT_ANGLES[Math.floor(Math.random() * CONTENT_ANGLES.length)];

    this.recordAngle(chosen);
    return chosen;
  }

  /**
   * Ensures consecutive daily posts rotate through pillars without immediate repeats.
   */
  public getNextPillar(availablePillars: string[]): string {
    if (availablePillars.length === 0) return 'AI Automation';
    if (availablePillars.length === 1) return availablePillars[0];

    const unrecentlyUsed = availablePillars.filter(
      (p) => !this.usedPillarsHistory.slice(-2).includes(p)
    );

    const chosen = unrecentlyUsed.length > 0
      ? unrecentlyUsed[Math.floor(Math.random() * unrecentlyUsed.length)]
      : availablePillars[Math.floor(Math.random() * availablePillars.length)];

    this.usedPillarsHistory.push(chosen);
    if (this.usedPillarsHistory.length > 20) this.usedPillarsHistory.shift();
    return chosen;
  }

  public recordAngle(angle: ContentAngle): void {
    this.usedAnglesHistory.push(angle);
    if (this.usedAnglesHistory.length > 20) {
      this.usedAnglesHistory.shift();
    }
  }

  public getHistory(): { angles: ContentAngle[]; pillars: string[] } {
    return {
      angles: [...this.usedAnglesHistory],
      pillars: [...this.usedPillarsHistory]
    };
  }

  public reset(): void {
    this.usedAnglesHistory = [];
    this.usedPillarsHistory = [];
  }
}

export const varietyEngine = new VarietyEngine();
