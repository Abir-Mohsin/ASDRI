'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/dictionary';
import { ArrowRight, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getOptimizedImageUrl, getDriveImageCandidates, isGoogleDriveUrl } from '@/lib/imageUtils';
import { RenderIcon } from '@/lib/iconMap';

export interface HeroStatItem {
  id?: string;
  value: string;
  label: string;
  subtitle?: string;
  icon?: string;
}

interface HeroData {
  title?: string;
  titleEn?: string;
  titleBn?: string;
  titleAr?: string;
  subtitle?: string;
  subtitleEn?: string;
  subtitleBn?: string;
  subtitleAr?: string;
  bannerImageUrl?: string;
  rawBannerDriveUrl?: string;
  overlayOpacity?: number; // 0 to 100
  overlayStyle?: 'emerald_gradient' | 'dark_gradient' | 'amber_gradient' | 'solid_dark' | 'subtle';
  showPattern?: boolean;
  showGlow?: boolean;
  badgeText?: string;
  badgeTextEn?: string;
  badgeTextBn?: string;
  badgeTextAr?: string;
  applyBtnText?: string;
  applyBtnTextEn?: string;
  applyBtnTextBn?: string;
  applyBtnTextAr?: string;
  applyBtnLink?: string;
  learnBtnText?: string;
  learnBtnTextEn?: string;
  learnBtnTextBn?: string;
  learnBtnTextAr?: string;
  learnBtnLink?: string;
  highlights?: string[];
  highlightsEn?: string[];
  highlightsBn?: string[];
  highlightsAr?: string[];
  stats?: HeroStatItem[];
}

