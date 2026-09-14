'use client';

import Link from 'next/link';
import { Locale } from '@/lib/dictionary';
import { 
  GraduationCap, ArrowRight, CheckCircle2, ShieldCheck, 
  FileText, Calendar, Sparkles, Award 
} from 'lucide-react';

interface HomeAdmissionCtaProps {
  locale: Locale;
}

export function HomeAdmissionCta({ locale }: HomeAdmissionCtaProps) {
  const dict = {
    en: {
      badge: 'Academic Admissions & Enrollment',
      title: 'Begin Your Journey in Classical Islamic Knowledge & Research',
      subtitle: 'Applications are currently open for upcoming academic sessions. Join a community of dedicated scholars, researchers, and learners.',
      applyBtn: 'Apply for Admission Online',
      guidelinesBtn: 'Admission Requirements & Prospectus',
      features: [
        'Rigorous Shariah & Classical Hadith Curriculum',
        'Direct Mentorship from Distinguished Professors',
        'Central Research Library & Digital Archive',
        'Financial Aid & Merit Zakat Sponsorships Available'
      ]
    },
    bn: {
      badge: 'ভর্তি ও শিক্ষার্থী নিবন্ধন',
      title: 'বিশুদ্ধ ইসলামী জ্ঞান ও গবেষণার অনন্য অঙ্গনে আপনাকে স্বাগতম',
      subtitle: 'আসন্ন শিক্ষাবর্ষের বিভিন্ন কোর্সে ভর্তি আবেদন চলছে। দ্বীনি ইলম ও শাস্ত্রীয় গবেষণার মাধ্যমে নিজেকে গড়ে তুলতে আজই আবেদন করুন।',
      applyBtn: 'অনলাইনে ভর্তি আবেদন করুন',
      guidelinesBtn: 'ভর্তির নিয়মাবলী ও প্রসপেক্টাস',
      features: [
        'কুরআন-সুন্নাহ ভিত্তিক প্রামাণ্য শাস্ত্রীয় পাঠ্যক্রম',
        'বিশিষ্ট স্কলার ও প্রফেসরদের নিবিড় তত্ত্বাবধান',
        '৬০,০০০+ কিতাবের সমৃদ্ধ সেন্ট্রাল লাইব্রেরি',
        'মেধাবী শিক্ষার্থীদের জন্য শিক্ষাবৃত্তি ও যাকাত অনুদান'
      ]
    },
    ar: {
      badge: 'القبول والتسجيل الأكاديمي',
      title: 'انضم إلى مسيرة العلم الشرعي الرصين والبحث العلمي المؤصل',
      subtitle: 'باب القبول والتسجيل مفتوح حالياً للبرامج الأكاديمية القادمة. بادر بالتقديم للانضمام إلى صرح علمي متميز.',
      applyBtn: 'تقديم طلب القبول إلكترونياً',
      guidelinesBtn: 'شروط القبول ودليل الطالب',
      features: [
        'مناهج شرعية مؤصلة قائمة على الكتاب والسنة',
        'إشراف مباشر من نخبة العلماء والباحثين',
        'مكتبة مركزية تضم أكثر من ٦٠،٠٠٠ مجلد أصيل',
        'منح دراسية ورعاية للمتفوقين وطلاب العلم'
      ]
    }
  };

  const t = dict[locale] || dict.en;

  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-t border-slate-200/80 font-sans" id="home_admission_cta">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#064e3b] via-[#064e3b] to-emerald-950 text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-lg border border-emerald-800/60">
          
          {/* Background arabesque texture */}
          <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\" xmlns=\\"http://www.w3.org/2000/svg\\"%3E%3Cg fill=\\"%23ffffff\\" fill-opacity=\\"1\\" fill-rule=\\"evenodd\\"%3E%3Ccircle cx=\\"3\\" cy=\\"3\\" r=\\"1.5\\"/%3E%3Ccircle cx=\\"15\\" cy=\\"15\\" r=\\"1.5\\"/%3E%3C/g%3E%3C/svg%3E")'
            }}
          />

          <div className="relative z-10 max-w-3xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-serif tracking-tight leading-tight">
              {t.title}
            </h2>

            <p className="mt-4 text-sm sm:text-base text-emerald-100/90 leading-relaxed max-w-2xl">
              {t.subtitle}
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
              {t.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-emerald-100/95 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-10">
              <Link
                href={`/${locale}/admission`}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center gap-2 group"
              >
                <span>{t.applyBtn}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={`/${locale}/admission`}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-emerald-300" />
                <span>{t.guidelinesBtn}</span>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
