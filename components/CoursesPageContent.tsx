'use client';

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RenderIcon } from '@/lib/iconMap';
import { CoursesPortal } from '@/components/CoursesPortal';
import { BookOpen, Sparkles, Award, GraduationCap, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { formatContentHtml } from '@/lib/contentFormatter';

export interface CardItem {
  id?: string;
  title: string;
  desc: string;
  icon?: string;
  badge?: string;
}

export interface CoursesPageData {
  title?: string;
  subtitle?: string;
  bannerImageUrl?: string;
  curriculumSectionTitle?: string;
  curriculumSectionDesc?: string;
  featureCardsTitle?: string;
  featureCards?: CardItem[];
  content?: string;
}

interface CoursesPageContentProps {
  locale: 'en' | 'bn' | 'ar';
}

export function CoursesPageContent({ locale }: CoursesPageContentProps) {
  const [data, setData] = useState<CoursesPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'site_pages', 'courses');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as CoursesPageData);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching courses page content:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fallbacks for Section Title & Desc
  const fallbackSectionTitle = locale === 'bn' 
    ? 'আমাদের কারিকুলাম ও সিলেবাস' 
    : locale === 'ar' 
    ? 'منهجنا الدراسي المعتمد' 
    : 'Our Curriculum & Structure';

  const fallbackSectionDesc = locale === 'bn'
    ? 'এএসডিআরআই-তে আমাদের পাঠ্যক্রম শাস্ত্রীয় ইসলামী স্কলারশিপের সাথে আধুনিক শিক্ষাগত পদ্ধতির সমন্বয় ঘটায়। আমরা শিক্ষার্থীদের বিশুদ্ধ, সুশৃঙ্খল এবং বাস্তবসম্মত শিক্ষা নিশ্চিত করি।'
    : locale === 'ar'
    ? 'في معهد السنّة للدعوة والبحوث، نربط بين العلوم الشرعية الأصيلة والمناهج التعليمية الحديثة لنضمن لطلابنا تعليماً شرعياً رصيناً ومثمراً.'
    : 'At ASDRI, our curriculum bridges classical Islamic scholarship with modern educational approaches. We ensure that our students receive an authentic, rigorous, and practical education.';

  const sectionTitle = data?.curriculumSectionTitle || fallbackSectionTitle;
  const sectionDesc = data?.curriculumSectionDesc || fallbackSectionDesc;

  // Feature cards
  const defaultFeatureCards: CardItem[] = [
    {
      title: locale === 'bn' ? 'আন্তর্জাতিক মানের সিলেবাস' : locale === 'ar' ? 'منهج معتمد دولياً' : 'Standardized Islamic Syllabus',
      desc: locale === 'bn' ? 'মদীনা ইসলামী বিশ্ববিদ্যালয় ও বিশ্বখ্যাত প্রতিষ্ঠানের কারিকুলামের আলোকে প্রণীত।' : 'Curriculum structured according to renowned classical Islamic universities.',
      icon: 'BookOpen'
    },
    {
      title: locale === 'bn' ? 'প্রথিতযশা স্কলার পরিষদ' : locale === 'ar' ? 'نخبة من العلماء والباحثين' : 'Distinguished Scholars & Mentors',
      desc: locale === 'bn' ? 'উচ্চতর হাদিস ও ফিকাহ গবেষক উস্তাদগণের প্রত্যক্ষ তত্ত্বাবধানে পাঠদান।' : 'Direct guidance under expert scholars of Hadith, Fiqh, and Arabic.',
      icon: 'GraduationCap'
    },
    {
      title: locale === 'bn' ? 'অনলাইন ও অফলাইন ব্যাচ' : locale === 'ar' ? 'فصول حضورية وعن بعد' : 'Hybrid Learning Options',
      desc: locale === 'bn' ? 'দেশ-বিদেশের যেকোনো প্রান্ত থেকে নিয়মিত ও সান্ধ্যকালীন ক্লাসে অংশগ্রহণের সুযোগ।' : 'Flexible daytime and evening schedules for students worldwide.',
      icon: 'Sparkles'
    },
    {
      title: locale === 'bn' ? 'সনদ ও উচ্চতর গবেষণার সুযোগ' : locale === 'ar' ? 'شهادات معتمدة وبحوث متقدمة' : 'Certification & Research',
      desc: locale === 'bn' ? 'কোর্স সফলভাবে সম্পন্নকারীদের প্রাতিষ্ঠানিক সার্টিফিকেট ও গবেষণার সুযোগ প্রদান।' : 'Official course certification and pathway to advanced specialized research.',
      icon: 'Award'
    }
  ];

  const featureCardsList = (data?.featureCards && data.featureCards.length > 0) 
    ? data.featureCards 
    : defaultFeatureCards;

  const featureCardsHeading = data?.featureCardsTitle || (
    locale === 'bn' 
      ? 'কোর্সের প্রধান বৈশিষ্ট্য ও একাডেমিক সুবিধাসমূহ' 
      : locale === 'ar' 
      ? 'مميزات البرامج الأكاديمية' 
      : 'Key Features of Our Programs'
  );

  const formattedNoticeHtml = data?.content ? formatContentHtml(data.content) : '';

  return (
    <div className="space-y-12">
      {/* 1. EDITABLE CURRICULUM INTRO & DESCRIPTION SECTION */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 border border-emerald-300/60 rounded-full text-[11px] font-extrabold text-[#064e3b] uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
          <span>{locale === 'bn' ? 'একাডেমিক মানদণ্ড ও সিলেবাস' : locale === 'ar' ? 'المعايير الأكاديمية والمنهج' : 'Academic Standards & Syllabus'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif leading-tight">
          {sectionTitle}
        </h2>
        
        <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>

        <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-sans">
          {sectionDesc}
        </p>
      </section>

      {/* 2. PROGRAM HIGHLIGHTS / FEATURE CARDS */}
      {featureCardsList.length > 0 && (
        <section className="space-y-6">
          {featureCardsHeading && (
            <div className="text-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 font-serif">
                {featureCardsHeading}
              </h3>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featureCardsList.map((card, idx) => (
              <div 
                key={idx}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all duration-300 flex flex-col group"
              >
                <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-3.5 text-[#064e3b] group-hover:bg-[#064e3b] group-hover:text-white transition-colors duration-300">
                  <RenderIcon name={card.icon || 'BookOpen'} className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 font-serif group-hover:text-[#064e3b] transition-colors">
                  {card.title}
                </h4>
                <p className="text-xs text-slate-600 font-sans leading-relaxed flex-1">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. OPTIONAL RICH TEXT INSTITUTIONAL NOTICE / SPECIAL INSTRUCTIONS */}
      {formattedNoticeHtml && (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider">
              {locale === 'bn' ? 'কোর্স সংক্রান্ত সাধারণ নোটিশ ও দিকনির্দেশনা' : locale === 'ar' ? 'إرشادات وتعليمات عامة حول المقررات' : 'General Course Notices & Guidelines'}
            </span>
          </div>
          <div 
            className="prose prose-emerald max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{ __html: formattedNoticeHtml }}
          />
        </div>
      )}

      {/* 4. INTERACTIVE COURSES PORTAL */}
      <section className="pt-2">
        <CoursesPortal locale={locale} />
      </section>
    </div>
  );
}
