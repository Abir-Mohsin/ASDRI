'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlumniProfile, AlumniEvent, AlumniJob, AlumniAnnouncement, AlumniSuccessStory,
  INITIAL_ALUMNI_PROFILES, INITIAL_ALUMNI_EVENTS, INITIAL_ALUMNI_JOBS,
  INITIAL_ANNOUNCEMENTS, INITIAL_SUCCESS_STORIES
} from '@/lib/alumniTypes';
import { 
  GraduationCap, Award, Users, Calendar, 
  Briefcase, HeartHandshake, Search, ShieldCheck, 
  Plus, CheckCircle2, QrCode, ArrowRight, Sparkles,
  MapPin, Globe, BookOpen, ExternalLink, Landmark,
  Bell, FileText, Mail, Star, Phone,
  Menu, X, ChevronLeft, ChevronRight, PanelLeftClose,
  PanelLeftOpen, SlidersHorizontal, Compass, Layers
} from 'lucide-react';
import { AlumniDirectoryView } from './AlumniDirectoryView';
import { AlumniEventsView } from './AlumniEventsView';
import { AlumniJobBoardView } from './AlumniJobBoardView';
import { AlumniMentorshipView } from './AlumniMentorshipView';
import { AlumniAssociationView } from './AlumniAssociationView';
import { AlumniAboutView } from './AlumniAboutView';
import { AlumniSuccessStoriesView } from './AlumniSuccessStoriesView';
import { AlumniNewsView } from './AlumniNewsView';
import { AlumniContactView } from './AlumniContactView';
import { AlumniRegistrationModal } from './AlumniRegistrationModal';
import { AlumniDigitalVerificationModal } from './AlumniDigitalVerificationModal';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Link from 'next/link';

export type AlumniPortalTab = 
  | 'about' 
  | 'directory' 
  | 'committee' 
  | 'chapters' 
  | 'events' 
  | 'jobs' 
  | 'mentorship' 
  | 'stories' 
  | 'news' 
  | 'verify' 
  | 'constitution' 
  | 'contact';

interface AlumniPublicPortalProps {
  initialTab?: string;
  verifyIdParam?: string;
  locale?: string;
}

