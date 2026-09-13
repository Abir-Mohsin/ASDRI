'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/dictionary';
import { 
  User, Users, GraduationCap, ArrowRight, Award, 
  Sparkles, BookOpen, ExternalLink, ShieldCheck 
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FacultyMember } from '@/components/FacultyPageContent';

interface HomeFacultySpotlightProps {
  locale: Locale;
}

export function HomeFacultySpotlight({ locale }: HomeFacultySpotlightProps) {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dict = {
    en: {
      badge: 'Academic Leadership & Distinguished Scholars',
      title: 'Our Renowned Faculty & Researchers',
      subtitle: 'Learn under the mentorship of internationally acclaimed Islamic scholars, professors, and researchers holding degrees from premier Islamic universities.',
      viewAll: 'Meet All Faculty Members',
      viewProfile: 'View Academic Profile',
      specializationLabel: 'Research Focus:',
      department: 'Department'
    },
    bn: {
      badge: 'একাডেমিক নেতৃত্ব ও প্রখ্যাত শিক্ষকমণ্ডলী',
      title: 'আমাদের বিশিষ্ট উস্তায ও গবেষকবৃন্দ',
      subtitle: 'মদীনা ইসলামী বিশ্ববিদ্যালয়, আল-আজহারসহ বিশ্বের শীর্ষস্থানীয় ইসলামী বিশ্ববিদ্যালয়সমূহের ডিগ্রিধারী প্রখ্যাত স্কলার ও গবেষকদের সরাসরি তত্ত্বাবধানে শিক্ষা গ্রহণ।',
      viewAll: 'সকল শিক্ষক ও গবেষকদের দেখুন',
      viewProfile: 'প্রোফাইল দেখুন',
      specializationLabel: 'গবেষণার ক্ষেত্র:',
      department: 'বিভাগ'
    },
    ar: {
      badge: 'الهيئة التدريسية والعلماء الأجلاء',
      title: 'نخبة من الأساتذة والعلماء والباحثين',
      subtitle: 'تلقى العلوم الشرعية على أيدي نخبة متميزة من كبار العلماء والأساتذة خريجي كبرى الجامعات الإسلامية العريقة كالجامعة الإسلامية بالمدينة والأزهر الشريف.',
      viewAll: 'عرض كامل أعضاء الهيئة التدريسية',
      viewProfile: 'عرض الملف الأكاديمي',
      specializationLabel: 'مجالات البحث:',
      department: 'القسم'
    }
  };

  const t = dict[locale] || dict.en;

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const q = query(collection(db, 'faculty_profiles'), orderBy('order', 'asc'), limit(4));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as FacultyMember));
          setFacultyList(list.slice(0, 4));
        } else {
          setFacultyList([]);
        }
      } catch (err) {
        console.warn('Faculty spotlight notice:', err);
        setFacultyList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaculty();
  }, []);

  const getLocalizedName = (member: FacultyMember) => {
    if (locale === 'en' && member.nameEn) return member.nameEn;
    if (locale === 'ar' && member.nameAr) return member.nameAr;
    return member.name;
  };

  const getLocalizedDesignation = (member: FacultyMember) => {
    if (locale === 'en' && member.designationEn) return member.designationEn;
    if (locale === 'ar' && member.designationAr) return member.designationAr;
    return member.designation;
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50 border-t border-slate-200/80 font-sans" id="home_faculty_spotlight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/60 text-[#064e3b] text-xs font-bold mb-3 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.badge}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] font-serif tracking-tight">
              {t.title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              {t.subtitle}
            </p>
          </div>

          <Link
            href={`/${locale}/faculty`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-[#064e3b] text-[#064e3b] hover:text-white border border-slate-200 hover:border-[#064e3b] text-xs sm:text-sm font-bold transition-all duration-200 shrink-0 self-start md:self-auto group shadow-2xs"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Faculty Grid */}
        {isLoading ? (
          <div className="py-12 text-center flex flex-col justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]"></div>
            <span className="text-xs text-slate-400">Loading faculty...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {facultyList.map((member, idx) => (
              <div
                key={member.id || idx}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Photo */}
                  <div className="w-full h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                    {member.photoUrl ? (
                      <img 
                        src={member.photoUrl}
                        alt={getLocalizedName(member)}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-900 flex flex-col items-center justify-center text-emerald-100 group-hover:scale-105 transition-transform duration-500">
                        <User className="w-16 h-16 text-emerald-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    
                    <span className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-200 backdrop-blur-xs border border-emerald-500/30">
                      {member.department?.toUpperCase() || 'RESEARCH'}
                    </span>
                  </div>

                  {/* Body info */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-bold text-slate-900 font-serif leading-snug group-hover:text-[#064e3b] transition-colors">
                      {getLocalizedName(member)}
                    </h3>
                    <p className="text-xs text-emerald-800 font-semibold line-clamp-1">
                      {getLocalizedDesignation(member)}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2">
                      {member.education || 'Islamic Scholar & Researcher'}
                    </p>

                    {member.specialization && member.specialization.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {member.specialization.slice(0, 2).map((spec, sIdx) => (
                          <span 
                            key={sIdx}
                            className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/${locale}/faculty`}
                    className="w-full block text-center py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-[#064e3b] border border-slate-200/80 hover:border-emerald-200 text-xs font-bold transition-colors"
                  >
                    {t.viewProfile}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
