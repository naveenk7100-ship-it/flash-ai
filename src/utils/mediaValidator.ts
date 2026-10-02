import type { ContentItem, MediaType } from '../types';

export interface MediaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateMediaForPublishing(
  item: ContentItem,
  mediaUrl: string,
  mediaType: MediaType = 'REELS'
): MediaValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Media URL Validation
  if (!mediaUrl || !mediaUrl.trim()) {
    errors.push('Media URL is required for Instagram publishing. Please provide a direct video or image URL.');
  } else {
    try {
      const url = new URL(mediaUrl.trim());
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        errors.push('Media URL must use http:// or https:// protocol.');
      }
    } catch {
      errors.push('Media URL is malformed. Please enter a valid web URL.');
    }
  }

  // 2. Media Type & Extension checks
  if (mediaType === 'REELS') {
    const cleanUrl = mediaUrl.toLowerCase().split('?')[0];
    if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg') || cleanUrl.endsWith('.png')) {
      errors.push('Reels format requires a video file (.mp4 or .mov), but an image URL was provided.');
    }
  } else if (mediaType === 'IMAGE') {
    const cleanUrl = mediaUrl.toLowerCase().split('?')[0];
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm')) {
      warnings.push('Image format selected but media URL appears to be a video file.');
    }
  }

  // 3. Caption Length (Instagram 2,200 character ceiling)
  const caption = item.variant?.caption || '';
  if (!caption.trim()) {
    errors.push('Post caption is empty. A caption is required for Instagram posts.');
  } else if (caption.length > 2200) {
    errors.push(
      `Caption length is ${caption.length} characters, exceeding Instagram's hard limit of 2,200 characters.`
    );
  } else if (caption.length > 1800) {
    warnings.push(`Caption is ${caption.length} characters long (close to the 2,200 limit).`);
  }

  // 4. Hashtag Count (Instagram 30 hashtag ceiling)
  const hashtags = [
    ...(item.variant?.hashtags?.niche || []),
    ...(item.variant?.hashtags?.broad || []),
    ...(item.variant?.hashtags?.viral || [])
  ];
  if (hashtags.length > 30) {
    errors.push(
      `Post contains ${hashtags.length} hashtags, exceeding Instagram's maximum limit of 30 hashtags.`
    );
  }

  // 5. Title / Core Subject
  if (!item.title || !item.title.trim()) {
    errors.push('Content item is missing a valid title.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
