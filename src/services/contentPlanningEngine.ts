/**
 * FLASH.Ai Content Planning Engine
 * 
 * Responsibilities:
 * 1. Generates fresh AI / automation topics across all core pillars
 * 2. Generates multiple candidate content ideas
 * 3. Evaluates freshness and variety against content memory
 * 4. Automatically selects the optimal idea based on freshness and format rotation
 * 5. Maintains comprehensive content planning history
 * 6. Tracks: topic, format, hook, script, status, and publish date
 */

import { CONTENT_PILLARS } from '../constants/pillars';
import { reelFormatEngine, type ReelFormatDefinition, type ReelFormatId } from './reelFormatEngine';
import { contentMemoryService } from './contentMemoryService';
import { reelProductionEngine, type ProductionReelPackage } from './reelProductionEngine';

export type PlanItemStatus =
  | 'IDEA'
  | 'PLANNED'
  | 'DRAFT'
  | 'PRODUCTION'
  | 'PUBLISHED'
  | 'ARCHIVED';

export interface PlannedContentRecord {
  id: string;
  topic: string;
  pillarId: string;
  pillarName: string;
  formatId: ReelFormatId;
  formatName: string;
  hook: string;
  scriptSummary: string;
  status: PlanItemStatus;
  publishDate?: string;
  scheduledTime?: string;
  freshnessScore: number; // 0 - 100
  varietyScore: number; // 0 - 100
  targetAudience: string;
  productionPackage?: ProductionReelPackage;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateIdea {
  id: string;
  topic: string;
  pillarId: string;
  pillarName: string;
  format: ReelFormatDefinition;
  hookSample: string;
  freshnessScore: number;
  varietyScore: number;
  overallScore: number;
  reason: string;
  targetAudience: string;
}

const STORAGE_KEY = 'flash_ai_content_planner_records';

export class ContentPlanningEngine {
  private planRecords: PlannedContentRecord[] = [];

  constructor() {
    this.loadRecords();
  }

