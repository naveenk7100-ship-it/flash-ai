import { leadExtractorManager } from '../meta/leadExtractor.ts';
import type { Lead } from '../../src/types/index.ts';

export interface ContentLeadAttribution {
  contentId: string;
  postTitle: string;
  totalLeads: number;
  qualifiedLeads: number;
  wonDealsCount: number;
  totalPipelineValue: number; // in INR
  wonRevenue: number; // in INR
  leadsList: Array<{
    leadId: string;
    name: string;
    username?: string;
    platform: string;
    status: string;
    intent?: string;
    dealValue: number;
    capturedAt: string;
  }>;
  attributionStatus: 'ATTRIBUTED' | 'ATTRIBUTION_UNAVAILABLE';
}

export class LeadAttributionEngine {
  /**
   * Calculates real CRM lead attribution for a given content item.
   */
  public getAttributionForContent(
    contentId: string,
    contentTitle: string,
    mediaId?: string
  ): ContentLeadAttribution {
    const allLeads = leadExtractorManager.getAllLeads();

    // Match leads by sourcePostId, contentId, or contentTitle substring
    const matchedLeads = allLeads.filter((lead: Lead) => {
      if (lead.sourcePostId && (lead.sourcePostId === contentId || lead.sourcePostId === mediaId)) {
        return true;
      }
      if (lead.sourcePostTitle && contentTitle) {
        return (
          lead.sourcePostTitle.toLowerCase().includes(contentTitle.toLowerCase()) ||
          contentTitle.toLowerCase().includes(lead.sourcePostTitle.toLowerCase())
        );
      }
      if (lead.source && contentTitle) {
        return lead.source.toLowerCase().includes(contentTitle.toLowerCase());
      }
      return false;
    });

    if (matchedLeads.length === 0) {
      return {
        contentId,
        postTitle: contentTitle,
        totalLeads: 0,
        qualifiedLeads: 0,
        wonDealsCount: 0,
        totalPipelineValue: 0,
        wonRevenue: 0,
        leadsList: [],
        attributionStatus: 'ATTRIBUTION_UNAVAILABLE'
      };
    }

    let totalPipeline = 0;
    let wonRevenue = 0;
    let qualifiedCount = 0;
    let wonCount = 0;

    const leadsList = matchedLeads.map((l: Lead) => {
      const val = l.estimatedDealValue || 0;
      totalPipeline += val;

      const isQualified = ['QUALIFIED', 'PROPOSAL', 'WON'].includes(l.status);
      const isWon = l.status === 'WON';

      if (isQualified) qualifiedCount++;
      if (isWon) {
        wonCount++;
        wonRevenue += val;
      }

      return {
        leadId: l.id,
        name: l.name,
        username: l.instagramUsername,
        platform: l.platform,
        status: l.status,
        intent: l.intent,
        dealValue: val,
        capturedAt: l.createdAt || l.date
      };
    });

    return {
      contentId,
      postTitle: contentTitle,
      totalLeads: matchedLeads.length,
      qualifiedLeads: qualifiedCount,
      wonDealsCount: wonCount,
      totalPipelineValue: totalPipeline,
      wonRevenue,
      leadsList,
      attributionStatus: 'ATTRIBUTED'
    };
  }

  /**
   * Generates a global lead attribution report across all published content items.
   */
  public getGlobalAttributionSummary(publishedItems: Array<{ contentId: string; title: string; mediaId?: string }>): {
    totalAttributedLeads: number;
    totalAttributedPipeline: number;
    totalAttributedWon: number;
    contentBreakdown: ContentLeadAttribution[];
  } {
    const breakdown = publishedItems.map((item) =>
      this.getAttributionForContent(item.contentId, item.title, item.mediaId)
    );

    let totalLeads = 0;
    let totalPipeline = 0;
    let totalWon = 0;

    for (const b of breakdown) {
      totalLeads += b.totalLeads;
      totalPipeline += b.totalPipelineValue;
      totalWon += b.wonRevenue;
    }

    return {
      totalAttributedLeads: totalLeads,
      totalAttributedPipeline: totalPipeline,
      totalAttributedWon: totalWon,
      contentBreakdown: breakdown
    };
  }
}

export const leadAttributionEngine = new LeadAttributionEngine();
