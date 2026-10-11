/**
 * FLASH.Ai Cloud Storage & Persistent State Manager
 * 
 * Provides production-grade persistence for ephemeral cloud containers (e.g. Render Free, Fly.io, Railway, Docker):
 * 1. S3-Compatible Object Storage (Cloudflare R2 [10GB free], Supabase Storage [1GB free], Backblaze B2 [10GB free], AWS S3)
 *    - Uploads rendered 9:16 MP4s to permanent remote buckets
 *    - Serves byte-range video streaming even if local disk was wiped on container restart
 *    - Generates permanent public URLs for Meta Graph API container creation
 * 2. Remote State Sync & Boot Hydration
 *    - Syncs review_records.json and automation_settings.json to cloud on every change
 *    - Auto-hydrates local storage on server boot after container restarts
 * 3. Graceful Local Fallback
 *    - Fully functional on local disk if remote cloud credentials are not supplied
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { Logger } from '../utils/logger.ts';

export interface CloudStorageConfig {
  enabled: boolean;
  bucket: string;
  endpoint?: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
}

export class CloudStorageManager {
  private config: CloudStorageConfig;
  private s3Client: S3Client | null = null;
  private isInitialized = false;

  constructor() {
    const bucket = process.env.S3_BUCKET || process.env.R2_BUCKET || process.env.STORAGE_BUCKET || '';
    const endpoint = process.env.S3_ENDPOINT || process.env.R2_ENDPOINT || process.env.STORAGE_ENDPOINT || '';
    const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || process.env.STORAGE_ACCESS_KEY_ID || '';
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || process.env.STORAGE_SECRET_ACCESS_KEY || '';
    const region = process.env.S3_REGION || process.env.R2_REGION || 'auto';
    const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL || process.env.R2_PUBLIC_BASE_URL || '';

    const enabled = Boolean(bucket && accessKeyId && secretAccessKey);

    this.config = {
      enabled,
      bucket,
      endpoint: endpoint || undefined,
      region,
      accessKeyId,
      secretAccessKey,
      publicBaseUrl: publicBaseUrl ? publicBaseUrl.replace(/\/$/, '') : undefined
    };

    if (enabled) {
      try {
        this.s3Client = new S3Client({
          region: this.config.region,
          endpoint: this.config.endpoint,
          credentials: {
            accessKeyId: this.config.accessKeyId,
            secretAccessKey: this.config.secretAccessKey
          },
          forcePathStyle: Boolean(this.config.endpoint)
        });
        Logger.info(`[CloudStorage] Initialized S3-compatible cloud storage adapter (Bucket: ${bucket})`, { component: 'Storage' });
      } catch (err: any) {
        Logger.error('[CloudStorage] Failed to initialize S3 client', { component: 'Storage' }, err);
        this.s3Client = null;
      }
    }
  }

  public isEnabled(): boolean {
    return Boolean(this.config.enabled && this.s3Client);
  }

  public getConfig(): { enabled: boolean; bucket: string; endpoint?: string; hasPublicBaseUrl: boolean } {
    return {
      enabled: this.isEnabled(),
      bucket: this.config.bucket,
      endpoint: this.config.endpoint,
      hasPublicBaseUrl: Boolean(this.config.publicBaseUrl)
    };
  }

  /**
   * Uploads a rendered MP4 video file to cloud object storage.
   */
  public async uploadVideoFile(localFilePath: string, filename: string): Promise<{ success: boolean; cloudUrl?: string; s3Key?: string; error?: string }> {
    if (!this.isEnabled() || !this.s3Client) {
      return { success: false, error: 'Cloud storage not configured' };
    }

    try {
      if (!fs.existsSync(localFilePath)) {
        return { success: false, error: `Local file not found: ${localFilePath}` };
      }

      const fileBuffer = fs.readFileSync(localFilePath);
      const s3Key = `media/renders/${filename}`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: 'video/mp4',
          CacheControl: 'public, max-age=31536000, immutable'
        })
      );

      let cloudUrl: string;
      if (this.config.publicBaseUrl) {
        cloudUrl = `${this.config.publicBaseUrl}/${s3Key}`;
      } else if (this.config.endpoint && this.config.endpoint.includes('r2.cloudflarestorage.com')) {
        cloudUrl = `${this.config.endpoint}/${this.config.bucket}/${s3Key}`;
      } else {
        cloudUrl = `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${s3Key}`;
      }

      Logger.info(`[CloudStorage] Uploaded MP4 to cloud storage: ${s3Key} (${fileBuffer.length} bytes)`, { component: 'Storage' });
      return { success: true, cloudUrl, s3Key };
    } catch (err: any) {
      Logger.error(`[CloudStorage] Failed to upload video ${filename}`, { component: 'Storage' }, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Streams a missing file from S3 to an HTTP response stream with optional byte ranges.
   */
  public async streamFromCloud(
    filename: string,
    rangeHeader?: string
  ): Promise<{ stream: any; contentLength: number; contentRange?: string; statusCode: number; contentType: string } | null> {
    if (!this.isEnabled() || !this.s3Client) {
      return null;
    }

    const clean = filename.replace(/^\/?(media\/)?/, '');
    const s3Key = clean.startsWith('renders/') ? `media/${clean}` : `media/renders/${clean}`;

    try {
      // 1. Get object metadata
      const head = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.config.bucket,
          Key: s3Key
        })
      );

      const totalSize = head.ContentLength || 0;
      const contentType = head.ContentType || 'video/mp4';

      // 2. Fetch with range if requested
      const getParams: any = {
        Bucket: this.config.bucket,
        Key: s3Key
      };

      if (rangeHeader && rangeHeader.startsWith('bytes=')) {
        getParams.Range = rangeHeader;
      }

      const response = await this.s3Client.send(new GetObjectCommand(getParams));

      const statusCode = rangeHeader ? 206 : 200;
      const contentLength = response.ContentLength || totalSize;
      const contentRange = response.ContentRange || undefined;

      return {
        stream: response.Body,
        contentLength,
        contentRange,
        statusCode,
        contentType
      };
    } catch (err: any) {
      Logger.warn(`[CloudStorage] Could not fetch ${s3Key} from cloud: ${err.message}`, { component: 'Storage' });
      return null;
    }
  }

  /**
   * Syncs local review_records.json and automation_settings.json to cloud storage backup.
   */
  public async syncStateToCloud(): Promise<void> {
    if (!this.isEnabled() || !this.s3Client) return;

    try {
      const recordsPath = path.resolve(process.cwd(), 'data', 'storage', 'review_records.json');
      if (fs.existsSync(recordsPath)) {
        const data = fs.readFileSync(recordsPath, 'utf-8');
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.config.bucket,
            Key: 'state/review_records.json',
            Body: data,
            ContentType: 'application/json'
          })
        );
        Logger.info('[CloudStorage] Synced review_records.json to cloud backup', { component: 'Storage' });
      }

      const settingsPath = path.resolve(process.cwd(), 'data', 'storage', 'automation_settings.json');
      if (fs.existsSync(settingsPath)) {
        const data = fs.readFileSync(settingsPath, 'utf-8');
        await this.s3Client.send(
          new PutObjectCommand({
            Bucket: this.config.bucket,
            Key: 'state/automation_settings.json',
            Body: data,
            ContentType: 'application/json'
          })
        );
      }
    } catch (err: any) {
      Logger.warn(`[CloudStorage] Background state sync error: ${err.message}`, { component: 'Storage' });
    }
  }

  /**
   * Hydrates local state from cloud storage on server boot.
   * Restores review records across ephemeral container restarts.
   */
  public async hydrateStateFromCloud(): Promise<void> {
    if (!this.isEnabled() || !this.s3Client || this.isInitialized) return;
    this.isInitialized = true;

    try {
      const recordsPath = path.resolve(process.cwd(), 'data', 'storage', 'review_records.json');
      const dir = path.dirname(recordsPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: 'state/review_records.json'
        })
      );

      if (response.Body) {
        const streamToString = await response.Body.transformToString();
        const remoteRecords = JSON.parse(streamToString);

        if (Array.isArray(remoteRecords) && remoteRecords.length > 0) {
          let localRecords: any[] = [];
          if (fs.existsSync(recordsPath)) {
            try {
              localRecords = JSON.parse(fs.readFileSync(recordsPath, 'utf-8'));
            } catch {
              localRecords = [];
            }
          }

          // If local is empty or remote has more records, restore from remote
          if (!fs.existsSync(recordsPath) || localRecords.length < remoteRecords.length) {
            fs.writeFileSync(recordsPath, JSON.stringify(remoteRecords, null, 2), 'utf-8');
            Logger.info(`[CloudStorage] Successfully restored ${remoteRecords.length} review records from cloud storage on boot!`, { component: 'Storage' });
          }
        }
      }
    } catch (err: any) {
      // Missing remote state on fresh deploy is normal
      if (err.name !== 'NoSuchKey') {
        Logger.warn(`[CloudStorage] State hydration notice: ${err.message}`, { component: 'Storage' });
      }
    }
  }
}

export const cloudStorageManager = new CloudStorageManager();
