'use client';

import React, { useEffect, useState } from 'react';
import { doc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RenderIcon } from '@/lib/iconMap';
import { 
  MapPin, Phone, Mail, Clock, Send, 
  CheckCircle2, AlertCircle, MessageSquare, 
  Building2, Sparkles, Shield, Target, 
  BookOpen, HelpCircle, ExternalLink, RefreshCw
} from 'lucide-react';

export interface CardItem {
  id?: string;
  title: string;
  desc: string;
  icon?: string;
  badge?: string;
}

export interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
  officeHours?: string;
  mapNote?: string;
}

export interface AboutPageData {
  title?: string;
  subtitle?: string;
  mission?: {
    title: string;
    desc: string;
    icon?: string;
    badge?: string;
  };
  vision?: {
    title: string;
    desc: string;
    icon?: string;
    badge?: string;
  };
  coreValuesTitle?: string;
  coreValues?: CardItem[];
  highlightsTitle?: string;
  highlights?: CardItem[];
  contactInfo?: ContactInfo;
}

export function AboutPageContent({ locale = 'en' }: { locale?: 'en' | 'bn' | 'ar' }) {
  const [data, setData] = useState<AboutPageData | null>(null);

  // Form State for Contact / Mail Box
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    subject: locale === 'bn' ? 'সাধারণ জিজ্ঞাসা' : locale === 'ar' ? 'استفسار عام' : 'General Inquiry',
    message: ''
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const docRef = doc(db, 'site_pages', 'about');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const d = docSnap.data() as AboutPageData;
        setData(d);
      }
    }, (err) => {
      console.error('Error fetching about page data:', err);
    });

    return () => unsubscribe();
  }, []);

  // Multilingual fallback texts
  const t = {
    en: {
      missionBadge: "Our Mission",
      missionTitle: "Our Mission",
      missionDesc: "To cultivate a generation of grounded, insightful, and compassionate Islamic scholars and researchers who lead the Ummah in addressing contemporary intellectual and practical challenges based strictly on the Holy Quran and authentic Sunnah.",
      visionBadge: "Our Vision",
      visionTitle: "Our Vision",
      visionDesc: "To be an internationally recognized center of Islamic scholarship, research, and authentic Dawah, fostering transformative social progress, moral revival, and intellectual excellence worldwide.",
      coreValuesBadge: "Our Principles",
      coreValuesTitle: "Core Values & Pillars",
      highlightsBadge: "Academic Distinction",
      highlightsTitle: "Campus & Academic Highlights",
      contactBadge: "Contact & Campus Info",
      contactHeading: "Get in Touch with ASDRI",
      contactDesc: "For inquiries regarding academic programs, admissions, fatwa consultations, or research partnerships, feel free to contact us or send a direct message below.",
      addressTitle: "Campus Address",
      addressVal: "As-Sunnah Dawah & Research Institute, Satarkul Campus, Badda, Dhaka-1212, Bangladesh.",
      phoneTitle: "Direct Hotline",
      phoneVal: "+880 1805-437910, +880 1234-567890",
      emailTitle: "Official Email",
      emailVal: "info@asdri.edu.bd / asdri.edu@gmail.com",
      hoursTitle: "Office Hours",
      hoursVal: "Saturday – Thursday: 9:00 AM – 5:00 PM (Friday Closed)",
      formTitle: "Send Us a Message",
      formSubtitle: "Please provide your name, contact information, and message below.",
      successTitle: "Message Sent Successfully!",
      successDesc: "Alhamdulillah, your message has been received by our administration. Our team will get back to you promptly.",
      sendAnother: "Send Another Message",
      nameLabel: "Full Name",
      namePlaceholder: "e.g. Muhammad Abdullah",
      phoneLabel: "Phone / Mobile Number",
      phonePlaceholder: "e.g. +880 17XXXXXXXX",
      emailLabel: "Email Address",
      emailPlaceholder: "e.g. example@gmail.com",
      addressLabel: "City / Address",
      addressOptional: "(Optional)",
      addressPlaceholder: "City, district or current residence...",
      subjectLabel: "Subject / Category",
      subjectOptions: [
        { value: "General Inquiry", label: "General Inquiry" },
        { value: "Courses & Admission", label: "Courses & Admission Info" },
        { value: "Research & Publications", label: "Research, Journals & Publications" },
        { value: "Digital Library", label: "Digital Library & Resources" },
        { value: "Alumni & Network", label: "Alumni Affairs & Network" },
        { value: "Other", label: "Other Institutional Topics" }
      ],
      messageLabel: "Detailed Message",
      messagePlaceholder: "Write your inquiry, feedback, or message here...",
      characters: "chars",
      sendingBtn: "Sending Message...",
      sendBtn: "Send Message",
      openMailClient: "Open in email client directly",
      errorFillFields: "Please enter your name, email, phone number, and message."
    },
    bn: {
      missionBadge: "Our Mission",
      missionTitle: "Our Mission",
      missionDesc: "To cultivate a generation of grounded, insightful, and compassionate Islamic scholars and researchers who lead the Ummah in addressing contemporary intellectual and practical challenges based strictly on the Holy Quran and authentic Sunnah.",
      visionBadge: "Our Vision",
      visionTitle: "Our Vision",
      visionDesc: "To be an internationally recognized center of Islamic scholarship, research, and authentic Dawah, fostering transformative social progress, moral revival, and intellectual excellence worldwide.",
      coreValuesBadge: "Our Principles",
      coreValuesTitle: "Core Values & Institutional Pillars",
      highlightsBadge: "Academic Distinction",
      highlightsTitle: "Campus & Academic Highlights",
      contactBadge: "Contact & Campus Info",
      contactHeading: "Get in Touch with ASDRI",
      contactDesc: "For inquiries regarding academic programs, admissions, fatwa consultations, or research partnerships, feel free to contact us or send a direct message below.",
      addressTitle: "Campus Address",
      addressVal: "As-Sunnah Dawah & Research Institute, Satarkul Campus, Badda, Dhaka-1212, Bangladesh.",
      phoneTitle: "Direct Hotline",
      phoneVal: "+880 1805-437910, +880 1234-567890",
      emailTitle: "Official Email",
      emailVal: "info@asdri.edu.bd / asdri.edu@gmail.com",
      hoursTitle: "Office Hours",
      hoursVal: "Saturday – Thursday: 9:00 AM – 5:00 PM (Friday Closed)",
      formTitle: "Send Us a Message",
      formSubtitle: "Please provide your name, contact information, and message below.",
      successTitle: "Message Sent Successfully!",
      successDesc: "Alhamdulillah, your message has been received by our administration. Our team will get back to you promptly.",
      sendAnother: "Send Another Message",
      nameLabel: "Full Name",
      namePlaceholder: "e.g. Muhammad Abdullah",
      phoneLabel: "Phone / Mobile Number",
      phonePlaceholder: "e.g. +880 17XXXXXXXX",
      emailLabel: "Email Address",
      emailPlaceholder: "e.g. example@gmail.com",
      addressLabel: "City / Address",
      addressOptional: "(Optional)",
      addressPlaceholder: "City, district or current residence...",
      subjectLabel: "Subject / Category",
      subjectOptions: [
        { value: "General Inquiry", label: "General Inquiry" },
        { value: "Courses & Admission", label: "Courses & Admission Info" },
        { value: "Research & Publications", label: "Research, Journals & Publications" },
        { value: "Digital Library", label: "Digital Library & Resources" },
        { value: "Alumni & Network", label: "Alumni Affairs & Network" },
        { value: "Other", label: "Other Institutional Topics" }
      ],
      messageLabel: "Detailed Message",
      messagePlaceholder: "Write your inquiry, feedback, or message here...",
      characters: "chars",
      sendingBtn: "Sending Message...",
      sendBtn: "Send Message",
      openMailClient: "Open in email client directly",
      errorFillFields: "Please enter your name, email, phone number, and message."
    },
    ar: {
      missionBadge: "رسالتنا",
      missionTitle: "رسالة المعهد",
      missionDesc: "إعداد وتأهيل جيل متميز من العلماء والباحثين المتضلعين في العلوم الشرعية والبحث الأكاديمي، لقيادة الأمة ومواجهة التحديات الفكرية المعاصرة وفق القرآن الكريم والسنة النبوية الصحيحة.",
      visionBadge: "رؤيتنا",
      visionTitle: "رؤية المعهد",
      visionDesc: "أن نكون صرحاً أكاديمياً وبحثياً ودعوياً رائداً على المستوى الدولي في خدمة علوم الوحي ونشر الهداية والإصلاح المجتمعي.",
      coreValuesBadge: "قيمنا ومبادئنا",
      coreValuesTitle: "القيم والمبادئ الجوهرية",
      highlightsBadge: "المزايا الأكاديمية",
      highlightsTitle: "مزايا الحرم الجامعي والبيئة التعليمية",
      contactBadge: "التواصل والحرم الجامعي",
      contactHeading: "تواصل معنا مباشرة",
      contactDesc: "لأي استفسارات بخصوص البرامج الأكاديمية، والقبول، والبحوث العلمية، نسعد بتواصلكم عبر القنوات الرسمية أو النموذج المباشر أدناه.",
      addressTitle: "عنوان الحرم الجامعي",
      addressVal: "معهد السنّة للدعوة والبحوث، مجمع ساركول، بدا، دكا، بنغلاديش.",
      phoneTitle: "الهاتف / الخط الساخن",
      phoneVal: "+880 1805-437910, +880 1234-567890",
      emailTitle: "البريد الإلكتروني الرسمي",
      emailVal: "info@asdri.edu.bd / asdri.edu@gmail.com",
      hoursTitle: "أوقات الدوام الرسمي",
      hoursVal: "السبت – الخميس: 9:00 صباحاً – 5:00 مساءً (الجمعة عطلة)",
      formTitle: "إرسال رسالة مباشرة",
      formSubtitle: "يرجى تعبئة بياناتك ورسالتك في النموذج أدناه.",
      successTitle: "تم إرسال رسالتكم بنجاح!",
      successDesc: "الحمد لله، تم استلام رسالتكم لدى إدارة المعهد وسيتواصل معكم فريقنا في أقرب وقت.",
      sendAnother: "إرسال رسالة أخرى",
      nameLabel: "الاسم الكامل",
      namePlaceholder: "مثال: محمد عبد الله",
      phoneLabel: "رقم الجوال / الهاتف",
      phonePlaceholder: "مثال: +880 17XXXXXXXX",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "مثال: example@gmail.com",
      addressLabel: "العنوان / المدينة",
      addressOptional: "(اختياري)",
      addressPlaceholder: "المدينة أو العنوان الحالي...",
      subjectLabel: "موضوع الرسالة",
      subjectOptions: [
        { value: "General Inquiry", label: "استفسار عام" },
        { value: "Courses & Admission", label: "المقررات وشروط القبول" },
        { value: "Research & Publications", label: "البحوث والمجلات العلمية" },
        { value: "Digital Library", label: "المكتبة الرقمية والكتب" },
        { value: "Alumni & Network", label: "شؤون الخريجين" },
        { value: "Other", label: "مواضيع أخرى" }
      ],
      messageLabel: "تفاصيل الرسالة",
      messagePlaceholder: "اكتب رسالتك أو استفسارك هنا...",
      characters: "حرف",
      sendingBtn: "جارٍ الإرسال...",
      sendBtn: "إرسال الرسالة",
      openMailClient: "فتح في برنامج البريد مباشرة",
      errorFillFields: "يرجى تعبئة الاسم، والبريد الإلكتروني، ورقم الهاتف، والرسالة."
    }
  };

  const currentT = t[locale] || t.en;

  // Default fallback contents
  const missionTitle = data?.mission?.title || currentT.missionTitle;
  const missionDesc = data?.mission?.desc || currentT.missionDesc;
  const missionIcon = data?.mission?.icon || 'Target';

  const visionTitle = data?.vision?.title || currentT.visionTitle;
  const visionDesc = data?.vision?.desc || currentT.visionDesc;
  const visionIcon = data?.vision?.icon || 'Shield';

  const coreValuesTitle = data?.coreValuesTitle || currentT.coreValuesTitle;
  const defaultCoreValues: CardItem[] = locale === 'ar' ? [
    { title: 'الأصالة والتمسك بالوحي', desc: 'الالتزام الصارم بالقرآن الكريم وصحيح السنة وفق فهم السلف الصالح.', icon: 'BookOpen' },
    { title: 'التميز الأكاديمي', desc: 'تطبيق أعلى المعايير العلمية في دراسات الحديث والفقه المقارن.', icon: 'Target' },
    { title: 'الإخلاص والأمانة', desc: 'النزاهة العلمية والروحية والمسؤولية في نشر العلم.', icon: 'Shield' },
    { title: 'خدمة الأمة', desc: 'نشر الدعوة وبناء المجتمع وتقديم الحلول الشرعية المعاصرة.', icon: 'Heart' },
  ] : [
    { title: 'Authenticity (Asalah)', desc: 'Uncompromising adherence to the Quran, Sunnah, and the methodology of sound classical scholarship.', icon: 'BookOpen' },
    { title: 'Academic Excellence', desc: 'Adhering to rigorous international academic standards in Hadith, Fiqh, and contemporary research.', icon: 'Target' },
    { title: 'Integrity & Sincerity', desc: 'Highest standard of moral integrity, sincerity (Ikhlas), and accountability in seeking knowledge.', icon: 'Shield' },
    { title: 'Service to the Ummah', desc: 'Conveying the authentic message of Islam and serving humanitarian and social causes.', icon: 'Heart' },
  ];
  const coreValuesList = (data?.coreValues && data.coreValues.length > 0) ? data.coreValues : defaultCoreValues;

  const highlightsTitle = data?.highlightsTitle || currentT.highlightsTitle;
  const defaultHighlights: CardItem[] = locale === 'ar' ? [
    { title: 'مكتبة أكاديمية مركزية', desc: 'آلاف المخطوطات والكتب النادرة في علوم الحديث والفقه والتفسير.', icon: 'BookMarked' },
    { title: 'هيئة تدريسية وبحثية متميزة', desc: 'نخبة من خريجي الجامعة الإسلامية بالمدينة المنورة وكبريات الجامعات.', icon: 'GraduationCap' },
    { title: 'وحدة بحوث ودراسات معاصرة', desc: 'مختبر بحثي متقدم للقضايا الفقهية والفكرية المستجدة.', icon: 'Sparkles' },
    { title: 'حرم جامعي نموذجي', desc: 'بيئة إيمانية وهادئة محفزة على طلب العلم والتحصيل العلمي.', icon: 'Building2' },
  ] : [
    { title: 'Central Research Library', desc: 'Rich digital and physical archives of rare manuscripts, Hadith encyclopedias, and references.', icon: 'BookMarked' },
    { title: 'Distinguished Faculty', desc: 'Instruction by prominent scholars graduated from the Islamic University of Madinah and global institutes.', icon: 'GraduationCap' },
    { title: 'Modern Research Wing', desc: 'Dedicated specialized research cells addressing contemporary Fiqh and theological inquiries.', icon: 'Sparkles' },
    { title: 'Serene Campus Environment', desc: 'Disciplined, spiritual, and secure setting conducive to rigorous academic pursuit.', icon: 'Building2' },
  ];
  const highlightsList = (data?.highlights && data.highlights.length > 0) ? data.highlights : defaultHighlights;

  // Contact Info
  const contactAddress = data?.contactInfo?.address || currentT.addressVal;
  const contactPhone = data?.contactInfo?.phone || currentT.phoneVal;
  const contactEmail = data?.contactInfo?.email || currentT.emailVal;
  const contactHours = data?.contactInfo?.officeHours || currentT.hoursVal;

  // Handle Contact Form Submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setFormError(currentT.errorFillFields);
      return;
    }

    setFormSubmitting(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || 'N/A',
        subject: formData.subject,
        message: formData.message.trim(),
        status: 'unread',
        pageSource: 'about_page',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      });

      setFormSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        subject: currentT.subjectOptions[0].value,
        message: ''
      });
    } catch (err: any) {
      console.error('Error submitting contact form:', err);
      setFormError(locale === 'bn' ? 'বার্তা পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি আমাদের ফোন বা ইমেইলে যোগাযোগ করুন।' : 'Failed to send message. Please contact us directly via email or phone.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="space-y-16 font-sans">
      
      {/* 1. Mission & Vision Cards Section */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Mission Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xs border border-emerald-100/80 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/60 rounded-bl-full -z-0 pointer-events-none transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#064e3b] shadow-2xs border border-emerald-100">
                  <RenderIcon name={missionIcon} className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 bg-emerald-100/70 text-[#064e3b] rounded-full">
                  {currentT.missionBadge}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#064e3b] font-serif pt-1">
                {missionTitle}
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                {missionDesc}
              </p>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xs border border-amber-100/80 flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/60 rounded-bl-full -z-0 pointer-events-none transition-transform group-hover:scale-110"></div>
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700 shadow-2xs border border-amber-100">
                  <RenderIcon name={visionIcon} className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full">
                  {currentT.visionBadge}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#064e3b] font-serif pt-1">
                {visionTitle}
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base font-normal">
                {visionDesc}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Core Values Dynamic Cards Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200/60 inline-block mb-3">
            {currentT.coreValuesBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif">
            {coreValuesTitle}
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mt-3.5 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValuesList.map((value, i) => (
            <div 
              key={value.id || i} 
              className="bg-white p-7 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all text-center flex flex-col items-center justify-between"
            >
              <div className="space-y-4 w-full">
                <div className="w-14 h-14 bg-emerald-50/80 rounded-2xl flex items-center justify-center mx-auto text-[#064e3b] border border-emerald-100/60 shadow-2xs">
                  <RenderIcon name={value.icon} className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {value.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Campus & Academic Highlights Cards Section */}
      {highlightsList && highlightsList.length > 0 && (
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-200/60 inline-block mb-3">
              {currentT.highlightsBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif">
              {highlightsTitle}
            </h2>
            <div className="w-20 h-1 bg-amber-500 mx-auto mt-3.5 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlightsList.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="bg-gradient-to-br from-white to-slate-50 p-6 rounded-2xl border border-slate-200/70 shadow-xs hover:shadow-md transition-all flex flex-col items-start text-left rtl:text-right"
              >
                <div className="w-12 h-12 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center mb-4 border border-amber-200/50">
                  <RenderIcon name={item.icon || 'Sparkles'} className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-serif mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Institutional Contact Details & Interactive Mail Form Section */}
      <section className="pt-6">
        <div className="bg-gradient-to-br from-[#064e3b] via-[#053d2e] to-[#022c22] text-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-xl border border-emerald-700/50 relative overflow-hidden">
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Contact Information Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-3 border border-amber-300/30">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentT.contactBadge}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-white tracking-tight">
                  {currentT.contactHeading}
                </h2>
                <p className="text-emerald-100/80 text-xs sm:text-sm mt-2 leading-relaxed">
                  {currentT.contactDesc}
                </p>
              </div>

              {/* Contact Info Cards */}
              <div className="space-y-3.5">
                
                {/* Address Card */}
                <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-700/40 flex items-start gap-3.5 backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">{currentT.addressTitle}</h4>
                    <p className="text-xs sm:text-sm text-emerald-50 mt-1 leading-relaxed">
                      {contactAddress}
                    </p>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-700/40 flex items-start gap-3.5 backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">{currentT.phoneTitle}</h4>
                    <p className="text-xs sm:text-sm text-emerald-50 mt-1 font-semibold">
                      {contactPhone}
                    </p>
                  </div>
                </div>

                {/* Email Card */}
                <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-700/40 flex items-start gap-3.5 backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">{currentT.emailTitle}</h4>
                    <p className="text-xs sm:text-sm text-emerald-50 mt-1 font-sans">
                      {contactEmail}
                    </p>
                  </div>
                </div>

                {/* Office Hours Card */}
                <div className="bg-emerald-900/50 p-4 rounded-2xl border border-emerald-700/40 flex items-start gap-3.5 backdrop-blur-xs">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">{currentT.hoursTitle}</h4>
                    <p className="text-xs sm:text-sm text-emerald-50 mt-1 leading-relaxed">
                      {contactHours}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column: Interactive Send Mail & Inquiry Form */}
            <div className="lg:col-span-7 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-100">
              
              <div className="border-b border-slate-100 pb-4 mb-6">
                <div className="flex items-center gap-2 text-[#064e3b] font-bold text-base sm:text-lg font-serif">
                  <MessageSquare className="w-5 h-5 text-amber-600" />
                  <span>{currentT.formTitle}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {currentT.formSubtitle}
                </p>
              </div>

              {formSuccess ? (
                <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#064e3b] font-serif">
                    {currentT.successTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                    {currentT.successDesc}
                  </p>
                  <button
                    type="button"
                    onClick={() => setFormSuccess(false)}
                    className="px-6 py-2.5 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    {currentT.sendAnother}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  
                  {formError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {currentT.nameLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder={currentT.namePlaceholder}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-800 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {currentT.phoneLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={currentT.phonePlaceholder}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-800 transition-all"
                      />
                    </div>
                  </div>

                  {/* Email & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {currentT.emailLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder={currentT.emailPlaceholder}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-800 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {currentT.addressLabel} <span className="text-slate-400 font-normal">{currentT.addressOptional}</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder={currentT.addressPlaceholder}
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-800 transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {currentT.subjectLabel}
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-medium text-slate-800 transition-all"
                    >
                      {currentT.subjectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Large Message Box */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {currentT.messageLabel} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400">
                        {formData.message.length} {currentT.characters}
                      </span>
                    </div>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={currentT.messagePlaceholder}
                      className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white font-normal text-slate-800 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Submit Button & Mailto Fallback */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="w-full sm:w-auto px-7 py-3 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {formSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{currentT.sendingBtn}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-amber-300" />
                          <span>{currentT.sendBtn}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={`mailto:info@asdri.edu.bd?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`Name: ${formData.name}\nPhone: ${formData.phone}\nAddress: ${formData.address}\n\nMessage:\n${formData.message}`)}`}
                      className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{currentT.openMailClient}</span>
                    </a>
                  </div>

                </form>
              )}

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
