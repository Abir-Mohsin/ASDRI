import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/lib/dictionary";
import { Locale } from "@/lib/dictionary";
import { DynamicPageRenderer } from "@/components/DynamicPageRenderer";
import { CoursesPageContent } from "@/components/CoursesPageContent";

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar dict={dict} locale={locale} />
      
      <DynamicPageRenderer
        pageId="courses"
        locale={locale}
        fallbackTitle={locale === 'bn' ? 'একাডেমিক প্রোগ্রামসমূহ' : locale === 'ar' ? 'البرامج الأكاديمية' : 'Academic Programs'}
        fallbackSubtitle={locale === 'bn' 
          ? 'আমাদের বহুমুখী ইসলামিক কোর্সসমূহ অন্বেষণ করুন যা উম্মাহর জন্য যোগ্য ও দক্ষ দ্বীনি অভিভাবক গড়ে তুলতে ডিজাইন করা হয়েছে।' 
          : locale === 'ar' 
          ? 'اكتشف مجموعتنا الشاملة من المقررات الشرعية المصممة لتأهيل جيل متمكن علمياً وعملياً لخدمة الأمة.' 
          : 'Discover our comprehensive range of Islamic courses designed to nurture knowledgeable, balanced, and productive members of the Ummah.'}
        fallbackBannerUrl="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80"
      >
        {/* Dynamic and real-time editable curriculum intro, course highlights & interactive portal */}
        <CoursesPageContent locale={locale} />
      </DynamicPageRenderer>

      <Footer dict={dict} locale={locale} />
    </div>
  );
}
