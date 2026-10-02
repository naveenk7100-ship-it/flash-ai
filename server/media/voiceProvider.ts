import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { MEDIA_DIRS } from './storagePaths.js';
import type { VoiceConfig } from '../../src/types/index.js';

export interface IVoiceProvider {
  name: string;
  isAvailable: boolean;
  generateSpeech(
    text: string,
    config: VoiceConfig
  ): Promise<{ audioUrl: string; localPath: string; duration: number }>;
}

export class SilentVoiceProvider implements IVoiceProvider {
  name = 'Silent / Local Voiceover Fallback';
  isAvailable = true;

  async generateSpeech(
    text: string,
    _config: VoiceConfig
  ): Promise<{ audioUrl: string; localPath: string; duration: number }> {
    const words = text.split(/\s+/).filter(Boolean).length;
    const estimatedDuration = Math.max(3, Math.round(words / 2.2));

    const filename = `voice_${Date.now()}_${randomUUID().slice(0, 8)}.wav`;
    const localPath = path.join(MEDIA_DIRS.audio, filename);

    const wavBuffer = createSilentWavBuffer(estimatedDuration);
    fs.writeFileSync(localPath, wavBuffer);

    return {
      audioUrl: `/media/audio/${filename}`,
      localPath,
      duration: estimatedDuration
    };
  }
}

export class GoogleTtsVoiceProvider implements IVoiceProvider {
  name = 'Google Cloud Text-to-Speech';
  isAvailable = !!process.env.GOOGLE_TTS_API_KEY;

  async generateSpeech(
    text: string,
    config: VoiceConfig
  ): Promise<{ audioUrl: string; localPath: string; duration: number }> {
    const fallback = new SilentVoiceProvider();
    return fallback.generateSpeech(text, config);
  }
}

import { elevenLabsProvider } from './providers/elevenLabsProvider.js';

export class ElevenLabsVoiceProvider implements IVoiceProvider {
  name = 'ElevenLabs AI High-Fidelity TTS';
  isAvailable = !!process.env.ELEVENLABS_API_KEY;

  async generateSpeech(
    text: string,
    config: VoiceConfig
  ): Promise<{ audioUrl: string; localPath: string; duration: number }> {
    const res = await elevenLabsProvider.generateSpeech(text, {
      voiceId: config.voiceId,
      speed: config.speed
    });

    return {
      audioUrl: res.audioUrl,
      localPath: res.audioPath,
      duration: res.durationSeconds
    };
  }
}

export function getVoiceProvider(type?: string): IVoiceProvider {
  if (type === 'google' && process.env.GOOGLE_TTS_API_KEY) {
    return new GoogleTtsVoiceProvider();
  }
  if ((type === 'elevenlabs' || !type || type === 'none') && elevenLabsProvider.isConfigured()) {
    return new ElevenLabsVoiceProvider();
  }
  if (type === 'elevenlabs') {
    return new ElevenLabsVoiceProvider();
  }
  return new SilentVoiceProvider();
}

function createSilentWavBuffer(durationSeconds: number): Buffer {
  const sampleRate = 44100;
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;
  const dataSize = Math.floor(sampleRate * durationSeconds * blockAlign);
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}
