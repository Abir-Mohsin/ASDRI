'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { BookOpen, Users, Clock, Search, Filter, PlayCircle, FileText, MoreVertical, X, Trash2, Calendar, Edit2, Upload, Link as LinkIcon, ShieldCheck, GraduationCap, Image as ImageIcon, Wallet, Settings, User } from 'lucide-react';
import Link from 'next/link';
import FormBuilder, { defaultAdmissionFields, FormField } from '@/components/dashboards/FormBuilder';
import ZakatFormCustomizerModal from '@/components/dashboards/ZakatFormCustomizerModal';
import { DEFAULT_ZAKAT_FORM_FIELDS, ZakatFormField } from '@/lib/constants/zakatFormTemplate';
import { useParams } from 'next/navigation';
import { collection, query, getDocs, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getOptimizedImageUrl } from '@/lib/imageUtils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

// i18n Translations
const pt = {
  en: {
    title: "All Courses & Academic Programs",
    sub: "Manage and edit academic courses, schedules, batch numbers, posters, and curriculum outlines.",
    createBtn: "+ Create New Course",
    searchPlaceholder: "Search courses by name, code, or instructor...",
    filter: "Filter",
    studentsEnrolled: "Students Enrolled",
    progress: "Progress",
    nextClass: "Next Class",
    modalTitle: "Create New Course",
    modalSub: "Fill in the details below to add a new academic program.",
    editModalTitle: "Edit Course Details",
    editModalSub: "Update the course information, dates, batch number, poster, and outline.",
    courseTitleLabel: "Course Title *",
    courseTitlePlaceholder: "e.g., Fiqh of Transaction (Advanced)",
    courseCodeLabel: "Course Code *",
    courseCodePlaceholder: "e.g., FQH-202",
    facultyDropdownLabel: "Select Instructor from Faculty (Optional)",
    facultyDropdownCustom: "-- Manual / Custom Instructor --",
    instructorLabel: "Instructor Name *",
    instructorPlaceholder: "e.g., Mufti Ibrahim",
    instructorRoleLabel: "Instructor Role / Designation",
    instructorRolePlaceholder: "e.g., Faculty Member & Senior Researcher",
    instructorAvatarOptionLabel: "Instructor Photo (Upload Image or Link / Google Drive)",
    instructorAvatarFileLabel: "Upload Instructor Photo",
    instructorAvatarUrlPlaceholder: "https://... or Google Drive image link",
    studyModeLabel: "Study Mode",
    studyModePlaceholder: "e.g., On-Campus & Online Hybrid",
    instructionLanguageLabel: "Instruction Language",
    instructionLanguagePlaceholder: "e.g., Arabic & Bengali with Academic English",
    typeLabel: "Course Type",
    core: "Core",
    elective: "Elective",
    nextClassLabel: "Next Class Schedule",
    nextClassPlaceholder: "e.g., Sunday, 4:00 PM",
    progressLabel: "Initial Progress (%)",
    studentsLabel: "Initial Students Count",
    durationLabel: "Duration (e.g., 6 Months, 2 Years)",
    durationPlaceholder: "e.g., 1 Year",
    batchLabel: "Batch Number",
    batchPlaceholder: "e.g., Batch 03",
    startDateLabel: "Start Date",
    endDateLabel: "End Date",
    posterOptionLabel: "Course Poster / Banner (Upload Image file or provide any Link URL)",
    posterFileLabel: "Upload Poster File",
    posterUrlPlaceholder: "https://example.com/poster.jpg",
    curriculumLabel: "Course Outline / Curriculum (One item per line)",
    curriculumPlaceholder: "Enter each curriculum topic on a new line\ne.g., Topic 1: Arabic Nahw\nTopic 2: Arabic Sarf",
    descriptionLabel: "Course Description",
    descriptionPlaceholder: "Detailed information about the academic program...",
    eligibilityLabel: "Eligibility Criteria",
    eligibilityPlaceholder: "e.g., Minimum HSC or equivalent Islamic standard",
    cancel: "Cancel",
    save: "Save Course",
    editBtn: "Edit",
    deleteBtn: "Delete",
    requiredFields: "Please fill in all required fields (Title, Code, and Instructor).",
    saving: "Saving...",
    loading: "Loading courses...",
    deleteConfirm: "Are you sure you want to delete this course? This action cannot be undone.",
    scheduleDates: "Duration Dates",
    fromTo: "to",
    viewDetails: "View Details & Curriculum",
    curriculumTitle: "Course Outline / Curriculum",
    close: "Close"
  },
  bn: {
    title: "সকল কোর্স ও একাডেমিক প্রোগ্রাম",
    sub: "একাডেমিক কোর্স, সময়সূচী, ব্যাচ নাম্বার, পোস্টার এবং কারিকুলাম আউটলাইন পরিচালনা ও এডিট করুন।",
    createBtn: "+ নতুন কোর্স তৈরি করুন",
    searchPlaceholder: "নাম, কোড বা শিক্ষক দিয়ে কোর্স খুঁজুন...",
    filter: "ফিল্টার",
    studentsEnrolled: "শিক্ষার্থী তালিকাভুক্ত",
    progress: "অগ্রগতি",
    nextClass: "পরবর্তী ক্লাস",
    modalTitle: "নতুন কোর্স তৈরি করুন",
    modalSub: "একটি নতুন একাডেমিক প্রোগ্রাম যোগ করতে নিচের বিবরণগুলো পূরণ করুন।",
    editModalTitle: "কোর্স পরিবর্তন / এডিট করুন",
    editModalSub: "কোর্সের তথ্য, ক্লাসের সময়কাল, ব্যাচ নম্বর, পোস্টার ও কারিকুলাম আপডেট করুন।",
    courseTitleLabel: "কোর্সের শিরোনাম *",
    courseTitlePlaceholder: "যেমন: ফিকহুল মুয়ামালাত (উচ্চতর)",
    courseCodeLabel: "কোর্স কোড *",
    courseCodePlaceholder: "যেমন: FQH-202",
    facultyDropdownLabel: "ফ্যাকাল্টি মেম্বার থেকে ইনস্ট্রাক্টর নির্বাচন করুন (ঐচ্ছিক)",
    facultyDropdownCustom: "-- স্বনির্ধারিত / অন্য ইনস্ট্রাক্টর লিখুন --",
    instructorLabel: "প্রশিক্ষক/শিক্ষকের নাম *",
    instructorPlaceholder: "যেমন: মুফতি ইব্রাহিম",
    instructorRoleLabel: "প্রশিক্ষকের পদবী / ভূমিকা",
    instructorRolePlaceholder: "যেমন: অনুষদ সদস্য ও সিনিয়র গবেষক",
    instructorAvatarOptionLabel: "প্রশিক্ষকের ছবি (ছবি ফাইল আপলোড বা গুগল ড্রাইভ/ওয়েব লিংক দিন)",
    instructorAvatarFileLabel: "প্রশিক্ষকের ছবি আপলোড",
    instructorAvatarUrlPlaceholder: "https://... বা গুগল ড্রাইভ ইমেজ লিংক",
    studyModeLabel: "পাঠদান মাধ্যম (Study Mode)",
    studyModePlaceholder: "যেমন: অন-ক্যাম্পাস ও অনলাইন লাইভ হাইব্রিড",
    instructionLanguageLabel: "শিক্ষাদানের ভাষা (Instruction Language)",
    instructionLanguagePlaceholder: "যেমন: আরবি ও বাংলা (প্রয়োজনে প্রাতিষ্ঠানিক ইংরেজি)",
    typeLabel: "কোর্সের ধরন",
    core: "আবশ্যিক (Core)",
    elective: "ঐচ্ছিক (Elective)",
    nextClassLabel: "পরবর্তী ক্লাসের সময়সূচী",
    nextClassPlaceholder: "যেমন: রবিবার, বিকাল ৪:০০ টা",
    progressLabel: "প্রাথমিক অগ্রগতি (%)",
    studentsLabel: "প্রাথমিক শিক্ষার্থীর সংখ্যা",
    durationLabel: "মেয়াদ (যেমন: ৬ মাস, ২ বছর)",
    durationPlaceholder: "যেমন: ১ বছর",
    batchLabel: "ব্যাচ নম্বর (Batch)",
    batchPlaceholder: "যেমন: ব্যাচ ০৩",
    startDateLabel: "শুরুর তারিখ",
    endDateLabel: "শেষের তারিখ",
    posterOptionLabel: "কোর্স পোস্টার / ব্যানার (ফাইল আপলোড করুন অথবা যেকোনো ইমেজ লিংক দিন)",
    posterFileLabel: "পোস্টার ফাইল আপলোড করুন",
    posterUrlPlaceholder: "https://example.com/poster.jpg",
    curriculumLabel: "কোর্স আউটলাইন / কারিকুলাম (প্রতি লাইনে একটি করে বিষয়)",
    curriculumPlaceholder: "প্রতি লাইনে একটি করে আউটলাইনের টপিক লিখুন\nযেমন: বিষয় ১: আরবি নাহু\nবিষয় ২: আরবি সরফ",
    descriptionLabel: "কোর্সের বিবরণ",
    descriptionPlaceholder: "একাডেমিক প্রোগ্রামটির বিস্তারিত তথ্য...",
    eligibilityLabel: "ভর্তির যোগ্যতা",
    eligibilityPlaceholder: "যেমন: ন্যূনতম এইচএসসি বা সমমানের মাদ্রাসা ব্যাকগ্রাউন্ড",
    cancel: "বাতিল করুন",
    save: "কোর্স সংরক্ষণ করুন",
    editBtn: "এডিট",
    deleteBtn: "মুছে ফেলুন",
    requiredFields: "দয়া করে সকল আবশ্যিক ক্ষেত্রগুলো (শিরোনাম, কোড এবং শিক্ষক) পূরণ করুন।",
    saving: "সংরক্ষণ করা হচ্ছে...",
    loading: "কোর্স লোড হচ্ছে...",
    deleteConfirm: "আপনি কি নিশ্চিত যে এই কোর্সটি মুছে ফেলতে চান? এই কাজটি আর ফেরত নেওয়া যাবে না।",
    scheduleDates: "ক্লাসের সময়কাল",
    fromTo: "থেকে",
    viewDetails: "বিস্তারিত ও সিলেবাস দেখুন",
    curriculumTitle: "কোর্স কারিকুলাম ও আউটলাইন",
    close: "বন্ধ করুন"
  },
  ar: {
    title: "إدارة المقررات والبرامج الأكاديمية",
    sub: "إدارة وتعديل المقررات والبرامج الأكاديمية، والجدول الزمني، ورقم الدفعة، وملصقات الدورة، والمنهج.",
    createBtn: "+ إنشاء مقرر دراسي جديد",
    searchPlaceholder: "ابحث عن المقررات بالاسم، الرمز أو المدرس...",
    filter: "تصفية",
    studentsEnrolled: "طالباً مسجلاً",
    progress: "التقدم الحالي",
    nextClass: "الدرس القادم",
    modalTitle: "إنشاء مقرر دراسي جديد",
    modalSub: "يرجى ملء التفاصيل أدناه لإضافة برنامج أكاديمي جديد للقسم.",
    editModalTitle: "تعديل بيانات المقرر الدراسي",
    editModalSub: "تحديث معلومات المقرر الدراسي، والتواريخ، ورقم الدفعة، وملصق الدورة، والمنهج.",
    courseTitleLabel: "عنوان المقرر الدراسي *",
    courseTitlePlaceholder: "مثال: فقه المعاملات (المتقدم)",
    courseCodeLabel: "رمز المقرر الدراسي *",
    courseCodePlaceholder: "مثال: FQH-202",
    facultyDropdownLabel: "اختر المدرس من أعضاء هيئة التدريس (اختياري)",
    facultyDropdownCustom: "-- مدرس مخصص / يدوي --",
    instructorLabel: "اسم المدرس / الشيخ *",
    instructorPlaceholder: "مثال: المفتي إبراهيم",
    instructorRoleLabel: "المسمى والصفة العلمية للمدرس",
    instructorRolePlaceholder: "مثال: عضو هيئة التدريس وباحث أول",
    instructorAvatarOptionLabel: "صورة المدرس (تحميل ملف أو إدخال رابط)",
    instructorAvatarFileLabel: "تحميل صورة المدرس",
    instructorAvatarUrlPlaceholder: "رابط الصورة أو رابط جوجل درايف",
    studyModeLabel: "نمط الدراسة",
    studyModePlaceholder: "مثال: حضوري وعبر المنصة التعليمية",
    instructionLanguageLabel: "لغة التدريس",
    instructionLanguagePlaceholder: "مثال: العربية والبنغالية مع الإنجليزية الأكاديمية",
    typeLabel: "نوع المقرر",
    core: "أساسي (Core)",
    elective: "اختياري (Elective)",
    nextClassLabel: "موعد الدرس القادم",
    nextClassPlaceholder: "مثال: الأحد، 4:00 مساءً",
    progressLabel: "التقدم الأولي (%)",
    studentsLabel: "عدد الطلاب الأولي",
    durationLabel: "المدة الزمنية",
    durationPlaceholder: "مثال: سنة واحدة",
    batchLabel: "رقم الدفعة",
    batchPlaceholder: "مثال: الدفعة 03",
    startDateLabel: "تاريخ البدء",
    endDateLabel: "تاريخ الانتهاء",
    posterOptionLabel: "ملصق المقرر الدراسي (تحميل ملف أو إدخال رابط خارجي)",
    posterFileLabel: "تحميل ملف الملصق",
    posterUrlPlaceholder: "https://example.com/poster.jpg",
    curriculumLabel: "منهج البرنامج الدراسي (موضوع واحد في كل سطر)",
    curriculumPlaceholder: "أدخل كل موضوع في سطر منفصل\nمثال: الموضوع الأول: النحو العربي\nالموضوع الثاني: الصرف العربي",
    descriptionLabel: "وصف المقرر الدراسي",
    descriptionPlaceholder: "معلومات تفصيلية حول البرنامج الأكاديمي...",
    eligibilityLabel: "شروط القبول والأهلية",
    eligibilityPlaceholder: "مثال: حد أدنى شهادة الثانوية العامة أو ما يعادلها شرعياً",
    cancel: "إلغاء",
    save: "حفظ المقرر الدراسي",
    editBtn: "تعديل",
    deleteBtn: "حذف",
    requiredFields: "يرجى تعبئة جميع الحقول المطلوبة (العنوان، الرمز، واسم المدرس).",
    saving: "جاري الحفظ...",
    loading: "جاري تحميل المقررات...",
    deleteConfirm: "هل أنت متأكد من رغبتك في حذف هذا المقرر الدراسي؟ لا يمكن التراجع عن هذا الإجراء.",
    scheduleDates: "فترة البرنامج",
    fromTo: "إلى",
    viewDetails: "عرض التفاصيل والمنهج",
    curriculumTitle: "منهج المقرر الدراسي",
    close: "إغلاق"
  }
};

