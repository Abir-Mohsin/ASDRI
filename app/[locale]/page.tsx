import { getDictionary, Locale } from '@/lib/dictionary';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { DynamicHomeNotice } from '@/components/DynamicHomeNotice';
import { Features } from '@/components/Features';
import { HomeResearchSpotlight } from '@/components/HomeResearchSpotlight';
import { HomeLibraryShowcase } from '@/components/HomeLibraryShowcase';
import { HomeFacultySpotlight } from '@/components/HomeFacultySpotlight';
import { HomeAdmissionCta } from '@/components/HomeAdmissionCta';
import { Footer } from '@/components/Footer';

export default async function Home({
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
        <Hero dict={dict} locale={locale} />
        <DynamicHomeNotice locale={locale} />
        <Features dict={dict} locale={locale} />
        <HomeResearchSpotlight locale={locale} />
        <HomeLibraryShowcase locale={locale} />
        <HomeFacultySpotlight locale={locale} />
        <HomeAdmissionCta locale={locale} />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
