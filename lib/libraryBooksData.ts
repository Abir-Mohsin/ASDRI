export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  category: string;
  driveUrl: string;
  downloadUrl?: string;
  previewUrl?: string;
  language?: string;
  volume?: string;
  fileSize?: string;
  format?: string;
  coverImage?: string;
  description?: string;
  pages?: number;
  year?: string;
}

// Convert Drive / Archive URLs to In-App embed preview URLs
export function getBookEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive File
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const match2 = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  const match3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const driveId = match1 ? match1[1] : match2 ? match2[1] : match3 ? match3[1] : null;

  if (driveId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // Google Drive Folder
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
  }

  // Internet Archive Details -> Embed
  if (trimmed.includes('archive.org/details/')) {
    return trimmed.replace('archive.org/details/', 'archive.org/embed/');
  }

  return trimmed;
}

// Convert Drive URLs to Direct Download Links
export function getBookDownloadUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match1 = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  const match2 = trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  const match3 = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const driveId = match1 ? match1[1] : match2 ? match2[1] : match3 ? match3[1] : null;

  if (driveId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }
  return trimmed;
}

// Zero dummy books: real books are dynamically loaded from Google Sheet or Firestore
export const DEFAULT_LIBRARY_BOOKS: LibraryBook[] = [];
