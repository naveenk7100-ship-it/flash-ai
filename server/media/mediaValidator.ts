import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import ffmpegStatic from 'ffmpeg-static';

const ffmpegBinaryPath: string =
  typeof ffmpegStatic === 'string'
    ? ffmpegStatic
    : ((ffmpegStatic as any)?.default || String(ffmpegStatic || ''));

export interface Mp4StreamReport {
  isValidMp4: boolean;
  hasVideoStream: boolean;
  hasAudioStream: boolean;
  videoWidth: number;
  videoHeight: number;
  videoDurationSeconds: number;
  audioDurationSeconds: number;
  audioCodec?: string;
  audioBitrateKbps?: number;
  audioChannels?: number;
  audioSampleRate?: number;
  isVertical9x16: boolean;
  totalSizeBytes: number;
  hasDecodeError: boolean;
  decodeErrorDetails?: string;
  isAudible: boolean;
  maxVolumeDb: number;
  meanVolumeDb: number;
  isBlackFrames: boolean;
  blackFramesRatio?: number;
  durationSyncOk: boolean;
  errors: string[];
}

export class MediaValidator {
  public static inspectMp4File(filePath: string): Mp4StreamReport {
    const report: Mp4StreamReport = {
      isValidMp4: false,
      hasVideoStream: false,
      hasAudioStream: false,
      videoWidth: 0,
      videoHeight: 0,
      videoDurationSeconds: 0,
      audioDurationSeconds: 0,
      isVertical9x16: false,
      totalSizeBytes: 0,
      hasDecodeError: false,
      isAudible: false,
      maxVolumeDb: -99,
      meanVolumeDb: -99,
      isBlackFrames: false,
      durationSyncOk: true,
      errors: []
    };

    if (!fs.existsSync(filePath)) {
      report.errors.push(`File not found at: ${filePath}`);
      return report;
    }

    const fileStat = fs.statSync(filePath);
    report.totalSizeBytes = fileStat.size;

    if (report.totalSizeBytes < 100_000) {
      report.errors.push(`File size is too small for production Reel (${(report.totalSizeBytes / 1024).toFixed(1)} KB; minimum 100 KB required).`);
      return report;
    }

    // Read header for ISO BMFF compliance
    const fd = fs.openSync(filePath, 'r');
    const headerBuffer = Buffer.alloc(Math.min(fileStat.size, 1024 * 1024 * 2)); // Read first 2MB for box tree
    fs.readSync(fd, headerBuffer, 0, headerBuffer.length, 0);
    fs.closeSync(fd);

    // Check ftyp
    const ftypSize = headerBuffer.readUInt32BE(0);
    const ftypType = headerBuffer.toString('ascii', 4, 8);
    if (ftypType !== 'ftyp' || ftypSize < 16) {
      report.errors.push('Missing or invalid ftyp box.');
      return report;
    }

    report.isValidMp4 = true;

    // Scan box tree for basic stream metadata
    let offset = 0;
    while (offset < headerBuffer.length - 8) {
      const boxSize = headerBuffer.readUInt32BE(offset);
      const boxType = headerBuffer.toString('ascii', offset + 4, offset + 8);
      if (boxSize <= 0 || offset + boxSize > headerBuffer.length + 8) break;

      if (boxType === 'moov') {
        this.parseMoov(headerBuffer.subarray(offset + 8, offset + boxSize), report);
      }
      offset += boxSize;
    }

    // Deep FFmpeg Stream Integrity Validation
    if (ffmpegBinaryPath && fs.existsSync(ffmpegBinaryPath)) {
      try {
        // 1. Full Stream Decode Pass (catches corrupt NAL units, incomplete bitstreams, broken moov)
        const decodeCheck = spawnSync(
          ffmpegBinaryPath,
          ['-v', 'error', '-i', filePath, '-f', 'null', '-'],
          { encoding: 'utf8', timeout: 15000 }
        );

        if (decodeCheck.status !== 0 || (decodeCheck.stderr && (
          decodeCheck.stderr.includes('missing picture in access unit') ||
          decodeCheck.stderr.includes('No start code') ||
          decodeCheck.stderr.includes('Invalid data') ||
          decodeCheck.stderr.includes('moov atom not found') ||
          decodeCheck.stderr.includes('Error')
        ))) {
          report.hasDecodeError = true;
          report.isValidMp4 = false;
          report.decodeErrorDetails = (decodeCheck.stderr || `Exit code ${decodeCheck.status}`).trim().slice(0, 300);
          report.errors.push(`FFmpeg decode error: ${report.decodeErrorDetails}`);
        }

        // 2. Audio Loudness & Speech Presence Verification
        const volumeCheck = spawnSync(
          ffmpegBinaryPath,
          ['-i', filePath, '-af', 'volumedetect', '-f', 'null', '-'],
          { encoding: 'utf8', timeout: 12000 }
        );

        const durMatch = (volumeCheck.stderr || '').match(/Duration:\s*(\d+):(\d+):([-\d.]+)/);
        if (durMatch) {
          const hours = parseFloat(durMatch[1]);
          const mins = parseFloat(durMatch[2]);
          const secs = parseFloat(durMatch[3]);
          const totalSecs = hours * 3600 + mins * 60 + secs;
          if (totalSecs > 0) {
            report.videoDurationSeconds = parseFloat(totalSecs.toFixed(2));
          }
        }

        const maxVolMatch = (volumeCheck.stderr || '').match(/max_volume:\s*([-\d.]+)\s*dB/);
        const meanVolMatch = (volumeCheck.stderr || '').match(/mean_volume:\s*([-\d.]+)\s*dB/);

        if (maxVolMatch && maxVolMatch[1]) {
          report.maxVolumeDb = parseFloat(maxVolMatch[1]);
          report.hasAudioStream = true;
        }
        if (meanVolMatch && meanVolMatch[1]) {
          report.meanVolumeDb = parseFloat(meanVolMatch[1]);
        }

        if (report.hasAudioStream) {
          report.isAudible = report.maxVolumeDb > -35.0;
          if (!report.isAudible) {
            report.errors.push(`Narration is inaudible or silent (max volume: ${report.maxVolumeDb} dB, must exceed -35 dB).`);
          }
        } else {
          report.errors.push('No valid audio stream detected in MP4 container.');
        }

        // 3. Black Frame Detection
        const blackCheck = spawnSync(
          ffmpegBinaryPath,
          ['-i', filePath, '-vf', 'blackdetect=d=1.0:pix_th=0.10', '-f', 'null', '-'],
          { encoding: 'utf8', timeout: 12000 }
        );

        const blackDurMatches = (blackCheck.stderr || '').matchAll(/black_duration:\s*([-\d.]+)/g);
        let totalBlackSeconds = 0;
        for (const m of blackDurMatches) {
          if (m[1]) totalBlackSeconds += parseFloat(m[1]);
        }

        if (report.videoDurationSeconds > 0 && totalBlackSeconds > report.videoDurationSeconds * 0.5) {
          report.isBlackFrames = true;
          report.blackFramesRatio = parseFloat((totalBlackSeconds / report.videoDurationSeconds).toFixed(2));
          report.errors.push(`Video is predominantly black frames (${totalBlackSeconds.toFixed(1)}s of ${report.videoDurationSeconds}s).`);
        }
      } catch (ffErr: any) {
        // Fall back gracefully if child process timed out
        report.errors.push(`Deep stream verification inspection notice: ${ffErr?.message || ffErr}`);
      }
    }

    report.isVertical9x16 =
      report.videoWidth > 0 &&
      report.videoHeight > 0 &&
      Math.abs(report.videoHeight / report.videoWidth - 16 / 9) < 0.15;

    if (report.videoWidth > 0 && !report.isVertical9x16) {
      report.errors.push(`Video is not 9:16 vertical format (${report.videoWidth}x${report.videoHeight}).`);
    }

    if (report.videoDurationSeconds > 0 && report.audioDurationSeconds > 0) {
      report.durationSyncOk = Math.abs(report.videoDurationSeconds - report.audioDurationSeconds) < 3.0;
      if (!report.durationSyncOk) {
        report.errors.push(`Audio and video duration desynchronized (video: ${report.videoDurationSeconds}s, audio: ${report.audioDurationSeconds}s).`);
      }
    }

    return report;
  }

