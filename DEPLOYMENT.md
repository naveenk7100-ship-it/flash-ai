# FLASH.Ai Social Media Automation Engine — Production Deployment Guide

## 1. System Architecture Overview

The FLASH.Ai Social Media Automation Engine is designed as a standalone, production-ready full-stack Node.js and React application:

```
[ User Browser / Mobile Device ]
              │ (HTTPS)
              ▼
    [ Reverse Proxy / Nginx / Caddy / Cloudflare ]
              │
              ▼
   [ Node.js / Express Server (server/index.ts) ]
    ├─ Static Production Frontend (dist/)
    ├─ Static Media Delivery (/media/* with CORS/Range support)
    ├─ API Routing (/api/* with Rate Limiting & Security Headers)
    ├─ Persistent Scheduler (Recovers and executes timed jobs across restarts)
    ├─ Atomic File Persistence Engine (server/data/ -> runs, jobs, leads, backups)
    ├─ Meta Graph API & Webhook Processing
    └─ Gemini AI & Media Rendering Services
```

---

## 2. Prerequisites

1. **Node.js**: Version 18.0.0 or higher.
2. **Package Manager**: npm (v9+) or pnpm/yarn.
3. **FFmpeg & ffprobe**: Required for 9:16 vertical Reel video rendering.
   - **Linux**: `sudo apt-get install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Windows**: `winget install Gyan.FFmpeg` or download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) and add to PATH.
4. **API Credentials**:
   - **Google Gemini API Key**: For AI script, caption, and strategic plan generation.
   - **Meta for Developers App**: Graph API App ID, App Secret, Long-Lived Page Access Token, and Instagram Business Account ID (for LIVE mode).

---

## 3. Environment Configuration

Copy `.env.example` to `.env` in the project root:

```bash
cp .env.example .env
```

### Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `3000` | HTTP port on which the Node.js server listens. |
| `NODE_ENV` | Optional | `development` | Set to `production` in production environments. |
| `PUBLIC_BASE_URL` | **Required for Meta LIVE** | `""` | Public HTTPS domain (e.g. `https://social.flashai.com`) required for Meta video container ingestion and webhooks. |
| `STORAGE_ROOT` | Optional | `./server/data` | Absolute or relative path to persistent data directory. |
| `GEMINI_API_KEY` | **Required** | `""` | Google Gemini API key for AI generation. |
| `META_APP_ID` | Optional (Live Meta) | `""` | Meta App ID from Meta Developer Console. |
| `META_APP_SECRET` | Optional (Live Meta) | `""` | Meta App Secret for webhook HMAC-SHA256 signature verification. |
| `META_ACCESS_TOKEN` | Optional (Live Meta) | `""` | Long-lived Page / User access token with Instagram permissions. |
| `META_PAGE_ID` | Optional (Live Meta) | `""` | Facebook Page ID linked to the Instagram Business Account. |
| `META_IG_USER_ID` | Optional (Live Meta) | `""` | Instagram Business / Creator Account ID. |
| `META_VERIFY_TOKEN`| Optional (Live Meta) | `flash_ai_webhook_secret_2026` | Webhook verification token configured in Meta App Dashboard. |
| `META_PUBLISHING_MODE`| Optional | `DEMO` | `DEMO` (safe simulation) or `LIVE` (real Meta Graph API publishing). |

> [!IMPORTANT]
> Never commit your `.env` file into version control. The server includes an automatic redaction filter ensuring secrets are never exposed in API responses or logs.

---

## 4. Building and Running

### Development Mode
```bash
npm run dev
```
Starts the Vite development server with API proxying to the backend.

### Production Build & Launch
```bash
# 1. Install dependencies
npm install

# 2. Build the optimized React frontend
npm run build

# 3. Start the persistent Node.js server
npm start
```
`npm start` launches `server/index.ts`, which serves the production bundle from `dist/`, mounts all API routes, starts background schedulers, and listens on `PORT` (default 3000).

