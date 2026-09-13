'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/dictionary';
import { Course, getCourseCoverImage } from '@/lib/coursesData';
import { 
  BookOpen, Clock, Calendar, Users, GraduationCap, 
  ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, 
  FileText, Award, Share2, Phone, Mail, HelpCircle, 
  Sparkles, Check, ChevronRight, UserCheck, User
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface CourseDetailPageContentProps {
  course: Course;
  otherCourses: Course[];
  locale: Locale;
}

export function CourseDetailPageContent({ course, otherCourses, locale }: CourseDetailPageContentProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const dict = {
    en: {
      breadcrumbHome: 'Home',
      breadcrumbCourses: 'Academic Programs',
      courseCode: 'Course Code',
      batch: 'Batch',
      duration: 'Duration',
      track: 'Academic Track',
      instructor: 'Lead Instructor & Mentor',
      schedule: 'Class Schedule',
      startDate: 'Start Date',
      endDate: 'End Date',
      overviewTitle: 'Program Overview & Objectives',
      curriculumTitle: 'Curriculum Outline & Syllabus',
      eligibilityTitle: 'Admission Requirements & Eligibility',
      outcomesTitle: 'Expected Learning Outcomes',
      certificationTitle: 'Academic Certification & Recognition',
      applyNow: 'Apply for this Program',
      applySub: 'Applications are currently open for the upcoming academic session.',
      admissionGuide: 'Admission Guidelines',
      askQuestions: 'Have Questions? Contact Admissions',
      shareCourse: 'Share Program',
      linkCopied: 'Link Copied to Clipboard!',
      otherPrograms: 'Other Academic Programs',
      viewAllPrograms: 'View All Programs',
      mode: 'Study Mode',
      modeValue: 'On-Campus & Online Hybrid',
      language: 'Instruction Language',
      languageValue: 'Arabic & Bengali with Academic English',
      backToPrograms: 'Back to All Programs',
    },
    bn: {
      breadcrumbHome: 'হোম',
      breadcrumbCourses: 'একাডেমিক প্রোগ্রামসমূহ',
      courseCode: 'কোর্স কোড',
      batch: 'ব্যাচ',
      duration: 'কোর্সের মেয়াদ',
      track: 'একাডেমিক বিভাগ',
      instructor: 'প্রধান প্রশিক্ষক ও গবেষক',
      schedule: 'ক্লাস সময়সূচী',
      startDate: 'ক্লাস শুরুর তারিখ',
      endDate: 'সমাপ্তি তারিখ',
      overviewTitle: 'কোর্সের পরিচিতি ও একাডেমিক রূপরেখা',
      curriculumTitle: 'বিস্তারিত সিলেবাস ও পাঠ্যসূচি',
      eligibilityTitle: 'ভর্তির যোগ্যতা ও আবশ্যকীয় শর্তাবলী',
      outcomesTitle: 'অর্জিত দক্ষতা ও শিক্ষণীয় বিষয়',
      certificationTitle: 'সনদ ও একাডেমিক মূল্যায়ন',
      applyNow: 'এই কোর্সে ভর্তি আবেদন করুন',
      applySub: 'আসন্ন শিক্ষাবর্ষের জন্য ভর্তি আবেদন গ্রহণ চলছে। সীমিত আসন।',
      admissionGuide: 'ভর্তির নির্দেশিকা ও নিয়মাবলী',
      askQuestions: 'যেকোনো তথ্যের জন্য ভর্তি সেলে যোগাযোগ করুন',
      shareCourse: 'কোর্সটি শেয়ার করুন',
      linkCopied: 'কোর্সের লিংক কপি করা হয়েছে!',
      otherPrograms: 'অন্যান্য একাডেমিক প্রোগ্রামসমূহ',
      viewAllPrograms: 'সকল প্রোগ্রাম দেখুন',
      mode: 'পাঠদান মাধ্যম',
      modeValue: 'অন-ক্যাম্পাস ও অনলাইন লাইভ হাইব্রিড',
      language: 'শিক্ষাদানের ভাষা',
      languageValue: 'আরবি ও বাংলা (প্রয়োজনে প্রাতিষ্ঠানিক ইংরেজি)',
      backToPrograms: 'সকল প্রোগ্রামে ফিরে যান',
    },
    ar: {
      breadcrumbHome: 'الرئيسية',
      breadcrumbCourses: 'البرامج الأكاديمية',
      courseCode: 'رمز البرنامج',
      batch: 'الدفعة',
      duration: 'المدة الزمنية',
      track: 'المسار الأكاديمي',
      instructor: 'المشرف العلمي والمدرس',
      schedule: 'مواعيد المحاضرات',
      startDate: 'تاريخ البدء',
      endDate: 'تاريخ الانتهاء',
      overviewTitle: 'نظرة عامة على البرنامج وأهدافه',
      curriculumTitle: 'المنهج الدراسي ومفردات المقرر',
      eligibilityTitle: 'شروط القبول والأهلية الأكاديمية',
      outcomesTitle: 'المخرجات التعليمية المتوقعة',
      certificationTitle: 'الشهادة والاعتماد الأكاديمي',
      applyNow: 'تقديم طلب الالتحاق بالبرنامج',
      applySub: 'باب التسجيل والقبول مفتوح حالياً للدفعة القادمة.',
      admissionGuide: 'دليل وشروط القبول',
      askQuestions: 'هل لديك استفسار؟ تواصل مع إدارة القبول',
      shareCourse: 'مشاركة البرنامج',
      linkCopied: 'تم نسخ الرابط بنجاح!',
      otherPrograms: 'برامج أكاديمية أخرى',
      viewAllPrograms: 'عرض جميع البرامج',
      mode: 'نمط الدراسة',
      modeValue: 'حضوري وعبر المنصة التعليمية',
      language: 'لغة التدريس',
      languageValue: 'العربية الفصحى مع دعم إرشادي',
      backToPrograms: 'العودة لجميع البرامج',
    }
  };

  const t = dict[locale] || dict.en;

  const getLocalizedTitle = () => {
    if (locale === 'bn' && course.titleBn) return course.titleBn;
    if (locale === 'ar' && course.titleAr) return course.titleAr;
    if (locale === 'en' && course.titleEn) return course.titleEn;
    return course.title;
  };

  const getLocalizedDesc = () => {
    if (locale === 'bn' && course.descriptionBn) return course.descriptionBn;
    if (locale === 'ar' && course.descriptionAr) return course.descriptionAr;
    if (locale === 'en' && course.descriptionEn) return course.descriptionEn;
    return course.description;
  };

  const coverImage = getCourseCoverImage(course);

  const handleApplyClick = () => {
    if (!user) {
      const redirectPath = `dashboard/apply?course=${encodeURIComponent(course.id)}`;
      router.push(`/${locale}/login?redirect=${encodeURIComponent(redirectPath)}`);
    } else {
      router.push(`/${locale}/dashboard/apply?course=${encodeURIComponent(course.id)}`);
    }
  };

  const handleShareClick = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Parse curriculum lines
  const curriculumLines = course.curriculum 
    ? course.curriculum.split('\n').map(l => l.trim()).filter(Boolean)
    : [
        locale === 'bn' ? 'কোর ইসলামিক টেক্সট ও ধ্রুপদী ব্যাখ্যা বিশ্লেষণ' : 'Core Classical Islamic Texts & Critical Analysis',
        locale === 'bn' ? 'বাস্তবধর্মী প্রায়োগিক পাঠ ও আধুনিক সমস্যার শরীয়াহ মূল্যায়ন' : 'Applied Methodologies & Modern Contextual Fiqh',
        locale === 'bn' ? 'গবেষণামূলক সেমিনার, মেন্টরশিপ ও পেপার প্রেজেন্টেশন' : 'Research Seminars, Mentorship & Scholarly Paper Defense'
      ];

  const descText = getLocalizedDesc() || '';
  const overviewParagraphs = descText
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 flex-wrap">
          <Link href={`/${locale}`} className="hover:text-[#064e3b] transition-colors font-medium">
            {t.breadcrumbHome}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
          <Link href={`/${locale}/courses`} className="hover:text-[#064e3b] transition-colors font-medium">
            {t.breadcrumbCourses}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 rtl:rotate-180" />
          <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
            {getLocalizedTitle()}
          </span>
        </div>

        {/* Back Link */}
        <div className="mb-6">
          <Link 
            href={`/${locale}/courses`}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#064e3b] hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            <span>{t.backToPrograms}</span>
          </Link>
        </div>

        {/* Course Header Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-10">
          <div className="relative bg-[#064e3b] text-white p-6 sm:p-10 lg:p-12 overflow-hidden min-h-[220px]">
            {/* Banner Cover Image Background */}
            {coverImage && (
              <img
                src={coverImage}
                alt={getLocalizedTitle()}
                className="absolute inset-0 w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            {/* Dark gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/90 to-emerald-900/75" />

            {/* Ambient pattern */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"1.5\\"/%3E%3Ccircle cx=\\"15\\" cy=\\"15\\" r=\\"1.5\\"/%3E%3C/g%3E%3C/svg%3E")'
              }}
            />

            <div className="relative z-10 max-w-4xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-lg shadow-xs">
                  {course.code || 'ASDRI'}
                </span>
                {course.batchNumber && (
                  <span className="px-3 py-1 bg-white/15 backdrop-blur-xs border border-white/20 text-emerald-200 text-xs font-bold rounded-lg">
                    {course.batchNumber}
                  </span>
                )}
                <span className="px-3 py-1 bg-emerald-800/80 border border-emerald-600/60 text-emerald-100 text-xs font-semibold rounded-lg">
                  {course.type || 'Academic Track'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif tracking-tight leading-snug">
                {getLocalizedTitle()}
              </h1>

              {descText && (
                <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed sm:leading-7 max-w-3xl text-justify [text-justify:inter-word] line-clamp-3">
                  {descText}
                </p>
              )}

              {/* Fast stats row inside banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-emerald-700/60 mt-6">
                <div>
                  <span className="text-[11px] text-emerald-300 block font-medium">{t.duration}</span>
                  <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-amber-300" />
                    {course.duration || '1 Year'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 block font-medium">{t.instructor}</span>
                  <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5 truncate">
                    <Users className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="truncate">{course.instructor}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 block font-medium">{t.mode}</span>
                  <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-4 h-4 text-amber-300" />
                    {locale === 'bn' ? 'হাইব্রিড / ক্লাসরুম' : 'Campus / Online'}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-emerald-300 block font-medium">{t.startDate}</span>
                  <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-4 h-4 text-amber-300" />
                    {course.startDate || (locale === 'bn' ? 'শীঘ্রই শুরু' : 'Rolling')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Content (8 cols) + Sticky Action Sidebar (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 8 COLUMNS: Detailed Academic Information */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Program Overview */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <BookOpen className="w-5 h-5 text-[#064e3b]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                  {t.overviewTitle}
                </h2>
              </div>

              {/* Description Body with Ample Breathing Space and Justified Typography */}
              <div className="space-y-4">
                {overviewParagraphs.length > 0 ? (
                  overviewParagraphs.map((para, idx) => (
                    <p 
                      key={idx} 
                      className="text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-8 text-justify [text-justify:inter-word] whitespace-pre-line"
                    >
                      {para}
                    </p>
                  ))
                ) : (
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed sm:leading-8 text-justify [text-justify:inter-word] whitespace-pre-line">
                    {descText || (locale === 'bn' ? 'কোর্সের বিস্তারিত তথ্য শিগগিরই সংযুক্ত করা হবে।' : 'Program details will be updated shortly.')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100/80">
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-emerald-950 block">
                      {locale === 'bn' ? 'বিশুদ্ধ শাস্ত্রীয় ভিত্তি' : 'Authentic Classical Grounding'}
                    </span>
                    <span className="text-emerald-800 leading-relaxed">
                      {locale === 'bn' ? 'কুরআন ও সুন্নাহর প্রামাণ্য মূলনীতি অনুসারে প্রণীত পাঠ্যক্রম।' : 'Grounded in orthodox methodology and established textual sources.'}
                    </span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start gap-2.5">
                  <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-amber-950 block">
                      {locale === 'bn' ? 'সরাসরি শিক্ষক মেন্টরশিপ' : 'Direct Scholarly Mentorship'}
                    </span>
                    <span className="text-amber-800 leading-relaxed">
                      {locale === 'bn' ? 'উস্তাদগণের সার্বক্ষণিক নিবিড় দিকনির্দেশনা ও তত্ত্বাবধান।' : 'Continuous interactive supervision by specialized professors.'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Detailed Curriculum / Syllabus */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <FileText className="w-5 h-5 text-[#064e3b]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                  {t.curriculumTitle}
                </h2>
              </div>
              <div className="space-y-3">
                {curriculumLines.map((line, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 transition-colors flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#064e3b] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug block">
                        {line}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Eligibility Criteria */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <UserCheck className="w-5 h-5 text-[#064e3b]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                  {t.eligibilityTitle}
                </h2>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-900">
                  {course.eligibility || (
                    locale === 'bn'
                      ? 'ন্যূনতম শিক্ষাগত যোগ্যতা: কওমি মাদ্রাসার তাকমিল/দাওরায়ে হাদিস অথবা সাধারণ ধারার স্নাতক/এইচএসসি।'
                      : 'Minimum requirement: Takmil/Dawra-e-Hadith or recognized undergraduate/HSC degree with foundational Arabic competence.'
                  )}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#064e3b] font-medium pt-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{locale === 'bn' ? 'ভর্তির পূর্বে মৌখিক সাক্ষাৎকার (ভাইভা) নেওয়া হতে পারে।' : 'Pre-admission viva or oral interview may be conducted.'}</span>
                </div>
              </div>
            </div>

            {/* 4. Lead Faculty Member Profile */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <GraduationCap className="w-5 h-5 text-[#064e3b]" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
                  {t.instructor}
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {course.instructorAvatar ? (
                  <img 
                    src={getOptimizedImageUrl(course.instructorAvatar)}
                    alt={course.instructor}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-200 shadow-xs shrink-0 bg-slate-100"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-emerald-950 border-2 border-emerald-200/60 shadow-xs shrink-0 flex items-center justify-center text-emerald-200">
                    <User className="w-10 h-10 text-emerald-300/80" />
                  </div>
                )}
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                    {course.instructor}
                  </h3>
                  <p className="text-xs text-[#064e3b] font-bold">
                    {course.instructorRole || (locale === 'bn' ? 'অনুষদ সদস্য ও সিনিয়র গবেষক' : 'Faculty Member & Senior Researcher')}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    {locale === 'bn' 
                      ? 'এএসডিআরআই-এর শিক্ষা পর্ষদের সম্মানিত সদস্য এবং উচ্চতর ইসলামী গবেষণা অনুষদের নিয়মিত প্রশিক্ষক।'
                      : 'Distinguished faculty member at ASDRI providing intensive academic supervision in classical theological disciplines.'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT 4 COLUMNS: Sticky Action & Details Card */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-6 space-y-6">
              
              {/* Cover Image Preview */}
              <div className="w-full h-48 rounded-xl bg-slate-100 overflow-hidden relative group">
                <img 
                  src={coverImage} 
                  alt={getLocalizedTitle()} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-[#064e3b] text-amber-300 text-[10px] font-extrabold uppercase">
                  {course.code}
                </span>
              </div>

              {/* Primary Apply Action Button */}
              <div className="space-y-2">
                <button
                  onClick={handleApplyClick}
                  className="w-full py-3.5 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{t.applyNow}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </button>
                <p className="text-[11px] text-center text-slate-500">
                  {t.applySub}
                </p>
              </div>

              {/* Quick Specs List */}
              <div className="divide-y divide-slate-100 text-xs text-slate-600">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">{t.courseCode}</span>
                  <span className="font-bold text-slate-900">{course.code}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">{t.batch}</span>
                  <span className="font-bold text-slate-900">{course.batchNumber || 'Batch 01'}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">{t.duration}</span>
                  <span className="font-bold text-slate-900">{course.duration}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">{t.track}</span>
                  <span className="font-bold text-[#064e3b]">{course.type}</span>
                </div>
                {course.schedule && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400 font-medium">{t.schedule}</span>
                    <span className="font-bold text-slate-900 text-right max-w-[180px] truncate">{course.schedule}</span>
                  </div>
                )}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">{t.mode}</span>
                  <span className="font-bold text-slate-900 text-right max-w-[200px]">{course.studyMode || t.modeValue}</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">{t.language}</span>
                  <span className="font-bold text-slate-900 text-right max-w-[200px]">{course.instructionLanguage || t.languageValue}</span>
                </div>
              </div>

              {/* Secondary Actions: Share & Guidelines */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                <button
                  onClick={handleShareClick}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{t.linkCopied}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.shareCourse}</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/${locale}/admission`}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 text-[#064e3b] border border-emerald-200/80 text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t.admissionGuide}</span>
                </Link>
              </div>

              {/* Contact Help */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-1.5">
                <span className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
                  {t.askQuestions}
                </span>
                <p className="text-slate-600">
                  Email: <span className="font-semibold text-slate-900">admissions@assunnah.institute</span>
                </p>
                <p className="text-slate-600">
                  Phone: <span className="font-semibold text-slate-900">+880 1700-000000</span>
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* BOTTOM SECTION: Other Academic Programs */}
        {otherCourses.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                  {t.otherPrograms}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {locale === 'bn' ? 'আপনার জন্য প্রাসঙ্গিক আরও কিছু শাস্ত্রীয় ও গবেষণামূলক কোর্স।' : 'Explore related foundational and specialized courses.'}
                </p>
              </div>

              <Link
                href={`/${locale}/courses`}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#064e3b] hover:text-emerald-700 transition-colors"
              >
                <span>{t.viewAllPrograms}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </div>

            {/* 3 Columns Grid for Other Courses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherCourses.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/${locale}/courses/${encodeURIComponent(item.id)}`}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  <div className="w-full h-44 relative bg-slate-100 overflow-hidden shrink-0">
                    <img 
                      src={getCourseCoverImage(item)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 bg-[#064e3b] text-amber-300 text-[10px] font-extrabold uppercase rounded shadow-xs">
                      {item.code}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded">
                          {item.duration}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200/60 rounded">
                          {item.type}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 font-serif group-hover:text-[#064e3b] transition-colors line-clamp-2 leading-snug mb-2">
                        {locale === 'bn' && item.titleBn ? item.titleBn : item.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#064e3b]">
                      <span>{locale === 'bn' ? 'বিস্তারিত দেখুন' : 'View Details'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
