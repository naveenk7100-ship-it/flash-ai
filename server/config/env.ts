import dotenv from 'dotenv';
dotenv.config();

export interface SafeEnvReport {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  publicBaseUrl: string | null;
  geminiApiKey: 'CONFIGURED' | 'MISSING';
  metaAppId: 'CONFIGURED' | 'MISSING';
  metaAppSecret: 'CONFIGURED' | 'MISSING';
  metaAccessToken: 'CONFIGURED' | 'MISSING';
  metaInstagramAccountId: 'CONFIGURED' | 'MISSING';
  metaVerifyToken: 'CONFIGURED' | 'MISSING';
  metaApiVersion: string;
  metaPublishingMode: 'DEMO' | 'LIVE';
  creatomateApiKey: 'CONFIGURED' | 'MISSING';
  creatomateTemplateId: 'CONFIGURED' | 'MISSING';
  elevenLabsApiKey: 'CONFIGURED' | 'MISSING';
  elevenLabsVoiceId: 'CONFIGURED' | 'MISSING';
  elevenLabsModelId: 'CONFIGURED' | 'MISSING';
  elevenLabsEnabled: boolean;
  storageRoot: string;
  isReadyForMetaLive: boolean;
  isReadyForAiGeneration: boolean;
  isReadyForCreatomate: boolean;
  isReadyForElevenLabs: boolean;
}

export class EnvConfig {
  public static get nodeEnv(): 'development' | 'production' | 'test' {
    const env = process.env.NODE_ENV?.toLowerCase();
    if (env === 'production' || env === 'test') return env;
    return 'development';
  }

  public static get port(): number {
    const p = parseInt(process.env.PORT || '3000', 10);
    return isNaN(p) || p <= 0 ? 3000 : p;
  }

  public static get publicBaseUrl(): string {
    return process.env.PUBLIC_BASE_URL?.trim() || '';
  }

  public static get geminiApiKey(): string {
    return process.env.GEMINI_API_KEY?.trim() || '';
  }

  public static get metaAppId(): string {
    return process.env.META_APP_ID?.trim() || '';
  }

  public static get metaAppSecret(): string {
    return process.env.META_APP_SECRET?.trim() || '';
  }

  public static get metaAccessToken(): string {
    return process.env.META_ACCESS_TOKEN?.trim() || process.env.META_USER_ACCESS_TOKEN?.trim() || '';
  }

  public static get metaInstagramAccountId(): string {
    return (
      process.env.META_INSTAGRAM_ACCOUNT_ID?.trim() ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim() ||
      ''
    );
  }

  public static get metaVerifyToken(): string {
    return (
      process.env.META_WEBHOOK_VERIFY_TOKEN?.trim() ||
      process.env.META_VERIFY_TOKEN?.trim() ||
      'flash_ai_webhook_verify_token_2026'
    );
  }

  public static get metaApiVersion(): string {
    return process.env.META_API_VERSION?.trim() || 'v21.0';
  }

  public static get metaPublishingMode(): 'DEMO' | 'LIVE' {
    return process.env.META_PUBLISHING_MODE?.toUpperCase() === 'LIVE' ? 'LIVE' : 'DEMO';
  }

  public static get creatomateApiKey(): string {
    return process.env.CREATOMATE_API_KEY?.trim() || '';
  }

  public static get creatomateTemplateId(): string {
    return process.env.CREATOMATE_TEMPLATE_ID?.trim() || '';
  }

  public static get elevenLabsApiKey(): string {
    return process.env.ELEVENLABS_API_KEY?.trim() || '';
  }

  public static get elevenLabsEnabled(): boolean {
    return process.env.ELEVENLABS_ENABLED !== 'false';
  }

  public static get elevenLabsVoiceId(): string {
    return process.env.ELEVENLABS_VOICE_ID?.trim() || 'ibbx9zDYGvLgtYzRbqqG';
  }

  public static get elevenLabsModelId(): string {
    return process.env.ELEVENLABS_MODEL_ID?.trim() || 'eleven_multilingual_v2';
  }

  public static get storageRoot(): string {
    return process.env.STORAGE_ROOT?.trim() || './server/data';
  }

