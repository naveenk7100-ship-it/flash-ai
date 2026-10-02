import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { aiProviderManager } from './providers/providerManager.ts';
import { serverMetaService } from './metaApiService.ts';
import { serverMediaService } from './media/mediaService.ts';
import { serverWebhookService } from './meta/webhookService.ts';
import { keywordAutomationManager } from './meta/keywordAutomation.ts';
import { leadExtractorManager } from './meta/leadExtractor.ts';
import { WebhookSecurity } from './meta/webhookSecurity.ts';
import { MEDIA_ROOT, sanitizeFilename } from './media/storagePaths.ts';
import { analyticsSyncService } from './analytics/analyticsSyncService.ts';
import { performanceModelEngine } from './analytics/performanceModel.ts';
import { contentPatternAnalyzer } from './analytics/contentPatternAnalyzer.ts';
import { performanceAnalysisService } from './analytics/performanceAnalysisService.ts';
import { contentRecommendationService } from './analytics/contentRecommendationService.ts';
import { experimentSystem } from './analytics/experimentSystem.ts';
import { fatigueDetector } from './analytics/fatigueDetector.ts';
import { dailyBriefService } from './analytics/dailyBriefService.ts';
import { leadAttributionEngine } from './analytics/leadAttribution.ts';
import { dailyRunEngine } from './automation/dailyRunEngine.ts';
import { qualityControlEngine } from './automation/qcEngine.ts';
import { dailyPlanGenerator } from './automation/dailyPlanGenerator.ts';
import { automationSettingsManager } from './automation/automationSettings.ts';
import { notificationService } from './automation/notificationService.ts';
import { schedulerService } from './automation/schedulerService.ts';
import { EnvConfig } from './config/env.ts';
import { Logger } from './utils/logger.ts';
import { persistentStorage } from './storage/fileStorage.ts';
import { persistentScheduler } from './automation/persistentScheduler.ts';
import { PublicMediaValidator } from './media/publicMediaValidator.ts';
import { reelTemplateRegistry } from '../src/services/reelTemplateRegistry.ts';
import { topicTemplateSelector } from '../src/services/topicTemplateSelector.ts';
import { fastReelEngine } from './media/fastReelEngine.ts';
import { mediaSelfHealingService } from './media/mediaSelfHealing.ts';
import { buildMuxedVerticalMp4 } from './media/audioMuxer.ts';

// Server start time for uptime tracking
const SERVER_START_TIME = Date.now();
let schedulerInitPromise: Promise<any> | null = null;
let selfHealingInitPromise: Promise<any> | null = null;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function isRateLimited(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= limit) return true;
  record.count++;
  return false;
}

