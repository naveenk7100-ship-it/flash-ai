import type {
  IAIProvider,
  GenerateContentInput,
  GeneratedContentPackage,
  DailyBatchParams
} from './types.ts';
import { GeminiProvider } from './geminiProvider.ts';
import { DemoMockProvider } from './demoMockProvider.ts';
import { openRouterProvider } from './openRouterProvider.ts';

export class AIProviderManager {
  private providers: Map<string, IAIProvider> = new Map();
  private activeProviderName = 'gemini';

  constructor() {
    // Register Gemini and Demo Mock providers
    const gemini = new GeminiProvider();
    const demo = new DemoMockProvider();
    this.providers.set('gemini', gemini);
    this.providers.set('demo', demo);

    // If Gemini key is not configured, automatically default to Demo provider
    if (!gemini.isAvailable()) {
      this.activeProviderName = 'demo';
    }
  }

  public registerProvider(name: string, provider: IAIProvider): void {
    this.providers.set(name.toLowerCase(), provider);
  }

  public getActiveProvider(): IAIProvider {
    const provider = this.providers.get(this.activeProviderName);
    if (!provider || !provider.isAvailable()) {
      return this.providers.get('demo') || new DemoMockProvider();
    }
    return provider;
  }

  public setActiveProvider(name: string): void {
    if (this.providers.has(name.toLowerCase())) {
      this.activeProviderName = name.toLowerCase();
    }
  }

  public getStatus(): {
    isConnected: boolean;
    provider: string;
    model: string;
    availableProviders: string[];
    isDemo: boolean;
    isOpenRouterConfigured: boolean;
  } {
    const active = this.getActiveProvider();
    const isGeminiAvailable = Boolean(this.providers.get('gemini')?.isAvailable());
    const isOpenRouterConfigured = openRouterProvider.isAvailable();

    return {
      isConnected: true, // Always ready to generate
      provider: active.name,
      model: isGeminiAvailable ? 'gemini-2.5-flash' : 'flash-ai-production-engine-v1',
      availableProviders: [...Array.from(this.providers.keys()), ...(isOpenRouterConfigured ? ['openrouter'] : [])],
      isDemo: !isGeminiAvailable || this.activeProviderName === 'demo',
      isOpenRouterConfigured
    };
  }

  public async generate(input: GenerateContentInput): Promise<GeneratedContentPackage> {
    const provider = this.getActiveProvider();
    return await provider.generate(input);
  }

  public async generateBatchDaily(params: DailyBatchParams): Promise<GeneratedContentPackage[]> {
    const provider = this.getActiveProvider();
    return await provider.generateBatchDaily(params);
  }
}

export const aiProviderManager = new AIProviderManager();
