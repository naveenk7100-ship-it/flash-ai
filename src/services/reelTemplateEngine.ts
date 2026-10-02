/**
 * FLASH.Ai Reel Template Engine v2 (Phase 2 & Advanced Topic-Aware Engine)
 * 
 * Provides:
 * - 10 Production Templates via ReelTemplateRegistry
 * - Topic-Aware Template Selection Engine via TopicTemplateSelector
 * - Backward compatibility with Phase 1 formats & Phase 2 pipelines
 */

import type { ReelTemplateDefinition, ReelTemplateId, TemplateSelectionInfo } from '../types/reelProduction';
import type { ReelFormatId } from './reelFormatEngine';
import { reelTemplateRegistry, TEMPLATE_REGISTRY } from './reelTemplateRegistry';
import { topicTemplateSelector, type TopicAnalysisInput } from './topicTemplateSelector';

export { TEMPLATE_REGISTRY as REEL_TEMPLATES };

export class ReelTemplateEngine {
  public getAllTemplates(): ReelTemplateDefinition[] {
    return reelTemplateRegistry.getAllTemplates();
  }

  public getTemplateById(id: ReelTemplateId | string): ReelTemplateDefinition {
    return reelTemplateRegistry.getTemplateById(id);
  }

  /**
   * Advanced Topic-Aware Template Selection (v2) with granular reasoning and confidence metrics.
   */
  public analyzeAndSelectTemplate(input: TopicAnalysisInput): TemplateSelectionInfo {
    return topicTemplateSelector.selectTemplate(input);
  }

  /**
   * Automatically maps topic, formatId, and pillarId to the optimal production template.
   */
  public selectTemplateForContent(params: {
    formatId?: ReelFormatId | string;
    pillarId?: string;
    topic?: string;
    script?: string;
    hook?: string;
    category?: string;
    targetAudience?: string;
    cta?: string;
    hasScreenRecording?: boolean;
    hasStats?: boolean;
  }): ReelTemplateDefinition {
    const analysis = topicTemplateSelector.selectTemplate({ ...params, topic: params.topic || '' });
    return reelTemplateRegistry.getTemplateById(analysis.templateId);
  }

  /**
   * Generates a full SVG layout mockup of a given template for UI preview without external renders.
   */
  public getTemplatePreviewSvg(templateId: ReelTemplateId | string, title?: string): string {
    return reelTemplateRegistry.generateTemplatePreviewSvg(templateId, title);
  }
}

export const reelTemplateEngine = new ReelTemplateEngine();