export default function CoursesPage() {
  const { role } = useAuthStore();
  const params = useParams();
  const locale = (params?.locale as 'en' | 'bn' | 'ar') || 'en';
  const dict = pt[locale] || pt.en;

  const canManage = role === 'admin' || role === 'super_admin' || role === 'academic_officer';

  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any | null>(null);

  // Zakat Form Customizer Modal State
  const [isZakatCustomizerOpen, setIsZakatCustomizerOpen] = useState(false);
  const [customizerTargetMode, setCustomizerTargetMode] = useState<'create' | 'edit'>('create');

  // Form states
  const [facultyList, setFacultyList] = useState<any[]>([]);

  const [newCourse, setNewCourse] = useState({
    title: '',
    code: '',
    instructor: '',
    instructorRole: '',
    instructorAvatar: '',
    studyMode: 'On-Campus & Online Hybrid',
    instructionLanguage: 'Arabic & Bengali with Academic English',
    selectedFacultyId: '',
    type: 'Core',
    nextClass: '',
    progress: 0,
    students: 0,
    duration: '1 Year',
    batchNumber: '',
    startDate: '',
    endDate: '',
    posterUrl: '',
    curriculum: '',
    description: '',
    eligibility: '',
    admissionFormFields: defaultAdmissionFields,
    admissionFee: 1000,
    tuitionFee: 5000,
    accommodationFee: 0,
    totalFee: 6000,
    isFree: false,
    allowScholarship: true,
    zakatFormFields: DEFAULT_ZAKAT_FORM_FIELDS,
    zakatFormTitle: '',
    zakatFormSubtitle: '',
    zakatWarningText: '',
    zakatUndertakingText: ''
  });

  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string; code?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-dismiss success toast after 4 seconds
  useEffect(() => {
    if (successToast) {
      const timer = setTimeout(() => setSuccessToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successToast]);

  // Fetch faculty list for instructor dropdown
  useEffect(() => {
    const fetchFacultyProfiles = async () => {
      try {
        const q = collection(db, 'faculty_profiles');
        const snap = await getDocs(q);
        if (!snap.empty) {
          const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
          setFacultyList(list);
        }
      } catch (err) {
        console.warn('Could not fetch faculty profiles:', err);
      }
    };
    fetchFacultyProfiles();
  }, []);

  // Firestore Error Handler helper (non-fatal logging)
  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`Firestore [${operationType}] Error on ${path}:`, errMsg);
    return errMsg;
  };

  // Auto triggers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('action') === 'create' && canManage) {
        const triggerOpen = async () => {
          await Promise.resolve();
          setIsModalOpen(true);
        };
        triggerOpen();
      }
    }
  }, [canManage]);

  // Fetch courses from Firestore without any dummy data auto-seeding
  useEffect(() => {
    const fetchCoursesFromDb = async () => {
      setIsLoading(true);
      try {
        const q = collection(db, 'courses');
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

        // Sort by newest first
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setCourses(list);
      } catch (error) {
        console.error('Firestore listing error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoursesFromDb();
  }, []);

  // Handle Base64 file conversions
  const handlePosterFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditMode) {
          setEditingCourse((prev: any) => ({ ...prev, posterUrl: base64String }));
        } else {
          setNewCourse((prev: any) => ({ ...prev, posterUrl: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInstructorAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEditMode) {
          setEditingCourse((prev: any) => ({ ...prev, instructorAvatar: base64String }));
        } else {
          setNewCourse((prev: any) => ({ ...prev, instructorAvatar: base64String }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectFacultyForNew = (facultyId: string) => {
    if (!facultyId) {
      setNewCourse(prev => ({ ...prev, selectedFacultyId: '' }));
      return;
    }
    const f = facultyList.find(item => item.id === facultyId);
    if (f) {
      setNewCourse(prev => ({
        ...prev,
        selectedFacultyId: facultyId,
        instructor: f.name || f.nameEn || prev.instructor,
        instructorRole: f.designation || f.designationEn || 'অনুষদ সদস্য ও গবেষক',
        instructorAvatar: f.photoUrl || ''
      }));
    }
  };

  const handleSelectFacultyForEdit = (facultyId: string) => {
    if (!facultyId) {
      setEditingCourse((prev: any) => ({ ...prev, selectedFacultyId: '' }));
      return;
    }
    const f = facultyList.find(item => item.id === facultyId);
    if (f) {
      setEditingCourse((prev: any) => ({
        ...prev,
        selectedFacultyId: facultyId,
        instructor: f.name || f.nameEn || prev.instructor,
        instructorRole: f.designation || f.designationEn || 'অনুষদ সদস্য ও গবেষক',
        instructorAvatar: f.photoUrl || ''
      }));
    }
  };

  // Create Course handler
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourse.title.trim() || !newCourse.code.trim() || !newCourse.instructor.trim()) {
      setSubmitError(dict.requiredFields);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const calculatedTotal = newCourse.isFree
        ? 0
        : (Number(newCourse.admissionFee) || 0) + (Number(newCourse.tuitionFee) || 0) + (Number(newCourse.accommodationFee) || 0);

      const titleTrimmed = newCourse.title.trim();
      const codeTrimmed = newCourse.code.trim().toUpperCase();
      const instructorTrimmed = newCourse.instructor.trim();
      const descTrimmed = newCourse.description.trim();

      const coursePayload = {
        title: titleTrimmed,
        titleEn: titleTrimmed,
        titleBn: titleTrimmed,
        titleAr: titleTrimmed,
        code: codeTrimmed,
        instructor: instructorTrimmed,
        instructorRole: newCourse.instructorRole?.trim() || 'অনুষদ সদস্য ও গবেষক',
        instructorAvatar: newCourse.instructorAvatar?.trim() ? getOptimizedImageUrl(newCourse.instructorAvatar.trim()) : '',
        studyMode: newCourse.studyMode?.trim() || 'On-Campus & Online Hybrid',
        instructionLanguage: newCourse.instructionLanguage?.trim() || 'Arabic & Bengali with Academic English',
        type: newCourse.type || 'Core',
        nextClass: newCourse.nextClass.trim() || 'TBD',
        progress: Number(newCourse.progress) || 0,
        students: Number(newCourse.students) || 0,
        duration: newCourse.duration.trim() || '1 Year',
        batchNumber: newCourse.batchNumber.trim() || 'Batch 01',
        startDate: newCourse.startDate.trim(),
        endDate: newCourse.endDate.trim(),
        posterUrl: getOptimizedImageUrl(newCourse.posterUrl.trim()),
        curriculum: newCourse.curriculum.trim(),
        description: descTrimmed,
        descriptionEn: descTrimmed,
        descriptionBn: descTrimmed,
        descriptionAr: descTrimmed,
        eligibility: newCourse.eligibility.trim(),
        admissionFormFields: newCourse.admissionFormFields,
        fees: {
          admissionFee: newCourse.isFree ? 0 : Number(newCourse.admissionFee) || 0,
          tuitionFee: newCourse.isFree ? 0 : Number(newCourse.tuitionFee) || 0,
          accommodationFee: newCourse.isFree ? 0 : Number(newCourse.accommodationFee) || 0,
          totalFee: calculatedTotal,
          isFree: newCourse.isFree,
          currency: 'BDT',
        },
        allowScholarship: newCourse.allowScholarship,
        zakatFormEnabled: newCourse.allowScholarship,
        zakatFormFields: newCourse.zakatFormFields || DEFAULT_ZAKAT_FORM_FIELDS,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'courses'), coursePayload);
      
      // Update local state list
      setCourses(prev => [{ id: docRef.id, ...coursePayload }, ...prev]);
      
      // Reset form
      setNewCourse({
        title: '',
        code: '',
        instructor: '',
        instructorRole: '',
        instructorAvatar: '',
        studyMode: 'On-Campus & Online Hybrid',
        instructionLanguage: 'Arabic & Bengali with Academic English',
        selectedFacultyId: '',
        type: 'Core',
        nextClass: '',
        progress: 0,
        students: 0,
        duration: '1 Year',
        batchNumber: '',
        startDate: '',
        endDate: '',
        posterUrl: '',
        curriculum: '',
        description: '',
        eligibility: '',
        admissionFormFields: defaultAdmissionFields,
        admissionFee: 1000,
        tuitionFee: 5000,
        accommodationFee: 0,
        totalFee: 6000,
        isFree: false,
        allowScholarship: true,
        zakatFormFields: DEFAULT_ZAKAT_FORM_FIELDS,
        zakatFormTitle: '',
        zakatFormSubtitle: '',
        zakatWarningText: '',
        zakatUndertakingText: ''
      });
      setIsModalOpen(false);
      setSuccessToast(
        locale === 'bn' 
          ? 'নতুন কোর্সটি সফলভাবে তৈরি হয়েছে!' 
          : locale === 'ar' 
          ? 'تم إنشاء المقرر الدراسي بنجاح!' 
          : 'New course created successfully!'
      );
    } catch (err: any) {
      console.error('Error writing course to Firestore:', err);
      const msg = err?.message || 'Failed to save course.';
      setSubmitError(locale === 'bn' ? `কোর্স যোগ করতে সমস্যা হয়েছে: ${msg}` : `Failed to save course: ${msg}`);
      handleFirestoreError(err, OperationType.CREATE, 'courses');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Mode
  const openEditModal = (course: any, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening details
    const matchedFaculty = facultyList.find(f => f.name === course.instructor || f.nameEn === course.instructor);
    setEditingCourse({
      id: course.id,
      title: course.title || '',
      code: course.code || '',
      instructor: course.instructor || '',
      instructorRole: course.instructorRole || 'অনুষদ সদস্য ও গবেষক',
      instructorAvatar: course.instructorAvatar || '',
      studyMode: course.studyMode || 'On-Campus & Online Hybrid',
      instructionLanguage: course.instructionLanguage || 'Arabic & Bengali with Academic English',
      selectedFacultyId: matchedFaculty ? matchedFaculty.id : '',
      type: course.type || 'Core',
      nextClass: course.nextClass || '',
      progress: course.progress || 0,
      students: course.students || 0,
      duration: course.duration || '1 Year',
      batchNumber: course.batchNumber || '',
      startDate: course.startDate || '',
      endDate: course.endDate || '',
      posterUrl: course.posterUrl || '',
      curriculum: course.curriculum || '',
      description: course.description || '',
      eligibility: course.eligibility || '',
      admissionFormFields: course.admissionFormFields || defaultAdmissionFields,
      admissionFee: course.fees?.admissionFee ?? 1000,
      tuitionFee: course.fees?.tuitionFee ?? 5000,
      accommodationFee: course.fees?.accommodationFee ?? 0,
      totalFee: course.fees?.totalFee ?? 6000,
      isFree: course.fees?.isFree ?? false,
      allowScholarship: course.allowScholarship ?? true,
      zakatFormFields: course.zakatFormFields || DEFAULT_ZAKAT_FORM_FIELDS
    });
    setIsEditModalOpen(true);
  };

  // Update Course handler
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title.trim() || !editingCourse.code.trim() || !editingCourse.instructor.trim()) {
      setSubmitError(dict.requiredFields);
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const calculatedTotal = editingCourse.isFree
        ? 0
        : (Number(editingCourse.admissionFee) || 0) + (Number(editingCourse.tuitionFee) || 0) + (Number(editingCourse.accommodationFee) || 0);

      const titleTrimmed = editingCourse.title.trim();
      const codeTrimmed = editingCourse.code.trim().toUpperCase();
      const instructorTrimmed = editingCourse.instructor.trim();
      const descTrimmed = editingCourse.description.trim();

      const coursePayload = {
        title: titleTrimmed,
        titleEn: titleTrimmed,
        titleBn: titleTrimmed,
        titleAr: titleTrimmed,
        code: codeTrimmed,
        instructor: instructorTrimmed,
        instructorRole: editingCourse.instructorRole?.trim() || 'অনুষদ সদস্য ও গবেষক',
        instructorAvatar: editingCourse.instructorAvatar?.trim() ? getOptimizedImageUrl(editingCourse.instructorAvatar.trim()) : '',
        studyMode: editingCourse.studyMode?.trim() || 'On-Campus & Online Hybrid',
        instructionLanguage: editingCourse.instructionLanguage?.trim() || 'Arabic & Bengali with Academic English',
        type: editingCourse.type,
        nextClass: editingCourse.nextClass.trim() || 'TBD',
        progress: Number(editingCourse.progress) || 0,
        students: Number(editingCourse.students) || 0,
        duration: editingCourse.duration.trim() || '1 Year',
        batchNumber: editingCourse.batchNumber.trim(),
        startDate: editingCourse.startDate.trim(),
        endDate: editingCourse.endDate.trim(),
        posterUrl: getOptimizedImageUrl(editingCourse.posterUrl.trim()),
        curriculum: editingCourse.curriculum.trim(),
        description: descTrimmed,
        descriptionEn: descTrimmed,
        descriptionBn: descTrimmed,
        descriptionAr: descTrimmed,
        eligibility: editingCourse.eligibility.trim(),
        admissionFormFields: editingCourse.admissionFormFields,
        fees: {
          admissionFee: editingCourse.isFree ? 0 : Number(editingCourse.admissionFee) || 0,
          tuitionFee: editingCourse.isFree ? 0 : Number(editingCourse.tuitionFee) || 0,
          accommodationFee: editingCourse.isFree ? 0 : Number(editingCourse.accommodationFee) || 0,
          totalFee: calculatedTotal,
          isFree: editingCourse.isFree,
          currency: 'BDT',
        },
        allowScholarship: editingCourse.allowScholarship,
        zakatFormEnabled: editingCourse.allowScholarship,
        zakatFormFields: editingCourse.zakatFormFields || DEFAULT_ZAKAT_FORM_FIELDS
      };

      await updateDoc(doc(db, 'courses', editingCourse.id), coursePayload);
      
      // Update local state list
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, ...coursePayload } : c));
      
      // Update selected details modal if open
      if (selectedCourseDetails && selectedCourseDetails.id === editingCourse.id) {
        setSelectedCourseDetails({ id: editingCourse.id, ...coursePayload });
      }

      setIsEditModalOpen(false);
      setEditingCourse(null);
      setSuccessToast(
        locale === 'bn' 
          ? 'কোর্সের তথ্য সফলভাবে আপডেট হয়েছে!' 
          : locale === 'ar' 
          ? 'تم تحديث بيانات المقرر بنجاح!' 
          : 'Course updated successfully!'
      );
    } catch (err: any) {
      console.error('Error updating course in Firestore:', err);
      const msg = err?.message || 'Failed to update course details.';
      setSubmitError(locale === 'bn' ? `কোর্স আপডেট করতে সমস্যা হয়েছে: ${msg}` : `Failed to update course: ${msg}`);
      handleFirestoreError(err, OperationType.UPDATE, `courses/${editingCourse.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request Delete Course Modal
  const requestDeleteCourse = (course: { id: string; title: string; code?: string }, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setCourseToDelete(course);
  };

  // Confirm and Execute Delete Course
  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, 'courses', courseToDelete.id));
      setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
      if (selectedCourseDetails && selectedCourseDetails.id === courseToDelete.id) {
        setSelectedCourseDetails(null);
      }
      const deletedTitle = courseToDelete.title;
      setCourseToDelete(null);
      setSuccessToast(
        locale === 'bn'
          ? `"${deletedTitle}" কোর্সটি সফলভাবে মুছে ফেলা হয়েছে।`
          : locale === 'ar'
          ? `تم حذف المقرر "${deletedTitle}" بنجاح.`
          : `Course "${deletedTitle}" deleted successfully.`
      );
    } catch (err: any) {
      console.error('Error deleting course:', err);
      const errMsg = err?.message || 'Failed to delete course.';
      alert(locale === 'bn' ? `কোর্সটি মুছতে ব্যর্থ হয়েছে: ${errMsg}` : `Failed to delete course: ${errMsg}`);
      handleFirestoreError(err, OperationType.DELETE, `courses/${courseToDelete.id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">
            {role === 'teacher' ? 'My Classes' : role === 'student' ? 'My Enrolled Courses' : dict.title}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {dict.sub}
          </p>
        </div>
        <div className="flex gap-2">
          {canManage && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-[#064e3b] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-emerald-900 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              {dict.createBtn}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400`} />
          <input 
            type="text" 
            placeholder={dict.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full ${locale === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-[#064e3b] outline-none text-xs transition-all`}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold whitespace-nowrap">
          <Filter className="w-3.5 h-3.5" /> {dict.filter}
        </button>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#064e3b]"></div>
          <p>{dict.loading}</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 text-sm italic">No courses found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id} 
              onClick={() => setSelectedCourseDetails(course)}
              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-200 transition-all group flex flex-col cursor-pointer"
            >
              {/* Header Poster/Banner area */}
              <div className="h-32 bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                {course.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={getOptimizedImageUrl(course.posterUrl)} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#064e3b] opacity-[0.95] flex flex-col justify-between p-3.5 text-white">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[9px] font-bold">
                        {course.code}
                      </span>
                      {course.batchNumber && (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-extrabold shadow-sm">
                          {course.batchNumber}
                        </span>
                      )}
                    </div>
                    <BookOpen className="w-6 h-6 text-amber-400 opacity-90" />
                  </div>
                )}
                
                <div className={`absolute top-2.5 ${locale === 'ar' ? 'left-2.5' : 'right-2.5'} px-2 py-0.5 bg-white/90 backdrop-blur-sm text-slate-800 rounded text-[9px] font-extrabold shadow-sm`}>
                  {course.type === 'Core' ? dict.core : course.type === 'Elective' ? dict.elective : course.type}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-2 font-serif text-sm group-hover:text-[#064e3b] transition-colors" title={course.title}>
                  {course.title}
                </h3>
                
                <div className="space-y-1.5 mt-auto pt-3 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <GraduationCap className="w-3.5 h-3.5 text-[#064e3b]" />
                    <span className="truncate">{course.instructor}</span>
                  </div>
                  
                  {role === 'teacher' || canManage ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{course.students} {dict.studentsEnrolled}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-[9px] font-bold text-slate-500">
                        <span>{dict.progress}</span>
                        <span className={course.progress === 100 ? 'text-emerald-600' : ''}>{course.progress}%</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${course.progress === 100 ? 'bg-emerald-500' : 'bg-amber-400'}`}
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span className="truncate max-w-[100px]">{course.nextClass}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {canManage && (
                    <>
                      <button 
                        type="button"
                        onClick={(e) => openEditModal(course, e)}
                        className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
                        title={dict.editBtn}
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => requestDeleteCourse(course, e)}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title={dict.deleteBtn}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAILS VIEW MODAL FOR DASHBOARD */}
      {selectedCourseDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slideIn">
            
            {/* Poster or Cover Header */}
            <div className="h-44 bg-gradient-to-r from-emerald-800 to-[#064e3b] relative overflow-hidden flex-shrink-0 flex items-end p-5 text-white">
              <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
              {selectedCourseDetails.posterUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={getOptimizedImageUrl(selectedCourseDetails.posterUrl)} 
                  alt={selectedCourseDetails.title}
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40"
                  referrerPolicy="no-referrer"
                />
              )}
              <button 
                onClick={() => setSelectedCourseDetails(null)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-black/10 backdrop-blur-sm"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 space-y-1 w-full">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="px-2 py-0.5 bg-white/25 backdrop-blur-md rounded text-[9px] font-extrabold uppercase text-white">
                    {selectedCourseDetails.code}
                  </span>
                  {selectedCourseDetails.batchNumber && (
                    <span className="px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-extrabold shadow-sm">
                      {dict.batchLabel}: {selectedCourseDetails.batchNumber}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-serif leading-tight drop-shadow-sm">
                  {selectedCourseDetails.title}
                </h2>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 scrollbar-thin">
              
              {/* Description */}
              <div className="bg-slate-50/80 p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{dict.descriptionLabel}</span>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed sm:leading-6 text-justify [text-justify:inter-word] font-sans whitespace-pre-line">
                  {selectedCourseDetails.description || 'No detailed description specified.'}
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">{dict.instructorLabel}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedCourseDetails.instructorAvatar ? (
                      <img 
                        src={getOptimizedImageUrl(selectedCourseDetails.instructorAvatar)} 
                        alt={selectedCourseDetails.instructor}
                        className="w-8 h-8 rounded-lg object-cover border border-emerald-300 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">
                        {selectedCourseDetails.instructor}
                      </p>
                      {selectedCourseDetails.instructorRole && (
                        <p className="text-[10px] text-emerald-800 font-semibold truncate">
                          {selectedCourseDetails.instructorRole}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">{dict.scheduleDates}</span>
                  {selectedCourseDetails.startDate || selectedCourseDetails.endDate ? (
                    <p className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-[#064e3b]" />
                      <span>{selectedCourseDetails.startDate || 'TBD'}</span>
                      <span className="text-slate-400 font-normal">{dict.fromTo}</span>
                      <span>{selectedCourseDetails.endDate || 'TBD'}</span>
                    </p>
                  ) : (
                    <p className="font-semibold text-slate-500 italic mt-0.5">Continuous</p>
                  )}
                </div>

                <div className="sm:col-span-2 border-t border-slate-200/50 pt-2 grid grid-cols-2 gap-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400">{dict.studyModeLabel}:</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate">{selectedCourseDetails.studyMode || 'On-Campus & Online Hybrid'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400">{dict.instructionLanguageLabel}:</span>
                    <span className="font-bold text-slate-800 text-[11px] truncate">{selectedCourseDetails.instructionLanguage || 'Arabic & Bengali'}</span>
                  </div>
                </div>

                <div className="sm:col-span-2 border-t border-slate-200/50 pt-2 flex justify-between">
                  <div className="flex gap-1 items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">{dict.durationLabel}:</span>
                    <span className="font-bold text-[#064e3b]">{selectedCourseDetails.duration || 'Flexible'}</span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">{dict.nextClassLabel}:</span>
                    <span className="font-bold text-amber-700">{selectedCourseDetails.nextClass || 'TBD'}</span>
                  </div>
                </div>
              </div>

              {/* Course Outline / Curriculum */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <FileText className="w-4 h-4 text-[#064e3b]" />
                  {dict.curriculumTitle}
                </h3>
                {selectedCourseDetails.curriculum ? (
                  <ul className="space-y-1.5 pl-1">
                    {selectedCourseDetails.curriculum.split('\n').filter((item: string) => item.trim() !== '').map((item: string, index: number) => (
                      <li key={index} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="w-1 h-1 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                        <span className="flex-1 font-sans">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">No outline specified yet.</p>
                )}
              </div>

              {/* Eligibility */}
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-1.5">
                  {dict.eligibilityLabel}
                </h3>
                <p className="text-xs text-slate-600 font-sans">
                  {selectedCourseDetails.eligibility || 'Eager Islamic learners.'}
                </p>
              </div>

            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button 
                type="button"
                onClick={() => setSelectedCourseDetails(null)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                {dict.close}
              </button>

              {canManage ? (
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const details = selectedCourseDetails;
                      requestDeleteCourse(details);
                    }}
                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-red-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{dict.deleteBtn}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      const details = selectedCourseDetails;
                      setSelectedCourseDetails(null);
                      openEditModal(details, e);
                    }}
                    className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    {dict.editBtn}
                  </button>
                </div>
              ) : (role === 'student' || role === 'applicant' || role === 'guest') ? (
                <Link 
                  href={`/${locale}/dashboard/apply?course=${selectedCourseDetails.id}`}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Apply Now
                </Link>
              ) : null}
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] animate-slideIn">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50 rounded-t-2xl flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-950 font-serif">
                  {dict.modalTitle}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {dict.modalSub}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm bg-white border border-slate-200 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {submitError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-[11px] font-semibold rounded-lg border border-red-100">
                  {submitError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.courseTitleLabel}</label>
                <input 
                  type="text"
                  required
                  placeholder={dict.courseTitlePlaceholder}
                  value={newCourse.title}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Code */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.courseCodeLabel}</label>
                  <input 
                    type="text"
                    required
                    placeholder={dict.courseCodePlaceholder}
                    value={newCourse.code}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.typeLabel}</label>
                  <select 
                    value={newCourse.type}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  >
                    <option value="Core">{dict.core}</option>
                    <option value="Elective">{dict.elective}</option>
                  </select>
                </div>
              </div>

              {/* Instructor & Faculty Selection Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    {dict.instructorLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {dict.facultyDropdownLabel}
                  </span>
                </div>

                {/* Faculty Dropdown */}
                {facultyList.length > 0 && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">{dict.facultyDropdownLabel}</label>
                    <select
                      value={newCourse.selectedFacultyId || ''}
                      onChange={(e) => handleSelectFacultyForNew(e.target.value)}
                      className="w-full text-xs p-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-white font-medium text-slate-800"
                    >
                      <option value="">{dict.facultyDropdownCustom}</option>
                      {facultyList.map((f: any) => (
                        <option key={f.id} value={f.id}>
                          {f.name || f.nameEn} {f.designation ? `(${f.designation})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Instructor Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">{dict.instructorLabel}</label>
                    <input 
                      type="text"
                      required
                      placeholder={dict.instructorPlaceholder}
                      value={newCourse.instructor}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, instructor: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">{dict.instructorRoleLabel}</label>
                    <input 
                      type="text"
                      placeholder={dict.instructorRolePlaceholder}
                      value={newCourse.instructorRole}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, instructorRole: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-white"
                    />
                  </div>
                </div>

                {/* Instructor Photo (Upload or URL link) */}
                <div className="space-y-2 pt-1 border-t border-slate-200/50">
                  <span className="block text-[11px] font-bold text-slate-700">{dict.instructorAvatarOptionLabel}</span>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    {/* File Upload */}
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-500 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] font-semibold text-slate-600">{dict.instructorAvatarFileLabel}</span>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleInstructorAvatarFileChange(e, false)}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold self-center">OR</span>
                    {/* URL Input */}
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder={dict.instructorAvatarUrlPlaceholder}
                        value={newCourse.instructorAvatar}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, instructorAvatar: e.target.value }))}
                        className="w-full text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                      />
                    </div>
                  </div>

                  {/* Instructor Avatar Preview or Fallback indicator */}
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200/80 mt-1">
                    {newCourse.instructorAvatar ? (
                      <img 
                        src={getOptimizedImageUrl(newCourse.instructorAvatar)}
                        alt="Instructor Avatar"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shadow-2xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">
                        {newCourse.instructor || (locale === 'bn' ? 'প্রশিক্ষক' : 'Instructor')}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {newCourse.instructorAvatar ? (locale === 'bn' ? 'কাস্টম ছবি সংযুক্ত হয়েছে' : 'Custom photo set') : (locale === 'bn' ? 'ছবি না থাকলে ডিফল্ট ম্যান আইকন দেখানো হবে' : 'Default man icon will be shown')}
                      </p>
                    </div>
                    {newCourse.instructorAvatar && (
                      <button 
                        type="button" 
                        onClick={() => setNewCourse(prev => ({ ...prev, instructorAvatar: '' }))}
                        className="text-[10px] text-red-500 font-bold hover:underline px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Study Mode & Instruction Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.studyModeLabel}</label>
                  <input 
                    type="text"
                    list="studyModeOptions"
                    placeholder={dict.studyModePlaceholder}
                    value={newCourse.studyMode}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, studyMode: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                  <datalist id="studyModeOptions">
                    <option value="On-Campus & Online Hybrid" />
                    <option value="অন-ক্যাম্পাস ও অনলাইন লাইভ হাইব্রিড" />
                    <option value="On-Campus Only" />
                    <option value="শুধুমাত্র অন-ক্যাম্পাস (অফলাইন)" />
                    <option value="Online Live Interactive" />
                    <option value="অনলাইন লাইভ ইন্টারেক্টিভ" />
                    <option value="حضوري وعبر المنصة التعليمية" />
                  </datalist>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.instructionLanguageLabel}</label>
                  <input 
                    type="text"
                    list="instructionLanguageOptions"
                    placeholder={dict.instructionLanguagePlaceholder}
                    value={newCourse.instructionLanguage}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, instructionLanguage: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                  <datalist id="instructionLanguageOptions">
                    <option value="Arabic & Bengali with Academic English" />
                    <option value="আরবি ও বাংলা (প্রয়োজনে প্রাতিষ্ঠানিক ইংরেজি)" />
                    <option value="বাংলা ও আরবি" />
                    <option value="বাংলা" />
                    <option value="আরবি (الفصحى)" />
                    <option value="English & Arabic" />
                    <option value="العربية والبنغالية" />
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Batch Number */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.batchLabel}</label>
                  <input 
                    type="text"
                    placeholder={dict.batchPlaceholder}
                    value={newCourse.batchNumber}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.durationLabel}</label>
                  <input 
                    type="text"
                    placeholder={dict.durationPlaceholder}
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, duration: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.startDateLabel}</label>
                  <input 
                    type="date"
                    value={newCourse.startDate}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.endDateLabel}</label>
                  <input 
                    type="date"
                    value={newCourse.endDate}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>
              </div>

              {/* Next Class schedule */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.nextClassLabel}</label>
                <input 
                  type="text"
                  placeholder={dict.nextClassPlaceholder}
                  value={newCourse.nextClass}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, nextClass: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                />
              </div>

              {/* Poster File / URL Option */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="block font-bold text-slate-700">{dict.posterOptionLabel}</span>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  {/* File Input */}
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-500 transition-colors">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px] font-semibold text-slate-600">{dict.posterFileLabel}</span>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePosterFileChange(e, false)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold self-center">OR</span>
                  {/* URL Input */}
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder={dict.posterUrlPlaceholder}
                      value={newCourse.posterUrl}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, posterUrl: e.target.value }))}
                      className="w-full text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                </div>
                {newCourse.posterUrl && (
                  <div className="flex flex-col gap-2 mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[250px]">{newCourse.posterUrl}</span>
                      <button 
                        type="button" 
                        onClick={() => setNewCourse(prev => ({ ...prev, posterUrl: '' }))}
                        className="text-[10px] text-red-500 font-extrabold ml-auto hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="h-28 w-full bg-slate-200 rounded overflow-hidden relative border border-slate-300">
                      <img 
                        src={getOptimizedImageUrl(newCourse.posterUrl)} 
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Course Outline / Curriculum */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.curriculumLabel}</label>
                <textarea 
                  rows={3}
                  placeholder={dict.curriculumPlaceholder}
                  value={newCourse.curriculum}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, curriculum: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50 font-sans"
                />
              </div>

              {/* Course Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.descriptionLabel}</label>
                <textarea 
                  rows={2}
                  placeholder={dict.descriptionPlaceholder}
                  value={newCourse.description}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50 font-sans"
                />
              </div>

              {/* Eligibility */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.eligibilityLabel}</label>
                <input 
                  type="text"
                  placeholder={dict.eligibilityPlaceholder}
                  value={newCourse.eligibility}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, eligibility: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                />
              </div>

              {/* Course Fees & Scholarship Customization */}
              <div className="p-3 bg-[#064e3b]/5 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#064e3b] text-xs">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    <span>কোর্স ফি ও স্কলারশিপ কনফিগারেশন (Fees & Scholarship)</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={newCourse.isFree}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, isFree: e.target.checked }))}
                      className="w-4 h-4 text-[#064e3b] rounded"
                    />
                    সম্পূর্ণ ফ্রি (Free Course)
                  </label>
                </div>

                {!newCourse.isFree && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">ভর্তি ফি (BDT)</label>
                      <input 
                        type="number"
                        min="0"
                        value={newCourse.admissionFee}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, admissionFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">টিউশন ফি (BDT)</label>
                      <input 
                        type="number"
                        min="0"
                        value={newCourse.tuitionFee}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, tuitionFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">আবাসন ফি (BDT)</label>
                      <input 
                        type="number"
                        min="0"
                        value={newCourse.accommodationFee}
                        onChange={(e) => setNewCourse(prev => ({ ...prev, accommodationFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">মোট ফি (Total)</label>
                      <div className="w-full text-xs p-2 bg-emerald-100 text-emerald-950 font-extrabold rounded-lg border border-emerald-200">
                        ৳{(Number(newCourse.admissionFee) || 0) + (Number(newCourse.tuitionFee) || 0) + (Number(newCourse.accommodationFee) || 0)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-emerald-200/40">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={newCourse.allowScholarship}
                      onChange={(e) => setNewCourse(prev => ({ ...prev, allowScholarship: e.target.checked }))}
                      className="w-4 h-4 text-[#064e3b] rounded"
                    />
                    স্কলারশিপ ও যাকাত ফান্ড আবেদনের সুযোগ রাখুন
                  </label>

                  {newCourse.allowScholarship && (
                    <button 
                      type="button"
                      onClick={() => {
                        setCustomizerTargetMode('create');
                        setIsZakatCustomizerOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#064e3b] hover:bg-emerald-900 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3 h-3" /> যাকাত ফরম কাস্টমাইজ করুন ({newCourse.zakatFormFields?.length || 0})
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 pb-2 border-t border-slate-100">
                <FormBuilder 
                  fields={newCourse.admissionFormFields} 
                  onChange={(fields) => setNewCourse(prev => ({ ...prev, admissionFormFields: fields }))} 
                />
              </div>

              {/* Basic analytics counts (Admins only) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.studentsLabel}</label>
                  <input 
                    type="number"
                    min="0"
                    value={newCourse.students}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, students: parseInt(e.target.value) || 0 }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.progressLabel}</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={newCourse.progress}
                    onChange={(e) => setNewCourse(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 -mx-5 -mb-5 rounded-b-2xl pt-4 mt-6 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {dict.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? dict.saving : dict.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COURSE MODAL */}
      {isEditModalOpen && editingCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] animate-slideIn">
            <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50 rounded-t-2xl flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-slate-950 font-serif">
                  {dict.editModalTitle}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {dict.editModalSub}
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingCourse(null);
                }}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm bg-white border border-slate-200 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="p-5 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {submitError && (
                <div className="p-2.5 bg-red-50 text-red-700 text-[11px] font-semibold rounded-lg border border-red-100">
                  {submitError}
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.courseTitleLabel}</label>
                <input 
                  type="text"
                  required
                  placeholder={dict.courseTitlePlaceholder}
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, title: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Code */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.courseCodeLabel}</label>
                  <input 
                    type="text"
                    required
                    placeholder={dict.courseCodePlaceholder}
                    value={editingCourse.code}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, code: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.typeLabel}</label>
                  <select 
                    value={editingCourse.type}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, type: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  >
                    <option value="Core">{dict.core}</option>
                    <option value="Elective">{dict.elective}</option>
                  </select>
                </div>
              </div>

              {/* Instructor & Faculty Selection Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    {dict.instructorLabel}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {dict.facultyDropdownLabel}
                  </span>
                </div>

                {/* Faculty Dropdown */}
                {facultyList.length > 0 && (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-600">{dict.facultyDropdownLabel}</label>
                    <select
                      value={editingCourse.selectedFacultyId || ''}
                      onChange={(e) => handleSelectFacultyForEdit(e.target.value)}
                      className="w-full text-xs p-2.5 border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-white font-medium text-slate-800"
                    >
                      <option value="">{dict.facultyDropdownCustom}</option>
                      {facultyList.map((f: any) => (
                        <option key={f.id} value={f.id}>
                          {f.name || f.nameEn} {f.designation ? `(${f.designation})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Instructor Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">{dict.instructorLabel}</label>
                    <input 
                      type="text"
                      required
                      placeholder={dict.instructorPlaceholder}
                      value={editingCourse.instructor}
                      onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, instructor: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">{dict.instructorRoleLabel}</label>
                    <input 
                      type="text"
                      placeholder={dict.instructorRolePlaceholder}
                      value={editingCourse.instructorRole || ''}
                      onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, instructorRole: e.target.value }))}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-white"
                    />
                  </div>
                </div>

                {/* Instructor Photo (Upload or URL link) */}
                <div className="space-y-2 pt-1 border-t border-slate-200/50">
                  <span className="block text-[11px] font-bold text-slate-700">{dict.instructorAvatarOptionLabel}</span>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    {/* File Upload */}
                    <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-500 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[11px] font-semibold text-slate-600">{dict.instructorAvatarFileLabel}</span>
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleInstructorAvatarFileChange(e, true)}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold self-center">OR</span>
                    {/* URL Input */}
                    <div className="flex-1 relative">
                      <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder={dict.instructorAvatarUrlPlaceholder}
                        value={editingCourse.instructorAvatar || ''}
                        onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, instructorAvatar: e.target.value }))}
                        className="w-full text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                      />
                    </div>
                  </div>

                  {/* Instructor Avatar Preview or Fallback indicator */}
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200/80 mt-1">
                    {editingCourse.instructorAvatar ? (
                      <img 
                        src={getOptimizedImageUrl(editingCourse.instructorAvatar)}
                        alt="Instructor Avatar"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shadow-2xs shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-300/40 flex items-center justify-center text-emerald-300 shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 truncate">
                        {editingCourse.instructor || (locale === 'bn' ? 'প্রশিক্ষক' : 'Instructor')}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {editingCourse.instructorAvatar ? (locale === 'bn' ? 'কাস্টম ছবি সংযুক্ত হয়েছে' : 'Custom photo set') : (locale === 'bn' ? 'ছবি না থাকলে ডিফল্ট ম্যান আইকন দেখানো হবে' : 'Default man icon will be shown')}
                      </p>
                    </div>
                    {editingCourse.instructorAvatar && (
                      <button 
                        type="button" 
                        onClick={() => setEditingCourse((prev: any) => ({ ...prev, instructorAvatar: '' }))}
                        className="text-[10px] text-red-500 font-bold hover:underline px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Study Mode & Instruction Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.studyModeLabel}</label>
                  <input 
                    type="text"
                    list="studyModeOptions"
                    placeholder={dict.studyModePlaceholder}
                    value={editingCourse.studyMode || ''}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, studyMode: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.instructionLanguageLabel}</label>
                  <input 
                    type="text"
                    list="instructionLanguageOptions"
                    placeholder={dict.instructionLanguagePlaceholder}
                    value={editingCourse.instructionLanguage || ''}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, instructionLanguage: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Batch Number */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.batchLabel}</label>
                  <input 
                    type="text"
                    placeholder={dict.batchPlaceholder}
                    value={editingCourse.batchNumber}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.durationLabel}</label>
                  <input 
                    type="text"
                    placeholder={dict.durationPlaceholder}
                    value={editingCourse.duration}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, duration: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Start Date */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.startDateLabel}</label>
                  <input 
                    type="date"
                    value={editingCourse.startDate}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>

                {/* End Date */}
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.endDateLabel}</label>
                  <input 
                    type="date"
                    value={editingCourse.endDate}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                  />
                </div>
              </div>

              {/* Next Class schedule */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.nextClassLabel}</label>
                <input 
                  type="text"
                  placeholder={dict.nextClassPlaceholder}
                  value={editingCourse.nextClass}
                  onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, nextClass: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                />
              </div>

              {/* Poster File / URL Option */}
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="block font-bold text-slate-700">{dict.posterOptionLabel}</span>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                  {/* File Input */}
                  <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-500 transition-colors">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-[11px] font-semibold text-slate-600">{dict.posterFileLabel}</span>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePosterFileChange(e, true)}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400 font-bold self-center">OR</span>
                  {/* URL Input */}
                  <div className="flex-1 relative">
                    <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      placeholder={dict.posterUrlPlaceholder}
                      value={editingCourse.posterUrl}
                      onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, posterUrl: e.target.value }))}
                      className="w-full text-xs pl-8 pr-2.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                  </div>
                </div>
                {editingCourse.posterUrl && (
                  <div className="flex flex-col gap-2 mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[250px]">{editingCourse.posterUrl}</span>
                      <button 
                        type="button" 
                        onClick={() => setEditingCourse((prev: any) => ({ ...prev, posterUrl: '' }))}
                        className="text-[10px] text-red-500 font-extrabold ml-auto hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="h-28 w-full bg-slate-200 rounded overflow-hidden relative border border-slate-300">
                      <img 
                        src={getOptimizedImageUrl(editingCourse.posterUrl)} 
                        alt="Poster Preview"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Course Outline / Curriculum */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.curriculumLabel}</label>
                <textarea 
                  rows={3}
                  placeholder={dict.curriculumPlaceholder}
                  value={editingCourse.curriculum}
                  onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, curriculum: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50 font-sans"
                />
              </div>

              {/* Course Description */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.descriptionLabel}</label>
                <textarea 
                  rows={2}
                  placeholder={dict.descriptionPlaceholder}
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, description: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50 font-sans"
                />
              </div>

              {/* Eligibility */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-700">{dict.eligibilityLabel}</label>
                <input 
                  type="text"
                  placeholder={dict.eligibilityPlaceholder}
                  value={editingCourse.eligibility}
                  onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, eligibility: e.target.value }))}
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white bg-slate-50"
                />
              </div>

              {/* Course Fees & Scholarship Customization */}
              <div className="p-3 bg-[#064e3b]/5 border border-emerald-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#064e3b] text-xs">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    <span>কোর্স ফি ও স্কলারশিপ কনফিগারেশন (Fees & Scholarship)</span>
                  </div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingCourse.isFree}
                      onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, isFree: e.target.checked }))}
                      className="w-4 h-4 text-[#064e3b] rounded"
                    />
                    সম্পূর্ণ ফ্রি (Free Course)
                  </label>
                </div>

                {!editingCourse.isFree && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">ভর্তি ফি (BDT)</label>
                      <input 
                        type="number"
                        min="0"
                        value={editingCourse.admissionFee}
                        onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, admissionFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">টিউশন ফি (BDT)</label>
                      <input 
                        type="number"
                        min="0"
                        value={editingCourse.tuitionFee}
                        onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, tuitionFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">আবাসন ফি (BDT)</label>
                      <input 
                        type="number"
                        min="0"
                        value={editingCourse.accommodationFee}
                        onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, accommodationFee: parseFloat(e.target.value) || 0 }))}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">মোট ফি (Total)</label>
                      <div className="w-full text-xs p-2 bg-emerald-100 text-emerald-950 font-extrabold rounded-lg border border-emerald-200">
                        ৳{(Number(editingCourse.admissionFee) || 0) + (Number(editingCourse.tuitionFee) || 0) + (Number(editingCourse.accommodationFee) || 0)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 border-t border-emerald-200/40">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={editingCourse.allowScholarship}
                      onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, allowScholarship: e.target.checked }))}
                      className="w-4 h-4 text-[#064e3b] rounded"
                    />
                    স্কলারশিপ ও যাকাত ফান্ড আবেদনের সুযোগ রাখুন
                  </label>

                  {editingCourse.allowScholarship && (
                    <button 
                      type="button"
                      onClick={() => {
                        setCustomizerTargetMode('edit');
                        setIsZakatCustomizerOpen(true);
                      }}
                      className="px-2.5 py-1 bg-[#064e3b] hover:bg-emerald-900 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Settings className="w-3 h-3" /> যাকাত ফরম কাস্টমাইজ করুন ({editingCourse.zakatFormFields?.length || 0})
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 pb-2 border-t border-slate-100">
                <FormBuilder 
                  fields={editingCourse.admissionFormFields} 
                  onChange={(fields) => setEditingCourse((prev: any) => ({ ...prev, admissionFormFields: fields }))} 
                />
              </div>

              {/* Analytic counts */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.studentsLabel}</label>
                  <input 
                    type="number"
                    min="0"
                    value={editingCourse.students}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, students: parseInt(e.target.value) || 0 }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-slate-700">{dict.progressLabel}</label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    value={editingCourse.progress}
                    onChange={(e) => setEditingCourse((prev: any) => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                    className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50 -mx-5 -mb-5 rounded-b-2xl pt-4 mt-6 flex-shrink-0">
                <button 
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingCourse(null);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  {dict.cancel}
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? dict.saving : dict.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zakat Assessment Form Customizer Modal */}
      <ZakatFormCustomizerModal
        isOpen={isZakatCustomizerOpen}
        onClose={() => setIsZakatCustomizerOpen(false)}
        fields={
          customizerTargetMode === 'create'
            ? newCourse.zakatFormFields || DEFAULT_ZAKAT_FORM_FIELDS
            : editingCourse?.zakatFormFields || DEFAULT_ZAKAT_FORM_FIELDS
        }
        formTitle={
          customizerTargetMode === 'create'
            ? newCourse.zakatFormTitle
            : editingCourse?.zakatFormTitle
        }
        formSubtitle={
          customizerTargetMode === 'create'
            ? newCourse.zakatFormSubtitle
            : editingCourse?.zakatFormSubtitle
        }
        warningText={
          customizerTargetMode === 'create'
            ? newCourse.zakatWarningText
            : editingCourse?.zakatWarningText
        }
        undertakingText={
          customizerTargetMode === 'create'
            ? newCourse.zakatUndertakingText
            : editingCourse?.zakatUndertakingText
        }
        onSave={(updatedFields, texts) => {
          if (customizerTargetMode === 'create') {
            setNewCourse((prev) => ({ 
              ...prev, 
              zakatFormFields: updatedFields,
              ...texts
            }));
          } else {
            setEditingCourse((prev: any) => ({ 
              ...prev, 
              zakatFormFields: updatedFields,
              ...texts
            }));
          }
        }}
      />

      {/* DELETE CONFIRMATION MODAL */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {locale === 'bn' ? 'কোর্স মুছে ফেলার নিশ্চিতকরণ' : locale === 'ar' ? 'تأكيد حذف المقرر' : 'Confirm Course Deletion'}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5 font-semibold">
                  {courseToDelete.code ? `[${courseToDelete.code}] ` : ''}{courseToDelete.title}
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-red-50/80 border border-red-200 rounded-xl text-xs text-red-800 leading-relaxed">
              {locale === 'bn' 
                ? 'আপনি কি নিশ্চিত যে এই কোর্সটি ডাটাবেজ থেকে স্থায়ীভাবে মুছে ফেলতে চান? এই কোর্সটি মুছে ফেললে তা আর পুনরুদ্ধার করা যাবে না।'
                : locale === 'ar'
                ? 'هل أنت متأكد من حذف هذا المقرر الدراسي نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure you want to permanently delete this course? This action cannot be undone.'}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {dict.cancel}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteCourse}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{locale === 'bn' ? 'মুছে ফেলা হচ্ছে...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{locale === 'bn' ? 'হ্যাঁ, মুছে ফেলুন' : locale === 'ar' ? 'نعم، حذف' : 'Delete Course'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-emerald-950 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-700 animate-slideIn">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{successToast}</span>
          <button 
            type="button" 
            onClick={() => setSuccessToast(null)} 
            className="text-white/70 hover:text-white ml-2 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
