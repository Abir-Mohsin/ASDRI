import { getDictionary, Locale } from '@/lib/dictionary';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DonationPortalContent } from '@/components/DonationPortalContent';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'যাকাত ও অনুদান ফান্ড | Zakat & Donation Portal - ASDRI',
  description: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের যাকাত ক্যালকুলেটর, বিভিন্ন জনকল্যাণমূলক ফান্ডে অনুদান প্রদান এবং ডিজিটাল মানি রিসিট জেনারেশন।',
};

export default async function DonatePage({
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
        <DonationPortalContent locale={locale} />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
