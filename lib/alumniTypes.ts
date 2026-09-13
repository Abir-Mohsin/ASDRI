export interface AlumniProfile {
  id: string;
  userId?: string;
  fullName: string;
  photoUrl: string;
  alumniId: string; // e.g. ASDRI-ALM-2026-00125
  studentId?: string;
  program: string;
  batch: string;
  graduationYear: number;
  email: string;
  phone: string;
  profession: string;
  organization: string;
  designation: string;
  city: string;
  country: string;
  skills: string[];
  bio: string;
  socialLinks: {
    facebook?: string;
    linkedin?: string;
    website?: string;
    twitter?: string;
  };
  status: 'pending' | 'verified' | 'rejected' | 'suspended';
  privacy: 'public' | 'alumni_only' | 'private';
  mentorshipOffer?: string[];
  mentorshipNeed?: string[];
  featured?: boolean;
  successStory?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface AlumniEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'in_person' | 'online' | 'hybrid';
  description: string;
  coverImage: string;
  registrationDeadline: string;
  registrationLimit: number;
  registeredCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  fee?: string;
  organizer?: string;
  createdAt: string;
}

export interface AlumniEventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  alumniId: string;
  userId?: string;
  alumniName: string;
  alumniEmail: string;
  alumniPhone: string;
  batch: string;
  ticketCode: string;
  attendance: boolean;
  registeredAt: string;
}

export interface AlumniJob {
  id: string;
  title: string;
  organization: string;
  location: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
  category: string;
  description: string;
  requirements: string;
  applicationMethod: 'email' | 'url' | 'portal';
  applicationEmailOrUrl: string;
  deadline: string;
  postedBy: string;
  postedByName: string;
  postedByAlumniId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'closed';
  salary?: string;
  createdAt: string;
}

export interface AlumniAnnouncement {
  id: string;
  title: string;
  content: string;
  category: 'event' | 'career' | 'general' | 'achievement' | 'urgent';
  targetBatch?: string;
  isPinned?: boolean;
  publishedDate?: string;
  authorRole?: string;
  attachmentUrl?: string;
  createdAt: string;
  createdBy: string;
}

export interface AlumniSuccessStory {
  id: string;
  alumniId: string;
  name: string;
  batch: string;
  program: string;
  photoUrl: string;
  currentRole: string;
  organization: string;
  location: string;
  headline: string;
  story: string;
  quote: string;
  keyAchievements: string[];
  featured: boolean;
  publishedAt: string;
}

export interface AlumniContribution {
  id: string;
  alumniId: string;
  alumniName: string;
  alumniEmail: string;
  fundName: 'Alumni Welfare Fund' | 'Meritorious Student Scholarship Fund' | 'Research & Publication Grant' | 'Emergency Aid Fund';
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Bank Transfer' | 'Card';
  transactionId: string;
  receiptNumber: string;
  status: 'confirmed' | 'pending' | 'failed';
  date: string;
  note?: string;
}

