import { NextRequest, NextResponse } from 'next/server';
import { extractGoogleDriveId } from '@/lib/imageUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get('id') || '';
  const urlParam = searchParams.get('url') || '';

  const fileId = idParam || extractGoogleDriveId(urlParam);

  if (!fileId) {
    return new NextResponse('Missing or invalid Google Drive file ID', { status: 400 });
  }

  // List of high-resolution candidate endpoints on Google's infrastructure
  const candidateUrls = [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2560`,
    `https://lh3.googleusercontent.com/d/${fileId}=w2560`,
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
  ];

  for (const targetUrl of candidateUrls) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
        redirect: 'follow',
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      // Verify that Google actually returned an image and not an HTML login/error page
      if (!contentType.startsWith('image/')) {
        continue;
      }

      const buffer = await response.arrayBuffer();

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
          'Access-Control-Allow-Origin': '*',
          'X-Drive-File-Id': fileId,
        },
      });
    } catch {
      // Try next candidate
    }
  }

  // If all attempts failed, it means the file is either private (restricted) or not found
  return NextResponse.json(
    {
      error: 'Unable to retrieve image from Google Drive.',
      fileId,
      reason: 'The file is either private (restricted permissions) or does not exist. Ensure General Access is set to "Anyone with the link".'
    },
    { status: 404 }
  );
}
