'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sparkles, Megaphone, Clock } from 'lucide-react';
import { formatContentHtml } from '@/lib/contentFormatter';

export function DynamicHomeNotice({ locale = 'en' }: { locale?: 'en' | 'bn' | 'ar' }) {
  const [data, setData] = useState<{
    title?: string;
    subtitle?: string;
    content?: string;
    updatedAt?: string;
  } | null>(null);

  useEffect(() => {
    const docRef = doc(db, 'site_pages', 'home');
    const unsubscribe = onSnapshot(
      docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data() as any);
        }
      },
      (error) => {
        // Silently handle permission or connection fallback
        console.warn('DynamicHomeNotice listener notice:', error?.message || error);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!data?.content) return null;

  const formattedHtml = formatContentHtml(data.content);

  const defaultTitle = locale === 'bn' 
    ? 'ইনস্টিটিউশনাল নোটিশ ও আপডেট' 
    : locale === 'ar' 
    ? 'الإعلانات والمستجدات الأكاديمية' 
    : 'Institutional Notice & Updates';

  const updatedPrefix = locale === 'bn' ? 'আপডেট:' : locale === 'ar' ? 'آخر تحديث:' : 'Updated:';

  return (
    <section className="bg-slate-50 py-10 sm:py-14 border-b border-slate-200/70 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/80 max-w-5xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-black shrink-0 shadow-xs">
                <Megaphone className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#064e3b] font-serif leading-snug">
                  {data.title || defaultTitle}
                </h3>
                {data.subtitle && (
                  <p className="text-xs text-slate-500 mt-0.5">{data.subtitle}</p>
                )}
              </div>
            </div>

            {data.updatedAt && (
              <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {updatedPrefix} {new Date(data.updatedAt).toLocaleDateString(locale === 'bn' ? 'bn-BD' : locale === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            )}
          </div>

          <div 
            className="prose prose-emerald max-w-none text-slate-700 text-sm sm:text-base leading-relaxed sm:leading-loose space-y-4 font-sans"
            dangerouslySetInnerHTML={{ __html: formattedHtml }} 
          />
        </div>
      </div>
    </section>
  );
}
