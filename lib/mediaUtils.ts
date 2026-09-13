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
      thumbnailUrl: customThumbnail || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
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
      thumbnailUrl: customThumbnail?.trim() || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
    };
  }

  // 3. Vimeo
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`,
      thumbnailUrl: customThumbnail?.trim() || 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=800&q=80',
    };
  }

  // 4. Direct video files (.mp4, .webm, .ogg)
  if (trimmed.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      directUrl: trimmed,
      thumbnailUrl: customThumbnail?.trim() || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    };
  }

  // Fallback
  return {
    type: 'unknown',
    embedUrl: trimmed,
    thumbnailUrl: customThumbnail?.trim() || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
  };
}
