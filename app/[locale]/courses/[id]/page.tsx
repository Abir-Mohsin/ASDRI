import { notFound } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getDictionary, Locale } from '@/lib/dictionary';
import { fetchCourseById, fetchAllCourses } from '@/lib/coursesData';
import { CourseDetailPageContent } from '@/components/CourseDetailPageContent';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface CourseDetailPageProps {
  params: Promise<{
    locale: Locale;
    id: string;
  }>;
}

export async function generateMetadata({ params }: CourseDetailPageProps) {
  const { locale, id } = await params;
  const course = await fetchCourseById(id);
  
  if (!course) {
    return {
      title: 'Course Not Found | As-Sunnah Dawah & Research Institute',
    };
  }

  const title = locale === 'bn' && course.titleBn ? course.titleBn : course.title;
  const desc = locale === 'bn' && course.descriptionBn ? course.descriptionBn : course.description;

  return {
    title: `${title} | As-Sunnah Dawah & Research Institute`,
    description: desc || 'Academic Islamic Program and Classical Curriculum',
  };
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { locale, id } = await params;
  const dict = await getDictionary(locale);

  const course = await fetchCourseById(id);
  const allCourses = await fetchAllCourses();
  const otherCourses = allCourses.filter(c => c.id !== id && c.code !== course?.code);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-slate-50">
        <Navbar dict={dict} locale={locale} />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4">
              <BookOpen className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-serif mb-2">
              {locale === 'bn' ? 'কোর্সটি পাওয়া যায়নি' : 'Course Not Found'}
            </h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              {locale === 'bn' 
                ? 'দুঃখিত, আপনি যে কোর্সটি খুঁজছেন তা বর্তমান তালিকাভুক্ত নয় অথবা মেয়াদোত্তীর্ণ হতে পারে।' 
                : 'The requested academic course could not be located or may have been updated.'}
            </p>
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold shadow-sm hover:bg-emerald-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              <span>{locale === 'bn' ? 'সকল কোর্সে ফিরে যান' : 'Back to Academic Programs'}</span>
            </Link>
          </div>
        </main>
        <Footer dict={dict} locale={locale} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar dict={dict} locale={locale} />
      <main className="flex-1">
        <CourseDetailPageContent 
          course={course}
          otherCourses={otherCourses}
          locale={locale}
        />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