  /**
   * Generates a sanitized audit report of configured variables without revealing secrets.
   */
  public static getSafeReport(): SafeEnvReport {
    const hasAi = Boolean(this.geminiApiKey && this.geminiApiKey.length > 10);
    const hasMetaToken = Boolean(this.metaAccessToken && this.metaAccessToken.length > 15);
    const hasMetaAccount = Boolean(this.metaInstagramAccountId && this.metaInstagramAccountId.length > 5);
    const hasPublicUrl = Boolean(
      this.publicBaseUrl &&
      (this.publicBaseUrl.startsWith('https://') || this.publicBaseUrl.startsWith('http://'))
    );
    const hasCreatomateKey = Boolean(this.creatomateApiKey && this.creatomateApiKey.length > 20);
    const hasCreatomateTpl = Boolean(this.creatomateTemplateId && this.creatomateTemplateId.length > 10);
    const hasElevenLabsKey = Boolean(this.elevenLabsApiKey && this.elevenLabsApiKey.length > 20);
    const hasElevenLabsVoice = Boolean(this.elevenLabsVoiceId && this.elevenLabsVoiceId.length > 5);
    const hasElevenLabsModel = Boolean(this.elevenLabsModelId && this.elevenLabsModelId.length > 3);

    const isReadyForMetaLive = hasMetaToken && hasMetaAccount && hasPublicUrl && this.metaPublishingMode === 'LIVE';

    return {
      nodeEnv: this.nodeEnv,
      port: this.port,
      publicBaseUrl: this.publicBaseUrl || null,
      geminiApiKey: hasAi ? 'CONFIGURED' : 'MISSING',
      metaAppId: this.metaAppId ? 'CONFIGURED' : 'MISSING',
      metaAppSecret: this.metaAppSecret ? 'CONFIGURED' : 'MISSING',
      metaAccessToken: hasMetaToken ? 'CONFIGURED' : 'MISSING',
      metaInstagramAccountId: hasMetaAccount ? 'CONFIGURED' : 'MISSING',
      metaVerifyToken: this.metaVerifyToken ? 'CONFIGURED' : 'MISSING',
      metaApiVersion: this.metaApiVersion,
      metaPublishingMode: this.metaPublishingMode,
      creatomateApiKey: hasCreatomateKey ? 'CONFIGURED' : 'MISSING',
      creatomateTemplateId: hasCreatomateTpl ? 'CONFIGURED' : 'MISSING',
      elevenLabsApiKey: hasElevenLabsKey ? 'CONFIGURED' : 'MISSING',
      elevenLabsVoiceId: hasElevenLabsVoice ? 'CONFIGURED' : 'MISSING',
      elevenLabsModelId: hasElevenLabsModel ? 'CONFIGURED' : 'MISSING',
      elevenLabsEnabled: this.elevenLabsEnabled,
      storageRoot: this.storageRoot,
      isReadyForMetaLive,
      isReadyForAiGeneration: hasAi,
      isReadyForCreatomate: hasCreatomateKey,
      isReadyForElevenLabs: hasElevenLabsKey && this.elevenLabsEnabled
    };
  }

  public static getAuditReport(): SafeEnvReport {
    return this.getSafeReport();
  }

  /**
   * Logs safe startup environment diagnostics.
   */
  public static printStartupReport(): void {
    const r = this.getSafeReport();
    console.log('====================================================');
    console.log(`  FLASH.Ai Production Server Environment`);
    console.log(`  Mode: [${r.nodeEnv.toUpperCase()}] • Port: ${r.port}`);
    console.log('====================================================');
    console.log(`  • AI Provider (Gemini):     ${r.geminiApiKey}`);
    console.log(`  • Meta Access Token:        ${r.metaAccessToken}`);
    console.log(`  • Meta Account ID:          ${r.metaInstagramAccountId}`);
    console.log(`  • Meta Webhook Secret:      ${r.metaVerifyToken}`);
    console.log(`  • Meta Publishing Mode:     ${r.metaPublishingMode}`);
    console.log(`  • Creatomate Render API:    ${r.creatomateApiKey}`);
    console.log(`  • Creatomate Template ID:   ${r.creatomateTemplateId}`);
    console.log(`  • Public Base URL:          ${r.publicBaseUrl || 'NOT CONFIGURED (Local/DEMO Only)'}`);
    console.log(`  • Storage Persistence Root: ${r.storageRoot}`);
    console.log(`  • Meta Live Ready:          ${r.isReadyForMetaLive ? 'YES (Live API Active)' : 'NO (Safe DEMO Mode)'}`);
    console.log(`  • Creatomate Ready:         ${r.isReadyForCreatomate ? 'YES' : 'NO'}`);
    console.log('====================================================\n');
  }
}

export const envConfig = EnvConfig;
