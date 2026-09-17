'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/dictionary';
import { ArrowRight, BookOpen, GraduationCap, Users, Clock, Calendar, ShieldCheck } from 'lucide-react';
import { Course, fetchAllCourses, getCourseCoverImage } from '@/lib/coursesData';

export function Features({ dict, locale }: { dict: any; locale: Locale }) {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const textDict = {
    bn: {
      badge: 'উচ্চতর শিক্ষা ও প্রশিক্ষণ',
      heading: 'আমাদের একাডেমিক প্রোগ্রামসমূহ',
      subheading: 'বিভিন্ন স্তরের শিক্ষার্থীদের জন্য ডিজাইন করা একটি সমৃদ্ধ, ভারসাম্যপূর্ণ ও প্রামাণ্য একাডেমিক পাঠ্যক্রম।',
      allCoursesBtn: 'সকল কোর্স ও কারিকুলাম দেখুন',
      viewDetails: 'বিস্তারিত দেখুন',
      durationLabel: 'মেয়াদ',
      instructorLabel: 'প্রশিক্ষক',
      batchLabel: 'ব্যাচ',
      viewAllBottom: 'সকল প্রোগ্রাম দেখুন এবং আবেদন করুন',
      loading: 'প্রোগ্রাম লোড হচ্ছে...'
    },
    en: {
      badge: 'Higher Islamic Education & Training',
      heading: 'Our Academic Programs',
      subheading: 'Comprehensive Islamic education programs designed for different levels of learners and researchers.',
      allCoursesBtn: 'Explore All Programs & Curriculum',
      viewDetails: 'View Program Details',
      durationLabel: 'Duration',
      instructorLabel: 'Instructor',
      batchLabel: 'Batch',
      viewAllBottom: 'View All Programs & Apply',
      loading: 'Loading programs...'
    },
    ar: {
      badge: 'التعليم العالي والتدريب',
      heading: 'برامجنا الأكاديمية',
      subheading: 'مناهج دراسية متميزة ومتنوعة تناسب المستويات المختلفة لطلاب العلم والباحثين.',
      allCoursesBtn: 'استعراض جميع البرامج والمناهج',
      viewDetails: 'عرض تفاصيل البرنامج',
      durationLabel: 'المدة',
      instructorLabel: 'المدرس',
      batchLabel: 'الدفعة',
      viewAllBottom: 'عرض جميع البرامج والتقديم',
      loading: 'جاري تحميل البرامج...'
    }
  };

  const activeDict = textDict[locale] || textDict.en;

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchAllCourses();
        setCourses(data);
      } catch (err) {
        console.error('Error loading features courses:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [locale]);

  const truncateDescription = (text?: string, maxLength: number = 130) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const getCourseTitle = (course: Course) => {
    if (locale === 'bn' && course.titleBn) return course.titleBn;
    if (locale === 'ar' && course.titleAr) return course.titleAr;
    if (locale === 'en' && course.titleEn) return course.titleEn;
    return course.title;
  };

  const getCourseDesc = (course: Course) => {
    if (locale === 'bn' && course.descriptionBn) return course.descriptionBn;
    if (locale === 'ar' && course.descriptionAr) return course.descriptionAr;
    if (locale === 'en' && course.descriptionEn) return course.descriptionEn;
    return course.description;
  };

  return (
    <section className="py-20 sm:py-28 bg-slate-50 font-sans" id="features_academic_programs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Clean, Minimalist, Centered with High-Contrast Typography */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#064e3b] font-serif tracking-tight leading-tight">
            {activeDict.heading}
          </h2>
          <div className="mt-4 w-16 h-1 bg-amber-500 mx-auto rounded-full" />
        </div>
        
        {/* Course Cards: 3 Columns with Banner on Top and Snap Details on Bottom */}
        {isLoading ? (
          <div className="py-16 text-center flex flex-col justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#064e3b]"></div>
            <span className="text-xs text-slate-500 font-medium">{activeDict.loading}</span>
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-[#064e3b] flex items-center justify-center mx-auto mb-4 border border-emerald-300">
              <BookOpen className="w-7 h-7 text-[#064e3b]" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b] mb-2">
              {locale === 'bn' ? 'আসন্ন সেশনের পাঠ্যক্রম ও কোর্স' : locale === 'ar' ? 'البرامج الأكاديمية للعام الجديد' : 'Academic Programs for Upcoming Session'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              {locale === 'bn' 
                ? 'ইনস্টিটিউটের নতুন শিক্ষাবর্ষের অনুমোদিত কোর্স ও পাঠ্যক্রমসমূহ নির্ধারিত প্রক্রিয়ায় হালনাগাদ করা হচ্ছে। ভর্তি সংক্রান্ত তথ্য জানতে সরাসরি ভর্তি পোর্টাল পরিদর্শন করুন।' 
                : locale === 'ar'
                ? 'يتم تحديث المناهج والبرامج الأكاديمية للدفعة القادمة. للاطلاع على شروط القبول والتسجيل، يرجى زيارة بوابة القبول والتسجيل.'
                : 'Curricula and specialized programs for the upcoming academic session are being published. To view admission details and requirements, please visit the Admissions Portal.'}
            </p>
            <Link
              href={`/${locale}/admission`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-300" />
              <span>{locale === 'bn' ? 'ভর্তি তথ্য ও আবেদন' : locale === 'ar' ? 'بوابة القبول' : 'Admissions Portal'}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            {courses.slice(0, 6).map((course) => {
              const coverUrl = getCourseCoverImage(course);
              const courseTitle = getCourseTitle(course);
              const courseDesc = getCourseDesc(course);

              return (
                <div 
                  key={course.id} 
                  onClick={() => router.push(`/${locale}/courses/${encodeURIComponent(course.id)}`)}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer h-full"
                >
                  {/* Card Top Portion: Banner Image & Badges */}
                  <div className="w-full h-48 sm:h-52 relative bg-slate-100 overflow-hidden shrink-0">
                    <img 
                      src={coverUrl} 
                      alt={courseTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
                      {course.code && (
                        <span className="px-2.5 py-0.5 bg-[#064e3b] text-amber-300 border border-emerald-600/70 text-[10px] font-extrabold uppercase rounded-md shadow-xs backdrop-blur-xs">
                          {course.code}
                        </span>
                      )}
                      {course.batchNumber && (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-md shadow-xs">
                          {course.batchNumber}
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay inside image */}
                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
                      <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs border border-white/20">
                        {course.type || 'Program'}
                      </span>
                      {course.startDate && (
                        <span className="flex items-center gap-1 text-emerald-200 drop-shadow-sm">
                          <Calendar className="w-3 h-3 text-amber-300" />
                          {course.startDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Portion: Snap Details */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Meta Pill Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-900 text-[11px] font-bold rounded-md border border-amber-200/60">
                          <Clock className="w-3 h-3 text-amber-700" />
                          {course.duration}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-[#064e3b] text-[11px] font-bold rounded-md border border-emerald-200/60">
                          <Users className="w-3 h-3 text-[#064e3b]" />
                          {course.type}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 font-serif group-hover:text-[#064e3b] transition-colors leading-snug line-clamp-2">
                        {courseTitle}
                      </h3>

                      {/* Snap Description */}
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed text-justify font-sans mb-4 line-clamp-3">
                        {truncateDescription(courseDesc, 130)}
                      </p>

                      {/* Instructor / Mentor */}
                      {course.instructor && (
                        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mb-3 pt-2 border-t border-slate-100">
                          <GraduationCap className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                          <span className="text-slate-400 font-normal">{activeDict.instructorLabel}:</span>
                          <span className="font-semibold text-slate-800 truncate">{course.instructor}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Bottom Link to Dedicated Page */}
                    <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between">
                      <Link 
                        href={`/${locale}/courses/${encodeURIComponent(course.id)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-[#064e3b] font-bold hover:text-emerald-700 transition-colors text-xs tracking-wider uppercase gap-1.5 cursor-pointer group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 duration-200"
                      >
                        <span>{activeDict.viewDetails}</span> 
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </Link>
                      
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>ASDRI</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Section Bottom Primary CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href={`/${locale}/courses`}
            className="inline-flex items-center justify-center px-8 py-3.5 border border-transparent text-xs sm:text-sm font-bold rounded-xl text-emerald-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-md hover:shadow-amber-500/20 cursor-pointer gap-2"
          >
            <span>{activeDict.viewAllBottom}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
