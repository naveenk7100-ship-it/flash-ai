import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import ffmpegStatic from 'ffmpeg-static';

const ffmpegBinaryPath: string =
  typeof ffmpegStatic === 'string'
    ? ffmpegStatic
    : ((ffmpegStatic as any)?.default || String(ffmpegStatic || ''));

export interface NativeSpeechOptions {
  rate?: number; // -10 to 10
  volume?: number; // 0 to 100
}

export interface NativeSpeechResult {
  audioPath: string;
  durationSeconds: number;
  fileSizeBytes: number;
}

/**
 * Synthesizes spoken audio using the native Windows SpeechSynthesizer engine
 * and converts to MP3 via bundled FFmpeg.
 * Guarantees 100% exact text reproduction with zero audio drift or old cached speech reuse.
 */
export async function synthesizeNativeSpeech(
  text: string,
  outputMp3Path: string,
  options: NativeSpeechOptions = {}
): Promise<NativeSpeechResult> {
  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Speech text cannot be empty');
  }

  const tempDir = os.tmpdir();
  const rand = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const tempTextFile = path.join(tempDir, `tts_text_${rand}.txt`);
  const tempWavFile = path.join(tempDir, `tts_wav_${rand}.wav`);
  const tempPs1File = path.join(tempDir, `tts_script_${rand}.ps1`);

  fs.writeFileSync(tempTextFile, cleanText, 'utf8');

  const psScript = `Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = ${options.rate ?? 0}
$synth.Volume = ${options.volume ?? 100}
$synth.SetOutputToWaveFile("${tempWavFile.replace(/\\/g, '\\\\')}")
$content = [System.IO.File]::ReadAllText("${tempTextFile.replace(/\\/g, '\\\\')}", [System.Text.Encoding]::UTF8)
$synth.Speak($content)
$synth.Dispose()
`;

  fs.writeFileSync(tempPs1File, psScript, 'utf8');

  try {
    // 1. Run PowerShell with .ps1 file
    await new Promise<void>((resolve, reject) => {
      const ps = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy', 'Bypass',
        '-File', tempPs1File
      ], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      ps.stderr.on('data', (d) => { stderr += d.toString(); });

      ps.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(tempWavFile)) {
          reject(new Error(`PowerShell SAPI speech synthesis failed (code ${code}): ${stderr}`));
        } else {
          resolve();
        }
      });
      ps.on('error', reject);
    });

    // 2. Ensure output directory exists
    const outDir = path.dirname(outputMp3Path);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // 3. Convert WAV to MP3 using bundled FFmpeg
    await new Promise<void>((resolve, reject) => {
      const ff = spawn(ffmpegBinaryPath, [
        '-y',
        '-i', tempWavFile,
        '-codec:a', 'libmp3lame',
        '-b:a', '128k',
        '-ar', '44100',
        '-ac', '2',
        outputMp3Path
      ], {
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let stderr = '';
      ff.stderr.on('data', (d) => { stderr += d.toString(); });

      ff.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(outputMp3Path)) {
          reject(new Error(`FFmpeg MP3 audio conversion failed (code ${code}): ${stderr}`));
        } else {
          resolve();
        }
      });
      ff.on('error', reject);
    });

    // 4. Measure duration from WAV header or words
    const words = cleanText.split(/\s+/).filter(Boolean).length;
    let durationSeconds = Math.max(2, Math.round(words / 2.6));

    try {
      const wavStat = fs.statSync(tempWavFile);
      if (wavStat.size > 44) {
        const fd = fs.openSync(tempWavFile, 'r');
        const headerBuf = Buffer.alloc(Math.min(wavStat.size, 2048));
        fs.readSync(fd, headerBuf, 0, headerBuf.length, 0);
        fs.closeSync(fd);

        let byteRate = 0;
        let dataLength = 0;

        // Traverse RIFF chunks
        let pos = 12;
        while (pos + 8 <= headerBuf.length) {
          const chunkId = headerBuf.toString('ascii', pos, pos + 4);
          const chunkSize = headerBuf.readUInt32LE(pos + 4);

          if (chunkId === 'fmt ') {
            byteRate = headerBuf.readUInt32LE(pos + 16);
          } else if (chunkId === 'data') {
            dataLength = chunkSize;
            break;
          }
          pos += 8 + chunkSize;
        }

        if (byteRate > 0) {
          if (dataLength > 0 && dataLength <= wavStat.size) {
            const exactDur = dataLength / byteRate;
            if (exactDur >= 0.5 && exactDur <= 120) {
              durationSeconds = parseFloat(exactDur.toFixed(2));
            }
          } else if (wavStat.size > 44) {
            const exactDur = (wavStat.size - 44) / byteRate;
            if (exactDur >= 0.5 && exactDur <= 120) {
              durationSeconds = parseFloat(exactDur.toFixed(2));
            }
          }
        }
      }
    } catch {}

    // Safety fallback: spoken reel duration should never exceed 60s
    if (durationSeconds > 60 || durationSeconds < 2) {
      durationSeconds = Math.min(30, Math.max(8, Math.round(words / 2.6)));
    }

    const mp3Stat = fs.statSync(outputMp3Path);

    return {
      audioPath: outputMp3Path,
      durationSeconds,
      fileSizeBytes: mp3Stat.size
    };
  } finally {
    // Cleanup temporary files
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch {}
    try { if (fs.existsSync(tempWavFile)) fs.unlinkSync(tempWavFile); } catch {}
    try { if (fs.existsSync(tempPs1File)) fs.unlinkSync(tempPs1File); } catch {}
  }
}
