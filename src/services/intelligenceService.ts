import type {
  ContentPerformanceItem,
  ContentPatternGroup,
  AIAnalysisReport,
  ContentRecommendation,
  ContentExperiment,
  FatigueWarning,
  DailyIntelligenceBrief,
  SyncStatusInfo
} from '../types';

class IntelligenceService {
  private baseUrl = '/api/analytics';

  public async getPerformanceItems(): Promise<ContentPerformanceItem[]> {
    try {
      const res = await fetch(`${this.baseUrl}/insights`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.items || [];
    } catch (err) {
      console.warn('Failed to fetch performance items:', err);
      return [];
    }
  }

  public async triggerSync(publishedItems: Array<{
    contentId: string;
    mediaId?: string;
    title: string;
    pillarId: string;
    angle?: string;
    hook?: string;
    duration?: string;
    cta?: string;
    publishedAt: string;
    permalink?: string;
  }>): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publishedItems })
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  public async getSyncStatus(): Promise<SyncStatusInfo> {
    try {
      const res = await fetch(`${this.baseUrl}/sync-status`);
      const data = await res.json();
      return {
        syncStatus: data.syncStatus || 'IDLE',
        lastSuccessfulSync: data.lastSuccessfulSync || null,
        lastFailedSync: data.lastFailedSync || null,
        errorMessage: data.errorMessage || null,
        syncedItemsCount: data.syncedItemsCount || 0,
        isLiveConnected: !!data.isLiveConnected
      };
    } catch {
      return {
        syncStatus: 'IDLE',
        lastSuccessfulSync: null,
        lastFailedSync: null,
        errorMessage: null,
        syncedItemsCount: 0,
        isLiveConnected: false
      };
    }
  }

  public async getObservedPatterns(): Promise<{
    byPillar: ContentPatternGroup[];
    byAngle: ContentPatternGroup[];
    byDuration: ContentPatternGroup[];
    byHookType: ContentPatternGroup[];
    byCTA: ContentPatternGroup[];
    byDayOfWeek: ContentPatternGroup[];
    totalSampleCount: number;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/patterns`);
      const data = await res.json();
      return data.patterns || {
        byPillar: [],
        byAngle: [],
        byDuration: [],
        byHookType: [],
        byCTA: [],
        byDayOfWeek: [],
        totalSampleCount: 0
      };
    } catch {
      return {
        byPillar: [],
        byAngle: [],
        byDuration: [],
        byHookType: [],
        byCTA: [],
        byDayOfWeek: [],
        totalSampleCount: 0
      };
    }
  }

  public async runAIAnalysis(): Promise<AIAnalysisReport | null> {
    try {
      const res = await fetch(`${this.baseUrl}/ai-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      return data.report || null;
    } catch (err) {
      console.error('Failed to run AI analysis:', err);
      return null;
    }
  }

  public async getRecommendations(): Promise<ContentRecommendation[]> {
    try {
      const res = await fetch(`${this.baseUrl}/recommendations`);
      const data = await res.json();
      return data.recommendations || [];
    } catch {
      return [];
    }
  }

  public async updateRecommendationStatus(
    id: string,
    status: ContentRecommendation['status']
  ): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/recommendations/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  public async getExperiments(): Promise<ContentExperiment[]> {
    try {
      const res = await fetch(`${this.baseUrl}/experiments`);
      const data = await res.json();
      return data.experiments || [];
    } catch {
      return [];
    }
  }

  public async createExperiment(exp: Omit<ContentExperiment, 'id'>): Promise<ContentExperiment | null> {
    try {
      const res = await fetch(`${this.baseUrl}/experiments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exp)
      });
      const data = await res.json();
      return data.experiment || null;
    } catch {
      return null;
    }
  }

  public async updateExperimentStatus(
    id: string,
    status: ContentExperiment['status'],
    observedFinding?: string
  ): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/experiments/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, observedFinding })
      });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }

  public async checkContentFatigue(items?: any[]): Promise<{
    warnings: FatigueWarning[];
    diversityScore: number;
    healthyPillarsCount: number;
  }> {
    try {
      const res = await fetch(`${this.baseUrl}/fatigue-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const data = await res.json();
      return {
        warnings: data.warnings || [],
        diversityScore: data.diversityScore || 100,
        healthyPillarsCount: data.healthyPillarsCount || 1
      };
    } catch {
      return { warnings: [], diversityScore: 100, healthyPillarsCount: 1 };
    }
  }

  public async getDailyBrief(): Promise<DailyIntelligenceBrief | null> {
    try {
      const res = await fetch(`${this.baseUrl}/daily-brief`);
      const data = await res.json();
      return data.brief || null;
    } catch {
      return null;
    }
  }
}

export const intelligenceService = new IntelligenceService();
