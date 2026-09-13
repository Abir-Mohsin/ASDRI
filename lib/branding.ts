/**
 * Site Branding & Logo Configuration Types and Helpers
 * Supports:
 * 1. Direct Image Upload (Auto-compressed data URL or storage)
 * 2. Google Drive Public Links (Auto-converted to high-speed CDN direct image streams)
 * 3. External Image URLs
 * 4. Fallback Islamic Monogram and Institutional Crests
 */

export type LogoSourceType = 'upload' | 'drive' | 'url' | 'default';
export type LogoShape = 'rounded' | 'circle' | 'square' | 'original';
export type LogoBackground = 'transparent' | 'amber' | 'white' | 'dark';

export interface SiteBrandingData {
  logoUrl?: string; // Direct image URL or Data URL
  rawDriveUrl?: string; // Original raw Google Drive link if provided
  sourceType: LogoSourceType;
  logoShape: LogoShape;
  logoHeight: number; // in pixels, e.g. 40, 48, 56
  logoBackground?: LogoBackground;
  
  // Brand Text
  shortName: string; // e.g. "ASDRI"
  fullName: string; // e.g. "As-Sunnah Dawah and Research Institute"
  subtitle: string; // e.g. "Dawah & Research"
  
  // Multi-lingual overrides
  shortNameBn?: string;
  fullNameBn?: string;
  subtitleBn?: string;
  
  shortNameAr?: string;
  fullNameAr?: string;
  subtitleAr?: string;
  
  monogramText: string; // Fallback initial e.g. "A"
  
  // Metadata
  updatedAt?: any;
  updatedBy?: string;
}

export const DEFAULT_BRANDING: SiteBrandingData = {
  logoUrl: '',
  rawDriveUrl: '',
  sourceType: 'default',
  logoShape: 'rounded',
  logoHeight: 40,
  logoBackground: 'amber',
  
  shortName: 'ASDRI',
  fullName: 'As-Sunnah Dawah & Research Institute',
  subtitle: 'Dawah & Research',
  
  shortNameBn: 'আসরী (ASDRI)',
  fullNameBn: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট',
  subtitleBn: 'দাওয়াহ অ্যান্ড রিসার্চ',
  
  shortNameAr: 'ASDRI',
  fullNameAr: 'معهد السنة للدعوة والبحوث',
  subtitleAr: 'الدعوة والبحوث',
  
  monogramText: 'A',
};

/**
 * Intelligent Google Drive Link Parser:
 * Extracts file ID from any standard Google Drive sharing link or viewer link,
 * and transforms it into direct embeddable CDN image stream link.
 */
export function parseGoogleDriveImageUrl(inputUrl: string): { 
  isDrive: boolean; 
  directUrl: string; 
  fileId: string | null;
  error?: string;
} {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { isDrive: false, directUrl: '', fileId: null };
  }
  
  const trimmed = inputUrl.trim();
  
  // Check if it matches Google Drive domains
  const isDriveDomain = trimmed.includes('drive.google.com') || 
                        trimmed.includes('docs.google.com') ||
                        trimmed.includes('googleusercontent.com/d/');
                        
  if (!isDriveDomain) {
    return { isDrive: false, directUrl: trimmed, fileId: null };
  }
  
  let fileId: string | null = null;
  
  // Pattern 1: /file/d/([a-zA-Z0-9_-]{15,})
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/);
  if (fileDMatch && fileDMatch[1]) {
    fileId = fileDMatch[1];
  }
  
  // Pattern 2: [?&]id=([a-zA-Z0-9_-]{15,})
  if (!fileId) {
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
    if (idMatch && idMatch[1]) {
      fileId = idMatch[1];
    }
  }
  
  // Pattern 3: /d/([a-zA-Z0-9_-]{15,})
  if (!fileId) {
    const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    }
  }

  // Pattern 4: /folders/ is NOT a direct image file
  if (trimmed.includes('/drive/folders/')) {
    return {
      isDrive: true,
      directUrl: '',
      fileId: null,
      error: 'This is a Google Drive folder link. Please select and share the specific logo image file instead.'
    };
  }
  
  if (fileId) {
    // lh3.googleusercontent.com/d/FILE_ID is Google's direct CDN proxy for Drive images
    // It works in <img> tags without authorization redirect loops.
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    return { isDrive: true, directUrl, fileId };
  }
  
  return { 
    isDrive: true, 
    directUrl: trimmed, 
    fileId: null,
    error: 'Could not extract Google Drive File ID. Please check the link format.'
  };
}

/**
 * Compresses an image file in browser using HTML5 Canvas
 * Downscales to max 512px on the longest edge, produces high-density WebP/PNG data URL.
 * Transparent backgrounds are preserved.
 */
export async function compressImageFile(file: File, maxDimension = 512): Promise<{
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, read directly as text or data url to preserve infinite vector sharpness
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          dataUrl: result,
          originalSize: file.size,
          compressedSize: file.size,
          width: 512,
          height: 512,
        });
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Draw image onto canvas
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Preserve PNG transparency if original was PNG/WebP
        const isPng = file.type === 'image/png';
        const exportFormat = isPng ? 'image/png' : 'image/webp';
        const dataUrl = canvas.toDataURL(exportFormat, 0.9);

        // Calculate approximate size in bytes
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const byteLength = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize: byteLength,
          width,
          height,
        });
      };
      img.onerror = (e) => reject(new Error('Failed to load image for compression'));
      img.src = event.target?.result as string;
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
