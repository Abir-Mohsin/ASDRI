import { NextRequest, NextResponse } from 'next/server';

interface ParsedBook {
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
  notes?: string;
}

// Helper to extract Google Drive file ID
function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match1) return match1[1];
  const match2 = url.match(/id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  const match3 = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match3) return match3[1];
  return null;
}

// Convert Drive / Cloud URLs to embeddable preview URLs
function getEmbedUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive File
  const driveId = extractDriveFileId(trimmed);
  if (driveId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/file/d/${driveId}/preview`;
  }

  // Google Drive Folder
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#list`;
  }

  // Internet Archive
  if (trimmed.includes('archive.org/details/')) {
    return trimmed.replace('archive.org/details/', 'archive.org/embed/');
  }

  // OneDrive embed conversion if standard link
  if (trimmed.includes('onedrive.live.com') && !trimmed.includes('embed')) {
    // If it's a standard link, we can attempt embed or pass through
    return trimmed;
  }

  return trimmed;
}

// Convert Drive URLs to direct download URLs
function getDownloadUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  const driveId = extractDriveFileId(trimmed);
  if (driveId && trimmed.includes('drive.google.com')) {
    return `https://drive.google.com/uc?export=download&id=${driveId}`;
  }
  return trimmed;
}

// Smart column mapping detector from header strings
function detectColumnRole(header: string): 'title' | 'author' | 'category' | 'link' | 'language' | 'volume' | 'size' | 'unknown' {
  const h = header.toLowerCase().trim();
  if (
    h.includes('বই') || h.includes('কিতাব') || h.includes('title') || 
    h.includes('name') || h.includes('book') || h.includes('নাম') || h.includes('গ্রন্থ')
  ) {
    return 'title';
  }
  if (
    h.includes('লেখক') || h.includes('মুসান্নিফ') || h.includes('author') || 
    h.includes('writer') || h.includes('সংকলক') || h.includes('শায়খ')
  ) {
    return 'author';
  }
  if (
    h.includes('ক্যাটাগরি') || h.includes('বিষয়') || h.includes('বিভাগ') || 
    h.includes('category') || h.includes('subject') || h.includes('genre') || h.includes('topic')
  ) {
    return 'category';
  }
  if (
    h.includes('লিংক') || h.includes('link') || h.includes('drive') || 
    h.includes('url') || h.includes('ডাউনলোড') || h.includes('ড্রাইভ') || 
    h.includes('download') || h.includes('পড়ার লিংক')
  ) {
    return 'link';
  }
  if (h.includes('ভাষা') || h.includes('language') || h.includes('lang')) {
    return 'language';
  }
  if (h.includes('খণ্ড') || h.includes('ভলিউম') || h.includes('vol') || h.includes('part') || h.includes('খণ্ড/সংখ্যা')) {
    return 'volume';
  }
  if (h.includes('সাইজ') || h.includes('size') || h.includes('mb') || h.includes('পৃষ্ঠা') || h.includes('page')) {
    return 'size';
  }
  return 'unknown';
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(current.trim());
      current = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && next === '\n') i++;
      row.push(current.trim());
      if (row.some(c => c.length > 0)) {
        lines.push(row);
      }
      row = [];
      current = '';
    } else {
      current += char;
    }
  }
  if (current.length > 0 || row.length > 0) {
    row.push(current.trim());
    if (row.some(c => c.length > 0)) {
      lines.push(row);
    }
  }
  return lines;
}

