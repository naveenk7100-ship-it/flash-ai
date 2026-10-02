import { EnvConfig } from '../config/env.ts';

export interface PublicMediaStatus {
  isPubliclyAccessible: boolean;
  publicBaseUrl: string | null;
  status: 'READY_FOR_META_LIVE' | 'NOT_READY_FOR_META_LIVE_PUBLISHING';
  explanation: string;
  recommendation?: string;
}

export class PublicMediaValidator {
  /**
   * Checks if the configured media serving URL meets official Meta Graph API container fetching requirements.
   * Meta container API requires a publicly reachable URL (HTTPS strongly recommended).
   */
  public static getStatus(): PublicMediaStatus {
    const baseUrl = EnvConfig.publicBaseUrl;

    if (!baseUrl) {
      return {
        isPubliclyAccessible: false,
        publicBaseUrl: null,
        status: 'NOT_READY_FOR_META_LIVE_PUBLISHING',
        explanation: 'PUBLIC_BASE_URL is not configured. Meta servers cannot fetch media from localhost.',
        recommendation: 'Configure PUBLIC_BASE_URL=https://your-domain.example or an HTTPS tunnel in .env to enable Meta LIVE publishing.'
      };
    }

    const lower = baseUrl.toLowerCase();
    const isLocal =
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.includes('0.0.0.0') ||
      lower.startsWith('http://192.168.') ||
      lower.startsWith('http://10.');

    if (isLocal) {
      return {
        isPubliclyAccessible: false,
        publicBaseUrl: baseUrl,
        status: 'NOT_READY_FOR_META_LIVE_PUBLISHING',
        explanation: 'PUBLIC_BASE_URL points to a local/private network address which Meta servers cannot access.',
        recommendation: 'Use a public production domain or secure HTTPS reverse proxy.'
      };
    }

    const isHttps = baseUrl.startsWith('https://');

    return {
      isPubliclyAccessible: true,
      publicBaseUrl: baseUrl,
      status: 'READY_FOR_META_LIVE',
      explanation: isHttps
        ? 'Public HTTPS media delivery is configured and ready for Meta Graph API container ingestion.'
        : 'Public HTTP media delivery is configured (HTTPS is recommended for production Meta webhooks).'
    };
  }

  /**
   * Transforms a relative media path into a fully qualified public URL.
   */
  public static resolvePublicMediaUrl(relativePath: string): string {
    const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    const baseUrl = EnvConfig.publicBaseUrl;

    if (baseUrl && this.getStatus().isPubliclyAccessible) {
      return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
    }

    // Local development fallback
    return `http://localhost:${EnvConfig.port}${cleanPath}`;
  }

  /**
   * Helper to validate a media path against custom or active env config.
   */
  public static validateForMetaPublishing(
    mediaPath: string,
    customConfig?: { nodeEnv?: string; publicBaseUrl?: string }
  ): {
    isPubliclyAccessible: boolean;
    code: 'READY_FOR_META_LIVE' | 'NOT_READY_FOR_META_LIVE_PUBLISHING';
    fullMediaUrl: string;
    explanation: string;
  } {
    const baseUrl = customConfig?.publicBaseUrl !== undefined ? customConfig.publicBaseUrl : EnvConfig.publicBaseUrl;
    const cleanPath = mediaPath.startsWith('/') ? mediaPath : `/${mediaPath}`;

    if (!baseUrl) {
      return {
        isPubliclyAccessible: false,
        code: 'NOT_READY_FOR_META_LIVE_PUBLISHING',
        fullMediaUrl: `http://localhost:${EnvConfig.port}${cleanPath}`,
        explanation: 'PUBLIC_BASE_URL not configured'
      };
    }

    const lower = baseUrl.toLowerCase();
    const isLocal =
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.includes('0.0.0.0') ||
      lower.startsWith('http://192.168.') ||
      lower.startsWith('http://10.');

    if (isLocal) {
      return {
        isPubliclyAccessible: false,
        code: 'NOT_READY_FOR_META_LIVE_PUBLISHING',
        fullMediaUrl: `${baseUrl.replace(/\/$/, '')}${cleanPath}`,
        explanation: 'Localhost/private IP cannot be fetched by Meta servers'
      };
    }

    return {
      isPubliclyAccessible: true,
      code: 'READY_FOR_META_LIVE',
      fullMediaUrl: `${baseUrl.replace(/\/$/, '')}${cleanPath}`,
      explanation: 'Public URL accessible for Meta container creation'
    };
  }
}

export const publicMediaValidator = PublicMediaValidator;
