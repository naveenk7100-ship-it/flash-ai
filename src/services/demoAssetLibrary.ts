/**
 * FLASH.Ai Demo Asset Library (Phase 2 - Requirements 2, 3, 6, 13)
 * 
 * Provides production-ready creator assets for zero-credential Demo Mode:
 * - Screen recordings (procedural terminal & web app screen capture)
 * - Website / demo footage
 * - UI screenshots (workflow nodes, database sync, CRM triggers)
 * - Branded vector mockups & placeholders
 * - Royalty-free music and procedural SFX
 */

import type { RawMediaAsset, SceneMediaType } from '../types/reelProduction';

// SVG Data URIs for realistic, high-contrast creator UI mockups
export const DEMO_MEDIA_ASSETS: RawMediaAsset[] = [
  {
    id: 'asset-demo-web-recording',
    name: 'FLASH.Ai Portal Screen Recording',
    type: 'screen_recording',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="%23060814"/><rect x="60" y="240" width="960" height="1440" rx="36" fill="%230d1224" stroke="%2300f5ff" stroke-width="4"/><circle cx="120" cy="300" r="14" fill="%23ef4444"/><circle cx="160" cy="300" r="14" fill="%23f59e0b"/><circle cx="200" cy="300" r="14" fill="%2310b981"/><text x="240" y="308" fill="%2394a3b8" font-family="monospace" font-size="28">https://flash.ai/automations/live</text><rect x="100" y="380" width="880" height="180" rx="20" fill="%23131b36"/><text x="140" y="450" fill="%23ffffff" font-family="sans-serif" font-weight="900" font-size="44">Autonomous Lead Router</text><text x="140" y="510" fill="%2300f5ff" font-family="monospace" font-size="30">ACTIVE • 99.9% Uptime • 12ms latency</text><rect x="100" y="600" width="420" height="280" rx="20" fill="%23162042"/><text x="140" y="670" fill="%2394a3b8" font-family="sans-serif" font-size="28">Inbound Leads</text><text x="140" y="760" fill="%23ffffff" font-family="sans-serif" font-weight="900" font-size="64">1,482</text><rect x="560" y="600" width="420" height="280" rx="20" fill="%23162042"/><text x="600" y="670" fill="%2394a3b8" font-family="sans-serif" font-size="28">Automated DMs</text><text x="600" y="760" fill="%2310b981" font-family="sans-serif" font-weight="900" font-size="64">98.4%</text><path d="M 120 1200 Q 300 950 540 1100 T 960 920" fill="none" stroke="%2300f5ff" stroke-width="8"/><circle cx="960" cy="920" r="16" fill="%2300f5ff"/></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="213"><rect width="120" height="213" fill="%23060814"/><rect x="10" y="20" width="100" height="170" rx="6" fill="%230d1224" stroke="%2300f5ff"/><text x="20" y="50" fill="%2300f5ff" font-size="12">WEB DEMO</text></svg>',
    dimensions: { width: 1080, height: 1920 },
    durationSeconds: 24,
    tags: ['screen_recording', 'demo', 'web_app', 'dashboard'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'asset-demo-workflow-canvas',
    name: 'AI Agent Node Workflow Demo',
    type: 'website_demo',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="%23080b18"/><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="%231e293b" stroke-width="1.5"/></pattern><rect width="1080" height="1920" fill="url(%23grid)"/><g transform="translate(140, 420)"><rect width="360" height="160" rx="24" fill="%231e1b4b" stroke="%23818cf8" stroke-width="4"/><text x="40" y="70" fill="%23a5b4fc" font-size="28" font-family="sans-serif">TRIGGER</text><text x="40" y="120" fill="%23ffffff" font-size="36" font-weight="900" font-family="sans-serif">Instagram DM</text></g><path d="M 500 500 L 640 500 L 640 760 L 500 760" fill="none" stroke="%2300f5ff" stroke-width="6" stroke-dasharray="12 8"/><g transform="translate(140, 680)"><rect width="360" height="160" rx="24" fill="%23064e3b" stroke="%2334d399" stroke-width="4"/><text x="40" y="70" fill="%236ee7b7" font-size="28" font-family="sans-serif">ACTION 1</text><text x="40" y="120" fill="%23ffffff" font-size="36" font-weight="900" font-family="sans-serif">LLM Intent Filter</text></g><path d="M 320 840 L 320 980" fill="none" stroke="%2300f5ff" stroke-width="6"/><g transform="translate(140, 980)"><rect width="360" height="160" rx="24" fill="%23164e63" stroke="%2322d3ee" stroke-width="4"/><text x="40" y="70" fill="%2367e8f9" font-size="28" font-family="sans-serif">ACTION 2</text><text x="40" y="120" fill="%23ffffff" font-size="36" font-weight="900" font-family="sans-serif">Instant CRM Push</text></g><circle cx="320" cy="1240" r="60" fill="%2300f5ff" opacity="0.3"/><circle cx="320" cy="1240" r="30" fill="%2300f5ff"/></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="213"><rect width="120" height="213" fill="%23080b18"/><rect x="15" y="30" width="90" height="40" rx="4" fill="%231e1b4b"/><text x="25" y="55" fill="%23818cf8" font-size="10">NODES</text></svg>',
    dimensions: { width: 1080, height: 1920 },
    durationSeconds: 30,
    tags: ['website_demo', 'workflow', 'nodes', 'automation'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'asset-demo-screenshot-metrics',
    name: 'Growth & Hours Saved Analytics Screenshot',
    type: 'screenshot',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="%23030712"/><circle cx="540" cy="960" r="400" fill="%2300f5ff" opacity="0.1" filter="blur(80px)"/><rect x="80" y="360" width="920" height="1200" rx="36" fill="%23111827" stroke="%23374151" stroke-width="3"/><text x="140" y="480" fill="%23ffffff" font-size="52" font-weight="900" font-family="sans-serif">ROI Payoff Report</text><text x="140" y="540" fill="%2310b981" font-size="32" font-family="sans-serif">Verified 4.8x Efficiency Multiplier</text><rect x="140" y="620" width="800" height="140" rx="20" fill="%231f2937"/><text x="180" y="705" fill="%23f9fafb" font-size="38" font-weight="700">Time Saved per Week: 38 hrs</text><rect x="140" y="800" width="800" height="140" rx="20" fill="%231f2937"/><text x="180" y="885" fill="%23f9fafb" font-size="38" font-weight="700">Lead Response: &lt; 30 Seconds</text><rect x="140" y="980" width="800" height="140" rx="20" fill="%231f2937"/><text x="180" y="1065" fill="%23f9fafb" font-size="38" font-weight="700">Manual Errors Reduced: 100%</text></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="213"><rect width="120" height="213" fill="%23030712"/><text x="20" y="60" fill="%2310b981" font-size="12">ROI CHART</text></svg>',
    dimensions: { width: 1080, height: 1920 },
    tags: ['screenshot', 'metrics', 'results', 'payoff'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'asset-demo-screenshot-terminal',
    name: 'AI Agent Terminal Execution Log',
    type: 'screen_recording',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><rect width="1080" height="1920" fill="%23000000"/><rect x="80" y="320" width="920" height="1280" rx="28" fill="%2309090b" stroke="%2327272a" stroke-width="4"/><text x="140" y="420" fill="%2322c55e" font-family="monospace" font-size="32">$ agy run workflow.ai --deploy</text><text x="140" y="490" fill="%2371717a" font-family="monospace" font-size="28">[20:44:02] Initializing agent memory...</text><text x="140" y="550" fill="%2338bdf8" font-family="monospace" font-size="28">[20:44:03] Scraping Instagram DM webhook triggers...</text><text x="140" y="610" fill="%23a855f7" font-family="monospace" font-size="28">[20:44:04] AI model thinking (Gemini 2.0 Flash)...</text><text x="140" y="670" fill="%2322c55e" font-family="monospace" font-size="30">✓ Lead qualified: Deal Value $4,500</text><text x="140" y="730" fill="%2322c55e" font-family="monospace" font-size="30">✓ Auto-reply dispatched via Meta Graph API</text><rect x="140" y="800" width="40" height="60" fill="%2300f5ff"/></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="213"><rect width="120" height="213" fill="%23000000"/><text x="15" y="60" fill="%2322c55e" font-size="10">TERMINAL</text></svg>',
    dimensions: { width: 1080, height: 1920 },
    durationSeconds: 15,
    tags: ['screen_recording', 'terminal', 'code', 'deploy'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'asset-demo-backdrop-cyber',
    name: 'FLASH.Ai Cyber Neon Backdrop',
    type: 'visual_placeholder',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23050814"/><stop offset="50%" stop-color="%230b112c"/><stop offset="100%" stop-color="%2304060e"/></linearGradient></defs><rect width="1080" height="1920" fill="url(%23bg)"/><circle cx="540" cy="600" r="350" fill="%2300f5ff" opacity="0.15" filter="blur(120px)"/><circle cx="540" cy="1400" r="400" fill="%23a855f7" opacity="0.12" filter="blur(140px)"/><text x="540" y="980" fill="%23ffffff" font-family="sans-serif" font-weight="900" font-size="96" text-anchor="middle" letter-spacing="4">FLASH.Ai</text><text x="540" y="1060" fill="%2300f5ff" font-family="monospace" font-size="36" text-anchor="middle" letter-spacing="6">@flash_ai_digital</text></svg>',
    thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="213"><rect width="120" height="213" fill="%230b112c"/><text x="20" y="110" fill="%2300f5ff" font-size="14">FLASH.Ai</text></svg>',
    dimensions: { width: 1080, height: 1920 },
    tags: ['visual_placeholder', 'brand', 'backdrop', 'neon'],
    createdAt: new Date().toISOString()
  }
];

export class DemoAssetLibrary {
  private assets: RawMediaAsset[] = [...DEMO_MEDIA_ASSETS];

  public getAllAssets(): RawMediaAsset[] {
    return this.assets;
  }

  public getAssetById(id: string): RawMediaAsset | undefined {
    return this.assets.find((a) => a.id === id);
  }

  public getAssetsByType(type: SceneMediaType): RawMediaAsset[] {
    return this.assets.filter((a) => a.type === type);
  }

  public addAsset(asset: Omit<RawMediaAsset, 'id' | 'createdAt'>): RawMediaAsset {
    const newAsset: RawMediaAsset = {
      ...asset,
      id: `asset-user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      createdAt: new Date().toISOString()
    };
    this.assets.unshift(newAsset);
    return newAsset;
  }

  public deleteAsset(id: string): boolean {
    const initialLen = this.assets.length;
    this.assets = this.assets.filter((a) => a.id !== id);
    return this.assets.length < initialLen;
  }

  /**
   * Finds the best asset matching the scene media type and keyword.
   */
  public findBestMatchingAsset(type: SceneMediaType, keyword?: string): RawMediaAsset {
    const matchingType = this.assets.filter((a) => a.type === type);
    if (keyword && matchingType.length > 0) {
      const lower = keyword.toLowerCase();
      const match = matchingType.find((a) => a.name.toLowerCase().includes(lower) || a.tags.some((t) => t.includes(lower)));
      if (match) return match;
    }
    if (matchingType.length > 0) return matchingType[0];
    return this.assets[0];
  }
}

export const demoAssetLibrary = new DemoAssetLibrary();
