import type {
  ContentIdea,
  ContentItem,
  Lead,
  AnalyticsSnapshot,
  AutomationSetting,
  GenerationHistoryItem,
  PublishingJob,
  PublishingActivityLogItem
} from '../types';
import {
  INITIAL_IDEAS,
  INITIAL_CONTENT_ITEMS,
  INITIAL_LEADS,
  INITIAL_ANALYTICS,
  INITIAL_SETTINGS,
  INITIAL_PUBLISHING_JOBS,
  INITIAL_ACTIVITY_LOGS
} from '../constants/seedData';

const KEYS = {
  IDEAS: 'flash_ai_ideas_v1',
  CONTENT_ITEMS: 'flash_ai_content_items_v1',
  LEADS: 'flash_ai_leads_v1',
  ANALYTICS: 'flash_ai_analytics_v1',
  SETTINGS: 'flash_ai_settings_v1',
  HISTORY: 'flash_ai_history_v1',
  JOBS: 'flash_ai_jobs_v1',
  LOGS: 'flash_ai_activity_v1'
};

export const storageService = {
  getIdeas(): ContentIdea[] {
    try {
      const data = localStorage.getItem(KEYS.IDEAS);
      return data ? JSON.parse(data) : INITIAL_IDEAS;
    } catch {
      return INITIAL_IDEAS;
    }
  },

  saveIdeas(ideas: ContentIdea[]): void {
    try {
      localStorage.setItem(KEYS.IDEAS, JSON.stringify(ideas));
    } catch (e) {
      console.error('Failed to save ideas to localStorage', e);
    }
  },

  getContentItems(): ContentItem[] {
    try {
      const data = localStorage.getItem(KEYS.CONTENT_ITEMS);
      return data ? JSON.parse(data) : INITIAL_CONTENT_ITEMS;
    } catch {
      return INITIAL_CONTENT_ITEMS;
    }
  },

  saveContentItems(items: ContentItem[]): void {
    try {
      localStorage.setItem(KEYS.CONTENT_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save content items to localStorage', e);
    }
  },

  getLeads(): Lead[] {
    try {
      const data = localStorage.getItem(KEYS.LEADS);
      return data ? JSON.parse(data) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  },

  saveLeads(leads: Lead[]): void {
    try {
      localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
    } catch (e) {
      console.error('Failed to save leads to localStorage', e);
    }
  },

  getAnalytics(): AnalyticsSnapshot {
    try {
      const data = localStorage.getItem(KEYS.ANALYTICS);
      return data ? JSON.parse(data) : INITIAL_ANALYTICS;
    } catch {
      return INITIAL_ANALYTICS;
    }
  },

  saveAnalytics(analytics: AnalyticsSnapshot): void {
    try {
      localStorage.setItem(KEYS.ANALYTICS, JSON.stringify(analytics));
    } catch (e) {
      console.error('Failed to save analytics to localStorage', e);
    }
  },

  getSettings(): AutomationSetting {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },

  saveSettings(settings: AutomationSetting): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  },

  getHistory(): GenerationHistoryItem[] {
    try {
      const data = localStorage.getItem(KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHistory(history: GenerationHistoryItem[]): void {
    try {
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save generation history to localStorage', e);
    }
  },

  getPublishingJobs(): PublishingJob[] {
    try {
      const data = localStorage.getItem(KEYS.JOBS);
      return data ? JSON.parse(data) : INITIAL_PUBLISHING_JOBS;
    } catch {
      return INITIAL_PUBLISHING_JOBS;
    }
  },

  savePublishingJobs(jobs: PublishingJob[]): void {
    try {
      localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      console.error('Failed to save publishing jobs to localStorage', e);
    }
  },

  getActivityLogs(): PublishingActivityLogItem[] {
    try {
      const data = localStorage.getItem(KEYS.LOGS);
      return data ? JSON.parse(data) : INITIAL_ACTIVITY_LOGS;
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  },

  saveActivityLogs(logs: PublishingActivityLogItem[]): void {
    try {
      localStorage.setItem(KEYS.LOGS, JSON.stringify(logs.slice(0, 100))); // Keep latest 100
    } catch (e) {
      console.error('Failed to save activity logs to localStorage', e);
    }
  },

  resetAllToSeed(): void {
    localStorage.removeItem(KEYS.IDEAS);
    localStorage.removeItem(KEYS.CONTENT_ITEMS);
    localStorage.removeItem(KEYS.LEADS);
    localStorage.removeItem(KEYS.ANALYTICS);
    localStorage.removeItem(KEYS.SETTINGS);
    localStorage.removeItem(KEYS.HISTORY);
    localStorage.removeItem(KEYS.JOBS);
    localStorage.removeItem(KEYS.LOGS);
  }
};
