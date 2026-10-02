import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { EnvConfig } from './config/env.ts';
import { Logger } from './utils/logger.ts';
import { createAiApiHandler } from './apiMiddleware.ts';
import { persistentScheduler } from './automation/persistentScheduler.ts';

const PORT = EnvConfig.port;
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

export async function createProductionServer(): Promise<http.Server> {
  const apiHandler = createAiApiHandler();

  const server = http.createServer(async (req, res) => {
    const rawUrl = req.url || '/';
    let cleanUrl = rawUrl.split('?')[0] || '/';
    if (cleanUrl.startsWith('/flash-ai/')) {
      cleanUrl = cleanUrl.substring('/flash-ai'.length);
      req.url = cleanUrl + (rawUrl.includes('?') ? '?' + rawUrl.split('?')[1] : '');
    }

    // 1. API & Static Media Handling (/api/* and /media/*)
    if (cleanUrl.startsWith('/api/') || cleanUrl.startsWith('/media/')) {
      return apiHandler(req, res);
    }

    // 2. Production Static Frontend Serving from dist/
    if (req.method === 'GET' || req.method === 'HEAD') {
      let relativePath = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\//, '');
      let filePath = path.normalize(path.join(DIST_DIR, relativePath));

      // Path traversal security check
      if (!filePath.startsWith(DIST_DIR)) {
        res.statusCode = 403;
        res.end('Access Denied');
        return;
      }

      // Check if file exists, fallback to index.html for client-side SPA routing
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(DIST_DIR, 'index.html');
      }

      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Cache-Control headers (immutable for hashed assets, no-cache for index.html)
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (cleanUrl.startsWith('/assets/')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }

        res.setHeader('Content-Type', contentType);
        res.statusCode = 200;

        if (req.method === 'HEAD') {
          res.end();
          return;
        }

        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        return;
      }
    }

    // Default fallback
    res.statusCode = 404;
    res.end('Not Found');
  });

  return server;
}

export async function startServer(): Promise<http.Server> {
  EnvConfig.printStartupReport();

  // Initialize Persistent Background Scheduler
  try {
    await persistentScheduler.initialize();
  } catch (err: any) {
    Logger.error('Error during persistent scheduler startup', { component: 'Server' }, err);
  }

  const server = await createProductionServer();

  server.listen(PORT, () => {
    Logger.info(
      `FLASH.Ai Production Server running at http://localhost:${PORT} [${EnvConfig.nodeEnv.toUpperCase()}]`,
      { component: 'Server' }
    );
  });

  // Graceful Shutdown Handlers
  const handleShutdown = (signal: string) => {
    Logger.info(`Received ${signal}. Commencing graceful shutdown...`, { component: 'Server' });

    // Stop scheduler timers
    persistentScheduler.shutdown();

    server.close(() => {
      Logger.info('HTTP server closed cleanly. Process exiting.', { component: 'Server' });
      process.exit(0);
    });

    // Force exit if hanging after 5 seconds
    setTimeout(() => {
      Logger.warn('Forced shutdown after timeout.', { component: 'Server' });
      process.exit(1);
    }, 5000);
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));

  return server;
}

// Auto-start if executed directly via Node / tsx
if (process.argv[1] && process.argv[1].endsWith('server/index.ts')) {
  startServer().catch((err) => {
    Logger.error('Fatal error during server startup', { component: 'Server' }, err);
    process.exit(1);
  });
}