  private static parseMoov(moovBuffer: Buffer, report: Mp4StreamReport): void {
    let offset = 0;
    while (offset < moovBuffer.length - 8) {
      const boxSize = moovBuffer.readUInt32BE(offset);
      const boxType = moovBuffer.toString('ascii', offset + 4, offset + 8);
      if (boxSize <= 0 || offset + boxSize > moovBuffer.length) break;

      if (boxType === 'mvhd') {
        const timescale = moovBuffer.readUInt32BE(offset + 12 + 8);
        const duration = moovBuffer.readUInt32BE(offset + 12 + 12);
        if (timescale > 0) {
          report.videoDurationSeconds = parseFloat((duration / timescale).toFixed(2));
        }
      } else if (boxType === 'trak') {
        this.parseTrak(moovBuffer.subarray(offset + 8, offset + boxSize), report);
      }

      offset += boxSize;
    }
  }

  private static parseTrak(trakBuffer: Buffer, report: Mp4StreamReport): void {
    let isVideo = false;
    let isAudio = false;
    let trackWidth = 0;
    let trackHeight = 0;
    let sampleCount = 0;
    let audioSampleRate = 44100;
    let audioChannels = 2;
    let audioCodec = 'AAC / MP4A';
    let isAac = true;

    let offset = 0;
    while (offset < trakBuffer.length - 8) {
      const boxSize = trakBuffer.readUInt32BE(offset);
      const boxType = trakBuffer.toString('ascii', offset + 4, offset + 8);
      if (boxSize <= 0 || offset + boxSize > trakBuffer.length) break;

      if (boxType === 'tkhd') {
        // Dimensions in 16.16 fixed point
        if (boxSize >= 84) {
          trackWidth = trakBuffer.readUInt32BE(offset + boxSize - 8) >>> 16;
          trackHeight = trakBuffer.readUInt32BE(offset + boxSize - 4) >>> 16;
        }
      } else if (boxType === 'mdia') {
        const mdiaBuf = trakBuffer.subarray(offset + 8, offset + boxSize);
        let mOffset = 0;
        while (mOffset < mdiaBuf.length - 8) {
          const mSize = mdiaBuf.readUInt32BE(mOffset);
          const mType = mdiaBuf.toString('ascii', mOffset + 4, mOffset + 8);
          if (mSize <= 0 || mOffset + mSize > mdiaBuf.length) break;

          if (mType === 'hdlr') {
            const subtype = mdiaBuf.toString('ascii', mOffset + 16, mOffset + 20);
            if (subtype === 'vide') isVideo = true;
            if (subtype === 'soun') isAudio = true;
          } else if (mType === 'minf') {
            const minfBuf = mdiaBuf.subarray(mOffset + 8, mOffset + mSize);
            let sOffset = 0;
            while (sOffset < minfBuf.length - 8) {
              const sSize = minfBuf.readUInt32BE(sOffset);
              const sType = minfBuf.toString('ascii', sOffset + 4, sOffset + 8);
              if (sSize <= 0 || sOffset + sSize > minfBuf.length) break;

              if (sType === 'stbl') {
                const stblBuf = minfBuf.subarray(sOffset + 8, sOffset + sSize);
                let tOffset = 0;
                while (tOffset < stblBuf.length - 8) {
                  const tSize = stblBuf.readUInt32BE(tOffset);
                  const tType = stblBuf.toString('ascii', tOffset + 4, tOffset + 8);
                  if (tSize <= 0 || tOffset + tSize > stblBuf.length) break;

                  if (tType === 'stsz') {
                    sampleCount = stblBuf.readUInt32BE(tOffset + 16);
                  } else if (tType === 'stsd') {
                    if (stblBuf.length >= tOffset + 40) {
                      const codec = stblBuf.toString('ascii', tOffset + 16, tOffset + 20);
                      if (codec === '.mp3' || codec === 'mp4a') {
                        isAac = codec !== '.mp3';
                        audioCodec = codec === '.mp3' ? 'MPEG-1 Audio Layer 3 (MP3)' : 'AAC / MP4A';
                        report.audioCodec = audioCodec;
                        audioChannels = stblBuf.readUInt16BE(tOffset + 32) || 2;
                        audioSampleRate = (stblBuf.readUInt32BE(tOffset + 40) >>> 16) || 44100;
                      }
                    }
                  }
                  tOffset += tSize;
                }
              }
              sOffset += sSize;
            }
          }
          mOffset += mSize;
        }
      }
      offset += boxSize;
    }

    if (isVideo && trackWidth > 0 && trackHeight > 0) {
      report.hasVideoStream = true;
      report.videoWidth = trackWidth;
      report.videoHeight = trackHeight;
    }

    if (isAudio && sampleCount > 0) {
      report.hasAudioStream = true;
      report.audioChannels = audioChannels;
      report.audioSampleRate = audioSampleRate;
      report.audioBitrateKbps = 128;
      const samplesPerFrame = isAac ? 1024 : 1152;
      report.audioDurationSeconds = parseFloat(((sampleCount * samplesPerFrame) / audioSampleRate).toFixed(2));
      if (!report.audioCodec) report.audioCodec = audioCodec;
    }
  }
}