export async function POST(req: NextRequest) {
  try {
    const { sheetUrl } = await req.json();

    if (!sheetUrl || typeof sheetUrl !== 'string') {
      return NextResponse.json({ error: 'Sheet URL is required' }, { status: 400 });
    }

    let parsedSheetId = '';
    let parsedGid = '0';

    // Check if it's standard Google Sheets URL
    const idMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (idMatch) {
      parsedSheetId = idMatch[1];
    }

    const gidMatch = sheetUrl.match(/[#&?]gid=([0-9]+)/);
    if (gidMatch) {
      parsedGid = gidMatch[1];
    }

    if (!parsedSheetId && !sheetUrl.includes('pub?output=csv') && !sheetUrl.includes('export?format=csv')) {
      return NextResponse.json({ 
        error: 'Invalid Google Sheets URL. Please provide a valid Google Sheet share or publish link.' 
      }, { status: 400 });
    }

    let books: ParsedBook[] = [];
    let headers: string[] = [];

    // Method 1: Try GViz JSON endpoint
    if (parsedSheetId) {
      try {
        const gvizUrl = `https://docs.google.com/spreadsheets/d/${parsedSheetId}/gviz/tq?tqx=out:json&tq=&gid=${parsedGid}`;
        const gvizRes = await fetch(gvizUrl, { next: { revalidate: 60 } });
        if (gvizRes.ok) {
          const text = await gvizRes.text();
          // GViz returns /*O_o*/ google.visualization.Query.setResponse({...});
          const jsonMatch = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
          if (jsonMatch && jsonMatch[1]) {
            const parsed = JSON.parse(jsonMatch[1]);
            const cols = parsed.table?.cols || [];
            const rows = parsed.table?.rows || [];

            headers = cols.map((col: any) => col.label || col.id || '');

            // Determine column indexes
            let titleIdx = -1;
            let authorIdx = -1;
            let categoryIdx = -1;
            let linkIdx = -1;
            let langIdx = -1;
            let volIdx = -1;
            let sizeIdx = -1;

            headers.forEach((h, idx) => {
              const role = detectColumnRole(h);
              if (role === 'title' && titleIdx === -1) titleIdx = idx;
              else if (role === 'author' && authorIdx === -1) authorIdx = idx;
              else if (role === 'category' && categoryIdx === -1) categoryIdx = idx;
              else if (role === 'link' && linkIdx === -1) linkIdx = idx;
              else if (role === 'language' && langIdx === -1) langIdx = idx;
              else if (role === 'volume' && volIdx === -1) volIdx = idx;
              else if (role === 'size' && sizeIdx === -1) sizeIdx = idx;
            });

            // Fallback column indexing if headers didn't match
            if (titleIdx === -1) titleIdx = 0;
            if (authorIdx === -1 && cols.length > 1) authorIdx = 1;
            if (categoryIdx === -1 && cols.length > 2) categoryIdx = 2;
            if (linkIdx === -1 && cols.length > 3) linkIdx = 3;

            rows.forEach((row: any, rIdx: number) => {
              const c = row.c || [];
              const getVal = (idx: number) => (idx >= 0 && c[idx]?.v != null ? String(c[idx].v).trim() : '');

              const title = getVal(titleIdx);
              if (!title || title.toLowerCase() === 'title' || title.toLowerCase() === 'বইয়ের নাম') return;

              const author = getVal(authorIdx);
              const category = getVal(categoryIdx) || 'সাধারণ সংকলন';
              const rawLink = getVal(linkIdx);
              const language = getVal(langIdx);
              const volume = getVal(volIdx);
              const fileSize = getVal(sizeIdx);

              const driveUrl = rawLink || '';

              books.push({
                id: `sheet-${rIdx + 1}`,
                title,
                author: author || 'অজ্ঞাত / প্রামাণ্য',
                category: category || 'ইসলামিক গ্রন্থ',
                driveUrl,
                downloadUrl: getDownloadUrl(driveUrl),
                previewUrl: getEmbedUrl(driveUrl),
                language: language || 'আরবি / বাংলা',
                volume: volume || '',
                fileSize: fileSize || '',
                format: 'PDF',
              });
            });
          }
        }
      } catch (err) {
        console.warn('GViz fetch failed, trying CSV fallback...', err);
      }
    }

    // Method 2: CSV Fallback if GViz yielded 0 books
    if (books.length === 0) {
      let csvUrl = sheetUrl;
      if (parsedSheetId) {
        csvUrl = `https://docs.google.com/spreadsheets/d/${parsedSheetId}/export?format=csv&gid=${parsedGid}`;
      }

      const csvRes = await fetch(csvUrl, { next: { revalidate: 60 } });
      if (!csvRes.ok) {
        throw new Error(`Failed to fetch CSV from Google Sheets: status ${csvRes.status}`);
      }

      const csvText = await csvRes.text();
      const rows = parseCSV(csvText);

      if (rows.length > 0) {
        headers = rows[0];

        let titleIdx = -1;
        let authorIdx = -1;
        let categoryIdx = -1;
        let linkIdx = -1;
        let langIdx = -1;
        let volIdx = -1;
        let sizeIdx = -1;

        headers.forEach((h, idx) => {
          const role = detectColumnRole(h);
          if (role === 'title' && titleIdx === -1) titleIdx = idx;
          else if (role === 'author' && authorIdx === -1) authorIdx = idx;
          else if (role === 'category' && categoryIdx === -1) categoryIdx = idx;
          else if (role === 'link' && linkIdx === -1) linkIdx = idx;
          else if (role === 'language' && langIdx === -1) langIdx = idx;
          else if (role === 'volume' && volIdx === -1) volIdx = idx;
          else if (role === 'size' && sizeIdx === -1) sizeIdx = idx;
        });

        if (titleIdx === -1) titleIdx = 0;
        if (authorIdx === -1 && headers.length > 1) authorIdx = 1;
        if (categoryIdx === -1 && headers.length > 2) categoryIdx = 2;
        if (linkIdx === -1 && headers.length > 3) linkIdx = 3;

        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const getVal = (idx: number) => (idx >= 0 && idx < r.length ? r[idx].trim() : '');

          const title = getVal(titleIdx);
          if (!title) continue;

          const author = getVal(authorIdx);
          const category = getVal(categoryIdx) || 'সাধারণ সংকলন';
          const rawLink = getVal(linkIdx);
          const language = getVal(langIdx);
          const volume = getVal(volIdx);
          const fileSize = getVal(sizeIdx);

          books.push({
            id: `csv-${i}`,
            title,
            author: author || 'অজ্ঞাত / প্রামাণ্য',
            category: category || 'ইসলামিক গ্রন্থ',
            driveUrl: rawLink,
            downloadUrl: getDownloadUrl(rawLink),
            previewUrl: getEmbedUrl(rawLink),
            language: language || 'আরবি / বাংলা',
            volume: volume || '',
            fileSize: fileSize || '',
            format: 'PDF',
          });
        }
      }
    }

    // Extract unique categories and counts
    const categoryCounts: Record<string, number> = {};
    books.forEach(b => {
      const cat = b.category || 'অন্যান্য';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      totalBooks: books.length,
      headers,
      categories: Object.keys(categoryCounts).map(name => ({
        name,
        count: categoryCounts[name]
      })),
      books: books.slice(0, 5000), // Return books (up to 5,000 in one batch)
    });
  } catch (error: any) {
    console.error('Error parsing Google Sheets in API route:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch or parse Google Sheets.' 
    }, { status: 500 });
  }
}
