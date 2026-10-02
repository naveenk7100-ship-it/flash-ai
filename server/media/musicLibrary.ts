import type { MusicTrack } from '../../src/types/index.js';

export const ROYALTY_FREE_TRACKS: MusicTrack[] = [
  {
    id: 'track-cyber-pulse',
    name: 'Cybernetic Velocity Pulse',
    genre: 'Synthwave / Tech Beat',
    mood: 'High Energy & Focused',
    url: '/media/music/cyber-pulse.mp3',
    duration: 60,
    isRoyaltyFree: true,
    author: 'FLASH.Ai Audio Labs'
  },
  {
    id: 'track-deep-focus-ai',
    name: 'Deep Neural Focus',
    genre: 'Ambient Lo-Fi Electronic',
    mood: 'Thoughtful & Analytical',
    url: '/media/music/deep-focus.mp3',
    duration: 60,
    isRoyaltyFree: true,
    author: 'FLASH.Ai Audio Labs'
  },
  {
    id: 'track-future-roi',
    name: 'Autonomous Momentum',
    genre: 'Modern Tech Bass Groove',
    mood: 'Authority & Business Confidence',
    url: '/media/music/autonomous-momentum.mp3',
    duration: 45,
    isRoyaltyFree: true,
    author: 'FLASH.Ai Audio Labs'
  },
  {
    id: 'track-tech-minimalist',
    name: 'Clean Silicon Minimal',
    genre: 'Subtle Tech Glitch / Minimal',
    mood: 'Clean & Crisp Demo',
    url: '/media/music/silicon-minimal.mp3',
    duration: 60,
    isRoyaltyFree: true,
    author: 'FLASH.Ai Audio Labs'
  }
];

export function getMusicTrackById(trackId?: string): MusicTrack | undefined {
  if (!trackId) return ROYALTY_FREE_TRACKS[0];
  return ROYALTY_FREE_TRACKS.find((t) => t.id === trackId) || ROYALTY_FREE_TRACKS[0];
}
