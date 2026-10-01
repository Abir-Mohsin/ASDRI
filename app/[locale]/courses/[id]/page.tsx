import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getDictionary, Locale } from '@/lib/dictionary';
import { fetchCourseById, fetchAllCourses } from '@/lib/coursesData';
import { CourseDetailClientView } from '@/components/CourseDetailClientView';

export const dynamicParams = false;

export async function generateStaticParams() {
  const locales: Locale[] = ['en', 'bn', 'ar'];
  const courses = await fetchAllCourses();
  
  const courseIds = courses.length > 0
    ? Array.from(new Set(courses.map(c => c.id).filter(Boolean)))
    : ['not-found'];

  const params: { locale: Locale; id: string }[] = [];
  for (const locale of locales) {
    for (const id of courseIds) {
      params.push({ locale, id });
    }
  }

  return params;
}

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
      title: 'Academic Program | As-Sunnah Dawah & Research Institute',
      description: 'Academic Islamic Program and Classical Curriculum',
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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50">
      <Navbar dict={dict} locale={locale} />
      <main className="flex-1 flex flex-col">
        <CourseDetailClientView
          initialCourse={course}
          initialOtherCourses={otherCourses}
          courseId={id}
          locale={locale}
        />
      </main>
      <Footer dict={dict} locale={locale} />
    </div>
  );
}
