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

  return (
    <div dir={direction} className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50">
      <AuthProvider>{children}</AuthProvider>
    </div>
  );
}
