'use client';

import React, { useState } from 'react';
import { 
  X, Download, Maximize2, Minimize2, ExternalLink, 
  BookOpen, Sparkles, AlertCircle, Share2, Check, FileText
} from 'lucide-react';
import { LibraryBook, getBookEmbedUrl, getBookDownloadUrl } from '@/lib/libraryBooksData';

interface BookReaderModalProps {
  book: LibraryBook | null;
  onClose: () => void;
  locale?: 'en' | 'bn' | 'ar';
}

const readerDict = {
  en: {
    download: 'Download',
    copyLink: 'Copy Link',
    openOriginal: 'Open in Cloud',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    close: 'Close',
    noPreviewTitle: 'Direct Online Preview Unavailable',
    noPreviewDesc: 'Click the button below to view or download this book directly from the cloud drive.',
    openDrive: 'Open Drive / Cloud Folder',
    language: 'Language',
    size: 'Size',
    format: 'Format',
    viewerBadge: 'ASDRI Digital Library Cloud Viewer'
  },
  bn: {
    download: 'ডাউনলোড',
    copyLink: 'লিঙ্ক কপি করুন',
    openOriginal: 'মূল লিঙ্কে খুলুন',
    fullscreen: 'পূর্ণ পর্দায় পড়ুন',
    exitFullscreen: 'ছোট স্ক্রিনে দেখুন',
    close: 'বন্ধ করুন',
    noPreviewTitle: 'অনলাইন প্রিভিউ সরাসরি উপলব্ধ নেই',
    noPreviewDesc: 'এই কিতাবটি পড়তে বা ডাউনলোড করতে নিচের বোতামে ক্লিক করুন।',
    openDrive: 'ড্রাইভ / ক্লাউড ফোল্ডার খুলুন',
    language: 'ভাষা',
    size: 'সাইজ',
    format: 'ফরম্যাট',
    viewerBadge: 'আস-সুন্নাহ ডিজিটাল লাইব্রেরি ক্লাউড ভিউয়ার'
  },
  ar: {
    download: 'تحميل',
    copyLink: 'نسخ الرابط',
    openOriginal: 'فتح في السحابة',
    fullscreen: 'ملء الشاشة',
    exitFullscreen: 'تصغير الشاشة',
    close: 'إغلاق',
    noPreviewTitle: 'المعاينة المباشرة غير متوفرة',
    noPreviewDesc: 'اضغط على الزر أدناه لفتح الكتاب وقراءته أو تحميله من التخزين السحابي.',
    openDrive: 'فتح في التخزين السحابي',
    language: 'اللغة',
    size: 'الحجم',
    format: 'الصيغة',
    viewerBadge: 'قارئ المكتبة الرقمية لمعهد السنّة'
  }
};

export function BookReaderModal({ book, onClose, locale = 'en' }: BookReaderModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  const t = readerDict[locale] || readerDict.en;

  if (!book) return null;

  const embedUrl = book.previewUrl || getBookEmbedUrl(book.driveUrl);
  const downloadUrl = book.downloadUrl || getBookDownloadUrl(book.driveUrl);

  const handleShare = () => {
    const shareUrl = book.driveUrl || window.location.href;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md transition-all animate-fadeIn">
      
      <div 
        className={`bg-slate-900 text-white rounded-3xl border border-emerald-500/30 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none inset-0 fixed' 
            : 'w-full max-w-5xl h-[90vh] max-h-[850px]'
        }`}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] px-4 sm:px-6 py-3.5 border-b border-emerald-700/50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate font-serif">
                {book.title}
              </h3>
              <p className="text-[11px] text-emerald-200 truncate font-sans flex items-center gap-2">
                <span>{book.author}</span>
                {book.category && (
                  <>
                    <span className="w-1 h-1 bg-amber-400 rounded-full"></span>
                    <span className="text-amber-300 font-semibold">{book.category}</span>
                  </>
                )}
                {book.volume && (
                  <>
                    <span className="w-1 h-1 bg-emerald-400 rounded-full"></span>
                    <span>{book.volume}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Direct Download Button */}
            {downloadUrl && (
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                title={t.download}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.download}</span>
              </a>
            )}

            {/* Share Link Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs transition-colors flex items-center gap-1 cursor-pointer"
              title={t.copyLink}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Open in New Window if needed */}
            {book.driveUrl && (
              <a
                href={book.driveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs transition-colors cursor-pointer hidden md:flex items-center"
                title={t.openOriginal}
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Toggle Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-200 rounded-xl text-xs transition-colors cursor-pointer"
              title={isFullscreen ? t.exitFullscreen : t.fullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-red-950/40 hover:bg-red-700 border border-red-500/40 text-red-200 hover:text-white rounded-xl transition-colors cursor-pointer ml-1"
              title={t.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Reader Body / Iframe */}
        <div className="flex-1 w-full bg-slate-950 relative overflow-hidden flex flex-col">
          {embedUrl ? (
            <div className="w-full h-full relative">
              <iframe
                src={embedUrl}
                className="w-full h-full border-0 bg-slate-900"
                title={book.title}
                allow="autoplay; encrypted-media; fullscreen"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400" />
              <h4 className="text-lg font-bold text-white">
                {t.noPreviewTitle}
              </h4>
              <p className="text-xs text-slate-400 max-w-md">
                {t.noPreviewDesc}
              </p>
              {book.driveUrl && (
                <a
                  href={book.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{t.openDrive}</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Info Bar */}
        <div className="bg-slate-950 px-4 sm:px-6 py-2 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3">
            {book.language && (
              <span>{t.language}: <strong className="text-slate-200">{book.language}</strong></span>
            )}
            {book.fileSize && (
              <span>{t.size}: <strong className="text-slate-200">{book.fileSize}</strong></span>
            )}
            {book.format && (
              <span>{t.format}: <strong className="text-emerald-400">{book.format}</strong></span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>{t.viewerBadge}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
