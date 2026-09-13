import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary, Locale } from "@/lib/dictionary";
import { FacultyPageContent } from "@/components/FacultyPageContent";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'bn' 
      ? 'শিক্ষক ও গবেষক পরিষদ | আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট'
      : locale === 'ar'
      ? 'هيئة التدريس والباحثين | معهد السنة للدعوة والبحوث'
      : 'Faculty & Scholars Directory | As-Sunnah Dawah & Research Institute',
    description: locale === 'bn'
      ? 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের আন্তর্জাতিক মানসম্পন্ন প্রথিতযশা শিক্ষক, গবেষক ও মুফতি পরিষদ।'
      : locale === 'ar'
      ? 'دليل نخبة الأساتذة والعلماء الباحثين في معهد السنة للدعوة والبحوث الإسلامية.'
      : 'Esteemed scholars, professors, and research fellows at As-Sunnah Dawah & Research Institute.',
  };
}

export default async function FacultyPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar dict={dict} locale={locale} />
      <main className="flex-1">
        <FacultyPageContent locale={locale} />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
