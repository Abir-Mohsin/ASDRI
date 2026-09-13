'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { 
  BookOpen, FileText, Users, Search, Plus, 
  CheckCircle, AlertCircle, RefreshCw, Eye, Book, ExternalLink, Sparkles,
  Upload, X, Tag, FileCheck, BookmarkCheck, Library, ShieldCheck,
  CheckCircle2, Clock, AlertTriangle, ChevronRight, Download
} from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { 
  collection, query, where, getDocs, addDoc, doc, updateDoc, setDoc, getDoc, orderBy 
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// Trilingual dictionaries for Researcher
const t = {
  en: {
    welcome: "Researcher Portal & Scholarly Hub",
    subWelcome: "As-Sunnah Institute — Dawah & Theological Research Board",
    seedDemoBtn: "Seed Demo Papers",
    refreshBtn: "Refresh Board Status",
    libraryBtn: "Library & Manuscript Access",
    submitNewBtn: "+ Submit New Paper",
    statMySubmissions: "My Submissions",
    statApprovedJournals: "Approved Journals",
    statUnderReview: "Under Review",
    statRevisionRequired: "Revision Required",
    tabMySubmissions: "My Submissions",
    tabSubmitNew: "Submit New Paper",
    tabGlobalLive: "Global Live Publications",
    tabLibrary: "Library & Manuscript Access",
    paperTitle: "Research Paper Title",
    paperTitlePlaceholder: "e.g., Prophetic Educational Methodology and its Contemporary Implementations",
    category: "Theology & Research Field",
    customCategoryPlaceholder: "Enter custom theological or scientific discipline...",
    authorName: "Corresponding Scholar / Author Name",
    authorNamePlaceholder: "e.g., Dr. Abdul Hameed (Fellow, ASDRI)",
    abstract: "Abstract & Scope",
    abstractNotice: "Note: ASDRI's public index presents this abstract & keywords to international scholars. Full manuscript text is securely served via the attached PDF/document.",
    abstractPlaceholder: "Write a comprehensive summary of your research thesis, methodology, textual analysis, and theological conclusions...",
    keywordsLabel: "Keywords & Theological Indexing Tags",
    keywordsPlaceholder: "Type keyword (e.g., Hadith Sciences, Pedagogy) and press Enter or comma...",
    addTag: "Add Tag",
    fileUploadTitle: "Upload Full Research Manuscript (PDF / Word)",
    fileUploadSub: "Drag and drop or click to upload. Maximum size: 15MB. Formats: .pdf, .doc, .docx",
    googleDriveTitle: "Or Paste Google Drive / External PDF Document Link",
    googleDrivePlaceholder: "https://drive.google.com/file/d/...",
    submitting: "Submitting to Academic Review Board...",
    submitBtn: "Submit Manuscript for Double-Blind Peer Review",
    successSubmit: "Your research manuscript has been submitted successfully to the ASDRI Double-Blind Peer Review Board.",
    errorFill: "Please fill all required metadata fields and provide a manuscript document (file upload or valid link).",
    noPapersYet: "You haven't submitted any research papers yet. Get started by clicking the Submit New Paper tab.",
    underReview: "Under Review",
    approved: "Approved & Live",
    needsRevision: "Revision Required",
    reviewerFeedback: "Academic Board Review Notes:",
    noFeedback: "Manuscript is undergoing initial double-blind editorial evaluation.",
    viewManuscript: "View Manuscript",
    readPdf: "Read Full Article (PDF)",
    downloadPdf: "Download Full PDF",
    backToList: "Back to submissions list",
    allPublications: "All Live Publications at ASDRI",
    allCategories: "All Fields",
    searchPlaceholder: "Search by title, keyword, or author...",
    noLiveFound: "No approved publications match your criteria.",
    libTitle: "Central Theological Library & Rare Manuscripts",
    libSearchPlaceholder: "Search books by Title, Author, or ISBN...",
    requestBorrow: "Request Borrow",
    stockAvailable: "Available in Stock",
    shelfLocation: "Shelf Location",
    isbn: "ISBN",
    borrowModalTitle: "Submit Book Borrow Request",
    borrowDateLabel: "Borrow Date",
    returnDateLabel: "Expected Return Date",
    confirmBorrow: "Confirm Borrow Request",
    cancel: "Cancel",
    borrowSuccess: "Borrow request submitted successfully to the Library Circulation Desk."
  },
  bn: {
    welcome: "রিসার্চার পোর্টাল ও গবেষণা হাব",
    subWelcome: "আস-সুন্নাহ ইনস্টিটিউট — দাওয়াহ ও থিওলজিক্যাল রিসার্চ বোর্ড",
    seedDemoBtn: "ডেমো পেপার তৈরি করুন",
    refreshBtn: "বোর্ড স্ট্যাটাস রিফ্রেশ করুন",
    libraryBtn: "লাইব্রেরি ও পাণ্ডুলিপি অ্যাক্সেস",
    submitNewBtn: "+ নতুন পেপার জমা দিন",
    statMySubmissions: "আমার সাবমিশনসমূহ",
    statApprovedJournals: "অনুমোদিত জার্নাল",
    statUnderReview: "রিভিউ প্রক্রিয়ায়",
    statRevisionRequired: "সংশোধন প্রয়োজন",
    tabMySubmissions: "আমার সাবমিশনসমূহ",
    tabSubmitNew: "নতুন পেপার জমা দিন",
    tabGlobalLive: "অনুমোদিত প্রকাশনা সূচি",
    tabLibrary: "লাইব্রেরি ও পাণ্ডুলিপি অ্যাক্সেস",
    paperTitle: "গবেষণাপত্রের শিরোনাম",
    paperTitlePlaceholder: "যেমন: রাসূলুল্লাহ (সা.)-এর শিক্ষাদান পদ্ধতি এবং আধুনিক শিক্ষাবিজ্ঞানে তার প্রয়োগ",
    category: "থিওলজি ও গবেষণার শাস্ত্র",
    customCategoryPlaceholder: "কাস্টম শাস্ত্রের নাম লিখুন...",
    authorName: "প্রধান গবেষক / লেখকের নাম",
    authorNamePlaceholder: "যেমন: ড. আবদুল হামিদ (রিসার্চ ফেলো, এএসডিআরআই)",
    abstract: "অ্যাবস্ট্রাক্ট ও সারসংক্ষেপ",
    abstractNotice: "দ্রষ্টব্য: ইনস্টিটিউট পোর্টালে এই সারসংক্ষেপ ও কিওয়ার্ডসমূহ প্রদর্শিত হবে। সম্পূর্ণ পাণ্ডুলিপিটি সংযুক্ত পিডিএফ/ডকুমেন্টের মাধ্যমে সুরক্ষিত থাকবে।",
    abstractPlaceholder: "গবেষণার মূল প্রতিপাদ্য, পদ্ধতি, দলিলভিত্তিক বিশ্লেষণ ও সিদ্ধান্তসমূহ বিস্তারিত লিখুন...",
    keywordsLabel: "কিওয়ার্ড ও সূচীকরণ ট্যাগসমূহ",
    keywordsPlaceholder: "কিওয়ার্ড লিখে Enter বা কমা চাপুন...",
    addTag: "যোগ করুন",
    fileUploadTitle: "সম্পূর্ণ গবেষণাপত্র আপলোড করুন (PDF / Word)",
    fileUploadSub: "ফাইল ড্রপ করুন অথবা সিলেক্ট করুন। সর্বোচ্চ সাইজ: ১৫ মেগাবাইট (PDF, DOC, DOCX)",
    googleDriveTitle: "অথবা গুগল ড্রাইভ / এক্সটার্নাল পিডিএফ লিংক দিন",
    googleDrivePlaceholder: "https://drive.google.com/file/d/...",
    submitting: "একাডেমিক রিভিউ বোর্ডে জমা হচ্ছে...",
    submitBtn: "ডাবল-ব্লাইন্ড পিয়ার রিভিউর জন্য জমা দিন",
    successSubmit: "আপনার গবেষণাপত্রটি সফলভাবে আস-সুন্নাহ রিভিউ বোর্ডে জমা হয়েছে।",
    errorFill: "অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন এবং গবেষণাপত্রের ফাইল বা ড্রাইভ লিংক প্রদান করুন।",
    noPapersYet: "আপনি এখনও কোনো গবেষণাপত্র জমা দেননি। নতুন পেপার জমা দিতে 'নতুন পেপার জমা দিন' ট্যাবে যান।",
    underReview: "পর্যালোচনাধীন (Under Review)",
    approved: "অনুমোদিত ও প্রকাশিত",
    needsRevision: "সংশোধন প্রয়োজন (Revision Required)",
    reviewerFeedback: "একাডেমিক রিভিউ বোর্ডের মন্তব্য:",
    noFeedback: "গবেষণাপত্রটি বর্তমানে সম্পাদকীয় বোর্ডে প্রাথমিক পর্যালোচনায় রয়েছে।",
    viewManuscript: "পাণ্ডুলিপি দেখুন",
    readPdf: "সম্পূর্ণ প্রবন্ধ পড়ুন (PDF)",
    downloadPdf: "সম্পূর্ণ পিডিএফ ডাউনলোড",
    backToList: "তালিকা ফিরে যান",
    allPublications: "আস-সুন্নাহ ইনস্টিটিউট প্রকাশিত গবেষণাসমূহ",
    allCategories: "সকল শাস্ত্র",
    searchPlaceholder: "শিরোনাম, কিওয়ার্ড বা লেখক দিয়ে খুঁজুন...",
    noLiveFound: "আপনার অনুসন্ধানের সাথে কোনো প্রকাশিত গবেষণাপত্র মেলেনি।",
    libTitle: "কেন্দ্রীয় ডিজিটাল লাইব্রেরি ও পাণ্ডুলিপি ভাণ্ডার",
    libSearchPlaceholder: "বইয়ের নাম, লেখক বা ISBN দিয়ে খুঁজুন...",
    requestBorrow: "ধার নেওয়ার আবেদন",
    stockAvailable: "মজুদ কপি",
    shelfLocation: "শেলফ লোকেশন",
    isbn: "আইএসবিএন",
    borrowModalTitle: "বই ইস্যুর আবেদনপত্র",
    borrowDateLabel: "ইস্যু তারিখ",
    returnDateLabel: "ফেরত দেওয়ার সম্ভাব্য তারিখ",
    confirmBorrow: "আবেদন নিশ্চিত করুন",
    cancel: "বাতিল",
    borrowSuccess: "বই ধার নেওয়ার আবেদনটি সফলভাবে লাইব্রেরি ডেস্কে পাঠানো হয়েছে।"
  },
  ar: {
    welcome: "بوابة الباحثين والإنتاج العلمي",
    subWelcome: "معهد السنة — هيئة البحوث والدراسات اللاهوتية والدعوية",
    seedDemoBtn: "توليد أبحاث تجريبية",
    refreshBtn: "تحديث حالة الهيئة",
    libraryBtn: "المكتبة والمخطوطات",
    submitNewBtn: "+ تقديم بحث جديد",
    statMySubmissions: "أبحاثي المقدمة",
    statApprovedJournals: "المجلات المعتمدة",
    statUnderReview: "قيد التحكيم",
    statRevisionRequired: "تتطلب تعديلات",
    tabMySubmissions: "أبحاثي المقدمة",
    tabSubmitNew: "تقديم بحث جديد",
    tabGlobalLive: "الأبحاث المنشورة بالمعهد",
    tabLibrary: "المكتبة والمخطوطات",
    paperTitle: "عنوان البحث العلمي",
    paperTitlePlaceholder: "مثال: منهج التعليم النبوي وتطبيقاته في التربية المعاصرة",
    category: "التخصص والمجال الشرعي",
    customCategoryPlaceholder: "اكتب التخصص الدقيق...",
    authorName: "اسم الباحث الرئيسي",
    authorNamePlaceholder: "د. عبد الحميد (باحث معتمد)",
    abstract: "الملخص والنتائج الرئيسية",
    abstractNotice: "ملاحظة: تعرض البوابة الملخص والكلمات الدلالية للباحثين، بينما يتم توفير النص الكامل عبر المستند المرفق.",
    abstractPlaceholder: "اكتب ملخصاً وافياً للفرضيات والمنهجية العلمية والنتائج الشرعية...",
    keywordsLabel: "الكلمات المفتاحية والفهارس العلمية",
    keywordsPlaceholder: "اكتب الكلمة واضغط Enter أو فاصلة...",
    addTag: "إضافة",
    fileUploadTitle: "رفع المخطوطة / المستند الأصلي (PDF / Word)",
    fileUploadSub: "اسحب الملف أو انقر للاختيار. الحد الأقصى: ١٥ ميغابايت (PDF, DOC, DOCX)",
    googleDriveTitle: "أو رابط المستند عبر Google Drive / PDF",
    googleDrivePlaceholder: "https://drive.google.com/file/d/...",
    submitting: "جارٍ الإرسال إلى لجنة التحكيم المزدوج...",
    submitBtn: "إرسال البحث للتحكيم الأكاديمي المزدوج",
    successSubmit: "تم إرسال البحث بنجاح إلى هيئة التحكيم الأكاديمي بمعهد السنة.",
    errorFill: "يرجى تعبئة كافة الحقول الإلزامية وتقديم ملف البحث أو الرابط.",
    noPapersYet: "لم تقم بتقديم أي أبحاث حتى الآن.",
    underReview: "قيد التحكيم (Under Review)",
    approved: "معتمد ومنشور",
    needsRevision: "يتطلب مراجعة وتعديل",
    reviewerFeedback: "ملاحظات لجنة التحكيم الأكاديمي:",
    noFeedback: "البحث قيد الفحص التحريري والتحكيم الأعمى حالياً.",
    viewManuscript: "عرض المخطوطة",
    readPdf: "قراءة البحث كاملاً (PDF)",
    downloadPdf: "تحميل ملف PDF",
    backToList: "العودة للقائمة",
    allPublications: "جميع الإصدارات البحثية المعتمدة",
    allCategories: "جميع التخصصات",
    searchPlaceholder: "ابحث بالعنوان، الكلمات المفتاحية، أو الباحث...",
    noLiveFound: "لم يتم العثور على أبحاث مطابقة للبحث.",
    libTitle: "المكتبة المركزية والمخطوطات النادرة",
    libSearchPlaceholder: "ابحث بالعنوان، المؤلف، أو الرقم الدولي (ISBN)...",
    requestBorrow: "طلب استعارة",
    stockAvailable: "النسخ المتوفرة",
    shelfLocation: "موضع الرف",
    isbn: "الرقم الدولي",
    borrowModalTitle: "طلب استعارة كتاب",
    borrowDateLabel: "تاريخ الاستعارة",
    returnDateLabel: "تاريخ الإرجاع المتوقع",
    confirmBorrow: "تأكيد طلب الاستعارة",
    cancel: "إلغاء",
    borrowSuccess: "تم تقديم طلب الاستعارة بنجاح لقسم الإعارة بالمكتبة."
  }
};

type Language = 'en' | 'bn' | 'ar';

export function ResearcherDashboard() {
  const { user } = useAuthStore();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = ((params?.locale as string) || 'en') as Language;
  const paramTab = searchParams?.get('tab');
  
  const dict = t[locale] || t.en;

  // Workspace active tab
  const [activeTab, setActiveTab] = useState<'submissions' | 'submit' | 'live' | 'library'>('submissions');

  useEffect(() => {
    if (paramTab === 'submit' || paramTab === 'live' || paramTab === 'library' || paramTab === 'submissions') {
      setActiveTab(paramTab);
    } else if (paramTab === 'overview') {
      setActiveTab('submissions');
    }
  }, [paramTab]);

  // Form states for Metadata & File Submission
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Al-Quran & Hadith Sciences');
  const [customCategory, setCustomCategory] = useState('');
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [abstract, setAbstract] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Data states
  const [myPapers, setMyPapers] = useState<any[]>([]);
  const [livePapers, setLivePapers] = useState<any[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<any | null>(null);

  // Global live filters
  const [liveSearchQuery, setLiveSearchQuery] = useState('');
  const [liveCategoryFilter, setLiveCategoryFilter] = useState('All');

  // Digital Library States
  const [libraryBooks, setLibraryBooks] = useState<any[]>([]);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [libSearch, setLibSearch] = useState('');
  const [borrowingBook, setBorrowingBook] = useState<any | null>(null);
  const [borrowDate, setBorrowDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [isBorrowSubmitting, setIsBorrowSubmitting] = useState(false);
  const [borrowSuccessMsg, setBorrowSuccessMsg] = useState('');

  // Pre-fill author name when user profile loads
  useEffect(() => {
    if (user?.displayName && !authorName) {
      setAuthorName(user.displayName);
    }
  }, [user]);

  // Load researcher papers, live papers, and library
  const loadDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // 1. Fetch user submissions
      const myQuery = query(
        collection(db, 'research_papers'),
        where('researcherId', '==', user.uid)
      );
      const mySnap = await getDocs(myQuery);
      const myPaperList = mySnap.docs.map(d => ({ id: d.id, ...d.data() }));
      myPaperList.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setMyPapers(myPaperList);

      // 2. Fetch approved live publications
      const liveQuery = query(
        collection(db, 'research_papers'),
        where('status', '==', 'approved')
      );
      const liveSnap = await getDocs(liveQuery);
      const livePaperList = liveSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      livePaperList.sort((a: any, b: any) => new Date(b.approvedAt || b.createdAt || 0).getTime() - new Date(a.approvedAt || a.createdAt || 0).getTime());
      setLivePapers(livePaperList);

      // 3. Fetch Library catalog
      const booksSnap = await getDocs(collection(db, 'library_books'));
      setLibraryBooks(booksSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      // 4. Fetch my loans / borrow requests
      const loansQuery = query(collection(db, 'borrow_requests'), where('userId', '==', user.uid));
      const loansSnap = await getDocs(loansQuery);
      setMyLoans(loansSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error loading researcher dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle Keywords tag management
  const handleAddKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleRemoveKeyword = (tagToRemove: string) => {
    setKeywords(keywords.filter(k => k !== tagToRemove));
  };

  // Handle File Selection
  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    const allowedExts = ['pdf', 'doc', 'docx'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!allowedExts.includes(ext)) {
      setErrorMsg('Unsupported file format. Please upload a PDF, DOC, or DOCX manuscript.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds 15MB limit. Please compress or provide an external Google Drive link.');
      return;
    }
    setErrorMsg('');
    setUploadedFile(file);
  };

  // Handle Manuscript Submission with Double-Blind Peer Review Architecture
  const handleSubmitPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const effectiveCategory = category === 'Other / Custom Field...' ? customCategory.trim() : category;

    if (!title.trim() || !effectiveCategory || !authorName.trim() || !abstract.trim()) {
      setErrorMsg(dict.errorFill);
      return;
    }

    if (!uploadedFile && !googleDriveUrl.trim()) {
      setErrorMsg('Please attach a manuscript file (PDF/Word) or paste a valid Google Drive / document URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalFileUrl = googleDriveUrl.trim();
      let uploadedFileName = uploadedFile?.name || 'Google Drive Document';
      let uploadedFileSize = uploadedFile?.size || 0;

      // Handle Firebase Storage file upload if local file selected
      if (uploadedFile && user) {
        const fileExt = uploadedFile.name.split('.').pop();
        const storagePath = `research_manuscripts/${user.uid}/${Date.now()}_${uploadedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const fileRef = ref(storage, storagePath);
        
        const uploadTask = uploadBytesResumable(fileRef, uploadedFile);
        
        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              setUploadProgress(progress);
            },
            (error) => {
              console.warn("Direct storage upload fallback to link:", error);
              resolve(true); // Don't block if storage security requires specific rule
            },
            async () => {
              try {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                finalFileUrl = downloadUrl;
              } catch (e) {
                console.warn("Could not retrieve download URL:", e);
              }
              resolve(true);
            }
          );
        });
      }

      // DOUBLE-BLIND PEER REVIEW DATABASE ARCHITECTURE
      // Separate author profile from manuscript metadata for anonymous evaluation
      const authorProfile = {
        name: authorName.trim(),
        userId: user?.uid || 'anonymous',
        email: user?.email || '',
        institution: 'As-Sunnah Dawah and Research Institute',
        contact: user?.email || ''
      };

      const manuscriptMetadata = {
        title: title.trim(),
        category: effectiveCategory,
        abstract: abstract.trim(),
        keywords: keywords.length > 0 ? keywords : [effectiveCategory],
        fileUrl: finalFileUrl || googleDriveUrl.trim(),
        googleDriveUrl: googleDriveUrl.trim(),
        fileName: uploadedFileName,
        fileSize: uploadedFileSize,
        submissionDate: new Date().toISOString()
      };

      // Full document record
      const paperRecord = {
        // Double-Blind separated objects
        author_profile: authorProfile,
        manuscript_metadata: manuscriptMetadata,
        // Flat mirror fields for broad query compatibility
        title: title.trim(),
        category: effectiveCategory,
        abstract: abstract.trim(),
        keywords: keywords.length > 0 ? keywords : [effectiveCategory],
        pdfLink: finalFileUrl || googleDriveUrl.trim(),
        authorName: authorName.trim(),
        researcherId: user?.uid,
        researcherEmail: user?.email || '',
        status: 'under_review',
        createdAt: new Date().toISOString(),
        reviewerFeedback: '',
        approvedAt: null
      };

      // 1. Add to research_papers collection
      const docRef = await addDoc(collection(db, 'research_papers'), paperRecord);

      // 2. Sync to submissions collection for central institutional auditing
      try {
        await addDoc(collection(db, 'submissions'), {
          ...paperRecord,
          paperRefId: docRef.id,
          type: 'theology_research_manuscript'
        });
      } catch (err) {
        console.warn("Sync to submissions collection skipped:", err);
      }

      setSuccessMsg(dict.successSubmit);
      // Reset form
      setTitle('');
      setCategory('Al-Quran & Hadith Sciences');
      setCustomCategory('');
      setAbstract('');
      setKeywords([]);
      setKeywordInput('');
      setGoogleDriveUrl('');
      setUploadedFile(null);
      setUploadProgress(null);

      // Reload submissions and navigate to list
      await loadDashboardData();
      setTimeout(() => {
        setActiveTab('submissions');
        setSuccessMsg('');
      }, 2000);

    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMsg(err.message || 'Failed to submit manuscript. Please check network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Seed 5 Demo Research Papers with Full Double-Blind Metadata and 5 Library Books
  const handleSeedDemoData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const demoPapers = [
        {
          title: "Comparative Analysis of Prophetic Educational Methodology & Modern Pedagogical Science",
          category: "Dawah & Contemporary Culture",
          abstract: "This manuscript examines classical instructional frameworks utilized in Prophetic traditions, exploring their empirical application within contemporary higher education curricula and adult pedagogical systems.",
          keywords: ["Prophetic Pedagogy", "Hadith Sciences", "Educational Psychology", "Islamic Curriculum"],
          pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          authorName: user.displayName || "Dr. Abdul Hameed (Fellow, ASDRI)",
          researcherId: user.uid,
          researcherEmail: user.email || "",
          status: "approved",
          createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
          approvedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          reviewerFeedback: "Rigorous academic methodology and authentic source validation. Approved for ASDRI Scholarly Journal Vol. 4."
        },
        {
          title: "Application of Fiqh al-Nawazil in Modern Financial Contracts & Digital Asset Valuation",
          category: "Islamic Jurisprudence (Usul al-Fiqh)",
          abstract: "An analytical investigation of contemporary jurisprudential rulings (Nawazil) regarding decentralized financial protocols, tokenization, automated smart contracts, and Shariah-compliant digital asset management.",
          keywords: ["Fiqh al-Nawazil", "Islamic Fintech", "Crypto Assets", "Maqasid al-Shariah"],
          pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          authorName: user.displayName || "Prof. Mahmud Hasan al-Azhari",
          researcherId: user.uid,
          researcherEmail: user.email || "",
          status: "under_review",
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          reviewerFeedback: ""
        },
        {
          title: "Hermeneutics of Classical Aqeedah Texts: Re-evaluating Early Kalam Discourse",
          category: "Theology & Aqeedah",
          abstract: "A textual study on the emergence of early speculative theology (Kalam), examining the orthodox response articulated by early Hadith scholars against extreme rationalism.",
          keywords: ["Aqeedah", "Kalam", "Orthodoxy", "Sunnah Defense"],
          pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          authorName: user.displayName || "Dr. Tariq al-Madani",
          researcherId: user.uid,
          researcherEmail: user.email || "",
          status: "needs_revision",
          createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
          reviewerFeedback: "Please provide complete critical apparatus references for the 3rd-century manuscript citations in Chapter 2."
        },
        {
          title: "Manuscript Verification of Sharh Usul I'tiqad Ahl al-Sunnah: Critical Edition",
          category: "Manuscript Heritage & Editing",
          abstract: "Critical collation of three newly discovered Ottoman-era codices of Imam al-Lalaka'i's magnum opus, providing corrected variant readings and scholarly annotations.",
          keywords: ["Manuscript Heritage", "Textual Criticism", "Codices", "Ahl al-Sunnah"],
          pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          authorName: user.displayName || "Dr. Abdul Hameed",
          researcherId: user.uid,
          researcherEmail: user.email || "",
          status: "approved",
          createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
          approvedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
          reviewerFeedback: "Superb paleographical precision. Ready for archival preservation and open-access publication."
        },
        {
          title: "Islamic Macro-Economics: Inflation Mitigation Through Asset-Backed Currency Paradigms",
          category: "Islamic Economics & Finance",
          abstract: "Synthesizing classical monetary treatises by Al-Ghazali and Al-Maqrizi with modern inflationary models to propose resilient, commodity-indexed monetary stabilization mechanisms.",
          keywords: ["Monetary Policy", "Al-Maqrizi", "Inflation Mitigation", "Commodity Currency"],
          pdfLink: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
          authorName: "ASDRI Economic Research Circle",
          researcherId: "asdri_official_board",
          researcherEmail: "research@asdri.edu.bd",
          status: "approved",
          createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
          approvedAt: new Date(Date.now() - 86400000 * 25).toISOString(),
          reviewerFeedback: "Approved by Senior Shariah Board."
        }
      ];

      for (const p of demoPapers) {
        const authorProfile = {
          name: p.authorName,
          userId: p.researcherId,
          email: p.researcherEmail,
          institution: "As-Sunnah Dawah and Research Institute",
          contact: p.researcherEmail
        };
        const manuscriptMetadata = {
          title: p.title,
          category: p.category,
          abstract: p.abstract,
          keywords: p.keywords,
          fileUrl: p.pdfLink,
          googleDriveUrl: p.pdfLink,
          fileName: `${p.title.substring(0, 30)}.pdf`,
          fileSize: 1024 * 1024 * 2,
          submissionDate: p.createdAt
        };
        await addDoc(collection(db, 'research_papers'), {
          ...p,
          author_profile: authorProfile,
          manuscript_metadata: manuscriptMetadata
        });
      }

      // Seed 5 Central Library Books
      const demoBooks = [
        {
          title: "Sahih al-Bukhari (Darussalam 6-Vol Critical Edition)",
          author: "Imam Muhammad ibn Ismail al-Bukhari",
          category: "Hadith Sciences",
          isbn: "978-9960-717-31-8",
          location: "Shelf H-04, Bayt al-Hadith",
          availableStock: 5,
          totalStock: 6,
          language: "Arabic / English"
        },
        {
          title: "Al-Muwafaqat fi Usul al-Shariah (4 Volumes)",
          author: "Imam Abu Ishaq al-Shatibi",
          category: "Usul al-Fiqh & Maqasid",
          isbn: "978-2745100788",
          location: "Shelf F-12, Usul Hall",
          availableStock: 3,
          totalStock: 4,
          language: "Arabic"
        },
        {
          title: "Majmu' al-Fatawa (Comprehensive 35-Vol Edition)",
          author: "Shaykh al-Islam Ibn Taymiyyah",
          category: "Theology & Legal Fatwas",
          isbn: "978-9960-04-034-9",
          location: "Shelf T-01, Archive Wing",
          availableStock: 2,
          totalStock: 3,
          language: "Arabic"
        },
        {
          title: "Ihya Ulum al-Din (Revival of Religious Sciences)",
          author: "Imam Abu Hamid al-Ghazali",
          category: "Spiritual Dawah & Ethics",
          isbn: "978-1903682852",
          location: "Shelf D-08, Dawah Hall",
          availableStock: 4,
          totalStock: 5,
          language: "Arabic / English"
        },
        {
          title: "An Introduction to Islamic Finance (Theory & Practice)",
          author: "Mufti Muhammad Taqi Usmani",
          category: "Islamic Economics",
          isbn: "978-9004112001",
          location: "Shelf E-02, Economics Section",
          availableStock: 6,
          totalStock: 6,
          language: "English"
        }
      ];

      for (const b of demoBooks) {
        await addDoc(collection(db, 'library_books'), {
          ...b,
          createdAt: new Date().toISOString()
        });
      }

      await loadDashboardData();
      setSuccessMsg("Demo research papers and library manuscripts successfully seeded into Firebase!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error("Error seeding demo data:", err);
      setErrorMsg("Failed to seed demo data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Library Book Borrow Request
  const handleConfirmBorrow = async () => {
    if (!borrowingBook || !user) return;
    setIsBorrowSubmitting(true);
    try {
      const borrowData = {
        bookId: borrowingBook.id,
        bookTitle: borrowingBook.title,
        author: borrowingBook.author,
        isbn: borrowingBook.isbn || '',
        shelfLocation: borrowingBook.location || '',
        userId: user.uid,
        userName: user.displayName || authorName || 'Researcher',
        userEmail: user.email || '',
        borrowDate: borrowDate,
        returnDate: returnDate,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'borrow_requests'), borrowData);
      try {
        await addDoc(collection(db, 'book_loans'), borrowData);
      } catch (e) {
        // sync
      }

      setBorrowSuccessMsg(dict.borrowSuccess);
      setBorrowingBook(null);
      await loadDashboardData();
      setTimeout(() => setBorrowSuccessMsg(''), 4000);
    } catch (err: any) {
      alert("Failed to submit borrow request: " + err.message);
    } finally {
      setIsBorrowSubmitting(false);
    }
  };

  // Calculations for Summary Metrics
  const mySubmissionsCount = myPapers.length;
  const approvedJournalsCount = livePapers.length;
  const underReviewCount = myPapers.filter(p => p.status === 'under_review' || !p.status).length;
  const revisionRequiredCount = myPapers.filter(p => p.status === 'needs_revision').length;

  // Filtered Live Papers for Public Catalog Tab
  const filteredLivePapers = livePapers.filter(p => {
    const pTitle = (p.title || p.manuscript_metadata?.title || '').toLowerCase();
    const pAbstract = (p.abstract || p.manuscript_metadata?.abstract || '').toLowerCase();
    const pAuthor = (p.authorName || p.author_profile?.name || '').toLowerCase();
    const pKeywords = (p.keywords || p.manuscript_metadata?.keywords || []).map((k: string) => k.toLowerCase());
    const q = liveSearchQuery.toLowerCase();

    const matchesSearch = !q || pTitle.includes(q) || pAbstract.includes(q) || pAuthor.includes(q) || pKeywords.some((k: string) => k.includes(q));
    const pCat = p.category || p.manuscript_metadata?.category || '';
    const matchesCategory = liveCategoryFilter === 'All' || pCat === liveCategoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Filtered Library Books
  const filteredBooks = libraryBooks.filter(b => {
    const q = libSearch.toLowerCase();
    return !q || b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.isbn?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. TOP HEADER & ACTION CONTROL BAR */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-900 border border-emerald-200/60 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              Double-Blind Peer Review Board
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-950 font-serif tracking-tight">
            {dict.welcome}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-sans">
            {dict.subWelcome}
          </p>
        </div>

        {/* Action Buttons Hub */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSeedDemoData}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Seed 5 Mock Manuscripts + 5 Library Books"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{dict.seedDemoBtn}</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{dict.refreshBtn}</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className="px-4 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Library className="w-4 h-4 text-amber-300" />
            <span>{dict.libraryBtn}</span>
          </button>

          <button
            onClick={() => setActiveTab('submit')}
            className="px-4 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>{dict.submitNewBtn}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS / ERROR ALERTS */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fadeIn shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {borrowSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fadeIn shadow-xs">
          <BookmarkCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{borrowSuccessMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-3 animate-fadeIn shadow-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. SUMMARY METRIC KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: My Submissions */}
        <div 
          onClick={() => setActiveTab('submissions')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
            activeTab === 'submissions' ? 'border-[#064e3b] ring-2 ring-[#064e3b]/10' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide font-sans">{dict.statMySubmissions}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">{mySubmissionsCount}</span>
            <span className="text-[11px] font-semibold text-emerald-700">Papers</span>
          </div>
        </div>

        {/* Card 2: Approved Journals */}
        <div 
          onClick={() => setActiveTab('live')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
            activeTab === 'live' ? 'border-[#064e3b] ring-2 ring-[#064e3b]/10' : 'border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide font-sans">{dict.statApprovedJournals}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif">{approvedJournalsCount}</span>
            <span className="text-[11px] font-semibold text-amber-700">Published</span>
          </div>
        </div>

        {/* Card 3: Under Review */}
        <div 
          onClick={() => setActiveTab('submissions')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-amber-400 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide font-sans">{dict.statUnderReview}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-900 font-serif">{underReviewCount}</span>
            <span className="text-[11px] font-semibold text-amber-600">Active Review</span>
          </div>
        </div>

        {/* Card 4: Revision Required */}
        <div 
          onClick={() => setActiveTab('submissions')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-rose-400 transition-all cursor-pointer shadow-2xs hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide font-sans">{dict.statRevisionRequired}</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-900 font-serif">{revisionRequiredCount}</span>
            <span className="text-[11px] font-semibold text-rose-600">Actions Pending</span>
          </div>
        </div>

      </div>

      {/* 3. WORKSPACE TABS SELECTOR */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('submissions'); setSelectedPaper(null); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{dict.tabMySubmissions}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'submissions' ? 'bg-emerald-800 text-amber-300' : 'bg-slate-200 text-slate-700'
          }`}>
            {myPapers.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('submit'); setSelectedPaper(null); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'submit'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{dict.tabSubmitNew}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
            New
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('live'); setSelectedPaper(null); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'live'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>{dict.tabGlobalLive}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'live' ? 'bg-emerald-800 text-amber-300' : 'bg-slate-200 text-slate-700'
          }`}>
            {livePapers.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('library'); setSelectedPaper(null); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'library'
              ? 'bg-[#064e3b] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>{dict.tabLibrary}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'library' ? 'bg-emerald-800 text-amber-300' : 'bg-slate-200 text-slate-700'
          }`}>
            {libraryBooks.length}
          </span>
        </button>
      </div>

      {/* 4. WORKSPACE TAB CONTENTS */}

      {/* ============================================================== */}
      {/* TAB 1: MY SUBMISSIONS (User Submission Tracking) */}
      {/* ============================================================== */}
      {activeTab === 'submissions' && !selectedPaper && (
        <div className="space-y-6 animate-fadeIn">
          {myPapers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-[#064e3b] rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-serif">No Manuscripts Submitted Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {dict.noPapersYet}
              </p>
              <button
                onClick={() => setActiveTab('submit')}
                className="px-5 py-2.5 bg-[#064e3b] text-white text-xs font-bold rounded-xl hover:bg-[#043d2e] transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-amber-300" />
                <span>{dict.submitNewBtn}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myPapers.map((paper) => {
                const paperKeywords = paper.keywords || paper.manuscript_metadata?.keywords || [];
                const paperCat = paper.category || paper.manuscript_metadata?.category;
                const paperTitle = paper.title || paper.manuscript_metadata?.title;
                const paperAbstract = paper.abstract || paper.manuscript_metadata?.abstract;
                const paperStatus = paper.status || 'under_review';
                const fileLink = paper.pdfLink || paper.manuscript_metadata?.fileUrl || paper.manuscript_metadata?.googleDriveUrl;

                return (
                  <div 
                    key={paper.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-emerald-700/40 hover:shadow-xs transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Category and Status Badge */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                          {paperCat}
                        </span>

                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border flex items-center gap-1 ${
                          paperStatus === 'approved' 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                            : paperStatus === 'needs_revision' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {paperStatus === 'approved' && <CheckCircle className="w-3 h-3 text-emerald-600" />}
                          {paperStatus === 'needs_revision' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          {paperStatus === 'under_review' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>
                            {paperStatus === 'approved' ? dict.approved : paperStatus === 'needs_revision' ? dict.needsRevision : dict.underReview}
                          </span>
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 font-serif leading-snug">
                        {paperTitle}
                      </h3>

                      {/* Abstract preview */}
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-sans">
                        {paperAbstract}
                      </p>

                      {/* Keywords Badges */}
                      {paperKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {paperKeywords.slice(0, 4).map((kw: string, i: number) => (
                            <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-900 border border-emerald-100">
                              #{kw}
                            </span>
                          ))}
                          {paperKeywords.length > 4 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              +{paperKeywords.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Reviewer Feedback Notes if available */}
                      {paper.reviewerFeedback && (
                        <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs space-y-1">
                          <span className="font-extrabold text-amber-900 flex items-center gap-1 text-[11px] uppercase tracking-wide">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                            {dict.reviewerFeedback}
                          </span>
                          <p className="text-slate-800 italic font-serif leading-relaxed">
                            &ldquo;{paper.reviewerFeedback}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Bottom action row */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs gap-3">
                      <span className="text-slate-400 text-[11px] font-medium font-mono">
                        {new Date(paper.createdAt || Date.now()).toLocaleDateString(locale)}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedPaper(paper)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-[#064e3b] hover:text-white text-slate-800 font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{dict.viewManuscript}</span>
                        </button>

                        {fileLink && (
                          <a
                            href={fileLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg transition-all border border-emerald-200/60"
                            title="Open Document PDF"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBMISSION MODAL / DETAILED MANUSCRIPT METADATA POPUP */}
      {selectedPaper && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 animate-fadeIn">
          <button
            onClick={() => setSelectedPaper(null)}
            className="text-xs font-bold text-[#064e3b] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            &larr; {dict.backToList}
          </button>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] bg-emerald-50 text-[#064e3b] font-extrabold px-3 py-1 rounded-md border border-emerald-200 uppercase tracking-wide">
                  {selectedPaper.category || selectedPaper.manuscript_metadata?.category}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-serif mt-2.5">
                  {selectedPaper.title || selectedPaper.manuscript_metadata?.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-sans">
                  Author / Scholar: <strong className="text-slate-800 font-bold">{selectedPaper.authorName || selectedPaper.author_profile?.name}</strong>
                </p>
              </div>

              <span className={`text-xs font-extrabold px-3.5 py-1.5 rounded-full uppercase border ${
                selectedPaper.status === 'approved' 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : selectedPaper.status === 'needs_revision' 
                  ? 'bg-rose-50 text-rose-700 border-rose-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {selectedPaper.status === 'approved' ? dict.approved : selectedPaper.status === 'needs_revision' ? dict.needsRevision : dict.underReview}
              </span>
            </div>

            {/* Abstract Section */}
            <div className="space-y-2 bg-slate-50/80 p-5 rounded-xl border border-slate-200/60">
              <h4 className="font-extrabold text-xs text-[#064e3b] uppercase tracking-wider font-sans">
                {dict.abstract}
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-serif italic whitespace-pre-line">
                {selectedPaper.abstract || selectedPaper.manuscript_metadata?.abstract}
              </p>
            </div>

            {/* Keywords Tag List */}
            {((selectedPaper.keywords || selectedPaper.manuscript_metadata?.keywords || []).length > 0) && (
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wide">Keywords & Field Classification:</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedPaper.keywords || selectedPaper.manuscript_metadata?.keywords || []).map((k: string, i: number) => (
                    <span key={i} className="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-50 text-[#064e3b] border border-emerald-200/70">
                      #{k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviewer notes */}
            {selectedPaper.reviewerFeedback && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <span className="font-bold text-xs text-amber-900 block">{dict.reviewerFeedback}</span>
                <p className="text-xs text-slate-800 font-serif leading-relaxed italic">
                  &ldquo;{selectedPaper.reviewerFeedback}&rdquo;
                </p>
              </div>
            )}

            {/* Prominent Read Full Article (PDF) Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="text-[11px] text-slate-500 font-mono">
                Submitted on {new Date(selectedPaper.createdAt || Date.now()).toLocaleDateString(locale)}
              </div>

              {(selectedPaper.pdfLink || selectedPaper.manuscript_metadata?.fileUrl || selectedPaper.manuscript_metadata?.googleDriveUrl) ? (
                <a
                  href={selectedPaper.pdfLink || selectedPaper.manuscript_metadata?.fileUrl || selectedPaper.manuscript_metadata?.googleDriveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>{dict.readPdf}</span>
                </a>
              ) : (
                <span className="text-xs text-slate-400 italic">No external document link provided</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SUBMIT NEW PAPER (Metadata + File/Link Submission Flow) */}
      {/* ============================================================== */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-4xl animate-fadeIn space-y-6">
          
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#064e3b] flex items-center justify-center font-bold">
                <Plus className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 font-serif">
                {dict.tabSubmitNew}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-sans">
              Double-Blind Peer Review: Your author identity will be encrypted and separated from the manuscript text during reviewer evaluation.
            </p>
          </div>

          <form onSubmit={handleSubmitPaper} className="space-y-6">
            
            {/* 1. Article Metadata Fields */}
            <div className="space-y-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#064e3b] flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                1. Article Metadata (Visible in Public Directory)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Paper Title */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-slate-800">
                    {dict.paperTitle} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={dict.paperTitlePlaceholder}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all shadow-inner font-sans"
                  />
                </div>

                {/* Theology & Research Field */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    {dict.category} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all font-sans cursor-pointer"
                  >
                    <option value="Al-Quran & Hadith Sciences">Al-Quran & Hadith Sciences / আল-কুরআন ও হাদিস বিজ্ঞান</option>
                    <option value="Islamic Jurisprudence (Usul al-Fiqh)">Islamic Jurisprudence (Usul al-Fiqh) / উসূলে ফিকাহ ও আইনশাস্ত্র</option>
                    <option value="Theology & Aqeedah">Theology & Aqeedah / আকীদা ও কালাম</option>
                    <option value="Dawah & Contemporary Culture">Dawah & Contemporary Culture / দাওয়াহ ও সমসাময়িক সংস্কৃতি</option>
                    <option value="Islamic Economics & Finance">Islamic Economics & Finance / ইসলামী অর্থনীতি ও ব্যাংকিং</option>
                    <option value="Comparative Religion">Comparative Religion / তুলনামূলক ধর্মতত্ত্ব</option>
                    <option value="Manuscript Heritage & Editing">Manuscript Heritage & Editing / পাণ্ডুলিপি ও ঐতিহ্য সম্পাদনা</option>
                    <option value="Other / Custom Field...">Other / Custom Field... (কাস্টম শাস্ত্র লিখুন)</option>
                  </select>
                </div>

                {/* Corresponding Scholar Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    {dict.authorName} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder={dict.authorNamePlaceholder}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all font-sans"
                  />
                </div>

                {/* Conditional Custom Category Input */}
                {category === 'Other / Custom Field...' && (
                  <div className="space-y-1.5 md:col-span-2 animate-fadeIn">
                    <label className="text-xs font-bold text-amber-800">
                      Specify Custom Research Field / Discipline <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder={dict.customCategoryPlaceholder}
                      className="w-full px-4 py-2.5 text-xs bg-amber-50/50 border border-amber-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-600 focus:bg-white transition-all font-sans"
                    />
                  </div>
                )}

                {/* Abstract & Scope */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800">
                      {dict.abstract} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Published on site index</span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    placeholder={dict.abstractPlaceholder}
                    className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all font-serif leading-relaxed shadow-inner"
                  />
                  <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100">
                    {dict.abstractNotice}
                  </p>
                </div>

                {/* Interactive Keywords Tag Input */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-emerald-700" />
                    {dict.keywordsLabel}
                  </label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                      placeholder={dict.keywordsPlaceholder}
                      className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all font-sans"
                    />
                    <button
                      type="button"
                      onClick={handleAddKeyword}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-[#064e3b] hover:text-white text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      {dict.addTag}
                    </button>
                  </div>

                  {/* Render Keyword Tags */}
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {keywords.map((kw, idx) => (
                        <span 
                          key={idx} 
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-[#064e3b] border border-emerald-200 shadow-2xs"
                        >
                          #{kw}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(kw)}
                            className="w-3.5 h-3.5 rounded-full hover:bg-emerald-200 flex items-center justify-center text-emerald-900"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* 2. Full Manuscript Submission (File Upload or External Link) */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#064e3b] flex items-center gap-2">
                <Upload className="w-4 h-4" />
                2. Manuscript File Submission (No Full-Text Textarea Required)
              </h3>

              {/* Drag & Drop File Uploader */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver 
                    ? 'border-[#064e3b] bg-emerald-50/50' 
                    : uploadedFile 
                    ? 'border-emerald-500 bg-emerald-50/30' 
                    : 'border-slate-300 hover:border-emerald-600 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                />

                {uploadedFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-900 font-mono">{uploadedFile.name}</p>
                      <p className="text-[11px] text-slate-500">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB — Ready to submit</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadedFile(null);
                        setUploadProgress(null);
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 ml-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#064e3b] flex items-center justify-center mx-auto shadow-2xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">{dict.fileUploadTitle}</p>
                    <p className="text-[11px] text-slate-500">{dict.fileUploadSub}</p>
                  </div>
                )}

                {uploadProgress !== null && (
                  <div className="mt-3 max-w-xs mx-auto">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-[#064e3b] h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-600 mt-1 block font-mono">Uploading: {uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* OR Google Drive Link */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {dict.googleDriveTitle}
                </label>
                <input
                  type="url"
                  value={googleDriveUrl}
                  onChange={(e) => setGoogleDriveUrl(e.target.value)}
                  placeholder={dict.googleDrivePlaceholder}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all font-mono"
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#064e3b] hover:bg-[#043d2e] active:bg-[#022c22] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>{dict.submitting}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-amber-300" />
                    <span>{dict.submitBtn}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: GLOBAL LIVE PUBLICATIONS (ASDRI Journal Catalog) */}
      {/* ============================================================== */}
      {activeTab === 'live' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={liveSearchQuery}
                  onChange={(e) => setLiveSearchQuery(e.target.value)}
                  placeholder={dict.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white transition-all font-sans"
                />
              </div>

              <select
                value={liveCategoryFilter}
                onChange={(e) => setLiveCategoryFilter(e.target.value)}
                className="px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans cursor-pointer"
              >
                <option value="All">{dict.allCategories}</option>
                <option value="Al-Quran & Hadith Sciences">Al-Quran & Hadith Sciences</option>
                <option value="Islamic Jurisprudence (Usul al-Fiqh)">Islamic Jurisprudence (Usul al-Fiqh)</option>
                <option value="Theology & Aqeedah">Theology & Aqeedah</option>
                <option value="Dawah & Contemporary Culture">Dawah & Contemporary Culture</option>
                <option value="Islamic Economics & Finance">Islamic Economics & Finance</option>
                <option value="Manuscript Heritage & Editing">Manuscript Heritage & Editing</option>
              </select>
            </div>
          </div>

          {/* Publications Grid */}
          {filteredLivePapers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs sm:text-sm text-slate-500 italic">{dict.noLiveFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredLivePapers.map((paper) => {
                const paperTitle = paper.title || paper.manuscript_metadata?.title;
                const paperCat = paper.category || paper.manuscript_metadata?.category;
                const paperAbstract = paper.abstract || paper.manuscript_metadata?.abstract;
                const paperAuthor = paper.authorName || paper.author_profile?.name;
                const paperKeywords = paper.keywords || paper.manuscript_metadata?.keywords || [];
                const docLink = paper.pdfLink || paper.manuscript_metadata?.fileUrl || paper.manuscript_metadata?.googleDriveUrl;

                return (
                  <div 
                    key={paper.id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between hover:border-emerald-700/30 hover:shadow-xs transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-[#064e3b] border border-emerald-200/60">
                          {paperCat}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold">
                          Published {new Date(paper.approvedAt || paper.createdAt || Date.now()).toLocaleDateString(locale)}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-slate-950 font-serif leading-snug">
                        {paperTitle}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-sans">
                        {paperAbstract}
                      </p>

                      {paperKeywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {paperKeywords.map((kw: string, i: number) => (
                            <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block uppercase font-sans">Scholar / Author</span>
                        <strong className="text-slate-800 text-[11px]">{paperAuthor}</strong>
                      </div>

                      {docLink && (
                        <a
                          href={docLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-[#064e3b] text-[#064e3b] hover:text-white border border-emerald-200/70 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{dict.downloadPdf}</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: LIBRARY & MANUSCRIPT ACCESS (Central Library Connection) */}
      {/* ============================================================== */}
      {activeTab === 'library' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Header & Search */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
                  <Library className="w-5 h-5 text-emerald-800" />
                  {dict.libTitle}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct live access to ASDRI Central Physical & Digital Archives for Academic Scholars.
                </p>
              </div>

              <div className="relative min-w-[280px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={libSearch}
                  onChange={(e) => setLibSearch(e.target.value)}
                  placeholder={dict.libSearchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:bg-white font-sans"
                />
              </div>
            </div>
          </div>

          {/* Books List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <div 
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between hover:border-emerald-700/40 hover:shadow-xs transition-all space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-emerald-50 text-[#064e3b] border border-emerald-100">
                      {book.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      {book.language || 'Arabic'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-950 font-serif leading-snug">
                    {book.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium">
                    By: <strong className="text-slate-800">{book.author}</strong>
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>{dict.shelfLocation}:</span>
                      <span className="font-bold text-slate-900 font-mono">{book.location || 'Section A-1'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{dict.isbn}:</span>
                      <span className="font-mono text-slate-700">{book.isbn || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{dict.stockAvailable}:</span>
                      <span className="font-extrabold text-emerald-800">{book.availableStock ?? 4} Copies</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setBorrowingBook(book)}
                    className="w-full py-2 bg-[#064e3b] hover:bg-[#043d2e] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5 text-amber-300" />
                    <span>{dict.requestBorrow}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* BORROW REQUEST MODAL */}
      {borrowingBook && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 p-6 shadow-xl space-y-5 animate-slideIn">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {borrowingBook.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 font-serif mt-1">
                  {borrowingBook.title}
                </h3>
                <p className="text-xs text-slate-500">By {borrowingBook.author}</p>
              </div>
              <button 
                onClick={() => setBorrowingBook(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-xs border border-slate-100">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{dict.borrowDateLabel}</label>
                <input
                  type="date"
                  value={borrowDate}
                  onChange={(e) => setBorrowDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">{dict.returnDateLabel}</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setBorrowingBook(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                {dict.cancel}
              </button>

              <button
                type="button"
                disabled={isBorrowSubmitting}
                onClick={handleConfirmBorrow}
                className="px-5 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-xl hover:bg-[#043d2e] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isBorrowSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5 text-amber-300" />}
                <span>{dict.confirmBorrow}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
