'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Book, BookOpen, Bookmark, FileText, Sparkles, ExternalLink, 
  Search, HardDrive, Cloud, FileSpreadsheet, FolderArchive, 
  Download, ArrowRight, ShieldCheck, CheckCircle2, ChevronRight,
  Maximize2, Minimize2, RefreshCw, Layers, Database, Library,
  Filter, Grid, List, Eye, BookMarked, Shield, Share2, Check,
  ChevronLeft, ArrowUpDown, AlertCircle, Info, Sparkle
} from 'lucide-react';
import { formatContentHtml } from '@/lib/contentFormatter';
import { LibraryBook, DEFAULT_LIBRARY_BOOKS, getBookEmbedUrl, getBookDownloadUrl } from '@/lib/libraryBooksData';
import { BookReaderModal } from '@/components/BookReaderModal';
import { searchBooksIndexed, loadAndIndexGoogleSheet } from '@/lib/searchIndex';
import { parseGoogleSheetBooks } from '@/lib/googleSheetParser';

export interface LibraryPageData {
  title?: string;
  subtitle?: string;
  bannerImageUrl?: string;
  libraryIntroTitle?: string;
  libraryIntroDesc?: string;
  cloudVaultTitle?: string;
  cloudVaultSubtitle?: string;
  googleSheetsUrl?: string;
  oneDriveUrl?: string;
  googleDriveUrl?: string;
  sheetEmbedEnabled?: boolean;
  sheetEmbedUrl?: string;
  categories?: any[];
  content?: string;
  syncedBooks?: LibraryBook[];
}

interface LibraryPageContentProps {
  locale: 'en' | 'bn' | 'ar';
}

