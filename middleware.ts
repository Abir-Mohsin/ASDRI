import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'bn', 'ar'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // Skip all internal paths (_next, api, static files)
    '/((?!api|_next|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
