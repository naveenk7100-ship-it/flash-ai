/**
 * FLASH.Ai Audio Layer Engine (Phase 2 - Requirement 6)
 * 
 * Supports:
 * - Background music selection and audio ducking
 * - Voiceover generation and speed/volume control
 * - Sound effects (whoosh, pop, click, chime)
 * - Safe procedural sound synthesis via Web Audio API (zero external assets needed)
 */

import type {
  AudioTrackConfig,
  SoundEffectType,
  ProductionTimelineScene
} from '../types/reelProduction';
import { ROYALTY_FREE_TRACKS } from '../../server/media/musicLibrary';

export class AudioEngine {
  private audioCtx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Builds the default audio track configuration for a Reel.
   */
  public createAudioConfig(params: {
    scenes: ProductionTimelineScene[];
    preferredMusicTrackId?: string;
  }): AudioTrackConfig {
    const { scenes, preferredMusicTrackId } = params;

    const defaultTrack =
      ROYALTY_FREE_TRACKS.find((t: any) => t.id === preferredMusicTrackId) ||
      ROYALTY_FREE_TRACKS[0];

    // Sound effects mapped at scene cut transitions
    const soundEffects: AudioTrackConfig['soundEffects'] = scenes.map((scene, idx) => ({
      id: `sfx-${scene.id}-${idx}`,
      sceneNumber: idx + 1,
      timeSeconds: scene.startTimeSeconds,
      sfx: scene.audioSettings.sfxType || (idx === 0 ? 'whoosh' : 'click'),
      volume: 0.7
    }));

    return {
      music: {
        enabled: true,
        trackId: defaultTrack.id,
        trackName: defaultTrack.name,
        trackUrl: defaultTrack.url,
        volume: 0.16, // Clean background ducked level
        fadeInSeconds: 0.8,
        fadeOutSeconds: 1.5,
        duckingEnabled: true
      },
      voiceover: {
        enabled: true,
        provider: 'demo',
        voiceId: 'TX3LPaxmHKxFdv7VOQHJ',
        volume: 1.0,
        speed: 1.05
      },
      soundEffects
    };
  }

  /**
   * Plays a procedural creator sound effect using Web Audio API synthesis.
   * Completely offline, safe, and works in any modern browser.
   */
  public playProceduralSfx(type: SoundEffectType, volume: number = 0.5): void {
    if (type === 'none') return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'whoosh') {
        // Frequency sweep downwards with bandpass filter
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'pop') {
        // High-pitched bubble pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(250, now + 0.08);
        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'click') {
        // Subtle mechanical tech click
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.setValueAtTime(400, now + 0.02);
        gain.gain.setValueAtTime(volume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'chime') {
        // Success chord / positive bell
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(volume * 0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch {
      // AudioContext unavailable or blocked by autoplay
    }
  }

  /**
   * Synthesizes spoken voiceover via browser Web Speech API in demo mode.
   */
  public speakDemoVoiceover(text: string, onEnd?: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.08;
    utterance.pitch = 1.0;
    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  }

  public stopAllAudio(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const audioEngine = new AudioEngine();
