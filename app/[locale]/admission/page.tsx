import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";
import { AdmissionPageContent } from "@/components/AdmissionPageContent";

export default async function AdmissionPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  const titles = {
    bn: 'ভর্তি নির্দেশিকা ও সার্কুলার',
    en: 'Admissions Circular & Guidelines',
    ar: 'دليل وشروط القبول والتسجيل'
  };

  const subtitles = {
    bn: 'কুরআন ও সুন্নাহ ভিত্তিক উচ্চতর দ্বীনি শিক্ষার যাত্রা শুরু করুন। আগামী সেমিস্টারের জন্য বিভিন্ন প্রোগ্রামে শিক্ষার্থী ভর্তি চলছে।',
    en: 'Begin your journey of authentic Islamic learning. Admissions for upcoming academic semesters are open for prospective students and researchers.',
    ar: 'ابدأ مسيرتك العلمية في دراسة العلوم الشرعية المؤصلة. باب التسجيل والقبول مفتوح الآن لمختلف البرامج الأكاديمية والدعوية.'
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar dict={dict} locale={locale} />
      
      <DynamicPageRenderer
        pageId="admission"
        locale={locale}
        fallbackTitle={titles[locale] || titles.en}
        fallbackSubtitle={subtitles[locale] || subtitles.en}
        fallbackBannerUrl="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1600&q=80"
      >
        <AdmissionPageContent locale={locale} />
      </DynamicPageRenderer>

      <Footer dict={dict} locale={locale} />
    </div>
  );
}
