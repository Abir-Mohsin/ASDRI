/**
 * Universal Image and Google Drive Utility
 * Ensures reliable loading, normalization, and optimization of hero banner images,
 * Google Drive public links, and direct uploaded images.
 */

export function extractGoogleDriveId(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/([a-zA-Z0-9_-]{15,})
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (fileDMatch && fileDMatch[1]) return fileDMatch[1];

  // Pattern 2: [?&]id=([a-zA-Z0-9_-]{15,})
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idMatch && idMatch[1]) return idMatch[1];

  // Pattern 3: /d/([a-zA-Z0-9_-]{15,})
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (dMatch && dMatch[1]) return dMatch[1];

  // Pattern 4: /thumbnail?id=([a-zA-Z0-9_-]{15,})
  const thumbMatch = trimmed.match(/thumbnail\?id=([a-zA-Z0-9_-]{15,})/);
  if (thumbMatch && thumbMatch[1]) return thumbMatch[1];

  // Pattern 5: uc?id=([a-zA-Z0-9_-]{15,}) or uc?export=view&id=...
  const ucMatch = trimmed.match(/uc\?.*id=([a-zA-Z0-9_-]{15,})/);
  if (ucMatch && ucMatch[1]) return ucMatch[1];

  // Pattern 6: open?id=([a-zA-Z0-9_-]{15,})
  const openMatch = trimmed.match(/open\?.*id=([a-zA-Z0-9_-]{15,})/);
  if (openMatch && openMatch[1]) return openMatch[1];

  // Pattern 6b: Direct raw File ID (33+ characters alphanumeric string)
  if (/^[a-zA-Z0-9_-]{25,60}$/.test(trimmed)) {
    return trimmed;
  }

  // Pattern 7: Any 25+ char alphanumeric ID in a google drive/docs/usercontent URL
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com') || trimmed.includes('googleusercontent.com')) {
    const rawIdMatch = trimmed.match(/([a-zA-Z0-9_-]{25,})/);
    if (rawIdMatch && rawIdMatch[1]) return rawIdMatch[1];
  }

  return null;
}

export function isGoogleDriveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return (
    trimmed.includes('drive.google.com') ||
    trimmed.includes('docs.google.com') ||
    trimmed.includes('googleusercontent.com') ||
    trimmed.includes('/api/drive-image')
  );
}

/**
 * Converts any Google Drive link or image URL into a direct, high-resolution, embeddable CDN image URL.
 */
export function getOptimizedImageUrl(url: string | undefined | null, defaultFallback = ''): string {
  if (!url || typeof url !== 'string') return defaultFallback;
  const trimmed = url.trim();
  if (!trimmed) return defaultFallback;

  const fileId = extractGoogleDriveId(trimmed);
  if (fileId) {
    // Return server-side proxy route which eliminates all CORS and referrer blocking
    return `/api/drive-image?id=${fileId}`;
  }

  return trimmed;
}

/**
 * Returns alternative candidate URLs for Google Drive images in case of primary load failure.
 */
export function getDriveImageCandidates(url: string): string[] {
  const fileId = extractGoogleDriveId(url);
  if (!fileId) return [url];

  return [
    `/api/drive-image?id=${fileId}`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2560`,
    `https://lh3.googleusercontent.com/d/${fileId}=w2560`,
    `https://drive.google.com/uc?export=view&id=${fileId}`
  ];
}

/**
 * Compresses an uploaded image file locally to high quality WebP / JPEG base64 Data URL.
 */
export async function compressUploadedImage(
  file: File,
  maxWidth = 1920,
  maxHeight = 1080,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to webp or jpeg
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
