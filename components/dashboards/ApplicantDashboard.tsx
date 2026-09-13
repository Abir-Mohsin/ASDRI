/* eslint-disable */
'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, CheckCircle, Clock, XCircle, Download, CreditCard, 
  HeartHandshake, ArrowRight, ShieldCheck, FileText, CheckCircle2, X, AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COURSES, getLocalizedCourse } from '@/lib/constants/courses';
import { StudentDashboard } from '@/components/dashboards/StudentDashboard';
import ZakatAssessmentModal from '@/components/dashboards/ZakatAssessmentModal';
import AdmissionFormPdfModal from '@/components/dashboards/AdmissionFormPdfModal';

export function ApplicantDashboard() {
  const { user, role } = useAuthStore();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [application, setApplication] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showZakatModal, setShowZakatModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStudentView, setShowStudentView] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [trxId, setTrxId] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  // Dictionary for trilingual support
  const dict: Record<string, Record<string, string>> = {
    en: {
      hubTitle: 'Applicant Portal',
      firebaseSecure: 'Firebase Secure Connected',
      pageHeading: 'Application Overview & Progress',
      profileSettings: 'Profile Settings',
      statusApproved: 'Admission Approved',
      statusPending: 'Under Review',
      statusNone: 'No Application Yet',
      statusRejected: 'Application Rejected',
      approvedBannerTag: '★ Your Approved Program',
      durationLabel: 'Duration:',
      typeLabel: 'Type:',
      downloadPdfBtn: 'Download Admission Form (PDF)',
      enterClassroomBtn: 'Enter Classroom →',
      classroomActiveBanner: 'You are currently active in your approved classroom interface.',
      returnToOverview: '← Return to Application Overview',
      feeBreakdown: 'Course Fee Breakdown',
      admissionFee: 'Admission Fee:',
      tuitionFee: 'Tuition Fee:',
      accommodationFee: 'Accommodation Fee:',
      totalFee: 'Total Fee:',
      freeFee: '100% Free / Funded',
      scholarshipStatusTitle: 'Scholarship & Payment Status',
      zakatApprovedTitle: '100% Zakat Fund Granted',
      zakatApprovedDesc: 'Following review of your Zakat Assessment, the academic board has approved a full scholarship from the Zakat Fund. No fee payment is required.',
      generalApprovedTitle: 'Institute Scholarship Granted',
      generalApprovedDesc: 'A tuition fee waiver has been granted from the Institute General Scholarship Fund.',
      zakatPendingTitle: 'Zakat Assessment Under Review',
      zakatPendingDesc: 'Your submitted Zakat Assessment form is currently under review by the scholarship committee.',
      feePaidTitle: 'Admission Fee Paid (Complete)',
      payAdmissionFeePrompt: 'You can pay the designated admission fee or submit the "Zakat Assessment Form" if you are eligible for financial scholarship assistance.',
      payFeeBtn: 'Pay Admission Fee',
      applyZakatBtn: 'Apply for Zakat Fund',
      availablePrograms: 'Available Academic Programs',
      applyNowBtn: 'Apply Now →',
      statusOverviewHeader: 'STATUS OVERVIEW',
      submitApplicationTitle: 'Submit Application',
      submitApplicationDesc: 'Select an academic program and submit your application to start the admission process.',
      reviewPendingDesc: 'Your application is under administrative review. You will receive an update once selection is completed.',
      congratsApprovedDesc: 'Congratulations! Your application has been approved. You can now access your classes and coursework.',
      rejectedDesc: 'Your application was not approved for this session. You may apply for other open programs.',
      admissionSteps: 'Admission Steps',
      stepCreateAccount: 'Create Account',
      stepSubmitForm: 'Submit Application Form',
      stepReview: 'Admin Review / Approval',
      stepClassAccess: 'Class Access & Enrollment',
      stepCompleted: 'Completed',
      stepPending: 'Pending',
      stepApproved: 'Approved',
      stepLocked: 'Locked',
      stepActive: 'Active',
      payModalTitle: 'Pay Admission Fee',
      payableFee: 'Total Payable Fee:',
      selectMethod: 'Select Payment Method',
      instructions: 'Payment Instructions:',
      trxIdLabel: 'Transaction ID (TrxID)',
      trxIdPlaceholder: 'e.g. 9B7X2Y1Z',
      cancelBtn: 'Cancel',
      submitPaymentBtn: 'Submit Payment',
      processing: 'Processing...',
      paymentSuccessMsg: 'Admission fee submitted successfully! Administrators will verify shortly.',
      paymentErrorMsg: 'Error submitting payment. Please check details and retry.',
      trxPrompt: 'Please enter your Transaction ID (TrxID).',
      freeBadge: 'Free',
      feePrefix: 'Fee: ৳ '
    },
    bn: {
      hubTitle: 'ভর্তি আবেদন হাব (Applicant Portal)',
      firebaseSecure: 'ফায়ারবেস সিকিউর কানেক্টেড',
      pageHeading: 'আবেদন ওভারভিউ ও অগ্রগতি',
      profileSettings: 'প্রোফাইল সেটিংস',
      statusApproved: 'ভর্তি অনুমোদিত (Approved)',
      statusPending: 'আবেদন পর্যালোচনাধীন',
      statusNone: 'কোনো আবেদন নেই',
      statusRejected: 'আবেদন প্রত্যাখ্যাত',
      approvedBannerTag: '★ আপনার অনুমোদিত কোর্স ও প্রোগ্রাম',
      durationLabel: 'মেয়াদ:',
      typeLabel: 'টাইপ:',
      downloadPdfBtn: 'ডাউনলোড এডমিশন ফরম (PDF)',
      enterClassroomBtn: 'ক্লাসে প্রবেশ করুন →',
      classroomActiveBanner: 'আপনি আপনার অনুমোদিত ক্লাসরুমে সক্রিয় রয়েছেন।',
      returnToOverview: '← আবেদনের ওভারভিউতে ফিরুন',
      feeBreakdown: 'কোর্স ফি ব্রেকডাউন',
      admissionFee: 'ভর্তি ফি:',
      tuitionFee: 'টিউশন ফি:',
      accommodationFee: 'আবাসন ফি:',
      totalFee: 'সর্বমোট ফি:',
      freeFee: 'সম্পূর্ণ ফ্রি',
      scholarshipStatusTitle: 'স্কলারশিপ ও পেমেন্ট স্ট্যাটাস',
      zakatApprovedTitle: '১০০% যাকাত ফান্ড অনুদান অনুমোদিত',
      zakatApprovedDesc: 'আপনার যাকাত অ্যাসেসমেন্ট পর্যালোচনার পর বোর্ড যাকাত ফান্ড থেকে ১০০% স্কলারশিপ অনুমোদন করেছে। কোনো ফি প্রদান করতে হবে না।',
      generalApprovedTitle: 'ইনস্টিটিউট সাধারণ স্কলারশিপ অনুমোদিত',
      generalApprovedDesc: 'ইনস্টিটিউট সাধারণ স্কলারশিপ ফান্ড থেকে ফি ছাড় অনুমোদন করা হয়েছে।',
      zakatPendingTitle: 'যাকাত অ্যাসেসমেন্ট পর্যালোচনাধীন',
      zakatPendingDesc: 'আপনার দাখিলকৃত যাকাত অ্যাসেসমেন্ট ফর্মটি স্কলারশিপ কমিটি কর্তৃক পর্যালোচিত হচ্ছে।',
      feePaidTitle: 'ভর্তি ফি পরিশোধ সম্পন্ন',
      payAdmissionFeePrompt: 'আপনি নির্ধারিত ভর্তি ফি পরিশোধ করতে পারেন অথবা স্কলারশিপ সহায়তার জন্য "যাকাত অ্যাসেসমেন্ট ফরম" পূরণ করতে পারেন।',
      payFeeBtn: 'ভর্তি ফি পরিশোধ করুন',
      applyZakatBtn: 'যাকাত ফান্ডের জন্য আবেদন',
      availablePrograms: 'ভর্তির জন্য উন্মুক্ত কোর্স ও প্রোগ্রামসমূহ',
      applyNowBtn: 'আবেদন করুন →',
      statusOverviewHeader: 'স্ট্যাটাস ওভারভিউ',
      submitApplicationTitle: 'আবেদন দাখিল করুন',
      submitApplicationDesc: 'ভর্তি প্রক্রিয়া শুরু করতে একটি প্রোগ্রাম নির্বাচন করে আবেদন দাখিল করুন।',
      reviewPendingDesc: 'আপনার আবেদনটি এডমিন পর্যালোচনায় রয়েছে। নির্বাচন সম্পন্ন হলে আপডেট পাবেন।',
      congratsApprovedDesc: 'অভিনন্দন! আপনার আবেদন অনুমোদিত হয়েছে। এখন আপনি ক্লাসে যুক্ত হতে পারবেন।',
      rejectedDesc: 'আপনার আবেদনটি এই সেশনের জন্য অনুমোদিত হয়নি। আপনি অন্য প্রোগ্রামে আবেদন করতে পারেন।',
      admissionSteps: 'ভর্তি প্রক্রিয়ার ধাপসমূহ',
      stepCreateAccount: 'অ্যাকাউন্ট তৈরি',
      stepSubmitForm: 'ভর্তি আবেদন ফরম দাখিল',
      stepReview: 'এডমিন পর্যালোচনা ও অনুমোদন',
      stepClassAccess: 'ক্লাস অ্যাক্সেস ও তালিকাভুক্তি',
      stepCompleted: 'সম্পন্ন',
      stepPending: 'অপেক্ষমাণ',
      stepApproved: 'অনুমোদিত',
      stepLocked: 'লক করা',
      stepActive: 'সক্রিয়',
      payModalTitle: 'ভর্তি ফি পরিশোধ ফরম',
      payableFee: 'মোট প্রদেয় ফি:',
      selectMethod: 'পেমেন্ট মাধ্যম নির্বাচন করুন',
      instructions: 'পেমেন্ট নির্দেশিকা:',
      trxIdLabel: 'ট্রানজেকশন আইডি (TrxID)',
      trxIdPlaceholder: 'যেমন: 9B7X2Y1Z',
      cancelBtn: 'বাতিল',
      submitPaymentBtn: 'পেমেন্ট জমা দিন',
      processing: 'প্রসেসিং হচ্ছে...',
      paymentSuccessMsg: 'ভর্তি ফি সফলভাবে জমা হয়েছে! এডমিন দ্রুত ভেরিফাই করবেন।',
      paymentErrorMsg: 'পেমেন্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।',
      trxPrompt: 'ট্রানজেকশন আইডি (TrxID) লিখুন।',
      freeBadge: 'ফ্রি',
      feePrefix: 'ফি: ৳ '
    },
    ar: {
      hubTitle: 'بوابة تقديم طلبات الالتحاق',
      firebaseSecure: 'اتصال فايربيس الآمن',
      pageHeading: 'نظرة عامة ومتابعة طلب الالتحاق',
      profileSettings: 'إعدادات الملف الشخصي',
      statusApproved: 'تم القبول والاعتماد',
      statusPending: 'الطلب قيد المراجعة',
      statusNone: 'لا يوجد طلب بعد',
      statusRejected: 'تم رفض الطلب',
      approvedBannerTag: '★ برنامجك الدراسي المعتمد',
      durationLabel: 'المدة:',
      typeLabel: 'النوع:',
      downloadPdfBtn: 'تحميل استمارة القبول (PDF)',
      enterClassroomBtn: 'الدخول إلى قاعة المحاضرات ←',
      classroomActiveBanner: 'أنت متصل حالياً بقاعة الدراسة المعتمدة الخاصة بك.',
      returnToOverview: '← العودة إلى متابعة الطلب',
      feeBreakdown: 'تفاصيل الرسوم الدراسية',
      admissionFee: 'رسوم التسجيل:',
      tuitionFee: 'الرسوم الدراسية:',
      accommodationFee: 'رسوم السكن:',
      totalFee: 'إجمالي الرسوم:',
      freeFee: 'مجاني بالكامل',
      scholarshipStatusTitle: 'حالة المنحة والرسوم',
      zakatApprovedTitle: 'تمت الموافقة على منحة صندوق الزكاة 100%',
      zakatApprovedDesc: 'بعد مراجعة استمارة الزكاة، اعتمدت اللجنة منحة كاملة من صندوق الزكاة ولا يتطلب دفع أي رسوم.',
      generalApprovedTitle: 'تمت الموافقة على المنحة العامة للمعهد',
      generalApprovedDesc: 'تم تقديم إعفاء دراسي من صندوق المنح العامة للمعهد.',
      zakatPendingTitle: 'استمارة الزكاة قيد المراجعة',
      zakatPendingDesc: 'استمارة تقييم الزكاة التي قدمتها تخضع حالياً لمراجعة لجنة المنح.',
      feePaidTitle: 'تم سداد الرسوم بنجاح',
      payAdmissionFeePrompt: 'يمكنك سداد رسوم القبول أو تقديم استمارة تقييم الزكاة إذا كنت مستحقاً للدعم المالي.',
      payFeeBtn: 'سداد رسوم القبول',
      applyZakatBtn: 'التقديم على منحة الزكاة',
      availablePrograms: 'البرامج الأكاديمية المتاحة للتقديم',
      applyNowBtn: 'قدّم الآن ←',
      statusOverviewHeader: 'نظرة عامة على الحالة',
      submitApplicationTitle: 'تقديم طلب الالتحاق',
      submitApplicationDesc: 'اختر أحد البرامج الأكاديمية وقدّم طلبك لبدء إجراءات القبول.',
      reviewPendingDesc: 'طلبك قيد المراجعة الإدارية وسوف يتم إشعارك فور اكتمال المراجعة.',
      congratsApprovedDesc: 'تهانينا! تم قبول طلب التحاقك. يمكنك الآن الدخول إلى المقررات والدروس.',
      rejectedDesc: 'لم يتم قبول الطلب في هذه الدورة. يمكنك التقديم على برامج أخرى.',
      admissionSteps: 'مراحل القبول والتسجيل',
      stepCreateAccount: 'إنشاء الحساب',
      stepSubmitForm: 'تقديم استمارة الالتحاق',
      stepReview: 'المراجعة والاعتماد الإداري',
      stepClassAccess: 'التسجيل النهائي وبدء الدراسة',
      stepCompleted: 'مكتمل',
      stepPending: 'قيد الانتظار',
      stepApproved: 'معتمد',
      stepLocked: 'مغلق',
      stepActive: 'مفعل',
      payModalTitle: 'سداد رسوم القبول',
      payableFee: 'إجمالي الرسوم المطلوبة:',
      selectMethod: 'اختر طريقة الدفع',
      instructions: 'تعليمات السداد:',
      trxIdLabel: 'رقم المعاملة (TrxID)',
      trxIdPlaceholder: 'مثال: 9B7X2Y1Z',
      cancelBtn: 'إلغاء',
      submitPaymentBtn: 'تأكيد إرسال الدفع',
      processing: 'جاري المعالجة...',
      paymentSuccessMsg: 'تم إرسال بيانات الدفع بنجاح! سيتم التحقق قريباً.',
      paymentErrorMsg: 'حدث خطأ أثناء إرسال الدفع. يرجى المحاولة مرة أخرى.',
      trxPrompt: 'يرجى إدخال رقم المعاملة (TrxID).',
      freeBadge: 'مجاني',
      feePrefix: 'الرسوم: ৳ '
    }
  };

  const t = (key: string) => dict[locale]?.[key] || dict['en'][key] || key;

  const fetchUserData = async () => {
    if (!user) return;
    try {
      // 1. Fetch application
      const qApp = query(collection(db, 'applications'), where('userId', '==', user.uid));
      const snapshotApp = await getDocs(qApp);
      if (!snapshotApp.empty) {
        setApplication({ id: snapshotApp.docs[0].id, ...snapshotApp.docs[0].data() });
      }

      // 2. Fetch enrollments
      const qEnr = query(collection(db, 'enrollments'), where('userId', '==', user.uid));
      const snapshotEnr = await getDocs(qEnr);
      if (!snapshotEnr.empty) {
        setEnrollments(snapshotEnr.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    } catch (error) {
      console.error('Error fetching applicant data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  // If user wants to view student course interface
  if (showStudentView) {
    return (
      <div className="space-y-4">
        <div className="bg-emerald-950 text-amber-400 p-3.5 rounded-2xl flex justify-between items-center text-xs font-bold shadow-md">
          <span>{t('classroomActiveBanner')}</span>
          <button 
            onClick={() => setShowStudentView(false)}
            className="px-3.5 py-1.5 bg-amber-400 text-emerald-950 rounded-xl hover:bg-amber-300 transition-colors font-extrabold"
          >
            {t('returnToOverview')}
          </button>
        </div>
        <StudentDashboard />
      </div>
    );
  }

  const enrolledCourseId = application?.courseId || enrollments[0]?.courseId;
  const rawMatchedCourse = COURSES.find(c => c.id === enrolledCourseId) || COURSES[0];
  const matchedCourse = getLocalizedCourse(rawMatchedCourse, locale);

  const handlePayFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId.trim()) {
      alert(t('trxPrompt'));
      return;
    }
    setIsPaying(true);
    try {
      if (application) {
        const appRef = doc(db, 'applications', application.id);
        await updateDoc(appRef, {
          paymentStatus: 'paid',
          paymentMethod,
          trxId,
          paidAt: new Date().toISOString()
        });
      }
      alert(t('paymentSuccessMsg'));
      setShowPaymentModal(false);
      fetchUserData();
    } catch (error) {
      console.error('Payment submit error:', error);
      alert(t('paymentErrorMsg'));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/90 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="text-xs font-bold text-slate-500">{t('hubTitle')}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {t('firebaseSecure')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#064e3b] font-serif tracking-tight">
              {t('pageHeading')}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={`/${locale}/dashboard/profile`} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all">
              {t('profileSettings')}
            </Link>
            {!isLoading && (
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold ${
                application?.status === 'approved' || enrollments.length > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                application?.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                application?.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                {application?.status === 'approved' || enrollments.length > 0 ? <CheckCircle className="w-4 h-4 text-emerald-600" /> :
                 application?.status === 'rejected' ? <XCircle className="w-4 h-4 text-red-600" /> :
                 <Clock className="w-4 h-4 text-amber-600" />}
                {application?.status === 'approved' || enrollments.length > 0 ? t('statusApproved') : 
                 application?.status === 'rejected' ? t('statusRejected') :
                 application?.status === 'pending' ? t('statusPending') : t('statusNone')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* APPROVED COURSE HIGHLIGHT CARD */}
      {(application?.status === 'approved' || enrollments.length > 0) && (
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-800 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest bg-emerald-800/60 px-3 py-1 rounded-full border border-amber-400/20">
                  {t('approvedBannerTag')}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white font-serif mt-2 leading-tight">
                  {matchedCourse?.title}
                </h3>
                <p className="text-xs text-emerald-200 mt-1 font-medium">
                  {t('durationLabel')} {matchedCourse?.duration} • {t('typeLabel')} {matchedCourse?.type}
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setShowPdfModal(true)}
                  className="px-4 py-2.5 bg-emerald-800/90 hover:bg-emerald-800 text-amber-300 font-bold text-xs rounded-xl transition-colors border border-emerald-700 flex items-center gap-2 shadow-sm"
                >
                  <FileText className="w-4 h-4 text-amber-400" /> {t('downloadPdfBtn')}
                </button>
                <button
                  onClick={() => setShowStudentView(true)}
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black text-xs rounded-xl transition-colors flex items-center gap-2 shadow-md"
                >
                  <BookOpen className="w-4 h-4" /> {t('enterClassroomBtn')}
                </button>
              </div>
            </div>

            {/* Detailed Fee Structure & Financial Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Fee Breakdown */}
              <div className="bg-emerald-900/60 p-4.5 rounded-2xl border border-emerald-800/80 space-y-2.5">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" /> {t('feeBreakdown')}
                </h4>
                <div className="text-xs space-y-2 text-emerald-100 font-sans">
                  <div className="flex justify-between">
                    <span className="text-emerald-200">{t('admissionFee')}</span>
                    <span className="font-bold">৳ {matchedCourse.fees?.admissionFee || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200">{t('tuitionFee')}</span>
                    <span className="font-bold">৳ {matchedCourse.fees?.tuitionFee || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200">{t('accommodationFee')}</span>
                    <span className="font-bold">৳ {matchedCourse.fees?.accommodationFee || 0}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-emerald-800 text-amber-300 font-extrabold text-sm">
                    <span>{t('totalFee')}</span>
                    <span>{matchedCourse.fees?.isFree ? t('freeFee') : `৳ ${matchedCourse.fees?.totalFee || 0}`}</span>
                  </div>
                </div>
              </div>

              {/* Fee Status & Zakat Assessment */}
              <div className="bg-emerald-900/60 p-4.5 rounded-2xl border border-emerald-800/80 space-y-2 md:col-span-2 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4" /> {t('scholarshipStatusTitle')}
                  </h4>

                  {application?.zakatFundStatus === 'approved_zakat' ? (
                    <div className="mt-2 bg-amber-400/20 border border-amber-400/40 p-3.5 rounded-xl text-xs text-amber-200 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {t('zakatApprovedTitle')}
                      </p>
                      <p className="text-[11px] text-emerald-200 leading-relaxed">
                        {t('zakatApprovedDesc')}
                      </p>
                    </div>
                  ) : application?.zakatFundStatus === 'approved_general' ? (
                    <div className="mt-2 bg-blue-400/20 border border-blue-400/40 p-3.5 rounded-xl text-xs text-blue-200 space-y-1">
                      <p className="font-bold text-blue-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" /> {t('generalApprovedTitle')}
                      </p>
                      <p className="text-[11px] text-emerald-200 leading-relaxed">
                        {t('generalApprovedDesc')}
                      </p>
                    </div>
                  ) : application?.zakatFundStatus === 'pending_review' ? (
                    <div className="mt-2 bg-amber-500/20 border border-amber-500/40 p-3.5 rounded-xl text-xs text-amber-200 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" /> {t('zakatPendingTitle')}
                      </p>
                      <p className="text-[11px] text-emerald-200 leading-relaxed">
                        {t('zakatPendingDesc')}
                      </p>
                    </div>
                  ) : application?.paymentStatus === 'paid' ? (
                    <div className="mt-2 bg-emerald-800/80 border border-emerald-600 p-3.5 rounded-xl text-xs text-emerald-100 space-y-1">
                      <p className="font-bold text-amber-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" /> {t('feePaidTitle')}
                      </p>
                      <p className="text-[11px] text-emerald-200 font-mono">TrxID: {application.trxId || 'Verified'}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-200 mt-2 leading-relaxed">
                      {t('payAdmissionFeePrompt')}
                    </p>
                  )}
                </div>

                {!application?.zakatFundStatus?.startsWith('approved') && application?.paymentStatus !== 'paid' && (
                  <div className="flex flex-wrap gap-2.5 pt-3">
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
                    >
                      {t('payFeeBtn')}
                    </button>
                    <button
                      onClick={() => setShowZakatModal(true)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs rounded-xl transition-colors border border-emerald-700 flex items-center gap-1.5 shadow-sm"
                    >
                      <HeartHandshake className="w-4 h-4" /> {t('applyZakatBtn')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid with Available Programs and Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="font-bold text-lg text-emerald-950 font-serif mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              {t('availablePrograms')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COURSES.map((rawCourse) => {
                const course = getLocalizedCourse(rawCourse, locale);
                return (
                  <div key={course.id} className="border border-slate-200/90 hover:border-emerald-600 rounded-2xl p-5 transition-all group flex flex-col justify-between bg-white hover:shadow-sm">
                    <div>
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800 group-hover:scale-105 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        {course.fees.isFree ? (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                            {t('freeBadge')}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full font-mono">
                            {t('feePrefix')}{course.fees.totalFee}
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-emerald-900 transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 font-medium">
                        {course.duration} • {course.type}
                      </p>
                      {course.fees.notes && (
                        <p className="text-[11px] text-slate-400 mt-1.5 italic line-clamp-2 leading-relaxed">
                          {course.fees.notes}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <Link 
                        href={`/${locale}/dashboard/apply?course=${course.id}`} 
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        {t('applyNowBtn')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 sm:p-7 rounded-3xl text-white shadow-md relative overflow-hidden border border-emerald-800">
            <div className="relative z-10">
              <h3 className="text-amber-400 font-bold uppercase text-[10px] tracking-widest mb-1.5">
                {t('statusOverviewHeader')}
              </h3>
              {isLoading ? (
                <p className="text-sm mt-2 opacity-80">Loading...</p>
              ) : application || enrollments.length > 0 ? (
                <>
                  <p className="text-lg font-black font-serif">
                    {application?.status === 'approved' || enrollments.length > 0 ? t('statusApproved') :
                     application?.status === 'rejected' ? t('statusRejected') :
                     t('statusPending')}
                  </p>
                  <p className="text-xs mt-2.5 opacity-90 leading-relaxed text-emerald-100">
                    {application?.status === 'approved' || enrollments.length > 0
                      ? t('congratsApprovedDesc')
                      : application?.status === 'rejected'
                      ? t('rejectedDesc')
                      : t('reviewPendingDesc')}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-black font-serif">{t('submitApplicationTitle')}</p>
                  <p className="text-xs mt-2.5 opacity-90 leading-relaxed text-emerald-100">
                    {t('submitApplicationDesc')}
                  </p>
                  <Link 
                    href={`/${locale}/dashboard/apply`} 
                    className="mt-4.5 block w-full py-2.5 bg-amber-400 text-center text-emerald-950 font-black text-xs rounded-xl hover:bg-amber-300 transition-colors shadow-sm"
                  >
                    {t('applyNowBtn')}
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-100 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 mb-4 font-serif">{t('admissionSteps')}</h3>
            <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-0.5 before:bg-slate-100">
              <div className="flex gap-3.5 relative">
                <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-white z-10 flex-shrink-0 mt-0.5"></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t('stepCreateAccount')}</h4>
                  <p className="text-[10px] text-emerald-600 font-semibold">{t('stepCompleted')}</p>
                </div>
              </div>
              <div className="flex gap-3.5 relative">
                <div className={`w-4 h-4 rounded-full ${application ? 'bg-emerald-500' : 'bg-amber-400'} ring-4 ring-white z-10 flex-shrink-0 mt-0.5`}></div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t('stepSubmitForm')}</h4>
                  <p className={`text-[10px] ${application ? 'text-emerald-600' : 'text-amber-600'} font-semibold`}>
                    {application ? t('stepCompleted') : t('stepPending')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3.5 relative">
                <div className={`w-4 h-4 rounded-full ${application?.status === 'approved' ? 'bg-emerald-500' : application?.status === 'pending' ? 'bg-amber-400' : 'bg-slate-200'} ring-4 ring-white z-10 flex-shrink-0 mt-0.5`}></div>
                <div>
                  <h4 className={`text-xs font-bold ${application?.status === 'approved' ? 'text-slate-900' : 'text-slate-500'}`}>{t('stepReview')}</h4>
                  <p className={`text-[10px] ${application?.status === 'approved' ? 'text-emerald-600' : application?.status === 'pending' ? 'text-amber-600' : 'text-slate-400'} font-semibold`}>
                    {application?.status === 'approved' ? t('stepApproved') : application?.status === 'pending' ? t('stepPending') : t('stepLocked')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3.5 relative">
                <div className={`w-4 h-4 rounded-full ${application?.status === 'approved' ? 'bg-emerald-500' : 'bg-slate-200'} ring-4 ring-white z-10 flex-shrink-0 mt-0.5`}></div>
                <div>
                  <h4 className={`text-xs font-bold ${application?.status === 'approved' ? 'text-slate-900' : 'text-slate-500'}`}>{t('stepClassAccess')}</h4>
                  <p className={`text-[10px] ${application?.status === 'approved' ? 'text-emerald-600' : 'text-slate-400'} font-semibold`}>
                    {application?.status === 'approved' ? t('stepActive') : t('stepLocked')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Admission Fee Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 text-xs shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-serif">{t('payModalTitle')}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-emerald-950 font-medium">
              {t('payableFee')} <strong className="text-emerald-900 font-extrabold text-sm ml-1">৳ {matchedCourse?.fees?.totalFee || 0}</strong>
            </div>

            <form onSubmit={handlePayFeeSubmit} className="space-y-3.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">{t('selectMethod')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['bkash', 'nagad', 'bank'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-center font-bold uppercase transition-all ${
                        paymentMethod === m ? 'bg-emerald-900 text-amber-400 border-emerald-950 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">{t('instructions')}</p>
                <p>bKash / Nagad Merchant: <strong className="text-emerald-900 font-mono">01700000000</strong> (Make Payment)</p>
                <p>Bank Account: As-Sunnah Foundation, A/C: 123456789</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t('trxIdLabel')}</label>
                <input
                  type="text"
                  required
                  placeholder={t('trxIdPlaceholder')}
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-emerald-700 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={isPaying}
                  className="px-5 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-amber-400 font-bold rounded-xl shadow-sm transition-colors"
                >
                  {isPaying ? t('processing') : t('submitPaymentBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zakat Assessment Modal */}
      {showZakatModal && (
        <ZakatAssessmentModal
          application={application}
          course={matchedCourse}
          onClose={() => setShowZakatModal(false)}
          onSuccess={() => {
            setShowZakatModal(false);
            fetchUserData();
          }}
        />
      )}

      {/* PDF Admission Form Modal */}
      {showPdfModal && (
        <AdmissionFormPdfModal
          application={application}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
}
