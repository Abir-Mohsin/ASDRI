'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Locale } from '@/lib/dictionary';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { UserAvatar } from './UserAvatar';
import { BrandLogo } from './BrandLogo';
import clsx from 'clsx';

export function Navbar({ dict, locale }: { dict: any; locale: Locale }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [mobileAboutExpanded, setMobileAboutExpanded] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const isInsideDesktop = desktopLangRef.current?.contains(event.target as Node);
      const isInsideMobile = mobileLangRef.current?.contains(event.target as Node);
      if (!isInsideDesktop && !isInsideMobile) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLocale = (newLocale: string) => {
    if (!pathname) return `/${newLocale}`;
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && ['en', 'bn', 'ar'].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    const newPath = `/${segments.join('/')}`;
    const queryString = typeof window !== 'undefined' ? window.location.search : '';
    return queryString ? `${newPath}${queryString}` : newPath;
  };

  const handleLanguageSelect = (newLocale: string) => {
    setIsLangOpen(false);
    const targetUrl = switchLocale(newLocale);
    router.push(targetUrl);
  };

  const navLinks = [
    { name: dict.common.home, href: `/${locale}` },
    { name: dict.common.about, href: `/${locale}/about` },
    { name: dict.common.courses, href: `/${locale}/courses` },
    { name: dict.common.admission, href: `/${locale}/admission` },
    { name: dict.common.services || (locale === 'bn' ? 'সেবা ও পোর্টাল' : locale === 'ar' ? 'الخدمات' : 'Services'), href: `/${locale}/services` },
  ];

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  ];

  return (
    <nav className="bg-[#064e3b] text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <BrandLogo variant="navbar" locale={locale} />
          </div>
          
          <div className="hidden md:flex md:items-center gap-1.5 lg:gap-3 xl:gap-4 flex-nowrap shrink-0">
            {navLinks.map((link) => {
              if (link.href === `/${locale}/about`) {
                const isAboutActive = pathname === link.href || Boolean(pathname?.startsWith(`/${locale}/about`)) || Boolean(pathname?.startsWith(`/${locale}/faculty`));
                return (
                  <div
                    key={link.name}
                    className="relative group py-2"
                  >
                    <Link
                      href={link.href}
                      className={clsx(
                        'flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-colors hover:bg-emerald-800',
                        isAboutActive ? 'bg-emerald-800 text-amber-300 font-semibold' : 'text-emerald-50'
                      )}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 group-hover:rotate-180" />
                    </Link>

                    {/* Floating Dropdown on Hover without icons */}
                    <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 pt-1.5 z-50 w-60 hidden group-hover:block transition-all duration-150">
                      <div className="bg-white rounded-xl shadow-2xl border border-emerald-900/10 py-1.5 text-slate-800 ring-1 ring-black/5 overflow-hidden">
                        <Link
                          href={`/${locale}/about`}
                          className={clsx(
                            'block px-4 py-2.5 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors border-b border-slate-100',
                            pathname === `/${locale}/about` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {locale === 'bn' ? 'আমাদের পরিচিতি ও লক্ষ্য' : locale === 'ar' ? 'عن المعهد وررسالته' : 'About ASDRI & Mission'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {locale === 'bn' ? 'ইতিহাস, ভিশন ও মূল স্তম্ভ' : locale === 'ar' ? 'الرسالة، الرؤية والأهداف' : 'History, vision and core pillars'}
                          </div>
                        </Link>

                        <Link
                          href={`/${locale}/faculty`}
                          className={clsx(
                            'block px-4 py-2.5 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors',
                            pathname === `/${locale}/faculty` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {dict.common.faculty || (locale === 'bn' ? 'শিক্ষক ও গবেষক পরিষদ' : locale === 'ar' ? 'هيئة التدريس' : 'Faculty & Scholars Council')}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {locale === 'bn' ? 'প্রথিতযশা উস্তাদ ও গবেষকবৃন্দ' : locale === 'ar' ? 'نخبة الأساتذة والباحثين' : 'Distinguished faculty directory'}
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              if (link.href === `/${locale}/services`) {
                const isServicesActive = Boolean(pathname?.startsWith(`/${locale}/fatwa`)) || Boolean(pathname?.startsWith(`/${locale}/donate`)) || Boolean(pathname?.startsWith(`/${locale}/library`)) || Boolean(pathname?.startsWith(`/${locale}/research`)) || Boolean(pathname?.startsWith(`/${locale}/gallery`)) || Boolean(pathname?.startsWith(`/${locale}/alumni`));
                return (
                  <div
                    key={link.name}
                    className="relative group py-2"
                  >
                    <button
                      type="button"
                      className={clsx(
                        'flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-colors hover:bg-emerald-800 cursor-pointer',
                        isServicesActive ? 'bg-emerald-800 text-amber-300 font-semibold' : 'text-emerald-50'
                      )}
                    >
                      <span>{link.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 group-hover:rotate-180" />
                    </button>

                    {/* Floating Dropdown on Hover without icons */}
                    <div className="absolute top-full left-0 rtl:left-auto rtl:right-0 pt-1.5 z-50 w-64 hidden group-hover:block transition-all duration-150">
                      <div className="bg-white rounded-xl shadow-2xl border border-emerald-900/10 py-1.5 text-slate-800 ring-1 ring-black/5 overflow-hidden">
                        
                        <Link
                          href={`/${locale}/fatwa`}
                          className={clsx(
                            'block px-4 py-2.5 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors border-b border-slate-100',
                            pathname === `/${locale}/fatwa` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {locale === 'bn' ? 'দারুল ইফতা ও ফাতওয়া' : locale === 'ar' ? 'دار الإفتاء والفتاوى' : 'Darul Ifta & Fatwa Portal'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {locale === 'bn' ? 'যাচাইকৃত ফাতওয়া আর্কাইভ ও প্রশ্নোত্তর' : 'Verified rulings & ask question'}
                          </div>
                        </Link>

                        <Link
                          href={`/${locale}/donate`}
                          className={clsx(
                            'block px-4 py-2.5 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors border-b border-slate-100',
                            pathname === `/${locale}/donate` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {locale === 'bn' ? 'যাকাত ও অনুদান ফান্ড' : locale === 'ar' ? 'صندوق الزكاة والتبرعات' : 'Zakat & Donation Fund'}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {locale === 'bn' ? 'যাকাত ক্যালকুলেটর ও ডিজিটাল মানি রিসিট' : 'Zakat calculator & digital receipt'}
                          </div>
                        </Link>

                        <Link
                          href={`/${locale}/library`}
                          className={clsx(
                            'block px-4 py-2.5 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors border-b border-slate-100',
                            pathname === `/${locale}/library` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {dict.common.library || (locale === 'bn' ? 'মাকতাবা ও লাইব্রেরি' : 'Maktaba & Library')}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {locale === 'bn' ? 'ডিজিটাল কিতাব ও গবেষণার সংগ্রহশালা' : 'Digital manuscript & books catalogue'}
                          </div>
                        </Link>

                        <Link
                          href={`/${locale}/research`}
                          className={clsx(
                            'block px-4 py-2.5 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors border-b border-slate-100',
                            pathname === `/${locale}/research` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            {dict.common.research || (locale === 'bn' ? 'উচ্চতর গবেষণা ও জার্নাল' : 'Research Portal')}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {locale === 'bn' ? 'তাহকীককৃত গবেষণাপত্র ও জার্নাল' : 'Scholarly publications'}
                          </div>
                        </Link>

                        <Link
                          href={`/${locale}/gallery`}
                          className={clsx(
                            'block px-4 py-2 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors border-b border-slate-100',
                            pathname === `/${locale}/gallery` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-semibold text-slate-700">
                            {dict.common.gallery || (locale === 'bn' ? 'আলোকচিত্র গ্যালারি' : 'Photo Gallery')}
                          </div>
                        </Link>

                        <Link
                          href={`/${locale}/alumni`}
                          className={clsx(
                            'block px-4 py-2 text-left rtl:text-right hover:bg-emerald-50/80 transition-colors',
                            pathname === `/${locale}/alumni` && 'bg-emerald-50/90 text-emerald-950 font-bold'
                          )}
                        >
                          <div className="text-xs font-semibold text-slate-700">
                            {dict.common.alumni || (locale === 'bn' ? 'এলামনাই অ্যাসোসিয়েশন' : 'Alumni Network')}
                          </div>
                        </Link>

                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={clsx(
                    'px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium whitespace-nowrap transition-colors hover:bg-emerald-800',
                    pathname === link.href ? 'bg-emerald-800 text-amber-300 font-semibold' : 'text-emerald-50'
                  )}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Language Dropdown Selector */}
            <div className="relative shrink-0" ref={desktopLangRef}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-bold bg-emerald-800/90 hover:bg-emerald-800 transition-colors border border-emerald-700/60 shadow-xs focus:outline-none whitespace-nowrap cursor-pointer"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-400 shrink-0" />
                <span className="uppercase tracking-wider">{locale}</span>
                <ChevronDown className={clsx('w-3 h-3 lg:w-3.5 lg:h-3.5 text-emerald-300 transition-transform duration-200', isLangOpen && 'rotate-180')} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 text-slate-800">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Select Language
                  </div>
                  {languages.map((lang) => {
                    const isSelected = locale === lang.code;
                    return (
                      <button 
                        key={lang.code}
                        type="button"
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={clsx(
                          'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold transition-colors text-left rtl:text-right cursor-pointer',
                          isSelected ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        )}
                      >
                        <span>{lang.nativeName}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Profile Avatar First (only avatar picture, no name or dashboard text) */}
            {user ? (
              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <Link
                  href={`/${locale}/dashboard`}
                  title={user.displayName || user.email || 'Dashboard'}
                  className="inline-flex items-center justify-center p-0.5 rounded-full hover:ring-2 hover:ring-amber-400/80 transition-all shrink-0 focus:outline-none"
                  aria-label="User Dashboard Profile"
                >
                  <UserAvatar user={user} size="sm" showBorder={true} />
                </Link>

                {/* Donate Button placed after profile avatar */}
                <Link
                  href={`/${locale}/donate`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs lg:text-sm font-extrabold bg-amber-500 hover:bg-amber-400 text-emerald-950 transition-all shadow-sm shrink-0 whitespace-nowrap"
                >
                  <span>Donate</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                <Link
                  href={`/${locale}/login`}
                  className="px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium text-emerald-100 hover:text-white hover:bg-emerald-800/50 transition-colors whitespace-nowrap"
                >
                  {dict.common.login}
                </Link>
                <Link
                  href={`/${locale}/register`}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg text-xs lg:text-sm font-bold transition-colors shadow-sm whitespace-nowrap"
                >
                  {dict?.home?.apply_now || (locale === 'bn' ? 'আবেদন করুন' : locale === 'ar' ? 'قدم الآن' : 'Apply Now')}
                </Link>
                
                {/* Donate Button placed after auth buttons */}
                <Link
                  href={`/${locale}/donate`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-extrabold bg-amber-500 hover:bg-amber-400 text-emerald-950 transition-all shadow-sm shrink-0 whitespace-nowrap ml-1"
                >
                  <span>Donate</span>
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Language Dropdown Toggle */}
            <div className="relative" ref={mobileLangRef}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-bold bg-emerald-800 text-amber-400 border border-emerald-700"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase">{locale}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50 text-slate-800">
                  {languages.map((lang) => (
                    <button 
                      key={lang.code}
                      type="button"
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={clsx(
                        'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-left rtl:text-right',
                        locale === lang.code ? 'bg-emerald-50 text-emerald-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      )}
                    >
                      <span>{lang.nativeName}</span>
                      {locale === lang.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-emerald-800 pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => {
              if (link.href === `/${locale}/about`) {
                return (
                  <div key={link.name} className="space-y-1">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-white hover:bg-emerald-700">
                      <Link
                        href={link.href}
                        className="flex-1"
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileAboutExpanded(!mobileAboutExpanded);
                        }}
                        className="p-1 text-emerald-200 hover:text-white"
                        aria-label="Toggle Submenu"
                      >
                        <ChevronDown className={clsx('w-4 h-4 transition-transform', mobileAboutExpanded && 'rotate-180')} />
                      </button>
                    </div>

                    {mobileAboutExpanded && (
                      <div className="pl-4 rtl:pl-0 rtl:pr-4 space-y-1 bg-emerald-900/60 rounded-lg p-2">
                        <Link
                          href={`/${locale}/about`}
                          className="block px-3 py-2 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {locale === 'bn' ? 'আমাদের পরিচিতি ও লক্ষ্য' : locale === 'ar' ? 'عن المعهد ورسالته' : 'About ASDRI & Mission'}
                        </Link>
                        <Link
                          href={`/${locale}/faculty`}
                          className="block px-3 py-2 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict.common.faculty || (locale === 'bn' ? 'শিক্ষক ও গবেষক পরিষদ' : locale === 'ar' ? 'هيئة التدريس' : 'Faculty & Scholars')}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              if (link.href === `/${locale}/services`) {
                return (
                  <div key={link.name} className="space-y-1">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-white hover:bg-emerald-700">
                      <span className="flex-1 cursor-pointer" onClick={() => setMobileServicesExpanded(!mobileServicesExpanded)}>
                        {link.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileServicesExpanded(!mobileServicesExpanded);
                        }}
                        className="p-1 text-emerald-200 hover:text-white"
                        aria-label="Toggle Submenu"
                      >
                        <ChevronDown className={clsx('w-4 h-4 transition-transform', mobileServicesExpanded && 'rotate-180')} />
                      </button>
                    </div>

                    {mobileServicesExpanded && (
                      <div className="pl-4 rtl:pl-0 rtl:pr-4 space-y-1 bg-emerald-900/60 rounded-lg p-2">
                        <Link
                          href={`/${locale}/fatwa`}
                          className="block px-3 py-1.5 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {locale === 'bn' ? 'দারুল ইফতা ও ফাতওয়া' : 'Fatwa & Ifta Portal'}
                        </Link>
                        <Link
                          href={`/${locale}/donate`}
                          className="block px-3 py-1.5 rounded-md text-sm text-amber-300 font-bold hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {locale === 'bn' ? 'যাকাত ও অনুদান ফান্ড' : 'Zakat & Donation Fund'}
                        </Link>
                        <Link
                          href={`/${locale}/library`}
                          className="block px-3 py-1.5 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict.common.library || (locale === 'bn' ? 'মাকতাবা ও লাইব্রেরি' : 'Maktaba & Library')}
                        </Link>
                        <Link
                          href={`/${locale}/research`}
                          className="block px-3 py-1.5 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict.common.research || 'Research Portal'}
                        </Link>
                        <Link
                          href={`/${locale}/gallery`}
                          className="block px-3 py-1.5 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict.common.gallery || 'Gallery'}
                        </Link>
                        <Link
                          href={`/${locale}/alumni`}
                          className="block px-3 py-1.5 rounded-md text-sm text-emerald-100 hover:text-white hover:bg-emerald-800/80"
                          onClick={() => setIsOpen(false)}
                        >
                          {dict.common.alumni || 'Alumni'}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-emerald-700"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="flex gap-2 px-3 py-2 border-t border-emerald-700/60 pt-3">
               <button type="button" onClick={() => { setIsOpen(false); handleLanguageSelect('en'); }} className={clsx("px-3 py-1.5 rounded text-xs font-bold transition-all", locale === 'en' ? "bg-amber-500 text-emerald-950 font-extrabold" : "bg-emerald-900 text-emerald-100 hover:bg-emerald-700")}>English</button>
               <button type="button" onClick={() => { setIsOpen(false); handleLanguageSelect('bn'); }} className={clsx("px-3 py-1.5 rounded text-xs font-bold transition-all", locale === 'bn' ? "bg-amber-500 text-emerald-950 font-extrabold" : "bg-emerald-900 text-emerald-100 hover:bg-emerald-700")}>বাংলা</button>
               <button type="button" onClick={() => { setIsOpen(false); handleLanguageSelect('ar'); }} className={clsx("px-3 py-1.5 rounded text-xs font-bold transition-all", locale === 'ar' ? "bg-amber-500 text-emerald-950 font-extrabold" : "bg-emerald-900 text-emerald-100 hover:bg-emerald-700")}>العربية</button>
            </div>

            {user ? (
              <div className="flex items-center justify-between gap-3 w-full mt-4 bg-emerald-900/90 border border-emerald-700/60 p-3 rounded-xl">
                <Link
                  href={`/${locale}/dashboard`}
                  title={user.displayName || user.email || 'Dashboard'}
                  className="p-1 rounded-full hover:ring-2 hover:ring-amber-400"
                  onClick={() => setIsOpen(false)}
                >
                  <UserAvatar user={user} size="md" showBorder={true} />
                </Link>
                <Link
                  href={`/${locale}/donate`}
                  className="px-5 py-2 rounded-lg text-sm font-extrabold bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-xs whitespace-nowrap"
                  onClick={() => setIsOpen(false)}
                >
                  Donate
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex gap-2">
                  <Link
                    href={`/${locale}/login`}
                    className="flex-1 text-center text-emerald-100 hover:text-white px-4 py-2 rounded-md text-base font-medium border border-emerald-700"
                    onClick={() => setIsOpen(false)}
                  >
                    {dict.common.login}
                  </Link>
                  <Link
                    href={`/${locale}/register`}
                    className="flex-1 text-center bg-amber-500 hover:bg-amber-600 text-emerald-950 px-4 py-2 rounded-md text-base font-bold"
                    onClick={() => setIsOpen(false)}
                  >
                    {dict?.home?.apply_now || (locale === 'bn' ? 'আবেদন করুন' : locale === 'ar' ? 'قدم الآن' : 'Apply Now')}
                  </Link>
                </div>
                <Link
                  href={`/${locale}/donate`}
                  className="flex items-center justify-center w-full py-2.5 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-emerald-950 shadow-xs"
                  onClick={() => setIsOpen(false)}
                >
                  Donate
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
