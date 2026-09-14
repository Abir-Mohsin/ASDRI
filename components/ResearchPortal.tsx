'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Download, Users, Lightbulb, Search, BookOpen, 
  Filter, Tag, ShieldCheck, X, Check, ArrowRight, BookMarked
} from "lucide-react";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Dictionary for public Research page translation
const pt = {
  en: {
    heroTitle: "Research & Publications",
    heroDesc: "Advancing authentic Islamic scholarship through rigorous peer-reviewed research addressing contemporary challenges facing the Ummah.",
    searchPlaceholder: "Search research by title, keyword, or scholar...",
    filtersBtn: "Filter Fields",
    activeFilters: "Active Filter:",
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
    noPapers: "No research papers found matching your criteria.",
    viewManuscript: "Abstract & Info",
    readPdf: "Read Full PDF",
    downloadPdf: "Download PDF",
    close: "Close",
    aboutManuscript: "Abstract & Research Scope",
    keywordsLabel: "Indexing Keywords",
    attachedDoc: "Original Document / Manuscript PDF",
    academicBoard: "ASDRI Academic Review Board Approved",
    arabicFont: "font-serif",
    clearFilter: "Reset Filter",
    categoriesTitle: "Academic Research Fields",
    totalShowing: "Showing"
  },
  bn: {
    heroTitle: "গবেষণা ও প্রকাশনা",
    heroDesc: "পবিত্র কুরআন ও সুন্নাহর বিশুদ্ধ আদর্শের আলোকে আধুনিক যুগের চ্যালেঞ্জ মোকাবেলায় আন্তর্জাতিক মানের পিয়ার-রিভিউড গবেষণা।",
    searchPlaceholder: "গবেষণাপত্রের শিরোনাম, কিওয়ার্ড বা লেখক দিয়ে খুঁজুন...",
    filtersBtn: "ফিল্টার অপশন",
    activeFilters: "বর্তমান ফিল্টার:",
    allCategories: "সকল শাস্ত্র",
    quranHadith: "আল-কুরআন ও হাদিস বিজ্ঞান",
    fiqh: "উসূলে ফিকাহ ও আইনশাস্ত্র",
    theology: "আকীদা ও কালাম (Theology)",
    dawah: "দাওয়াহ ও সমসাময়িক সংস্কৃতি",
    economics: "ইসলামী অর্থনীতি ও ব্যাংকিং",
    manuscripts: "পাণ্ডুলিপি ও ঐতিহ্য সম্পাদনা",
    comparative: "তুলনামূলক ধর্মতত্ত্ব",
    latestPubs: "অনুমোদিত ও প্রকাশিত গবেষণাপত্রসমূহ",
    author: "গবেষক স্কলার:",
    date: "প্রকাশকাল:",
    noPapers: "আপনার অনুসন্ধান অনুযায়ী কোনো গবেষণাপত্র পাওয়া যায়নি।",
    viewManuscript: "সারসংক্ষেপ ও তথ্য",
    readPdf: "সম্পূর্ণ প্রবন্ধ (PDF)",
    downloadPdf: "পিডিএফ ডাউনলোড",
    close: "বন্ধ করুন",
    aboutManuscript: "গবেষণার সারসংক্ষেপ ও প্রতিপাদ্য",
    keywordsLabel: "সূচীকরণ কিওয়ার্ডসমূহ",
    attachedDoc: "মূল গবেষণাপত্র / অনুমোদিত পিডিএফ ডকুমেন্ট",
    academicBoard: "আস-সুন্নাহ একাডেমিক বোর্ড কর্তৃক অনুমোদিত",
    arabicFont: "font-sans",
    clearFilter: "রিসেট ফিল্টার",
    categoriesTitle: "গবেষণার শাস্ত্রীয় বিভাগসমূহ",
    totalShowing: "মোট প্রদর্শিত"
  },
  ar: {
    heroTitle: "البحوث والدراسات العلمية",
    heroDesc: "تعزيز البحث العلمي المحكم والاجتهاد الفقهي الأصيل لمعالجة التحديات الفكرية والمعاصرة التي تواجه الأمة الإسلامية.",
    searchPlaceholder: "ابحث بالعنوان، الكلمة المفتاحية، أو اسم الباحث...",
    filtersBtn: "خيارات التصفية",
    activeFilters: "التصفية الحالية:",
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
    readPdf: "قراءة البحث (PDF)",
    downloadPdf: "تحميل PDF",
    close: "إغلاق",
    aboutManuscript: "الملخص والنتائج والفرضيات العلمية",
    keywordsLabel: "الكلمات الدلالية المفهرسة",
    attachedDoc: "المستند الأصلي / ملف PDF المعتمد",
    academicBoard: "معتمد من الهيئة العلمية بمعهد السنة",
    arabicFont: "font-serif",
    clearFilter: "إعادة ضبط",
    categoriesTitle: "التخصصات العلمية والبحثية",
    totalShowing: "المعروض"
  }
};

