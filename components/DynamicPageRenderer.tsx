'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sparkles, Clock } from 'lucide-react';
import { formatContentHtml } from '@/lib/contentFormatter';
import { RenderIcon } from '@/lib/iconMap';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

interface CardItem {
  id?: string;
  title: string;
  desc: string;
  icon?: string;
}

interface DynamicPageRendererProps {
  pageId: string;
  fallbackTitle: string;
  fallbackSubtitle: string;
  fallbackBannerUrl?: string;
  fallbackContent?: string;
  locale?: string;
  children?: React.ReactNode;
}

export function DynamicPageRenderer({
  pageId,
  fallbackTitle,
  fallbackSubtitle,
  fallbackBannerUrl = 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
  fallbackContent,
  locale = 'bn',
  children
}: DynamicPageRendererProps) {
  const [data, setData] = useState<{
    title?: string;
    subtitle?: string;
    content?: string;
    bannerImageUrl?: string;
    featureCardsTitle?: string;
    featureCards?: CardItem[];
    updatedAt?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'site_pages', pageId);
    
    // Subscribe to live changes
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data() as any);
        setImageError(false);
      }
      setLoading(false);
    }, (error) => {
      console.error(`Error fetching page [${pageId}]:`, error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pageId]);

  const title = pageId === 'about' ? 'About ASDRI' : (data?.title || fallbackTitle);
  const subtitle = pageId === 'about' ? 'A Trusted Center for Authentic Islamic Education & Research' : (data?.subtitle || fallbackSubtitle);
  const rawBannerUrl = (data?.bannerImageUrl && !imageError) ? data.bannerImageUrl : fallbackBannerUrl;
  const bannerImageUrl = getOptimizedImageUrl(rawBannerUrl, fallbackBannerUrl);
  const rawContent = data?.content || fallbackContent;
  const formattedHtml = rawContent ? formatContentHtml(rawContent) : '';

  const hasFeatureCards = data?.featureCards && data.featureCards.length > 0;

  return (
    <div>
      {/* Hero Header */}
      <div className="bg-[#064e3b] text-white py-16 md:py-20 relative overflow-hidden">
        {bannerImageUrl && (
          <div className="absolute inset-0 opacity-25">
            <img 
              src={bannerImageUrl} 
              alt="" 
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover" 
            />
          </div>
        )}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 font-serif text-amber-300">
            {title}
          </h1>
          <p className="text-base md:text-lg max-w-3xl mx-auto text-emerald-100/90 leading-relaxed font-sans">
            {subtitle}
          </p>
          {data?.updatedAt && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/60 border border-emerald-700/50 rounded-full text-[11px] text-emerald-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {pageId === 'about' || locale === 'en'
                  ? `Last Updated: ${new Date(data.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
                  : locale === 'ar'
                  ? `آخر تحديث: ${new Date(data.updatedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}`
                  : `সর্বশেষ আপডেট: ${new Date(data.updatedAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dynamic Page Content */}
      <main className="flex-1 bg-slate-50 py-12 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Dynamic Content Card if present (only when no custom child renderer is supplied) */}
          {!children && formattedHtml && (
            <div className="bg-white p-6 md:p-10 rounded-2xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-[#064e3b] uppercase tracking-wider">
                  {locale === 'bn' ? 'ইনস্টিটিউশনাল নোটিশ ও বিস্তারিত বিষয়বস্তু' : locale === 'ar' ? 'إعلانات وتوجيهات المعهد' : 'Institutional Notices & Guidelines'}
                </span>
              </div>
              <div 
                className="prose prose-emerald max-w-none text-slate-800 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: formattedHtml }}
              />
            </div>
          )}

          {/* Dynamic Feature Cards (if page has custom feature cards defined and no custom child renderer) */}
          {!children && hasFeatureCards && (
            <section className="space-y-6">
              {data?.featureCardsTitle && (
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#064e3b] font-serif">
                    {data.featureCardsTitle}
                  </h2>
                  <div className="w-20 h-1 bg-amber-500 mx-auto mt-3 rounded-full"></div>
                </div>
              )}
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(data?.featureCards?.length || 4, 4)} gap-6`}>
                {data?.featureCards?.map((card, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-all flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-[#064e3b]">
                      <RenderIcon name={card.icon} className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2 font-serif">{card.title}</h3>
                    <p className="text-sm text-slate-600 font-sans leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Children / Default Structured Sections */}
          {children}

        </div>
      </main>
    </div>
  );
}
