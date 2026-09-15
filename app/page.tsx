'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem('as_preferred_locale');
      if (savedLocale && ['bn', 'en', 'ar'].includes(savedLocale)) {
        router.replace(`/${savedLocale}`);
        return;
      }

      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('ar')) {
        router.replace('/ar');
      } else if (browserLang.startsWith('en')) {
        router.replace('/en');
      } else {
        router.replace('/bn');
      }
    } catch {
      router.replace('/bn');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <noscript>
        <meta httpEquiv="refresh" content="0; url=/bn" />
      </noscript>
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium font-serif">ASDRI Platform Loading...</p>
      </div>
    </div>
  );
}