const libDict = {
  en: {
    portalBadge: 'Central Digital Library & E-Book Portal',
    defaultTitle: 'Central Digital Library & Cloud Catalog',
    defaultDesc: 'Explore, search, read directly in-browser, and download thousands of authentic Islamic books and manuscripts.',
    cloudTitle: '60,000+ Islamic Books in Cloud Vault',
    cloudSubtitle: 'Read authentic books of Tafsir, Hadith, Fiqh, Seerah, and Aqeedah directly in your browser without leaving the website.',
    cloudHeading: 'Read Online, Search by Field, and Download Authentic Islamic Books',
    savedBooks: 'Preserved Volumes',
    syncRefresh: 'Sync Refresh',
    syncTitle: 'Re-sync live from Google Sheet',
    searchPlaceholder: 'Search by book title, author, category, or keyword (e.g. Bukhari, Tafsir, Fiqh)...',
    sortByName: 'Sort by Title',
    sortByAuthor: 'Sort by Author',
    sortByCategory: 'Sort by Category',
    gridView: 'Grid Card View',
    tableView: 'Table / List View',
    allBooks: 'All Books',
    showingBooks: 'Showing',
    booksUnit: 'books',
    categoryLabel: 'Category:',
    searchLabel: 'Search:',
    resetFilter: 'Reset Filter',
    readOnline: 'Read Online',
    download: 'Download',
    tableName: 'Book Title',
    tableAuthor: 'Author / Scholar',
    tableCategory: 'Subject / Category',
    tableVolume: 'Volume / Size',
    tableActions: 'Actions',
    pageLabel: 'Page',
    of: 'of',
    prev: 'Previous',
    next: 'Next',
    noBooksTitle: 'No Books Found',
    noBooksDesc: 'Try adjusting your search query or selecting a different category.',
    viewAllBooks: 'View All Books',
    policyTitle: 'Digital Library Usage Policy & Guidelines'
  },
  bn: {
    portalBadge: 'কেন্দ্রীয় ডিজিটাল লাইব্রেরি ও ই-বুক পোর্টাল',
    defaultTitle: 'কেন্দ্রীয় ডিজিটাল লাইব্রেরি ও ক্লাউড ক্যাটালগ',
    defaultDesc: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের ডিজিটাল লাইব্রেরির সকল কিতাব এই ওয়েবসাইটে সরাসরি পড়ুন, অনুসন্ধান করুন ও ডাউনলোড করুন।',
    cloudTitle: '৬০,০০০+ কিতাবের মেগা ডিজিটাল ক্লাউড লাইব্রেরি',
    cloudSubtitle: 'গুগল ড্রাইভ ও ক্লাউড আর্কাইভে সংরক্ষিত তাফসীর, হাদীস, ফিকহ, সীরাত ও আকীদার কিতাবসমূহ ওয়েবসাইট ত্যাগ না করেই এই ভিউয়ারে সরাসরি পড়তে পারবেন।',
    cloudHeading: 'ওয়েবসাইটে সরাসরি কিতাব পড়ুন, ডাউনলোড ও শাস্ত্রভিত্তিক অনুসন্ধান করুন',
    savedBooks: 'সংরক্ষিত কিতাব',
    syncRefresh: 'সিঙ্ক রিফ্রেশ',
    syncTitle: 'গুগল শীট থেকে পুনরায় লাইভ সিঙ্ক করুন',
    searchPlaceholder: 'কিতাবের নাম, লেখক/মুসান্নিফ, বিষয় বা কিওয়ার্ড দিয়ে খুঁজুন (যেমন: বুখারী, তাফসীর, ফিকহ)...',
    sortByName: 'নাম অনুযায়ী',
    sortByAuthor: 'লেখক অনুযায়ী',
    sortByCategory: 'বিষয় অনুযায়ী',
    gridView: 'গ্রিড কার্ড ভিউ',
    tableView: 'তালিকা / টেবিল ভিউ',
    allBooks: 'সকল কিতাব',
    showingBooks: 'মোট',
    booksUnit: 'টি কিতাব প্রদর্শিত হচ্ছে',
    categoryLabel: 'ক্যাটাগরি:',
    searchLabel: 'অনুসন্ধান:',
    resetFilter: 'ফিল্টার রিসেট করুন',
    readOnline: 'অনলাইনে পড়ুন',
    download: 'সরাসরি ডাউনলোড করুন',
    tableName: 'কিতাবের নাম',
    tableAuthor: 'লেখক / মুসান্নিফ',
    tableCategory: 'বিষয় / ক্যাটাগরি',
    tableVolume: 'খণ্ড / সাইজ',
    tableActions: 'কার্যক্রম',
    pageLabel: 'পৃষ্ঠা',
    of: '/',
    prev: 'পূর্ববর্তী',
    next: 'পরবর্তী',
    noBooksTitle: 'কোনো কিতাব পাওয়া যায়নি',
    noBooksDesc: 'অনুসন্ধান ফিল্টার বা ক্যাটাগরি পরিবর্তন করে পুনরায় চেষ্টা করুন।',
    viewAllBooks: 'সকল কিতাব পুনরায় দেখুন',
    policyTitle: 'ডিজিটাল লাইব্রেরি ব্যবহার নীতি ও বিশেষ দিকনির্দেশনা'
  },
  ar: {
    portalBadge: 'المكتبة الرقمية المركزية وبوابة الكتب الإلكترونية',
    defaultTitle: 'المكتبة الرقمية المركزية والفهرس السحابي',
    defaultDesc: 'تصفح واقرأ وحمل آلاف أمهات الكتب والمخطوطات الإسلامية المعتمدة مباشرة عبر المتصفح.',
    cloudTitle: 'أكثر من ٦٠,٠٠٠ كتاب إسلامي في الخزينة السحابية',
    cloudSubtitle: 'اقرأ كتب التفسير والحديث والفقه والسيرة والعقيدة المحفوظة سحابياً مباشرة عبر موقع المعهد دون مغادرته.',
    cloudHeading: 'قراءة الكتب مباشرة والبحث التخصصي والتحميل الفوري',
    savedBooks: 'المجلدات المتاحة',
    syncRefresh: 'تحديث المزامنة',
    syncTitle: 'إعادة المزامنة من جدول البيانات',
    searchPlaceholder: 'ابحث بعنوان الكتاب، المؤلف، الموضوع، أو الكلمة المفتاحية (مثل: البخاري، التفسير، الفقه)...',
    sortByName: 'حسب العنوان',
    sortByAuthor: 'حسب المؤلف',
    sortByCategory: 'حسب التصنيف',
    gridView: 'عرض الشبكة',
    tableView: 'عرض القائمة / الجدول',
    allBooks: 'جميع الكتب',
    showingBooks: 'يتم عرض',
    booksUnit: 'كتاباً',
    categoryLabel: 'التصنيف:',
    searchLabel: 'البحث:',
    resetFilter: 'إعادة ضبط التصفية',
    readOnline: 'قراءة عبر الموقع',
    download: 'تحميل مباشر',
    tableName: 'عنوان الكتاب',
    tableAuthor: 'المؤلف / المحقق',
    tableCategory: 'الفن / التصنيف',
    tableVolume: 'المجلد / الحجم',
    tableActions: 'الإجراءات',
    pageLabel: 'صفحة',
    of: 'من',
    prev: 'السابق',
    next: 'التالي',
    noBooksTitle: 'لم يتم العثور على كتب',
    noBooksDesc: 'يرجى تغيير عبارة البحث أو اختيار تصنيف آخر.',
    viewAllBooks: 'عرض جميع الكتب',
    policyTitle: 'إرشادات وضوابط استخدام المكتبة الرقمية'
  }
};

