import type {
  ContentExperiment
} from '../../src/types/index.ts';

export class ExperimentSystem {
  private experiments: ContentExperiment[] = [];

  constructor() {
    this.seedDefaultExperiments();
  }

  public getAllExperiments(): ContentExperiment[] {
    return this.experiments;
  }

  public getExperiment(id: string): ContentExperiment | undefined {
    return this.experiments.find((e) => e.id === id);
  }

  public createExperiment(exp: Omit<ContentExperiment, 'id'>): ContentExperiment {
    const newExp: ContentExperiment = {
      ...exp,
      id: `exp-${Date.now()}`
    };
    this.experiments.unshift(newExp);
    return newExp;
  }

  public updateExperimentStatus(
    id: string,
    status: ContentExperiment['status'],
    observedFinding?: string
  ): ContentExperiment | undefined {
    const exp = this.experiments.find((e) => e.id === id);
    if (exp) {
      exp.status = status;
      if (observedFinding) exp.observedFinding = observedFinding;
      if (status === 'COMPLETED') exp.endDate = new Date().toISOString();
    }
    return exp;
  }

  private seedDefaultExperiments(): void {
    this.experiments = [
      {
        id: 'exp-seed-1',
        name: 'Hook Archetype: Time-Waste vs Direct Question',
        hypothesis: 'Opening with a specific quantified time-loss metric will drive higher 3s retention and save rate than a rhetorical question.',
        isolatedVariable: 'HOOK',
        status: 'COMPLETED',
        startDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        endDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        variantA: {
          id: 'var-a-1',
          label: 'Variant A (Time-Waste Metric)',
          contentTitle: '3 AI Automations Every Founder Needs in 2026',
          contentId: 'pub-seed-1',
          variableValue: '90% of business owners waste 15 hours a week on manual tasks...',
          leadsCount: 3,
          pipelineValue: 75000,
          metrics: {
            views: 3200,
            reach: 2450,
            likes: 180,
            comments: 24,
            saves: 52,
            shares: 18,
            profileVisits: 38,
            follows: 8,
            engagementRate: 11.18,
            engagementRateFormula: '(180 + 24 + 52 + 18) / 2450 * 100 = 11.18%',
            dataStatus: 'DEMO',
            lastSyncedAt: new Date().toISOString()
          }
        },
        variantB: {
          id: 'var-b-1',
          label: 'Variant B (Direct Question)',
          contentTitle: 'Are You Still Doing Your Bookings Manually in 2026?',
          contentId: 'pub-seed-1b',
          variableValue: 'Why are you still manually answering customer messages at night?',
          leadsCount: 1,
          pipelineValue: 30000,
          metrics: {
            views: 2100,
            reach: 1650,
            likes: 95,
            comments: 12,
            saves: 22,
            shares: 6,
            profileVisits: 16,
            follows: 3,
            engagementRate: 8.18,
            engagementRateFormula: '(95 + 12 + 22 + 6) / 1650 * 100 = 8.18%',
            dataStatus: 'DEMO',
            lastSyncedAt: new Date().toISOString()
          }
        },
        observedFinding: 'Variant A (Quantified Time-Loss Hook) generated 2.36x more saves and 3x more CRM inquiries than Variant B under controlled identical duration and CTA settings.',
        dataStatus: 'DEMO'
      },
      {
        id: 'exp-seed-2',
        name: 'Call To Action: DM "AUTOMATE" vs "WhatsApp Us Directly"',
        hypothesis: 'In-app DM CTA will produce higher volume of qualified conversions than asking users to leave Instagram for external WhatsApp.',
        isolatedVariable: 'CTA',
        status: 'ACTIVE',
        startDate: new Date(Date.now() - 4 * 86400000).toISOString(),
        variantA: {
          id: 'var-a-2',
          label: 'Variant A (In-App DM)',
          contentTitle: 'Live Demo: AI Inbound Lead Qualifier in Action',
          contentId: 'pub-seed-4',
          variableValue: 'Comment/DM "AUTOMATE"',
          leadsCount: 2,
          pipelineValue: 50000
        },
        variantB: {
          id: 'var-b-2',
          label: 'Variant B (External WhatsApp Link)',
          contentTitle: 'Live Demo: AI Inbound Lead Qualifier in Action',
          contentId: 'pub-seed-4b',
          variableValue: 'Click Link in Bio for WhatsApp',
          leadsCount: 1,
          pipelineValue: 25000
        },
        observedFinding: 'Initial observations indicate in-app DM has lower conversion friction than external link hopping.',
        dataStatus: 'DEMO'
      }
    ];
  }
}

export const experimentSystem = new ExperimentSystem();
