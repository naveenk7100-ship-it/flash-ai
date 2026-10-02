import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type {
  ContentIdea,
  ContentItem,
  Lead,
  AnalyticsSnapshot,
  AutomationSetting,
  GenerationHistoryItem,
  AIProviderStatus,
  PublishingJob,
  PublishingActivityLogItem,
  PublishingMode,
  MediaType
} from '../types';
import { storageService } from '../services/storageService';
import { aiGeneratorService } from '../services/aiGeneratorService';
import { metaApiService, type MetaStatusResponse } from '../services/metaApiService';
import { schedulerService } from '../services/schedulerService';

export type AppTab =
  | 'dashboard'
  | 'automation'
  | 'planner'
  | 'generator'
  | 'media'
  | 'approval'
  | 'published'
  | 'inbox'
  | 'leads'
  | 'analytics'
  | 'activity'
  | 'settings'
  | 'architecture';

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  generatorPrefill: { topic?: string; pillarId?: string; audience?: string } | null;
  setGeneratorPrefill: (prefill: { topic?: string; pillarId?: string; audience?: string } | null) => void;

  // Data
  ideas: ContentIdea[];
  contentItems: ContentItem[];
  leads: Lead[];
  analytics: AnalyticsSnapshot;
  settings: AutomationSetting;
  generationHistory: GenerationHistoryItem[];
  publishingJobs: PublishingJob[];
  activityLogs: PublishingActivityLogItem[];
  aiStatus: AIProviderStatus;
  metaStatus: MetaStatusResponse;
  notifications: ToastNotification[];
  publishingMode: PublishingMode;

  // Real AI & Meta Status
  refreshAiStatus: () => Promise<void>;
  refreshMetaStatus: () => Promise<void>;
  verifyMetaConnection: () => Promise<{ valid: boolean; username?: string; error?: string }>;
  setPublishingMode: (mode: PublishingMode) => void;

  // Idea Actions
  addIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>) => ContentIdea;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => void;
  deleteIdea: (id: string) => void;

  // Content Items / Approval Actions
  addContentItem: (item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => ContentItem;
  batchAddContentItems: (items: Array<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>>) => ContentItem[];
  updateContentItem: (id: string, updates: Partial<ContentItem>) => void;
  deleteContentItem: (id: string) => void;
  approveContentItem: (id: string) => void;
  rejectContentItem: (id: string, reason?: string) => void;
  scheduleContentItem: (id: string, scheduledDate: string, scheduledTime?: string, timezone?: string) => void;

  // Real Publishing & Scheduling Execution
  publishContentItemNow: (
    itemId: string,
    mediaUrl: string,
    mediaType?: MediaType
  ) => Promise<{ success: boolean; metaPostId?: string; error?: string }>;
  schedulePublishJob: (
    itemId: string,
    scheduledDate: string,
    scheduledTime: string,
    timezone: string,
    mediaUrl: string,
    mediaType?: MediaType
  ) => PublishingJob;
  retryPublishingJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
  cancelPublishingJob: (jobId: string) => void;

  // Activity Log
  logActivity: (
    action: string,
    contentTitle: string,
    status: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROCESSING',
    message: string,
    meta?: { jobId?: string; metaPostId?: string; isDemo?: boolean }
  ) => void;
  clearActivityLogs: () => void;

  // History Actions
  saveToHistory: (item: Omit<GenerationHistoryItem, 'id' | 'generatedAt'>) => GenerationHistoryItem;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;

  // Lead Actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;

  // Settings Actions
  updateSettings: (settings: AutomationSetting) => void;
  resetAllData: () => void;

  // Notification
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;

  // Quick stats
  stats: {
    totalPosts: number;
    plannedCount: number;
    awaitingApprovalCount: number;
    publishedCount: number;
    activeLeadsCount: number;
    wonLeadsCount: number;
    totalPipelineValue: number;
    queuedJobsCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [generatorPrefill, setGeneratorPrefill] = useState<{ topic?: string; pillarId?: string; audience?: string } | null>(null);

  const [ideas, setIdeas] = useState<ContentIdea[]>(() => storageService.getIdeas());
  const [contentItems, setContentItems] = useState<ContentItem[]>(() => storageService.getContentItems());
  const [leads, setLeads] = useState<Lead[]>(() => storageService.getLeads());
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>(() => storageService.getAnalytics());
  const [settings, setSettings] = useState<AutomationSetting>(() => storageService.getSettings());
  const [generationHistory, setGenerationHistory] = useState<GenerationHistoryItem[]>(() => storageService.getHistory());
  const [publishingJobs, setPublishingJobs] = useState<PublishingJob[]>(() => storageService.getPublishingJobs());
  const [activityLogs, setActivityLogs] = useState<PublishingActivityLogItem[]>(() => storageService.getActivityLogs());
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const [publishingMode, setPublishingModeState] = useState<PublishingMode>(() => {
    return settings.instagram?.publishingMode || 'DEMO';
  });

  const [aiStatus, setAiStatus] = useState<AIProviderStatus>({
    isConnected: false,
    provider: 'gemini',
    model: 'gemini-2.0-flash'
  });

  const [metaStatus, setMetaStatus] = useState<MetaStatusResponse>({
    isConnected: false,
    provider: 'Meta Instagram Graph API',
    apiVersion: 'v21.0',
    isConfigured: false,
    mode: 'DEMO',
    permissions: [],
    missingConfig: ['META_ACCESS_TOKEN', 'META_INSTAGRAM_ACCOUNT_ID'],
    lastChecked: new Date().toISOString()
  });

  const refreshAiStatus = useCallback(async () => {
    const status = await aiGeneratorService.checkStatus();
    setAiStatus(status);
  }, []);

  const refreshMetaStatus = useCallback(async () => {
    const status = await metaApiService.getConnectionStatus();
    setMetaStatus(status);
  }, []);

  useEffect(() => {
    refreshAiStatus();
    refreshMetaStatus();
  }, [refreshAiStatus, refreshMetaStatus]);

  // Sync to localStorage
  useEffect(() => {
    storageService.saveIdeas(ideas);
  }, [ideas]);

  useEffect(() => {
    storageService.saveContentItems(contentItems);
  }, [contentItems]);

  useEffect(() => {
    storageService.saveLeads(leads);
  }, [leads]);

  useEffect(() => {
    storageService.saveAnalytics(analytics);
  }, [analytics]);

  useEffect(() => {
    storageService.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    storageService.saveHistory(generationHistory);
  }, [generationHistory]);

  useEffect(() => {
    storageService.savePublishingJobs(publishingJobs);
  }, [publishingJobs]);

  useEffect(() => {
    storageService.saveActivityLogs(activityLogs);
  }, [activityLogs]);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const logActivity = useCallback(
    (
      action: string,
      contentTitle: string,
      status: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'PROCESSING',
      message: string,
      meta?: { jobId?: string; metaPostId?: string; isDemo?: boolean }
    ) => {
      const newLog: PublishingActivityLogItem = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        action,
        contentTitle,
        status,
        message,
        jobId: meta?.jobId,
        metaPostId: meta?.metaPostId,
        isDemo: meta?.isDemo ?? (publishingMode === 'DEMO')
      };
      setActivityLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    },
    [publishingMode]
  );

  const clearActivityLogs = () => {
    setActivityLogs([]);
    showToast('Activity log cleared', 'info');
  };

  const setPublishingMode = (mode: PublishingMode) => {
    setPublishingModeState(mode);
    setSettings((prev) => ({
      ...prev,
      instagram: {
        ...prev.instagram,
        publishingMode: mode
      }
    }));
    logActivity(
      'Publishing mode changed',
      'System Settings',
      'INFO',
      `Switched publishing mode to ${mode}.`
    );
    showToast(`Publishing mode switched to ${mode}`, mode === 'LIVE' ? 'warning' : 'info');
  };

  const verifyMetaConnection = async () => {
    logActivity('Connection verification started', 'Meta Instagram Graph API', 'PROCESSING', 'Testing server-side credentials with Meta Graph API...');
    const result = await metaApiService.validateCredentials();
    await refreshMetaStatus();

    if (result.valid) {
      logActivity(
        'Connection verified',
        'Meta Instagram Graph API',
        'SUCCESS',
        `Successfully verified connection to Instagram account: @${result.username || 'flash.ai'}`
      );
      showToast(`Meta Graph API connected as @${result.username || 'flash.ai'}!`, 'success');
    } else {
      logActivity(
        'Connection check failed',
        'Meta Instagram Graph API',
        'ERROR',
        result.error || 'Failed to verify Meta Graph API credentials.'
      );
      showToast(`Meta verification failed: ${result.error}`, 'error');
    }

    return result;
  };

  // Idea CRUD
  const addIdea = (ideaData: Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>): ContentIdea => {
    const newIdea: ContentIdea = {
      ...ideaData,
      id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setIdeas((prev) => [newIdea, ...prev]);
    showToast(`Added idea: "${newIdea.title.slice(0, 30)}..."`, 'success');
    return newIdea;
  };

  const updateIdea = (id: string, updates: Partial<ContentIdea>) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, ...updates, updatedAt: new Date().toISOString() } : idea
      )
    );
    showToast('Content idea updated', 'info');
  };

  const deleteIdea = (id: string) => {
    setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    showToast('Content idea removed', 'info');
  };

  // Content Items CRUD
  const addContentItem = (
    itemData: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): ContentItem => {
    const newItem: ContentItem = {
      ...itemData,
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContentItems((prev) => [newItem, ...prev]);
    showToast(`Content sent to Approval Queue: "${newItem.title.slice(0, 30)}..."`, 'success');
    return newItem;
  };

  const batchAddContentItems = (
    itemsData: Array<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt' | 'version'>>
  ): ContentItem[] => {
    const newItems: ContentItem[] = itemsData.map((itemData, idx) => ({
      ...itemData,
      id: `content-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    setContentItems((prev) => [...newItems, ...prev]);
    showToast(`Queued ${newItems.length} daily items in Approval Queue!`, 'success');
    return newItems;
  };

  const updateContentItem = (id: string, updates: Partial<ContentItem>) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
    showToast('Content item updated', 'info');
  };

  const deleteContentItem = (id: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Content item deleted', 'info');
  };

  const approveContentItem = (id: string) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'APPROVED', updatedAt: new Date().toISOString() } : item
      )
    );
    showToast('Content item APPROVED! Ready for scheduling or immediate publishing.', 'success');
  };

  const rejectContentItem = (id: string, reason?: string) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: 'REJECTED',
              rejectionReason: reason || 'Needs revisions before publishing.',
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
    showToast('Content item marked as REJECTED', 'warning');
  };

  const scheduleContentItem = (
    id: string,
    scheduledDate: string,
    scheduledTime: string = '18:00',
    timezone: string = 'Asia/Kolkata'
  ) => {
    setContentItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              scheduledDate,
              scheduledTime,
              timezone,
              status: item.status === 'APPROVED' ? 'APPROVED' : 'REVIEW',
              updatedAt: new Date().toISOString()
            }
          : item
      )
    );
    showToast(`Scheduled for ${scheduledDate} at ${scheduledTime} (${timezone})`, 'success');
  };

  // ==========================================
  // REAL PUBLISHING & SCHEDULING EXECUTION
  // ==========================================

  const publishContentItemNow = async (
    itemId: string,
    mediaUrl: string,
    mediaType: MediaType = 'REELS'
  ): Promise<{ success: boolean; metaPostId?: string; error?: string }> => {
    const item = contentItems.find((c) => c.id === itemId);
    if (!item) {
      return { success: false, error: 'Content item not found' };
    }

    // Guard: Must be approved (Requirement)
    if (item.status !== 'APPROVED') {
      showToast('Mandatory Human Approval required before publishing.', 'warning');
      return { success: false, error: 'Content is not approved' };
    }

    // Create Job
    const job = schedulerService.createJobFromItem(
      item,
      mediaUrl,
      mediaType,
      undefined,
      settings.publishing?.timezone || 'Asia/Kolkata',
      publishingMode === 'DEMO'
    );

    setPublishingJobs((prev) => [job, ...prev]);

    logActivity(
      'Publishing job created',
      item.title,
      'INFO',
      `Created publishing job [${job.id}] for format ${mediaType} in ${publishingMode} mode.`,
      { jobId: job.id, isDemo: publishingMode === 'DEMO' }
    );

    // Execute through scheduler pipeline
    const result = await schedulerService.executePublishJob(
      job,
      item,
      publishingMode,
      (updatedJob, status, message) => {
        setPublishingJobs((prev) =>
          prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        );
        logActivity(
          status === 'PUBLISHED' ? 'Published successfully' : `Publishing: ${status}`,
          item.title,
          status === 'PUBLISHED' ? 'SUCCESS' : status === 'FAILED' ? 'ERROR' : 'PROCESSING',
          message || `Job status updated to ${status}`,
          { jobId: updatedJob.id, metaPostId: updatedJob.externalMediaId, isDemo: updatedJob.isDemo }
        );
      }
    );

    if (result.success) {
      // Mark ContentItem as PUBLISHED
      setContentItems((prev) =>
        prev.map((c) =>
          c.id === itemId
            ? {
                ...c,
                status: 'PUBLISHED',
                publishedAt: result.job.completedAt || new Date().toISOString(),
                publishedMediaId: result.job.externalMediaId,
                publishedUrl: result.job.permalink,
                mediaUrl: result.job.mediaUrl,
                mediaType: result.job.mediaType,
                updatedAt: new Date().toISOString()
              }
            : c
        )
      );

      showToast(
        publishingMode === 'DEMO'
          ? 'DEMO Published! (Simulated container & post ID created)'
          : 'PUBLISHED LIVE to Instagram via Official Meta Graph API!',
        'success'
      );
      return { success: true, metaPostId: result.job.externalMediaId };
    } else {
      showToast(`Publishing failed: ${result.error}`, 'error');
      return { success: false, error: result.error };
    }
  };

  const schedulePublishJob = (
    itemId: string,
    scheduledDate: string,
    scheduledTime: string = '18:00',
    timezone: string = 'Asia/Kolkata',
    mediaUrl: string,
    mediaType: MediaType = 'REELS'
  ): PublishingJob => {
    const item = contentItems.find((c) => c.id === itemId);
    if (!item) {
      throw new Error('Content item not found');
    }

    const scheduledIso = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

    const job = schedulerService.createJobFromItem(
      item,
      mediaUrl,
      mediaType,
      scheduledIso,
      timezone,
      publishingMode === 'DEMO'
    );

    setPublishingJobs((prev) => [job, ...prev]);

    // Update Content Item
    setContentItems((prev) =>
      prev.map((c) =>
        c.id === itemId
          ? {
              ...c,
              scheduledDate,
              scheduledTime,
              timezone,
              mediaUrl,
              mediaType,
              status: c.status === 'APPROVED' ? 'APPROVED' : 'REVIEW',
              updatedAt: new Date().toISOString()
            }
          : c
      )
    );

    logActivity(
      'Scheduled publishing job',
      item.title,
      'INFO',
      `Queued job for ${scheduledDate} at ${scheduledTime} (${timezone}).`,
      { jobId: job.id, isDemo: job.isDemo }
    );

    showToast(`Job queued for ${scheduledDate} at ${scheduledTime} (${timezone})`, 'success');
    return job;
  };

  const retryPublishingJob = async (jobId: string): Promise<{ success: boolean; error?: string }> => {
    const job = publishingJobs.find((j) => j.id === jobId);
    if (!job) return { success: false, error: 'Job not found' };

    const item = contentItems.find((c) => c.id === job.contentId);
    if (!item) return { success: false, error: 'Associated content item not found' };

    logActivity(
      'Retry attempted',
      job.contentTitle,
      'PROCESSING',
      `Retrying failed job [${job.id}]. Attempt #${job.retryCount + 1}...`,
      { jobId: job.id }
    );

    const result = await schedulerService.executePublishJob(
      job,
      item,
      publishingMode,
      (updatedJob, status, message) => {
        setPublishingJobs((prev) =>
          prev.map((j) => (j.id === updatedJob.id ? updatedJob : j))
        );
        logActivity(
          status === 'PUBLISHED' ? 'Published successfully' : `Retry: ${status}`,
          item.title,
          status === 'PUBLISHED' ? 'SUCCESS' : status === 'FAILED' ? 'ERROR' : 'PROCESSING',
          message || `Retry status: ${status}`,
          { jobId: updatedJob.id, metaPostId: updatedJob.externalMediaId }
        );
      }
    );

    if (result.success) {
      setContentItems((prev) =>
        prev.map((c) =>
          c.id === item.id
            ? {
                ...c,
                status: 'PUBLISHED',
                publishedAt: result.job.completedAt || new Date().toISOString(),
                publishedMediaId: result.job.externalMediaId,
                publishedUrl: result.job.permalink,
                updatedAt: new Date().toISOString()
              }
            : c
        )
      );
      showToast('Retry succeeded! Content is now published.', 'success');
      return { success: true };
    } else {
      showToast(`Retry failed: ${result.error}`, 'error');
      return { success: false, error: result.error };
    }
  };

  const cancelPublishingJob = (jobId: string) => {
    setPublishingJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, status: 'CANCELLED', errorMessage: 'Cancelled by user.' }
          : j
      )
    );
    logActivity(
      'Publishing job cancelled',
      'Publishing Queue',
      'WARNING',
      `Job [${jobId}] cancelled by user.`
    );
    showToast('Publishing job cancelled', 'info');
  };

  // History Actions
  const saveToHistory = (itemData: Omit<GenerationHistoryItem, 'id' | 'generatedAt'>): GenerationHistoryItem => {
    const newItem: GenerationHistoryItem = {
      ...itemData,
      id: `hist-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      generatedAt: new Date().toISOString()
    };
    setGenerationHistory((prev) => [newItem, ...prev.slice(0, 49)]);
    return newItem;
  };

  const deleteHistoryItem = (id: string) => {
    setGenerationHistory((prev) => prev.filter((h) => h.id !== id));
    showToast('Removed item from generation history', 'info');
  };

  const clearHistory = () => {
    setGenerationHistory([]);
    showToast('Generation history cleared', 'info');
  };

  // Lead CRUD
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setLeads((prev) => [newLead, ...prev]);
    showToast(`New lead logged: ${newLead.name} (${newLead.business})`, 'success');
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, ...updates, updatedAt: new Date().toISOString() } : lead
      )
    );
    showToast('Lead details updated', 'info');
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    showToast('Lead deleted', 'info');
  };

  // Settings
  const updateSettings = (newSettings: AutomationSetting) => {
    setSettings(newSettings);
    if (newSettings.instagram?.publishingMode) {
      setPublishingModeState(newSettings.instagram.publishingMode);
    }
    showToast('Settings saved successfully', 'success');
  };

  const resetAllData = () => {
    storageService.resetAllToSeed();
    setIdeas(storageService.getIdeas());
    setContentItems(storageService.getContentItems());
    setLeads(storageService.getLeads());
    setAnalytics(storageService.getAnalytics());
    setSettings(storageService.getSettings());
    setGenerationHistory(storageService.getHistory());
    setPublishingJobs(storageService.getPublishingJobs());
    setActivityLogs(storageService.getActivityLogs());
    setPublishingModeState('DEMO');
    showToast('Reset all data to default FLASH.Ai seed state', 'info');
  };

  // Aggregated Stats
  const stats = useMemo(() => {
    const totalPosts = contentItems.length + ideas.length;
    const plannedCount =
      ideas.filter((i) => i.status !== 'PUBLISHED').length +
      contentItems.filter((c) => c.status === 'APPROVED' || c.status === 'SCRIPT' || c.status === 'CREATIVE').length;
    const awaitingApprovalCount = contentItems.filter((c) => c.status === 'REVIEW').length;
    const publishedCount = contentItems.filter((c) => c.status === 'PUBLISHED').length;
    const queuedJobsCount = publishingJobs.filter((j) => j.status === 'QUEUED' || j.status === 'READY').length;
    const activeLeadsCount = leads.filter(
      (l) => l.status !== 'WON' && l.status !== 'LOST'
    ).length;
    const wonLeadsCount = leads.filter((l) => l.status === 'WON').length;
    const totalPipelineValue = leads.reduce(
      (sum, l) => sum + (l.estimatedDealValue || 0),
      0
    );

    return {
      totalPosts,
      plannedCount,
      awaitingApprovalCount,
      publishedCount,
      activeLeadsCount,
      wonLeadsCount,
      totalPipelineValue,
      queuedJobsCount
    };
  }, [ideas, contentItems, leads, publishingJobs]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        generatorPrefill,
        setGeneratorPrefill,
        ideas,
        contentItems,
        leads,
        analytics,
        settings,
        generationHistory,
        publishingJobs,
        activityLogs,
        aiStatus,
        metaStatus,
        notifications,
        publishingMode,
        refreshAiStatus,
        refreshMetaStatus,
        verifyMetaConnection,
        setPublishingMode,
        addIdea,
        updateIdea,
        deleteIdea,
        addContentItem,
        batchAddContentItems,
        updateContentItem,
        deleteContentItem,
        approveContentItem,
        rejectContentItem,
        scheduleContentItem,
        publishContentItemNow,
        schedulePublishJob,
        retryPublishingJob,
        cancelPublishingJob,
        logActivity,
        clearActivityLogs,
        saveToHistory,
        deleteHistoryItem,
        clearHistory,
        addLead,
        updateLead,
        deleteLead,
        updateSettings,
        resetAllData,
        showToast,
        dismissToast,
        stats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