export function Hero({ dict, locale }: { dict: any; locale: Locale }) {
  const [data, setData] = useState<HeroData | null>(null);
  const [imgError, setImgError] = useState(false);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    const docRef = doc(db, 'site_pages', 'home');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data() as HeroData);
          setImgError(false);
          setCandidateIndex(0);
        }
      },
      (err) => {
        console.warn('Hero real-time listener notice:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  const defaultBadgeText = {
    bn: 'কুরআন ও সুন্নাহ ভিত্তিক উচ্চতর শিক্ষা ও গবেষণা ইনস্টিটিউট',
    en: 'Academic Center for Authentic Islamic Studies & Classical Research',
    ar: 'معهد أكاديمي متخصص في الدراسات الإسلامية والبحوث العلمية'
  };

  const defaultTitles = {
    en: 'As-Sunnah Dawah & Research Institute',
    bn: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট',
    ar: 'معهد السنة للدعوة والبحوث العلمية'
  };

  const defaultSubtitles = {
    en: 'Center for Higher Islamic Education & Contemporary Research in Light of the Holy Quran and Authentic Sunnah',
    bn: 'পবিত্র কুরআন ও বিশুদ্ধ সুন্নাহর আলোকে উচ্চতর ইসলামী শিক্ষা ও সমসাময়িক গবেষণা প্রতিষ্ঠান',
    ar: 'صرح أكاديمي للتعليم العالي والدراسات الإسلامية المعاصرة وفق الكتاب والسنة النبوية المطهرة'
  };

  const currentBadge =
    (locale === 'bn' ? data?.badgeTextBn : locale === 'ar' ? data?.badgeTextAr : data?.badgeTextEn) ||
    (locale === 'en' ? (data?.badgeTextEn || defaultBadgeText.en) : (data?.badgeText || defaultBadgeText[locale] || defaultBadgeText.en));

  const defaultHighlights = {
    bn: [
      'আধুনিক ও ধ্রুপদী পাঠ্যক্রম',
      'উচ্চতর দাওয়াহ ও গবেষণা',
      'যোগ্য শিক্ষকমণ্ডলী',
      'আন্তর্জাতিক একাডেমি মান'
    ],
    en: [
      'Classical & Modern Curriculum',
      'Advanced Research & Dawah',
      'Distinguished Faculty',
      'International Academic Standards'
    ],
    ar: [
      'مناهج أصيلة ومعاصرة',
      'بحوث ودعوة متقدمة',
      'نخبة من العلماء والأساتذة',
      'معايير أكاديمية دولية'
    ]
  };

  const customHighlights =
    (locale === 'bn' ? data?.highlightsBn : locale === 'ar' ? data?.highlightsAr : data?.highlightsEn) ||
    (locale === 'en' ? data?.highlightsEn : data?.highlights);

  const highlights =
    customHighlights && customHighlights.length > 0
      ? customHighlights
      : defaultHighlights[locale] || defaultHighlights.en;

  const fallbackImage =
    'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=2400&q=85';

  const rawImage = data?.bannerImageUrl || fallbackImage;
  const isDrive = isGoogleDriveUrl(rawImage);
  const candidates = isDrive ? getDriveImageCandidates(rawImage) : [rawImage];
  const currentCandidate = candidates[candidateIndex] || fallbackImage;
  const optimizedImage = imgError ? fallbackImage : (isDrive ? currentCandidate : getOptimizedImageUrl(rawImage, fallbackImage));

  // Overlay Opacity: default 75%
  const opacityVal = typeof data?.overlayOpacity === 'number' ? Math.max(0, Math.min(100, data.overlayOpacity)) : 75;
  const overlayOpacityDecimal = opacityVal / 100;

  // Overlay Gradient style
  const overlayStyle = data?.overlayStyle || 'emerald_gradient';
  let overlayGradientClass = 'bg-gradient-to-b from-[#064e3b] via-[#064e3b]/90 to-[#043e2f]';

  if (overlayStyle === 'dark_gradient') {
    overlayGradientClass = 'bg-gradient-to-b from-slate-950 via-slate-900 to-black';
  } else if (overlayStyle === 'amber_gradient') {
    overlayGradientClass = 'bg-gradient-to-b from-[#064e3b] via-[#0d3f30] to-amber-950';
  } else if (overlayStyle === 'solid_dark') {
    overlayGradientClass = 'bg-black';
  } else if (overlayStyle === 'subtle') {
    overlayGradientClass = 'bg-gradient-to-b from-black/80 via-black/40 to-black/90';
  }

  const showPattern = data?.showPattern ?? true;
  const showGlow = data?.showGlow ?? true;

  const heroTitle = 
    locale === 'bn' 
      ? (data?.titleBn || (data?.title && !data?.titleEn ? data.title : defaultTitles.bn))
      : locale === 'ar'
      ? (data?.titleAr || defaultTitles.ar)
      : (data?.titleEn || defaultTitles.en);

  const heroSubtitle = 
    locale === 'bn'
      ? (data?.subtitleBn || (data?.subtitle && !data?.subtitleEn ? data.subtitle : defaultSubtitles.bn))
      : locale === 'ar'
      ? (data?.subtitleAr || defaultSubtitles.ar)
      : (data?.subtitleEn || defaultSubtitles.en);

  const applyBtnText = 
    (locale === 'bn' ? data?.applyBtnTextBn : locale === 'ar' ? data?.applyBtnTextAr : data?.applyBtnTextEn) ||
    dict?.home?.apply_now || (locale === 'bn' ? 'আবেদন করুন' : locale === 'ar' ? 'قدم الآن' : 'Apply Now');
  const applyBtnLink = data?.applyBtnLink || `/${locale}/admission`;

  const learnBtnText = 
    (locale === 'bn' ? data?.learnBtnTextBn : locale === 'ar' ? data?.learnBtnTextAr : data?.learnBtnTextEn) ||
    dict?.home?.learn_more || (locale === 'bn' ? 'আরও জানুন' : locale === 'ar' ? 'اعرف المزيد' : 'Learn More');
  const learnBtnLink = data?.learnBtnLink || `/${locale}/about`;

  return (
    <div className="relative w-full bg-[#064e3b] overflow-hidden min-h-[560px] sm:min-h-[620px] flex items-center">
      {/* Edge-to-edge background image */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={`${optimizedImage}_${candidateIndex}`}
          src={optimizedImage}
          alt="As-Sunnah Dawah and Research Institute Campus & Architecture"
          referrerPolicy="no-referrer"
          onError={() => {
            if (candidateIndex < candidates.length - 1) {
              setCandidateIndex((prev) => prev + 1);
            } else if (!imgError) {
              setImgError(true);
            }
          }}
          className="w-full h-full object-cover object-center scale-105 transform filter brightness-95 transition-transform duration-1000"
        />

        {/* Dynamic Admin-Controlled Overlay Shape & Opacity */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 ${overlayGradientClass}`}
          style={{ opacity: overlayOpacityDecimal }}
        ></div>

        {/* Subtle geometric islamic pattern */}
        {showPattern && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"1.5\\"/%3E%3Ccircle cx=\\"15\\" cy=\\"15\\" r=\\"1.5\\"/%3E%3C/g%3E%3C/svg%3E")'
            }}
          ></div>
        )}

        {/* Radial ambient glow centered behind title */}
        {showGlow && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
        )}
      </div>

      {/* Centered max-width content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/85 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-bold shadow-md backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="leading-none">{currentBadge}</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white font-serif tracking-tight leading-[1.2] sm:leading-[1.2] drop-shadow-md">
            {heroTitle}
          </h1>

          {/* Hero Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-emerald-100/95 leading-relaxed font-normal drop-shadow-sm">
            {heroSubtitle}
          </p>

          {/* CTA Action Buttons */}
          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-3.5 sm:gap-4 justify-center items-center">
            <Link
              href={applyBtnLink}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 border border-transparent text-sm sm:text-base font-bold rounded-xl text-emerald-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/25 cursor-pointer"
            >
              <span>{applyBtnText}</span>
              <ArrowRight className="ml-2 rtl:mr-2 rtl:ml-0 rtl:rotate-180 w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </Link>

            <Link
              href={learnBtnLink}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 sm:py-4 border-2 border-emerald-400/80 hover:border-amber-400 bg-emerald-950/40 hover:bg-emerald-900/60 text-white font-bold rounded-xl text-sm sm:text-base transition-all backdrop-blur-xs cursor-pointer"
            >
              <BookOpen className="mr-2 rtl:ml-2 rtl:mr-0 w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-emerald-300" />
              <span>{learnBtnText}</span>
            </Link>
          </div>

          {/* Quick Institutional Highlights Row */}
          <div className="pt-8 sm:pt-10 border-t border-emerald-700/50 max-w-3xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] sm:text-xs font-semibold text-emerald-100/90 bg-emerald-950/40 sm:bg-transparent py-1.5 px-2.5 sm:p-0 rounded-lg border border-emerald-700/30 sm:border-0"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic English Key Statistics Cards (Placed cleanly below Hero content) */}
        {(() => {
          const defaultStats: HeroStatItem[] = [
            { id: 'stat-1', value: '15,000+', label: 'Active Students', subtitle: 'Enrolled across all courses', icon: 'GraduationCap' },
            { id: 'stat-2', value: '45+', label: 'Academic Programs', subtitle: 'Higher Islamic curriculum', icon: 'BookOpen' },
            { id: 'stat-3', value: '120+', label: 'Renowned Scholars', subtitle: 'Graduate faculty & researchers', icon: 'Users' },
            { id: 'stat-4', value: '60,000+', label: 'Library Books & Manuscripts', subtitle: 'Central digital repository', icon: 'BookMarked' },
            { id: 'stat-5', value: '99.4%', label: 'Academic Success Rate', subtitle: 'Graduates leading nationwide', icon: 'Award' }
          ];

          const statsList: HeroStatItem[] = (data?.stats && data.stats.length > 0) ? data.stats : defaultStats;

          return (
            <div className="mt-12 sm:mt-16 pt-8 border-t border-emerald-700/40 w-full">
              <div className="flex flex-wrap justify-center items-stretch gap-3 sm:gap-4 lg:gap-5">
                {statsList.map((stat, idx) => (
                  <div
                    key={stat.id || idx}
                    className="flex-1 min-w-[140px] max-w-[240px] sm:min-w-[170px] bg-amber-50/95 hover:bg-white border-2 border-amber-200/80 hover:border-amber-400 rounded-2xl p-4 sm:p-5 text-center shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-md flex flex-col justify-between items-center group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/90 border border-emerald-300/80 flex items-center justify-center text-[#064e3b] group-hover:scale-110 transition-transform mb-3 shrink-0 shadow-2xs">
                      <RenderIcon name={stat.icon || 'Sparkles'} className="w-5 h-5 text-[#064e3b]" />
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] tracking-tight font-sans">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1 leading-snug font-serif">
                        {stat.label}
                      </div>
                    </div>
                    {stat.subtitle && (
                      <div className="text-[10px] sm:text-[11px] text-slate-600 mt-2 line-clamp-2 leading-tight font-medium">
                        {stat.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
