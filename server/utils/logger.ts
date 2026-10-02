import { EnvConfig } from '../config/env.ts';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface LogContext {
  component?: string;
  event?: string;
  jobId?: string;
  runId?: string;
  requestId?: string;
  [key: string]: any;
}

export class Logger {
  public static sanitize(text: string): string {
    if (!text) return text;
    let sanitized = text;

    const secrets = [
      EnvConfig.geminiApiKey,
      EnvConfig.metaAccessToken,
      EnvConfig.metaAppSecret,
      process.env.GOOGLE_TTS_API_KEY,
      process.env.ELEVENLABS_API_KEY
    ].filter((s): s is string => Boolean(s && s.length > 6));

    for (const secret of secrets) {
      sanitized = sanitized.replaceAll(secret, '[REDACTED_SECRET]');
    }

    // Pattern-based redactions (Meta tokens, Google API keys, Bearer tokens, general secrets)
    sanitized = sanitized.replace(/EAAB[a-zA-Z0-9_-]{10,}/g, '[REDACTED_META_TOKEN]');
    sanitized = sanitized.replace(/AIza[0-9A-Za-z-_]{30,}/g, '[REDACTED_GEMINI_KEY]');
    sanitized = sanitized.replace(/Bearer\s+[A-Za-z0-9_\-\.]{15,}/gi, 'Bearer [REDACTED_TOKEN]');

    return sanitized;
  }

  public static format(level: LogLevel, message: string, ctx?: LogContext): string {
    const timestamp = new Date().toISOString();
    const component = ctx?.component || 'System';
    const event = ctx?.event ? ` [${ctx.event}]` : '';
    const reqId = ctx?.requestId ? ` (req:${ctx.requestId})` : '';

    const cleanMsg = this.sanitize(message);
    return `[${timestamp}] [${level}] [${component}]${event}${reqId} ${cleanMsg}`;
  }

  public static info(message: string, ctx?: LogContext): void {
    console.log(this.format('INFO', message, ctx));
  }

  public static warn(message: string, ctx?: LogContext): void {
    console.warn(this.format('WARN', message, ctx));
  }

  public static error(message: string, ctx?: LogContext, errorObj?: any): void {
    const errText = errorObj instanceof Error ? `: ${errorObj.message}` : '';
    console.error(this.format('ERROR', `${message}${errText}`, ctx));
    if (errorObj?.stack && EnvConfig.nodeEnv !== 'production') {
      console.error(this.sanitize(errorObj.stack));
    }
  }

  public static debug(message: string, ctx?: LogContext): void {
    if (EnvConfig.nodeEnv !== 'production') {
      console.debug(this.format('DEBUG', message, ctx));
    }
  }
}

export const logger = Logger;
export const sanitizeSecrets = (text: string): string => Logger.sanitize(text);