export function validateMediaFile(filePath: string): {
  isValid: boolean;
  exists: boolean;
  size: number;
  errorMessage?: string;
  metadata?: {
    fileSizeBytes: number;
    width: number;
    height: number;
    durationSeconds: number;
    hasVideoStream: boolean;
    hasAudioStream: boolean;
    isAudible: boolean;
    maxVolumeDb: number;
  };
  errors: string[];
} {
  const report = MediaValidator.inspectMp4File(filePath);
  const isValid =
    report.isValidMp4 &&
    report.hasVideoStream &&
    report.hasAudioStream &&
    !report.hasDecodeError &&
    report.isAudible &&
    !report.isBlackFrames &&
    report.totalSizeBytes >= 100_000 &&
    report.isVertical9x16 &&
    report.errors.length === 0;

  return {
    isValid,
    exists: fs.existsSync(filePath),
    size: report.totalSizeBytes,
    errorMessage: report.errors.length > 0 ? report.errors.join('; ') : undefined,
    metadata: {
      fileSizeBytes: report.totalSizeBytes,
      width: report.videoWidth,
      height: report.videoHeight,
      durationSeconds: report.videoDurationSeconds,
      hasVideoStream: report.hasVideoStream,
      hasAudioStream: report.hasAudioStream,
      isAudible: report.isAudible,
      maxVolumeDb: report.maxVolumeDb
    },
    errors: report.errors
  };
}
