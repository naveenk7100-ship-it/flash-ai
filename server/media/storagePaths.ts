import fs from 'node:fs';
import path from 'node:path';

export const MEDIA_ROOT = path.resolve(process.cwd(), 'media');

export const MEDIA_DIRS = {
  root: MEDIA_ROOT,
  assets: path.join(MEDIA_ROOT, 'assets'),
  audio: path.join(MEDIA_ROOT, 'audio'),
  music: path.join(MEDIA_ROOT, 'music'),
  subtitles: path.join(MEDIA_ROOT, 'subtitles'),
  renders: path.join(MEDIA_ROOT, 'renders'),
  thumbnails: path.join(MEDIA_ROOT, 'thumbnails')
};

// Ensure all media subdirectories exist
export function initMediaStorage(): void {
  Object.values(MEDIA_DIRS).forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
}

// Sanitize filename to prevent directory traversal
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Get storage metrics
export function getStorageStats(): {
  assetsCount: number;
  rendersCount: number;
  totalSizeBytes: number;
} {
  initMediaStorage();
  let totalSizeBytes = 0;
  let assetsCount = 0;
  let rendersCount = 0;

  try {
    if (fs.existsSync(MEDIA_DIRS.assets)) {
      const files = fs.readdirSync(MEDIA_DIRS.assets);
      assetsCount = files.length;
      files.forEach((f) => {
        const stats = fs.statSync(path.join(MEDIA_DIRS.assets, f));
        totalSizeBytes += stats.size;
      });
    }

    if (fs.existsSync(MEDIA_DIRS.renders)) {
      const files = fs.readdirSync(MEDIA_DIRS.renders);
      rendersCount = files.length;
      files.forEach((f) => {
        const stats = fs.statSync(path.join(MEDIA_DIRS.renders, f));
        totalSizeBytes += stats.size;
      });
    }
  } catch (err) {
    console.error('[MediaStorage] Error reading storage stats:', err);
  }

  return {
    assetsCount,
    rendersCount,
    totalSizeBytes
  };
}
