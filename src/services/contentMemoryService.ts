/**
 * FLASH.Ai Content Memory & No-Repeat Prevention System
 * 
 * Inspects historical and scheduled content items to prevent duplicate or near-identical:
 * - Topics
 * - Hooks
 * - Formats
 * - Script concepts
 * - Visual concepts
 */

export interface MemoryRecord {
  id: string;
  topic: string;
  hook: string;
  formatId: string;
  formatName: string;
  scriptConcept: string;
  visualConcept: string;
  pillarId: string;
  status: string;
  createdAt: string;
  publishedDate?: string;
}

export interface MemoryCheckResult {
  isDuplicate: boolean;
  repetitionScore: number; // 0 - 100
  passed: boolean;
  reasons: string[];
  matchedItems: Array<{
    id: string;
    topic: string;
    hook: string;
    similarity: number;
    matchType: 'TOPIC' | 'HOOK' | 'FORMAT' | 'CONCEPT' | 'VISUAL';
  }>;
}

const STORAGE_KEY = 'flash_ai_content_memory_records';

export class ContentMemoryService {
  private records: MemoryRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.records = JSON.parse(raw);
          return;
        }
      }
    } catch {
      // In-memory fallback
    }

    // Default seed memory records from established FLASH.Ai content history
    this.records = [
      {
        id: 'mem-seed-1',
        topic: 'How Local Clinics Use AI WhatsApp Agents to Handle 40+ Inquiries Nightly',
        hook: 'What happens when a clinic gets 40 inquiries at 11 PM?',
        formatId: 'case-study',
        formatName: 'Case Study',
        scriptConcept: 'WhatsApp automation handles after-hours patient inquiries and books slots directly into calendar.',
        visualConcept: 'Split screen showing night clock and instant WhatsApp confirmation turning calendar slot green.',
        pillarId: 'whatsapp-automation',
        status: 'PUBLISHED',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        publishedDate: '2026-09-25'
      },
      {
        id: 'mem-seed-2',
        topic: '3 Fatal Mistakes Founders Make When Automating Client Onboarding',
        hook: 'Stop doing this 1 thing with your client inquiries—it is costing you thousands.',
        formatId: 'business-automation',
        formatName: 'Business Automation',
        scriptConcept: 'Founders over-complicate bot logic before fixing the root intake form.',
        visualConcept: 'Zoom on phone showing red missed call notification and frustrated owner.',
        pillarId: 'ai-automation',
        status: 'PUBLISHED',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        publishedDate: '2026-09-26'
      },
      {
        id: 'mem-seed-3',
        topic: 'Building a 24/7 AI Lead Qualifier in 60 Seconds with FLASH.Ai',
        hook: 'Watch what happens when a prospect comments "AUTOMATE" on our Reel.',
        formatId: 'ai-automation-demo',
        formatName: 'AI Automation Demo',
        scriptConcept: 'Live trigger-to-DM demonstration qualifying high ticket intent in real time.',
        visualConcept: 'Live screen recording showing comment notification triggering instant DM with custom button flow.',
        pillarId: 'lead-generation',
        status: 'PUBLISHED',
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        publishedDate: '2026-09-27'
      }
    ];
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records.slice(-100)));
      }
    } catch {
      // In-memory
    }
  }

  /**
   * Tokenize text into normalized unique words for similarity comparison.
   */
  private tokenize(text: string): Set<string> {
    if (!text) return new Set();
    const stopWords = new Set([
      'the', 'is', 'at', 'which', 'on', 'a', 'an', 'in', 'and', 'or', 'for', 'with', 'to', 'of',
      'this', 'that', 'how', 'what', 'why', 'your', 'our', 'we', 'you', 'from', 'it', 'by'
    ]);
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
    return new Set(words);
  }

  /**
   * Calculates Jaccard similarity between two token sets (0.0 to 1.0).
   */
  private calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    if (setA.size === 0 || setB.size === 0) return 0;
    let intersection = 0;
    for (const item of setA) {
      if (setB.has(item)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 0 : intersection / union;
  }

  /**
   * Checks whether candidate content duplicates or closely mirrors past content.
   */
  public evaluateCandidate(candidate: {
    id?: string;
    topic: string;
    hook: string;
    formatId?: string;
    scriptConcept?: string;
    visualConcept?: string;
  }): MemoryCheckResult {
    const reasons: string[] = [];
    const matchedItems: MemoryCheckResult['matchedItems'] = [];
    let maxSimilarity = 0;

    const candidateTopicTokens = this.tokenize(candidate.topic);
    const candidateHookTokens = this.tokenize(candidate.hook);
    const candidateScriptTokens = this.tokenize(candidate.scriptConcept || '');
    const candidateVisualTokens = this.tokenize(candidate.visualConcept || '');

    // Recent 15 records (excluding the item itself if checking an existing item)
    const recentRecords = this.records
      .filter((r) => !candidate.id || (!r.id.includes(candidate.id) && !candidate.id.includes(r.id)))
      .slice(-15);

    for (const record of recentRecords) {
      // 1. Topic Similarity
      const recordTopicTokens = this.tokenize(record.topic);
      const topicSim = this.calculateJaccardSimilarity(candidateTopicTokens, recordTopicTokens);

      if (topicSim >= 0.75) {
        reasons.push(`Topic is too similar to recent post (${Math.round(topicSim * 100)}% match): "${record.topic}"`);
        matchedItems.push({
          id: record.id,
          topic: record.topic,
          hook: record.hook,
          similarity: Math.round(topicSim * 100),
          matchType: 'TOPIC'
        });
        maxSimilarity = Math.max(maxSimilarity, topicSim);
      }

      // 2. Hook Similarity
      const recordHookTokens = this.tokenize(record.hook);
      const hookSim = this.calculateJaccardSimilarity(candidateHookTokens, recordHookTokens);

      if (hookSim >= 0.70) {
        reasons.push(`Hook formula is too similar to recent post (${Math.round(hookSim * 100)}% match): "${record.hook}"`);
        matchedItems.push({
          id: record.id,
          topic: record.topic,
          hook: record.hook,
          similarity: Math.round(hookSim * 100),
          matchType: 'HOOK'
        });
        maxSimilarity = Math.max(maxSimilarity, hookSim);
      }

      // 3. Script Concept Similarity
      if (candidate.scriptConcept && record.scriptConcept) {
        const recordScriptTokens = this.tokenize(record.scriptConcept);
        const scriptSim = this.calculateJaccardSimilarity(candidateScriptTokens, recordScriptTokens);
        if (scriptSim >= 0.70) {
          reasons.push(`Script concept overlaps heavily with: "${record.topic}"`);
          maxSimilarity = Math.max(maxSimilarity, scriptSim);
        }
      }

      // 4. Visual Concept Similarity
      if (candidate.visualConcept && record.visualConcept) {
        const recordVisualTokens = this.tokenize(record.visualConcept);
        const visualSim = this.calculateJaccardSimilarity(candidateVisualTokens, recordVisualTokens);
        if (visualSim >= 0.75) {
          reasons.push(`Visual concept overlaps heavily with: "${record.topic}"`);
          maxSimilarity = Math.max(maxSimilarity, visualSim);
        }
      }
    }

    // 5. Format Recency Check (same format in the immediately preceding item)
    if (candidate.formatId && recentRecords.length > 0) {
      const lastRecord = recentRecords[recentRecords.length - 1];
      if (lastRecord.formatId === candidate.formatId) {
        reasons.push(`Format "${candidate.formatId}" was used in the previous item. Variety engine recommends alternating formats.`);
        maxSimilarity = Math.max(maxSimilarity, 0.4);
      }
    }

    const repetitionScore = Math.min(100, Math.round(maxSimilarity * 100));
    // Hard duplicate if similarity >= 70%
    const isDuplicate = repetitionScore >= 70;

    return {
      isDuplicate,
      repetitionScore,
      passed: !isDuplicate,
      reasons,
      matchedItems
    };
  }

  /**
   * Registers a newly planned or created Reel into persistent content memory.
   */
  public recordItem(item: {
    id: string;
    topic: string;
    hook: string;
    formatId: string;
    formatName: string;
    scriptConcept: string;
    visualConcept: string;
    pillarId: string;
    status: string;
    publishedDate?: string;
  }): void {
    const existingIndex = this.records.findIndex((r) => r.id === item.id);
    const newRecord: MemoryRecord = {
      ...item,
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      this.records[existingIndex] = newRecord;
    } else {
      this.records.push(newRecord);
    }

    this.saveToStorage();
  }

  /**
   * Commits or registers published content into memory with sensible defaults.
   */
  public commitContent(item: {
    id?: string;
    topic: string;
    hook: string;
    formatId?: string;
    formatName?: string;
    scriptConcept?: string;
    visualConcept?: string;
    pillarId?: string;
    status?: string;
    publishedDate?: string;
  }): void {
    this.recordItem({
      id: item.id || `mem-${Date.now()}`,
      topic: item.topic,
      hook: item.hook,
      formatId: item.formatId || 'business-automation',
      formatName: item.formatName || 'Business Automation',
      scriptConcept: item.scriptConcept || item.topic,
      visualConcept: item.visualConcept || 'Visual demo footage',
      pillarId: item.pillarId || 'ai-automation',
      status: item.status || 'PUBLISHED',
      publishedDate: item.publishedDate || new Date().toISOString()
    });
  }

  public getHistory(): MemoryRecord[] {
    return [...this.records].reverse();
  }

  public clearHistory(): void {
    this.records = [];
    this.saveToStorage();
  }
}

export const contentMemoryService = new ContentMemoryService();