export function AlumniPublicPortal({ initialTab = 'about', verifyIdParam = '', locale = 'bn' }: AlumniPublicPortalProps) {
  // Normalize initialTab
  const parseTab = (t?: string): AlumniPortalTab => {
    if (!t) return 'about';
    const validTabs: AlumniPortalTab[] = [
      'about', 'directory', 'committee', 'chapters', 
      'events', 'jobs', 'mentorship', 'stories', 
      'news', 'verify', 'constitution', 'contact'
    ];
    if (t === 'association') return 'about';
    if (t === 'membership') return 'constitution';
    return validTabs.includes(t as AlumniPortalTab) ? (t as AlumniPortalTab) : 'about';
  };

  const [activeTab, setActiveTab] = useState<AlumniPortalTab>(parseTab(initialTab));

  const [profiles, setProfiles] = useState<AlumniProfile[]>(INITIAL_ALUMNI_PROFILES);
  const [events, setEvents] = useState<AlumniEvent[]>(INITIAL_ALUMNI_EVENTS);
  const [jobs, setJobs] = useState<AlumniJob[]>(INITIAL_ALUMNI_JOBS);
  const [announcements, setAnnouncements] = useState<AlumniAnnouncement[]>(INITIAL_ANNOUNCEMENTS);
  const [stories, setStories] = useState<AlumniSuccessStory[]>(INITIAL_SUCCESS_STORIES);

  // Modals
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(!!verifyIdParam);
  const [activeVerifyId, setActiveVerifyId] = useState(verifyIdParam);

  // Sidebar Controls (Desktop Collapsible & Mobile Slide-Over Drawer)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Direct Inline Verify Query State
  const [inlineVerifyInput, setInlineVerifyInput] = useState('');
  const [inlineVerifyResult, setInlineVerifyResult] = useState<AlumniProfile | null | 'not_found'>(null);

  const t = {
    en: {
      badge: "As-Sunnah Alumni Network & Portal",
      heroTitle: "Uniting Scholars, Researchers & Alumni Worldwide",
      heroSubtitle: "Connecting ASDRI graduates, da'ees, scholars, and professionals across the globe for lifelong fellowship, career opportunities, and collaborative initiatives.",
      registerBtn: "Register as Alumni",
      verifyBtn: "Verify Digital ID",
      portalLoginBtn: "Alumni Portal Login",
      statRegistered: "Registered Alumni",
      statBatches: "Graduated Batches",
      statCountries: "Countries & Global Reach",
      statMentors: "Active Mentors",
      drawerTitle: "Alumni Portal Menu",
      drawerSubtitle: "As-Sunnah Dawah Institute",
      openMenu: "Open Menu ▾",
      close: "Close",
      sidebarNav: "Alumni Navigation",
      sidebarSub: "Institute Alumni Hub",
      collapseTip: "Collapse sidebar for wide view",
      expandTip: "Expand sidebar menu",
      fullView: "Full View",
      showMenu: "Show Menu",
      helpdeskTitle: "Alumni Secretariat & Support",
      helpdeskDesc: "Contact us directly for membership inquiries, certificate verification, or reunion information.",
      applyMembership: "Apply for Membership",
      helpdeskLabel: "Helpdesk:",
      verifyTitle: "Smart Digital Alumni ID & Credential Verification",
      verifySubtitle: "Instantly verify the authenticity of any ASDRI graduate's official alumni credential or certificate.",
      verifyFormLabel: "Enter Alumni ID Number or Graduate's Name:",
      verifyPlaceholder: "e.g. ASDRI-ALM-2021-00101 or Mahmud Hasan",
      verifyAction: "Verify Credential",
      notFoundTitle: "No Verified Alumni Found!",
      notFoundDesc: "Please verify the ID number or contact the central administration office for assistance.",
      officialMember: "Officially Verified & Active Alumni Member",
      viewFullCard: "View Digital ID Card Full Preview",
      qrTitle: "QR Code Verification:",
      qrDesc: "Scanning the QR code on the back of a physical or digital smart ID card automatically verifies the credential on this portal.",
      group1: "Core Network & Directory",
      group2: "Events, Career & Mentorship",
      group3: "Services, Bylaws & Support",
      tabAbout: "About Association",
      tabDirectory: "Alumni Directory",
      tabCommittee: "Leadership & Committee",
      tabChapters: "Global Chapters",
      tabEvents: "Events & Reunions",
      tabJobs: "Career & Job Board",
      tabMentorship: "Mentorship Hub",
      tabStories: "Success Stories",
      tabNews: "Notices & News",
      tabVerify: "Verify Smart ID",
      tabConstitution: "Constitution & Bylaws",
      tabContact: "Contact & Secretariat",
      portalBreadcrumb: "Alumni Portal"
    },
    bn: {
      badge: "As-Sunnah Alumni Network & Management Portal",
      heroTitle: "United Gathering Place for Former Scholars & Graduates",
      heroSubtitle: "An institutional communication, career development, conference, and digital identification platform for researchers, callers to Islam (da'ees), teachers, and professionals who have graduated from As-Sunnah Dawah and Research Institute.",
      registerBtn: "Register as Alumni",
      verifyBtn: "Verify Digital ID",
      portalLoginBtn: "Alumni Portal Login",
      statRegistered: "Registered Alumni",
      statBatches: "Total Graduated Batches",
      statCountries: "Workplace & Countries",
      statMentors: "Active Mentors",
      drawerTitle: "Alumni Portal Menu",
      drawerSubtitle: "As-Sunnah Dawah Institute",
      openMenu: "Open Menu ▾",
      close: "Close",
      sidebarNav: "Alumni Navigation",
      sidebarSub: "Institute Alumni Hub",
      collapseTip: "Collapse sidebar to enlarge portal",
      expandTip: "Expand sidebar menu",
      fullView: "Full View",
      showMenu: "Show Menu",
      helpdeskTitle: "Alumni Secretariat & Helpdesk",
      helpdeskDesc: "Contact us directly for any assistance regarding membership, certificate verification, or reunions.",
      applyMembership: "Apply for New Membership",
      helpdeskLabel: "Helpdesk:",
      verifyTitle: "Smart Digital Alumni ID & Certificate Verification",
      verifySubtitle: "Instantly verify the validity of any graduate's certificate from As-Sunnah Dawah and Research Institute using their official ID number or name.",
      verifyFormLabel: "Enter Alumni ID Number or Student's Name:",
      verifyPlaceholder: "e.g. ASDRI-ALM-2021-00101 or Mahmud Hasan",
      verifyAction: "Verify",
      notFoundTitle: "No Verified Alumni Information Found!",
      notFoundDesc: "Please try again with the correct ID number or contact the central office.",
      officialMember: "Officially Approved & Active Alumni Member",
      viewFullCard: "View Digital ID Card Full-View",
      qrTitle: "QR Code Scanning Assistance:",
      qrDesc: "Scanning the QR code on the back of the smart ID card with any smartphone camera will automatically redirect to this verification page.",
      group1: "Core Information & Network",
      group2: "Events, Career & Mentorship",
      group3: "Services, Regulations & Support",
      tabAbout: "Association Introduction",
      tabDirectory: "Alumni Directory",
      tabCommittee: "Leadership & Committee",
      tabChapters: "Global Chapters",
      tabEvents: "Events & Conference",
      tabJobs: "Career & Job Board",
      tabMentorship: "Mentorship Hub",
      tabStories: "Success Stories",
      tabNews: "Notices & News",
      tabVerify: "Smart ID Card Verification",
      tabConstitution: "Constitution & Policies",
      tabContact: "Contact & Support",
      portalBreadcrumb: "Alumni Portal"
    },
    ar: {
      badge: "شبكة وبوابة خريجي معهد السنة للدعوة والبحوث",
      heroTitle: "ملتقى العلماء والباحثين والخريجين حول العالم",
      heroSubtitle: "منصة تواصل لخريجي ودعاة وباحثي المعهد لتعزيز الروابط الأكاديمية وفرص العمل والتعاون العلمي المشترك.",
      registerBtn: "تسجيل الخريجين",
      verifyBtn: "التحقق من البطاقة الرقمية",
      portalLoginBtn: "دخول بوابة الخريجين",
      statRegistered: "الخريجون المسجلون",
      statBatches: "الدفعات المتخرجة",
      statCountries: "الدول ومناطق العمل",
      statMentors: "المرشدون الأكاديميون",
      drawerTitle: "قائمة بوابة الخريجين",
      drawerSubtitle: "معهد السنة للدعوة والبحوث",
      openMenu: "افتح القائمة ▾",
      close: "إغلاق",
      sidebarNav: "تصفح الخريجين",
      sidebarSub: "مركز الخريجين",
      collapseTip: "طي القائمة الجانبية",
      expandTip: "توسيع القائمة الجانبية",
      fullView: "عرض كامل",
      showMenu: "إظهار القائمة",
      helpdeskTitle: "أمانة الخريجين والدعم",
      helpdeskDesc: "تواصل معنا مباشرة للاستفسارات المتعلقة بالعضوية أو التحقق من الشهادات واللقاءات.",
      applyMembership: "طلب عضوية جديدة",
      helpdeskLabel: "المكتب:",
      verifyTitle: "التحقق الذكي من بطاقة وشهادة الخريج",
      verifySubtitle: "تحقق فورياً من صحة بيانات واعتماد أي خريج من معهد السنة عبر رقمه التعريفي أو اسمه.",
      verifyFormLabel: "أدخل رقم هوية الخريج أو الاسم:",
      verifyPlaceholder: "مثال: ASDRI-ALM-2021-00101 أو محمود حسن",
      verifyAction: "تحقق الآن",
      notFoundTitle: "لم يتم العثور على بيانات معتمدة!",
      notFoundDesc: "يرجى التأكد من صحة رقم الهوية أو مراجعة إدارة المعهد.",
      officialMember: "عضو خريج معتمد ونشط رسمياً",
      viewFullCard: "عرض بطاقة الخريج الرقمية كاملة",
      qrTitle: "المساعدة في مسح رمز QR:",
      qrDesc: "مسح رمز الاستجابة السريعة خلف البطاقة بكاميرا الهاتف ينقلك تلقائياً لصفحة التحقق المعتمدة.",
      group1: "المعلومات والشبكة",
      group2: "الفعاليات والوظائف والإرشاد",
      group3: "الخدمات واللوائح والدعم",
      tabAbout: "عن الرابطة",
      tabDirectory: "دليل الخريجين",
      tabCommittee: "القيادة واللجنة",
      tabChapters: "الفروع الدولية",
      tabEvents: "المؤتمرات واللقاءات",
      tabJobs: "فرص العمل والوظائف",
      tabMentorship: "مركز الإرشاد",
      tabStories: "قصص النجاح",
      tabNews: "الأخبار والإعلانات",
      tabVerify: "التحقق من الهوية الذكية",
      tabConstitution: "اللائحة والنظام الأساسي",
      tabContact: "الاتصال والأمانة",
      portalBreadcrumb: "بوابة الخريجين"
    }
  };

  const currentT = t[locale as 'en' | 'bn' | 'ar'] || t.en;

  // Real-time Firestore sync
  useEffect(() => {
    try {
      // 1. Sync Profiles
      const qProfiles = collection(db, 'alumni_profiles');
      const unsubscribeProfiles = onSnapshot(qProfiles, (snapshot) => {
        if (!snapshot.empty) {
          const liveProfiles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as AlumniProfile));
          
          const merged = [...liveProfiles];
          INITIAL_ALUMNI_PROFILES.forEach(mock => {
            if (!merged.some(p => p.alumniId === mock.alumniId)) {
              merged.push(mock);
            }
          });
          setProfiles(merged);
        }
      });

      // 2. Sync Events
      const qEvents = collection(db, 'alumni_events');
      const unsubscribeEvents = onSnapshot(qEvents, (snapshot) => {
        if (!snapshot.empty) {
          const liveEvents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as AlumniEvent));
          const merged = [...liveEvents];
          INITIAL_ALUMNI_EVENTS.forEach(mock => {
            if (!merged.some(e => e.id === mock.id)) {
              merged.push(mock);
            }
          });
          setEvents(merged);
        }
      });

      // 3. Sync Jobs
      const qJobs = collection(db, 'alumni_jobs');
      const unsubscribeJobs = onSnapshot(qJobs, (snapshot) => {
        if (!snapshot.empty) {
          const liveJobs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as AlumniJob));
          const merged = [...liveJobs];
          INITIAL_ALUMNI_JOBS.forEach(mock => {
            if (!merged.some(j => j.id === mock.id)) {
              merged.push(mock);
            }
          });
          setJobs(merged);
        }
      });

      // 4. Sync Announcements
      const qAnn = collection(db, 'alumni_announcements');
      const unsubscribeAnn = onSnapshot(qAnn, (snapshot) => {
        if (!snapshot.empty) {
          const liveAnn = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as AlumniAnnouncement));
          const merged = [...liveAnn];
          INITIAL_ANNOUNCEMENTS.forEach(mock => {
            if (!merged.some(a => a.id === mock.id)) {
              merged.push(mock);
            }
          });
          setAnnouncements(merged);
        }
      });

      return () => {
        unsubscribeProfiles();
        unsubscribeEvents();
        unsubscribeJobs();
        unsubscribeAnn();
      };
    } catch (err) {
      console.warn('Firestore real-time sync note:', err);
    }
  }, []);

  const handleInlineVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineVerifyInput.trim()) return;
    const cleanQuery = inlineVerifyInput.trim().toUpperCase();
    const found = profiles.find(p => 
      p.alumniId.toUpperCase() === cleanQuery ||
      (p.studentId && p.studentId.toUpperCase() === cleanQuery) ||
      p.fullName.toLowerCase().includes(inlineVerifyInput.toLowerCase().trim())
    );
    if (found) {
      setInlineVerifyResult(found);
    } else {
      setInlineVerifyResult('not_found');
    }
  };

  const navGroups = [
    {
      groupTitle: currentT.group1,
      items: [
        { id: 'about' as AlumniPortalTab, label: currentT.tabAbout, enLabel: 'About Association', icon: Landmark },
        { id: 'directory' as AlumniPortalTab, label: currentT.tabDirectory, enLabel: 'Directory', count: profiles.length, icon: Users },
        { id: 'committee' as AlumniPortalTab, label: currentT.tabCommittee, enLabel: 'Leadership', icon: Award },
        { id: 'chapters' as AlumniPortalTab, label: currentT.tabChapters, enLabel: 'Global Chapters', icon: Globe },
      ]
    },
    {
      groupTitle: currentT.group2,
      items: [
        { id: 'events' as AlumniPortalTab, label: currentT.tabEvents, enLabel: 'Events & Reunion', count: events.length, icon: Calendar },
        { id: 'jobs' as AlumniPortalTab, label: currentT.tabJobs, enLabel: 'Career & Jobs', count: jobs.length, icon: Briefcase },
        { id: 'mentorship' as AlumniPortalTab, label: currentT.tabMentorship, enLabel: 'Mentorship', icon: HeartHandshake },
        { id: 'stories' as AlumniPortalTab, label: currentT.tabStories, enLabel: 'Success Stories', icon: Star },
        { id: 'news' as AlumniPortalTab, label: currentT.tabNews, enLabel: 'News & Notices', count: announcements.length, icon: Bell },
      ]
    },
    {
      groupTitle: currentT.group3,
      items: [
        { id: 'verify' as AlumniPortalTab, label: currentT.tabVerify, enLabel: 'Verify Digital ID', icon: ShieldCheck },
        { id: 'constitution' as AlumniPortalTab, label: currentT.tabConstitution, enLabel: 'Constitution', icon: BookOpen },
        { id: 'contact' as AlumniPortalTab, label: currentT.tabContact, enLabel: 'Contact & Secretariat', icon: Mail },
      ]
    }
  ];

  const stats = [
    { label: currentT.statRegistered, value: `${profiles.length * 40}+`, icon: GraduationCap },
    { label: currentT.statBatches, value: '5 Batches', icon: Users },
    { label: currentT.statCountries, value: '18+ Countries', icon: Globe },
    { label: currentT.statMentors, value: `${profiles.filter(p => p.mentorshipOffer && p.mentorshipOffer.length > 0).length * 15}+`, icon: HeartHandshake },
  ];

  // Find active tab info
  const allItems = navGroups.flatMap(g => g.items);
  const currentActiveItem = allItems.find(i => i.id === activeTab) || allItems[0];

  return (
    <div className="w-full space-y-0">
      
      {/* 1. Full-Width Edge-to-Edge Hero Section with Background Image Support */}
      <section className="relative w-full overflow-hidden bg-[#064e3b] text-white border-b border-emerald-800">
        
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-105 transform transition-transform duration-1000"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=2400&q=80')` 
          }}
        />

        {/* Deep Islamic Green Radial & Linear Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b]/98 via-[#043e2f]/92 to-[#022c22]/98" />

        {/* Islamic Geometric Arabesque Pattern Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#fbbf24_1.5px,transparent_1.5px)] [background-size:24px_24px]" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentT.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-white tracking-tight leading-tight">
                {currentT.heroTitle}
              </h1>

              <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
                {currentT.heroSubtitle}
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {currentT.registerBtn}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('verify');
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-3.5 bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 border border-amber-400/40 font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                {currentT.verifyBtn}
              </button>

              <Link
                href={`/${locale}/login?redirect=dashboard/alumni_portal`}
                className="w-full sm:w-auto px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 border border-white/20 backdrop-blur-xs"
              >
                <Users className="w-4 h-4 text-emerald-300" />
                {currentT.portalLoginBtn}
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10 pt-8 border-t border-emerald-700/60">
            {stats.map((st, i) => (
              <div key={i} className="flex items-center gap-3.5 bg-emerald-950/30 p-3.5 sm:p-4 rounded-2xl border border-emerald-700/40">
                <div className="w-11 h-11 rounded-xl bg-emerald-900/90 border border-emerald-600/50 flex items-center justify-center text-amber-300 shrink-0 shadow-xs">
                  <st.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold font-serif text-white">{st.value}</p>
                  <p className="text-xs text-emerald-200/90 font-medium">{st.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Portal Layout with Dedicated Sidebar & Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Mobile Sticky Quick Navigation Bar */}
        <div className="lg:hidden mb-6 sticky top-16 z-30 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex-1 px-3.5 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Menu className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="truncate flex items-center gap-1.5">
                <currentActiveItem.icon className="w-3.5 h-3.5 text-amber-300" />
                {currentActiveItem.label}
              </span>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold shrink-0">
              {currentT.openMenu}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('verify');
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-emerald-900 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1 shrink-0 cursor-pointer"
            title={currentT.verifyBtn}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">{currentT.verifyBtn}</span>
          </button>
        </div>

        {/* Mobile Slide-Over Navigation Drawer */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
            {/* Backdrop Overlay */}
            <div 
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            {/* Slide-in Panel */}
            <div className="fixed inset-y-0 left-0 w-[86vw] max-w-sm bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-300">
              
              {/* Drawer Header */}
              <div className="p-4 bg-[#064e3b] text-white flex items-center justify-between border-b border-emerald-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-900 border border-emerald-700 flex items-center justify-center text-amber-300">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white font-serif">{currentT.drawerTitle}</h3>
                    <p className="text-[10px] text-emerald-200">{currentT.drawerSubtitle}</p>
                  </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white transition-colors cursor-pointer"
                  title={currentT.close}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              </div>

              {/* Drawer Navigation List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {navGroups.map((grp, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                      {grp.groupTitle}
                    </p>
                    <div className="space-y-1">
                      {grp.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.id);
                              setIsMobileDrawerOpen(false);
                              window.scrollTo({ top: 380, behavior: 'smooth' });
                            }}
                            className={`w-full px-3.5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between text-left cursor-pointer ${
                              isActive
                                ? 'bg-[#064e3b] text-amber-300 shadow-xs border-l-4 border-amber-400'
                                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.count !== undefined && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                isActive ? 'bg-emerald-950/80 text-amber-300' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer Secretariat / Registration */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    setIsRegisterOpen(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {currentT.applyMembership}
                </button>
                <div className="text-[11px] text-slate-500 text-center">
                  {currentT.helpdeskLabel} <span className="font-semibold text-slate-700">alumni@asdri.edu.bd</span>
                </div>
              </div>

            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Desktop Left Sidebar (Collapsible & Expandable) */}
          <aside className={`hidden lg:block shrink-0 sticky top-24 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'w-[72px]' : 'w-72 xl:w-80'
          }`}>
            
            {/* When Expanded */}
            {!isSidebarCollapsed ? (
              <div className="space-y-6">
                
                {/* Navigation Card */}
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-6">
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 font-serif">{currentT.sidebarNav}</h3>
                        <p className="text-[10px] text-slate-500 font-medium">{currentT.sidebarSub}</p>
                      </div>
                    </div>

                    {/* Collapse Button */}
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(true)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title={currentT.collapseTip}
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Grouped Nav Items */}
                  <div className="space-y-5">
                    {navGroups.map((grp, gIdx) => (
                      <div key={gIdx} className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                          {grp.groupTitle}
                        </p>
                        <div className="space-y-1">
                          {grp.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab(item.id);
                                  window.scrollTo({ top: 380, behavior: 'smooth' });
                                }}
                                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between text-left cursor-pointer ${
                                  isActive
                                    ? 'bg-[#064e3b] text-amber-300 shadow-sm border-l-4 border-amber-400'
                                    : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                {item.count !== undefined && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                                    isActive ? 'bg-emerald-950/80 text-amber-300' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {item.count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Quick Contact & Secretariat Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white shadow-xs space-y-4 border border-slate-700/80">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{currentT.helpdeskTitle}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {currentT.helpdeskDesc}
                  </p>
                  <div className="space-y-1.5 text-xs text-slate-200">
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">alumni@asdri.edu.bd</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>+880 1805-437910</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRegisterOpen(true)}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {currentT.applyMembership}
                  </button>
                </div>

              </div>
            ) : (
              /* When Collapsed (Slim Icon-Rail for Maximum Portal Canvas Width) */
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-2 py-3 flex flex-col items-center space-y-2">
                
                {/* Expand Button */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(false)}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] flex items-center justify-center transition-all cursor-pointer shadow-2xs mb-2"
                  title={currentT.expandTip}
                >
                  <PanelLeftOpen className="w-5 h-5 text-emerald-800" />
                </button>

                <div className="w-8 h-px bg-slate-200 my-1" />

                {/* Collapsed Icons */}
                {allItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        window.scrollTo({ top: 380, behavior: 'smooth' });
                      }}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all relative group cursor-pointer ${
                        isActive
                          ? 'bg-[#064e3b] text-amber-300 shadow-md ring-2 ring-amber-400/40'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                      title={`${item.label} (${item.enLabel})`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.count !== undefined && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-slate-950 rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs">
                          {item.count}
                        </span>
                      )}

                      {/* Tooltip on Hover */}
                      <span className="absolute left-14 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
                        {item.label}
                      </span>
                    </button>
                  );
                })}

              </div>
            )}

          </aside>

          {/* Right Content Area (Automatically Expands When Sidebar is Collapsed) */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            
            {/* View Breadcrumb / Title Bar with Collapse Toggle Button */}
            <div className="bg-white rounded-2xl border border-slate-200/80 px-4 sm:px-5 py-3.5 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs min-w-0">
                
                {/* Desktop Expand / Collapse Trigger */}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-bold transition-colors cursor-pointer shrink-0"
                  title={isSidebarCollapsed ? currentT.expandTip : currentT.collapseTip}
                >
                  {isSidebarCollapsed ? (
                    <>
                      <PanelLeftOpen className="w-3.5 h-3.5 text-emerald-700" />
                      <span className="text-[11px]">{currentT.showMenu}</span>
                    </>
                  ) : (
                    <>
                      <PanelLeftClose className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px]">{currentT.fullView}</span>
                    </>
                  )}
                </button>

                <span className="text-slate-400 hidden sm:inline">{currentT.portalBreadcrumb}</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <span className="font-bold text-[#064e3b] flex items-center gap-1.5 truncate">
                  <currentActiveItem.icon className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">{currentActiveItem.label}</span>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-medium text-slate-400 hidden md:inline">
                  {currentActiveItem.enLabel}
                </span>
                
                {/* Mobile Menu Trigger button */}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(true)}
                  className="lg:hidden p-1.5 rounded-lg bg-emerald-50 text-[#064e3b] font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Menu className="w-4 h-4 text-emerald-700" />
                  <span>{currentT.drawerTitle}</span>
                </button>
              </div>
            </div>

            {/* Tab Content Views */}
            <div className="transition-all duration-200">
              
              {/* 1. About Alumni Association */}
              {activeTab === 'about' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniAboutView onNavigateTab={(t) => setActiveTab(t as AlumniPortalTab)} />
                </div>
              )}

              {/* 2. Alumni Directory */}
              {activeTab === 'directory' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniDirectoryView alumniList={profiles} isLoggedInAlumni={false} />
                </div>
              )}

              {/* 3. Committee & Leadership */}
              {activeTab === 'committee' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniAssociationView initialSubTab="committee" />
                </div>
              )}

              {/* 4. Global Chapters */}
              {activeTab === 'chapters' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniAssociationView initialSubTab="chapters" />
                </div>
              )}

              {/* 5. Events & Reunion */}
              {activeTab === 'events' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniEventsView events={events} />
                </div>
              )}

              {/* 6. Career & Jobs */}
              {activeTab === 'jobs' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniJobBoardView jobs={jobs} />
                </div>
              )}

              {/* 7. Mentorship & Expertise */}
              {activeTab === 'mentorship' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniMentorshipView alumniList={profiles} />
                </div>
              )}

              {/* 8. Alumni Success Stories */}
              {activeTab === 'stories' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniSuccessStoriesView stories={stories} />
                </div>
              )}

              {/* 9. News & Announcements */}
              {activeTab === 'news' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniNewsView announcements={announcements} />
                </div>
              )}

              {/* 10. Verify Alumni ID */}
              {activeTab === 'verify' && (
                <div className="space-y-8 animate-in fade-in duration-200">
                  <div className="bg-gradient-to-r from-[#064e3b] via-[#043e2f] to-[#022c22] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden border border-emerald-800">
                    <div className="max-w-2xl space-y-3 relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-amber-300 text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Official Alumni Verification System</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                        {currentT.verifyTitle}
                      </h2>
                      <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                        {currentT.verifySubtitle}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Verification Form */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl mx-auto space-y-6">
                    <form onSubmit={handleInlineVerify} className="space-y-4">
                      <label className="text-xs font-bold text-slate-700 block">
                        {currentT.verifyFormLabel}
                      </label>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                          <QrCode className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder={currentT.verifyPlaceholder}
                            value={inlineVerifyInput}
                            onChange={(e) => setInlineVerifyInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#064e3b] hover:bg-emerald-900 text-amber-300 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                        >
                          <Search className="w-4 h-4" />
                          {currentT.verifyAction}
                        </button>
                      </div>
                    </form>

                    {/* Result Preview */}
                    {inlineVerifyResult === 'not_found' && (
                      <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-in fade-in">
                        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                          ✕
                        </div>
                        <div>
                          <p className="font-bold">{currentT.notFoundTitle}</p>
                          <p className="text-rose-600 mt-0.5">{currentT.notFoundDesc}</p>
                        </div>
                      </div>
                    )}

                    {inlineVerifyResult && inlineVerifyResult !== 'not_found' && (
                      <div className="p-6 rounded-3xl bg-emerald-50/80 border border-emerald-300 text-slate-900 space-y-4 animate-in fade-in">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300 w-fit">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span>{currentT.officialMember}</span>
                        </div>

                        <div className="flex items-start gap-4">
                          <img
                            src={inlineVerifyResult.photoUrl}
                            alt={inlineVerifyResult.fullName}
                            className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-300 shadow-xs shrink-0"
                          />
                          <div className="space-y-1">
                            <h3 className="text-lg font-bold font-serif text-slate-900">{inlineVerifyResult.fullName}</h3>
                            <p className="text-xs text-emerald-800 font-semibold">{inlineVerifyResult.profession}</p>
                            <p className="text-xs text-slate-600">{inlineVerifyResult.organization}</p>
                            <div className="flex flex-wrap gap-2 pt-1">
                              <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-emerald-900 font-bold">
                                {inlineVerifyResult.alumniId}
                              </span>
                              <span className="text-[11px] bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-medium">
                                {inlineVerifyResult.batch} • {inlineVerifyResult.program}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-emerald-200 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveVerifyId(inlineVerifyResult.alumniId);
                              setIsVerifyOpen(true);
                            }}
                            className="text-xs font-bold text-[#064e3b] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            {currentT.viewFullCard} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Sample QR Scan Guidance */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        {currentT.qrTitle}
                      </p>
                      <p>
                        {currentT.qrDesc}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 11. Constitution & Membership */}
              {activeTab === 'constitution' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniAssociationView initialSubTab="constitution" />
                </div>
              )}

              {/* 12. Contact */}
              {activeTab === 'contact' && (
                <div className="animate-in fade-in duration-200">
                  <AlumniContactView />
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Modals */}
      <AlumniRegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />

      <AlumniDigitalVerificationModal
        isOpen={isVerifyOpen}
        initialId={activeVerifyId}
        localList={profiles}
        onClose={() => {
          setIsVerifyOpen(false);
          setActiveVerifyId('');
        }}
      />

    </div>
  );
}