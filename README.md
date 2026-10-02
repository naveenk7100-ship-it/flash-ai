# FLASH.Ai — Autonomous Instagram Social Operations Command Center

[![Deploy FLASH.Ai to GitHub Pages](https://github.com/naveenk7100-ship-it/flash-ai/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/naveenk7100-ship-it/flash-ai/actions/workflows/deploy-pages.yml)

> **High-Conversion AI Discovery Reels on Autopilot** for **@flash__ai__digital**.  
> Features 10-Stage Content Pipeline, 12 Topic-Aware 9:16 Video Templates, Native Resvg + FFmpeg Pixel Rasterization, ElevenLabs Gen-Z Voiceover, and Mandatory Human Review Safety Gate.

---

## 🌟 Key Architecture & Capabilities

1. **AI Discovery & Trend Mining**: Autonomous analysis of high-growth AI tools, workflows, and benchmarks for tech founders, local clinics, and SMBs.
2. **Topic-Aware Template Engine v2**: 12 deterministic 9:16 video templates dynamically matched to content intents.
3. **Studio Voice Synthesis**: Studio-quality voiceover narration via ElevenLabs Liam (`TX3LPaxmHKxFdv7VOQHJ`, normalized to -8.5 dB AAC).
4. **Native 1080x1920 MP4 Video Renderer**: Scalable vector UI composition rasterized to pixel frames via `@resvg/resvg-js` and encoded with `ffmpeg-static`.
5. **10-Gate Quality Assurance**: Automated compliance inspection checking aspect ratio, safe zones, text contrast, and audio synchronization.
6. **Mandatory Human Review Gate**: Zero unapproved posts invariant (`REQUIRE_HUMAN_APPROVAL = true`).
7. **21:00 Asia/Kolkata Scheduler**: Precision automated daily publishing targeting peak audience engagement.
8. **Meta Graph API v21.0**: Direct container creation and publishing to Instagram Reels.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Video Composition**: `@resvg/resvg-js`, `ffmpeg-static`, HTML Canvas / SVG Engine
- **Voice Synthesis**: ElevenLabs AI Audio API
- **Social Integration**: Meta Graph API v21.0 (Instagram Reels Publishing)
- **Deployment**: GitHub Pages (via GitHub Actions)

---

## 🚀 Getting Started

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/naveenk7100-ship-it/flash-ai.git
cd flash-ai

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

### Production Build

```bash
# Type check and build static production bundle
npm run build
```

---

## 🔒 Security & Production Safety Invariants

- `REQUIRE_HUMAN_APPROVAL = true` (Mandatory operator approval required before 21:00 IST scheduled auto-publish).
- `DIRECT_AUTO_PUBLISH = false` (Strictly prevents unauthorized posts).
- All secret credentials, API keys, and access tokens are managed strictly server-side and never bundled in client distribution files.
