import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";
import { AboutPageContent } from "@/components/AboutPageContent";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} locale={locale} />
      
      <DynamicPageRenderer
        pageId="about"
        locale={locale}
        fallbackTitle="About ASDRI"
        fallbackSubtitle="A Trusted Center for Authentic Islamic Education & Research"
      >
        {/* Real-time editable Mission, Vision & Core Values Cards */}
        <AboutPageContent locale={locale === 'ar' ? 'ar' : 'en'} />
      </DynamicPageRenderer>

      <Footer dict={dict} locale={locale} />
    </div>
  );
}
