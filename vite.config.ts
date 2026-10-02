import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import dotenv from 'dotenv';
import { createAiApiHandler } from './server/apiMiddleware.ts';

// Pre-load environment from .env on startup
dotenv.config();

function flashAiApiPlugin(): Plugin {
  const handler = createAiApiHandler();
  return {
    name: 'flash-ai-api-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || '';
        if (raw.startsWith('/flash-ai/api/') || raw.startsWith('/flash-ai/media/')) {
          req.url = raw.substring('/flash-ai'.length);
        }
        handler(req, res, next);
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const raw = req.url || '';
        if (raw.startsWith('/flash-ai/api/') || raw.startsWith('/flash-ai/media/')) {
          req.url = raw.substring('/flash-ai'.length);
        }
        handler(req, res, next);
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    base: './',
    define: {
      'process.env.META_PUBLISHING_MODE': JSON.stringify(env.META_PUBLISHING_MODE || 'LIVE'),
      'process.env.META_API_VERSION': JSON.stringify(env.META_API_VERSION || 'v21.0'),
      'process.env.META_INSTAGRAM_ACCOUNT_ID': JSON.stringify(env.META_INSTAGRAM_ACCOUNT_ID || '17841436234295944'),
      'process.env.META_APP_ID': JSON.stringify(env.META_APP_ID || ''),
      'process.env.WHATSAPP_PHONE_NUMBER_ID': JSON.stringify(env.WHATSAPP_PHONE_NUMBER_ID || ''),
      'process.env.WHATSAPP_RECIPIENT_NUMBER': JSON.stringify(env.WHATSAPP_RECIPIENT_NUMBER || '919398421460'),
    },
    plugins: [
      react(),
      tailwindcss(),
      flashAiApiPlugin()
    ]
  };
});
