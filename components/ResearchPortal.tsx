'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Download, Users, Lightbulb, Search, BookOpen, 
  ExternalLink, Filter, Tag, CheckCircle, ShieldCheck 
} from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Dictionary for public Research page translation
const pt = {
  en: {
    heroTitle: "Dawah & Theological Research Hub",
    heroDesc: "Advancing authentic Islamic scholarship through rigorous, double-blind peer-reviewed research addressing contemporary challenges facing the global Ummah.",
    searchPlaceholder: "Search research by title, keyword, or scholar...",
    allCategories: "All Fields",
    quranHadith: "Quranic & Hadith Sciences",
    fiqh: "Islamic Jurisprudence (Usul al-Fiqh)",
    theology: "Theology & Aqeedah",
    dawah: "Dawah & Contemporary Culture",
    economics: "Islamic Economics & Finance",
    manuscripts: "Manuscript Heritage & Editing",
    comparative: "Comparative Religion",
    latestPubs: "Peer-Reviewed Scholarly Publications",
    author: "Author / Scholar:",
    date: "Published:",
    noPapers: "No research papers found matching your search query.",
    viewManuscript: "Read Manuscript Abstract",
    readPdf: "Read Full Article (PDF)",
    downloadPdf: "Download Full PDF",
    close: "Close",
    aboutManuscript: "Abstract & Research Scope",
    keywordsLabel: "Indexing Keywords",
    attachedDoc: "Original Document / Manuscript File",
    academicBoard: "ASDRI Academic Review Board Approved",
    arabicFont: "font-serif"
  },
  bn: {
    heroTitle: "দাওয়াহ ও থিওলজিক্যাল গবেষণা কেন্দ্র",
    heroDesc: "পবিত্র কুরআন ও সুন্নাহর বিশুদ্ধ আদর্শের আলোকে আধুনিক যুগের বুদ্ধিবৃত্তিক ও সমকালীন চ্যালেঞ্জ মোকাবেলায় আন্তর্জাতিক মানের পিয়ার-রিভিউড গবেষণা সম্প্রসারণ।",
    searchPlaceholder: "গবেষণাপত্রের শিরোনাম, কিওয়ার্ড বা লেখক দিয়ে খুঁজুন...",
    allCategories: "সকল শাস্ত্র",
    quranHadith: "আল-কুরআন ও হাদিস বিজ্ঞান",
    fiqh: "উসূলে ফিকাহ ও আইনশাস্ত্র",
    theology: "আকীদা ও কালাম (Theology)",
    dawah: "দাওয়াহ ও সমসাময়িক সংস্কৃতি",
    economics: "ইসলামী অর্থনীতি ও ব্যাংকিং",
    manuscripts: "পাণ্ডুলিপি ও ঐতিহ্য সম্পাদনা",
    comparative: "তুলনামূলক ধর্মতত্ত্ব",
    latestPubs: "অনুমোদিত ও প্রকাশিত গবেষণা পত্রসমূহ",
    author: "গবেষক স্কলার:",
    date: "প্রকাশকাল:",
    noPapers: "আপনার অনুসন্ধান অনুযায়ী কোনো গবেষণাপত্র পাওয়া যায়নি।",
    viewManuscript: "সারসংক্ষেপ ও তথ্য দেখুন",
    readPdf: "সম্পূর্ণ প্রবন্ধ পড়ুন (PDF)",
    downloadPdf: "সম্পূর্ণ পিডিএফ ডাউনলোড",
    close: "বন্ধ করুন",
    aboutManuscript: "গবেষণার সারসংক্ষেপ ও প্রতিপাদ্য",
    keywordsLabel: "সূচীকরণ কিওয়ার্ডসমূহ",
    attachedDoc: "মূল গবেষণাপত্র / অনুমোদিত পিডিএফ ডকুমেন্ট",
    academicBoard: "আস-সুন্নাহ একাডেমিক বোর্ড কর্তৃক অনুমোদিত",
    arabicFont: "font-sans"
  },
  ar: {
    heroTitle: "مركز الدراسات والبحوث اللاهوتية والدعوية",
    heroDesc: "تعزيز البحث العلمي المحكم والاجتهاد الفقهي الأصيل لمعالجة التحديات الفكرية والمعاصرة التي تواجه الأمة الإسلامية.",
    searchPlaceholder: "ابحث في الدراسات بالعنوان، الكلمة المفتاحية، أو الباحث...",
    allCategories: "جميع التخصصات",
    quranHadith: "علوم القرآن والحديث",
    fiqh: "الفقه وأصوله",
    theology: "العقيدة وعلم الكلام",
    dawah: "الدعوة والثقافة المعاصرة",
    economics: "الاقتصاد والمالية الإسلامية",
    manuscripts: "تحقيق المخطوطات والتراث",
    comparative: "مقارنة الأديان",
    latestPubs: "البحوث والمقالات العلمية المحكمة",
    author: "الباحث الأكاديمي:",
    date: "تاريخ النشر:",
    noPapers: "لم يتم العثور على أبحاث تطابق شروط البحث.",
    viewManuscript: "عرض ملخص البحث",
    readPdf: "قراءة البحث كاملاً (PDF)",
    downloadPdf: "تحميل ملف PDF",
    close: "إغلاق",
    aboutManuscript: "الملخص والنتائج والفرضيات العلمية",
    keywordsLabel: "الكلمات الدلالية المفهرسة",
    attachedDoc: "المستند الأصلي / ملف PDF المعتمد",
    academicBoard: "معتمد من الهيئة العلمية بمعهد السنة",
    arabicFont: "font-serif"
  }
};