export interface AlumniNotification {
  id: string;
  alumniId: string;
  title: string;
  message: string;
  type: 'event' | 'job' | 'system' | 'verification' | 'contribution';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AlumniBatchProgram {
  id: string;
  batchName: string; // e.g. "1st Batch (2021)"
  graduationYear: number;
  programName: string;
  department: string;
  totalGraduates: number;
  activeAlumniCount: number;
  classRepresentative: string;
  repContact: string;
  status: 'active' | 'archived';
}

export interface DigitalIdTemplateSettings {
  institutionNameBn: string;
  institutionNameAr: string;
  cardTitleBn: string;
  themeColor: string;
  validityYears: number;
  verificationBaseUrl: string;
  authorizedSignatoryName: string;
  authorizedSignatoryTitle: string;
  signatureUrl: string;
  allowSelfDownload: boolean;
}

export interface AlumniContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  alumniId?: string;
  subject: string;
  message: string;
  status: 'unread' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface AlumniDiscussion {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorBatch: string;
  authorPhoto?: string;
  category: string;
  likes: number;
  likedBy?: string[];
  commentsCount: number;
  status: 'published' | 'hidden';
  createdAt: string;
}

export const ALUMNI_PROGRAMS = [
  'Advanced Hadith & Da\'wah Department',
  'Fiqh & Fatwa Department',
  'Quran & Qirat Department',
  'Arabic Language & Literature Department',
  'Islamic Finance & Banking',
  'Da\'wah & Comparative Religion',
  'General Islamic Studies Diploma'
];

export const ALUMNI_BATCHES = [
  '1st Batch (2021)',
  '2nd Batch (2022)',
  '3rd Batch (2023)',
  '4th Batch (2024)',
  '5th Batch (2025)',
  '6th Batch (2026)'
];

export const MENTORSHIP_TOPICS = [
  'Career & Employment Guidance',
  'Higher Education & International Scholarships',
  'Hadith & Fiqh Research Methodology',
  'Da\'wah & Social Media Platforms',
  'Arabic & English Language Proficiency',
  'Islamic Economics & Finance',
  'IT & Digital Skills',
  'Halal Business & Entrepreneurship'
];

export const POPULAR_SKILLS = [
  'Hadith Tahqiq (Verification)',
  'Fiqh Research',
  'Arabic Translation',
  'Khutbah & Public Speaking',
  'Quran Tafsir',
  'Islamic Finance',
  'Curriculum Development',
  'Content Writing',
  'Digital Da\'wah',
  'Community Leadership'
];

export const INITIAL_ALUMNI_PROFILES: AlumniProfile[] = [
  {
    id: 'alm-1',
    fullName: 'Maulana Mahmud Hasan',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    alumniId: 'ASDRI-ALM-2021-00101',
    studentId: 'ST-2020-045',
    program: 'Advanced Hadith & Da\'wah Department',
    batch: '1st Batch (2021)',
    graduationYear: 2021,
    email: 'mahmud.hasan@asdri.edu.bd',
    phone: '+880 1711-234567',
    profession: 'Chief Researcher & Senior Khateeb',
    organization: 'Central Jame Masjid & Research Council',
    designation: 'Chief Khateeb & Director',
    city: 'Dhaka',
    country: 'Bangladesh',
    skills: ['Hadith Tahqiq (Verification)', 'Public Speaking', 'Arabic Translation', 'Digital Da\'wah'],
    bio: 'A graduate of As-Sunnah Institute\'s first batch. Engaged in promoting Sunnah and Hadith research in contemporary society. Presented papers at various international conferences.',
    socialLinks: {
      facebook: 'https://facebook.com',
      linkedin: 'https://linkedin.com'
    },
    status: 'verified',
    privacy: 'public',
    mentorshipOffer: ['Hadith & Fiqh Research Methodology', 'Da\'wah & Social Media Platforms', 'Career & Employment Guidance'],
    featured: true,
    successStory: 'Through the knowledge gained from the Institute and the intensive training from the Shuyookh, I am now able to conduct Da\'wah activities nationally and internationally.',
    createdAt: '2021-12-15T10:00:00Z',
    updatedAt: '2026-02-10T14:30:00Z',
    verifiedAt: '2021-12-20T11:00:00Z',
    verifiedBy: 'Academic Officer'
  },
  {
    id: 'alm-2',
    fullName: 'Mufti Tawhidul Islam',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    alumniId: 'ASDRI-ALM-2022-00142',
    studentId: 'ST-2021-089',
    program: 'Fiqh & Fatwa Department',
    batch: '2nd Batch (2022)',
    graduationYear: 2022,
    email: 'tawhid.islam@gmail.com',
    phone: '+880 1819-876543',
    profession: 'Mufti & Islamic Finance Consultant',
    organization: 'Al-Barakah Islamic Banking Research Wing',
    designation: 'Shariah Advisor',
    city: 'Chattogram',
    country: 'Bangladesh',
    skills: ['Fiqh Research', 'Islamic Finance', 'Shariah Audit', 'Arabic Drafting'],
    bio: 'Specialized in determining Shariah standards for contemporary Fintech and Islamic banking. Achieved the highest grade from the Institute\'s Fiqh department.',
    socialLinks: {
      linkedin: 'https://linkedin.com',
      website: 'https://example.com'
    },
    status: 'verified',
    privacy: 'public',
    mentorshipOffer: ['Islamic Economics & Finance', 'Fiqh & Fatwa Research Methodology'],
    featured: true,
    successStory: 'The Institute\'s curriculum, combining contemporary financial challenges and Fiqh solutions, has given me extraordinary confidence in my career.',
    createdAt: '2022-12-10T09:00:00Z',
    updatedAt: '2026-01-18T16:00:00Z',
    verifiedAt: '2022-12-15T12:00:00Z',
    verifiedBy: 'Admin'
  },
  {
    id: 'alm-3',
    fullName: 'Shaikh Abdullah Al-Mamun',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    alumniId: 'ASDRI-ALM-2023-00215',
    studentId: 'ST-2022-112',
    program: 'Quran & Qirat Department',
    batch: '3rd Batch (2023)',
    graduationYear: 2023,
    email: 'mamun.qari@outlook.com',
    phone: '+44 7911-123456',
    profession: 'International Qari & Teacher',
    organization: 'London Islamic Academy',
    designation: 'Senior Qirat Faculty',
    city: 'London',
    country: 'United Kingdom',
    skills: ['Quran Tafsir', 'Tajweed & Qirat', 'English & Arabic Lectures', 'Online Teaching'],
    bio: 'A Qari certified in 10 Qira\'at. Serves as a judge in international Hifz and Qirat competitions.',
    socialLinks: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com'
    },
    status: 'verified',
    privacy: 'public',
    mentorshipOffer: ['Higher Education & International Scholarships', 'Arabic & English Language Proficiency'],
    featured: true,
    successStory: 'International standard Tajweed and Azan training has provided me with opportunities for institutional representation on the international stage.',
    createdAt: '2023-11-25T11:30:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    verifiedAt: '2023-11-28T14:00:00Z',
    verifiedBy: 'Admin'
  },
  {
    id: 'alm-4',
    fullName: 'Maulana Asaduzzaman Noor',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    alumniId: 'ASDRI-ALM-2024-00308',
    studentId: 'ST-2023-019',
    program: 'Arabic Language & Literature Department',
    batch: '4th Batch (2024)',
    graduationYear: 2024,
    email: 'asad.noor@asdri.org',
    phone: '+880 1912-334455',
    profession: 'Lecturer & Author',
    organization: 'Al-Hikmah Islamia Degree College',
    designation: 'Lecturer (Arabic Department)',
    city: 'Sylhet',
    country: 'Bangladesh',
    skills: ['Arabic Translation', 'Content Writing', 'Curriculum Development'],
    bio: 'Researcher of modern and classical Arabic literature. Author of 3 research-based translations.',
    socialLinks: {
      facebook: 'https://facebook.com'
    },
    status: 'verified',
    privacy: 'public',
    mentorshipOffer: ['Arabic & English Language Proficiency', 'Content Writing'],
    featured: false,
    createdAt: '2024-11-20T08:00:00Z',
    updatedAt: '2026-02-12T12:00:00Z',
    verifiedAt: '2024-11-24T09:00:00Z',
    verifiedBy: 'Super Admin'
  },
  {
    id: 'alm-5',
    fullName: 'Hafez Shabbir Ahmed',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    alumniId: 'ASDRI-ALM-2025-00412',
    studentId: 'ST-2024-082',
    program: 'Islamic Finance & Banking',
    batch: '5th Batch (2025)',
    graduationYear: 2025,
    email: 'sabbir.fin@gmail.com',
    phone: '+880 1610-998877',
    profession: 'Financial Analyst',
    organization: 'Islami Bank Bangladesh PLC',
    designation: 'Probationary Officer',
    city: 'Dhaka',
    country: 'Bangladesh',
    skills: ['Islamic Finance', 'Financial Modeling', 'IT & Digital Skills'],
    bio: 'Built a career combining finance and Islamic banking. Interested in technology and Shariah-based automation.',
    socialLinks: {
      linkedin: 'https://linkedin.com'
    },
    status: 'verified',
    privacy: 'public',
    mentorshipOffer: ['Career & Employment Guidance', 'Halal Business & Entrepreneurship'],
    featured: false,
    createdAt: '2025-12-05T14:20:00Z',
    updatedAt: '2026-01-22T11:00:00Z',
    verifiedAt: '2025-12-10T10:00:00Z',
    verifiedBy: 'Academic Officer'
  }
];

