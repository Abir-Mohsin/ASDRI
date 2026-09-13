'use client';

import Link from 'next/link';
import { Locale } from '@/lib/dictionary';
import { 
  HeartHandshake, BookOpen, 
  ArrowRight, ShieldCheck, Calculator, Sparkles, CheckCircle2 
} from 'lucide-react';

export function HomeServicesBento({ locale }: { locale: Locale }) {
  const isBn = locale === 'bn';
  const isAr = locale === 'ar';

  return (
    <section className="py-16 sm:py-20 bg-slate-100 border-t border-b border-slate-200/90 font-sans" id="home_services_portals">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-300/80 text-emerald-900 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isBn ? 'ইনস্টিটিউটের বিশেষায়িত দ্বীনি সেবা ও পোর্টাল' : isAr ? 'الخدمات الشرعية والمنصات التخصصية' : 'Specialized Institutional Services & Portals'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#064e3b] font-serif tracking-tight">
            {isBn ? 'দারুল ইফতা ও যাকাত-অনুদান প্ল্যাটফর্ম' : isAr ? 'دار الإفتاء وبوابة الزكاة والتبرعات' : 'Darul Ifta & Zakat-Donation Portals'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
            {isBn 
              ? 'উম্মাহর জন্য বিশুদ্ধ ইসলামী জ্ঞান, যাচাইকৃত ফাতওয়া এবং নির্ভরযোগ্য আর্থিক স্বচ্ছতায় যাকাত ও সাদাকাহ প্রদানের আধুনিক সমন্বিত ব্যবস্থা।'
              : isAr
              ? 'منظومة إلكترونية متكاملة للإفتاء الشرعي المعتمد وحساب وإخراج أموال الزكاة والصدقات.'
              : 'Empowering the community with verified Islamic legal rulings and a transparent digital platform for fulfilling Zakat and Sadaqah.'}
          </p>
        </div>

        {/* 2 Big Bento Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Bento Card 1: Fatwa & Ifta Portal */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform"></div>
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#064e3b] flex items-center justify-center shadow-xs border border-emerald-200/70">
                  <BookOpen className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'সত্যায়িত ফাতওয়া বোর্ড' : 'Verified Board'}</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#064e3b] font-serif mb-3">
                {isBn ? 'ফাতওয়া ও দারুল ইফতা পোর্টাল' : isAr ? 'بوابة الفتاوى ودار الإفتاء' : 'Darul Ifta & Fatwa Portal'}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                {isBn 
                  ? 'দৈনন্দিন ইবাদত, ব্যবসা-বাণিজ্য, অর্থনীতি ও আধুনিক জীবনযাত্রার বিভিন্ন বিষয়ে গ্রহণযোগ্য ও যাচাইকৃত ফাতওয়ার বিশাল সংগ্রহশালা। পাশাপাশি সরাসরি প্রশ্ন প্রেরণ ও লিখিত উত্তর সংগ্রহের সার্বক্ষণিক সুবিধা।'
                  : 'A certified archive of legal rulings on contemporary economics, transactions, and worship, with a direct facility to submit queries to certified Muftis.'}
              </p>

              {/* Highlights */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isBn ? 'বিষয়ভিত্তিক ক্যাটালগ ও সার্চ সুবিধা' : 'Topic-wise catalog with instant search'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isBn ? 'কুরআন, সুন্নাহ ও নির্ভরযোগ্য ফিকহ গ্রন্থের হাওয়ালা' : 'Authentic citations from Classical Fiqh & Sunnah'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isBn ? 'সরাসরি মুফতি পরিষদের নিকট প্রশ্ন পেশ' : 'Direct question submission to Mufti Council'}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/fatwa`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#064e3b] hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>{isBn ? 'ফাতওয়া পোর্টাল ব্রাউজ করুন' : 'Browse Fatwa Archive'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

          {/* Bento Card 2: Zakat & Donation Fund */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center shadow-xs border border-amber-200/70">
                  <HeartHandshake className="w-7 h-7" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  <Calculator className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isBn ? 'যাকাত ক্যালকুলেটর যুক্ত' : 'Zakat Calculator'}</span>
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-[#064e3b] font-serif mb-3">
                {isBn ? 'যাকাত ও অনুদান ফান্ড' : isAr ? 'صندوق الزكاة والتبرعات الخيرية' : 'Zakat & Donation Fund'}
              </h3>
              
              <p className="text-sm text-slate-600 leading-relaxed mb-6 font-normal">
                {isBn 
                  ? 'স্বর্ণ, রূপা, নগদ অর্থ ও শেয়ারের সঠিক নিসাব অনুযায়ী নিমিষেই নিজের যাকাত গণনা করুন এবং অসচ্ছল শিক্ষার্থী ও গবেষণা বৃত্তি ফান্ডে অনুদান দিয়ে তাৎক্ষণিক ডিজিটাল মানি রিসিট গ্রহণ করুন।'
                  : 'Calculate your Zakat accurately according to Silver Nisab and donate securely to student fellowships, research, and community relief.'}
              </p>

              {/* Highlights */}
              <div className="space-y-2.5 mb-8">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isBn ? 'রিয়েল-টাইম নির্ভুল যাকাত ক্যালকুলেটর' : 'Real-time accurate Zakat calculator'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isBn ? 'সুনির্দিষ্ট দ্বীনি ও জনকল্যাণমূলক খাত' : 'Distinct educational and humanitarian funds'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isBn ? 'অনলাইন ডিজিটাল মানি রিসিট ও প্রত্যয়ন' : 'Digital Money Receipt & verifiable voucher'}</span>
                </div>
              </div>
            </div>

            <Link
              href={`/${locale}/donate`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>{isBn ? 'যাকাত গণনা ও অনুদান প্রদান' : 'Calculate Zakat & Donate'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
}
