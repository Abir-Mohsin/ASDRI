'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { CheckCircle2, ChevronLeft, GraduationCap, Wallet, Award, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { COURSES, getLocalizedCourse } from '@/lib/constants/courses';
import DynamicFormRenderer from '@/components/dashboards/DynamicFormRenderer';
import { defaultAdmissionFields } from '@/components/dashboards/FormBuilder';
import ZakatFormRenderer from '@/components/dashboards/ZakatFormRenderer';
import { DEFAULT_ZAKAT_FORM_FIELDS } from '@/lib/constants/zakatFormTemplate';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function ApplyPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'bn';
  const { user, role } = useAuthStore();

  const [selectedCourse, setSelectedCourse] = useState('');
  const [isPreselectedFromUrl, setIsPreselectedFromUrl] = useState(false);
  const [isChangingProgram, setIsChangingProgram] = useState(false);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fundingOption, setFundingOption] = useState<'full_payment' | 'scholarship_zakat'>('full_payment');
  const [zakatFormData, setZakatFormData] = useState<Record<string, any>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [dbCourses, setDbCourses] = useState<any[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  // Localization Dictionary
  const dict: Record<string, Record<string, string>> = {
    en: {
      pageTitle: "New Admission Application",
      pageSub: "Submit your details to apply for academic programs.",
      selectedProgramBadge: "Selected Program",
      changeProgramBtn: "Change Program",
      closeBtn: "Close",
      selectDifferentCourse: "Select a different course from the list:",
      step1Title: "1. Select Academic Program",
      step1Sub: "Available Academic Programs Dropdown",
      chooseProgramLabel: "Select the program you wish to apply for:",
      dropdownPlaceholder: "-- Select an open academic program --",
      eligibilityLabel: "Eligibility:",
      durationLabel: "Duration:",
      typeLabel: "Type:",
      step2Title: "2. Course Fee & Financial Options",
      freeCourseBadge: "100% Free / Funded",
      totalFeePrefix: "Total Course Fee: ৳",
      admissionFeeLabel: "Admission Fee",
      tuitionFeeLabel: "Tuition Fee",
      accommodationFeeLabel: "Accommodation & Food",
      selectFundingLabel: "Choose Payment or Scholarship Option:",
      payFullOptionTitle: "I will pay the full course fee",
      payFullOptionDesc: "Complete standard admission form and proceed with normal fee payment. (Zakat form not required)",
      applyScholarshipOptionTitle: "I want to apply for Scholarship / Zakat Fund",
      applyScholarshipOptionDesc: "If you need financial assistance, fill out the comprehensive Zakat Assessment Form.",
      step3Title: "3. Applicant Details",
      submitButton: "Submit Admission Application",
      submittingButton: "Submitting Application...",
      successTitle: "Admission Application Submitted Successfully!",
      successDesc: "Jazakallahu Khairan. Your admission application and details have been securely recorded. The institute office will contact you soon.",
      redirecting: "Redirecting to Dashboard...",
      authRequired: "You must be signed in as an applicant or student to view this page.",
      loadingCourses: "Loading academic courses...",
      noCourses: "No courses are currently open for admission.",
    },
    bn: {
      pageTitle: "নতুন ভর্তি আবেদন (New Admission Application)",
      pageSub: "কোর্স নির্বাচন করুন ও আপনার প্রয়োজনীয় তথ্য প্রদান করুন।",
      selectedProgramBadge: "নির্বাচিত প্রোগ্রাম",
      changeProgramBtn: "কোর্স পরিবর্তন করুন",
      closeBtn: "বন্ধ করুন",
      selectDifferentCourse: "অন্য কোনো কোর্স নির্বাচন করুন:",
      step1Title: "১. কোর্স / প্রোগ্রাম নির্বাচন করুন",
      step1Sub: "উন্মুক্ত প্রোগ্রামসমূহের ড্রপডাউন",
      chooseProgramLabel: "যে কোর্সে ভর্তি হতে চান তা ড্রপডাউন থেকে বেছে নিন:",
      dropdownPlaceholder: "-- উন্মুক্ত কোর্স তালিকা থেকে একটি বেছে নিন --",
      eligibilityLabel: "যোগ্যতা:",
      durationLabel: "মেয়াদ:",
      typeLabel: "টাইপ:",
      step2Title: "২. কোর্স ফি ও স্কলারশিপ / যাকাত ফান্ড বিকল্প",
      freeCourseBadge: "সম্পূর্ণ বিনামূল্যে (Free)",
      totalFeePrefix: "মোট কোর্স ফি: ৳",
      admissionFeeLabel: "ভর্তি ফি",
      tuitionFeeLabel: "টিউশন ফি",
      accommodationFeeLabel: "আবাসন/খাবার",
      selectFundingLabel: "পেমেন্ট পদ্ধতি বা স্কলারশিপ সুবিধা নির্বাচন করুন:",
      payFullOptionTitle: "আমি সম্পূর্ণ কোর্স ফি পরিশোধ করব",
      payFullOptionDesc: "ভর্তি আবেদনের সাধারণ ফরম পূরণ করে ফি প্রদান সম্পন্ন করুন। (যাকাত ফরম প্রয়োজন নেই)",
      applyScholarshipOptionTitle: "আমি স্কলারশিপ / যাকাত ফান্ডের জন্য আবেদন করতে চাই",
      applyScholarshipOptionDesc: "আপনার আর্থিক সক্ষমতা না থাকলে যাকাত অ্যাসেসমেন্ট ফরমটি বিস্তারিতভাবে পূরণ করুন।",
      step3Title: "৩. আবেদনকারীর সাধারণ তথ্যাবলী (Applicant Details)",
      submitButton: "ভর্তি আবেদন জমা দিন (Submit Application)",
      submittingButton: "জমা দেওয়া হচ্ছে...",
      successTitle: "ভর্তি আবেদন সফলভাবে সম্পন্ন হয়েছে!",
      successDesc: "জাজাকাল্লাহু খাইরান। আপনার ভর্তির আবেদন ও তথ্য সংরক্ষিত হয়েছে। ইনস্টিটিউট অফিস থেকে আপনার সাথে অতিসত্বর যোগাযোগ করা হবে।",
      redirecting: "ড্যাশবোর্ডে রিডাইরেক্ট করা হচ্ছে...",
      authRequired: "এই পেজটি দেখার জন্য শিক্ষার্থী বা আবেদনকারী হিসেবে লগইন করতে হবে।",
      loadingCourses: "কোর্সের তালিকা লোড হচ্ছে...",
      noCourses: "বর্তমানে কোনো কোর্স উন্মুক্ত নেই।",
    },
    ar: {
      pageTitle: "طلب التحاق جديد",
      pageSub: "أدخل بياناتك للتقديم على البرامج الأكاديمية.",
      selectedProgramBadge: "البرنامج المختار",
      changeProgramBtn: "تغيير البرنامج",
      closeBtn: "إغلاق",
      selectDifferentCourse: "اختر برنامجاً دراسياً آخر:",
      step1Title: "١. اختيار البرنامج الأكاديمي",
      step1Sub: "قائمة البرامج الأكاديمية المتاحة",
      chooseProgramLabel: "اختر البرنامج الذي ترغب في الالتحاق به من القائمة:",
      dropdownPlaceholder: "-- اختر برنامجاً من قائمة البرامج المتاحة --",
      eligibilityLabel: "المؤهلات والشروط:",
      durationLabel: "المدة:",
      typeLabel: "النوع:",
      step2Title: "٢. الرسوم وخيارات المنحة وصندوق الزكاة",
      freeCourseBadge: "مجاني بالكامل",
      totalFeePrefix: "إجمالي الرسوم: ৳ ",
      admissionFeeLabel: "رسوم التسجيل",
      tuitionFeeLabel: "الرسوم الدراسية",
      accommodationFeeLabel: "السكن والإعاشة",
      selectFundingLabel: "حدد طريقة السداد أو الدعم المالي:",
      payFullOptionTitle: "سأقوم بسداد الرسوم كاملة",
      payFullOptionDesc: "إكمال استمارة التسجيل وسداد الرسوم المقررة (لا يلزم استمارة الزكاة).",
      applyScholarshipOptionTitle: "أرغب في التقديم على منحة صندوق الزكاة",
      applyScholarshipOptionDesc: "إذا كنت بحاجة إلى دعم مالي، يرجى ملء استمارة تقييم الزكاة.",
      step3Title: "٣. البيانات الشخصية للمتقدم",
      submitButton: "إرسال طلب الالتحاق",
      submittingButton: "جاري الإرسال...",
      successTitle: "تم إرسال طلب الالتحاق بنجاح!",
      successDesc: "جزاكم الله خيراً. تم حفظ طلبك وبياناتك بنجاح، وسوف يتواصل معك مكتب المعهد قريباً.",
      redirecting: "جاري التحويل إلى لوحة التحكم...",
      authRequired: "يجب تسجيل الدخول كطالب أو متقدم لعرض هذه الصفحة.",
      loadingCourses: "جاري تحميل البرامج الدراسية...",
      noCourses: "لا توجد برامج متاحة للتقديم حالياً.",
    }
  };

  const t = (key: string) => dict[locale]?.[key] || dict['bn'][key] || key;

  // Firestore Error Handler
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  };

  // Fetch courses from Firestore
  useEffect(() => {
    const fetchCoursesFromDb = async () => {
      setIsLoadingCourses(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        let list: any[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            duration: data.duration || '1 Year',
            type: data.type || 'Core',
            eligibility: data.eligibility || (locale === 'bn' ? 'ইসলামী শিক্ষা অর্জনে আগ্রহী সকল শিক্ষার্থীর জন্য উন্মুক্ত।' : 'Open to all learners interested in Islamic studies.'),
            createdAt: data.createdAt,
            fees: data.fees || {
              admissionFee: 1000,
              tuitionFee: 5000,
              accommodationFee: 0,
              totalFee: 6000,
              isFree: false,
              currency: 'BDT'
            },
            allowScholarship: data.allowScholarship ?? true,
            zakatFormFields: data.zakatFormFields || DEFAULT_ZAKAT_FORM_FIELDS,
            admissionFormFields: data.admissionFormFields
          };
        });

        if (list.length === 0) {
          list = COURSES;
        } else {
          list.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
        }

        setDbCourses(list);
      } catch (error) {
        console.error("Error loading courses for application:", error);
        setDbCourses(COURSES);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCoursesFromDb();
  }, [locale]);

  // Pre-select course from URL query parameter (e.g. from Available Academic Programs card)
  useEffect(() => {
    if (typeof window !== 'undefined' && dbCourses.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      const courseParam = searchParams.get('course');
      if (courseParam) {
        const matched = dbCourses.find(c => c.id === courseParam || c.title === courseParam);
        const targetId = matched ? matched.id : courseParam;
        setSelectedCourse(targetId);
        setIsPreselectedFromUrl(true);
      } else {
        setIsPreselectedFromUrl(false);
      }
    }
  }, [dbCourses]);

  if (role !== 'applicant' && role !== 'student' && role !== 'guest' && role !== 'admin' && role !== 'super_admin') {
    return (
      <div className="p-8 text-center text-slate-500 font-sans">
        {t('authRequired')}
      </div>
    );
  }

  const rawCourseObj = dbCourses.find(c => c.id === selectedCourse);
  const currentCourseObj = rawCourseObj ? getLocalizedCourse(rawCourseObj, locale) : null;
  const fieldsToRender = rawCourseObj?.admissionFormFields || defaultAdmissionFields;
  const courseFees = currentCourseObj?.fees || { totalFee: 0, isFree: true };
  const zakatFieldsToRender = rawCourseObj?.zakatFormFields || DEFAULT_ZAKAT_FORM_FIELDS;

  const handleZakatChange = (fieldId: string, value: any) => {
    setZakatFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedCourse) {
      alert(t('dropdownPlaceholder'));
      return;
    }
    
    // Map formData into array of { label, value }
    const mappedFormData = fieldsToRender.map((field: any) => ({
      label: field.label,
      value: formData[field.id] || ''
    }));
    
    setIsSubmitting(true);
    try {
      let resolvedName = user.displayName || '';
      if (!resolvedName) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            resolvedName = userDocSnap.data().name || userDocSnap.data().displayName || '';
          }
        } catch (e) {
          console.error("Error retrieving user name from Firestore:", e);
        }
      }
      if (!resolvedName) {
        resolvedName = user.email?.split('@')[0] || 'Unknown';
      }

      const applicationPayload: any = {
        userId: user.uid,
        userEmail: user.email,
        userName: resolvedName,
        courseId: selectedCourse,
        courseTitle: currentCourseObj?.title || rawCourseObj?.title || 'Unknown Course',
        customFormData: mappedFormData,
        fundingOption: fundingOption,
        courseFee: courseFees,
        hasZakatAssessment: fundingOption === 'scholarship_zakat',
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      if (fundingOption === 'scholarship_zakat') {
        applicationPayload.zakatAssessment = zakatFormData;
      }

      await addDoc(collection(db, 'applications'), applicationPayload);
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/${locale}/dashboard`);
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'applications');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-2xl border border-emerald-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-[#064e3b]" />
        </div>
        <h2 className="text-2xl font-bold font-serif text-slate-900">{t('successTitle')}</h2>
        <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
          {t('successDesc')}
        </p>
        <p className="text-xs text-slate-400">{t('redirecting')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/${locale}/dashboard`} className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-emerald-700 transition-colors shadow-sm">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">{t('pageTitle')}</h2>
          <p className="text-slate-500 text-xs">{t('pageSub')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* STEP 1: CONDITIONAL PRESENTATION */}
        {/* If user clicked 'Apply Now' on a specific program card (pre-selected from URL): */}
        {isPreselectedFromUrl && currentCourseObj ? (
          <div className="bg-gradient-to-br from-emerald-950 via-[#064e3b] to-emerald-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider bg-amber-400 text-emerald-950 px-3 py-0.5 rounded-full shadow-xs">
                    ★ {t('selectedProgramBadge')}
                  </span>
                  <span className="text-emerald-200 text-xs font-semibold">
                    {currentCourseObj.duration} • {currentCourseObj.type}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-white tracking-tight">
                  {currentCourseObj.title}
                </h3>
                <p className="text-xs text-emerald-200/90 leading-relaxed max-w-2xl">
                  <strong className="text-emerald-100">{t('eligibilityLabel')}</strong> {currentCourseObj.eligibility}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start sm:self-center shrink-0">
                <div className="px-3.5 py-2 bg-emerald-900/90 rounded-2xl border border-emerald-700 text-xs font-bold text-amber-300">
                  {courseFees.isFree ? t('freeCourseBadge') : `${t('totalFeePrefix')}${courseFees.totalFee || 0}`}
                </div>
                <button
                  type="button"
                  onClick={() => setIsChangingProgram(!isChangingProgram)}
                  className="text-xs font-bold px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors border border-white/10 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  {isChangingProgram ? t('closeBtn') : t('changeProgramBtn')}
                </button>
              </div>
            </div>

            {/* Optional dropdown in case user wants to switch course */}
            {isChangingProgram && (
              <div className="mt-4 pt-4 border-t border-emerald-800/80 animate-fadeIn">
                <label className="block text-xs font-bold text-emerald-200 mb-2">
                  {t('selectDifferentCourse')}
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setIsChangingProgram(false);
                  }}
                  className="w-full bg-emerald-900 border border-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-medium focus:ring-2 focus:ring-amber-400 outline-none cursor-pointer"
                >
                  {dbCourses.map((c) => {
                    const localized = getLocalizedCourse(c, locale);
                    return (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                        {localized.title} • {localized.duration} ({c.fees?.isFree ? t('freeCourseBadge') : `৳${c.fees?.totalFee || 0}`})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>
        ) : (
          /* When arrived without specific course (e.g. from Submit Application overview card): DROPDOWN SELECTION */
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-[#064e3b] font-serif flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600" />
                {t('step1Title')}
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                {t('step1Sub')}
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {t('chooseProgramLabel')}
              </label>

              {isLoadingCourses ? (
                <div className="py-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-800"></div>
                  <span>{t('loadingCourses')}</span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    required
                    className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all outline-none cursor-pointer"
                  >
                    <option value="" disabled>
                      {t('dropdownPlaceholder')}
                    </option>
                    {dbCourses.map((c) => {
                      const localized = getLocalizedCourse(c, locale);
                      return (
                        <option key={c.id} value={c.id}>
                          {localized.title} • {localized.duration} ({c.fees?.isFree ? t('freeCourseBadge') : `৳${c.fees?.totalFee || 0}`})
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* If selected from dropdown, show compact course info banner below */}
            {currentCourseObj && (
              <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 space-y-1.5 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-emerald-900 text-sm font-serif">{currentCourseObj.title}</span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full">
                    {currentCourseObj.duration} • {currentCourseObj.type}
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">{t('eligibilityLabel')}</strong> {currentCourseObj.eligibility}
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: Course Fee & Payment / Scholarship Choice */}
        {currentCourseObj && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 animate-fadeIn">
            <h3 className="font-bold text-base text-[#064e3b] font-serif flex items-center gap-2 border-b border-slate-100 pb-2">
              <Wallet className="w-5 h-5 text-amber-600" />
              {t('step2Title')}
            </h3>

            {/* Fee Details Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="font-bold text-xs text-slate-800 font-serif">{currentCourseObj.title}</span>
                <span className="text-xs font-bold text-emerald-800">
                  {courseFees.isFree ? t('freeCourseBadge') : `${t('totalFeePrefix')}${courseFees.totalFee || 0}`}
                </span>
              </div>

              {!courseFees.isFree && (
                <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('admissionFeeLabel')}</span>
                    <span className="font-bold text-slate-800">৳{courseFees.admissionFee || 0}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('tuitionFeeLabel')}</span>
                    <span className="font-bold text-slate-800">৳{courseFees.tuitionFee || 0}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('accommodationFeeLabel')}</span>
                    <span className="font-bold text-slate-800">৳{courseFees.accommodationFee || 0}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Funding Options Selection */}
            {!courseFees.isFree && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-800">
                  {t('selectFundingLabel')}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Pay Full Fee */}
                  <label 
                    onClick={() => setFundingOption('full_payment')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                      fundingOption === 'full_payment'
                        ? 'border-[#064e3b] bg-emerald-50/50 ring-1 ring-[#064e3b]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="fundingChoice" 
                      value="full_payment"
                      checked={fundingOption === 'full_payment'}
                      onChange={() => setFundingOption('full_payment')}
                      className="mt-1"
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-xs text-slate-900 block">
                        {t('payFullOptionTitle')} (৳{courseFees.totalFee || 0})
                      </span>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {t('payFullOptionDesc')}
                      </p>
                    </div>
                  </label>

                  {/* Option 2: Apply for Scholarship / Zakat Fund */}
                  {rawCourseObj?.allowScholarship && (
                    <label 
                      onClick={() => setFundingOption('scholarship_zakat')}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        fundingOption === 'scholarship_zakat'
                          ? 'border-amber-600 bg-amber-50/60 ring-1 ring-amber-600'
                          : 'border-slate-200 hover:border-amber-300 bg-white'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="fundingChoice" 
                        value="scholarship_zakat"
                        checked={fundingOption === 'scholarship_zakat'}
                        onChange={() => setFundingOption('scholarship_zakat')}
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <span className="font-bold text-xs text-amber-950 block flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-600" />
                          {t('applyScholarshipOptionTitle')}
                        </span>
                        <p className="text-[11px] text-amber-900/80 leading-tight">
                          {t('applyScholarshipOptionDesc')}
                        </p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Dynamic Admission Form Fields */}
        {selectedCourse && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#064e3b] font-serif border-b border-slate-100 pb-2">
              {t('step3Title')}
            </h3>
            
            <div className="space-y-4">
              <DynamicFormRenderer 
                fields={fieldsToRender}
                formData={formData}
                setFormData={setFormData}
              />
            </div>
          </div>
        )}

        {/* Dynamic Zakat Assessment Form (Only expands if Funding Option == 'scholarship_zakat') */}
        {fundingOption === 'scholarship_zakat' && currentCourseObj && (
          <div className="animate-slideIn">
            <ZakatFormRenderer
              fields={zakatFieldsToRender}
              values={zakatFormData}
              onChange={handleZakatChange}
              totalCourseFee={courseFees.totalFee}
            />
          </div>
        )}

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button 
            type="submit" 
            disabled={isSubmitting || !selectedCourse}
            className="px-8 py-3.5 bg-[#064e3b] text-white font-bold rounded-xl hover:bg-emerald-900 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('submittingButton')}
              </>
            ) : (
              t('submitButton')
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