export const INITIAL_ALUMNI_EVENTS: AlumniEvent[] = [
  {
    id: 'ev-1',
    title: 'Annual Alumni Grand Conference & Reunion 2026',
    date: '2026-09-20',
    time: '09:00 AM - 05:30 PM',
    location: 'Institute Central Campus Auditorium, Dhaka',
    type: 'in_person',
    description: 'A gathering of former students from all batches of As-Sunnah Da\'wah and Research Institute, featuring reminiscences, career discussions, and special tarbiyah sessions. Distinguished Islamic scholars from the country will be present as special guests.',
    coverImage: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
    registrationDeadline: '2026-09-10',
    registrationLimit: 500,
    registeredCount: 342,
    status: 'upcoming',
    fee: 'Free (Registration Mandatory)',
    organizer: 'Central Alumni Committee & Administration',
    createdAt: '2026-01-10T10:00:00Z'
  },
  {
    id: 'ev-2',
    title: 'International Webinar: Contemporary Fiqh Research and Challenges',
    date: '2026-10-05',
    time: '08:00 PM - 10:00 PM (BD Time)',
    location: 'Online Zoom Live Platform',
    type: 'online',
    description: 'An international webinar featuring researcher alumni from home and abroad. Expert discussions on contemporary Artificial Intelligence (AI), modern biomedical issues, and Shariah solutions.',
    coverImage: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1000&q=80',
    registrationDeadline: '2026-10-04',
    registrationLimit: 1000,
    registeredCount: 680,
    status: 'upcoming',
    fee: 'Free',
    organizer: 'Research & Publication Wing',
    createdAt: '2026-02-01T12:00:00Z'
  },
  {
    id: 'ev-3',
    title: 'Alumni Career & Mentorship Workshop',
    date: '2026-11-12',
    time: '10:00 AM - 01:00 PM',
    location: 'Seminar Hall-2, As-Sunnah Institute',
    type: 'hybrid',
    description: 'Special training and direct mentorship for new graduates on employment preparation, international scholarship applications, and Da\'wah project management.',
    coverImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1000&q=80',
    registrationDeadline: '2026-11-08',
    registrationLimit: 150,
    registeredCount: 95,
    status: 'upcoming',
    fee: 'Free',
    organizer: 'Alumni Career Development Cell',
    createdAt: '2026-02-15T09:00:00Z'
  }
];