interface ResearchPortalProps {
  locale: 'en' | 'bn' | 'ar';
}

export function ResearchPortal({ locale }: ResearchPortalProps) {
  const dict = pt[locale] || pt.en;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [dbPapers, setDbPapers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);

  // Load approved papers from Firestore
  useEffect(() => {
    const loadApprovedPapers = async () => {
      setIsLoading(true);
      try {
        const q = query(
          collection(db, 'research_papers'),
          where('status', '==', 'approved')
        );
        const snap = await getDocs(q);
        const papersList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDbPapers(papersList);
      } catch (err) {
        console.error("Error fetching approved papers:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadApprovedPapers();
  }, []);

  // Default initial publications to ensure zero blank states
  const defaultPublications = [
    {
      id: 'default-1',
      title: locale === 'bn' 
        ? 'ইসলামী অর্থনীতিতে ক্রিপ্টোকারেন্সি ও ডিজিটাল অ্যাসেটের শরীয়াহ মূল্যায়ন' 
        : locale === 'ar' 
        ? 'التقييم الشرعي للعملات المشفرة والأصول الرقمية' 
        : 'Application of Fiqh al-Nawazil in Modern Financial Contracts & Digital Asset Valuation',
      abstract: locale === 'bn' 
        ? 'ক্রিপ্টোকারেন্সি এবং ব্লকচেইন প্রযুক্তির একটি সামগ্রিক বিশ্লেষণ যার মধ্যে আধুনিক লেনদেন কাঠামোর শরীয়াহ নির্দেশিকা এবং মাকাসিদ আশ-শরীয়াহ আলোচনা করা হয়েছে।' 
        : 'An analytical investigation of contemporary jurisprudential rulings regarding decentralized protocols, smart contracts, and Shariah-compliant digital asset management.',
      category: 'Islamic Economics & Finance',
      authorName: 'Prof. Mahmud Hasan al-Azhari',
      keywords: ['Fiqh al-Nawazil', 'Islamic Fintech', 'Crypto Assets', 'Maqasid'],
      createdAt: '2025-10-12T12:00:00.000Z',
      pdfLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'default-2',
      title: locale === 'bn' 
        ? 'রাসূলুল্লাহ (সা.)-এর শিক্ষাদান পদ্ধতি এবং আধুনিক শিক্ষাবিজ্ঞানে তার প্রয়োগ' 
        : locale === 'ar' 
        ? 'منهج التعليم والتربية عند رسول الله صلى الله عليه وسلم وتطبيقه المعاصر' 
        : 'Comparative Analysis of Prophetic Educational Methodology & Modern Pedagogical Science',
      abstract: locale === 'bn' 
        ? 'রাসূলুল্লাহ (সা.)-এর শিক্ষাদানের বিশেষ কৌশলসমূহ এবং আধুনিক সাইকোলজিকাল ও পেডাগজিক্যাল ফ্রেমওয়ার্কে তার সুদূরপ্রসারী কার্যকারিতা নিয়ে তুলনামূলক বিশ্লেষণ।' 
        : 'Examining instructional frameworks utilized in Prophetic traditions and their empirical application within contemporary higher education curricula.',
      category: 'Dawah & Contemporary Culture',
      authorName: 'Dr. Abdul Hameed (Fellow, ASDRI)',
      keywords: ['Prophetic Pedagogy', 'Hadith Sciences', 'Educational Psychology'],
      createdAt: '2025-08-20T12:00:00.000Z',
      pdfLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'default-3',
      title: locale === 'bn' 
        ? 'মাকাসিদ আশ-শরীয়াহ এবং আধুনিক সুশাসন ও লোকপ্রশাসন' 
        : locale === 'ar' 
        ? 'مقاصد الشريعة الإسلامية وركائز الحكم الرشيد والسياسة الشرعية' 
        : 'Maqasid al-Shariah and Ethical Paradigms in Modern Public Governance',
      abstract: locale === 'bn' 
        ? 'শরীয়াহর উচ্চতর লক্ষ্য বা উদ্দেশ্যসমূহ কিভাবে জনকল্যাণমুখী লোকপ্রশাসন, জবাবদিহিতা ও নীতিশাস্ত্র বাস্তবায়নে ভূমিকা রাখতে পারে তার বিশ্লেষণ।' 
        : 'An exploration of how the higher objectives of Islamic law (Maqasid) inform ethical public policy and public administrative governance models.',
      category: 'Islamic Jurisprudence (Usul al-Fiqh)',
      authorName: 'Dr. Tariq al-Madani',
      keywords: ['Maqasid', 'Public Policy', 'Ethics', 'Usul al-Fiqh'],
      createdAt: '2026-01-15T12:00:00.000Z',
      pdfLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  // Merge Firestore papers with fallback initial publications
  const allPapers = dbPapers.length > 0 ? dbPapers : defaultPublications;

  // Filtered papers matching search query and category
  const filteredPapers = allPapers.filter(paper => {
    const pTitle = (paper.title || paper.manuscript_metadata?.title || '').toLowerCase();
    const pAbstract = (paper.abstract || paper.manuscript_metadata?.abstract || '').toLowerCase();
    const pAuthor = (paper.authorName || paper.author_profile?.name || '').toLowerCase();
    const pKeywords = (paper.keywords || paper.manuscript_metadata?.keywords || []).map((k: string) => k.toLowerCase());
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || pTitle.includes(q) || pAbstract.includes(q) || pAuthor.includes(q) || pKeywords.some((k: string) => k.includes(q));

    const pCat = paper.category || paper.manuscript_metadata?.category || '';
    const matchesCategory = 
      activeCategory === 'All' || 
      pCat === activeCategory ||
      (activeCategory === 'Quran & Hadith' && (pCat.includes('Quran') || pCat.includes('কুরআন'))) ||
      (activeCategory === 'Theology & Aqeedah' && (pCat.includes('Theology') || pCat.includes('আকীদা'))) ||
      (activeCategory === 'Islamic Jurisprudence (Usul al-Fiqh)' && (pCat.includes('Fiqh') || pCat.includes('ফিকাহ') || pCat.includes('Jurisprudence'))) ||
      (activeCategory === 'Dawah & Contemporary Culture' && (pCat.includes('Dawah') || pCat.includes('দাওয়াহ'))) ||
      (activeCategory === 'Islamic Economics & Finance' && (pCat.includes('Economics') || pCat.includes('অর্থনীতি')));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10 font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Search and Filters Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5 relative z-20 -mt-10">
        <div className="relative">
          <Search className={`absolute ${locale === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.searchPlaceholder}
            className={`w-full ${locale === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white text-xs sm:text-sm placeholder-slate-400 transition-all font-sans shadow-inner`}
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1.5 border-t border-slate-100 pt-4 scrollbar-thin">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 uppercase shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
          </span>
          {[
            { id: 'All', label: dict.allCategories },
            { id: 'Quran & Hadith', label: dict.quranHadith },
            { id: 'Islamic Jurisprudence (Usul al-Fiqh)', label: dict.fiqh },
            { id: 'Theology & Aqeedah', label: dict.theology },
            { id: 'Dawah & Contemporary Culture', label: dict.dawah },
            { id: 'Islamic Economics & Finance', label: dict.economics },
            { id: 'Manuscript Heritage & Editing', label: dict.manuscripts },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#064e3b] text-white shadow-xs font-extrabold'
                  : 'bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-[#064e3b]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Publications Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif">
              {dict.latestPubs}
            </h2>
          </div>
          <span className="text-xs text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full font-mono">
            {filteredPapers.length} Publications
          </span>
        </div>

        {filteredPapers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-xs sm:text-sm italic">{dict.noPapers}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPapers.map((pub) => {
              const pubTitle = pub.title || pub.manuscript_metadata?.title;
              const pubCat = pub.category || pub.manuscript_metadata?.category;
              const pubAbstract = pub.abstract || pub.manuscript_metadata?.abstract;
              const pubAuthor = pub.authorName || pub.author_profile?.name;
              const pubKeywords = pub.keywords || pub.manuscript_metadata?.keywords || [];
              const docUrl = pub.pdfLink || pub.manuscript_metadata?.fileUrl || pub.manuscript_metadata?.googleDriveUrl;

              return (
                <div 
                  key={pub.id} 
                  className="bg-white p-6 sm:p-7 rounded-2xl shadow-2xs border border-slate-200/80 flex flex-col justify-between hover:shadow-xs transition-all hover:border-emerald-700/30 space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-[#064e3b] text-[10px] font-extrabold uppercase tracking-wide rounded-md border border-emerald-200/60">
                        {pubCat}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 font-mono">
                        {dict.date} {new Date(pub.approvedAt || pub.createdAt || Date.now()).toLocaleDateString(locale)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug font-serif">
                      {pubTitle}
                    </h3>

                    <p className="text-slate-600 text-xs leading-relaxed font-sans line-clamp-3">
                      {pubAbstract}
                    </p>

                    {pubKeywords.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pubKeywords.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-100">
                            #{kw}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold text-xs">
                        <Users className="w-4 h-4 text-emerald-800" />
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400 text-[10px] block uppercase">{dict.author}</span>
                        <strong className="text-slate-800 font-bold">{pubAuthor}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button 
                        onClick={() => setSelectedPaper(pub)}
                        className="px-3.5 py-2 bg-emerald-50 border border-emerald-200/70 text-emerald-900 text-xs font-bold rounded-xl hover:bg-[#064e3b] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{dict.viewManuscript}</span>
                      </button>

                      {docUrl && docUrl !== '#' && (
                        <a 
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          title="Read Full PDF Document"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-300" />
                          <span>PDF</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* DETAILED MANUSCRIPT READ POPUP MODAL */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] animate-slideIn">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50 rounded-t-2xl">
              <div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded uppercase">
                  {selectedPaper.category || selectedPaper.manuscript_metadata?.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-950 font-serif mt-2 leading-snug">
                  {selectedPaper.title || selectedPaper.manuscript_metadata?.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Author / Scholar: <strong className="text-slate-800">{selectedPaper.authorName || selectedPaper.author_profile?.name}</strong>
                </p>
              </div>
              <button 
                onClick={() => setSelectedPaper(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm bg-white border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Abstract Section */}
              <div className="bg-amber-50/60 p-4 border border-amber-200/60 rounded-xl space-y-2">
                <span className="text-[11px] text-amber-900 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-700" />
                  {dict.aboutManuscript}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif italic whitespace-pre-line">
                  {selectedPaper.abstract || selectedPaper.manuscript_metadata?.abstract}
                </p>
              </div>

              {/* Keywords Tag List */}
              {((selectedPaper.keywords || selectedPaper.manuscript_metadata?.keywords || []).length > 0) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-800" />
                    {dict.keywordsLabel}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedPaper.keywords || selectedPaper.manuscript_metadata?.keywords || []).map((k: string, i: number) => (
                      <span key={i} className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-[#064e3b] border border-emerald-200">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Institutional Certification Badge */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{dict.academicBoard}</span>
              </div>

              {/* Attached Original Document */}
              {(selectedPaper.pdfLink || selectedPaper.manuscript_metadata?.fileUrl || selectedPaper.manuscript_metadata?.googleDriveUrl) && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-700 font-bold">{dict.attachedDoc}</span>
                  <a 
                    href={selectedPaper.pdfLink || selectedPaper.manuscript_metadata?.fileUrl || selectedPaper.manuscript_metadata?.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#064e3b] text-white hover:bg-[#043d2e] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-amber-300" />
                    <span>{dict.readPdf}</span>
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50 rounded-b-2xl">
              <button 
                onClick={() => setSelectedPaper(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                {dict.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
