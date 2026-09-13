import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";
import { LibraryPageContent } from "@/components/LibraryPageContent";

export default async function LibraryPage({
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
        pageId="library"
        locale={locale}
        fallbackTitle={locale === 'bn' ? 'কেন্দ্রীয় ডিজিটাল লাইব্রেরি' : locale === 'ar' ? 'المكتبة الرقمية المركزية' : 'Central Digital Library'}
        fallbackSubtitle={locale === 'bn' 
          ? 'দুর্লভ ইসলামিক গ্রন্থ, তাফসীর, হাদীস ও গবেষণা সাময়িকীর সমাহার এবং ৬০,০০০+ কিতাবের ক্লাউড আর্কাইভ।'
          : locale === 'ar'
          ? 'مستودع شامل للتراث الإسلامي، والمخطوطات النادرة، والبحوث الأكاديمية المعاصرة.'
          : 'A vast repository of authentic Islamic knowledge, rare manuscripts, and contemporary academic research accessible to students and scholars worldwide.'}
        fallbackBannerUrl="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80"
      >
        {/* Dynamic & Real-time editable Digital Library Portal with 60,000+ Books Mega Cloud Vault & Categorized Collections */}
        <LibraryPageContent locale={locale} />
      </DynamicPageRenderer>

      <Footer dict={dict} locale={locale} />
    </div>
  );
}