export const INITIAL_ALUMNI_JOBS: AlumniJob[] = [
  {
    id: 'job-1',
    title: 'Senior Islamic Researcher & Fatwa Analyst',
    organization: 'As-Sunnah Research Foundation',
    location: 'Dhaka, Bangladesh',
    employmentType: 'Full-time',
    category: 'Research & Fatwa',
    description: 'Qualified researcher needed for verifying Arabic and Bengali references on contemporary Fiqh issues, preparing Fatwa drafts, and editing research papers.',
    requirements: 'Passed Dawra-e-Hadith or advanced diploma from the Institute\'s Hadith/Fiqh department. Proficient in studying Arabic texts.',
    applicationMethod: 'email',
    applicationEmailOrUrl: 'career@assunnahfoundation.org',
    deadline: '2026-09-30',
    postedBy: 'admin',
    postedByName: 'Central Administration',
    status: 'approved',
    salary: 'BDT 35,000 - BDT 50,000',
    createdAt: '2026-02-01T10:00:00Z'
  },
  {
    id: 'job-2',
    title: 'Arabic Language Lecturer & Instructor',
    organization: 'Al-Azhar Cadet Academy',
    location: 'Uttara, Dhaka',
    employmentType: 'Full-time',
    category: 'Education & Teaching',
    description: 'Conducting classes on standard spoken Arabic and grammar for secondary and higher secondary level students.',
    requirements: 'Degree holder in Arabic Literature. Sincere in teaching and possess a refined character.',
    applicationMethod: 'email',
    applicationEmailOrUrl: 'hr@alazharcadet.edu.bd',
    deadline: '2026-09-25',
    postedBy: 'alm-1',
    postedByName: 'Maulana Mahmud Hasan',
    status: 'approved',
    salary: 'BDT 30,000 - BDT 40,000',
    createdAt: '2026-02-05T14:00:00Z'
  },
  {
    id: 'job-3',
    title: 'Shariah Compliance Assistant',
    organization: 'Takaful Islamic Insurance PLC',
    location: 'Motijheel, Dhaka (Hybrid)',
    employmentType: 'Full-time',
    category: 'Islamic Finance',
    description: 'Assisting in monitoring Shariah guidelines for insurance and investment contracts and preparing annual compliance reports.',
    requirements: 'Islamic Finance & Banking background. MS Excel and basic IT skills required.',
    applicationMethod: 'url',
    applicationEmailOrUrl: 'https://takaful-insurance.com/careers',
    deadline: '2026-10-15',
    postedBy: 'alm-2',
    postedByName: 'Mufti Tawhidul Islam',
    status: 'approved',
    salary: 'Negotiable',
    createdAt: '2026-02-12T09:30:00Z'
  }
];

