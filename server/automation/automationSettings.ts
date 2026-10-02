import type { AutomationSettings, ContentPillarId } from '../../src/types/index.ts';

export class AutomationSettingsManager {
  private settings: AutomationSettings = {
    dailyAutomationEnabled: true,
    reelsPerDay: 2,
    autoGenerate: true,
    autoRender: true,
    requireHumanApproval: true, // STRICT MANDATE: Default true
    autoPublish: false, // STRICT MANDATE: Default false
    publishingMode: (process.env.META_PUBLISHING_MODE as 'DEMO' | 'LIVE') || 'DEMO',
    scheduleSlots: ['11:00', '18:00', '21:00'],
    preferredPillars: [
      'ai-automation',
      'whatsapp-automation',
      'lead-generation',
      'business-growth',
      'website-solutions',
      'ai-tools'
    ] as ContentPillarId[],
    concurrency: 1
  };

  public getSettings(): AutomationSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AutomationSettings>): AutomationSettings {
    // Safety enforcement: If user tries to enable autoPublish, require explicit acknowledgement
    if (partial.autoPublish === true && partial.requireHumanApproval === false) {
      console.warn('[AutomationSettings] Auto-publishing without human approval requires explicit safety checks.');
    }

    this.settings = {
      ...this.settings,
      ...partial,
      // Never allow negative concurrency or excessive load
      concurrency: Math.max(1, Math.min(2, partial.concurrency ?? this.settings.concurrency)),
      reelsPerDay: (partial.reelsPerDay && [1, 2, 3].includes(partial.reelsPerDay)
        ? partial.reelsPerDay
        : this.settings.reelsPerDay) as 1 | 2 | 3
    };

    return this.getSettings();
  }
}

export const automationSettingsManager = new AutomationSettingsManager();
