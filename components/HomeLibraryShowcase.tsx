'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Locale } from '@/lib/dictionary';
import { 
  Book, BookOpen, Search, ArrowRight, Cloud, 
  ExternalLink, Sparkles, Database, CheckCircle2, Bookmark, Eye 
} from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DEFAULT_LIBRARY_BOOKS, LibraryBook } from '@/lib/libraryBooksData';

interface HomeLibraryShowcaseProps {
  locale: Locale;
}

export function HomeLibraryShowcase({ locale }: HomeLibraryShowcaseProps) {
  const router = useRouter();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [featuredBooks, setFeaturedBooks] = useState<LibraryBook[]>(DEFAULT_LIBRARY_BOOKS.slice(0, 4));

  const dict = {
    en: {
      badge: 'Central Digital Library & Cloud Archive',
      title: 'Global Islamic Library Vault',
      subtitle: 'Instant direct in-browser access to over 60,000+ classical and contemporary volumes in Tafsir, Hadith, Fiqh, and Islamic History.',
      searchPlaceholder: 'Search by book title or author (e.g., Bukhari, Tafsir, Fiqh, Nawawi)...',
      searchBtn: 'Search Library',
      exploreAll: 'Open Digital Library & Full Catalog',
      readOnline: 'Read in Library',
      volumesBadge: '60,000+ Preserved Volumes',
      cloudSync: 'Live Cloud Sheet Sync',
      author: 'Author:',
      category: 'Field:'
    },
    bn: {
      badge: 'কেন্দ্রীয় ডিজিটাল লাইব্রেরি ও ক্লাউড ভল্ট',
      title: 'উচ্চতর ডিজিটাল লাইব্রেরি ও কিতাব ভাণ্ডার',
      subtitle: 'তাফসীর, হাদিস, ফিকাহ, আকীদা ও সীরাতের ৬০,০০০+ প্রামাণ্য কিতাব ও গবেষণামূলক পাণ্ডুলিপি সরাসরি ব্রাউজারে পড়ুন ও ডাউনলোড করুন।',
      searchPlaceholder: 'কিতাবের নাম বা লেখক দিয়ে খুঁজুন (যেমন: বুখারী, তাফসীর, ফিকহ, নববী)...',
      searchBtn: 'লাইব্রেরিতে খুঁজুন',
      exploreAll: 'সম্পূর্ণ ডিজিটাল লাইব্রেরি খুলুন',
      readOnline: 'অনলাইনে পড়ুন',
      volumesBadge: '৬০,০০০+ সংরক্ষিত কিতাব',
      cloudSync: 'লাইভ ক্লাউড শিট সিঙ্ক',
      author: 'লেখক / ইমাম:',
      category: 'শাস্ত্র:'
    },
    ar: {
      badge: 'المكتبة الرقمية المركزية والمستودع السحابي',
      title: 'خزانة التراث والمكتبة الإسلامية الكبرى',
      subtitle: 'تصفح وقراءة وتحميل أكثر من ٦٠،٠٠٠ مجلد أصيل في علوم التفسير، الحديث، الفقه، السيرة النبوية، والتاريخ الإسلامي مباشرة.',
      searchPlaceholder: 'ابحث عن اسم الكتاب أو المؤلف (مثال: البخاري، التفسير، الفقه، النووي)...',
      searchBtn: 'بحث في المكتبة',
      exploreAll: 'فتح المكتبة الرقمية وفهرس الكتب',
      readOnline: 'قراءة في المكتبة',
      volumesBadge: 'أكثر من ٦٠،٠٠٠ مجلد محفوظ',
      cloudSync: 'مزامنة سحابية مباشرة',
      author: 'المؤلف:',
      category: 'المجال:'
    }
  };

  const t = dict[locale] || dict.en;

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_pages', 'library'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.syncedBooks && Array.isArray(data.syncedBooks) && data.syncedBooks.length > 0) {
          setFeaturedBooks(data.syncedBooks.slice(0, 4));
        }
      }
    }, (err) => {
      console.warn('Library showcase listener notice:', err);
    });

    return () => unsub();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/${locale}/library?q=${encodeURIComponent(searchKeyword.trim())}`);
    } else {
      router.push(`/${locale}/library`);
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-900 via-[#064e3b] to-slate-900 text-white font-sans relative overflow-hidden" id="home_library_showcase">
      {/* Subtle geometric pattern overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"1.5\\"/%3E%3Ccircle cx=\\"15\\" cy=\\"15\\" r=\\"1.5\\"/%3E%3C/g%3E%3C/svg%3E")'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-bold mb-3 shadow-2xs">
            <Book className="w-3.5 h-3.5 text-amber-300" />
            <span>{t.badge}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif tracking-tight">
            {t.title}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            {t.subtitle}
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 max-w-xl mx-auto flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-lg">
            <div className="pl-3 text-emerald-300">
              <Search className="w-4 h-4" />
            </div>
            <input 
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-transparent text-white placeholder-emerald-200/60 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.searchBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-[11px] text-emerald-200/90 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
              {t.volumesBadge}
            </span>
            <span className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5 text-amber-300" />
              {t.cloudSync}
            </span>
          </div>
        </div>

        {/* Featured Book Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredBooks.map((book, idx) => (
            <div 
              key={book.id || idx}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-xs rounded-2xl p-5 border border-white/15 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center text-amber-300 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/80">
                    {book.category}
                  </span>
                  <h3 className="text-sm font-bold text-white font-serif line-clamp-2 group-hover:text-amber-300 transition-colors">
                    {book.title}
                  </h3>
                </div>

                <p className="text-[11px] text-emerald-100/70 line-clamp-1">
                  <span className="text-emerald-300 font-medium">{t.author}</span> {book.author}
                </p>

                {book.description && (
                  <p className="text-[11px] text-emerald-100/60 line-clamp-2 leading-relaxed">
                    {book.description}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-300/70">
                  {book.language || 'Arabic / Multilingual'}
                </span>
                <Link
                  href={`/${locale}/library?q=${encodeURIComponent(book.title)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200"
                >
                  <span>{t.readOnline}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Explore All Library CTA */}
        <div className="text-center mt-10">
          <Link
            href={`/${locale}/library`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-emerald-50 text-[#064e3b] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 group"
          >
            <Database className="w-4 h-4 text-emerald-700" />
            <span>{t.exploreAll}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </section>
  );
}