export const INITIAL_ANNOUNCEMENTS: AlumniAnnouncement[] = [
  {
    id: 'ann-1',
    title: 'Digital Smart ID Card Distribution Starts for As-Sunnah Alumni',
    content: 'All verified alumni members can now download and print their official QR-coded digital ID cards from the portal. This card provides special campus access and central library facilities.',
    category: 'general',
    isPinned: true,
    publishedDate: 'February 18, 2026',
    authorRole: 'Central Secretariat',
    createdAt: '2026-02-18T10:00:00Z',
    createdBy: 'Central Administration'
  },
  {
    id: 'ann-2',
    title: 'Online Registration Open for Annual Alumni Conference & Reunion 2026',
    content: 'Online registration has begun for the historic Alumni Grand Conference 2026, to be held on September 20. Due to limited seats, all graduates are requested to complete their registration promptly.',
    category: 'event',
    isPinned: true,
    publishedDate: 'February 15, 2026',
    authorRole: 'Event Management Committee',
    createdAt: '2026-02-15T12:00:00Z',
    createdBy: 'Alumni Event Committee'
  },
  {
    id: 'ann-3',
    title: 'Call for Research Grants in International Islamic Journals & Research Papers',
    content: 'As-Sunnah Research Wing will provide 10 research grants to PhD and Post-Graduate scholars for the 2026-27 fiscal year. Detailed guidelines and the deadline for proposal submission is April 15, 2026.',
    category: 'career',
    isPinned: false,
    publishedDate: 'February 10, 2026',
    authorRole: 'Research & Publication Cell',
    createdAt: '2026-02-10T14:00:00Z',
    createdBy: 'Research Wing'
  }
];