interface ResearchPortalProps {
  locale: 'en' | 'bn' | 'ar';
}

export function ResearchPortal({ locale }: ResearchPortalProps) {
  const dict = pt[locale] || pt.en;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [dbPapers, setDbPapers] = useState<any[]>([]);
  const [, setIsLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);

  // Categories definition
  const categories = [
    { id: 'All', label: dict.allCategories, count: null },
    { id: 'Quran & Hadith', label: dict.quranHadith, count: null },
    { id: 'Islamic Jurisprudence (Usul al-Fiqh)', label: dict.fiqh, count: null },
    { id: 'Theology & Aqeedah', label: dict.theology, count: null },
    { id: 'Dawah & Contemporary Culture', label: dict.dawah, count: null },
    { id: 'Islamic Economics & Finance', label: dict.economics, count: null },
    { id: 'Manuscript Heritage & Editing', label: dict.manuscripts, count: null },
  ];

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
    },
    {
      id: 'default-4',
      title: locale === 'bn' 
        ? 'তাফসির সাহিত্যে ইসরাঈলিয়াত বর্ণনা: তাহকীক ও মূলনীতি' 
        : locale === 'ar' 
        ? 'الإسرائيليات في كتب التفسير: دراسة نقدية ومنهجية' 
        : 'Critical Hermeneutics of Isra’iliyyat Traditions in Classical Quranic Exegesis',
      abstract: locale === 'bn' 
        ? 'চিরায়ত তাফসির গ্রন্থসমূহে উল্লেখিত ইসরাঈলিয়াত বর্ণনাসমূহের প্রামাণিকতা যাচাই এবং আধুনিক তাফসির চর্চায় বিশুদ্ধ বর্ণনার মানদণ্ড নিরূপণ।' 
        : 'A critical textual examination of Judeo-Christian narrative interpolations in classical Tafsir literature and methodological filters for authentic hermeneutics.',
      category: 'Quranic & Hadith Sciences',
      authorName: 'Shaykh Dr. Zubair al-Azhari',
      keywords: ['Tafsir', 'Hadith Sciences', 'Israiliyyat', 'Hermeneutics'],
      createdAt: '2025-11-05T12:00:00.000Z',
      pdfLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'default-5',
      title: locale === 'bn' 
        ? 'সমকালীন মুসলিম সমাজে নাস্তিক্যবাদ ও সন্দেহবাদের বুদ্ধিবৃত্তিক খণ্ডন' 
        : locale === 'ar' 
        ? 'تفكيك الشبهات الإلحادية المعاصرة في ضوء علم الكلام الأصيل' 
        : 'Rational Epistemology and Refutation of Contemporary Neo-Atheistic Skepticism',
      abstract: locale === 'bn' 
        ? 'সমকালীন মুক্তচিন্তা ও নাস্তিক্যবাদী যুক্তিসমূহের বিপরীতে ইসলামী আকল ও নক্বলের সমন্বিত তাত্ত্বিক বিশ্লেষণ এবং তরুণ প্রজন্মের জন্য বুদ্ধিবৃত্তিক গাইডলাইন।' 
        : 'A systemic epistemological critique addressing contemporary philosophical naturalism and skeptical dialectics from the perspective of orthodox Kalam.',
      category: 'Theology & Aqeedah',
      authorName: 'Dr. Munir Ahmad (Senior Fellow)',
      keywords: ['Aqeedah', 'Kalam', 'Philosophy', 'Atheism'],
      createdAt: '2026-02-10T12:00:00.000Z',
      pdfLink: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 'default-6',
      title: locale === 'bn' 
        ? 'ইসলামী পাণ্ডুলিপি সংরক্ষণ ও আধুনিক ডিজিটাল ক্যাটালগিং পদ্ধতি' 
        : locale === 'ar' 
        ? 'تحقيق المخطوطات الإسلامية والتقنيات الرقمية في الفهرسة والتوثيق' 
        : 'Manuscript Codicology & AI-Assisted Transcription Standards in Islamic Heritage',
      abstract: locale === 'bn' 
        ? 'প্রাচীন আরবি ও ফারসি পাণ্ডুলিপির কোডিকোলজি, পাঠোদ্ধার এবং ডিজিটাল রিপোজিটরিতে আধুনিক কৃত্রিম বুদ্ধিমত্তা ও অপটিক্যাল ক্যারেক্টার রিকগনিশনের প্রয়োগ।' 
        : 'Exploring advanced codicological preservation methods, textual collation standards, and digital curation pipelines for historical Islamic manuscripts.',
      category: 'Manuscript Heritage & Editing',
      authorName: 'Prof. Hasan Abdul Jalil',
      keywords: ['Codicology', 'Manuscripts', 'Digital Humanities', 'Heritage'],
      createdAt: '2025-12-18T12:00:00.000Z',
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
      (activeCategory === 'Islamic Economics & Finance' && (pCat.includes('Economics') || pCat.includes('অর্থনীতি'))) ||
      (activeCategory === 'Manuscript Heritage & Editing' && (pCat.includes('Manuscript') || pCat.includes('পাণ্ডুলিপি')));

    return matchesSearch && matchesCategory;
  });

  const getActiveCategoryLabel = () => {
    const found = categories.find(c => c.id === activeCategory);
    return found ? found.label : activeCategory;
  };

  return (
    <div className="space-y-8 font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Minimalist Top Control Bar (Search + Filter Sidebar Trigger) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-sm -mt-8 relative z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Clean Search Input */}
          <div className="relative flex-1">
            <Search className={`absolute ${locale === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.searchPlaceholder}
              className={`w-full ${locale === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 sm:py-3 bg-slate-50 border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#064e3b]/20 focus:border-[#064e3b] focus:bg-white text-xs sm:text-sm placeholder-slate-400 transition-all`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute ${locale === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Tap-to-open Filter Sidebar Button */}
          <button
            onClick={() => setIsFilterSidebarOpen(true)}
            className={`inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-2xs shrink-0 ${
              activeCategory !== 'All' 
                ? 'bg-[#064e3b] text-white hover:bg-emerald-900 border border-[#064e3b]' 
                : 'bg-emerald-50 text-[#064e3b] hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            <Filter className="w-4 h-4 text-amber-500" />
            <span className="hidden xs:inline">{dict.filtersBtn}</span>
            {activeCategory !== 'All' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Minimal active filter indicator pill (only if filtered) */}
        {activeCategory !== 'All' && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 px-1">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="font-semibold text-slate-400">{dict.activeFilters}</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[#064e3b] font-bold">
                {getActiveCategoryLabel()}
              </span>
            </div>
            <button
              onClick={() => setActiveCategory('All')}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>{dict.clearFilter}</span>
            </button>
          </div>
        )}
      </div>

      {/* Publications Section Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 pt-2">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-amber-600" />
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold text-[#064e3b] font-serif">
            {dict.latestPubs}
          </h2>
        </div>
        <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
          {dict.totalShowing}: <span className="text-[#064e3b] font-extrabold">{filteredPapers.length}</span>
        </div>
      </div>

      {/* 3-Column Prominent Research Cards Grid */}
      {filteredPapers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 text-sm font-medium">{dict.noPapers}</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-4 px-4 py-2 bg-emerald-50 text-[#064e3b] hover:bg-emerald-100 rounded-xl text-xs font-bold border border-emerald-200 transition-all cursor-pointer"
          >
            {dict.clearFilter}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredPapers.map((pub) => {
            const pubTitle = pub.title || pub.manuscript_metadata?.title;
            const pubCat = pub.category || pub.manuscript_metadata?.category || 'Research';
            const pubAbstract = pub.abstract || pub.manuscript_metadata?.abstract;
            const pubAuthor = pub.authorName || pub.author_profile?.name;
            const pubKeywords = pub.keywords || pub.manuscript_metadata?.keywords || [];
            const docUrl = pub.pdfLink || pub.manuscript_metadata?.fileUrl || pub.manuscript_metadata?.googleDriveUrl;

            return (
              <div 
                key={pub.id} 
                className="bg-white rounded-2xl border-2 border-slate-200/90 hover:border-emerald-600/60 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Top Card Accent Header */}
                <div className="p-5 sm:p-6 space-y-3.5 flex-1 flex flex-col">
                  
                  {/* Category Badge & Date */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-[#064e3b] text-[10px] font-extrabold uppercase tracking-wider rounded-md border border-emerald-200/70 truncate max-w-[65%]">
                      {pubCat}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 font-mono shrink-0">
                      {new Date(pub.approvedAt || pub.createdAt || Date.now()).toLocaleDateString(locale, { year: 'numeric', month: 'numeric', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Research Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#064e3b] transition-colors leading-snug font-serif line-clamp-2 min-h-[2.75rem]">
                    {pubTitle}
                  </h3>

                  {/* Abstract preview */}
                  <p className="text-slate-600 text-xs leading-relaxed font-sans line-clamp-3 flex-1">
                    {pubAbstract}
                  </p>

                  {/* Keywords tags */}
                  {pubKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pubKeywords.slice(0, 3).map((kw: string, i: number) => (
                        <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom Meta & Actions Bar */}
                <div className="bg-slate-50/90 border-t border-slate-200/80 p-4 space-y-3">
                  {/* Scholar info */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-[#064e3b] font-bold text-xs shrink-0">
                      <Users className="w-3.5 h-3.5 text-emerald-800" />
                    </div>
                    <div className="text-xs truncate">
                      <span className="text-slate-400 text-[10px] block leading-none">{dict.author}</span>
                      <strong className="text-slate-800 font-bold text-xs truncate block mt-0.5">{pubAuthor}</strong>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    <button 
                      onClick={() => setSelectedPaper(pub)}
                      className="flex-1 py-2 px-3 bg-white border border-slate-300 hover:border-[#064e3b] hover:bg-emerald-50 text-slate-800 hover:text-[#064e3b] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{dict.viewManuscript}</span>
                    </button>

                    {docUrl && docUrl !== '#' && (
                      <a 
                        href={docUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3.5 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                        title={dict.downloadPdf}
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

      {/* TAP-TO-OPEN SIDEBAR DRAWER FOR FILTERS */}
      {isFilterSidebarOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsFilterSidebarOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          <div className={`fixed inset-y-0 ${locale === 'ar' ? 'left-0' : 'right-0'} max-w-sm w-full bg-white shadow-2xl flex flex-col z-10 animate-slideIn border-l border-slate-200`}>
            
            {/* Sidebar Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-950 text-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-900 rounded-lg text-amber-400">
                  <Filter className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-serif text-white">{dict.categoriesTitle}</h3>
                  <p className="text-[11px] text-emerald-200/80">Select field to filter publications</p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterSidebarOpen(false)}
                className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Options List */}
            <div className="p-5 space-y-2 overflow-y-auto flex-1">
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsFilterSidebarOpen(false);
                    }}
                    className={`w-full text-left flex items-center justify-between p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#064e3b] text-white shadow-sm border border-[#064e3b]'
                        : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-[#064e3b] border border-slate-200/80'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-300'}`} />
                      {cat.label}
                    </span>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 rtl:rotate-180" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sidebar Bottom Reset & Apply */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setIsFilterSidebarOpen(false);
                }}
                className="flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {dict.clearFilter}
              </button>
              <button
                onClick={() => setIsFilterSidebarOpen(false)}
                className="flex-1 py-2.5 px-4 bg-[#064e3b] text-white hover:bg-emerald-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED MANUSCRIPT READ POPUP MODAL */}
      {selectedPaper && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
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
                className="text-slate-400 hover:text-slate-700 font-bold text-sm bg-white border border-slate-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
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
                    className="px-4 py-2 bg-[#064e3b] text-white hover:bg-emerald-900 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
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

