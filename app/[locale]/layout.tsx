import type { Metadata } from 'next';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'ASDRI - As-Sunnah Dawah & Research Institute',
  description: 'Official digital platform for ASDRI',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'bn' }, { locale: 'ar' }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  const localeFontClass =
    locale === 'bn'
      ? 'font-bengali locale-bn'
      : locale === 'ar'
      ? 'font-arabic locale-ar'
      : 'font-english locale-en';

  return (
    <div
      lang={locale}
      dir={direction}
      className={`min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 ${localeFontClass}`}
    >
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
