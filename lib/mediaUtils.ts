// Helper utility for parsing and rendering videos and images in Gallery

export interface ParsedVideoInfo {
  type: 'youtube' | 'drive' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  thumbnailUrl: string;
  directUrl?: string;
}

export function parseVideoUrl(url: string, customThumbnail?: string): ParsedVideoInfo {
  if (!url || typeof url !== 'string') {
    return {
      type: 'unknown',
      embedUrl: '',
      thumbnailUrl: customThumbnail?.trim() || '',
    };
  }

  const trimmed = url.trim();

  // 1. YouTube
  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`,
      thumbnailUrl: customThumbnail?.trim() || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 2. Google Drive
  const driveMatch1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const driveMatch2 = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const driveId = driveMatch1 ? driveMatch1[1] : (driveMatch2 ? driveMatch2[1] : null);

  if (driveId && (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com'))) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveId}/preview`,
      thumbnailUrl: customThumbnail?.trim() || '',
    };
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      thumbnailUrl: customThumbnail?.trim() || '',
    };
  }

  // 4. Direct video files (.mp4, .webm, .ogg)
  if (trimmed.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      directUrl: trimmed,
      thumbnailUrl: customThumbnail?.trim() || '',
    };
  }

  // Fallback
  return {
    type: 'unknown',
    embedUrl: trimmed,
    thumbnailUrl: customThumbnail?.trim() || '',
  };
}
