import crypto from 'node:crypto';

export class WebhookSecurity {
  public static getVerifyToken(): string {
    return process.env.META_WEBHOOK_VERIFY_TOKEN?.trim() || 'flash_ai_webhook_verify_token_secure';
  }

  public static getAppSecret(): string {
    return process.env.META_APP_SECRET?.trim() || '';
  }

  /**
   * Validates the GET verification request sent by Meta during Webhook Subscription setup.
   * Expected query parameters:
   * hub.mode = 'subscribe'
   * hub.verify_token = META_WEBHOOK_VERIFY_TOKEN
   * hub.challenge = <random integer string>
   */
  public static verifyWebhookSubscription(params: {
    mode?: string;
    token?: string;
    challenge?: string;
  }): { isValid: boolean; challenge?: string; error?: string } {
    const { mode, token, challenge } = params;

    if (!mode || !token || !challenge) {
      return {
        isValid: false,
        error: 'Missing required webhook verification query parameters (hub.mode, hub.verify_token, hub.challenge).'
      };
    }

    if (mode !== 'subscribe') {
      return {
        isValid: false,
        error: `Invalid hub.mode "${mode}". Expected "subscribe".`
      };
    }

    const expectedToken = this.getVerifyToken();
    if (token !== expectedToken) {
      return {
        isValid: false,
        error: 'Verification token mismatch. Please verify META_WEBHOOK_VERIFY_TOKEN in server configuration.'
      };
    }

    return {
      isValid: true,
      challenge
    };
  }

  /**
   * Verifies HMAC-SHA256 signature sent by Meta in X-Hub-Signature-256 header.
   */
  public static verifySignature(rawPayload: string, signatureHeader?: string): boolean {
    const appSecret = this.getAppSecret();
    if (!appSecret) {
      // In development / demo mode where app secret is not configured, pass validation
      return true;
    }

    if (!signatureHeader) {
      return false;
    }

    const parts = signatureHeader.split('=');
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      return false;
    }

    const expectedHash = parts[1];
    const computedHash = crypto
      .createHmac('sha256', appSecret)
      .update(rawPayload, 'utf-8')
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedHash, 'hex'),
      Buffer.from(computedHash, 'hex')
    );
  }
}