export const INITIAL_SUCCESS_STORIES: AlumniSuccessStory[] = [
  {
    id: 'story-1',
    alumniId: 'ASDRI-ALM-2021-00101',
    name: 'Maulana Mahmud Hasan',
    batch: '1st Batch (2021)',
    program: 'Advanced Hadith & Da\'wah Department',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    currentRole: 'Chief Researcher & International Da\'ee',
    organization: 'Central Da\'wah Academy & Islamic Trust',
    location: 'Dhaka, Bangladesh',
    headline: 'Unique Role in Contemporary Hadith Research and Da\'wah Promotion Among Youth',
    story: 'After completing his advanced specialization from As-Sunnah Da\'wah and Research Institute, Maulana Mahmud Hasan has conducted several research seminars nationally and internationally to address contemporary doubts and engage youth in authentic Hadith practice.',
    quote: 'The Institute\'s rigorous Tahqiq (verification) and research-oriented education has made me confident in facing the intellectual challenges of the contemporary world.',
    keyAchievements: [
      'Best Paper Award at International Hadith Conference 2024',
      'Authored and published 3 original research books',
      'Provided regular Tahqiq training to 50+ new researchers'
    ],
    featured: true,
    publishedAt: '2026-01-15'
  },
  {
    id: 'story-2',
    alumniId: 'ASDRI-ALM-2022-00102',
    name: 'Mufti Tawhidul Islam',
    batch: '2nd Batch (2022)',
    program: 'Advanced Fiqh & Fatwa Department',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
    currentRole: 'Shariah Auditor & Islamic Banking Consultant',
    organization: 'Al-Barakah Shariah Research Forum',
    location: 'Riyadh, Saudi Arabia',
    headline: 'Bangladeshi Scholar Leading in Islamic Finance & Corporate Shariah Compliance',
    story: 'After studying at the Institute\'s Advanced Fiqh Faculty, he pursued specialized higher education in international Islamic banking and Takaful economics and is currently working on Shariah supervisory boards in the Middle East.',
    quote: 'The depth of advanced Fiqh and the integration of modern economics are among the unique strengths of As-Sunnah Institute\'s curriculum.',
    keyAchievements: [
      'Certified Shariah Advisor and Auditor (CSAA)',
      'Ensured Islamic Finance Compliance for 20+ commercial institutions',
      'Taught as a guest lecturer at the university level'
    ],
    featured: true,
    publishedAt: '2026-02-01'
  },
  {
    id: 'story-3',
    alumniId: 'ASDRI-ALM-2023-00103',
    name: 'Abdullah Al Maruf',
    batch: '3rd Batch (2023)',
    program: 'Advanced Arabic Language & Literature Department',
    photoUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
    currentRole: 'Chief Translator & International Communication Officer',
    organization: 'World Muslim Youth League (Bangladesh Bureau)',
    location: 'Dhaka, Bangladesh',
    headline: 'Success in Standard Arabic Literature Practice and International Diplomatic Language Translation',
    story: 'Through fluent speeches in standard Arabic and translation of classical books, he has earned multiple gold medals nationally and is actively contributing to Arabic language education and career development for local youth.',
    quote: 'Language is not just a medium of communication, but also a primary means to convey the pure message of Islam to the world.',
    keyAchievements: [
      'Best Speaker Award at National Arabic Speech Competition 2024',
      'Completed Bengali translation of 10+ classical Islamic literary works',
      'Trained 1000+ students in online Arabic communication courses'
    ],
    featured: true,
    publishedAt: '2026-02-10'
  }
];

export const INITIAL_BATCH_PROGRAMS: AlumniBatchProgram[] = [
  {
    id: 'bp-1',
    batchName: '1st Batch (2021)',
    graduationYear: 2021,
    programName: 'Advanced Hadith & Da\'wah Department',
    department: 'Hadith Faculty',
    totalGraduates: 45,
    activeAlumniCount: 42,
    classRepresentative: 'Maulana Mahmud Hasan',
    repContact: '+880 1711-000101',
    status: 'active'
  },
  {
    id: 'bp-2',
    batchName: '2nd Batch (2022)',
    graduationYear: 2022,
    programName: 'Advanced Fiqh & Fatwa Department',
    department: 'Fiqh Faculty',
    totalGraduates: 52,
    activeAlumniCount: 49,
    classRepresentative: 'Mufti Tawhidul Islam',
    repContact: '+880 1811-000102',
    status: 'active'
  },
  {
    id: 'bp-3',
    batchName: '3rd Batch (2023)',
    graduationYear: 2023,
    programName: 'Advanced Arabic Language & Literature Department',
    department: 'Lughah Faculty',
    totalGraduates: 60,
    activeAlumniCount: 56,
    classRepresentative: 'Abdullah Al Maruf',
    repContact: '+880 1911-000103',
    status: 'active'
  },
  {
    id: 'bp-4',
    batchName: '4th Batch (2024)',
    graduationYear: 2024,
    programName: 'Advanced Da\'wah & Comparative Religion',
    department: 'Da\'wah Faculty',
    totalGraduates: 65,
    activeAlumniCount: 61,
    classRepresentative: 'Hafez Obaidullah',
    repContact: '+880 1611-000104',
    status: 'active'
  },
  {
    id: 'bp-5',
    batchName: '5th Batch (2025)',
    graduationYear: 2025,
    programName: 'Advanced Hadith & Contemporary Research',
    department: 'Hadith Faculty',
    totalGraduates: 70,
    activeAlumniCount: 68,
    classRepresentative: 'Maulana Jobayer Mahmud',
    repContact: '+880 1511-000105',
    status: 'active'
  }
];

