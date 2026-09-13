'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RenderIcon } from '@/lib/iconMap';
import { Locale } from '@/lib/dictionary';
import { 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  FileCheck, 
  HelpCircle, 
  Phone, 
  Mail, 
  Clock, 
  Calendar, 
  Sparkles, 
  Download, 
  ChevronDown, 
  Award, 
  Globe2, 
  Check,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

interface AdmissionPageContentProps {
  locale: Locale;
}

export function AdmissionPageContent({ locale }: AdmissionPageContentProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [dbData, setDbData] = useState<any | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'site_pages', 'admission'), (snap) => {
      if (snap.exists()) {
        setDbData(snap.data());
      }
    }, (err) => console.error('Error listening to admission site_pages:', err));
    return () => unsub();
  }, []);

  const renderDynamicIcon = (icon: any, className: string = 'w-5 h-5', FallbackIcon: any = Sparkles) => {
    if (typeof icon === 'string') {
      return <RenderIcon name={icon} className={className} />;
    }
    if (icon) {
      const Comp = icon;
      return <Comp className={className} />;
    }
    return <FallbackIcon className={className} />;
  };

  const t = {
    bn: {
      sessionBadge: 'শিক্ষা বর্ষ ২০২৫-২০২৬ | ভর্তি আবেদন চলছে',
      stats: [
        { label: 'শিক্ষাক্রম ধরণ', value: 'অন-ক্যাম্পাস ও অনলাইন', icon: Globe2 },
        { label: 'সার্টিফিকেশন', value: 'প্রামাণ্য সনদ ও ডিপ্লোমা', icon: Award },
        { label: 'আবেদন প্রক্রিয়াকরণ', value: '২-৪ কার্যদিবস', icon: Clock },
        { label: 'স্কলারশিপ সুবিধা', value: 'মেধাবী ও যোগ্যদের জন্য', icon: GraduationCap },
      ],
      processTitle: 'ভর্তি প্রক্রিয়ার ৪টি ধাপ',
      processSubtitle: 'আমাদের সহজ, ডিজিটাল ও স্বচ্ছ ভর্তি পদ্ধতির মাধ্যমে মাত্র কয়েকটি পদক্ষেপে আপনার কাঙ্ক্ষিত প্রোগ্রামে ভর্তি সম্পন্ন করুন।',
      steps: [
        {
          step: '০১',
          badge: 'ধাপ ১: পোর্টাল নিবন্ধন',
          title: 'অনলাইন অ্যাকাউন্ট তৈরি',
          desc: 'আমাদের ডিজিটাল স্টুডেন্ট পোর্টালে ইমেইল ও নাম দিয়ে একটি নিরাপদ অ্যাকাউন্ট তৈরি করে আবেদন শুরু করুন।',
          duration: 'সময়: ৩-৫ মিনিট',
          icon: UserPlus,
          color: 'from-amber-500/20 to-amber-500/5 text-amber-800 border-amber-300',
          iconBg: 'bg-amber-500 text-slate-950',
          points: ['সহজ ইমেইল বা গুগল সাইন-আপ', 'ব্যক্তিগত আবেদন ড্যাশবোর্ড অ্যাক্সেস', 'যেকোনো সময় ড্রাফট সংরক্ষণ']
        },
        {
          step: '০২',
          badge: 'ধাপ ২: তথ্য ও ডকুমেন্ট সাবমিশন',
          title: 'আবেদনপত্র ও সনদ জমাদান',
          desc: 'আপনার পছন্দের প্রোগ্রাম নির্বাচন করে ব্যক্তিগত তথ্য, শিক্ষাগত যোগ্যতার বিবরণ এবং প্রয়োজনীয় সনদের স্ক্যান কপি আপলোড করুন।',
          duration: 'সময়: ১০-১৫ মিনিট',
          icon: FileText,
          color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-800 border-emerald-300',
          iconBg: 'bg-emerald-600 text-white',
          points: ['প্রোগ্রাম ও শিডিউল নির্বাচন', 'শিক্ষাগত ট্রান্সক্রিপ্ট ও সনদ আপলোড', 'পাসপোর্ট সাইজ ছবি ও এনআইডি সংযুক্তি']
        },
        {
          step: '০৩',
          badge: 'ধাপ ৩: একাডেমিক যাচাই ও ভাইভা',
          title: 'বোর্ড রিভিউ ও মৌখিক সাক্ষাৎকার',
          desc: 'একাডেমিক মূল্যায়ন বোর্ড আপনার আবেদন যাচাই করবে। নির্বাচিত প্রার্থীদের নির্ধারিত সময়ে সংক্ষিপ্ত মৌখিক সাক্ষাৎকার (ভাইভা) নেওয়া হবে।',
          duration: 'সময়: ২-৩ কার্যদিবস',
          icon: CheckCircle2,
          color: 'from-teal-500/20 to-teal-500/5 text-teal-800 border-teal-300',
          iconBg: 'bg-teal-600 text-white',
          points: ['যোগ্যতা ও পূর্ববর্তী ব্যাকগ্রাউন্ড যাচাই', 'অনলাইন/সরাসরি ভাইভা নোটিফিকেশন', 'বিষয়ভিত্তিক প্রাথমিক জ্ঞান মূল্যায়ন']
        },
        {
          step: '০৪',
          badge: 'ধাপ ৪: চূড়ান্ত ভর্তি ও আসন নিশ্চিতকরণ',
          title: 'ফি প্রদান ও রোল/আইডি প্রদান',
          desc: 'মৌখিক পরীক্ষায় উত্তীর্ণ প্রার্থীদের চূড়ান্ত তালিকা প্রকাশ করা হবে। নির্ধারিত ভর্তি ফি পরিশোধ করলেই আপনার আসন ও স্টুডেন্ট আইডি নিশ্চিত হবে।',
          duration: 'তাত্ক্ষণিক কনফার্মেশন',
          icon: CreditCard,
          color: 'from-blue-500/20 to-blue-500/5 text-blue-800 border-blue-300',
          iconBg: 'bg-[#064e3b] text-amber-300',
          points: ['নিরাপদ ডিজিটাল ফি পেমেন্ট গেটওয়ে', 'ডিজিটাল আইডি ও ক্লাস রুটিন প্রদান', 'স্টুডেন্ট এলএমএস পোর্টাল অ্যাক্টিভেশন']
        }
      ],
      reqTitle: 'ভর্তির সাধারণ যোগ্যতা ও শর্তাবলী',
      reqSubtitle: 'আস-সুন্নাহ ইনস্টিটিউটে ভর্তির আবেদনের পূর্বে প্রার্থীর নিচের আবশ্যকীয় বিষয়সমূহ নিশ্চিত করতে হবে।',
      requirements: [
        {
          category: 'আকিদা ও ধর্মীয় অনুশীলন',
          badge: 'আবশ্যকীয় ধর্মীয় শর্ত',
          title: 'অনুশীলনকারী মুসলিম হওয়া',
          desc: 'কুরআন ও সুন্নাহর বিশুদ্ধ আদর্শে বিশ্বাসী এবং দৈনন্দিন জীবনে ইসলামের ফরজ ও ওয়াজিবসমূহ আন্তরিকভাবে পালনকারী হওয়া আবশ্যক।',
          icon: ShieldCheck
        },
        {
          category: 'শিক্ষাগত পটভূমি',
          badge: 'একাডেমিক পূর্বশর্ত',
          title: 'ন্যূনতম শিক্ষাগত যোগ্যতা',
          desc: 'প্রোগ্রামভেদে নির্ধারিত একাডেমিক যোগ্যতা (যেমন: দাখিল/এসএসসি/আলীম/এইচএসসি বা কওমি মাদরাসা বোর্ড সমমান সনদ) থাকতে হবে।',
          icon: GraduationCap
        },
        {
          category: 'কুরআন তিলাওয়াত মান',
          badge: 'মৌলিক দক্ষতা',
          title: 'তাজবীদসহ বিশুদ্ধ কুরআন তিলাওয়াত',
          desc: 'অধিকাংশ উচ্চতর ও দাওয়াহ কোর্সের জন্য মৌলিক সহিহ-শুদ্ধ কুরআন তিলাওয়াত করার সামর্থ্য থাকা বাঞ্ছনীয়।',
          icon: BookOpen
        },
        {
          category: 'নিয়মানুবর্তিতা ও উপস্থিতি',
          badge: 'শৃঙ্খলা সংক্রান্ত অঙ্গীকার',
          title: '৮০% ক্লাসে নিয়মিত উপস্থিতির অঙ্গীকার',
          desc: 'লাইভ অনলাইন বা আবাসিক ক্লাসের ক্ষেত্রে ক্লাসের ন্যূনতম ৮০% উপস্থিতি বজায় রাখার আন্তরিক মানসিকতা ও প্রতিশ্রুতি দিতে হবে।',
          icon: FileCheck
        }
      ],
      docsTitle: 'আবেদনের প্রয়োজনীয় ডকুমেন্টস চেকলিস্ট',
      docsSubtitle: 'অনলাইনে ফর্ম পূরণের পূর্বে নিচের কাগজপত্রগুলোর সফটকপি (PDF বা JPG) প্রস্তুত রাখুন:',
      docs: [
        { title: 'পাসপোর্ট সাইজ রঙিন ছবি', desc: 'সাম্প্রতিক স্পষ্ট তোলা ২ কপি ডিজিটাল ছবি (সর্বোচ্চ ২ MB)', tag: 'JPG/PNG' },
        { title: 'জাতীয় পরিচয়পত্র / জন্মসনদ', desc: 'প্রার্থীর NID বা অনলাইন জন্মনিবন্ধন সনদের স্পষ্ট স্ক্যান কপি', tag: 'PDF/JPG' },
        { title: 'পূর্ববর্তী শিক্ষাগত সনদ ও মার্কশিট', desc: 'সর্বশেষ অর্জিত ডিগ্রি/পরীক্ষার প্রশংসাপত্র ও ট্রান্সক্রিপ্ট', tag: 'PDF' },
        { title: 'অভিভাবক/উস্তাযের সুপারিশপত্র (প্রযোজ্য ক্ষেত্রে)', desc: 'উচ্চতর গবেষণা বা বিশেষ আবাসিক কোর্সের ক্ষেত্রে সুপারিশপত্র', tag: 'ঐচ্ছিক/প্রয়োজনীয়' },
      ],
      ctaCard: {
        badge: 'ভর্তি হেল্পলাইন ও পরামর্শ',
        title: 'ভর্তির জন্য প্রস্তুত?',
        desc: 'আপনার কাঙ্ক্ষিত কোর্সে এখনই অনলাইনে আবেদন করুন। আমাদের ভর্তি শাখা দ্রুততম সময়ে আপনার আবেদন প্রক্রিয়াকরণ করবে।',
        btnText: 'অনলাইনে আবেদন শুরু করুন',
        prospectusBtn: 'ভর্তি প্রসপেক্টাস ডাউনলোড',
        helpTitle: 'ভর্তি বিষয়ে সরাসরি কথা বলুন',
        phone: '+৮৮০ ১৮০৫-৪৩৭৯১০',
        email: 'admission@asdri.edu.bd',
        hours: 'শনিবার - বৃহস্পতিবার: সকাল ৯:০০ - বিকাল ৫:০০'
      },
      faqTitle: 'সাধারণ জিজ্ঞাসাসমূহ (FAQ)',
      faqSubtitle: 'ভর্তি সংক্রান্ত যেকোনো প্রশ্নের দ্রুত উত্তর জেনে নিন',
      faqs: [
        {
          q: 'আমি কি চাকরি বা অন্য পড়াশোনার পাশাপাশি অনলাইন কোর্সে অংশ নিতে পারব?',
          a: 'হ্যাঁ, আমাদের বেশ কিছু উচ্চতর দাওয়াহ ও সান্ধ্যকালীন ডিপ্লোমা কোর্স কর্মজীবী ও সাধারণ বিশ্ববিদ্যালয়ের শিক্ষার্থীদের সুবিধার্থে সান্ধ্যকালীন ও সাপ্তাহিক ছুটির দিনে পরিচালিত হয়।'
        },
        {
          q: 'ভর্তি ফি প্রদানের মাধ্যম কী কী?',
          a: 'আবেদনকারী বিকাশ (bKash), নগদ (Nagad), রকেট কিংবা যেকোনো ব্যাংকের ডেবিট/ক্রেডিট কার্ডের মাধ্যমে তাৎক্ষণিক ও নিরাপদে ভর্তি ফি পরিশোধ করতে পারবেন।'
        },
        {
          q: 'মৌখিক সাক্ষাৎকার (ভাইভা) কি অনলাইনে হবে নাকি সশরীরে?',
          a: 'অনলাইন প্রোগ্রামগুলোর জন্য ভাইভা গুগল মিট/জুমে অনলাইনে নেওয়া হয়। অন-ক্যাম্পাস বা আবাসিক শিক্ষার্থীদের ক্যাম্পাসে উপস্থিত হয়ে ভাইভা দেওয়ার সুযোগ রয়েছে।'
        },
        {
          q: 'মেধাবী ও অসচ্ছল শিক্ষার্থীদের জন্য কোনো স্কলারশিপ সুবিধা আছে কি?',
          a: 'হ্যাঁ, প্রতি সেমিস্টারে অস্বচ্ছল কিন্তু অত্যন্ত প্রতিভাবান ও কুরআন-সুন্নাহ গবেষণায় নিবেদিত শিক্ষার্থীদের জন্য বিশেষ স্কলারশিপ ও ফি মওকুফের ব্যবস্থা রয়েছে।'
        }
      ]
    },
    en: {
      sessionBadge: 'Academic Session 2025-2026 | Applications Now Open',
      stats: [
        { label: 'Delivery Mode', value: 'On-Campus & Live Online', icon: Globe2 },
        { label: 'Certification', value: 'Verified Diploma & Sanad', icon: Award },
        { label: 'Processing Time', value: '2-4 Working Days', icon: Clock },
        { label: 'Scholarships', value: 'Merit & Need-Based Aid', icon: GraduationCap },
      ],
      processTitle: 'The 4-Step Admission Roadmap',
      processSubtitle: 'Follow our structured, transparent digital admissions pathway to enroll in your desired academic and research program.',
      steps: [
        {
          step: '01',
          badge: 'Stage 1: Portal Setup',
          title: 'Create Your Student Account',
          desc: 'Register securely on our digital portal using your name and email to access your centralized application hub.',
          duration: 'Est. 3-5 Mins',
          icon: UserPlus,
          color: 'from-amber-500/20 to-amber-500/5 text-amber-800 border-amber-300',
          iconBg: 'bg-amber-500 text-slate-950',
          points: ['Simple email or Google authentication', 'Dedicated applicant dashboard access', 'Save draft application anytime']
        },
        {
          step: '02',
          badge: 'Stage 2: Form & Credentials',
          title: 'Submit Application & Documents',
          desc: 'Select your program, provide personal and academic information, and upload scanned copies of requisite certifications.',
          duration: 'Est. 10-15 Mins',
          icon: FileText,
          color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-800 border-emerald-300',
          iconBg: 'bg-emerald-600 text-white',
          points: ['Program and preferred shift selection', 'Upload educational transcripts & degrees', 'Attach passport photo & National ID']
        },
        {
          step: '03',
          badge: 'Stage 3: Board Review & Viva',
          title: 'Academic Screening & Interview',
          desc: 'Our academic board evaluates your submission. Shortlisted candidates are scheduled for an oral assessment (Viva Voce).',
          duration: '2-3 Business Days',
          icon: CheckCircle2,
          color: 'from-teal-500/20 to-teal-500/5 text-teal-800 border-teal-300',
          iconBg: 'bg-teal-600 text-white',
          points: ['Verification of academic prerequisites', 'Online / in-person viva notification', 'Subject knowledge & aptitude review']
        },
        {
          step: '04',
          badge: 'Stage 4: Enrollment & Seat Confirmation',
          title: 'Fee Payment & Official Registration',
          desc: 'Upon selection, complete your enrollment fee payment to secure your seat and receive your official Student ID and LMS credentials.',
          duration: 'Instant Confirmation',
          icon: CreditCard,
          color: 'from-blue-500/20 to-blue-500/5 text-blue-800 border-blue-300',
          iconBg: 'bg-[#064e3b] text-amber-300',
          points: ['Secure digital payment gateway', 'Official student ID & class schedule', 'Access to online LMS & digital library']
        }
      ],
      reqTitle: 'General Admission Criteria & Eligibility',
      reqSubtitle: 'Please review the institutional criteria and prerequisites prior to submitting your formal application.',
      requirements: [
        {
          category: 'Faith & Ethics',
          badge: 'Core Religious Standard',
          title: 'Practicing Muslim Adherence',
          desc: 'Applicants must adhere to authentic Islamic tenets based on the Quran and Sunnah and exhibit high moral character and personal integrity.',
          icon: ShieldCheck
        },
        {
          category: 'Academic Background',
          badge: 'Prerequisites',
          title: 'Minimum Academic Credentials',
          desc: 'Candidates must hold relevant prior education (such as Dakhil/SSC/Alim/HSC or recognized Islamic seminary certificates) appropriate for the program.',
          icon: GraduationCap
        },
        {
          category: 'Quranic Recitation',
          badge: 'Core Competency',
          title: 'Quran Reading with Tajweed',
          desc: 'A foundational competency to recite the Holy Quran with proper Tajweed rules is required for all advanced research and Dawah programs.',
          icon: BookOpen
        },
        {
          category: 'Discipline & Attendance',
          badge: 'Mandatory Commitment',
          title: 'Minimum 80% Class Attendance',
          desc: 'Enrolled students must commit to attending at least 80% of scheduled lectures (for both on-campus and interactive live online sessions).',
          icon: FileCheck
        }
      ],
      docsTitle: 'Required Application Documents Checklist',
      docsSubtitle: 'Please keep clear digital scans (PDF or JPG format) ready before beginning the online submission:',
      docs: [
        { title: 'Passport-Sized Color Photographs', desc: '2 recently taken passport photographs with clean background (Max 2MB)', tag: 'JPG/PNG' },
        { title: 'National ID / Birth Certificate', desc: 'Legible scanned copy of applicant National ID card or Birth Registration', tag: 'PDF/JPG' },
        { title: 'Academic Certificates & Transcripts', desc: 'Previous academic certificates, marks sheets, or Alim/Dakhil certifications', tag: 'PDF' },
        { title: 'Recommendation / Tazkiyah Letter', desc: 'From a respected Islamic scholar, teacher, or local Masjid Imam (if applicable)', tag: 'Optional/Required' },
      ],
      ctaCard: {
        badge: 'Admissions Secretariat & Support',
        title: 'Ready to Begin Your Studies?',
        desc: 'Submit your online application today. Our academic admissions officers will guide you through every step of enrollment.',
        btnText: 'Start Online Application',
        prospectusBtn: 'Download Prospectus (PDF)',
        helpTitle: 'Need Admission Guidance?',
        phone: '+880 1805-437910',
        email: 'admission@asdri.edu.bd',
        hours: 'Saturday – Thursday: 9:00 AM – 5:00 PM BST'
      },
      faqTitle: 'Frequently Asked Questions',
      faqSubtitle: 'Find instant answers to common questions about enrollment, interviews, and payments.',
      faqs: [
        {
          q: 'Can I study online while maintaining my job or university studies?',
          a: 'Yes, ASDRI provides flexible evening and weekend cohorts specifically tailored for working professionals and university students.'
        },
        {
          q: 'What payment methods are supported for admission fees?',
          a: 'We support all major local and international payment methods including bKash, Nagad, Rocket, Visa, MasterCard, and direct bank transfers.'
        },
        {
          q: 'Is the oral assessment (Viva Voce) conducted online or on-campus?',
          a: 'For online cohorts, interviews are conducted remotely via Zoom or Google Meet. On-campus applicants may choose an in-person interview.'
        },
        {
          q: 'Are financial aid or merit scholarships available?',
          a: 'Yes, ASDRI offers need-based and merit-based tuition waivers for deserving students and dedicated researchers of Islamic sciences.'
        }
      ]
    },
    ar: {
      sessionBadge: 'العام الأكاديمي ٢٠٢٥-٢٠٢٦ | باب القبول والتسجيل مفتوح',
      stats: [
        { label: 'طبيعة الدراسة', value: 'حضوري وعبر الإنترنت', icon: Globe2 },
        { label: 'الشهادات', value: 'إجازات ودبلومات معتمدة', icon: Award },
        { label: 'معالجة الطلب', value: '٢-٤ أيام عمل', icon: Clock },
        { label: 'المنح الدراسية', value: 'للمتفوقين والمستحقين', icon: GraduationCap },
      ],
      processTitle: 'مراحل القبول والتسجيل الأربع',
      processSubtitle: 'اتبع خطواتنا الرقمية الميسرة لإتمام التسجيل في برامجنا الأكاديمية والبحثية.',
      steps: [
        {
          step: '٠١',
          badge: 'المرحلة الأولى: التسجيل',
          title: 'إنشاء حساب الطالب',
          desc: 'سجل حسابك في البوابة الرقمية باستخدام البريد الإلكتروني لبدء تعبئة طلب الالتحاق.',
          duration: 'الوقت: ٣-٥ دقائق',
          icon: UserPlus,
          color: 'from-amber-500/20 to-amber-500/5 text-amber-800 border-amber-300',
          iconBg: 'bg-amber-500 text-slate-950',
          points: ['تسجيل سلس عبر البريد أو Google', 'الوصول إلى لوحة تحكم المتقدم', 'إمكانية حفظ الطلب كمسودة']
        },
        {
          step: '٠٢',
          badge: 'المرحلة الثانية: المستندات',
          title: 'تقديم الطلب والوثائق',
          desc: 'اختر البرنامج المناسب، واملأ البيانات الشخصية، وارفع الوثائق والمؤهلات الأكاديمية المطلوبة.',
          duration: 'الوقت: ١٠-١٥ دقيقة',
          icon: FileText,
          color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-800 border-emerald-300',
          iconBg: 'bg-emerald-600 text-white',
          points: ['تحديد البرنامج والفترة المناسبة', 'رفع كشوف الدرجات والشهادات', 'إرفاق الصورة الشخصية والهوية']
        },
        {
          step: '٠٣',
          badge: 'المرحلة الثالثة: التقييم والمقابلة',
          title: 'مراجعة الهيئة والمقابلة الشفهية',
          desc: 'تقوم الهيئة الأكاديمية بمراجعة الطلبات ودعوة المرشحين للمقابلة الشفهية لتحديد المستوى.',
          duration: '٢-٣ أيام عمل',
          icon: CheckCircle2,
          color: 'from-teal-500/20 to-teal-500/5 text-teal-800 border-teal-300',
          iconBg: 'bg-teal-600 text-white',
          points: ['التحقق من الشروط الأكاديمية', 'إشعار بموعد المقابلة عبر الإنترنت أو حضورياً', 'تقييم المعارف الشرعية الأساسية']
        },
        {
          step: '٠٤',
          badge: 'المرحلة الرابعة: القبول النهائي',
          title: 'سداد الرسوم وتثبيت المقعد',
          desc: 'بعد اجتياز المقابلة، يتم سداد الرسوم الدراسية لإصدار الرقم الأكاديمي والبطاقة الطلابية.',
          duration: 'تأكيد فوري',
          icon: CreditCard,
          color: 'from-blue-500/20 to-blue-500/5 text-blue-800 border-blue-300',
          iconBg: 'bg-[#064e3b] text-amber-300',
          points: ['بوابة دفع إلكتروني آمنة', 'استلام الرقم الأكاديمي والجدول', 'تفعيل حساب المنصة التعليمية LMS']
        }
      ],
      reqTitle: 'شروط القبول والمعايير العامة',
      reqSubtitle: 'يرجى مراجعة المتطلبات الأساسية قبل تقديم طلب الالتحاق الرسمي بالمعهد.',
      requirements: [
        {
          category: 'العقيدة والسلوك',
          badge: 'المعيار الشرعي',
          title: 'الالتزام بأحكام الشريعة',
          desc: 'أن يكون المتقدم مسلماً ملتزماً بتعاليم الكتاب والسنة، متصفاً بالأخلاق الإسلامية الفاضلة.',
          icon: ShieldCheck
        },
        {
          category: 'المؤهل الدراسي',
          badge: 'المتطلب الأكاديمي',
          title: 'الحد الأدنى من المؤهلات',
          desc: 'حصول المتقدم على المؤهل العلمي المناسب للبرنامج المطلوب (شهادة الثانوية أو ما يعادلها أو الشهادات الشرعية).',
          icon: GraduationCap
        },
        {
          category: 'تلاوة القرآن الكريم',
          badge: 'المهارة الأساسية',
          title: 'إتقان التلاوة بالتجويد',
          desc: 'القدرة على تلاوة القرآن الكريم تلاوة صحيحة بأحكام التجويد للبرامج الشرعية والدعوية المتقدمة.',
          icon: BookOpen
        },
        {
          category: 'الانضباط والحضور',
          badge: 'تعهد الالتزام',
          title: 'نسبة حضور لا تقل عن ٨٠٪',
          desc: 'الالتزام بحضور ما لا يقل عن ٨٠٪ من المحاضرات المقررة حضورياً أو عبر البث المباشر التفاعلي.',
          icon: FileCheck
        }
      ],
      docsTitle: 'قائمة المستندات المطلوبة للتقديم',
      docsSubtitle: 'يرجى تجهيز نسخ إلكترونية واضحة (PDF أو JPG) قبل تعبئة استمارة التسجيل:',
      docs: [
        { title: 'صور شخصية ملونة', desc: 'عدد ٢ صورة شخصية حديثة بخلفية بيضاء (أقصى حجم ٢ ميغابايت)', tag: 'JPG/PNG' },
        { title: 'الهوية الوطنية / شهادة الميلاد', desc: 'نسخة واضحة من بطاقة الهوية الوطنية أو شهادة الميلاد الرسمية', tag: 'PDF/JPG' },
        { title: 'الشهادات الدراسية وكشوف الدرجات', desc: 'صورة طبق الأصل من آخر مؤهل علمي معتمد تم الحصول عليه', tag: 'PDF' },
        { title: 'خطاب تزكية / توصية علمية (إن وجد)', desc: 'تزكية من أحد العلماء أو الأساتذة المعتمدين (للدراسات العليا)', tag: 'اختياري/مطلوب' },
      ],
      ctaCard: {
        badge: 'أمانة القبول والتسجيل',
        title: 'هل أنت مستعد لبدء مسيرتك العلمية؟',
        desc: 'قدم طلبك الآن عبر البوابة الإلكترونية. سيتولى مسؤولو القبول والتسجيل متابعة طلبك وتقديم المساعدة.',
        btnText: 'بدء التسجيل الإلكتروني',
        prospectusBtn: 'تحميل دليل القبول (PDF)',
        helpTitle: 'هل تحتاج إلى استشارة أو مساعدة؟',
        phone: '+880 1805-437910',
        email: 'admission@asdri.edu.bd',
        hours: 'السبت - الخميس: ٩:٠٠ صباحاً - ٥:٠٠ مساءً'
      },
      faqTitle: 'الأسئلة الشائعة حول القبول',
      faqSubtitle: 'إجابات مباشرة على أكثر الاستفسارات تكراراً حول البرامج والرسوم والمقابلات.',
      faqs: [
        {
          q: 'هل يمكنني الدراسة عن بعد بالتزامن مع عملي أو دراستي الجامعية؟',
          a: 'نعم، يوفر المعهد فترات مسائية وبرامج في عطلة نهاية الأسبوع مخصصة للموظفين وطلاب الجامعات.'
        },
        {
          q: 'ما هي طرق الدفع المتاحة لسداد الرسوم الدراسية؟',
          a: 'تتوفر خيارات الدفع الإلكتروني عبر بطاقات فيزا وماستركارد بالإضافة إلى وسائل الدفع الرقمية المعتمدة.'
        },
        {
          q: 'هل المقابلة الشفهية تجرى عن بعد أم في مقر المعهد؟',
          a: 'للبرامج عبر الإنترنت، تجرى المقابلة عبر منصة Zoom أو Google Meet. أما البرامج الحضورية فيمكن الحضور للمعهد.'
        },
        {
          q: 'هل توجد منح دراسية أو إعفاءات من الرسوم؟',
          a: 'نعم، يقدم المعهد منحاً دراسية وإعفاءات جزئية أو كلية للطلاب المتميزين وذوي الحاجة المادية.'
        }
      ]
    }
  };

  const base = t[locale] || t.en;

  const defaultStepStyles = [
    { iconBg: 'bg-amber-500 text-slate-950', color: 'from-amber-500/20 to-amber-500/5 text-amber-800 border-amber-300' },
    { iconBg: 'bg-emerald-600 text-white', color: 'from-emerald-500/20 to-emerald-500/5 text-emerald-800 border-emerald-300' },
    { iconBg: 'bg-teal-600 text-white', color: 'from-teal-500/20 to-teal-500/5 text-teal-800 border-teal-300' },
    { iconBg: 'bg-[#064e3b] text-amber-300', color: 'from-blue-500/20 to-blue-500/5 text-blue-800 border-blue-300' }
  ];

  const curr = {
    sessionBadge: dbData?.sessionBadge || base.sessionBadge,
    stats: (dbData?.stats && Array.isArray(dbData.stats) && dbData.stats.length > 0) ? dbData.stats : base.stats,
    processTitle: dbData?.processTitle || base.processTitle,
    processSubtitle: dbData?.processSubtitle || base.processSubtitle,
    steps: (dbData?.steps && Array.isArray(dbData.steps) && dbData.steps.length > 0) ? dbData.steps : base.steps,
    reqTitle: dbData?.reqTitle || base.reqTitle,
    reqSubtitle: dbData?.reqSubtitle || base.reqSubtitle,
    requirements: (dbData?.requirements && Array.isArray(dbData.requirements) && dbData.requirements.length > 0) ? dbData.requirements : base.requirements,
    docsTitle: dbData?.docsTitle || base.docsTitle,
    docsSubtitle: dbData?.docsSubtitle || base.docsSubtitle,
    docs: (dbData?.docs && Array.isArray(dbData.docs) && dbData.docs.length > 0) ? dbData.docs : base.docs,
    faqTitle: dbData?.faqTitle || base.faqTitle,
    faqSubtitle: dbData?.faqSubtitle || base.faqSubtitle,
    faqs: (dbData?.faqs && Array.isArray(dbData.faqs) && dbData.faqs.length > 0) ? dbData.faqs : base.faqs,
    ctaCard: dbData?.ctaCard ? { ...base.ctaCard, ...dbData.ctaCard } : base.ctaCard
  };

  return (
    <div className="space-y-16 sm:space-y-20">
      
      {/* 1. Admissions Quick Stats & Highlights Ribbon */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs border border-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#064e3b] text-xs font-bold shadow-2xs">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{curr.sessionBadge}</span>
          </div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>{locale === 'bn' ? 'সরাসরি আবেদন গ্রহণ চলছে' : locale === 'ar' ? 'التسجيل مفتوح حالياً' : 'Live Applications Active'}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-5">
          {curr.stats.map((st: any, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 shadow-2xs">
                {renderDynamicIcon(st.icon, 'w-5 h-5', Award)}
              </div>
              <div>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">{st.label}</p>
                <p className="text-xs sm:text-sm font-bold text-[#064e3b] mt-0.5 leading-tight">{st.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Main Grid: Process & Requirements on Left, Sticky Hub on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Column (8 Cols): Step Roadmap & Categorized Requirements */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* SECTION A: 4-Step Process Infographic Flow */}
          <section className="space-y-8" id="admission-process">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" />
                <span>{locale === 'bn' ? 'ধাপ অনুযায়ী নির্দেশিকা' : locale === 'ar' ? 'دليل الخطوات' : 'Sequential Roadmap'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
                {curr.processTitle}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {curr.processSubtitle}
              </p>
            </div>

            {/* Steps Graphical Grid with Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 relative">
              {curr.steps.map((step: any, idx: number) => {
                const style = defaultStepStyles[idx % defaultStepStyles.length];
                const iconBgClass = step.iconBg || style.iconBg;
                return (
                  <div 
                    key={idx}
                    className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
                  >
                    {/* Top Background Big Watermark Number */}
                    <div className="absolute top-3 right-4 rtl:right-auto rtl:left-4 text-5xl sm:text-6xl font-black text-slate-100/90 group-hover:text-emerald-100/60 transition-colors select-none font-serif">
                      {step.step || (idx + 1).toString().padStart(2, '0')}
                    </div>

                    <div className="relative z-10 space-y-4">
                      {/* Header with Icon & Stage Badge */}
                      <div className="flex items-center justify-between gap-3">
                        <div className={`w-12 h-12 rounded-xl ${iconBgClass} flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0`}>
                          {renderDynamicIcon(step.icon, 'w-6 h-6', UserPlus)}
                        </div>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
                          {step.badge}
                        </span>
                      </div>

                      {/* Step Title & Description */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 font-serif group-hover:text-[#064e3b] transition-colors leading-snug">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed font-sans">
                          {step.desc}
                        </p>
                      </div>

                      {/* Bullet Points Checklist */}
                      {step.points && step.points.length > 0 && (
                        <div className="pt-2 space-y-1.5 border-t border-slate-100">
                          {step.points.map((pt: string, pIdx: number) => (
                            <div key={pIdx} className="flex items-center gap-2 text-xs text-slate-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{pt}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Bottom Meta */}
                    <div className="relative z-10 mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {step.duration}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {locale === 'bn' ? `ধাপ ${idx + 1} / ${curr.steps.length}` : locale === 'ar' ? `خطوة ${idx + 1} من ${curr.steps.length}` : `Step ${idx + 1} of ${curr.steps.length}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION B: Categorized Requirements Matrix */}
          <section className="space-y-8" id="admission-requirements">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>{locale === 'bn' ? 'যোগ্যতা ও আবশ্যকতা' : locale === 'ar' ? 'الشروط الأكاديمية' : 'Eligibility & Criteria'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
                {curr.reqTitle}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                {curr.reqSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {curr.requirements.map((req: any, idx: number) => (
                <div 
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[#064e3b] flex items-center justify-center shrink-0">
                        {renderDynamicIcon(req.icon, 'w-5 h-5', ShieldCheck)}
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/80">
                        {req.badge}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                        {req.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 font-serif leading-snug">
                        {req.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {req.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{locale === 'bn' ? 'যাচাইযোগ্য আবশ্যকীয় শর্ত' : locale === 'ar' ? 'شرط أساسي معتمد' : 'Verified Prerequisite'}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION C: Application Documents Checklist */}
          <section className="bg-emerald-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 border border-amber-400/50 text-amber-300 text-xs font-bold mb-3 shadow-2xs">
                <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>{locale === 'bn' ? 'ডকুমেন্ট চেকলিস্ট' : locale === 'ar' ? 'قائمة الوثائق' : 'Required Checklist'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {curr.docsTitle}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 max-w-2xl leading-relaxed">
                {curr.docsSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {curr.docs.map((doc: any, idx: number) => (
                <div key={idx} className="bg-emerald-900/70 border border-emerald-700/60 rounded-xl p-4 flex items-start gap-3 hover:bg-emerald-900 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-emerald-950 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-amber-300 leading-snug">{doc.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950 rounded text-emerald-300 border border-emerald-700/80 shrink-0">
                        {doc.tag}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION D: Frequently Asked Questions (FAQ) */}
          <section className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>{locale === 'bn' ? 'প্রশ্নোত্তর' : locale === 'ar' ? 'الأسئلة المتكررة' : 'Questions & Inquiries'}</span>
              </div>
              <h2 className="text-2xl font-bold text-[#064e3b] font-serif">
                {curr.faqTitle}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {curr.faqSubtitle}
              </p>
            </div>

            <div className="space-y-3">
              {curr.faqs.map((faq: any, idx: number) => (
                <div 
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left rtl:text-right flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-[#064e3b] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-emerald-700 shrink-0 transition-transform duration-200 ${activeFaq === idx ? 'rotate-180 text-amber-600' : ''}`} />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 font-sans">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column (4 Cols): Sticky Application Hub & Support Cards */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Main Action Box */}
          <div className="bg-[#064e3b] text-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-md border border-emerald-800 space-y-6 relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-3 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-amber-400/50 text-amber-300 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{curr.ctaCard.badge}</span>
              </div>
              <h3 className="text-2xl font-bold font-serif text-amber-300 leading-tight">
                {curr.ctaCard.title}
              </h3>
              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
                {curr.ctaCard.desc}
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="space-y-3 relative z-10">
              <Link
                href={`/${locale}/register`}
                className="w-full py-3.5 sm:py-4 px-6 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-xl text-center transition-all shadow-md hover:shadow-amber-500/25 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <span>{curr.ctaCard.btnText}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180 shrink-0" />
              </Link>

              <Link
                href={`/${locale}/courses`}
                className="w-full py-3 px-6 bg-emerald-900/80 hover:bg-emerald-900 text-white font-semibold rounded-xl text-center transition-all border border-emerald-700/80 flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{locale === 'bn' ? 'কোর্স ও সিলেবাসসমূহ দেখুন' : locale === 'ar' ? 'استعراض البرامج والمناهج' : 'Browse All Academic Courses'}</span>
              </Link>

              {curr.ctaCard.prospectusUrl && (
                <a
                  href={curr.ctaCard.prospectusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-950/60 hover:bg-emerald-950 text-amber-300 font-semibold rounded-xl text-center transition-all border border-amber-400/40 flex items-center justify-center gap-2 text-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{curr.ctaCard.prospectusBtn || (locale === 'bn' ? 'প্রসপেক্টাস ডাউনলোড করুন (PDF)' : locale === 'ar' ? 'تحميل دليل البرامج (PDF)' : 'Download Prospectus (PDF)')}</span>
                </a>
              )}
            </div>

            {/* Quick Guarantees / Badges */}
            <div className="pt-4 border-t border-emerald-700/60 space-y-2 text-xs text-emerald-200/90">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{locale === 'bn' ? '১০০% অনলাইন ও সহজ আবেদন পদ্ধতি' : locale === 'ar' ? 'تقديم إلكتروني سلس بنسبة ١٠٠٪' : '100% Secure & Paperless Portal'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{locale === 'bn' ? 'মেধাবী ও অসচ্ছলদের জন্য স্কলারশিপ সুবিধা' : locale === 'ar' ? 'منح وتسهيلات للطلاب المتفوقين' : 'Scholarship Support Available'}</span>
              </div>
            </div>
          </div>

          {/* Admission Helpdesk & Secretariat Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 font-serif">{curr.ctaCard.helpTitle}</h4>
                <p className="text-[11px] text-slate-500">{curr.ctaCard.hours}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <a 
                href={`tel:${curr.ctaCard.phone}`}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#064e3b] transition-colors font-medium border border-slate-100"
              >
                <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{curr.ctaCard.phone}</span>
              </a>

              <a 
                href={`mailto:${curr.ctaCard.email}`}
                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#064e3b] transition-colors font-medium border border-slate-100"
              >
                <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{curr.ctaCard.email}</span>
              </a>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-normal">
                {curr.ctaCard.notice || (locale === 'bn' 
                  ? 'ভর্তি সংক্রান্ত যেকোনো তথ্যের জন্য সরাসরি অফিসে যোগাযোগ বা ইমেইল করতে পারেন।' 
                  : locale === 'ar' 
                  ? 'لأي استفسارات حول القبول والتسجيل، تواصل مع الأمانة العامة مباشرة.' 
                  : 'For admissions counseling or technical help, please reach out to our admission officers.')}
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
