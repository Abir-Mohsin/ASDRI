import { getDictionary, Locale } from '@/lib/dictionary';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FatwaPortalContent } from '@/components/FatwaPortalContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'দারুল ইফতা ও ফাতওয়া পোর্টাল | Darul Ifta & Fatwa Archive - ASDRI',
  description: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের নির্ভরযোগ্য ও যাচাইকৃত ফাতওয়া এবং ফিকহি প্রশ্নোত্তর সংগ্রহশালা।',
};

export default async function FatwaPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar dict={dict} locale={locale} />
      <main className="flex-grow">
        <FatwaPortalContent locale={locale} />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