---

## 5. Process Management & 24/7 Availability

To ensure the server runs continuously, automatically restarts on reboots or crashes, and executes background schedules 24/7, use a process manager:

### Option A: PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "flash-ai-engine" -- run start

# Save process list and configure auto-start on server boot
pm2 save
pm2 startup
```

Useful PM2 commands:
```bash
pm2 status
pm2 logs flash-ai-engine
pm2 restart flash-ai-engine
pm2 stop flash-ai-engine
```

### Option B: Systemd Service (Linux)
Create `/etc/systemd/system/flash-ai.service`:
```ini
[Unit]
Description=FLASH.Ai Social Media Automation Engine
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/var/www/flash-ai
Environment=NODE_ENV=production
EnvironmentFile=/var/www/flash-ai/.env
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=flash-ai

[Install]
WantedBy=multi-user.target
```
Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable flash-ai
sudo systemctl start flash-ai
sudo systemctl status flash-ai
```

---

## 6. Reverse Proxy & Public HTTPS (Nginx / Caddy)

Meta Graph API requires public **HTTPS** URLs for both webhook event callbacks and video container ingestion (downloading rendered Reels).

### Nginx Configuration Example
```nginx
server {
    listen 80;
    server_name social.flashai.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name social.flashai.com;

    ssl_certificate /etc/letsencrypt/live/social.flashai.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/social.flashai.com/privkey.pem;

    # Client payload size for video/media uploads
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Caddyfile Example
```caddy
social.flashai.com {
    reverse_proxy 127.0.0.1:3000
}
```

---

## 7. Meta Webhook Configuration

1. In the **Meta for Developers Dashboard**, navigate to **Webhooks** -> **Instagram**.
2. Set **Callback URL**: `https://social.flashai.com/api/meta/webhook`
3. Set **Verify Token**: Must match `META_VERIFY_TOKEN` in your `.env`.
4. Subscribe to fields: `comments`, `messages`, `mention`.
5. Meta will send a GET challenge to verify, which the FLASH.Ai webhook controller validates automatically.

---

## 8. Data Persistence, Backups & Recovery

All persistent operational data is stored under `STORAGE_ROOT` (`server/data/` by default):
- `server/data/runs/`: Daily 13-stage operating system run logs and step results.
- `server/data/jobs/`: Persistent scheduled publishing jobs and execution status.
- `server/data/leads/`: Captured Instagram leads and CRM interaction histories.
- `server/data/backups/`: Full JSON state snapshots with timestamps.

### Atomic Writes
All file writes use atomic replacement (`.tmp` write followed by atomic `rename`) to prevent database corruption during server restarts or power interruptions.

### Generating Backups
- Via UI: Navigate to **Daily Operating System** -> **Production Health & Persistence** -> Click **"Trigger Backup"**.
- Via API: Send a POST request to `/api/system/backup`.

---

## 9. Health Monitoring Endpoints

The server exposes standard observability endpoints for load balancers, uptime monitors, and Kubernetes probes:

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Uptime, memory usage, timestamp, environment status. |
| `/api/ready` | `GET` | Readiness probe verifying persistent storage readability. |
| `/api/system/storage` | `GET` | Count of persisted runs, scheduled jobs, leads, and backup archives. |
| `/api/system/media-url-status` | `GET` | Verifies whether `PUBLIC_BASE_URL` satisfies Meta Graph API HTTPS requirements. |
| `/api/system/environment` | `GET` | Masked configuration status report (zero secrets leaked). |

---

## 10. Safety & Compliance Controls

- **Mandatory Human-in-the-Loop**: Pre-publishing QC and explicit human approval remain enabled by default.
- **Fail-Safe Missed Jobs**: If the server experiences downtime during a scheduled publish window, missed jobs are flagged as `MISSED` upon restart rather than flooding Instagram with backlog posts.
- **Rate Limiting**: Critical endpoints are protected by IP-based rate limiting (120 req/min).
