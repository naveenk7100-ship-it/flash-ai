/**
 * FLASH.Ai OpenRouter Provider for Visuals and Multi-Modal Models
 * 
 * Supports OpenRouter API with timeout handling, exponential rate-limit retries (429),
 * format validation, and safe fallback to procedural motion design when unconfigured
 * or image generation is unavailable.
 */

import { Logger } from '../utils/logger.ts';

export interface OpenRouterVisualResult {
  success: boolean;
  imageUrl?: string;
  imageBase64?: string;
  mimeType?: string;
  modelUsed?: string;
  fallbackToProcedural: boolean;
  reason?: string;
}

export interface OpenRouterTextResult {
  success: boolean;
  text?: string;
  modelUsed?: string;
  reason?: string;
}

export class OpenRouterProvider {
  public readonly name = 'OpenRouter Multi-Modal API';
  private apiKey: string;
  private defaultModel: string;
  private visualModel: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.defaultModel = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct';
    this.visualModel = process.env.OPENROUTER_IMAGE_MODEL || 'black-forest-labs/flux-1-schnell';
  }

  public isAvailable(): boolean {
    const key = this.apiKey || process.env.OPENROUTER_API_KEY || '';
    return typeof key === 'string' && key.trim().length > 10;
  }

  public getModelName(): string {
    return this.defaultModel;
  }

  public getVisualModelName(): string {
    return this.visualModel;
  }

  /**
   * Generates visual assets (stills/textures) via OpenRouter image models with timeout and retries.
   * If unconfigured or unsupported, falls back cleanly to procedural motion design.
   */
  public async generateVisual(
    prompt: string,
    options: { timeoutMs?: number; maxRetries?: number } = {}
  ): Promise<OpenRouterVisualResult> {
    const key = this.apiKey || process.env.OPENROUTER_API_KEY || '';

    if (!this.isAvailable()) {
      Logger.info('[OpenRouter] Visual generation unconfigured: OPENROUTER_API_KEY missing. Falling back cleanly to native procedural motion design.', { component: 'Media' });
      return {
        success: false,
        fallbackToProcedural: true,
        reason: 'OPENROUTER_API_KEY is not configured in environment.'
      };
    }

    const timeoutMs = options.timeoutMs || 15000;
    const maxRetries = options.maxRetries || 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        Logger.info(`[OpenRouter] Requesting visual asset (attempt ${attempt}/${maxRetries + 1}) using ${this.visualModel}...`, { component: 'Media' });

        const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key.trim()}`,
            'HTTP-Referer': 'https://flash-ai.local',
            'X-Title': 'FLASH.Ai Reel Engine'
          },
          body: JSON.stringify({
            model: this.visualModel,
            prompt,
            n: 1,
            size: '1024x1792', // 9:16 vertical framing
            response_format: 'b64_json'
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 429) {
          const waitTimeMs = Math.pow(2, attempt) * 1000;
          Logger.warn(`[OpenRouter] Rate limit hit (429). Retrying in ${waitTimeMs}ms...`, { component: 'Media' });
          if (attempt <= maxRetries) {
            await new Promise((res) => setTimeout(res, waitTimeMs));
            continue;
          }
          return {
            success: false,
            fallbackToProcedural: true,
            reason: 'OpenRouter rate limit (429) exceeded maximum retries.'
          };
        }

        if (!response.ok) {
          const errText = await response.text();
          Logger.warn(`[OpenRouter] Image generation API returned HTTP ${response.status}: ${errText.slice(0, 200)}. Falling back to procedural graphics.`, { component: 'Media' });
          return {
            success: false,
            fallbackToProcedural: true,
            reason: `OpenRouter returned HTTP ${response.status}: ${errText.slice(0, 200)}`
          };
        }

        const data = (await response.json()) as any;
        const item = data?.data?.[0];

        if (item?.b64_json) {
          return {
            success: true,
            imageBase64: item.b64_json,
            mimeType: 'image/png',
            modelUsed: this.visualModel,
            fallbackToProcedural: false
          };
        } else if (item?.url && (item.url.startsWith('http://') || item.url.startsWith('https://'))) {
          return {
            success: true,
            imageUrl: item.url,
            mimeType: 'image/png',
            modelUsed: this.visualModel,
            fallbackToProcedural: false
          };
        }

        Logger.warn('[OpenRouter] Unexpected response format for image. Falling back cleanly.', { component: 'Media' });
        return {
          success: false,
          fallbackToProcedural: true,
          reason: 'OpenRouter response did not contain expected b64_json or url fields.'
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
        if (isTimeout && attempt <= maxRetries) {
          Logger.warn(`[OpenRouter] Request timed out after ${timeoutMs}ms. Retrying...`, { component: 'Media' });
          continue;
        }

        Logger.warn(`[OpenRouter] Visual generation notice: ${err.message || err}. Falling back cleanly to native procedural motion design.`, { component: 'Media' });
        return {
          success: false,
          fallbackToProcedural: true,
          reason: isTimeout ? `Request timed out after ${timeoutMs}ms` : (err.message || String(err))
        };
      }
    }

    return {
      success: false,
      fallbackToProcedural: true,
      reason: 'OpenRouter visual generation exhausted attempts.'
    };
  }

  /**
   * Generates text completions via OpenRouter chat models.
   */
  public async generateText(prompt: string, systemPrompt?: string): Promise<OpenRouterTextResult> {
    const key = this.apiKey || process.env.OPENROUTER_API_KEY || '';

    if (!this.isAvailable()) {
      return {
        success: false,
        reason: 'OPENROUTER_API_KEY is not configured in environment.'
      };
    }

    try {
      const messages: Array<{ role: string; content: string }> = [];
      if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key.trim()}`,
          'HTTP-Referer': 'https://flash-ai.local',
          'X-Title': 'FLASH.Ai Reel Engine'
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        return {
          success: false,
          reason: `OpenRouter returned HTTP ${response.status}: ${errText.slice(0, 200)}`
        };
      }

      const data = (await response.json()) as any;
      const text = data?.choices?.[0]?.message?.content?.trim();

      return {
        success: Boolean(text),
        text,
        modelUsed: this.defaultModel
      };
    } catch (err: any) {
      return {
        success: false,
        reason: err.message || String(err)
      };
    }
  }
}

export const openRouterProvider = new OpenRouterProvider();
