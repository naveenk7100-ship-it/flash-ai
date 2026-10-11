import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import type { AutomationSettings, ContentPillarId } from '../../src/types/index.ts';

export class AutomationSettingsManager {
  private filePath = path.resolve(process.cwd(), 'data', 'storage', 'automation_settings.json');
  private defaultSettings: AutomationSettings = {
    dailyAutomationEnabled: true,
    reelsPerDay: 1,
    autoGenerate: true,
    autoRender: true,
    requireHumanApproval: false, // Default false for autonomous scheduler pipeline; configurable for manual mode
    autoPublish: true, // Auto-publish scheduled quality-verified content at 21:00 IST
    publishingMode: (process.env.META_PUBLISHING_MODE as 'DEMO' | 'LIVE') || 'LIVE',
    scheduleSlots: ['21:00'], // 9:00 PM IST (Asia/Kolkata)
    preferredPillars: [
      'ai-automation',
      'lead-generation',
      'business-growth',
      'website-solutions',
      'ai-tools'
    ] as ContentPillarId[],
    concurrency: 1
  };
  private settings: AutomationSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): AutomationSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        return { ...this.defaultSettings, ...parsed };
      }
    } catch (err: any) {
      console.warn(`[AutomationSettings] Notice loading settings from disk (${err.message}). Using defaults.`);
    }
    return { ...this.defaultSettings };
  }

  public saveSettings(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf8');
    } catch (err: any) {
      console.warn(`[AutomationSettings] Failed to save settings to ${this.filePath}:`, err.message);
    }
  }

  public getSettings(): AutomationSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AutomationSettings>): AutomationSettings {
    this.settings = {
      ...this.settings,
      ...partial,
      // Never allow negative concurrency or excessive load
      concurrency: Math.max(1, Math.min(2, partial.concurrency ?? this.settings.concurrency)),
      reelsPerDay: (partial.reelsPerDay && [1, 2, 3].includes(partial.reelsPerDay)
        ? partial.reelsPerDay
        : this.settings.reelsPerDay) as 1 | 2 | 3
    };

    this.saveSettings();
    return this.getSettings();
  }
}

export const automationSettingsManager = new AutomationSettingsManager();

