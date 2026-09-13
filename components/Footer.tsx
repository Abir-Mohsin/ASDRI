'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Locale } from '@/lib/dictionary';
import { Facebook, Twitter, Youtube, Instagram, MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export function Footer({ dict, locale }: { dict: any; locale: Locale }) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };
  const footerDict = {
    bn: {
      aboutTitle: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট',
      aboutDesc: 'কুরআন ও সুন্নাহর বিশুদ্ধ আদর্শের আলোকে উচ্চতর ইসলামি শিক্ষা, আন্তর্জাতিক মানের গবেষণা এবং সমাজ সংস্কারমূলক দাওয়াহ কার্যক্রমে নিবেদিত একটি আধুনিক শিক্ষা প্রতিষ্ঠান।',
      quickLinks: 'প্রয়োজনীয় লিংক',
      about: 'পরিচিতি',
      faculty: 'শিক্ষক ও গবেষক পরিষদ',
      courses: 'কোর্স ও প্রোগ্রামসমূহ',
      admission: 'অনলাইন ভর্তি',
      library: 'ডিজিটাল লাইব্রেরি',
      research: 'গবেষণা ও প্রকাশনা',
      gallery: 'ফটোগ্যালারি',
      alumni: 'এলামনাই পোর্টাল',
      contactUs: 'যোগাযোগ ও সচিবালয়',
      address: '১২৩ ইসলামিক সেন্টার রোড, ঢাকা, বাংলাদেশ ১২০০',
      newsletter: 'নিউজলেটার সাবস্ক্রিপশন',
      newsletterDesc: 'নতুন কোর্স, ভর্তি বিজ্ঞপ্তি ও গবেষণা প্রকাশনার সর্বশেষ আপডেট সরাসরি ইমেইলে পান।',
      emailPlaceholder: 'আপনার ইমেইল ঠিকানা লিখুন...',
      subscribeBtn: 'সাবস্ক্রাইব',
      copyright: 'সর্বস্বত্ব সংরক্ষিত। আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট।',
      privacy: 'গোপনীয়তা নীতি',
      terms: 'ব্যবহারের শর্তাবলী'
    },
    en: {
      aboutTitle: 'As-Sunnah Dawah & Research Institute',
      aboutDesc: 'Dedicated to authentic Islamic education, advanced research, and global Dawah initiatives based strictly on the Quran and Sunnah.',
      quickLinks: 'Quick Links',
      about: 'About Us',
      faculty: 'Faculty & Scholars',
      courses: 'Courses & Programs',
      admission: 'Online Admission',
      library: 'Digital Library',
      research: 'Research & Publications',
      gallery: 'Gallery',
      alumni: 'Alumni Portal',
      contactUs: 'Contact Secretariat',
      address: '123 Islamic Center Road, Dhaka, Bangladesh 1200',
      newsletter: 'Institutional Newsletter',
      newsletterDesc: 'Subscribe to receive the latest updates on courses, admissions, and research publications.',
      emailPlaceholder: 'Enter your email address...',
      subscribeBtn: 'Subscribe',
      copyright: 'All rights reserved. As-Sunnah Dawah & Research Institute.',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service'
    },
    ar: {
      aboutTitle: 'معهد السنة للدعوة والبحوث',
      aboutDesc: 'مؤسسة أكاديمية إسلامية رائدة مكرسة لنشر العلم الشرعي الأصيل والبحث العلمي وفق القرآن والسنة النبوية.',
      quickLinks: 'روابط هامة',
      about: 'عن المعهد',
      faculty: 'هيئة التدريس',
      courses: 'البرامج الأكاديمية',
      admission: 'القبول والتسجيل',
      library: 'المكتبة الرقمية',
      research: 'البحوث والإصدارات',
      gallery: 'معرض الصور',
      alumni: 'بوابة الخريجين',
      contactUs: 'الاتصال والأمانة',
      address: '١٢٣ طريق المركز الإسلامي، دكا، بنغلاديش',
      newsletter: 'النشرة البريدية',
      newsletterDesc: 'اشترك للحصول على آخر التحديثات حول الدورات والقبول والإصدارات البحثية.',
      emailPlaceholder: 'أدخل بريدك الإلكتروني...',
      subscribeBtn: 'اشتراك',
      copyright: 'جميع الحقوق محفوظة. معهد السنة للدعوة والبحوث.',
      privacy: 'سياسة الخصوصية',
      terms: 'شروط الاستخدام'
    }
  };

  const currentF = footerDict[locale] || footerDict.en;

  return (
    <footer className="bg-[#064e3b] text-white pt-16 pb-10 border-t border-emerald-800/60 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
          
          {/* Brand Column */}
          <div className="space-y-5">
            <BrandLogo variant="footer" locale={locale} />
            <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed">
              {currentF.aboutDesc}
            </p>
            <div className="flex space-x-3.5 rtl:space-x-reverse pt-1">
              <a href="#" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors shadow-xs"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors shadow-xs"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors shadow-xs"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors shadow-xs"><Instagram className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-5 text-amber-400 font-serif">{currentF.quickLinks}</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li><Link href={`/${locale}/about`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.about}</Link></li>
              <li><Link href={`/${locale}/faculty`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.faculty}</Link></li>
              <li><Link href={`/${locale}/courses`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.courses}</Link></li>
              <li><Link href={`/${locale}/admission`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.admission}</Link></li>
              <li><Link href={`/${locale}/fatwa`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{locale === 'bn' ? 'ফাতওয়া ও দারুল ইফতা' : locale === 'ar' ? 'دار الإفتاء والفتاوى' : 'Fatwa Portal'}</Link></li>
              <li><Link href={`/${locale}/donate`} className="text-amber-300 font-bold hover:text-white transition-colors inline-block">{locale === 'bn' ? 'যাকাত ও অনুদান ফান্ড' : locale === 'ar' ? 'صندوق الزكاة والتبرعات' : 'Zakat & Donation Fund'}</Link></li>
              <li><Link href={`/${locale}/library`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.library}</Link></li>
              <li><Link href={`/${locale}/research`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.research}</Link></li>
              <li><Link href={`/${locale}/gallery`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.gallery}</Link></li>
              <li><Link href={`/${locale}/alumni`} className="text-emerald-100/80 hover:text-amber-300 transition-colors inline-block">{currentF.alumni}</Link></li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-5 text-amber-400 font-serif">{currentF.contactUs}</h3>
            <ul className="space-y-3.5 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-emerald-100/80 leading-relaxed">
                  {currentF.address}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-emerald-100/80">+880 1805-437910</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-emerald-100/80">info@asdri.edu.bd</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider mb-5 text-amber-400 font-serif">{currentF.newsletter}</h3>
            <p className="text-emerald-100/80 text-xs leading-relaxed mb-4">
              {currentF.newsletterDesc}
            </p>
            {isSubscribed ? (
              <div className="p-3 rounded-xl bg-emerald-900/90 border border-amber-400/50 text-amber-300 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  {locale === 'bn' 
                    ? 'ধন্যবাদ! আপনার সাবস্ক্রিপশন সফল হয়েছে।' 
                    : locale === 'ar'
                    ? 'شكراً لك! تم الاشتراك بنجاح.'
                    : 'Thank you! You have subscribed successfully.'}
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col space-y-2.5">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentF.emailPlaceholder}
                  className="bg-emerald-950/80 border border-emerald-700/80 text-white text-xs px-3.5 py-2.5 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-400 placeholder-emerald-200/50"
                />
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{currentF.subscribeBtn}</span>
                </button>
              </form>
            )}
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-emerald-800/60 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-emerald-200/70">
          <p className="text-center md:text-left rtl:md:text-right">
            &copy; {new Date().getFullYear()} {currentF.copyright}
          </p>
          <div className="flex space-x-6 rtl:space-x-reverse">
            <Link href={`/${locale}/privacy`} className="hover:text-amber-300 transition-colors">{currentF.privacy}</Link>
            <Link href={`/${locale}/terms`} className="hover:text-amber-300 transition-colors">{currentF.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
