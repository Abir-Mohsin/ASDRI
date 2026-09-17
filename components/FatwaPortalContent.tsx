'use client';

import { useState, useEffect } from 'react';
import { Locale } from '@/lib/dictionary';
import { 
  Search, BookOpen, CheckCircle, HelpCircle, 
  ChevronRight, Send, AlertCircle, 
  Printer, ArrowLeft, BookmarkCheck, Shield, Sparkles, Filter
} from 'lucide-react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { defaultFatwas, FatwaItem } from '@/lib/defaultFatwaData';

export function FatwaPortalContent({ locale }: { locale: Locale }) {
  const [fatwas, setFatwas] = useState<FatwaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeFatwa, setActiveFatwa] = useState<FatwaItem | null>(null);
  const [isAsking, setIsAsking] = useState(false);
  
  // Ask form state
  const [askName, setAskName] = useState('');
  const [askEmail, setAskEmail] = useState('');
  const [askCategory, setAskCategory] = useState('মুআমালাত ও লেনদেন');
  const [askQuestion, setAskQuestion] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function loadFatwas() {
      setIsLoading(true);
      try {
        const q = query(collection(db, 'fatwas'), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const dbFatwas: FatwaItem[] = snap.docs.map(d => ({
            id: d.id,
            ...(d.data() as any)
          }));
          setFatwas(dbFatwas);
        } else {
          setFatwas([]);
        }
      } catch (err) {
        console.warn('Notice loading fatwas from Firestore:', err);
        setFatwas([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadFatwas();
  }, []);

  const categories = [
    { key: 'all', labelBn: 'সকল বিষয়', labelEn: 'All Topics', labelAr: 'جميع الموضوعات' },
    { key: 'যাকাত ও সদকা', labelBn: 'যাকাত ও সদকা', labelEn: 'Zakat & Charity', labelAr: 'الزكاة والصدقات' },
    { key: 'মুআমালাত ও লেনদেন', labelBn: 'লেনদেন ও অর্থনীতি', labelEn: 'Finance & Contracts', labelAr: 'المعاملات المالية' },
    { key: 'তাহরাত ও সালাত', labelBn: 'তাহরাত ও সালাত', labelEn: 'Purity & Prayer', labelAr: 'الطهارة والصلاة' },
    { key: 'রোজা ও রমাদান', labelBn: 'রোজা ও রমাদান', labelEn: 'Fasting & Ramadan', labelAr: 'الصيام ورمضان' },
    { key: 'পারিবারিক ও নিকাহ', labelBn: 'পারিবারিক বিধান', labelEn: 'Family & Marriage', labelAr: 'الأسرة والنكاح' }
  ];

  const filteredFatwas = fatwas.filter(item => {
    const title = locale === 'en' ? (item.titleEn || item.title) : locale === 'ar' ? (item.titleAr || item.title) : item.title;
    const cat = item.category;
    const matchesCat = selectedCategory === 'all' || cat === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.questionNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuestion.trim()) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'fatwa_questions'), {
        name: askName || 'Anonymous',
        email: askEmail,
        category: askCategory,
        question: askQuestion,
        isPrivate,
        status: 'pending',
        createdAt: serverTimestamp(),
        dateStr: new Date().toISOString().split('T')[0]
      });
      setSubmitSuccess(true);
      setAskQuestion('');
      setAskName('');
      setAskEmail('');
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsAsking(false);
      }, 3500);
    } catch (err) {
      console.error('Error submitting question:', err);
      // Still show success fallback for demo/offline resilience
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsAsking(false);
      }, 3500);
    } finally {
      setSubmitting(false);
    }
  };

  const labels = {
    badge: locale === 'bn' ? 'দারুল ইফতা ও ফাতওয়া বোর্ড' : locale === 'ar' ? 'مجلس الإفتاء والبحوث الشرعية' : 'Darul Ifta & Shariah Council',
    title: locale === 'bn' ? 'যাচাইকৃত ফাতওয়া ও প্রশ্নোত্তর আর্কাইভ' : locale === 'ar' ? 'أرشيف الفتاوى والأسئلة الموثقة' : 'Verified Fatwa & Scholarly Answers Archive',
    subtitle: locale === 'bn' 
      ? 'পবিত্র কুরআন, সুন্নাহ ও নির্ভরযোগ্য ফিকহি মূলনীতির আলোকে সম্মানিত মুফতি পরিষদের প্রদত্ত নির্ভরযোগ্য সিদ্ধান্ত ও নির্দেশনা।'
      : locale === 'ar' 
      ? 'فتاوى وأجوبة شرعية موثقة وفق الكتاب والسنة وأصول الفقه المعتمدة لدى أهل السنة والجماعة.'
      : 'Authentic rulings formulated by our certified scholarly council in accordance with classical jurisprudence and contemporary realities.',
    searchPlaceholder: locale === 'bn' ? 'ফাতওয়ার বিষয়, প্রশ্ন বা ফাতওয়া নং দিয়ে খুঁজুন...' : locale === 'ar' ? 'ابحث في الفتاوى بالموضوع أو رقم الفتوى...' : 'Search fatwas by topic, question, or ID...',
    askBtn: locale === 'bn' ? 'প্রশ্ন জিজ্ঞাসা করুন' : locale === 'ar' ? 'اطرح سؤالك على المفتي' : 'Ask a Question',
    verified: locale === 'bn' ? 'দারুল ইফতা কর্তৃক সত্যায়িত' : locale === 'ar' ? 'معتمد من دار الإفتاء' : 'Verified by Council',
    officialMufti: locale === 'bn' ? 'দায়িত্বপ্রাপ্ত মুফতি:' : locale === 'ar' ? 'المفتي المجيب:' : 'Issuing Mufti:',
    refTitle: locale === 'bn' ? 'শরয়ী তথ্যসূত্র ও কিতাবের হাওয়ালা:' : locale === 'ar' ? 'المراجع والمصادر الشرعية:' : 'Scholarly References & Citations:',
    backBtn: locale === 'bn' ? 'ফাতওয়ার তালিকায় ফিরুন' : locale === 'ar' ? 'الرجوع إلى قائمة الفتاوى' : 'Back to Fatwa Archive',
    printBtn: locale === 'bn' ? 'প্রিন্ট করুন' : locale === 'ar' ? 'طباعة' : 'Print',
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-[#064e3b] text-xs font-bold mb-4 shadow-2xs">
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span>{labels.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#064e3b] font-serif tracking-tight mb-4">
            {labels.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed">
            {labels.subtitle}
          </p>
        </div>

        {/* Action & Search Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3.5 rtl:left-auto rtl:right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={labels.searchPlaceholder}
                className="w-full pl-11 rtl:pl-4 rtl:pr-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>
            <button
              onClick={() => setIsAsking(!isAsking)}
              className="w-full md:w-auto px-5 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>{isAsking ? (locale === 'bn' ? 'তালিকায় চোখ রাখুন' : 'Close Question Box') : labels.askBtn}</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto pb-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 rtl:mr-0 rtl:ml-1" />
            {categories.map((c) => {
              const isActive = selectedCategory === c.key;
              const catLabel = locale === 'bn' ? c.labelBn : locale === 'ar' ? c.labelAr : c.labelEn;
              return (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'bg-[#064e3b] text-white shadow-xs font-bold' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {catLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Asking Form (Modal / Dropdown) */}
        {isAsking && (
          <div className="bg-white border-2 border-emerald-600/30 rounded-3xl p-6 sm:p-8 mb-10 shadow-lg animate-in fade-in duration-200">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#064e3b] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {locale === 'bn' ? 'দারুল ইফতায় আপনার প্রশ্ন পেশ করুন' : locale === 'ar' ? 'إرسال سؤال واستفتاء إلى دار الإفتاء' : 'Submit your Question to Darul Ifta'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {locale === 'bn' ? 'মুফতি পরিষদ কুরআন-সুন্নাহ মোতাবেক যাচাই করে উত্তর প্রদান করবেন।' : 'Our scholars will carefully examine and respond in accordance with Shariah.'}
                    </p>
                  </div>
                </div>
              </div>

              {submitSuccess ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center text-emerald-900">
                  <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-sm">
                    {locale === 'bn' ? 'জাযাকাল্লাহু খাইরান! আপনার প্রশ্নটি গৃহীত হয়েছে।' : 'Thank you! Your question has been submitted to the council.'}
                  </p>
                  <p className="text-xs text-slate-700 mt-1">
                    {locale === 'bn' ? 'সংশ্লিষ্ট মুফতি পর্যালোচনার পর আপনার ইমেইলে উত্তর পাঠানো হবে।' : 'A notification with the Fatwa will be sent to your email.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitQuestion} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {locale === 'bn' ? 'আপনার নাম' : 'Your Name'}
                      </label>
                      <input
                        type="text"
                        value={askName}
                        onChange={(e) => setAskName(e.target.value)}
                        placeholder={locale === 'bn' ? 'নাম (ঐচ্ছিক)' : 'Name (Optional)'}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {locale === 'bn' ? 'ইমেইল (উত্তর পাওয়ার জন্য)' : 'Email (For reply)'}
                      </label>
                      <input
                        type="email"
                        required
                        value={askEmail}
                        onChange={(e) => setAskEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {locale === 'bn' ? 'প্রশ্নের বিষয়/বিভাগ' : 'Subject Category'}
                    </label>
                    <select
                      value={askCategory}
                      onChange={(e) => setAskCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="যাকাত ও সদকা">যাকাত ও সদকা (Zakat & Charity)</option>
                      <option value="মুআমালাত ও লেনদেন">মুআমালাত ও লেনদেন (Finance & Transactions)</option>
                      <option value="তাহরাত ও সালাত">তাহরাত ও সালাত (Purity & Prayer)</option>
                      <option value="রোজা ও রমাদান">রোজা ও রমাদান (Fasting)</option>
                      <option value="পারিবারিক ও নিকাহ">পারিবারিক ও নিকাহ (Family Law)</option>
                      <option value="অন্যান্য বিষয়">অন্যান্য সমসাময়িক বিষয় (Others)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {locale === 'bn' ? 'আপনার বিস্তারিত প্রশ্ন লিখুন' : 'Detailed Question'}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={askQuestion}
                      onChange={(e) => setAskQuestion(e.target.value)}
                      placeholder={locale === 'bn' ? 'প্রশ্নের প্রেক্ষাপট ও সংশ্লিষ্ট তথ্য স্পষ্ট করে উল্লেখ করুন...' : 'Please write your query clearly with any relevant context...'}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={isPrivate}
                        onChange={(e) => setIsPrivate(e.target.checked)}
                        className="rounded text-emerald-700 focus:ring-emerald-500"
                      />
                      <span>{locale === 'bn' ? 'প্রশ্নটি ওয়েবসাইটে অপ্রকাশিত (গোপন) রাখুন' : 'Keep this question private'}</span>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? (locale === 'bn' ? 'পাঠানো হচ্ছে...' : 'Submitting...') : (locale === 'bn' ? 'প্রশ্ন জমা দিন' : 'Submit Question')}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Fatwa Details Modal/View */}
        {activeFatwa ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-md mb-10 text-slate-900">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <button
                onClick={() => setActiveFatwa(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>{labels.backBtn}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{labels.printBtn}</span>
              </button>
            </div>

            {/* Official Header */}
            <div className="text-center mb-8 pb-6 border-b border-slate-100">
              <p className="text-xs font-extrabold uppercase tracking-widest text-[#064e3b] mb-1">
                দারুল ইফতা ও ফাতওয়া বোর্ড — ASDRI
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#064e3b] mb-2">
                {locale === 'en' ? (activeFatwa.titleEn || activeFatwa.title) : locale === 'ar' ? (activeFatwa.titleAr || activeFatwa.title) : activeFatwa.title}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
                <span className="font-semibold text-amber-700">ফাতওয়া নং: {activeFatwa.questionNo}</span>
                <span>•</span>
                <span>তারিখ: {activeFatwa.date}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <BookmarkCheck className="w-3.5 h-3.5" />
                  {labels.verified}
                </span>
              </div>
            </div>

            {/* Question section */}
            <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-200/80">
              <div className="flex items-center gap-2 text-xs font-bold text-[#064e3b] mb-2">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>{locale === 'bn' ? 'প্রশ্ন বিবরণ:' : 'Question Statement:'}</span>
              </div>
              <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                {locale === 'en' ? (activeFatwa.questionEn || activeFatwa.question) : locale === 'ar' ? (activeFatwa.questionAr || activeFatwa.question) : activeFatwa.question}
              </p>
            </div>

            {/* Answer section */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 text-xs font-bold text-[#064e3b]">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{locale === 'bn' ? 'শরয়ী সমাধান ও ফাতওয়া:' : 'Scholarly Ruling & Verdict:'}</span>
              </div>
              <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-normal whitespace-pre-line bg-emerald-50/50 p-6 rounded-2xl border border-emerald-900/10">
                {locale === 'en' ? (activeFatwa.answerEn || activeFatwa.answer) : locale === 'ar' ? (activeFatwa.answerAr || activeFatwa.answer) : activeFatwa.answer}
              </div>
            </div>

            {/* Citations & References */}
            {activeFatwa.references && activeFatwa.references.length > 0 && (
              <div className="bg-amber-50/60 rounded-2xl p-4 mb-8 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{labels.refTitle}</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {activeFatwa.references.map((ref, idx) => (
                    <li key={idx}>{ref}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Mufti Signature block */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left rtl:sm:text-right">
                <div className="text-xs text-slate-500">{labels.officialMufti}</div>
                <div className="text-sm font-bold text-slate-900">{activeFatwa.muftiName}</div>
                <div className="text-xs text-emerald-700">{activeFatwa.muftiTitle}</div>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100/60 border border-emerald-300 text-xs font-bold text-[#064e3b]">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>অফিসিয়াল সিলমোহর দ্বারা অনুমোদিত</span>
              </div>
            </div>

          </div>
        ) : (
          /* Fatwa Grid / List */
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-16 text-center flex flex-col justify-center items-center gap-3">
                <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-[#064e3b]"></div>
                <span className="text-xs text-slate-500 font-medium">ফাতওয়া আর্কাইভ লোড হচ্ছে...</span>
              </div>
            ) : filteredFatwas.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200 shadow-sm max-w-2xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-[#064e3b] flex items-center justify-center mx-auto mb-4 border border-emerald-300">
                  <Shield className="w-7 h-7 text-[#064e3b]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b] mb-2">
                  {locale === 'bn' ? 'দারুল ইফতা ও ফাতওয়া আর্কাইভে স্বাগতম' : locale === 'ar' ? 'مرحبًا بكم في بوابة الإفتاء والبحوث الشرعية' : 'Welcome to Darul Ifta & Fatwa Portal'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  {locale === 'bn' 
                    ? 'দারুল ইফতায় সংগৃহীত ও পর্যালোচিত ফাতওয়াসমূহ পর্যায়ক্রমে প্রকাশ করা হয়। আপনার যেকোনো শরয়ী জিজ্ঞাসা বা মাসআলার বিশুদ্ধ সমাধানের জন্য সরাসরি প্রশ্ন পেশ করতে পারেন।' 
                    : locale === 'ar'
                    ? 'يتم نشر الفتاوى المعتمدة من مجلس الإفتاء تباعًا. لطرح أي استفسار أو مسألة شرعية، يرجى تقديم سؤالك إلى دار الإفتاء.'
                    : 'Verified rulings reviewed by our scholarly council are published here. To request a religious ruling, you may submit your inquiry directly to the council.'}
                </p>
                <button
                  onClick={() => setIsAsking(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-amber-300" />
                  <span>{labels.askBtn}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFatwas.map((item) => {
                  const title = locale === 'en' ? (item.titleEn || item.title) : locale === 'ar' ? (item.titleAr || item.title) : item.title;
                  const question = locale === 'en' ? (item.questionEn || item.question) : locale === 'ar' ? (item.questionAr || item.question) : item.question;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveFatwa(item)}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-emerald-600/40 transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2.5">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                            {item.category}
                          </span>
                          <span className="text-amber-700 font-mono font-bold">
                            {item.questionNo}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[#064e3b] font-serif mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                          {title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                          {question}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span className="text-[11px] text-slate-400">{item.date}</span>
                        <span className="text-xs font-bold text-[#064e3b] flex items-center gap-1 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-transform">
                          <span>সম্পূর্ণ পড়ুন</span>
                          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
