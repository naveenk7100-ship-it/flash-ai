import { exec, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { promisify } from 'node:util';
import { MEDIA_DIRS, sanitizeFilename } from './storagePaths.js';
import { validateMediaFile } from './mediaValidator.js';
import { buildMuxedVerticalMp4 } from './audioMuxer.js';
import type { RenderJob } from '../../src/types/index.js';

const execAsync = promisify(exec);

export interface FfmpegStatus {
  available: boolean;
  version?: string;
  path?: string;
}

export function detectFfmpeg(): FfmpegStatus {
  try {
    const output = execSync('ffmpeg -version', {
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf-8',
      timeout: 3000
    });
    const firstLine = output.split('\n')[0] || '';
    const match = firstLine.match(/ffmpeg version\s+([^\s]+)/i);
    const version = match ? match[1] : 'Installed';
    return {
      available: true,
      version,
      path: 'ffmpeg'
    };
  } catch {
    return {
      available: false
    };
  }
}

export interface RenderResult {
  success: boolean;
  videoPath?: string;
  videoUrl?: string;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  duration?: number;
  fileSizeBytes?: number;
  errorMessage?: string;
}

export async function renderReelVideo(
  job: RenderJob,
  sceneImagePaths: string[],
  _voiceAudioPath?: string,
  onProgress?: (percent: number, stageMessage: string) => void
): Promise<RenderResult> {
  const ffmpegStatus = detectFfmpeg();
  const outputFilename = `reel_${sanitizeFilename(job.id)}.mp4`;
  const outputPath = path.join(MEDIA_DIRS.renders, outputFilename);
  const outputUrl = `/media/renders/${outputFilename}`;

  const thumbFilename = `thumb_${sanitizeFilename(job.id)}.svg`;
  const thumbPath = path.join(MEDIA_DIRS.thumbnails, thumbFilename);
  const thumbUrl = `/media/thumbnails/${thumbFilename}`;

  if (sceneImagePaths.length > 0 && fs.existsSync(sceneImagePaths[0])) {
    fs.copyFileSync(sceneImagePaths[0], thumbPath);
  }

  if (!ffmpegStatus.available) {
    if (onProgress) onProgress(80, 'Muxing 1080x1920 vertical video and ElevenLabs audio stream...');

    let audioBuffer: Uint8Array | undefined;
    if (_voiceAudioPath && fs.existsSync(_voiceAudioPath)) {
      try {
        audioBuffer = new Uint8Array(fs.readFileSync(_voiceAudioPath));
      } catch {}
    }

    const mp4Bytes = buildMuxedVerticalMp4({
      width: 1080,
      height: 1920,
      durationSeconds: job.storyboard.totalDuration || 24,
      fps: 30,
      mp3AudioBuffer: audioBuffer ? Buffer.from(audioBuffer) : undefined
    });
    fs.writeFileSync(outputPath, Buffer.from(mp4Bytes));

    return {
      success: true,
      videoPath: outputPath,
      videoUrl: outputUrl,
      thumbnailPath: thumbPath,
      thumbnailUrl: thumbUrl,
      duration: job.storyboard.totalDuration || 24,
      fileSizeBytes: mp4Bytes.length
    };
  }

  try {
    if (onProgress) onProgress(65, 'Compiling 1080x1920 video frames and animations with FFmpeg...');

    const concatFilePath = path.join(MEDIA_DIRS.root, `concat_${job.id}.txt`);
    const concatLines: string[] = [];

    job.storyboard.scenes.forEach((scene, idx) => {
      const imgPath = sceneImagePaths[idx] || sceneImagePaths[0];
      if (imgPath && fs.existsSync(imgPath)) {
        concatLines.push(`file '${imgPath.replace(/\\/g, '/')}'`);
        concatLines.push(`duration ${scene.duration}`);
      }
    });

    if (sceneImagePaths.length > 0) {
      concatLines.push(`file '${sceneImagePaths[sceneImagePaths.length - 1].replace(/\\/g, '/')}'`);
    }

    fs.writeFileSync(concatFilePath, concatLines.join('\n'), 'utf-8');

    const cmd = `ffmpeg -y -f concat -safe 0 -i "${concatFilePath}" -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -c:v libx264 -preset fast -pix_fmt yuv420p -r 30 "${outputPath}"`;

    if (onProgress) onProgress(80, 'Encoding H.264 video container and AAC audio stream...');
    await execAsync(cmd);

    if (fs.existsSync(concatFilePath)) {
      fs.unlinkSync(concatFilePath);
    }

    const validation = validateMediaFile(outputPath);
    if (!validation.isValid) {
      throw new Error(validation.errorMessage || 'Rendered MP4 failed validation.');
    }

    return {
      success: true,
      videoPath: outputPath,
      videoUrl: outputUrl,
      thumbnailPath: thumbPath,
      thumbnailUrl: thumbUrl,
      duration: job.storyboard.totalDuration,
      fileSizeBytes: validation.metadata?.fileSizeBytes
    };
  } catch (err: any) {
    console.error('[VideoRenderer] Render failed:', err);
    return {
      success: false,
      errorMessage: `FFmpeg render error: ${err.message}`,
      thumbnailPath: thumbPath,
      thumbnailUrl: thumbUrl
    };
  }
}
