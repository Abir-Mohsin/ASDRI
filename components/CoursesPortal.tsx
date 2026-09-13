'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Clock, Users, ArrowRight, Search, ShieldCheck, Calendar, GraduationCap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course, fetchAllCourses, getCourseCoverImage } from '@/lib/coursesData';

const pt = {
  en: {
    searchPlaceholder: "Search academic programs by name, code, or instructor...",
    allTypes: "All Programs",
    core: "Core Programs",
    elective: "Specialized & Elective",
    durationLabel: "Duration",
    typeLabel: "Track",
    instructorLabel: "Instructor",
    nextClassLabel: "Schedule",
    applyNow: "Apply for Admission",
    noCourses: "No courses found matching your query.",
    academicBoard: "ASDRI Approved Curriculum",
    learnMore: "View Course Details & Outline",
    batchLabel: "Batch",
    startDate: "Starts",
  },
  bn: {
    searchPlaceholder: "নাম, কোড বা প্রশিক্ষক দিয়ে একাডেমিক প্রোগ্রাম খুঁজুন...",
    allTypes: "সকল প্রোগ্রাম",
    core: "আবশ্যিক কোর্সসমূহ",
    elective: "স্পেশালাইজড ও ঐচ্ছিক",
    durationLabel: "মেয়াদ",
    typeLabel: "ট্র্যাক",
    instructorLabel: "প্রশিক্ষক",
    nextClassLabel: "সময়সূচী",
    applyNow: "ভর্তির জন্য আবেদন করুন",
    noCourses: "আপনার অনুসন্ধান অনুযায়ী কোনো কোর্স পাওয়া যায়নি।",
    academicBoard: "এএসডিআরআই অনুমোদিত সিলেবাস",
    learnMore: "বিস্তারিত ও আউটলাইন দেখুন",
    batchLabel: "ব্যাচ",
    startDate: "শুরু",
  },
  ar: {
    searchPlaceholder: "ابحث عن البرامج الأكاديمية بالاسم أو الرمز أو المدرس...",
    allTypes: "جميع البرامج",
    core: "المقررات الأساسية",
    elective: "المقررات التخصصية",
    durationLabel: "المدة",
    typeLabel: "المسار",
    instructorLabel: "المدرس",
    nextClassLabel: "الجدول",
    applyNow: "تقديم طلب القبول",
    noCourses: "لم يتم العثور على مقررات تطابق البحث.",
    academicBoard: "منهج معتمد من المعهد",
    learnMore: "عرض التفاصيل ومفردات المنهج",
    batchLabel: "الدفعة",
    startDate: "البدء",
  }
};

interface CoursesPortalProps {
  locale: 'en' | 'bn' | 'ar';
}

export function CoursesPortal({ locale }: CoursesPortalProps) {
  const router = useRouter();
  const dict = pt[locale] || pt.en;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('All');
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllCourses();
        setCourses(data);
      } catch (err) {
        console.error("Error loading courses in portal:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourses();
  }, [locale]);

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

  const truncateDescription = (text?: string, maxLength: number = 130) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Filter courses based on search query and track
  const filteredCourses = courses.filter(course => {
    const title = getCourseTitle(course).toLowerCase();
    const code = (course.code || '').toLowerCase();
    const instructor = (course.instructor || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = title.includes(q) || code.includes(q) || instructor.includes(q);
      
    const matchesType = 
      activeType === 'All' || 
      (activeType === 'Core' && (course.type === 'Core' || course.type === 'Foundational')) ||
      (activeType === 'Elective' && (course.type !== 'Core' && course.type !== 'Foundational'));

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-10 font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Search and Filters Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="relative">
          <Search className={`absolute ${locale === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className={`w-full ${locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064e3b] focus:bg-white text-sm placeholder-slate-400 transition-all font-sans shadow-2xs`}
          />
        </div>

        {/* Categories Filter Pills */}
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 pt-3.5 scrollbar-thin">
          {[
            { id: 'All', label: dict.allTypes },
            { id: 'Core', label: dict.core },
            { id: 'Elective', label: dict.elective },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveType(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeType === cat.id
                  ? 'bg-[#064e3b] text-white shadow-xs font-extrabold'
                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-[#064e3b]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid: 3 Columns with Banner on Top and Snap Details on Bottom */}
      {isLoading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#064e3b]"></div>
          <span className="text-xs text-slate-500 font-medium">Loading programs...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-2xs p-8 max-w-lg mx-auto">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">{dict.noCourses}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {filteredCourses.map((course) => {
            const coverUrl = getCourseCoverImage(course);
            const courseTitle = getCourseTitle(course);
            const courseDesc = getCourseDesc(course);

            return (
              <div 
                key={course.id} 
                onClick={() => router.push(`/${locale}/courses/${encodeURIComponent(course.id)}`)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden group cursor-pointer h-full"
              >
                {/* Card Top: Banner Poster Area */}
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

                  {/* Bottom info row inside image */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
                    <span className="px-2 py-0.5 rounded bg-black/40 backdrop-blur-xs border border-white/20">
                      {course.type || 'Academic Track'}
                    </span>
                    {course.startDate && (
                      <span className="flex items-center gap-1 text-emerald-200 drop-shadow-sm">
                        <Calendar className="w-3 h-3 text-amber-300" />
                        {course.startDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Snap Details Area */}
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

                    {/* Instructor Info */}
                    {course.instructor && (
                      <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mb-3 pt-2 border-t border-slate-100">
                        <GraduationCap className="w-3.5 h-3.5 text-[#064e3b] shrink-0" />
                        <span className="text-slate-400 font-normal">{dict.instructorLabel}:</span>
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
                      <span>{dict.learnMore}</span> 
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

    </div>
  );
}