export function LibraryPageContent({ locale }: LibraryPageContentProps) {
  const t = libDict[locale] || libDict.en;
  const [data, setData] = useState<LibraryPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingSheet, setSyncingSheet] = useState(false);
  const [sheetBooks, setSheetBooks] = useState<LibraryBook[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'category'>('title');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(18);

  // Reader Modal state
  const [selectedBookForReading, setSelectedBookForReading] = useState<LibraryBook | null>(null);

  // Sidebar toggle state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Listen to Firestore site_pages/library
  useEffect(() => {
    const docRef = doc(db, 'site_pages', 'library');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const pageData = docSnap.data() as LibraryPageData;
        setData(pageData);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching library page content:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch / Sync books from Google Sheet URL using progressive indexing
  const fetchSheetBooks = useCallback(async (sheetUrl: string) => {
    if (!sheetUrl) return;
    setSyncingSheet(true);
    setSyncError(null);

    try {
      // Check cache in session storage first
      const cacheKey = `lib_sheet_${sheetUrl}`;
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem(cacheKey) : null;
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (Array.isArray(parsedCache) && parsedCache.length > 0) {
            setSheetBooks(parsedCache);
            setSyncingSheet(false);
            return;
          }
        } catch {
          // ignore cache parse error
        }
      }

      // 1. Direct browser fetch via Google Sheet parser (works fully statically on Firebase hosting)
      const parsedDirect = await parseGoogleSheetBooks(sheetUrl);
      if (parsedDirect.success && parsedDirect.books.length > 0) {
        setSheetBooks(parsedDirect.books);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(parsedDirect.books));
          } catch {
            // cache quota exceeded, ignore
          }
        }
        setSyncingSheet(false);
        return;
      }

      // 2. Fallback to API route if available
      const res = await fetch('/api/library/sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl })
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch sheet');
      }

      if (Array.isArray(result.books) && result.books.length > 0) {
        setSheetBooks(result.books);
        if (typeof window !== 'undefined') {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(result.books));
          } catch {
            // cache quota exceeded, ignore
          }
        }
      }
    } catch (err: any) {
      console.warn('Could not sync live from Google Sheet, using catalog:', err.message);
      setSyncError(err.message);
    } finally {
      setSyncingSheet(false);
    }
  }, []);

  // Trigger fetch when googleSheetsUrl changes
  useEffect(() => {
    if (data?.googleSheetsUrl && data.googleSheetsUrl.startsWith('http')) {
      fetchSheetBooks(data.googleSheetsUrl);
    }
  }, [data?.googleSheetsUrl, fetchSheetBooks]);

  // Combined Master Books list (Sheet Books or Fallback Default Pre-loaded database)
  const allBooks: LibraryBook[] = useMemo(() => {
    if (sheetBooks.length > 0) {
      return sheetBooks;
    }
    if (data?.syncedBooks && data.syncedBooks.length > 0) {
      return data.syncedBooks;
    }
    return DEFAULT_LIBRARY_BOOKS;
  }, [sheetBooks, data?.syncedBooks]);

  // Search, filter, and pagination executed via indexed engine
  const searchResult = useMemo(() => {
    return searchBooksIndexed(allBooks, {
      query: searchQuery,
      category: selectedCategory,
      language: selectedLanguage,
      page: currentPage,
      pageSize: itemsPerPage,
      sortBy: sortBy,
    });
  }, [allBooks, searchQuery, selectedCategory, selectedLanguage, currentPage, itemsPerPage, sortBy]);

  const dynamicCategories = useMemo(() => {
    return searchResult.categories.map(c => c.name);
  }, [searchResult.categories]);

  const filteredBooks = searchResult.books;
  const totalMatches = searchResult.totalMatches;
  const totalPages = searchResult.totalPages;
  const paginatedBooks = filteredBooks;

  const formattedNoticeHtml = data?.content ? formatContentHtml(data.content) : '';

  return (
    <div className="space-y-10 pb-12">
      
      {/* 1. INTRO & INSTITUTIONAL HEADER */}
      <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/80 border border-emerald-300/60 rounded-full text-xs font-extrabold text-[#064e3b] uppercase tracking-wider shadow-2xs">
          <Library className="w-3.5 h-3.5 text-emerald-800" />
          <span>{t.portalBadge}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#064e3b] font-serif leading-tight">
          {data?.libraryIntroTitle || t.defaultTitle}
        </h2>
        
        <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>

        <p className="text-slate-600 leading-relaxed text-xs sm:text-sm md:text-base font-sans">
          {data?.libraryIntroDesc || t.defaultDesc}
        </p>
      </section>

      {/* 2. STATS & LIVE SYNC BANNER */}
      <section className="bg-gradient-to-br from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{data?.cloudVaultTitle || t.cloudTitle}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
              {t.cloudHeading}
            </h3>
            <p className="text-emerald-100/80 text-xs max-w-2xl leading-relaxed">
              {data?.cloudVaultSubtitle || t.cloudSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Live Book Count */}
            <div className="bg-emerald-950/70 border border-emerald-700/60 px-4 py-3 rounded-2xl text-center shadow-inner">
              <div className="text-xl sm:text-2xl font-black text-amber-400 font-serif">
                {allBooks.length > 50 ? `${allBooks.length.toLocaleString()}` : '60,000+'}
              </div>
              <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-semibold">
                {t.savedBooks}
              </div>
            </div>

            {/* Sync Refresh Button */}
            {data?.googleSheetsUrl && (
              <button
                type="button"
                onClick={() => fetchSheetBooks(data.googleSheetsUrl!)}
                disabled={syncingSheet}
                className="p-3 bg-emerald-800/60 hover:bg-emerald-700/80 border border-emerald-600/40 text-emerald-200 hover:text-white rounded-2xl transition-all cursor-pointer shadow-sm flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                title={t.syncTitle}
              >
                <RefreshCw className={`w-4 h-4 text-amber-300 ${syncingSheet ? 'animate-spin' : ''}`} />
                <span className="text-[9px] font-bold">{t.syncRefresh}</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT WITH SIDEBAR LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 relative">
        
        {/* MOBILE CATEGORY TOGGLE BUTTON */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
           <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
             <Layers className="w-4 h-4 text-emerald-700" />
             {locale === 'bn' ? 'ক্যাটাগরি সমূহ' : locale === 'ar' ? 'التصنيفات' : 'Categories'}
           </span>
           <button 
             type="button"
             className="p-1.5 bg-slate-100 text-[#064e3b] rounded-lg border border-slate-200"
           >
             <Filter className="w-4 h-4" />
           </button>
        </div>

        {/* SIDEBAR */}
        <aside className={`lg:w-64 shrink-0 transition-all duration-300 ${isSidebarOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm sticky top-24 space-y-4 max-h-[85vh] overflow-hidden flex flex-col">
             <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
               <div className="flex items-center gap-2">
                 <Layers className="w-4 h-4 text-emerald-700" />
                 <h3 className="font-bold text-slate-800 text-sm">
                   {locale === 'bn' ? 'ক্যাটাগরি সমূহ' : locale === 'ar' ? 'التصنيفات' : 'Categories'}
                 </h3>
               </div>
               <button
                 type="button"
                 onClick={() => setIsSidebarOpen(false)}
                 className="lg:hidden p-1 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg"
               >
                 <Minimize2 className="w-4 h-4" />
               </button>
             </div>
             
             <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar flex-1 pb-4">
               <button
                  type="button"
                  onClick={() => { setSelectedCategory('all'); window.innerWidth < 1024 && setIsSidebarOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#064e3b] text-white shadow-md'
                      : 'bg-transparent hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200'
                  }`}
               >
                 <span>{t.allBooks}</span>
                 <span className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                    selectedCategory === 'all' ? 'bg-emerald-800 text-amber-300' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:border-slate-200'
                 }`}>
                   {allBooks.length}
                 </span>
               </button>

               {dynamicCategories.map((cat, idx) => {
                  const isSelected = selectedCategory === cat;
                  const count = allBooks.filter(b => b.category === cat).length;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setSelectedCategory(cat); window.innerWidth < 1024 && setIsSidebarOpen(false); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-[#064e3b] text-white shadow-md'
                          : 'bg-transparent hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-200'
                      }`}
                    >
                      <span className="truncate pr-2">{cat}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] transition-colors ${
                        isSelected ? 'bg-emerald-800 text-amber-300' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:border-slate-200'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
               })}
             </div>
          </div>
        </aside>

        {/* RIGHT CONTENT: SEARCH & BOOKS */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* 3. SEARCH & DYNAMIC FILTER TOOLBAR */}
          <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
              
              <div className="flex items-center gap-3 flex-1">
                {/* Desktop Sidebar Toggle Button */}
                {!isSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="hidden lg:flex items-center justify-center p-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 rounded-xl transition-colors shrink-0"
                    title={locale === 'bn' ? 'ক্যাটাগরি দেখান' : locale === 'ar' ? 'إظهار التصنيفات' : 'Show Categories'}
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                )}

                {/* Main Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 transition-all font-sans text-slate-800 placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              </div>

              {/* Controls: Language, Sort, View Toggle */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                {/* Sort Select */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent outline-none text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    <option value="title">{t.sortByName}</option>
                    <option value="author">{t.sortByAuthor}</option>
                    <option value="category">{t.sortByCategory}</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      viewMode === 'grid' 
                        ? 'bg-white text-emerald-800 font-bold shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={t.gridView}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      viewMode === 'table' 
                        ? 'bg-white text-emerald-800 font-bold shadow-2xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={t.tableView}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Results summary bar */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-slate-100">
              <div>
                {t.showingBooks} <strong className="text-emerald-800">{totalMatches.toLocaleString()}</strong> {t.booksUnit}
                {selectedCategory !== 'all' && (
                  <span> &bull; {t.categoryLabel} <strong className="text-slate-700">{selectedCategory}</strong></span>
                )}
                {searchQuery && (
                  <span> &bull; {t.searchLabel} &ldquo;<strong>{searchQuery}</strong>&rdquo;</span>
                )}
              </div>

              {(searchQuery || selectedCategory !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer"
                >
                  {t.resetFilter}
                </button>
              )}
            </div>
          </section>

          {/* 4. BOOKS DISPLAY (GRID VIEW OR TABLE VIEW) */}
          <section className="space-y-6">
        
        {paginatedBooks.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedBooks.map((book) => {
                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                    >
                      {/* Top Header Card */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-[#064e3b] group-hover:text-white transition-colors duration-200 shadow-2xs shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap justify-end">
                            {book.category && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#064e3b] border border-emerald-200/60 rounded-md">
                                {book.category}
                              </span>
                            )}
                            {book.volume && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/60 rounded-md">
                                {book.volume}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#064e3b] transition-colors leading-snug font-serif">
                            {book.title}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1 font-sans flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">{book.author}</span>
                          </p>
                        </div>

                        {book.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {book.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono pt-1">
                          {book.language && <span>{book.language}</span>}
                          {book.fileSize && <span>&bull; {book.fileSize}</span>}
                          <span>&bull; PDF</span>
                        </div>
                      </div>

                      {/* Bottom Action Footer with IN-APP READ and DOWNLOAD */}
                      <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                        {/* 1. READ ONLINE IN-WEBSITE BUTTON */}
                        <button
                          type="button"
                          onClick={() => setSelectedBookForReading(book)}
                          className="flex-1 px-3 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer group-hover:shadow"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-300" />
                          <span>{t.readOnline}</span>
                        </button>

                        {/* 2. DIRECT DOWNLOAD BUTTON */}
                        {book.driveUrl && (
                          <a
                            href={book.downloadUrl || getBookDownloadUrl(book.driveUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="p-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-xl transition-colors cursor-pointer shadow-2xs"
                            title={t.download}
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5 pl-4">{t.tableName}</th>
                        <th className="p-3.5">{t.tableAuthor}</th>
                        <th className="p-3.5">{t.tableCategory}</th>
                        <th className="p-3.5">{t.tableVolume}</th>
                        <th className="p-3.5 text-right pr-4">{t.tableActions}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedBooks.map((book) => (
                        <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 pl-4">
                            <div className="font-bold text-slate-900 font-serif text-sm">
                              {book.title}
                            </div>
                            {book.language && (
                              <div className="text-[10px] text-slate-500 font-sans">
                                {book.language}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">
                            {book.author}
                          </td>
                          <td className="p-3.5">
                            {book.category && (
                              <span className="inline-block text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-[#064e3b] border border-emerald-100 rounded-md">
                                {book.category}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-500 text-[11px]">
                            <div>{book.volume || '-'}</div>
                            {book.fileSize && <div className="text-[10px] text-slate-400">{book.fileSize}</div>}
                          </td>
                          <td className="p-3.5 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedBookForReading(book)}
                                className="px-3 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5 text-amber-300" />
                                <span>{t.readOnline}</span>
                              </button>

                              {book.driveUrl && (
                                <a
                                  href={book.downloadUrl || getBookDownloadUrl(book.driveUrl)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                                  title={t.download}
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs">
                <div className="text-slate-500">
                  {t.pageLabel} <strong>{currentPage}</strong> {t.of} <strong>{totalPages}</strong> ({t.showingBooks} {filteredBooks.length} {t.booksUnit})
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>{t.prev}</span>
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                      }
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-[#064e3b] text-white shadow-2xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t.next}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* NO RESULTS FOUND */
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-base font-bold text-slate-700">
              {t.noBooksTitle}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t.noBooksDesc}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-emerald-50 text-[#064e3b] border border-emerald-200 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              {t.viewAllBooks}
            </button>
          </div>
        )}

          </section>
        </main>
      </div>

      {/* 5. IN-WEBSITE BOOK READER MODAL */}
      <BookReaderModal
        book={selectedBookForReading}
        onClose={() => setSelectedBookForReading(null)}
        locale={locale}
      />

      {/* 6. OPTIONAL RICH TEXT LIBRARY USAGE POLICY / GENERAL NOTICE */}
      {formattedNoticeHtml && (
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200/80 max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider">
              {t.policyTitle}
            </span>
          </div>
          <div 
            className="prose prose-emerald max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3"
            dangerouslySetInnerHTML={{ __html: formattedNoticeHtml }}
          />
        </div>
      )}

    </div>
  );
}
