export interface CommitteeMember {
  id: string;
  name: string;
  designation: string; // e.g. President, General Secretary, Chief Advisor
  batch: string;
  department: string;
  currentProfession: string;
  organization: string;
  photoUrl: string;
  wing?: string;
  email?: string;
  phone?: string;
  bio?: string;
  order: number;
}

export interface AssociationWing {
  id: string;
  name: string;
  leadName: string;
  leadDesignation: string;
  leadPhoto: string;
  description: string;
  stats: {
    label: string;
    value: string;
  }[];
  activities: string[];
}

export interface GlobalChapter {
  id: string;
  city: string;
  country: string;
  flag: string;
  coordinatorName: string;
  coordinatorContact: string;
  membersCount: number;
  establishedYear: number;
  recentActivity: string;
}

export interface WelfareProject {
  id: string;
  title: string;
  category: 'scholarship' | 'medical' | 'research_grant' | 'emergency';
  targetAmount: number;
  raisedAmount: number;
  beneficiariesCount: number;
  description: string;
  status: 'active' | 'completed';
}

export interface MembershipTier {
  id: string;
  name: string;
  subtitle: string;
  fee: string;
  validity: string;
  benefits: string[];
  recommended?: boolean;
}

export const INITIAL_ADVISORS: CommitteeMember[] = [
  {
    id: 'adv-1',
    name: 'Shaikh Ahmadullah',
    designation: 'Chief Patron & Founding Advisor',
    batch: 'Founder',
    department: 'As-Sunnah Foundation & Institute',
    currentProfession: 'Chairman, As-Sunnah Foundation',
    organization: 'As-Sunnah Foundation',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    bio: 'Internationally renowned Islamic scholar and researcher. Has made outstanding contributions to Dawah and social welfare.',
    order: 1
  },
  {
    id: 'adv-2',
    name: 'Professor Dr. Muhammad Bilal Hossain',
    designation: 'Head of Academic Advisory Council',
    batch: 'Honorary',
    department: 'Faculty of Advanced Research and Fatwa',
    currentProfession: 'Former Head of Department & Dean',
    organization: 'Islamic University',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Renowned researcher of Hadith studies and Islamic curriculum expert.',
    order: 2
  }
];

export const INITIAL_EXECUTIVE_COMMITTEE: CommitteeMember[] = [
  {
    id: 'exec-1',
    name: 'Maulana Mahmud Hasan',
    designation: 'President',
    batch: '1st Batch (2021)',
    department: 'Department of Advanced Hadith & Dawah',
    currentProfession: 'Chief Researcher & Senior Khatib',
    organization: 'Central Jame Masjid Council',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    wing: 'Central Council',
    email: 'president.alumni@asdri.edu.bd',
    order: 1
  },
  {
    id: 'exec-2',
    name: 'Mufti Tawhidul Islam',
    designation: 'Vice President',
    batch: '2nd Batch (2022)',
    department: 'Department of Fiqh & Fatwa',
    currentProfession: 'Shariah Advisor',
    organization: 'Al-Baraka Islamic Banking',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    wing: 'Central Council',
    email: 'vp.alumni@asdri.edu.bd',
    order: 2
  },
  {
    id: 'exec-3',
    name: 'Maulana Asaduzzaman Noor',
    designation: 'General Secretary',
    batch: '4th Batch (2024)',
    department: 'Department of Arabic Language & Literature',
    currentProfession: 'Lecturer & Researcher',
    organization: 'Al-Hikmah College',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    wing: 'Central Council',
    email: 'gs.alumni@asdri.edu.bd',
    order: 3
  },
  {
    id: 'exec-4',
    name: 'Hafez Shabbir Ahmed',
    designation: 'Finance & Welfare Secretary',
    batch: '5th Batch (2025)',
    department: 'Islamic Finance & Banking',
    currentProfession: 'Financial Analyst',
    organization: 'Islami Bank Bangladesh PLC',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    wing: 'Welfare Wing',
    email: 'finance.alumni@asdri.edu.bd',
    order: 4
  },
  {
    id: 'exec-5',
    name: 'Shaikh Abdullah Al-Mamun',
    designation: 'International Affairs Coordinator',
    batch: '3rd Batch (2023)',
    department: 'Department of Quran & Qiraat',
    currentProfession: 'International Qari & Faculty',
    organization: 'London Islamic Academy (UK)',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    wing: 'International Wing',
    email: 'global.alumni@asdri.edu.bd',
    order: 5
  },
  {
    id: 'exec-6',
    name: 'Maulana Mushfiqur Rahman',
    designation: 'Education & Research Secretary',
    batch: '2nd Batch (2022)',
    department: 'Department of Advanced Hadith & Dawah',
    currentProfession: 'Assistant Researcher',
    organization: 'As-Sunnah Research Institute',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    wing: 'Research Wing',
    email: 'research.alumni@asdri.edu.bd',
    order: 6
  }
];

