'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, GraduationCap, BookOpen, Award, Mail, Clock, 
  ChevronRight, ExternalLink, X, Building2, BookMarked, 
  Sparkles, CheckCircle2, Shield, Phone, FileText, User
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Locale } from '@/lib/dictionary';
import Link from 'next/link';

export interface FacultyMember {
  id: string;
  name: string;
  nameEn?: string;
  nameAr?: string;
  designation: string;
  designationEn?: string;
  designationAr?: string;
  department: 'hadith' | 'fiqh' | 'tafsir' | 'dawah' | 'arabic' | 'research';
  education: string;
  educationEn?: string;
  educationAr?: string;
  photoUrl?: string;
  specialization: string[];
  bio: string;
  bioEn?: string;
  bioAr?: string;
  coursesTaught?: string[];
  publications?: string[];
  officeHours?: string;
  email?: string;
  phone?: string;
  order?: number;
}

export const INITIAL_FACULTY_MEMBERS: FacultyMember[] = [];

export function FacultyPageContent({ locale }: { locale: Locale }) {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  // Departments configuration
  const departments = [
    { id: 'all', labelBn: 'সকল বিভাগ', labelEn: 'All Departments', labelAr: 'جميع الأقسام' },
    { id: 'hadith', labelBn: 'হাদিস ও উলূমুল হাদিস', labelEn: 'Hadith & Its Sciences', labelAr: 'الحديث وعلومه' },
    { id: 'fiqh', labelBn: 'উচ্চতর ফিকহ ও ইফতা', labelEn: 'Fiqh & Fatwa Board', labelAr: 'الفقه والإفتاء' },
    { id: 'tafsir', labelBn: 'উলূমুল কুরআন ও তাফসির', labelEn: 'Quran & Tafsir', labelAr: 'التفسير وعلوم القرآن' },
    { id: 'dawah', labelBn: 'দাওয়াহ ও তুলনামূলক ধর্মতত্ত্ব', labelEn: 'Dawah & Thought', labelAr: 'الدعوة والفكر' },
    { id: 'arabic', labelBn: 'আরবি ভাষা ও সাহিত্য', labelEn: 'Arabic Literature', labelAr: 'اللغة العربية' },
  ];

  const [pageSettings, setPageSettings] = useState<{
    title?: string;
    subtitle?: string;
    bannerImageUrl?: string;
    content?: string;
  } | null>(null);

  // Fetch page banner and title configuration from site_pages/faculty
  useEffect(() => {
    try {
      const docRef = doc(db, 'site_pages', 'faculty');
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setPageSettings(docSnap.data() as any);
        }
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore faculty page settings error:', err);
    }
  }, []);

  // Fetch dynamic faculty from Firestore if available
  useEffect(() => {
    try {
      const q = query(collection(db, 'faculty_profiles'), orderBy('order', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const list: FacultyMember[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as FacultyMember));
          setFacultyList(list);
        } else {
          setFacultyList([]);
        }
      }, (error) => {
        console.warn('Firestore faculty fetch warning:', error);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firestore subscription fallback:', err);
    }
  }, []);

  // Filtered faculty list
  const filteredFaculty = useMemo(() => {
    return facultyList.filter(item => {
      const matchesDept = selectedDept === 'all' || item.department === selectedDept;
      
      const queryLower = searchQuery.toLowerCase().trim();
      if (!queryLower) return matchesDept;

      const nameMatch = item.name.toLowerCase().includes(queryLower) ||
        (item.nameEn && item.nameEn.toLowerCase().includes(queryLower)) ||
        (item.nameAr && item.nameAr.includes(queryLower));

      const titleMatch = item.designation.toLowerCase().includes(queryLower) ||
        (item.designationEn && item.designationEn.toLowerCase().includes(queryLower));

      const eduMatch = item.education.toLowerCase().includes(queryLower) ||
        (item.educationEn && item.educationEn.toLowerCase().includes(queryLower));

      const specMatch = item.specialization && item.specialization.some(s => s.toLowerCase().includes(queryLower));

      return matchesDept && (nameMatch || titleMatch || eduMatch || specMatch);
    });
  }, [facultyList, selectedDept, searchQuery]);

  const getLocalizedName = (member: FacultyMember) => {
    if (locale === 'ar' && member.nameAr) return member.nameAr;
    if (locale === 'en' && member.nameEn) return member.nameEn;
    return member.name;
  };

  const getLocalizedDesignation = (member: FacultyMember) => {
    if (locale === 'ar' && member.designationAr) return member.designationAr;
    if (locale === 'en' && member.designationEn) return member.designationEn;
    return member.designation;
  };

  const getLocalizedEducation = (member: FacultyMember) => {
    if (locale === 'ar' && member.educationAr) return member.educationAr;
    if (locale === 'en' && member.educationEn) return member.educationEn;
    return member.education;
  };

  const getLocalizedBio = (member: FacultyMember) => {
    if (locale === 'ar' && member.bioAr) return member.bioAr;
    if (locale === 'en' && member.bioEn) return member.bioEn;
    return member.bio;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 text-[#064e3b] font-semibold text-xs mb-4 shadow-2xs">
            <GraduationCap className="w-4 h-4 text-emerald-800" />
            <span>
              {locale === 'bn' ? 'প্রথিতযশা শিক্ষক ও গবেষক পরিষদ' : locale === 'ar' ? 'هيئة التدريس والبحوث العلمية' : 'Distinguished Faculty & Scholars Council'}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-[#064e3b] font-serif tracking-tight mb-4">
            {pageSettings?.title || (locale === 'bn' ? 'আমাদের শ্রদ্ধেয় শিক্ষকবৃন্দ' : locale === 'ar' ? 'هيئة التدريس المعتمدة' : 'Faculty & Scholars Directory')}
          </h1>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {pageSettings?.subtitle || (locale === 'bn' 
              ? 'মদীনা ইসলামিক বিশ্ববিদ্যালয়, আল-আজহার ও বিশ্বখ্যাত শিক্ষাপ্রতিষ্ঠানের প্রাজ্ঞ উস্তাদগণের প্রত্যক্ষ তত্ত্বাবধানে কুরআন ও সুন্নাহর গবেষণাধর্মী পাঠদান।'
              : locale === 'ar'
              ? 'نخبة متميزة من كبار العلماء والأساتذة خريجي كبرى الجامعات الإسلامية لتقديم تعليم شرعي أصيل وبحث رصين.'
              : 'Instruction and intellectual guidance led by esteemed scholars graduated from the Islamic University of Madinah, Al-Azhar, and leading global institutions.')}
          </p>
        </div>

        {/* Search & Department Filters */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4 sm:p-6 mb-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === 'bn' ? 'শিক্ষকের নাম, ডিগ্রি বা বিষয় খুঁজুন...' : locale === 'ar' ? 'ابحث عن اسم الأستاذ أو التخصص...' : 'Search by scholar, degree, or field...'}
                className="w-full pl-10 pr-4 rtl:pl-4 rtl:pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#064e3b] text-sm bg-slate-50/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {departments.map((dept) => {
                const isSelected = selectedDept === dept.id;
                const label = locale === 'bn' ? dept.labelBn : locale === 'ar' ? dept.labelAr : dept.labelEn;
                return (
                  <button
                    key={dept.id}
                    onClick={() => setSelectedDept(dept.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#064e3b] text-white shadow-xs ring-2 ring-[#064e3b]/20 font-bold'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Faculty Grid Cards */}
        {filteredFaculty.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {locale === 'bn' ? 'কোনো শিক্ষক পাওয়া যায়নি' : locale === 'ar' ? 'لم يتم العثور على أي أستاذ' : 'No Faculty Found'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {locale === 'bn' ? 'আপনার অনুসন্ধানের ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।' : locale === 'ar' ? 'يرجى تغيير معايير البحث والمحاولة مرة أخرى.' : 'Try adjusting your search query or department filter.'}
            </p>
            <button
              onClick={() => { setSelectedDept('all'); setSearchQuery(''); }}
              className="px-4 py-2 bg-[#064e3b] text-white text-xs font-semibold rounded-lg hover:bg-emerald-900"
            >
              {locale === 'bn' ? 'সব ফিল্টার রিসেট করুন' : locale === 'ar' ? 'إعادة ضبط الفلاتر' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredFaculty.map((member) => {
              const localizedName = getLocalizedName(member);
              const localizedDesignation = getLocalizedDesignation(member);
              const localizedEducation = getLocalizedEducation(member);

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-700/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Top image & badge */}
                    <div className="relative h-60 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent overflow-hidden flex items-center justify-center bg-slate-100">
                      {member.photoUrl ? (
                        <img
                          src={member.photoUrl}
                          alt={localizedName}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-900 flex flex-col items-center justify-center text-emerald-100 group-hover:scale-105 transition-transform duration-500">
                          <User className="w-20 h-20 text-emerald-200" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b]/90 via-transparent to-transparent opacity-80" />

                      {/* Department Chip */}
                      <div className="absolute top-3.5 left-3.5 rtl:left-auto rtl:right-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#064e3b] shadow-2xs backdrop-blur-2xs">
                          {departments.find(d => d.id === member.department)?.[locale === 'bn' ? 'labelBn' : locale === 'ar' ? 'labelAr' : 'labelEn'] || 'Department'}
                        </span>
                      </div>

                      {/* Name & Title overlay */}
                      <div className="absolute bottom-3 left-4 right-4 text-white">
                        <h3 className="text-lg font-bold font-serif leading-snug drop-shadow-2xs">
                          {localizedName}
                        </h3>
                        <p className="text-xs text-amber-300 font-medium line-clamp-1 mt-0.5">
                          {localizedDesignation}
                        </p>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      {/* Education line */}
                      <div className="flex items-start gap-2 mb-3 text-slate-700">
                        <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <span className="text-xs font-medium leading-relaxed line-clamp-2">
                          {localizedEducation}
                        </span>
                      </div>

                      {/* Specializations tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {member.specialization && member.specialization.slice(0, 3).map((spec, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 rounded-md text-[11px] font-medium border border-slate-200/60"
                          >
                            {spec}
                          </span>
                        ))}
                        {member.specialization && member.specialization.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-bold">
                            +{member.specialization.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Short Bio */}
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mb-4 font-sans">
                        {getLocalizedBio(member)}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 mt-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedFaculty(member)}
                      className="w-full mt-3.5 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-[#064e3b] text-slate-800 hover:text-white text-xs font-bold transition-all shadow-2xs group cursor-pointer"
                    >
                      <span>
                        {locale === 'bn' ? 'বিস্তারিত প্রোফাইল দেখুন' : locale === 'ar' ? 'عرض السيرة الذاتية' : 'View Full Profile'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180 text-slate-400 group-hover:text-amber-400 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detailed Profile Modal */}
        {selectedFaculty && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="relative bg-[#064e3b] text-white p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(null)}
                  className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 rounded-full bg-emerald-900/60 hover:bg-emerald-900 text-emerald-100 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 bg-emerald-950 flex items-center justify-center">
                    {selectedFaculty.photoUrl ? (
                      <img
                        src={selectedFaculty.photoUrl}
                        alt={getLocalizedName(selectedFaculty)}
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-full h-full bg-emerald-900 flex items-center justify-center text-amber-300">
                        <User className="w-14 h-14" />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left rtl:sm:text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/90 text-emerald-950 mb-2">
                      {departments.find(d => d.id === selectedFaculty.department)?.[locale === 'bn' ? 'labelBn' : locale === 'ar' ? 'labelAr' : 'labelEn']}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold font-serif leading-tight">
                      {getLocalizedName(selectedFaculty)}
                    </h2>
                    <p className="text-emerald-200 text-xs sm:text-sm font-medium mt-1">
                      {getLocalizedDesignation(selectedFaculty)}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start rtl:sm:justify-end gap-1.5 text-emerald-100/90 text-xs mt-2">
                      <GraduationCap className="w-4 h-4 text-amber-300 shrink-0" />
                      <span>{getLocalizedEducation(selectedFaculty)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
                {/* Biography */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {locale === 'bn' ? 'সংক্ষিপ্ত পরিচিতি ও দাওয়াহ ক্যারিয়ার' : locale === 'ar' ? 'نبذة تعريفية ومسيرة علمية' : 'Biography & Scholarly Profile'}
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-100">
                    {getLocalizedBio(selectedFaculty)}
                  </p>
                </div>

                {/* Specializations */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    {locale === 'bn' ? 'গবেষণা ও পাঠদানের বিশেষত্ব' : locale === 'ar' ? 'مجالات التخصص الدقيق' : 'Areas of Specialization'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedFaculty.specialization && selectedFaculty.specialization.map((spec, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-emerald-50 text-[#064e3b] font-semibold text-xs rounded-lg border border-emerald-100"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Courses Taught */}
                {selectedFaculty.coursesTaught && selectedFaculty.coursesTaught.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {locale === 'bn' ? 'ইনস্টিটিউটে পাঠদানরত কোর্সসমূহ' : locale === 'ar' ? 'المقررات التي يدرّسها في المعهد' : 'Courses Taught at ASDRI'}
                    </h4>
                    <div className="space-y-2">
                      {selectedFaculty.coursesTaught.map((course, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-800"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>{course}</span>
                          </div>
                          <Link
                            href={`/${locale}/courses`}
                            className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline"
                          >
                            {locale === 'bn' ? 'কোর্স বিস্তারিত' : locale === 'ar' ? 'تفاصيل المادة' : 'Course Details'} →
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Publications */}
                {selectedFaculty.publications && selectedFaculty.publications.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      {locale === 'bn' ? 'প্রকাশিত গ্রন্থ ও মৌলিক গবেষণা' : locale === 'ar' ? 'المؤلفات والأبحاث المنشورة' : 'Publications & Books'}
                    </h4>
                    <ul className="space-y-2">
                      {selectedFaculty.publications.map((pub, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <BookMarked className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span>{pub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Office hours & consultation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {selectedFaculty.officeHours && (
                    <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>{locale === 'bn' ? 'সাক্ষাতের সময়সূচি' : locale === 'ar' ? 'الساعات المكتبية' : 'Consultation Hours'}</span>
                      </div>
                      <p className="text-amber-800">{selectedFaculty.officeHours}</p>
                    </div>
                  )}

                  {selectedFaculty.email && (
                    <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950 mb-1">
                        <Mail className="w-3.5 h-3.5 text-emerald-800" />
                        <span>{locale === 'bn' ? 'অফিসিয়াল যোগাযোগ' : locale === 'ar' ? 'البريد المؤسسي' : 'Institutional Email'}</span>
                      </div>
                      <a href={`mailto:${selectedFaculty.email}`} className="text-emerald-800 hover:underline font-medium break-all">
                        {selectedFaculty.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(null)}
                  className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {locale === 'bn' ? 'বন্ধ করুন' : locale === 'ar' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Department Guidelines / Institutional Intro if configured in PageContentManager */}
        {pageSettings?.content && (
          <div className="mt-14 bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#064e3b] mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>{locale === 'bn' ? 'শিক্ষক ও গবেষক পরিষদ পরিচিতি ও নীতিমালা' : locale === 'ar' ? 'دليل وتعليمات هيئة التدريس والبحوث' : 'Faculty Guidelines & Institutional Directory'}</span>
            </h3>
            <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-sans">
              {pageSettings.content}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
