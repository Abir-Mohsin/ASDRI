'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Course, fetchCourseById, fetchAllCourses } from '@/lib/coursesData';
import { CourseDetailPageContent } from '@/components/CourseDetailPageContent';
import { Locale } from '@/lib/dictionary';

interface CourseDetailClientViewProps {
  initialCourse: Course | null;
  initialOtherCourses: Course[];
  courseId: string;
  locale: Locale;
}

export function CourseDetailClientView({
  initialCourse,
  initialOtherCourses,
  courseId,
  locale,
}: CourseDetailClientViewProps) {
  const [course, setCourse] = useState<Course | null>(initialCourse);
  const [otherCourses, setOtherCourses] = useState<Course[]>(initialOtherCourses);
  const [loading, setLoading] = useState<boolean>(!initialCourse);

  useEffect(() => {
    let isMounted = true;

    async function loadFreshData() {
      try {
        const freshCourse = await fetchCourseById(courseId);
        const all = await fetchAllCourses();
        if (isMounted) {
          if (freshCourse) {
            setCourse(freshCourse);
            setOtherCourses(all.filter((c) => c.id !== courseId && c.code !== freshCourse.code));
          }
          setLoading(false);
        }
      } catch (err) {
        console.warn('Error loading dynamic course data:', err);
        if (isMounted) setLoading(false);
      }
    }

    loadFreshData();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 border-4 border-emerald-800/20 border-t-emerald-800 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-500 font-medium">
            {locale === 'bn' ? 'কোর্সের বিবরণ লোড হচ্ছে...' : locale === 'ar' ? 'جاري تحميل تفاصيل البرنامج...' : 'Loading course details...'}
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-serif mb-2">
            {locale === 'bn' ? 'কোর্সটি পাওয়া যায়নি' : locale === 'ar' ? 'لم يتم العثور على البرنامج' : 'Course Not Found'}
          </h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            {locale === 'bn'
              ? 'দুঃখিত, আপনি যে কোর্সটি খুঁজছেন তা বর্তমান তালিকাভুক্ত নয় অথবা মেয়াদোত্তীর্ণ হতে পারে।'
              : locale === 'ar'
              ? 'عذراً، البرنامج الأكاديمي المطلوب غير متوفر حالياً أو ربما تم تحديثه.'
              : 'The requested academic course could not be located or may have been updated.'}
          </p>
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] text-white text-xs font-bold shadow-sm hover:bg-emerald-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>
              {locale === 'bn' ? 'সকল কোর্সে ফিরে যান' : locale === 'ar' ? 'العودة إلى البرامج الأكاديمية' : 'Back to Academic Programs'}
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <CourseDetailPageContent
      course={course}
      otherCourses={otherCourses}
      locale={locale}
    />
  );
}
