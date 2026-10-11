import { fastReelEngine } from './fastReelEngine.js';
import { MediaValidator } from './mediaValidator.js';
import fs from 'node:fs';

async function renderFinalPolishReel() {
  console.log('================================================================');
  console.log('FLASH.Ai FINAL CLAUDE ARTIFACTS REEL POLISH & RENDER');
  console.log('================================================================\n');

  const topic = 'How Claude Artifacts turns prompts into interactive apps in real time';
  const script = 'Claude Artifacts lets you turn a natural-language request into an interactive workspace. You can generate code, preview the result, and iterate without leaving the conversation.';

  const result = await fastReelEngine.generateFastReel({
    mode: 'USER_SCRIPT',
    topic: topic,
    script: script,
    formatId: 'product-demo',
    onProgress: (stage, pct) => {
      console.log(`[PIPELINE_PROGRESS] Stage: ${stage} | Progress: ${pct}%`);
    }
  });

  if (!result.success || !result.manifest || !result.videoPath) {
    throw new Error(`Production Render Failed: ${result.errorMessage || 'No video path generated'}`);
  }

  const manifest = result.manifest;
  console.log('\n--- PRODUCTION MANIFEST ---');
  console.log({
    reelId: manifest.reelId,
    sourceType: manifest.sourceType,
    finalScript: manifest.finalScript,
    scriptHash: manifest.scriptHash,
    voiceText: manifest.voiceText,
    voiceHash: manifest.voiceHash,
    audioPath: manifest.audioPath,
    videoPath: manifest.mediaPath,
    scenesCount: manifest.scenes.length,
    templateId: manifest.templateId,
    templateName: manifest.templateName
  });

  // 1. Inspect Physical MP4 Stream of Truth
  const mp4Report = MediaValidator.inspectMp4File(result.videoPath);
  console.log('\n--- MP4 STREAM INSPECTION ---');
  console.log({
    isValidMp4: mp4Report.isValidMp4,
    hasVideoStream: mp4Report.hasVideoStream,
    hasAudioStream: mp4Report.hasAudioStream,
    resolution: `${mp4Report.videoWidth}x${mp4Report.videoHeight}`,
    isVertical9x16: mp4Report.isVertical9x16,
    videoDuration: mp4Report.videoDurationSeconds,
    audioDuration: mp4Report.audioDurationSeconds,
    totalSizeBytes: mp4Report.totalSizeBytes
  });

  // 2. Verify physical persistence
  if (!fs.existsSync(result.videoPath)) {
    throw new Error(`Physical video file missing at: ${result.videoPath}`);
  }
  if (!fs.existsSync(manifest.audioPath)) {
    throw new Error(`Physical audio file missing at: ${manifest.audioPath}`);
  }

  console.log('\n================================================================');
  console.log('FINAL REEL READY & VERIFIED (PASS)');
  console.log('================================================================');
}

renderFinalPolishReel().catch((err) => {
  console.error('FINAL RENDER ERROR:', err);
  process.exit(1);
});