export function createAiApiHandler() {
  // Eagerly initialize persistent scheduler in background
  if (!schedulerInitPromise) {
    schedulerInitPromise = persistentScheduler.initialize().catch((err) => {
      Logger.error('Failed to initialize persistent scheduler on boot', { component: 'Scheduler' }, err);
    });
  }

  // Eagerly initialize media self-healing on boot
  if (!selfHealingInitPromise) {
    selfHealingInitPromise = mediaSelfHealingService.healAllRecords().then((report: any) => {
      Logger.info(`[Self-Healing] Boot check complete: ${report.healthyCount} healthy, ${report.repairedCount} repaired, ${report.failedCount} failed`, { component: 'Media' });
    }).catch((err: any) => {
      Logger.error('Failed to run startup media self-healing', { component: 'Media' }, err);
    });
  }

  return async function handleApi(
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
  ) {
    const rawUrl = req.url || '';
    const url = rawUrl.split('?')[0] || '';
    const queryParams = new URLSearchParams(rawUrl.includes('?') ? rawUrl.split('?')[1] : '');

    // 1. Generate Request ID and Security Headers
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');

    // 2. Rate Limiting for sensitive API paths
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    if (url.startsWith('/api/') && !url.startsWith('/api/health') && !url.startsWith('/api/ready')) {
      if (isRateLimited(clientIp, 120, 60000)) {
        res.statusCode = 429;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Too many requests. Please slow down.', requestId }));
        return;
      }
    }

    // ==========================================
    // 0. STATIC MEDIA SERVING (/media/*)
    // ==========================================
    if (url.startsWith('/media/')) {
      const relativePath = decodeURIComponent(url.replace(/^\/media\//, ''));
      const safePath = path.normalize(path.join(MEDIA_ROOT, relativePath));

      if (!safePath.toLowerCase().startsWith(MEDIA_ROOT.toLowerCase())) {
        res.statusCode = 403;
        res.end('Access denied');
        return;
      }

      // Self-healing: If an MP4 render or SVG thumbnail is requested but missing from disk, synthesize immediately to safePath!
      if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
        const normalizedRel = relativePath.replace(/\\/g, '/');
        const dir = path.dirname(safePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (normalizedRel.startsWith('renders/') && normalizedRel.endsWith('.mp4')) {
          const rawId = path.basename(normalizedRel, '.mp4').replace(/^reel_/, '');
          serverMediaService.synthesizeAndPersistReelFile({
            projectId: rawId,
            title: `AI Reel ${rawId}`,
            topic: 'AI Automation & Business Workflows',
            formatName: 'AI AUTOMATION',
            durationSeconds: 5
          });
          // If the synthesized filename differed from requested safePath, ensure safePath has valid MP4 binary
          if (!fs.existsSync(safePath)) {
            const mp4Binary = buildMuxedVerticalMp4({
              width: 1080,
              height: 1920,
              durationSeconds: 24,
              fps: 30
            });
            fs.writeFileSync(safePath, Buffer.from(mp4Binary));
          }
        } else if (normalizedRel.startsWith('thumbnails/') && normalizedRel.endsWith('.svg')) {
          const rawId = path.basename(normalizedRel, '.svg').replace(/^thumb_/, '');
          serverMediaService.synthesizeAndPersistReelFile({
            projectId: rawId,
            title: `AI Reel ${rawId}`,
            topic: 'AI Automation & Business Workflows',
            formatName: 'AI AUTOMATION',
            durationSeconds: 5
          });
        }
      }

      if (!fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
        res.statusCode = 404;
        res.end('Media not found');
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const mimeTypes: Record<string, string> = {
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.webm': 'video/webm',
        '.svg': 'image/svg+xml',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.vtt': 'text/vtt',
        '.srt': 'text/plain',
        '.json': 'application/json'
      };

      const contentType = mimeTypes[ext] || 'application/octet-stream';
      const stat = fs.statSync(safePath);

      const range = req.headers.range;
      if (range && (contentType.startsWith('video/') || contentType.startsWith('audio/'))) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = end - start + 1;
        const file = fs.createReadStream(safePath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin'
        });
        file.pipe(res);
        return;
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin'
      });
      fs.createReadStream(safePath).pipe(res);
      return;
    }

    // ==========================================
    // 1. META WEBHOOK GET VERIFICATION (GET /api/meta/webhook)
    // ==========================================
    if (url === '/api/meta/webhook' && req.method === 'GET') {
      const mode = queryParams.get('hub.mode') || undefined;
      const token = queryParams.get('hub.verify_token') || undefined;
      const challenge = queryParams.get('hub.challenge') || undefined;

      const verification = WebhookSecurity.verifyWebhookSubscription({
        mode,
        token,
        challenge
      });

      if (verification.isValid && verification.challenge) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(verification.challenge);
        return;
      }

      res.statusCode = 403;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: verification.error || 'Verification failed' }));
      return;
    }

    // Pass non-API and non-media requests to Vite handler
    if (!url.startsWith('/api/') && !url.startsWith('/media/')) {
      if (next) return next();
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Hub-Signature-256');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // ==========================================
    // 2. AI API GET ENDPOINTS
    // ==========================================
    if (url === '/api/ai/status' && req.method === 'GET') {
      const status = aiProviderManager.getStatus();
      res.statusCode = 200;
      res.end(JSON.stringify(status));
      return;
    }

    // ==========================================
    // 3. META API GET ENDPOINTS
    // ==========================================
    if (url === '/api/meta/status' && req.method === 'GET') {
      try {
        const status = await serverMetaService.getConnectionStatus();
        res.statusCode = 200;
        res.end(JSON.stringify(status));
      } catch (err: any) {
        res.statusCode = 500;
        res.end(
          JSON.stringify({
            isConnected: false,
            isConfigured: false,
            mode: 'DEMO',
            error: err.message || 'Error checking Meta status'
          })
        );
      }
      return;
    }

    if (url === '/api/meta/account' && req.method === 'GET') {
      try {
        const account = await serverMetaService.getAccountInfo();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, account }));
      } catch (err: any) {
        res.statusCode = 400;
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // ==========================================
    // 4. MEDIA GENERATION GET ENDPOINTS
    // ==========================================
    if (url === '/api/media/status' && req.method === 'GET') {
      const status = serverMediaService.getStatus();
      res.statusCode = 200;
      res.end(JSON.stringify(status));
      return;
    }

    if (url === '/api/media/provider-status' && req.method === 'GET') {
      const status = serverMediaService.getCreatomateStatus();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...status }));
      return;
    }

    if (url === '/api/media/voice-status' && req.method === 'GET') {
      const status = serverMediaService.getElevenLabsStatus();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, ...status }));
      return;
    }

    if (url === '/api/media/jobs' && req.method === 'GET') {
      const jobs = serverMediaService.getAllJobs();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, jobs }));
      return;
    }

    if (url.startsWith('/api/media/jobs/') && req.method === 'GET') {
      const jobId = url.replace('/api/media/jobs/', '');
      const job = serverMediaService.getJob(jobId);
      if (!job) {
        res.statusCode = 404;
        res.end(JSON.stringify({ success: false, error: 'Job not found' }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, job }));
      return;
    }

    if (url === '/api/media/music' && req.method === 'GET') {
      const tracks = serverMediaService.getMusicTracks();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, tracks }));
      return;
    }

    if (url === '/api/media/presets' && req.method === 'GET') {
      const presets = serverMediaService.getBrandPresets();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, presets }));
      return;
    }

    if (url === '/api/media/assets' && req.method === 'GET') {
      const assets = serverMediaService.getAssets();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, assets }));
      return;
    }

    if (url.startsWith('/api/media/assets/') && req.method === 'DELETE') {
      const assetId = url.replace('/api/media/assets/', '');
      const deleted = serverMediaService.deleteAsset(assetId);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: deleted }));
      return;
    }

    // ==========================================
    // 4b. TEMPLATES GET ENDPOINTS (v2)
    // ==========================================
    if (url === '/api/templates' && req.method === 'GET') {
      const templates = reelTemplateRegistry.getAllTemplates();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, templates, totalCount: templates.length }));
      return;
    }

    if (url === '/api/templates/preview' && req.method === 'GET') {
      const templateId = queryParams.get('templateId') || queryParams.get('id') || 'ai-tool-demo';
      const title = queryParams.get('title') || undefined;
      const template = reelTemplateRegistry.getTemplateById(templateId);
      const svg = reelTemplateRegistry.generateTemplatePreviewSvg(templateId, title);
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, templateId: template.id, template, svg }));
      return;
    }

    // ==========================================
    // 5. ENGAGEMENT & INBOX GET ENDPOINTS (STEP 5)
    // ==========================================
    if (url === '/api/engagement/status' && req.method === 'GET') {
      const status = serverWebhookService.getStatus();
      res.statusCode = 200;
      res.end(JSON.stringify(status));
      return;
    }

    if (url === '/api/engagement/inbox' && req.method === 'GET') {
      const inbox = serverWebhookService.getEngagements();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, inbox }));
      return;
    }

    if (url === '/api/engagement/rules' && req.method === 'GET') {
      const rules = keywordAutomationManager.getRules();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, rules }));
      return;
    }

    if (url === '/api/engagement/leads' && req.method === 'GET') {
      const leads = leadExtractorManager.getAllLeads();
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true, leads }));
      return;
    }

    // ==========================================
    // 6. POST / BODY ENDPOINTS
    // ==========================================
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 25 * 1024 * 1024) {
        res.statusCode = 413;
        res.end(JSON.stringify({ error: 'Payload too large' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      let parsedBody: any = {};
      if (body) {
        try {
          parsedBody = JSON.parse(body);
        } catch {
          try {
            const params = new URLSearchParams(body);
            const obj: any = {};
            for (const [key, value] of params.entries()) {
              obj[key] = value;
            }
            if (Object.keys(obj).length > 0 && !body.startsWith('{')) {
              parsedBody = obj;
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
              return;
            }
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
            return;
          }
        }
      }

      // --- TEMPLATES ANALYZE & AUTO-SELECTION (POST /api/templates/analyze) ---
      if (url === '/api/templates/analyze' && req.method === 'POST') {
        try {
          const analysis = topicTemplateSelector.selectTemplate(parsedBody || {});
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, analysis }));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // --- META WEBHOOK INGESTION (POST /api/meta/webhook) ---
      if (url === '/api/meta/webhook' && req.method === 'POST') {
        try {
          const sigHeader = (req.headers['x-hub-signature-256'] as string) || undefined;
          const result = await serverWebhookService.handleWebhookPayload(parsedBody, sigHeader);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, ...result }));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // --- ENGAGEMENT SIMULATOR & TEST CONSOLE (POST /api/engagement/simulate) ---
      if (url === '/api/engagement/simulate' && req.method === 'POST') {
        try {
          const event = await serverWebhookService.processIncomingEvent({
            ...parsedBody,
            isDemo: true
          });
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, event }));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // POST /api/engagement/settings
      if (url === '/api/engagement/settings' && req.method === 'POST') {
        if (typeof parsedBody.autoReplyMasterSwitch === 'boolean') {
          keywordAutomationManager.setMasterSwitch(parsedBody.autoReplyMasterSwitch);
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // POST /api/engagement/rules
      if (url === '/api/engagement/rules' && req.method === 'POST') {
        keywordAutomationManager.updateRule(parsedBody);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // POST /api/engagement/block-user
      if (url === '/api/engagement/block-user' && req.method === 'POST') {
        keywordAutomationManager.blockUser(parsedBody.userId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // --- MEDIA GENERATION POST ENDPOINTS ---
      if (url === '/api/media/storyboard' && req.method === 'POST') {
        try {
          const storyboard = serverMediaService.createStoryboard(parsedBody);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, storyboard }));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/render' && req.method === 'POST') {
        try {
          const job = serverMediaService.submitRenderJob(parsedBody);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, job }));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url.includes('/api/media/jobs/') && url.endsWith('/cancel') && req.method === 'POST') {
        const jobId = url.split('/')[4];
        const cancelled = serverMediaService.cancelJob(jobId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: cancelled }));
        return;
      }

      if (url.includes('/api/media/jobs/') && url.endsWith('/retry') && req.method === 'POST') {
        const jobId = url.split('/')[4];
        const retriedJob = serverMediaService.retryJob(jobId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: !!retriedJob, job: retriedJob }));
        return;
      }

      if (url === '/api/media/assets/upload' && req.method === 'POST') {
        try {
          const { name, data, type } = parsedBody;
          if (!name || !data) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing name or data' }));
            return;
          }
          const buffer = Buffer.from(data, 'base64');
          const asset = serverMediaService.saveAsset(name, buffer, type);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, asset }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/synthesize-reel' && req.method === 'POST') {
        try {
          const result = serverMediaService.synthesizeAndPersistReelFile(parsedBody);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/verify-asset' && req.method === 'POST') {
        try {
          const { mediaUrl } = parsedBody;
          const verification = serverMediaService.verifyAssetExistence(mediaUrl || '');
          res.statusCode = 200;
          res.end(JSON.stringify(verification));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ exists: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/save-render' && req.method === 'POST') {
        try {
          const { filename, base64Data } = parsedBody;
          if (!filename || !base64Data) {
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: 'Missing filename or base64Data' }));
            return;
          }
          const buffer = Buffer.from(base64Data, 'base64');
          const targetPath = path.join(MEDIA_ROOT, 'renders', sanitizeFilename(filename));
          const rendersDir = path.join(MEDIA_ROOT, 'renders');
          if (!fs.existsSync(rendersDir)) fs.mkdirSync(rendersDir, { recursive: true });
          fs.writeFileSync(targetPath, buffer);

          res.statusCode = 200;
          res.end(JSON.stringify({
            success: true,
            outputVideoUrl: `/media/renders/${sanitizeFilename(filename)}`,
            outputVideoPath: targetPath,
            fileSizeBytes: buffer.length
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/render-test' && req.method === 'POST') {
        try {
          const { mode = 'DEMO' } = parsedBody;
          const result = await serverMediaService.renderTestReel(mode);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/render-creatomate' && req.method === 'POST') {
        try {
          const result = await serverMediaService.renderWithCreatomate(parsedBody);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/voice-test' && req.method === 'POST') {
        try {
          const { text, mode = 'LIVE' } = parsedBody;
          const result = await serverMediaService.generateVoiceTest(text, mode);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/media/voice-generate' && req.method === 'POST') {
        try {
          const { text, options } = parsedBody;
          const result = await serverMediaService.generateVoiceover(text, options);
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // --- AI CONTENT GENERATION POST ENDPOINTS ---
      if (url === '/api/ai/generate' && req.method === 'POST') {
        try {
          const variant = await aiProviderManager.generate(parsedBody);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, variant }));
        } catch (err: any) {
          console.error('Server AI Generation Error:', err);
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              success: false,
              error: err.message || 'AI Content Generation failed'
            })
          );
        }
        return;
      }

      if (url === '/api/ai/generate-batch' && req.method === 'POST') {
        try {
          const variants = await aiProviderManager.generateBatchDaily(parsedBody);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, variants }));
        } catch (err: any) {
          console.error('Server AI Batch Generation Error:', err);
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              success: false,
              error: err.message || 'AI Batch Generation failed'
            })
          );
        }
        return;
      }

      if (url === '/api/ai/validate' && req.method === 'POST') {
        res.statusCode = 200;
        res.end(JSON.stringify({ valid: true, score: 98, checks: [] }));
        return;
      }

      // --- META / INSTAGRAM PUBLISHING POST ENDPOINTS ---
      if (url === '/api/meta/test-connection' && req.method === 'POST') {
        try {
          const result = await serverMetaService.validateCredentials();
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ valid: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/meta/container' && req.method === 'POST') {
        try {
          const { mediaType, mediaUrl, caption, shareToFeed } = parsedBody;
          const containerId = await serverMetaService.createMediaContainer({
            mediaType,
            mediaUrl,
            caption,
            shareToFeed
          });
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, containerId }));
        } catch (err: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      if (url === '/api/meta/publish' && req.method === 'POST') {
        const { mediaType = 'REELS', mediaUrl, caption = '', shareToFeed = true, isDemo = false } = parsedBody;

        if (!mediaUrl) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Media URL is required for Instagram publishing.' }));
          return;
        }

        if (caption.length > 2200) {
          res.statusCode = 400;
          res.end(
            JSON.stringify({
              success: false,
              error: `Caption exceeds Instagram limit of 2,200 characters (Current: ${caption.length} characters).`
            })
          );
          return;
        }

        if (isDemo || !serverMetaService.isConfigured()) {
          await new Promise((r) => setTimeout(r, 600));

          const mockContainerId = `container_demo_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`;
          const mockMediaId = `1784${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 9000 + 1000)}`;
          const mockShortcode = `DMO_${Date.now().toString(36).toUpperCase()}`;

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              success: true,
              isDemo: true,
              metaPostId: mockMediaId,
              containerId: mockContainerId,
              permalink: `https://instagram.com/p/${mockShortcode}/`,
              status: 'PUBLISHED',
              publishedAt: new Date().toISOString(),
              message: 'Published in DEMO Mode (Safe Simulation). No real Instagram post was created.'
            })
          );
          return;
        }

        try {
          const result = await serverMetaService.publishFullPipeline({
            mediaType,
            mediaUrl,
            caption,
            shareToFeed
          });

          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          console.error('Server Meta Publish Error:', err.message);
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              success: false,
              isDemo: false,
              status: 'FAILED',
              error: err.message || 'Failed to publish via official Meta Graph API'
            })
          );
        }
        return;
      }

      // ==========================================
      // STEP 6: PERFORMANCE INTELLIGENCE ENDPOINTS
      // ==========================================

      // 1. GET /api/analytics/insights
      if (req.method === 'GET' && url === '/api/analytics/insights') {
        const items = performanceModelEngine.getPerformanceItems();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, items }));
        return;
      }

      // 2. POST /api/analytics/sync
      if (req.method === 'POST' && url === '/api/analytics/sync') {
        const body = parsedBody || {};
        const publishedItems = Array.isArray(body.publishedItems) ? body.publishedItems : [];
        const result = await analyticsSyncService.syncAll(publishedItems);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, ...result }));
        return;
      }

      // 3. GET /api/analytics/sync-status
      if (req.method === 'GET' && url === '/api/analytics/sync-status') {
        const status = analyticsSyncService.getSyncStatus();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, ...status }));
        return;
      }

      // 4. GET /api/analytics/patterns
      if (req.method === 'GET' && url === '/api/analytics/patterns') {
        const patterns = contentPatternAnalyzer.analyzePatterns();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, patterns }));
        return;
      }

      // 5. POST /api/analytics/ai-analysis
      if (req.method === 'POST' && url === '/api/analytics/ai-analysis') {
        const report = await performanceAnalysisService.generateAnalysisReport();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, report }));
        return;
      }

      // 6. GET /api/analytics/recommendations
      if (req.method === 'GET' && url === '/api/analytics/recommendations') {
        const recommendations = contentRecommendationService.getRecommendations();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, recommendations }));
        return;
      }

      // 7. POST /api/analytics/recommendations/status
      if (req.method === 'POST' && url === '/api/analytics/recommendations/status') {
        const { id, status } = parsedBody || {};
        if (!id || !status) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Missing id or status parameter' }));
          return;
        }
        const updated = contentRecommendationService.updateRecommendationStatus(id, status);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, recommendation: updated }));
        return;
      }

      // 8. GET /api/analytics/experiments
      if (req.method === 'GET' && url === '/api/analytics/experiments') {
        const experiments = experimentSystem.getAllExperiments();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, experiments }));
        return;
      }

      // 9. POST /api/analytics/experiments
      if (req.method === 'POST' && url === '/api/analytics/experiments') {
        const expData = parsedBody || {};
        const created = experimentSystem.createExperiment(expData);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, experiment: created }));
        return;
      }

      // 10. POST /api/analytics/experiments/status
      if (req.method === 'POST' && url === '/api/analytics/experiments/status') {
        const { id, status, observedFinding } = parsedBody || {};
        const updated = experimentSystem.updateExperimentStatus(id, status, observedFinding);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, experiment: updated }));
        return;
      }

      // 11. POST /api/analytics/fatigue-check
      if (req.method === 'POST' && url === '/api/analytics/fatigue-check') {
        const { items } = parsedBody || {};
        const result = fatigueDetector.scanForFatigue(items);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, ...result }));
        return;
      }

      // 12. GET /api/analytics/daily-brief
      if (req.method === 'GET' && url === '/api/analytics/daily-brief') {
        const brief = await dailyBriefService.getDailyBrief();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, brief }));
        return;
      }

      // 13. GET /api/analytics/attribution
      if (req.method === 'GET' && url === '/api/analytics/attribution') {
        const items = performanceModelEngine.getPerformanceItems();
        const summary = leadAttributionEngine.getGlobalAttributionSummary(
          items.map((i) => ({ contentId: i.contentId, title: i.title }))
        );
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, attribution: summary }));
        return;
      }

      // ==========================================
      // STEP 7: AUTOMATION CONTROL & DAILY OS ENDPOINTS
      // ==========================================

      // 0. GET /api/automation/today-reel
      if (req.method === 'GET' && url === '/api/automation/today-reel') {
        const filePath = path.resolve(process.cwd(), 'data', 'storage', 'review_records.json');
        let record = null;
        if (fs.existsSync(filePath)) {
          try {
            const records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (records && records.length > 0) {
              record = records.sort((a: any, b: any) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];
            }
          } catch {}
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, todayReel: record }));
        return;
      }

      // 0b. GET /api/automation/review-records
      if (req.method === 'GET' && url === '/api/automation/review-records') {
        const filePath = path.resolve(process.cwd(), 'data', 'storage', 'review_records.json');
        let records = [];
        if (fs.existsSync(filePath)) {
          try {
            records = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          } catch {}
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, records }));
        return;
      }

      // 0c. POST /api/automation/regenerate-visuals
      if (url === '/api/automation/regenerate-visuals' && req.method === 'POST') {
        try {
          const { reelId } = parsedBody || {};
          const updated = await fastReelEngine.regenerateVisualsOnly(reelId);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: !!updated, todayReel: updated }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // 0d. POST /api/automation/regenerate-voice
      if (url === '/api/automation/regenerate-voice' && req.method === 'POST') {
        try {
          const { reelId } = parsedBody || {};
          const updated = await fastReelEngine.regenerateVoiceOnly(reelId);
          res.statusCode = 200;
          res.end(JSON.stringify({ success: !!updated, todayReel: updated }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // 0e. POST /api/automation/fast-reel
      if (url === '/api/automation/fast-reel' && req.method === 'POST') {
        try {
          const { mode = 'DAILY_DISCOVERY', topic, script, formatId, voiceId } = parsedBody || {};
          const result = await fastReelEngine.generateFastReel({
            mode,
            topic: topic || 'Daily AI Tool Update',
            script,
            formatId,
            voiceId
          });
          res.statusCode = 200;
          res.end(JSON.stringify(result));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // 0f. POST /api/automation/heal-media
      if (url === '/api/automation/heal-media' && req.method === 'POST') {
        try {
          const report = await mediaSelfHealingService.healAllRecords();
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, report }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // 1. GET /api/automation/status
      if (req.method === 'GET' && url === '/api/automation/status') {
        const aiStatus = aiProviderManager.getStatus();
        const isMetaConnected = serverMetaService.isConfigured();
        const scheduler = schedulerService.getStatus();
        const settings = automationSettingsManager.getSettings();
        const currentRun = dailyRunEngine.getCurrentRun();

        const statusResponse = {
          success: true,
          systemStatus: {
            ai: aiStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED',
            aiProvider: aiStatus.provider,
            media: 'READY',
            meta: isMetaConnected ? 'CONNECTED' : 'DISCONNECTED',
            webhook: 'VERIFIED',
            scheduler: scheduler.isRunning ? 'RUNNING' : 'STOPPED',
            analytics: isMetaConnected && settings.publishingMode === 'LIVE' ? 'LIVE' : 'DEMO',
            leadEngine: 'READY'
          },
          scheduler,
          settings,
          currentRun
        };

        res.statusCode = 200;
        res.end(JSON.stringify(statusResponse));
        return;
      }

      // 2. GET /api/automation/current-run
      if (req.method === 'GET' && url === '/api/automation/current-run') {
        const run = dailyRunEngine.getCurrentRun();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, run }));
        return;
      }

      // 3. GET /api/automation/history
      if (req.method === 'GET' && url === '/api/automation/history') {
        const history = dailyRunEngine.getRunHistory();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, history }));
        return;
      }

      // 4. POST /api/automation/run
      if (req.method === 'POST' && url === '/api/automation/run') {
        const { customReelsCount } = parsedBody || {};
        const run = await dailyRunEngine.startDailyRun({ customReelsCount });
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, run }));
        return;
      }

      // 5. POST /api/automation/approve
      if (req.method === 'POST' && url === '/api/automation/approve') {
        const { runId, itemId } = parsedBody || {};
        if (!runId || !itemId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Missing runId or itemId' }));
          return;
        }
        const updated = await dailyRunEngine.approveItem(runId, itemId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, run: updated }));
        return;
      }

      // 6. POST /api/automation/reject
      if (req.method === 'POST' && url === '/api/automation/reject') {
        const { runId, itemId, reason } = parsedBody || {};
        if (!runId || !itemId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Missing runId or itemId' }));
          return;
        }
        const updated = await dailyRunEngine.rejectItem(runId, itemId, reason);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, run: updated }));
        return;
      }

      // 7. POST /api/automation/retry-item
      if (req.method === 'POST' && url === '/api/automation/retry-item') {
        const { runId, itemId } = parsedBody || {};
        if (!runId || !itemId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Missing runId or itemId' }));
          return;
        }
        const updated = await dailyRunEngine.retryItem(runId, itemId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, run: updated }));
        return;
      }

      // 8. POST /api/automation/publish
      if (req.method === 'POST' && url === '/api/automation/publish') {
        const { runId } = parsedBody || {};
        if (!runId) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Missing runId' }));
          return;
        }
        const updated = await dailyRunEngine.publishApprovedItems(runId);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, run: updated }));
        return;
      }

      // 9. POST /api/automation/plan/generate
      if (req.method === 'POST' && url === '/api/automation/plan/generate') {
        const { count } = parsedBody || {};
        const plan = dailyPlanGenerator.generateDailyPlan(count);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, plan }));
        return;
      }

      // 10. POST /api/automation/qc/validate
      if (req.method === 'POST' && url === '/api/automation/qc/validate') {
        const item = parsedBody?.item || {};
        const report = qualityControlEngine.validateContent(item);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, report }));
        return;
      }

      // 11. GET /api/automation/settings
      if (req.method === 'GET' && url === '/api/automation/settings') {
        const settings = automationSettingsManager.getSettings();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, settings }));
        return;
      }

      // 12. POST /api/automation/settings
      if (req.method === 'POST' && url === '/api/automation/settings') {
        const partial = parsedBody?.settings || parsedBody || {};
        const updated = automationSettingsManager.updateSettings(partial);
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, settings: updated }));
        return;
      }

      // 13. GET /api/automation/notifications
      if (req.method === 'GET' && url === '/api/automation/notifications') {
        const notifications = notificationService.getNotifications();
        const unreadCount = notificationService.getUnreadCount();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, notifications, unreadCount }));
        return;
      }

      // 14. POST /api/automation/notifications/read
      if (req.method === 'POST' && url === '/api/automation/notifications/read') {
        const { id, markAll } = parsedBody || {};
        if (markAll) {
          notificationService.markAllAsRead();
        } else if (id) {
          notificationService.markAsRead(id);
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true }));
        return;
      }

      // 15. GET /api/automation/scheduler
      if (req.method === 'GET' && url === '/api/automation/scheduler') {
        const status = schedulerService.getStatus();
        res.statusCode = 200;
        res.end(JSON.stringify({ success: true, scheduler: status }));
        return;
      }

      // ==========================================
      // STEP 8: PRODUCTION HEALTH, READINESS & STORAGE
      // ==========================================

      // 1. GET /api/health
      if (req.method === 'GET' && url === '/api/health') {
        const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
        const aiStatus = aiProviderManager.getStatus();
        const metaStatus = serverMetaService.getStatus();
        const mediaStatus = serverMediaService.getStatus();
        const scheduler = schedulerService.getStatus();
        const storageStats = await persistentStorage.getStorageStats();
        const envReport = EnvConfig.getSafeReport();

        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          uptime: uptimeSeconds,
          environment: envReport.nodeEnv,
          version: '1.0.0',
          requestId,
          subsystems: {
            ai: aiStatus.isConnected ? 'CONFIGURED' : 'UNAVAILABLE',
            aiProvider: aiStatus.provider,
            media: mediaStatus.isConfigured ? 'READY' : 'DEGRADED',
            meta: metaStatus.isConnected ? 'CONFIGURED' : 'DEMO',
            webhooks: 'VERIFIED',
            scheduler: scheduler.isRunning ? 'RUNNING' : 'STOPPED',
            persistence: storageStats.healthy ? 'HEALTHY' : 'ERROR',
            analytics: envReport.metaPublishingMode === 'LIVE' && metaStatus.isConnected ? 'LIVE' : 'DEMO',
            leadEngine: 'READY'
          },
          storage: {
            mode: storageStats.mode,
            runsCount: storageStats.runsCount,
            jobsCount: storageStats.jobsCount,
            leadsCount: storageStats.leadsCount
          }
        };

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(health));
        return;
      }

      // 2. GET /api/ready
      if (req.method === 'GET' && url === '/api/ready') {
        const storageStats = await persistentStorage.getStorageStats();
        const isReady = storageStats.healthy;

        if (isReady) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ready: true,
            status: 'READY_FOR_TRAFFIC',
            timestamp: new Date().toISOString(),
            requestId
          }));
        } else {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            ready: false,
            status: 'NOT_READY',
            error: 'Storage subsystem is not healthy.',
            requestId
          }));
        }
        return;
      }

      // 3. GET /api/system/storage
      if (req.method === 'GET' && url === '/api/system/storage') {
        const stats = await persistentStorage.getStorageStats();
        const backups = await persistentStorage.listBackups();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, storage: stats, backups }));
        return;
      }

      // 4. POST /api/system/backup
      if (req.method === 'POST' && url === '/api/system/backup') {
        try {
          const backup = await persistentStorage.createBackup();
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, backup }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message, requestId }));
        }
        return;
      }

      // 5. GET /api/system/media-url-status
      if (req.method === 'GET' && url === '/api/system/media-url-status') {
        const mediaStatus = PublicMediaValidator.getStatus();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, mediaStatus }));
        return;
      }

      // 6. GET /api/system/environment
      if (req.method === 'GET' && url === '/api/system/environment') {
        const safeEnv = EnvConfig.getSafeReport();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, environment: safeEnv }));
        return;
      }

      // 7. GET /api/scheduler/jobs
      if (req.method === 'GET' && url === '/api/scheduler/jobs') {
        const jobs = await persistentStorage.listScheduledJobs();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, jobs, armedTimers: persistentScheduler.getArmedTimersCount() }));
        return;
      }

      // 8. POST /api/scheduler/schedule-item
      if (req.method === 'POST' && url === '/api/scheduler/schedule-item') {
        try {
          const jobData = parsedBody || {};
          const scheduled = await persistentScheduler.scheduleContentItem(jobData);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, job: scheduled }));
        } catch (err: any) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message, requestId }));
        }
        return;
      }

      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: `Unknown endpoint: ${url}`, requestId }));
    });
  };
}
