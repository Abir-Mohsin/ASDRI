'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/dictionary';
import { 
  FileText, ArrowRight, BookOpen, ExternalLink, 
  Sparkles, Award, Users, Download, ShieldCheck, Tag 
} from 'lucide-react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface HomeResearchSpotlightProps {
  locale: Locale;
}

export function HomeResearchSpotlight({ locale }: HomeResearchSpotlightProps) {
  const [papers, setPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dict = {
    en: {
      badge: 'Academic Research & Publications',
      title: 'Dawah & Theological Research Hub',
      subtitle: 'Advancing authentic Islamic scholarship through peer-reviewed research and contemporary jurisprudential discourse.',
      viewAll: 'Explore All Research Papers',
      readPaper: 'Read Abstract',
      downloadPdf: 'Download PDF',
      authorLabel: 'Scholar / Author:',
      dateLabel: 'Published:',
      peerReviewed: 'Peer-Reviewed Journal',
    },
    bn: {
      badge: 'ইসলামিক গবেষণা ও উচ্চতর প্রকাশনা',
      title: 'দাওয়াহ ও থিওলজিক্যাল গবেষণা কেন্দ্র',
      subtitle: 'পবিত্র কুরআন ও সুন্নাহর বিশুদ্ধ আদর্শে সমকালীন চ্যালেঞ্জ মোকাবেলায় আন্তর্জাতিক মানের পিয়ার-রিভিউড গবেষণা প্রবন্ধসমূহ।',
      viewAll: 'সকল গবেষণা প্রবন্ধ দেখুন',
      readPaper: 'সারসংক্ষেপ পড়ুন',
      downloadPdf: 'পিডিএফ ডাউনলোড',
      authorLabel: 'গবেষক স্কলার:',
      dateLabel: 'প্রকাশকাল:',
      peerReviewed: 'পিয়ার-রিভিউড জার্নাল',
    },
    ar: {
      badge: 'البحوث والدراسات الأكاديمية',
      title: 'مركز الدراسات والبحوث الإسلامية',
      subtitle: 'تعزيز البحث العلمي المحكم والاجتهاد الفقهي الأصيل لمعالجة التحديات المعاصرة التي تواجه الأمة الإسلامية.',
      viewAll: 'استعراض جميع الأبحاث والدراسات',
      readPaper: 'عرض الملخص',
      downloadPdf: 'تحميل ملف PDF',
      authorLabel: 'الباحث الأكاديمي:',
      dateLabel: 'تاريخ النشر:',
      peerReviewed: 'مجلة علمية محكمة',
    }
  };

  const t = dict[locale] || dict.en;

  const defaultPapers = [
    {
      id: 'rp-1',
      title: locale === 'bn' 
        ? 'ইসলামী অর্থনীতিতে ক্রিপ্টোকারেন্সি ও ডিজিটাল অ্যাসেটের শরীয়াহ মূল্যায়ন' 
        : locale === 'ar' 
        ? 'التقييم الشرعي للعملات المشفرة والأصول الرقمية' 
        : 'Application of Fiqh al-Nawazil in Modern Financial Contracts & Digital Asset Valuation',
      abstract: locale === 'bn' 
        ? 'ক্রিপ্টোকারেন্সি এবং ব্লকচেইন প্রযুক্তির একটি সামগ্রিক বিশ্লেষণ যার মধ্যে আধুনিক লেনদেন কাঠামোর শরীয়াহ নির্দেশিকা এবং মাকাসিদ আশ-শরীয়াহ আলোচনা করা হয়েছে।' 
        : 'An analytical investigation of contemporary jurisprudential rulings regarding decentralized protocols, smart contracts, and Shariah-compliant digital asset management.',
      category: 'Islamic Economics & Finance',
      authorName: locale === 'bn' ? 'প্রফেসর মাহমুদ হাসান আল-আজহারী' : 'Prof. Mahmud Hasan al-Azhari',
      publishedAt: 'May 2026',
      downloadCount: 420
    },
    {
      id: 'rp-2',
      title: locale === 'bn' 
        ? 'সমকালীন সমাজে ফিকহুল আক্বলিয়্যাত (সংখ্যালঘু মুসলিম ফিকাহ)-এর প্রয়োগ' 
        : locale === 'ar' 
        ? 'تطبيقات فقه الأقليات المسلمة في المجتمعات المعاصرة' 
        : 'Contemporary Jurisprudence of Muslim Minorities (Fiqh al-Aqalliyyat): Principles and Methodologies',
      abstract: locale === 'bn' 
        ? 'অমুসলিম প্রধান দেশসমূহে মুসলিম সংখ্যালঘু সমাজের নাগরিক অধিকার, পারিবারিক আইন ও পারস্পরিক সহাবস্থানের ওপর একটি প্রামাণ্য শাস্ত্রীয় গবেষণা।' 
        : 'A comprehensive study examining Islamic legal methodology for Muslim communities residing in non-Muslim majority nations, emphasizing civic duties and legal ethics.',
      category: 'Islamic Jurisprudence (Usul al-Fiqh)',
      authorName: locale === 'bn' ? 'ড. আনোয়ারুল ইসলাম মাদানী' : 'Dr. Anwarul Islam Madani',
      publishedAt: 'March 2026',
      downloadCount: 315
    },
    {
      id: 'rp-3',
      title: locale === 'bn' 
        ? 'মাকাসিদ আশ-শরীয়াহর আলোকে বায়োমেডিক্যাল এথিক্স ও জেনেটিক ইঞ্জিনিয়ারিং' 
        : locale === 'ar' 
        ? 'الأخلاقيات الطبية الحيوية والهندسة الوراثية في ضوء مقاصد الشريعة' 
        : 'Biomedical Ethics, Stem Cell Therapy & Genetic Modification in Light of Maqasid al-Shariah',
      abstract: locale === 'bn' 
        ? 'আধুনিক চিকিৎসা বিজ্ঞানের ক্লোনিং, অর্গান ট্রান্সপ্লান্টেশন এবং জেনেটিক থেরাপির ক্ষেত্রে শরীয়াহর উদ্দেশ্য ও মূলনীতি সংক্রান্ত সমন্বিত পর্যালোচনা।' 
        : 'Critical ethical and jurisprudential analysis on CRISPR gene editing, human cloning prohibitions, and organ transplantation based on primary Shariah imperatives.',
      category: 'Theology & Biomedical Fiqh',
      authorName: locale === 'bn' ? 'মুফতি ড. তারিকুল ইসলাম' : 'Mufti Dr. Tariqul Islam',
      publishedAt: 'January 2026',
      downloadCount: 580
    }
  ];

  useEffect(() => {
    const fetchResearchPapers = async () => {
      try {
        const q = query(
          collection(db, 'research_papers'),
          where('status', '==', 'approved'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPapers(list);
        } else {
          setPapers(defaultPapers);
        }
      } catch (err) {
        console.warn('Notice loading home research papers:', err);
        setPapers(defaultPapers);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResearchPapers();
  }, [locale]);

  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-t border-slate-200/80 font-sans" id="home_research_spotlight">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Clean, Centered & Prominent */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#064e3b] font-serif tracking-tight leading-tight">
            {t.title}
          </h2>
          <div className="mt-4 w-16 h-1 bg-amber-500 mx-auto rounded-full" />
        </div>

        {/* Papers Grid */}
        {isLoading ? (
          <div className="py-12 text-center flex flex-col justify-center items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]"></div>
            <span className="text-xs text-slate-400">Loading publications...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {papers.map((paper, idx) => (
              <div 
                key={paper.id || idx}
                className="bg-slate-50/70 hover:bg-white rounded-2xl p-6 border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-md bg-emerald-100/70 text-emerald-900 border border-emerald-200/60">
                      <Tag className="w-3 h-3 text-emerald-700" />
                      {paper.category || 'General Research'}
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      {paper.publishedAt || '2026'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 font-serif leading-snug line-clamp-2 group-hover:text-[#064e3b] transition-colors">
                    {paper.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    <span className="block font-semibold text-slate-700 truncate max-w-[150px]">
                      {paper.authorName || 'ASDRI Scholar'}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      {t.peerReviewed}
                    </span>
                  </div>

                  <Link
                    href={`/${locale}/research`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#064e3b] hover:text-emerald-700 group-hover:underline"
                  >
                    <span>{t.readPaper}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Section Bottom Action */}
        <div className="mt-12 sm:mt-16 text-center">
          <Link
            href={`/${locale}/research`}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-[#064e3b] text-[#064e3b] hover:text-white border border-slate-300 hover:border-[#064e3b] text-xs sm:text-sm font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <span>{t.viewAll}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </section>
  );
}
