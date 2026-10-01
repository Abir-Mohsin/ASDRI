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
      noPapers: 'ASDRI research repository is being curated. Peer-reviewed papers will be published following editorial committee review.',
      submitPaper: 'Submit Research Paper'
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
      noPapers: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট পিয়ার-রিভিউড গবেষণাপত্র প্রকাশের প্রস্তুতি চলছে। গবেষক ও আলেমদের থেকে নতুন প্রবন্ধ আহ্বান করা হচ্ছে।',
      submitPaper: 'গবেষণাপত্র জমা দিন'
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
      noPapers: 'يجري إعداد مستودع الأبحاث المحكمة لمعهد السنة وسيتم نشر الأبحاث المعتمدة تباعاً.',
      submitPaper: 'تقديم بحث علمي'
    }
  };

  const t = dict[locale] || dict.en;

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
          setPapers([]);
        }
      } catch (err) {
        console.warn('Notice loading home research papers:', err);
        setPapers([]);
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
        ) : papers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 shadow-2xs p-8 max-w-xl mx-auto">
            <FileText className="w-12 h-12 text-emerald-800/40 mx-auto mb-3" />
            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed mb-6">
              {t.noPapers}
            </p>
            <Link
              href={`/${locale}/research`}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs"
            >
              <span>{t.viewAll}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
