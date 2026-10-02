import type { SubtitleCue, StoryboardScene } from '../../src/types/index.js';

export function generateSubtitleCues(scenes: StoryboardScene[]): SubtitleCue[] {
  const cues: SubtitleCue[] = [];

  scenes.forEach((scene) => {
    const text = (scene.speechText || scene.onScreenText || '').trim();
    if (!text) return;

    const cleanText = text.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim();
    if (!cleanText) return;

    const words = cleanText.split(/\s+/).filter(Boolean);
    if (words.length === 0) return;

    const CHUNK_SIZE = 4;
    const totalChunks = Math.ceil(words.length / CHUNK_SIZE);
    const sceneDuration = Math.max(1, scene.endTime - scene.startTime);
    const chunkDuration = sceneDuration / totalChunks;

    for (let i = 0; i < totalChunks; i++) {
      const chunkWords = words.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const startTime = scene.startTime + i * chunkDuration;
      const endTime = i === totalChunks - 1 ? scene.endTime : startTime + chunkDuration;

      const emphasisWords = chunkWords.filter(
        (w) =>
          /^[A-Z0-9]/.test(w) ||
          /\b(AI|ROI|automate|fast|zero|hours|free|revenue|instant|workflow)\b/i.test(w)
      );

      cues.push({
        id: `cue-${scene.id}-${i + 1}`,
        sceneId: scene.id,
        startTime: +startTime.toFixed(2),
        endTime: +endTime.toFixed(2),
        text: chunkWords.join(' '),
        emphasisWords: emphasisWords.length > 0 ? emphasisWords : undefined
      });
    }
  });

  return cues;
}

export function formatToWebVTT(cues: SubtitleCue[]): string {
  let vtt = 'WEBVTT\n\n';
  cues.forEach((cue, index) => {
    const start = formatVttTimestamp(cue.startTime);
    const end = formatVttTimestamp(cue.endTime);
    vtt += `${index + 1}\n${start} --> ${end}\n${cue.text}\n\n`;
  });
  return vtt;
}

function formatVttTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  const mss = String(ms).padStart(3, '0');

  return `${hh}:${mm}:${ss}.${mss}`;
}
