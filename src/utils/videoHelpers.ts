import { PersonVideo } from '../types';
import { getVideoBlob } from './videoStore';

export function getEmbedUrl(url: string): { isEmbed: boolean; embedUrl?: string } {
  if (!url) return { isEmbed: false };

  // YouTube
  // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
    };
  }

  // Google Drive
  // drive.google.com/file/d/ID/view -> drive.google.com/file/d/ID/preview
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      isEmbed: true,
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
    };
  }

  return { isEmbed: false };
}

// Memory cache for active object URLs created from IndexedDB
const objectUrlCache = new Map<string, string>();

export async function resolveVideoPlaybackUrl(video: PersonVideo): Promise<string> {
  if (!video.url) return '';

  // If it starts with 'idb:' (stored in IndexedDB)
  if (video.url.startsWith('idb:')) {
    const vidId = video.url.replace('idb:', '');
    if (objectUrlCache.has(vidId)) {
      return objectUrlCache.get(vidId)!;
    }
    const blob = await getVideoBlob(vidId);
    if (blob) {
      const objUrl = URL.createObjectURL(blob);
      objectUrlCache.set(vidId, objUrl);
      return objUrl;
    }
  }

  return video.url;
}
