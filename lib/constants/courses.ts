export interface CourseFee {
  admissionFee: number;
  tuitionFee: number;
  accommodationFee: number;
  totalFee: number;
  isFree: boolean;
  currency: string;
  notes?: string;
  notes_en?: string;
  notes_ar?: string;
}

export interface CourseItem {
  id: string;
  title: string;
  title_bn?: string;
  title_ar?: string;
  duration: string;
  duration_bn?: string;
  duration_ar?: string;
  type: string;
  type_bn?: string;
  type_ar?: string;
  eligibility: string;
  eligibility_bn?: string;
  eligibility_ar?: string;
  fees: CourseFee;
  allowScholarship?: boolean;
  zakatFormEnabled?: boolean;
}

export const COURSES: CourseItem[] = [
  {
    id: "pys",
    title: "Preparatory Year for Specialization (PYS)",
    title_bn: "স্পেশালাইজেশন প্রস্তুতিমূলক বর্ষ (PYS)",
    title_ar: "السنة التمهيدية للتخصص (PYS)",
    duration: "1 Year",
    duration_bn: "১ বছর",
    duration_ar: "سنة واحدة",
    type: "Residential/Non-Residential",
    type_bn: "আবাসিক / অনাবাসিক",
    type_ar: "داخلي / خارجي",
    eligibility: "Takmil from Qawmi Madrasa or Fadil/Kamil from Alia Madrasa",
    eligibility_bn: "কওমি মাদরাসা থেকে তাকমিল অথবা আলিয়া মাদরাসা থেকে ফাজিল/কামিল",
    eligibility_ar: "التكميل من المدارس القومية أو الفاضل/الكامل من المدارس العالية",
    allowScholarship: true,
    zakatFormEnabled: true,
    fees: {
      admissionFee: 2000,
      tuitionFee: 12000,
      accommodationFee: 6000,
      totalFee: 20000,
      isFree: false,
      currency: "BDT",
      notes: "আবাসন ও খাবার সুবিধা অন্তর্ভুক্ত (আবাসিকদের জন্য)",
      notes_en: "Accommodation and meals included (for residential students)",
      notes_ar: "تشمل الإقامة والوجبات للطلاب المقيمين"
    }
  },
  {
    id: "certificate_islamic_studies",
    title: "Certificate Course in Islamic Studies",
    title_bn: "ইসলামিক স্টাডিজ সার্টিফিকেট কোর্স",
    title_ar: "شهادة في الدراسات الإسلامية",
    duration: "6 Months",
    duration_bn: "৬ মাস",
    duration_ar: "٦ أشهر",
    type: "General Students",
    type_bn: "সাধারণ শিক্ষার্থী",
    type_ar: "للطلاب العامين",
    eligibility: "Minimum HSC or equivalent",
    eligibility_bn: "নূন্যতম এইচএসসি বা সমমান",
    eligibility_ar: "شهادة الثانوية العامة أو ما يعادلها كحد أدنى",
    allowScholarship: true,
    zakatFormEnabled: true,
    fees: {
      admissionFee: 1000,
      tuitionFee: 5000,
      accommodationFee: 0,
      totalFee: 6000,
      isFree: false,
      currency: "BDT",
      notes: "অনলাইন ও উইকেন্ড সেশন সুবিধা",
      notes_en: "Online & weekend flexible study sessions",
      notes_ar: "جلسات دراسية مرنة عبر الإنترنت وفي عطلة نهاية الأسبوع"
    }
  },
  {
    id: "diploma_dawah",
    title: "Diploma in Dawah and Islamic Studies",
    title_bn: "ডিপ্লোমা ইন দাওয়াহ অ্যান্ড ইসলামিক স্টাডিজ",
    title_ar: "دبلوم الدعوة والدراسات الإسلامية",
    duration: "2 Years",
    duration_bn: "২ বছর",
    duration_ar: "سنتان",
    type: "General Students",
    type_bn: "সাধারণ শিক্ষার্থী ও প্রফেশনাল",
    type_ar: "للطلاب العامين والمهنيين",
    eligibility: "Minimum Bachelor Degree or equivalent",
    eligibility_bn: "নূন্যতম স্নাতক ডিগ্রি বা সমমান",
    eligibility_ar: "درجة البكالوريوس أو ما يعادلها كحد أدنى",
    allowScholarship: true,
    zakatFormEnabled: true,
    fees: {
      admissionFee: 2500,
      tuitionFee: 18000,
      accommodationFee: 0,
      totalFee: 20500,
      isFree: false,
      currency: "BDT",
      notes: "সেমিস্টার ভিত্তিক পরিশোধযোগ্য",
      notes_en: "Payable on a semester-by-semester basis",
      notes_ar: "قابل للسداد بنظام الفصول الدراسية"
    }
  },
  {
    id: "arabic_language_teacher",
    title: "Arabic Language Teacher Training",
    title_bn: "আরবি ভাষা শিক্ষক প্রশিক্ষণ",
    title_ar: "تدريب معلمي اللغة العربية",
    duration: "15 Days",
    duration_bn: "১৫ দিন",
    duration_ar: "١٥ يوماً",
    type: "Male Only",
    type_bn: "শুধুমাত্র পুরুষদের জন্য",
    type_ar: "للذكور فقط",
    eligibility: "Takmil from Qawmi, Fazil from Alia, or Graduate from Arabic University",
    eligibility_bn: "কওমি থেকে তাকমিল, আলিয়া থেকে ফাজিল বা আরবি বিশ্ববিদ্যালয় থেকে স্নাতক",
    eligibility_ar: "التكميل من القومية، أو الفاضل من العالية، أو خريج جامعة عربية",
    allowScholarship: true,
    zakatFormEnabled: true,
    fees: {
      admissionFee: 500,
      tuitionFee: 2500,
      accommodationFee: 1000,
      totalFee: 4000,
      isFree: false,
      currency: "BDT",
      notes: "নিবিড় প্রশিক্ষণ ওয়ার্কশপ",
      notes_en: "Intensive residential teacher training workshop",
      notes_ar: "ورشة عمل تدريبية مكثفة للمعلمين"
    }
  },
  {
    id: "ramadan_dawah",
    title: "Ramadan Dawah Training",
    title_bn: "রমাদান দাওয়াহ প্রশিক্ষণ কোর্স",
    title_ar: "دورة الدعوة الرمضانية المكثفة",
    duration: "20 Days",
    duration_bn: "২০ দিন",
    duration_ar: "٢٠ يوماً",
    type: "Male Only",
    type_bn: "শুধুমাত্র পুরুষদের জন্য",
    type_ar: "للذكور فقط",
    eligibility: "Takmil from Qawmi, Fazil-Kamil from Alia, and Honors-Masters from University",
    eligibility_bn: "কওমি তাকমিল, আলিয়া ফাজিল-কামিল ও সাধারণ বিশ্ববিদ্যালয় গ্র্যাজুয়েট",
    eligibility_ar: "خريجو المعاهد والجامعات الإسلامية والعامة",
    allowScholarship: false,
    zakatFormEnabled: false,
    fees: {
      admissionFee: 0,
      tuitionFee: 0,
      accommodationFee: 0,
      totalFee: 0,
      isFree: true,
      currency: "BDT",
      notes: "সম্পূর্ণ বিনামূল্যে (ইনস্টিটিউট স্কলারশিপ ফান্ড কর্তৃক পরিচালিত)",
      notes_en: "100% Free (Sponsored by Institute Scholarship Fund)",
      notes_ar: "مجاني بالكامل (برعاية صندوق المنح بمعهد السنة)"
    }
  },
  {
    id: "azan_training",
    title: "Azan Training Program",
    title_bn: "আজান প্রশিক্ষণ ও মুয়াজ্জিন কোর্স",
    title_ar: "برنامج تدريب الأذان وإعداد المؤذنين",
    duration: "15 Days",
    duration_bn: "১৫ দিন",
    duration_ar: "١٥ يوماً",
    type: "Male Only",
    type_bn: "শুধুমাত্র পুরুষদের জন্য",
    type_ar: "للذكور فقط",
    eligibility: "Hafez/Alem or Nahabemil/Dakhil or equivalent level student",
    eligibility_bn: "হাফেজ/আলেম বা দাখিল বা সমমান শিক্ষার্থী",
    eligibility_ar: "حفظة القرآن الكريم والعلماء وطلاب المرحلة الثانوية",
    allowScholarship: false,
    zakatFormEnabled: false,
    fees: {
      admissionFee: 0,
      tuitionFee: 0,
      accommodationFee: 0,
      totalFee: 0,
      isFree: true,
      currency: "BDT",
      notes: "সম্পূর্ণ বিনামূল্যে প্রশিক্ষণ ও ফ্রি সনদ",
      notes_en: "Completely free training & accredited certificate",
      notes_ar: "تدريب مجاني بالكامل مع شهادة معتمدة"
    }
  }
];

export function getLocalizedCourse(course: CourseItem, locale: string = 'en') {
  if (!course) return course;
  if (locale === 'bn') {
    return {
      ...course,
      title: course.title_bn || course.title,
      duration: course.duration_bn || course.duration,
      type: course.type_bn || course.type,
      eligibility: course.eligibility_bn || course.eligibility,
      fees: {
        ...course.fees,
        notes: course.fees?.notes || ''
      }
    };
  }
  if (locale === 'ar') {
    return {
      ...course,
      title: course.title_ar || course.title,
      duration: course.duration_ar || course.duration,
      type: course.type_ar || course.type,
      eligibility: course.eligibility_ar || course.eligibility,
      fees: {
        ...course.fees,
        notes: course.fees?.notes_ar || course.fees?.notes_en || course.fees?.notes || ''
      }
    };
  }
  return {
    ...course,
    title: course.title,
    duration: course.duration,
    type: course.type,
    eligibility: course.eligibility,
    fees: {
      ...course.fees,
      notes: course.fees?.notes_en || course.fees?.notes || ''
    }
  };
}