export const INITIAL_USER_CONTRIBUTIONS: AlumniContribution[] = [
  {
    id: 'con-1',
    alumniId: 'ASDRI-ALM-2021-00101',
    alumniName: 'Maulana Mahmud Hasan',
    alumniEmail: 'mahmud.alumni@assunnah.edu.bd',
    fundName: 'Alumni Welfare Fund',
    amount: 5000,
    paymentMethod: 'bKash',
    transactionId: 'TRX98273948',
    receiptNumber: 'REC-2026-0045',
    status: 'confirmed',
    date: '2026-02-10',
    note: 'Monthly Permanent Membership Contribution'
  },
  {
    id: 'con-2',
    alumniId: 'ASDRI-ALM-2021-00101',
    alumniName: 'Maulana Mahmud Hasan',
    alumniEmail: 'mahmud.alumni@assunnah.edu.bd',
    fundName: 'Meritorious Student Scholarship Fund',
    amount: 10000,
    paymentMethod: 'Bank Transfer',
    transactionId: 'IBBL-7729104',
    receiptNumber: 'REC-2026-0089',
    status: 'confirmed',
    date: '2026-01-20',
    note: 'Scholarship grant for a meritorious underprivileged student of Dawra-e-Hadith'
  }
];

export const INITIAL_USER_NOTIFICATIONS: AlumniNotification[] = [
  {
    id: 'notif-1',
    alumniId: 'ASDRI-ALM-2021-00101',
    title: 'Digital ID Card Activated & Verified',
    message: 'Your alumni membership has been successfully approved. Digital ID card is now ready for download.',
    type: 'verification',
    read: false,
    link: '/dashboard?tab=alumni_portal&subtab=card',
    createdAt: '2 days ago'
  },
  {
    id: 'notif-2',
    alumniId: 'ASDRI-ALM-2021-00101',
    title: 'Upcoming Annual Alumni Reunion 2026',
    message: 'Ticket and seat booking for Grand Reunion 2026 has started. Confirm promptly.',
    type: 'event',
    read: false,
    link: '/dashboard?tab=alumni_portal&subtab=events',
    createdAt: '3 days ago'
  },
  {
    id: 'notif-3',
    alumniId: 'ASDRI-ALM-2021-00101',
    title: 'New Job Circular: Hadith Researcher & Translator',
    message: 'A new full-time recruitment notice matching your skills has been published.',
    type: 'job',
    read: true,
    link: '/dashboard?tab=alumni_portal&subtab=jobs',
    createdAt: '1 week ago'
  }
];

export const DEFAULT_DIGITAL_ID_SETTINGS: DigitalIdTemplateSettings = {
  institutionNameBn: 'As-Sunnah Da\'wah and Research Institute',
  institutionNameAr: 'معهد السنة للدعوة والبحوث',
  cardTitleBn: 'Official Digital Alumni Membership Card',
  themeColor: '#064e3b',
  validityYears: 3,
  verificationBaseUrl: 'https://assunnah.edu.bd/alumni/verify',
  authorizedSignatoryName: 'Shaikh Ahmadullah',
  authorizedSignatoryTitle: 'Chairman & Founding Patron',
  signatureUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  allowSelfDownload: true
};

export function generateAlumniId(gradYear: number | string = 2026, count: number = 1): string {
  const padded = String(count).padStart(5, '0');
  return `ASDRI-ALM-${gradYear}-${padded}`;
}

export function generateTicketCode(): string {
  const num = Math.floor(10000 + (Date.now() % 90000));
  return `ASDRI-TKT-${num}`;
}