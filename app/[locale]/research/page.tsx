import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { ResearchPortal } from "@/components/ResearchPortal";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";

export default async function ResearchPage({
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
        pageId="research"
        locale={locale}
        fallbackTitle={locale === 'bn' ? 'গবেষণা ও প্রকাশনা' : locale === 'ar' ? 'البحوث والدراسات العلمية' : 'Research & Publications'}
        fallbackSubtitle={locale === 'bn' 
          ? 'পবিত্র কুরআন ও সুন্নাহর বিশুদ্ধ গবেষণার মাধ্যমে সমসাময়িক চ্যালেঞ্জসমূহের বুদ্ধিবৃত্তিক ও বাস্তবসম্মত সমাধান প্রণয়ন।' 
          : locale === 'ar' 
          ? 'الارتقاء بالبحث العلمي الشرعي المؤصل لخدمة الإسلام ونشر عقيدة أهل السنة والجماعة.' 
          : 'Advancing Islamic scholarship through rigorous, authentic research that addresses contemporary challenges facing the Ummah.'}
      >
        <ResearchPortal locale={locale} />
      </DynamicPageRenderer>

      <Footer dict={dict} locale={locale} />
    </div>
  );
}
