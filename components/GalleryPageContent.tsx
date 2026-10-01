'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Image as ImageIcon, Video, Play, Eye, Calendar, 
  MapPin, Sparkles, X, ChevronRight, ChevronLeft, 
  Download, Share2, Search, Filter, Layers, 
  ExternalLink, Check, Clock, User, Compass, 
  Maximize2, ArrowUpRight, Film, SlidersHorizontal
} from 'lucide-react';
import { parseVideoUrl } from '@/lib/mediaUtils';
import { formatContentHtml } from '@/lib/contentFormatter';

export interface GalleryPhotoItem {
  id?: string | number;
  title: string;
  category: string;
  image: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface GalleryVideoItem {
  id?: string | number;
  title: string;
  category: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
  date?: string;
  speaker?: string;
}

export interface GalleryPageData {
  title?: string;
  subtitle?: string;
  bannerImageUrl?: string;
  heroMediaType?: 'image' | 'video';
  heroVideoUrl?: string;
  heroVideoBadge?: string;
  photosSectionTitle?: string;
  photosSectionSubtitle?: string;
  photos?: GalleryPhotoItem[];
  videosSectionTitle?: string;
  videosSectionSubtitle?: string;
  videos?: GalleryVideoItem[];
  content?: string;
  updatedAt?: string;
}

// Zero dummy photos or videos: real media is published from admin panel
const DEFAULT_PHOTOS: GalleryPhotoItem[] = [];
const DEFAULT_VIDEOS: GalleryVideoItem[] = [];

const CATEGORIES_LIST = [
  'all',
  'campus',
  'seminar',
  'convocation',
  'competition',
  'library',
];

const GALLERY_CATEGORIES: Record<string, Record<string, string>> = {
  all: { en: 'All Media', bn: 'সকল মিডিয়া', ar: 'جميع الوسائط' },
  campus: { en: 'Campus & Architecture', bn: 'ক্যাম্পাস ও পরিবেশ', ar: 'الحرم الجامعي والبيئة' },
  seminar: { en: 'Academic Seminars', bn: 'একাডেমিক সেমিনার', ar: 'الندوات الأكاديمية' },
  convocation: { en: 'Convocation & Certificates', bn: 'সমাবর্তন ও সনদ', ar: 'حفل التخرج والشهادات' },
  competition: { en: 'Adhan & Qirat', bn: 'আজান ও ক্বিরাত', ar: 'الأذان والتلاوة' },
  library: { en: 'Library & Research', bn: 'লাইব্রেরি ও গবেষণা', ar: 'المكتبة والبحوث' },
};

const galleryDict = {
  en: {
    badge: 'Media & Visual Archive',
    defaultTitle: 'Institute Photo & Video Gallery',
    defaultSubtitle: 'Visual documentation of our picturesque campus, academic seminars, convocations, and special institutional events.',
    photosCount: 'Photos',
    videosCount: 'Videos',
    watchHeroVideo: 'Watch Intro Video',
    row1Tag: 'Row 1 • Photo Gallery & Stills',
    row1Title: '📸 Institute Photo Gallery',
    row1Subtitle: 'Historical moments of campus life, national conferences, convocations, and educational events.',
    viewAllPhotos: 'View All Photos',
    viewFullPhoto: 'View Full Photo',
    details: 'Details',
    row2Tag: 'Row 2 • Documentaries & Videos',
    row2Title: '🎥 Video Gallery & Documentaries',
    row2Subtitle: 'International symposiums, adhan training sessions, and special institutional video presentations.',
    viewAllVideos: 'View All Videos',
    playVideo: 'Play Video',
    explorerBadge: 'Media Repository Explorer',
    explorerTitle: 'Photo & Video Collection',
    explorerSubtitle: 'Filter by category or search to explore any institute album or documentary.',
    allMedia: 'All Media',
    photosTab: 'Photos',
    videosTab: 'Videos',
    searchPlaceholder: 'Search by title, description or keyword...',
    totalFound: 'media items found',
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    noMediaTitle: 'No Photos or Videos Found',
    noMediaDesc: 'No media matches your search or filter. Please select a different category or clear the search.',
    resetFilter: 'Reset All Filters',
    zoomIn: 'Zoom In',
    prevPage: 'Previous Page',
    nextPage: 'Next Page',
    photoIndex: 'Photo',
    downloadOriginal: 'Download in High Resolution',
    copyPhotoLink: 'Copy Photo Link',
    copyVideoLink: 'Copy Video Link',
    videoIndex: 'Video',
    openExternal: 'Open in New Tab',
    prev: 'Previous',
    next: 'Next',
    guidelinesTitle: 'Institutional Media & Archive Guidelines'
  },
  bn: {
    badge: 'আস-সুন্নাহ মিডিয়া ও ভিজ্যুয়াল আর্কাইভ',
    defaultTitle: 'ইনস্টিটিউট ফটো ও ভিডিও গ্যালারি',
    defaultSubtitle: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউটের মনোরম ক্যাম্পাস, একাডেমিক সেমিনার, সমাবর্তন ও বিভিন্ন আয়োজনের স্থিরচিত্র ও প্রামাণ্যচিত্র',
    photosCount: 'স্থিরচিত্র',
    videosCount: 'প্রামাণ্যচিত্র',
    watchHeroVideo: 'পরিচিতি ভিডিও দেখুন',
    row1Tag: 'প্রথম সারি • স্থিরচিত্র ও আলোকচিত্র',
    row1Title: '📸 ইনস্টিটিউট ফটো গ্যালারি ও স্থিরচিত্র',
    row1Subtitle: 'ক্যাম্পাস জীবন, জাতীয় সেমিনার, সমাবর্তন ও একাডেমিক আয়োজনের ঐতিহাসিক মুহূর্তসমূহ',
    viewAllPhotos: 'সকল ছবি দেখুন',
    viewFullPhoto: 'পূর্ণ ছবি দেখুন',
    details: 'বিস্তারিত',
    row2Tag: 'দ্বিতীয় সারি • প্রামাণ্যচিত্র ও ভিডিও ডকুমেন্টারি',
    row2Title: '🎥 ভিডিও গ্যালারি ও প্রামাণ্যচিত্র',
    row2Subtitle: 'আন্তর্জাতিক কনফারেন্স, আজান প্রশিক্ষণ ও ইনস্টিটিউটের বিশেষ ভিডিও উপস্থাপনা',
    viewAllVideos: 'সকল ভিডিও দেখুন',
    playVideo: 'ভিডিও প্লে করুন',
    explorerBadge: 'মিডিয়া ভাণ্ডার এক্সপ্লোরার',
    explorerTitle: 'সকল ছবি ও ভিডিও সংগ্রহ',
    explorerSubtitle: 'বিষয়ভিত্তিক ফিল্টার অথবা সার্চ করে ইনস্টিটিউটের যেকোনো অ্যালবাম বা ভিডিও উপভোগ করুন',
    allMedia: 'সকল মিডিয়া',
    photosTab: 'ছবি',
    videosTab: 'ভিডিও',
    searchPlaceholder: 'শিরোনাম বা বিষয় খুঁজুন...',
    totalFound: 'টি মিডিয়া আইটেম পাওয়া গেছে',
    page: 'পৃষ্ঠা',
    of: '/',
    showing: 'দেখাচ্ছে',
    noMediaTitle: 'কোনো ছবি বা ভিডিও পাওয়া যায়নি',
    noMediaDesc: 'আপনার দেওয়া ফিল্টার বা সার্চ শব্দের সাথে মিল রেখে কোনো মিডিয়া পাওয়া যায়নি। দয়া করে অন্য ক্যাটাগরি নির্বাচন করুন।',
    resetFilter: 'সকল মিডিয়া ফিল্টার রিসেট করুন',
    zoomIn: 'জুম করুন',
    prevPage: 'পূর্ববর্তী পাতা',
    nextPage: 'পরবর্তী পাতা',
    photoIndex: 'ছবি',
    downloadOriginal: 'মূল রেজ্যুলেশনে ডাউনলোড করুন',
    copyPhotoLink: 'ছবির লিংক কপি করুন',
    copyVideoLink: 'ভিডিও লিংক কপি করুন',
    videoIndex: 'ভিডিও',
    openExternal: 'বাহ্যিক উইন্ডোতে খুলুন',
    prev: 'পূর্ববর্তী',
    next: 'পরবর্তী',
    guidelinesTitle: 'মিডিয়া ও আর্কাইভ সংক্রান্ত প্রাতিষ্ঠানিক নির্দেশিকা'
  },
  ar: {
    badge: 'أرشيف معهد السنّة الإعلامي والمرئي',
    defaultTitle: 'معرض الصور والفيديوهات الوثائقية',
    defaultSubtitle: 'التوثيق المرئي للحرم الجامعي والندوات العلمية وحفلات التخرج والأنشطة الأكاديمية لمعهد السنّة.',
    photosCount: 'صورة',
    videosCount: 'وثائقي',
    watchHeroVideo: 'مشاهدة الفيديو التعريفي',
    row1Tag: 'الصف الأول • معرض الصور الفوتوغرافية',
    row1Title: '📸 معرض الصور التوثيقية',
    row1Subtitle: 'لحظات تاريخية من الحياة الجامعية، المؤتمرات العلمية، وحفلات التخرج.',
    viewAllPhotos: 'عرض جميع الصور',
    viewFullPhoto: 'عرض الصورة كاملة',
    details: 'التفاصيل',
    row2Tag: 'الصف الثاني • الفيديوهات والأفلام الوثائقية',
    row2Title: '🎥 معرض المرئيات والوثائقيات',
    row2Subtitle: 'المؤتمرات الدولية، دورات الأذان، والعروض التعريفية الخاصة بالمعهد.',
    viewAllVideos: 'عرض جميع الفيديوهات',
    playVideo: 'تشغيل الفيديو',
    explorerBadge: 'مستكشف الخزينة الإعلامية',
    explorerTitle: 'المجموعة الكاملة للصور والفيديوهات',
    explorerSubtitle: 'تصفح حسب الموضوع أو ابحث لاستعراض ألبومات ووثائقيات المعهد.',
    allMedia: 'جميع الوسائط',
    photosTab: 'الصور',
    videosTab: 'الفيديوهات',
    searchPlaceholder: 'ابحث بالعنوان أو الموضوع...',
    totalFound: 'عنصر وسائط متاح',
    page: 'صفحة',
    of: 'من',
    showing: 'عرض',
    noMediaTitle: 'لم يتم العثور على صور أو فيديوهات',
    noMediaDesc: 'لا توجد وسائط تطابق معايير البحث أو التصفية الحالية. يرجى اختيار تصنيف آخر.',
    resetFilter: 'إعادة ضبط التصفية',
    zoomIn: 'تكبير',
    prevPage: 'الصفحة السابقة',
    nextPage: 'الصفحة التالية',
    photoIndex: 'صورة',
    downloadOriginal: 'تحميل بالدقة الأصلية',
    copyPhotoLink: 'نسخ رابط الصورة',
    copyVideoLink: 'نسخ رابط الفيديو',
    videoIndex: 'فيديو',
    openExternal: 'فتح في نافذة جديدة',
    prev: 'السابق',
    next: 'التالي',
    guidelinesTitle: 'الإرشادات التنظيمية للأرشيف الإعلامي'
  }
};

export function GalleryPageContent({ locale }: { locale: 'en' | 'bn' | 'ar' }) {
  const t = galleryDict[locale] || galleryDict.en;
  const [data, setData] = useState<GalleryPageData | null>(null);
  const [loading, setLoading] = useState(true);

  // Active media explorer view: 'all' | 'photos' | 'videos'
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination state for Explorer
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 9;

  // Modals state
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhotoItem | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  const [selectedVideo, setSelectedVideo] = useState<GalleryVideoItem | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(0);

  const [copiedToast, setCopiedToast] = useState(false);

  // Ref to scroll to explorer section when "আরও দেখুন" is clicked
  const explorerRef = useRef<HTMLDivElement>(null);

  // Firestore live subscription
  useEffect(() => {
    const docRef = doc(db, 'site_pages', 'gallery');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as GalleryPageData);
      }
      setLoading(false);
    }, (err) => {
      console.error('Error fetching gallery page content:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const pageTitle = data?.title || t.defaultTitle;
  const pageSubtitle = data?.subtitle || t.defaultSubtitle;
  const bannerImageUrl = data?.bannerImageUrl || '';
  const heroVideoUrl = data?.heroVideoUrl || '';
  const heroMediaType = data?.heroMediaType || 'image';

  const photosSectionTitle = data?.photosSectionTitle || t.row1Title;
  const photosSectionSubtitle = data?.photosSectionSubtitle || t.row1Subtitle;
  const photosList: GalleryPhotoItem[] = (data?.photos && data.photos.length > 0) ? data.photos : DEFAULT_PHOTOS;

  const videosSectionTitle = data?.videosSectionTitle || t.row2Title;
  const videosSectionSubtitle = data?.videosSectionSubtitle || t.row2Subtitle;
  const videosList: GalleryVideoItem[] = (data?.videos && data.videos.length > 0) ? data.videos : DEFAULT_VIDEOS;

  // Handle opening Photo Lightbox
  const handleOpenPhoto = (photo: GalleryPhotoItem) => {
    const idx = photosList.findIndex(p => p.id === photo.id || p.image === photo.image);
    setSelectedPhotoIndex(idx >= 0 ? idx : 0);
    setSelectedPhoto(photo);
  };

  const handleNextPhoto = () => {
    const nextIdx = (selectedPhotoIndex + 1) % photosList.length;
    setSelectedPhotoIndex(nextIdx);
    setSelectedPhoto(photosList[nextIdx]);
  };

  const handlePrevPhoto = () => {
    const prevIdx = (selectedPhotoIndex - 1 + photosList.length) % photosList.length;
    setSelectedPhotoIndex(prevIdx);
    setSelectedPhoto(photosList[prevIdx]);
  };

  // Handle opening Video Lightbox
  const handleOpenVideo = (video: GalleryVideoItem) => {
    const idx = videosList.findIndex(v => v.id === video.id || v.videoUrl === video.videoUrl);
    setSelectedVideoIndex(idx >= 0 ? idx : 0);
    setSelectedVideo(video);
  };

  const handleNextVideo = () => {
    const nextIdx = (selectedVideoIndex + 1) % videosList.length;
    setSelectedVideoIndex(nextIdx);
    setSelectedVideo(videosList[nextIdx]);
  };

  const handlePrevVideo = () => {
    const prevIdx = (selectedVideoIndex - 1 + videosList.length) % videosList.length;
    setSelectedVideoIndex(prevIdx);
    setSelectedVideo(videosList[prevIdx]);
  };

  // Handle "আরও দেখুন" click
  const handleViewAllClick = (type: 'photos' | 'videos') => {
    setMediaTypeFilter(type);
    setSelectedCategory('all');
    setCurrentPage(1);
    explorerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Filter combined or specific items for the Explorer
  interface UnifiedMediaItem {
    type: 'photo' | 'video';
    item: GalleryPhotoItem | GalleryVideoItem;
    id: string | number;
    title: string;
    category: string;
    date?: string;
    description?: string;
  }

  const unifiedItems: UnifiedMediaItem[] = useMemo(() => {
    let combined: UnifiedMediaItem[] = [];

    if (mediaTypeFilter === 'all' || mediaTypeFilter === 'photos') {
      const pItems: UnifiedMediaItem[] = photosList.map((p, i) => ({
        type: 'photo',
        item: p,
        id: p.id || `p_${i}`,
        title: p.title,
        category: p.category,
        date: p.date,
        description: p.description
      }));
      combined = [...combined, ...pItems];
    }

    if (mediaTypeFilter === 'all' || mediaTypeFilter === 'videos') {
      const vItems: UnifiedMediaItem[] = videosList.map((v, i) => ({
        type: 'video',
        item: v,
        id: v.id || `v_${i}`,
        title: v.title,
        category: v.category,
        date: v.date,
        description: v.description
      }));
      combined = [...combined, ...vItems];
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      combined = combined.filter(m => m.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      combined = combined.filter(m => 
        m.title.toLowerCase().includes(query) ||
        (m.description && m.description.toLowerCase().includes(query)) ||
        (m.date && m.date.toLowerCase().includes(query))
      );
    }

    return combined;
  }, [mediaTypeFilter, selectedCategory, searchQuery, photosList, videosList]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [mediaTypeFilter, selectedCategory, searchQuery]);

  // Paginated Explorer items
  const totalPages = Math.ceil(unifiedItems.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return unifiedItems.slice(start, start + itemsPerPage);
  }, [unifiedItems, currentPage, itemsPerPage]);

  const handleCopyLink = (url: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const getCategoryName = (catId: string) => {
    const localized = GALLERY_CATEGORIES[catId];
    if (localized) {
      return localized[locale] || localized.en;
    }
    return catId;
  };

  return (
    <div className="w-full">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#042f24] text-white py-16 md:py-24 overflow-hidden border-b border-emerald-900/50 shadow-md">
        {/* Background Image / Texture */}
        {Boolean(bannerImageUrl && bannerImageUrl.trim() !== '') && heroMediaType === 'image' ? (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={bannerImageUrl.trim()} 
              alt={pageTitle}
              className="w-full h-full object-cover scale-105 filter blur-[1px]" 
            />
          </div>
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#042f24] via-[#064e3b]/80 to-transparent"></div>
        <div className="absolute inset-0 opacity-10 bg-arabesque-pattern pointer-events-none"></div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-900/80 border border-amber-400/40 rounded-full text-amber-300 text-xs font-bold tracking-wide shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>{t.badge}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-serif tracking-tight text-white leading-tight">
              {pageTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base md:text-lg text-emerald-100/90 leading-relaxed font-sans font-normal">
              {pageSubtitle}
            </p>

            {/* Quick Metrics & Call to Actions */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
              <div className="px-3.5 py-2 bg-emerald-950/70 border border-emerald-700/60 rounded-xl text-emerald-200 flex items-center gap-2 backdrop-blur-xs">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">{photosList.length}+</span>
                <span>{t.photosCount}</span>
              </div>

              <div className="px-3.5 py-2 bg-emerald-950/70 border border-emerald-700/60 rounded-xl text-emerald-200 flex items-center gap-2 backdrop-blur-xs">
                <Video className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white">{videosList.length}+</span>
                <span>{t.videosCount}</span>
              </div>

              {heroVideoUrl && (
                <button
                  type="button"
                  onClick={() => handleOpenVideo({
                    title: pageTitle,
                    category: 'campus',
                    videoUrl: heroVideoUrl,
                    thumbnail: bannerImageUrl,
                    description: pageSubtitle
                  })}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <Play className="w-3.5 h-3.5 fill-emerald-950" />
                  <span>{t.watchHeroVideo}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 2. CONTINUOUS MARQUEE SLIDERS (ROW 1: PHOTOS, ROW 2: VIDEOS) */}
      <section className="py-12 md:py-16 bg-slate-50 border-b border-slate-200/80 space-y-12 overflow-hidden">
        
        {/* ROW 1: PHOTOS SECTION WITH RIGHT-TO-LEFT SMOOTH SCROLL */}
        <div className="space-y-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>{t.row1Tag}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-serif">
                {photosSectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {photosSectionSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleViewAllClick('photos')}
              className="px-4 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer group"
            >
              <span>{t.viewAllPhotos} ({photosList.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Continuous Right-to-Left Photo Marquee */}
          {photosList.length === 0 ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {locale === 'bn' ? 'গ্যালারিতে এখনো কোনো ছবি যুক্ত করা হয়নি।' : 'No photos added to gallery yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden py-3 group">
              {/* Edge Shadow Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

              {/* Marquee Track (Duplicated for seamless continuous infinite right-to-left sliding) */}
              <div className="animate-marquee-rtl flex items-center gap-5">
                {[...photosList, ...photosList].map((photo, idx) => (
                  <div
                    key={`photo_track_${idx}`}
                    onClick={() => handleOpenPhoto(photo)}
                    className="w-[290px] sm:w-[340px] shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group/card"
                  >
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-900">
                      <img 
                        src={photo.image || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80"} 
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover/card:scale-108 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover/card:opacity-90 transition-opacity"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-xs border border-white/20 text-white rounded-full text-[10px] font-bold">
                        {getCategoryName(photo.category)}
                      </div>

                      {/* View Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-all duration-300 scale-90 group-hover/card:scale-100">
                        <div className="px-3.5 py-1.5 bg-emerald-700/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                          <Eye className="w-4 h-4 text-amber-300" />
                          <span>{t.viewFullPhoto}</span>
                        </div>
                      </div>

                      {/* Location Badge */}
                      {photo.location && (
                        <div className="absolute bottom-3 left-3 text-[10px] text-emerald-200 flex items-center gap-1 font-medium truncate max-w-[90%]">
                          <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="truncate">{photo.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover/card:text-[#064e3b] transition-colors line-clamp-2">
                        {photo.title}
                      </h3>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-amber-600" />
                          {photo.date || ''}
                        </span>
                        <span className="text-emerald-700 font-bold group-hover/card:underline flex items-center gap-0.5">
                          {t.details} <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ROW 2: VIDEOS SECTION WITH RIGHT-TO-LEFT SMOOTH SCROLL */}
        <div className="space-y-4 pt-4 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
                <Video className="w-4 h-4 text-rose-600" />
                <span>{t.row2Tag}</span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 font-serif">
                {videosSectionTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                {videosSectionSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleViewAllClick('videos')}
              className="px-4 py-2.5 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer group"
            >
              <span>{t.viewAllVideos} ({videosList.length})</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Continuous Right-to-Left Video Marquee */}
          {videosList.length === 0 ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <Video className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {locale === 'bn' ? 'ভিডিও আর্কাইভে এখনো কোনো ভিডিও আপলোড করা হয়নি।' : 'No video documentaries published yet.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden py-3 group">
              {/* Edge Shadow Overlays */}
              <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none"></div>

              {/* Marquee Track (Duplicated for seamless continuous infinite right-to-left sliding) */}
              <div className="animate-marquee-rtl-slow flex items-center gap-5">
                {[...videosList, ...videosList].map((video, idx) => {
                  const parsed = parseVideoUrl(video.videoUrl, video.thumbnail);
                  const thumb = video.thumbnail || parsed.thumbnailUrl;

                  return (
                    <div
                      key={`video_track_${idx}`}
                      onClick={() => handleOpenVideo(video)}
                      className="w-[290px] sm:w-[340px] shrink-0 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-rose-300 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col group/vcard"
                    >
                      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
                        <img 
                          src={thumb || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80"} 
                          alt={video.title}
                          className="w-full h-full object-cover opacity-85 group-hover/vcard:scale-108 group-hover/vcard:opacity-95 transition-all duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                        
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-rose-600/90 group-hover/vcard:bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover/vcard:scale-110 transition-transform duration-300 backdrop-blur-2xs border border-white/30">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Duration Badge */}
                        {video.duration && (
                          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 border border-white/10">
                            <Clock className="w-2.5 h-2.5 text-rose-400" />
                            <span>{video.duration}</span>
                          </div>
                        )}

                        {/* Category Badge */}
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/70 backdrop-blur-xs border border-white/20 text-rose-200 rounded-full text-[10px] font-bold">
                          {getCategoryName(video.category)}
                        </div>
                      </div>

                      <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover/vcard:text-rose-700 transition-colors line-clamp-2">
                            {video.title}
                          </h3>
                          {video.speaker && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{video.speaker}</span>
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {video.date || ''}
                          </span>
                          <span className="text-rose-600 font-bold group-hover/vcard:underline flex items-center gap-0.5">
                            {t.playVideo} <Play className="w-2.5 h-2.5 fill-rose-600" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </section>

      {/* 3. FULL MEDIA EXPLORER WITH NUMBERED PAGINATION */}
      <section ref={explorerRef} className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header & Filter Controls */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 text-xs font-bold mb-2">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t.explorerBadge}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">
                  {t.explorerTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t.explorerSubtitle}
                </p>
              </div>

              {/* Media Type Tabs (All / Photos / Videos) */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('all')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    mediaTypeFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.allMedia} ({photosList.length + videosList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('photos')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mediaTypeFilter === 'photos'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>{t.photosTab} ({photosList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTypeFilter('videos')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    mediaTypeFilter === 'videos'
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{t.videosTab} ({videosList.length})</span>
                </button>
              </div>
            </div>

            {/* Sub-Filters: Search Bar & Category Tabs */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                {CATEGORIES_LIST.map((catId) => (
                  <button
                    key={catId}
                    type="button"
                    onClick={() => setSelectedCategory(catId)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === catId
                        ? 'bg-[#064e3b] text-amber-300 shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                    }`}
                  >
                    {getCategoryName(catId)}
                  </button>
                ))}
              </div>

              {/* Live Search Input */}
              <div className="relative w-full lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:bg-white transition-all text-slate-800"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              {unifiedItems.length} {t.totalFound}
              {unifiedItems.length > 0 && (
                <> ({t.page} <strong>{currentPage}</strong> {t.of} {totalPages})</>
              )}
            </span>

            {unifiedItems.length > 0 && (
              <span className="text-slate-400 text-[11px]">
                {t.showing} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, unifiedItems.length)}
              </span>
            )}
          </div>

          {/* Explorer Grid Items */}
          {unifiedItems.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200/80 space-y-3">
              <Film className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">{t.noMediaTitle}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t.noMediaDesc}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setMediaTypeFilter('all');
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                {t.resetFilter}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedItems.map((mItem) => {
                if (mItem.type === 'photo') {
                  const photo = mItem.item as GalleryPhotoItem;
                  return (
                    <div
                      key={`photo_grid_${mItem.id}`}
                      onClick={() => handleOpenPhoto(photo)}
                      className="group bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xl hover:border-emerald-400 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-900">
                        <img 
                          src={photo.image || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80"} 
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity"></div>
                        
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-emerald-950/80 backdrop-blur-xs border border-emerald-400/40 text-amber-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{getCategoryName(photo.category)}</span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="px-4 py-2 bg-emerald-800/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                            <Eye className="w-4 h-4 text-amber-300" />
                            <span>{t.viewFullPhoto}</span>
                          </div>
                        </div>

                        {photo.location && (
                          <div className="absolute bottom-3 left-3 text-[10px] text-emerald-100 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{photo.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#064e3b] transition-colors line-clamp-2">
                            {photo.title}
                          </h3>
                          {photo.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {photo.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            {photo.date || ''}
                          </span>
                          <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                            {t.zoomIn} <Maximize2 className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  const video = mItem.item as GalleryVideoItem;
                  const parsed = parseVideoUrl(video.videoUrl, video.thumbnail);
                  const thumb = video.thumbnail || parsed.thumbnailUrl;

                  return (
                    <div
                      key={`video_grid_${mItem.id}`}
                      onClick={() => handleOpenVideo(video)}
                      className="group bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xl hover:border-rose-400 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-950">
                        <img 
                          src={thumb || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80"} 
                          alt={video.title}
                          className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-95 transition-all duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
                        
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-rose-950/80 backdrop-blur-xs border border-rose-400/40 text-rose-200 rounded-full text-[10px] font-bold flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          <span>{getCategoryName(video.category)}</span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform duration-300 border-2 border-white/40">
                            <Play className="w-6 h-6 fill-white ml-0.5" />
                          </div>
                        </div>

                        {video.duration && (
                          <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white rounded text-[10px] font-mono font-bold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 text-rose-400" />
                            <span>{video.duration}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-rose-700 transition-colors line-clamp-2">
                            {video.title}
                          </h3>
                          {video.speaker && (
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{video.speaker}</span>
                            </p>
                          )}
                          {video.description && (
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                              {video.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {video.date || ''}
                          </span>
                          <span className="text-rose-600 font-bold group-hover:underline flex items-center gap-0.5">
                            {t.playVideo} <Play className="w-3 h-3 fill-rose-600" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          )}

          {/* NUMBERED PAGINATION */}
          {totalPages > 1 && (
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.prevPage}</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={`page_btn_${pageNum}`}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#064e3b] text-amber-300 shadow-sm scale-105'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>{t.nextPage}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 4. OPTIONAL RICH TEXT CONTENT / INSTITUTIONAL MEDIA NOTICE */}
      {data?.content && data.content.trim() && (
        <section className="py-12 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-serif flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t.guidelinesTitle}</span>
            </h3>
            <div 
              className="prose prose-sm prose-emerald max-w-none text-slate-700 text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatContentHtml(data.content) }}
            />
          </div>
        </section>
      )}

      {/* PHOTO LIGHTBOX MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Top Bar */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-emerald-800/80 text-amber-300 rounded-full font-bold text-[10px]">
                  {getCategoryName(selectedPhoto.category)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {t.photoIndex} {selectedPhotoIndex + 1} / {photosList.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedPhoto.image}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs flex items-center gap-1"
                  title={t.downloadOriginal}
                >
                  <Download className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedPhoto.image)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs"
                  title={t.copyPhotoLink}
                >
                  {copiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 bg-slate-800 hover:bg-red-900/80 text-slate-300 hover:text-white rounded-xl transition-colors ml-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Image Viewer Area with Navigation Arrows */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[280px] sm:min-h-[420px] max-h-[60vh] overflow-hidden group/modal">
              <img 
                src={selectedPhoto.image || "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1000&q=80"} 
                alt={selectedPhoto.title}
                className="max-h-full max-w-full object-contain" 
              />

              {photosList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevPhoto}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all border border-white/20 shadow-lg cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleNextPhoto}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all border border-white/20 shadow-lg cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption Info */}
            <div className="p-5 bg-slate-950 text-white space-y-2 border-t border-slate-800 overflow-y-auto">
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                {selectedPhoto.location && (
                  <span className="flex items-center gap-1 text-emerald-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {selectedPhoto.location}
                  </span>
                )}
                {selectedPhoto.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedPhoto.date}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold font-serif text-amber-300">
                {selectedPhoto.title}
              </h2>

              {selectedPhoto.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPhoto.description}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* VIDEO PLAYER LIGHTBOX MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Top Bar */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 bg-rose-900/80 text-rose-200 rounded-full font-bold text-[10px] flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  {getCategoryName(selectedVideo.category)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {t.videoIndex} {selectedVideoIndex + 1} / {videosList.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyLink(selectedVideo.videoUrl)}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs"
                  title={t.copyVideoLink}
                >
                  {copiedToast ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                </button>

                <a
                  href={selectedVideo.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs flex items-center gap-1"
                  title={t.openExternal}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 bg-slate-800 hover:bg-red-900/80 text-slate-300 hover:text-white rounded-xl transition-colors ml-2 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Player Area */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              {(() => {
                const parsed = parseVideoUrl(selectedVideo.videoUrl, selectedVideo.thumbnail);
                if (parsed.type === 'direct' && parsed.directUrl) {
                  return (
                    <video 
                      src={parsed.directUrl} 
                      controls 
                      autoPlay 
                      className="w-full h-full object-contain"
                    />
                  );
                }
                if (parsed.embedUrl) {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full border-0"
                    />
                  );
                }
                return (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 h-full">
                    <Video className="w-12 h-12 text-slate-600 mb-2" />
                    <p className="text-sm font-semibold">Video preview unavailable</p>
                  </div>
                );
              })()}
            </div>

            {/* Video Details & Navigation */}
            <div className="p-5 bg-slate-950 text-white space-y-3 border-t border-slate-800 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {selectedVideo.speaker && (
                    <span className="flex items-center gap-1 text-rose-300 font-bold">
                      <User className="w-3.5 h-3.5" />
                      {selectedVideo.speaker}
                    </span>
                  )}
                  {selectedVideo.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedVideo.date}
                    </span>
                  )}
                  {selectedVideo.duration && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedVideo.duration}
                    </span>
                  )}
                </div>

                {videosList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrevVideo}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>{t.prev}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNextVideo}
                      className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t.next}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold font-serif text-white">
                {selectedVideo.title}
              </h2>

              {selectedVideo.description && (
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedVideo.description}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