export const INITIAL_ASSOCIATION_WINGS: AssociationWing[] = [
  {
    id: 'wing-research',
    name: 'Islamic Research & Publication Wing',
    leadName: 'Maulana Mushfiqur Rahman',
    leadDesignation: 'Wing Coordinator (Research)',
    leadPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    description: 'Supports alumni researchers in publishing research papers, contemporary Fiqh compilations, and thesis articles in international journals.',
    stats: [
      { label: 'Published Papers', value: '28+' },
      { label: 'Active Researchers', value: '65 people' },
      { label: 'Annual Grant', value: 'BDT 500,000' }
    ],
    activities: [
      'Editing and publishing quarterly research paper ‘Al-Hikmah’',
      'Organizing international seminars and Fiqh workshops',
      'Providing thesis writing scholarships for new researchers'
    ]
  },
  {
    id: 'wing-welfare',
    name: 'Alumni Welfare & Zakat/Scholarship Fund',
    leadName: 'Hafez Shabbir Ahmed',
    leadDesignation: 'Wing Coordinator (Welfare)',
    leadPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    description: 'Manages scholarships for underprivileged students, emergency medical assistance, and self-reliance projects for former students.',
    stats: [
      { label: 'Funds Collected', value: 'BDT 1,250,000' },
      { label: 'Scholarship Recipients', value: '42 people' },
      { label: 'Medical Aid', value: '18 families' }
    ],
    activities: [
      'Fund for full tuition fee waiver for meritorious but underprivileged students',
      'Emergency medical and natural disaster assistance cell',
      'Self-reliant micro-enterprise loan (Qard al-Hasan)'
    ]
  },
  {
    id: 'wing-career',
    name: 'Career Development & Mentorship Cell',
    leadName: 'Mufti Tawhidul Islam',
    leadDesignation: 'Wing Coordinator (Career)',
    leadPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    description: 'Directly assists graduates in securing employment in teaching, khatib, banking, and research fields domestically and internationally.',
    stats: [
      { label: 'Successful Placements', value: '120+' },
      { label: 'Registered Mentors', value: '35 people' },
      { label: 'Partner Institutions', value: '25+' }
    ],
    activities: [
      'Special boot camp for CV writing and interview preparation',
      'Islamic Finance & Shariah Audit Specialization',
      'International Scholarship & Visa Processing Guidance'
    ]
  }
];

export const INITIAL_GLOBAL_CHAPTERS: GlobalChapter[] = [
  {
    id: 'ch-riyadh',
    city: 'Riyadh & Makkah-Madinah',
    country: 'Saudi Arabia (KSA)',
    flag: '🇸🇦',
    coordinatorName: 'Maulana Obaidullah Bin Said',
    coordinatorContact: 'ksa.alumni@asdri.org',
    membersCount: 48,
    establishedYear: 2022,
    recentActivity: 'Reception for Umrah performing alumni and international Halaqa.'
  },
  {
    id: 'ch-london',
    city: 'London & Birmingham',
    country: 'United Kingdom (UK)',
    flag: '🇬🇧',
    coordinatorName: 'Shaikh Abdullah Al-Mamun',
    coordinatorContact: 'uk.alumni@asdri.org',
    membersCount: 26,
    establishedYear: 2023,
    recentActivity: 'Bengali-English religious lecture series for the Muslim community residing in Europe.'
  },
  {
    id: 'ch-dubai',
    city: 'Dubai & Sharjah',
    country: 'United Arab Emirates (UAE)',
    flag: '🇦🇪',
    coordinatorName: 'Maulana Abdur Rahman Al-Faruque',
    coordinatorContact: 'uae.alumni@asdri.org',
    membersCount: 32,
    establishedYear: 2024,
    recentActivity: 'Representation at the Middle East Islamic Banking Expo.'
  },
  {
    id: 'ch-dhaka',
    city: 'Dhaka Central Headquarter',
    country: 'Bangladesh',
    flag: '🇧🇩',
    coordinatorName: 'Maulana Asaduzzaman Noor',
    coordinatorContact: 'dhaka.alumni@asdri.org',
    membersCount: 380,
    establishedYear: 2021,
    recentActivity: 'Organizing annual central reunion and mega career fair.'
  }
];

export const INITIAL_MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: 'general',
    name: 'General Membership',
    subtitle: 'Open to all valid graduates of the institute',
    fee: 'Free / Annual Registration',
    validity: '1 Year (Renewable)',
    benefits: [
      'Official Digital Alumni Smart ID Card',
      'Opportunity to participate in annual reunion and seminars',
      'Access to Alumni Job Portal & Career Notices',
      'Publish own profile in general directory'
    ],
    recommended: false
  },
  {
    id: 'life',
    name: 'Lifetime Membership',
    subtitle: 'Permanent partner in long-term commitment and institutional development',
    fee: 'BDT 10,000 (One-time donation)',
    validity: 'Lifetime',
    benefits: [
      'Golden Metallic Smart Digital & Physical ID Card',
      'Voting rights and candidacy in central executive elections',
      '24/7 free access to the institute\'s library and research database',
      'Name inclusion as distinguished Lifetime Member in annual publications and commemorative issues',
      'International Chapter event & VIP Lounge Access'
    ],
    recommended: true
  },
  {
    id: 'patron',
    name: 'Donor / Patron Membership',
    subtitle: 'One of the patrons of Alumni Welfare Fund and Research Scholarship',
    fee: 'BDT 50,000+ (One-time or Annual)',
    validity: 'Lifetime Honor',
    benefits: [
      'Honorary Patron Crest & Special Certificate',
      'Invitation to Academic Board & Advisory Council',
      'Opportunity to award named scholarships in special scholarship funding',
      'VIP seating at all international conferences of the institute'
    ],
    recommended: false
  }
];