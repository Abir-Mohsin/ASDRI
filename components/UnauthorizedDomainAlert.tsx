'use client';

import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, Globe } from 'lucide-react';

interface UnauthorizedDomainAlertProps {
  locale?: string;
  onDismiss?: () => void;
}

export function UnauthorizedDomainAlert({ locale = 'bn', onDismiss }: UnauthorizedDomainAlertProps) {
  const [copied, setCopied] = useState(false);
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseConsoleUrl = 'https://console.firebase.google.com/project/asdri-fd3ec/authentication/settings';

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && currentHost) {
      navigator.clipboard.writeText(currentHost);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const isBn = locale === 'bn';
  const isAr = locale === 'ar';

  return (
    <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-4 sm:p-5 text-slate-800 shadow-sm transition-all animate-fadeIn mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-amber-950 font-serif">
            {isBn 
              ? 'Firebase ডোমেইন অনুমোদন প্রয়োজন (Domain Authorization Needed)' 
              : isAr 
              ? 'مطلوب ترخيص النطاق في Firebase' 
              : 'Firebase Domain Authorization Required'}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {isBn 
              ? 'Firebase সিকিউরিটির নিয়মানুযায়ী Google Sign-in সফল হতে এই প্রিভিউ ডোমেইনটি Firebase Console-এ একবার যুক্ত করতে হবে:' 
              : isAr 
              ? 'تتطلب أمان Firebase إضافة هذا النطاق إلى قائمة النطاقات المصرح بها لتسجيل الدخول بجوجل:' 
              : 'Firebase security requires this preview domain to be registered in your Firebase Console for Google Sign-in:'}
          </p>

          {/* Domain box with 1-click copy */}
          <div className="mt-3 flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white/90 border border-amber-200 p-2 rounded-lg">
            <div className="flex items-center gap-2 flex-1 min-w-0 px-2 py-1 bg-slate-50 rounded border border-slate-200">
              <Globe className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs sm:text-sm font-mono text-slate-800 truncate select-all">
                {currentHost || 'ais-dev-pabniirbyok7gmqpasoyly-86489289289.asia-southeast1.run.app'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-200" />
                  <span>{isBn ? 'কপি হয়েছে!' : isAr ? 'تم النسخ!' : 'Copied!'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ডোমেইন কপি করুন' : isAr ? 'نسخ النطاق' : 'Copy Domain'}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Step Guide */}
          <div className="mt-3.5 text-xs text-slate-600 bg-amber-100/40 rounded-lg p-3 border border-amber-200/60 space-y-1.5">
            <div className="font-semibold text-amber-950 flex items-center justify-between">
              <span>{isBn ? 'দ্রুত সমাধান করার ৩টি ধাপ:' : isAr ? 'خطوات سريعة للإصلاح:' : 'Quick 3-step fix:'}</span>
              <a
                href={firebaseConsoleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                <span>{isBn ? 'Firebase Console খুলুন' : isAr ? 'فتح إعدادات Firebase' : 'Open Firebase Console'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
              <li>
                {isBn 
                  ? 'উপরের "Firebase Console খুলুন" বাটনে ক্লিক করুন (অথবা Authentication → Settings-এ যান)' 
                  : isAr 
                  ? 'انقر على "فتح إعدادات Firebase" أعلاه' 
                  : 'Click "Open Firebase Console" above'}
              </li>
              <li>
                {isBn 
                  ? '"Authorized domains" সেকশনে "Add domain" বাটনে চাপুন' 
                  : isAr 
                  ? 'في قسم "Authorized domains"، انقر على "Add domain"' 
                  : 'In "Authorized domains", click "Add domain"'}
              </li>
              <li>
                {isBn 
                  ? 'কপি করা ডোমেইনটি পেস্ট করে "Save" চাপুন। এরপর গুগল দিয়ে সাইন-ইন সম্পন্ন হবে।' 
                  : isAr 
                  ? 'الصق النطاق المنسوخ واضغط على "حفظ".' 
                  : 'Paste the copied domain and click "Save". Then retry Google Sign-in.'}
              </li>
            </ol>
          </div>

          {onDismiss && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onDismiss}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                {isBn ? 'বন্ধ করুন' : isAr ? 'إغلاق' : 'Dismiss'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