  private loadRecords(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          this.planRecords = JSON.parse(raw);
          return;
        }
      }
    } catch {
      // In-memory
    }

    // Default Seed Records reflecting FLASH.Ai's real publishing roadmap
    this.planRecords = [
      {
        id: 'plan-seed-1',
        topic: 'How Local Clinics Use AI WhatsApp Agents to Handle 40+ Inquiries Nightly',
        pillarId: 'whatsapp-automation',
        pillarName: 'WhatsApp Automation',
        formatId: 'case-study',
        formatName: 'Case Study',
        hook: 'What happens when a clinic gets 40 inquiries at 11 PM?',
        scriptSummary: 'Zero latency response via automated WhatsApp webhook qualifying appointment times.',
        status: 'PUBLISHED',
        publishDate: '2026-09-26',
        scheduledTime: '18:00',
        freshnessScore: 94,
        varietyScore: 92,
        targetAudience: 'Healthcare & Aesthetic Clinic Owners',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 86400000).toISOString()
      },
      {
        id: 'plan-seed-2',
        topic: '3 Fatal Mistakes Founders Make When Automating Client Onboarding',
        pillarId: 'ai-automation',
        pillarName: 'AI Automation',
        formatId: 'business-automation',
        formatName: 'Business Automation',
        hook: 'Stop doing this 1 thing with your client inquiries—it is costing you thousands.',
        scriptSummary: 'Exposing convoluted bot trees and replacing them with 1-click intake agents.',
        status: 'PUBLISHED',
        publishDate: '2026-09-28',
        scheduledTime: '18:00',
        freshnessScore: 90,
        varietyScore: 88,
        targetAudience: 'Agency Founders & SMB Leaders',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      {
        id: 'plan-seed-3',
        topic: 'Live Demo: Building a 24/7 AI Lead Qualifier in 60 Seconds with FLASH.Ai',
        pillarId: 'lead-generation',
        pillarName: 'Lead Generation',
        formatId: 'ai-automation-demo',
        formatName: 'AI Automation Demo',
        hook: 'Watch what happens when a prospect comments "AUTOMATE" on our Reel.',
        scriptSummary: 'Comment trigger executes webhook, verifies business size, and delivers strategy audit.',
        status: 'PLANNED',
        publishDate: '2026-10-01',
        scheduledTime: '18:00',
        freshnessScore: 96,
        varietyScore: 95,
        targetAudience: 'High-Ticket B2B & Digital Businesses',
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private saveRecords(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.planRecords));
      }
    } catch {
      // In-memory
    }
  }

  /**
   * Generates a batch of distinct candidate ideas across pillars and formats.
   */
  public generateCandidateIdeas(count: number = 4, preferredPillarId?: string): CandidateIdea[] {
    const memory = contentMemoryService.getHistory();
    const recentFormatIds = memory.slice(0, 5).map((m) => m.formatId);

    const topicTemplates = [
      {
        pillarId: 'ai-automation',
        template: 'How We Automated {SUBJECT} in Under 48 Hours for a Client',
        subjects: ['Client Onboarding', 'Invoice Processing', 'Lead Qualification', 'Customer Support Triaging']
      },
      {
        pillarId: 'whatsapp-automation',
        template: 'Why {SUBJECT} Gets 10x More Responses on WhatsApp Than Email',
        subjects: ['Abandoned Cart Recovery', 'Appointment Confirmations', 'Post-Service Follow-ups', 'Quote Requests']
      },
      {
        pillarId: 'ai-tools',
        template: '3 Practical AI Tools That Replace {SUBJECT} in 2026',
        subjects: ['20 Hours of Manual Admin', 'Expensive $99/mo SaaS Tools', 'Messy Manual Spreadsheets', 'Slow Meeting SOPs']
      },
      {
        pillarId: 'business-growth',
        template: 'The Exact System a {SUBJECT} Used to Add 30+ Clients Without Hiring',
        subjects: ['Local MedSpa', 'Real Estate Consultancy', 'Design Agency', 'High-Ticket Coach']
      },
      {
        pillarId: 'website-solutions',
        template: '3 Fatal Flaws on Your Website That Kill {SUBJECT}',
        subjects: ['Mobile Inbound Inquiries', 'Form Submission Conversions', 'Customer Trust and Speed', 'Google Local Ranking']
      },
      {
        pillarId: 'lead-generation',
        template: 'How to Turn Instagram Comments Into {SUBJECT} on Autopilot',
        subjects: ['High-Intent Booked Calls', 'Qualified CRM Pipeline Leads', 'Direct WhatsApp Conversations', 'Instant Strategy Audits']
      },
      {
        pillarId: 'behind-the-scenes',
        template: 'Inside the Code: How Our {SUBJECT} Operates in Real Time',
        subjects: ['Multi-Agent Social OS', 'Webhook Security Shield', 'Live Inbound DM Qualifier', 'Daily Video Production Pipeline']
      }
    ];

    const candidates: CandidateIdea[] = [];
    const usedFormatsInBatch = new Set<string>();

    for (let i = 0; i < count; i++) {
      // Pick template
      const pool = preferredPillarId
        ? topicTemplates.filter((t) => t.pillarId === preferredPillarId)
        : topicTemplates;
      const templateObj = pool[i % pool.length] || topicTemplates[0];
      const subject = templateObj.subjects[(i + Math.floor(Math.random() * 3)) % templateObj.subjects.length];
      const topic = templateObj.template.replace('{SUBJECT}', subject);

      // Select format ensuring variety
      const format = reelFormatEngine.selectNextFormat({
        pillarId: templateObj.pillarId,
        recentFormatIds: [...recentFormatIds, ...Array.from(usedFormatsInBatch)]
      });
      usedFormatsInBatch.add(format.id);

      // Check freshness against content memory
      const memCheck = contentMemoryService.evaluateCandidate({
        topic,
        hook: format.hookFormula,
        formatId: format.id
      });

      const freshnessScore = Math.max(20, 100 - memCheck.repetitionScore);
      const varietyScore = recentFormatIds.includes(format.id) ? 65 : 95;
      const overallScore = Math.round(freshnessScore * 0.6 + varietyScore * 0.4);

      const pillarObj = CONTENT_PILLARS.find((p) => p.id === templateObj.pillarId) || CONTENT_PILLARS[0];

      candidates.push({
        id: `cand-${Date.now()}-${i + 1}`,
        topic,
        pillarId: templateObj.pillarId,
        pillarName: pillarObj.name,
        format,
        hookSample: format.hookFormula,
        freshnessScore,
        varietyScore,
        overallScore,
        reason: memCheck.passed
          ? `High novelty in ${pillarObj.name} with fresh ${format.name} format.`
          : `Moderate overlap (${memCheck.repetitionScore}%); re-angled for freshness.`,
        targetAudience: pillarObj.defaultAudience
      });
    }

    // Sort descending by overall score
    return candidates.sort((a, b) => b.overallScore - a.overallScore);
  }

  /**
   * Evaluates multiple candidate ideas and selects the single optimal idea based on freshness and variety.
   */
  public selectBestIdea(candidates: CandidateIdea[]): CandidateIdea {
    if (candidates.length === 0) {
      const generated = this.generateCandidateIdeas(3);
      return generated[0];
    }
    // Pick the highest scoring idea
    return [...candidates].sort((a, b) => b.overallScore - a.overallScore)[0];
  }

  /**
   * Plans a selected idea, builds its full production package, and records it in history.
   */
  public commitPlanItem(candidate: CandidateIdea, publishDate?: string, scheduledTime: string = '18:00'): PlannedContentRecord {
    // Generate full production package via ReelProductionEngine
    const prodPackage = reelProductionEngine.generateReelPackage({
      topic: candidate.topic,
      pillarId: candidate.pillarId,
      formatId: candidate.format.id,
      targetAudience: candidate.targetAudience,
      preferredMode: 'DEMO'
    });

    const record: PlannedContentRecord = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      topic: candidate.topic,
      pillarId: candidate.pillarId,
      pillarName: candidate.pillarName,
      formatId: candidate.format.id,
      formatName: candidate.format.name,
      hook: prodPackage.hook,
      scriptSummary: prodPackage.conceptSummary,
      status: 'PLANNED',
      publishDate: publishDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime,
      freshnessScore: candidate.freshnessScore,
      varietyScore: candidate.varietyScore,
      targetAudience: candidate.targetAudience,
      productionPackage: prodPackage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.planRecords.unshift(record);
    this.saveRecords();
    return record;
  }

  /**
   * Update plan item status (e.g. from PLANNED -> PRODUCTION -> PUBLISHED)
   */
  public updateStatus(id: string, newStatus: PlanItemStatus, additionalUpdates?: Partial<PlannedContentRecord>): PlannedContentRecord | null {
    const item = this.planRecords.find((r) => r.id === id);
    if (!item) return null;

    item.status = newStatus;
    item.updatedAt = new Date().toISOString();
    if (additionalUpdates) {
      Object.assign(item, additionalUpdates);
    }

    if (newStatus === 'PUBLISHED') {
      contentMemoryService.recordItem({
        id: item.id,
        topic: item.topic,
        hook: item.hook,
        formatId: item.formatId,
        formatName: item.formatName,
        scriptConcept: item.scriptSummary,
        visualConcept: item.productionPackage?.scenes[2]?.visualInstruction || 'Visual demo',
        pillarId: item.pillarId,
        status: 'PUBLISHED',
        publishedDate: item.publishDate || new Date().toISOString().split('T')[0]
      });
    }

    this.saveRecords();
    return item;
  }

  public getPlanRecords(): PlannedContentRecord[] {
    return [...this.planRecords];
  }

  public deletePlanRecord(id: string): boolean {
    const beforeLen = this.planRecords.length;
    this.planRecords = this.planRecords.filter((r) => r.id !== id);
    const removed = this.planRecords.length !== beforeLen;
    if (removed) {
      this.saveRecords();
    }
    return removed;
  }
}

export const contentPlanningEngine = new ContentPlanningEngine();
