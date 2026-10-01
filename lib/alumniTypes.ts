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

// Zero dummy data: all alumni data is synchronized directly from Firebase
export const INITIAL_ALUMNI_PROFILES: AlumniProfile[] = [];
export const INITIAL_ALUMNI_EVENTS: AlumniEvent[] = [];
export const INITIAL_ALUMNI_JOBS: AlumniJob[] = [];
export const INITIAL_ANNOUNCEMENTS: AlumniAnnouncement[] = [];
export const INITIAL_SUCCESS_STORIES: AlumniSuccessStory[] = [];
export const INITIAL_BATCH_PROGRAMS: AlumniBatchProgram[] = [];
export const INITIAL_USER_CONTRIBUTIONS: AlumniContribution[] = [];
export const INITIAL_USER_NOTIFICATIONS: AlumniNotification[] = [];

export const DEFAULT_DIGITAL_ID_SETTINGS: DigitalIdTemplateSettings = {
  institutionNameBn: 'As-Sunnah Da\'wah and Research Institute',
  institutionNameAr: 'معهد السنة للدعوة والبحوث',
  cardTitleBn: 'Official Digital Alumni Membership Card',
  themeColor: '#064e3b',
  validityYears: 3,
  verificationBaseUrl: 'https://assunnah.edu.bd/alumni/verify',
  authorizedSignatoryName: 'Shaikh Ahmadullah',
  authorizedSignatoryTitle: 'Chairman & Founding Patron',
  signatureUrl: '',
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
