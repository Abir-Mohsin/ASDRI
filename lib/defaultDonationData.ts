export interface DonationFund {
  id: string;
  titleBn: string;
  titleEn: string;
  titleAr: string;
  descBn: string;
  descEn: string;
  descAr: string;
  targetAmount: number;
  raisedAmount: number;
  category: 'zakat' | 'sadaqah' | 'waqf' | 'education';
  iconName: string;
  isActive: boolean;
}

export const defaultDonationFunds: DonationFund[] = [
  {
    id: 'fund-scholarship',
    titleBn: 'অসচ্ছল তালেবে ইলম ও গবেষক শিক্ষাবৃত্তি ফান্ড',
    titleEn: 'Needy Students & Scholarly Fellowship Fund',
    titleAr: 'صندوق المنح الدراسية لطلاب العلم والباحثين',
    descBn: 'মেধাবী কিন্তু অসচ্ছল শিক্ষার্থীদের কিতাব, আবাসন ও শিক্ষাব্যয় নির্বাহে যাকাত ও সাধারণ অনুদান গৃহীত হয়।',
    descEn: 'Empowering deserving students and researchers of Islamic sciences with tuition and living support.',
    descAr: 'دعم ورعاية طلبة العلم والباحثين المتفوقين غير القادرين في دراساتهم وبحوثهم الشرعية.',
    targetAmount: 2500000,
    raisedAmount: 1680000,
    category: 'zakat',
    iconName: 'GraduationCap',
    isActive: true
  },
  {
    id: 'fund-research',
    titleBn: 'ইসলামিক রিসার্চ ও দারুত তাসনিফ প্রকাশনা ফান্ড',
    titleEn: 'Islamic Research & Classical Manuscripts Publishing Fund',
    titleAr: 'صندوق دعم البحوث والتحقيق والنشر العلمي',
    descBn: 'গুরুত্বপূর্ণ দুর্লভ পাণ্ডুলিপি তাহকীক, অনুবাদ এবং সমসাময়িক ফিকহি গবেষণাপত্র প্রকাশের তহবিল।',
    descEn: 'Funding rigorous editing of classical manuscripts, translations, and peer-reviewed Islamic journals.',
    descAr: 'تمويل تحقيق المخطوطات النادرة ونشر الإصدارات والبحوث الفقهية المعاصرة.',
    targetAmount: 1800000,
    raisedAmount: 1120000,
    category: 'education',
    iconName: 'BookOpen',
    isActive: true
  },
  {
    id: 'fund-campus',
    titleBn: 'ক্যাম্পাস ও লাইব্রেরি উন্নয়ন ওয়াকফ ফান্ড',
    titleEn: 'Campus Infrastructure & Digital Library Waqf Fund',
    titleAr: 'وقف تطوير الحرم والمكتبة الرقمية',
    descBn: 'গবেষণার জন্য সমৃদ্ধ কিতাব সম্ভার, স্টাডি হল এবং স্থায়ী ক্যাম্পাসের অবকাঠামো নির্মাণে সদকায়ে জারিয়া।',
    descEn: 'Sadaqah Jariyah for developing the physical research halls, servers, and classical book acquisitions.',
    descAr: 'صدقة جارية لتوسيع قاعات البحث والمكتبة المركزية وتجهيزات البنية التحتية.',
    targetAmount: 5000000,
    raisedAmount: 3450000,
    category: 'waqf',
    iconName: 'Building2',
    isActive: true
  },
  {
    id: 'fund-quran-dist',
    titleBn: 'বিনামূল্যে কুরআন ও সহীহ হাদিস বিতরণ ফান্ড',
    titleEn: 'Free Quran & Authentic Hadith Distribution Fund',
    titleAr: 'مشروع توزيع المصاحف وكتب السنة المشرفة',
    descBn: 'দূরবর্তী অঞ্চল ও বিভিন্ন প্রতিষ্ঠানে শুদ্ধ উচ্চারণের অনুবাদসহ কুরআনুল কারীম ও হাদীস বিতরণ।',
    descEn: 'Distributing accurate translations of the Holy Quran and prophetic traditions to seekers of truth.',
    descAr: 'طباعة وتوزيع المصحف الشريف وكتب الحديث الصحيحة في المناطق المحتاجة.',
    targetAmount: 1000000,
    raisedAmount: 820000,
    category: 'sadaqah',
    iconName: 'HeartHandshake',
    isActive: true
  },
  {
    id: 'fund-relief',
    titleBn: 'দরিদ্র ও দুর্যোগপীড়িতদের পুনর্বাসন ত্রাণ ফান্ড',
    titleEn: 'Humanitarian & Disaster Relief Fund',
    titleAr: 'صندوق الإغاثة الإنسانية وكفالة الأسر المتعففة',
    descBn: 'বন্যা, শীত বা দুর্যোগের সময় ক্ষতিগ্রস্ত অসহায় পরিবারগুলোর জরুরি খাদ্য ও চিকিৎসা সহায়তা।',
    descEn: 'Emergency humanitarian assistance, medical aid, and livelihood rehabilitation for impoverished families.',
    descAr: 'تقديم المساعدات العاجلة للمتضررين من الكوارث وإعانة الأسر المحتاجة.',
    targetAmount: 3000000,
    raisedAmount: 2190000,
    category: 'sadaqah',
    iconName: 'ShieldAlert',
    isActive: true
  }
];

export const bankAccounts = [
  {
    bankName: 'Islami Bank Bangladesh PLC',
    bankNameBn: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
    accountName: 'As-Sunnah Dawah & Research Institute',
    accountNameBn: 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট',
    accountNumber: '20503920100489100',
    branch: 'Kakrail Branch, Dhaka',
    branchBn: 'কাকরাইল শাখা, ঢাকা',
    routingNumber: '125262719',
    swiftCode: 'IBBLBDDH'
  },
  {
    bankName: 'Al-Arafah Islami Bank PLC',
    bankNameBn: 'আল-আরাফাহ ইসলামী ব্যাংক পিএলসি',
    accountName: 'As-Sunnah Research Foundation',
    accountNameBn: 'আস-সুন্নাহ রিসার্চ ফাউন্ডেশন',
    accountNumber: '0181120039281',
    branch: 'Motijheel Corporate Branch, Dhaka',
    branchBn: 'মতিঝিল কর্পোরেট শাখা, ঢাকা',
    routingNumber: '015273182',
    swiftCode: 'AIBLBDDH'
  }
];

export const mobileBanking = [
  {
    provider: 'bKash Merchant / Merchant QR',
    providerBn: 'বিকাশ মার্চেন্ট (পেমেন্ট অপশন)',
    number: '01711-000000',
    type: 'Merchant / Payment'
  },
  {
    provider: 'Nagad Merchant',
    providerBn: 'নগদ মার্চেন্ট',
    number: '01811-000000',
    type: 'Merchant'
  },
  {
    provider: 'Rocket Biller ID',
    providerBn: 'রকেট বিলার আইডি',
    number: '3948',
    type: 'Biller ID'
  }
];
