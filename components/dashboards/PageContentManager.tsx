/* eslint-disable */
'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Save, CheckCircle2, Image as ImageIcon, 
  RefreshCw, LayoutTemplate, Check,
  ExternalLink, ArrowLeft, Plus, Trash2,
  Target, Shield, Sparkles, Layers,
  BookOpen, Building2, MapPin, Phone,
  Mail, Clock, MessageSquare, ArrowUp,
  ArrowDown, Eye, CheckCheck, FolderArchive,
  FileSpreadsheet, Cloud, Database, Library as LibraryIcon,
  Bookmark, BookMarked, AlertCircle, Video,
  Play, Film, SlidersHorizontal, Maximize2,
  GraduationCap, HelpCircle, FileCheck, CheckSquare, ListOrdered,
  Globe2, UserPlus, Upload, Sliders, Palette, Link2, Award
} from 'lucide-react';
import RichTextEditor from '@/components/RichTextEditor';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { availableIcons, RenderIcon } from '@/lib/iconMap';
import { parseVideoUrl } from '@/lib/mediaUtils';
import { FacultyManager } from '@/components/dashboards/FacultyManager';
import { SiteBrandingManager } from '@/components/dashboards/SiteBrandingManager';
import { 
  getOptimizedImageUrl, 
  isGoogleDriveUrl, 
  extractGoogleDriveId, 
  compressUploadedImage 
} from '@/lib/imageUtils';
import { HeroStatItem } from '@/components/Hero';
import { parseGoogleSheetBooks } from '@/lib/googleSheetParser';

export interface CardItem {
  id?: string;
  title: string;
  desc: string;
  icon?: string;
  badge?: string;
}

export interface AdmissionStat {
  label: string;
  value: string;
  icon?: string;
}

export interface AdmissionStep {
  step: string;
  badge: string;
  title: string;
  desc: string;
  duration: string;
  points: string[];
}

export interface AdmissionRequirement {
  category: string;
  badge: string;
  title: string;
  desc: string;
}

export interface AdmissionDoc {
  title: string;
  desc: string;
  tag: string;
}

export interface AdmissionFaq {
  q: string;
  a: string;
}

export interface AdmissionCtaCard {
  badge: string;
  title: string;
  desc: string;
  btnText: string;
  btnLink?: string;
  prospectusBtn?: string;
  prospectusUrl?: string;
  helpTitle: string;
  phone: string;
  email: string;
  hours: string;
  notice?: string;
}

export interface GalleryPhotoItem {
  id?: string | number;
  title: string;
  category: string;
  image: string;
  description?: string;
  date?: string;
  location?: string;
}

export interface GalleryVideoItem {
  id?: string | number;
  title: string;
  category: string;
  videoUrl: string;
  thumbnail?: string;
  duration?: string;
  description?: string;
  date?: string;
  speaker?: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  officeHours: string;
}

export interface PageDefinition {
  id: string;
  title: string;
  shortTitle: string;
  path: string;
  guidelines: string;
  defaultTemplate: {
    title: string;
    subtitle: string;
    bannerImageUrl: string;
    content: string;
    curriculumSectionTitle?: string;
    curriculumSectionDesc?: string;
    mission?: {
      title: string;
      desc: string;
      icon: string;
    };
    vision?: {
      title: string;
      desc: string;
      icon: string;
    };
    coreValuesTitle?: string;
    coreValues?: CardItem[];
    highlightsTitle?: string;
    highlights?: CardItem[];
    contactInfo?: ContactInfo;
    featureCardsTitle?: string;
    featureCards?: CardItem[];
    // Library specific fields
    libraryIntroTitle?: string;
    libraryIntroDesc?: string;
    cloudVaultTitle?: string;
    cloudVaultSubtitle?: string;
    googleSheetsUrl?: string;
    oneDriveUrl?: string;
    googleDriveUrl?: string;
    sheetEmbedEnabled?: boolean;
    sheetEmbedUrl?: string;
    categories?: {
      id?: string;
      title: string;
      desc: string;
      count?: string;
      icon?: string;
      driveUrl?: string;
      btnText?: string;
    }[];
    // Gallery specific fields
    heroMediaType?: 'image' | 'video';
    heroVideoUrl?: string;
    photosSectionTitle?: string;
    photosSectionSubtitle?: string;
    galleryPhotos?: GalleryPhotoItem[];
    videosSectionTitle?: string;
    videosSectionSubtitle?: string;
    galleryVideos?: GalleryVideoItem[];
    // Admission specific fields
    sessionBadge?: string;
    stats?: AdmissionStat[] | HeroStatItem[];
    processTitle?: string;
    processSubtitle?: string;
    steps?: AdmissionStep[];
    reqTitle?: string;
    reqSubtitle?: string;
    requirements?: AdmissionRequirement[];
    docsTitle?: string;
    docsSubtitle?: string;
    docs?: AdmissionDoc[];
    faqTitle?: string;
    faqSubtitle?: string;
    faqs?: AdmissionFaq[];
    ctaCard?: AdmissionCtaCard;
  };
}

const presetBanners = [
  {
    name: 'Mosque Courtyard',
    url: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Library & Reading Hall',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Campus & Learning Environment',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Manuscripts & Calligraphy',
    url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Academic Research Hall',
    url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80'
  },
  {
    name: 'Islamic Studies & Books',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1200&q=80'
  }
];

export const pageDefinitions: PageDefinition[] = [
  {
    id: 'branding',
    title: '0. Site Identity & Logo Studio (লগো পরিবর্তন)',
    shortTitle: 'Site Logo & Identity',
    path: '',
    guidelines: 'Upload website logo via direct image upload or Google Drive link, customize frame geometry, and update institution titles.',
    defaultTemplate: {
      title: 'Site Identity & Logo Studio',
      subtitle: 'Upload logo or link Google Drive image',
      bannerImageUrl: '',
      content: ''
    }
  },
  {
    id: 'home',
    title: '1. Home Page',
    shortTitle: 'Home Page',
    path: '',
    guidelines: 'Main hero banner, institute summary, director statement, and official notices.',
    defaultTemplate: {
      title: 'As-Sunnah Dawah and Research Institute',
      subtitle: 'Center for Higher Islamic Education & Contemporary Research in the Light of the Quran and Authentic Sunnah',
      bannerImageUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
      stats: [
        { id: 'stat-1', value: '15,000+', label: 'Active Students', subtitle: 'Enrolled across all courses', icon: 'GraduationCap' },
        { id: 'stat-2', value: '45+', label: 'Academic Programs', subtitle: 'Higher Islamic curriculum', icon: 'BookOpen' },
        { id: 'stat-3', value: '120+', label: 'Renowned Scholars', subtitle: 'Graduate faculty & researchers', icon: 'Users' },
        { id: 'stat-4', value: '60,000+', label: 'Library Books & Manuscripts', subtitle: 'Central digital repository', icon: 'BookMarked' },
        { id: 'stat-5', value: '99.4%', label: 'Academic Success Rate', subtitle: 'Graduates leading nationwide', icon: 'Award' }
      ] as any,
      content: `Administrative Announcement & Notice:
The admission process for the new academic session at As-Sunnah Dawah and Research Institute has commenced. All interested candidates are requested to apply using the online application form.

Director's Message:
Alhamdulillah, As-Sunnah Dawah and Research Institute is dedicated to serving the Sunnah as a quality religious education and research institution. Our goal is to spread the authentic knowledge of revelation and perform intellectual service to the Ummah through contemporary research.

"The best among you are those who learn the Quran and teach it." — (Sahih al-Bukhari)`.trim()
    }
  },
  {
    id: 'about',
    title: '2. About Us',
    shortTitle: 'About Us',
    path: 'about',
    guidelines: 'Institute history, mission, vision, core values, campus highlights, and complete contact details.',
    defaultTemplate: {
      title: 'About ASDRI',
      subtitle: 'Center for Higher Islamic Education & Contemporary Research in the Light of the Quran and Authentic Sunnah',
      bannerImageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
      mission: {
        title: 'Our Mission',
        desc: 'To nurture skilled, humble, and pious researchers and scholars through authentic Islamic education and research, who will lead the Ummah in addressing contemporary intellectual and real-life challenges based on the Holy Quran and Sahih Sunnah.',
        icon: 'Target'
      },
      vision: {
        title: 'Our Vision',
        desc: 'To establish an international-standard model Islamic Dawah and higher research center, playing a positive and guiding role worldwide in knowledge acquisition and social reform under the guidance of authentic Sunnah.',
        icon: 'Shield'
      },
      coreValuesTitle: 'Core Values & Distinctions',
      coreValues: [
        { title: 'Authenticity', desc: 'Practicing authentic religious knowledge while remaining steadfast on the principles of Quran and Sunnah.', icon: 'BookOpen' },
        { title: 'Excellence', desc: 'Maintaining international academic standards in higher Hadith, Fiqh, and contemporary research.', icon: 'Target' },
        { title: 'Integrity', desc: 'Utmost sincerity, ethics, and accountability in knowledge seeking and religious endeavors.', icon: 'Shield' },
        { title: 'Service', desc: 'Delivering authentic Dawah to all levels of society and serving humanity.', icon: 'Heart' },
      ],
      highlightsTitle: 'Campus Highlights & Academic Features',
      highlights: [
        { title: 'International Standard Library', desc: 'Rich digital and physical repository of rare Hadith, Fiqh, and research manuscripts.', icon: 'BookMarked' },
        { title: 'Renowned Scholars & Research Faculty', desc: 'Direct instruction by graduate professors from Islamic University of Madinah and world-renowned institutions.', icon: 'GraduationCap' },
        { title: 'Modern Research Cell & Lab', desc: 'Specialized digital research unit for contemporary Fatwa and intellectual analysis.', icon: 'Sparkles' },
        { title: 'Serene & Secure Campus', desc: 'Safe environment for acquiring knowledge in a peaceful, clean, and Sunnah-compliant atmosphere.', icon: 'Building2' },
      ],
      contactInfo: {
        address: 'As-Sunnah Dawah and Research Institute, Satarkul Campus, Badda, Dhaka-1212, Bangladesh.',
        phone: '+880 1805-437910, +880 1234-567890',
        email: 'info@asdri.edu.bd / asdri.edu@gmail.com',
        officeHours: 'Saturday - Thursday: 9:00 AM - 5:00 PM (Closed on Friday)'
      },
      content: `Institute Profile & History:
As-Sunnah Dawah and Research Institute is a non-political, research-oriented Islamic educational institution. Our main objective is to convey the message of Sahih Sunnah to all levels of society and develop qualified scholars and researchers.

• Our Goal: Providing authentic Islamic education, developing correct understanding of Quran & Hadith, and conducting research according to international standards.
• Learning Environment: Air-conditioned modern classrooms, projectors & multimedia facilities, rich library, and experienced faculty.`.trim()
    }
  },
  {
    id: 'courses',
    title: '3. Courses & Programs',
    shortTitle: 'Courses & Programs',
    path: 'courses',
    guidelines: 'Hero banner, titles, curriculum overview text, and course feature cards.',
    defaultTemplate: {
      title: 'Academic Courses & Programs',
      subtitle: 'Integrated syllabus for Higher Hadith, Fiqh, Arabic Language, and Muazzin Training Programs',
      bannerImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      curriculumSectionTitle: 'Our Curriculum & Syllabus',
      curriculumSectionDesc: 'At ASDRI, our curriculum blends classical Islamic scholarship with modern educational methodologies, ensuring authentic, disciplined, and practical education for students.',
      featureCardsTitle: 'Key Course Features & Academic Facilities',
      featureCards: [
        { title: 'International Standard Syllabus', desc: 'Formulated in light of the curriculum of Islamic University of Madinah and world-renowned institutions.', icon: 'BookOpen' },
        { title: 'Renowned Scholar Faculty', desc: 'Taught under the direct supervision of senior Hadith and Fiqh research scholars.', icon: 'GraduationCap' },
        { title: 'Online & Offline Batches', desc: 'Opportunity to attend regular and evening classes from anywhere at home or abroad.', icon: 'Sparkles' },
        { title: 'Certification & Advanced Research', desc: 'Institutional certificates and research opportunities for successful course graduates.', icon: 'Award' },
      ],
      content: `Course Curriculum & Guidelines:
Every course at As-Sunnah Dawah and Research Institute is designed in accordance with the curriculum of modern international Islamic universities.

Major Programs:
1. Higher Hadith & Hadith Research (Takhassus Fil Hadith)
2. Department of Fiqh & Islamic Jurisprudence
3. Arabic Language & Literature Diploma
4. Authentic Azan & Qirat Training Course`.trim()
    }
  },
  {
    id: 'admission',
    title: '4. Admission Guide',
    shortTitle: 'Admission Guide',
    path: 'admission',
    guidelines: 'Admission roadmap, eligibility, required documents, FAQs, and helpdesk contact.',
    defaultTemplate: {
      title: 'Admission Circular & Guidelines',
      subtitle: 'Essential information, criteria, and roadmap regarding admission for the new academic session',
      bannerImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      sessionBadge: 'Academic Session 2025-2026 | Applications Now Open',
      stats: [
        { label: 'Delivery Mode', value: 'On-Campus & Live Online', icon: 'Globe' },
        { label: 'Certification', value: 'Verified Diploma & Sanad', icon: 'Award' },
        { label: 'Processing Time', value: '2-4 Working Days', icon: 'Clock' },
        { label: 'Scholarships', value: 'Merit & Need-Based Aid', icon: 'GraduationCap' },
      ],
      processTitle: 'The 4-Step Admission Roadmap',
      processSubtitle: 'Follow our structured, transparent digital admissions pathway to enroll in your desired academic and research program.',
      steps: [
        {
          step: '01',
          badge: 'Stage 1: Portal Setup',
          title: 'Create Your Student Account',
          desc: 'Register securely on our digital portal using your name and email to access your centralized application hub.',
          duration: 'Est. 3-5 Mins',
          points: ['Simple email or Google authentication', 'Dedicated applicant dashboard access', 'Save draft application anytime']
        },
        {
          step: '02',
          badge: 'Stage 2: Form & Credentials',
          title: 'Submit Application & Documents',
          desc: 'Select your program, provide personal and academic information, and upload scanned copies of requisite certifications.',
          duration: 'Est. 10-15 Mins',
          points: ['Program and preferred shift selection', 'Upload educational transcripts & degrees', 'Attach passport photo & National ID']
        },
        {
          step: '03',
          badge: 'Stage 3: Board Review & Viva',
          title: 'Academic Screening & Interview',
          desc: 'Our academic board evaluates your submission. Shortlisted candidates are scheduled for an oral assessment (Viva Voce).',
          duration: '2-3 Business Days',
          points: ['Verification of academic prerequisites', 'Online / in-person viva notification', 'Subject knowledge & aptitude review']
        },
        {
          step: '04',
          badge: 'Stage 4: Enrollment & Seat Confirmation',
          title: 'Fee Payment & Official Registration',
          desc: 'Upon selection, complete your enrollment fee payment to secure your seat and receive your official Student ID and LMS credentials.',
          duration: 'Instant Confirmation',
          points: ['Secure digital payment gateway', 'Official student ID & class schedule', 'Access to online LMS & digital library']
        }
      ],
      reqTitle: 'General Admission Criteria & Eligibility',
      reqSubtitle: 'Please review the institutional criteria and prerequisites prior to submitting your formal application.',
      requirements: [
        {
          category: 'Faith & Ethics',
          badge: 'Core Religious Standard',
          title: 'Practicing Muslim Adherence',
          desc: 'Applicants must adhere to authentic Islamic tenets based on the Quran and Sunnah and exhibit high moral character and personal integrity.'
        },
        {
          category: 'Academic Background',
          badge: 'Prerequisites',
          title: 'Minimum Academic Credentials',
          desc: 'Candidates must hold relevant prior education (such as Dakhil/SSC/Alim/HSC or recognized Islamic seminary certificates) appropriate for the program.'
        },
        {
          category: 'Quranic Recitation',
          badge: 'Core Competency',
          title: 'Quran Reading with Tajweed',
          desc: 'A foundational competency to recite the Holy Quran with proper Tajweed rules is required for all advanced research and Dawah programs.'
        },
        {
          category: 'Discipline & Attendance',
          badge: 'Mandatory Commitment',
          title: 'Minimum 80% Class Attendance',
          desc: 'Enrolled students must commit to attending at least 80% of scheduled lectures (for both on-campus and interactive live online sessions).'
        }
      ],
      docsTitle: 'Required Application Documents Checklist',
      docsSubtitle: 'Please keep clear digital scans (PDF or JPG format) ready before beginning the online submission:',
      docs: [
        { title: 'Passport-Sized Color Photographs', desc: '2 recently taken passport photographs with clean background (Max 2MB)', tag: 'JPG/PNG' },
        { title: 'National ID / Birth Certificate', desc: 'Legible scanned copy of applicant National ID card or Birth Registration', tag: 'PDF/JPG' },
        { title: 'Academic Certificates & Transcripts', desc: 'Previous academic certificates, marks sheets, or Alim/Dakhil certifications', tag: 'PDF' },
        { title: 'Recommendation / Tazkiyah Letter', desc: 'From a respected Islamic scholar, teacher, or local Masjid Imam (if applicable)', tag: 'Optional/Required' }
      ],
      faqTitle: 'Frequently Asked Questions (FAQ)',
      faqSubtitle: 'Find instant answers to common questions about enrollment, interviews, and payments.',
      faqs: [
        {
          q: 'Can I study online while maintaining my job or university studies?',
          a: 'Yes, ASDRI provides flexible evening and weekend cohorts specifically tailored for working professionals and university students.'
        },
        {
          q: 'What payment methods are supported for admission fees?',
          a: 'We support all major local and international payment methods including bKash, Nagad, Rocket, Visa, MasterCard, and direct bank transfers.'
        },
        {
          q: 'Is the oral assessment (Viva Voce) conducted online or on-campus?',
          a: 'For online cohorts, interviews are conducted remotely via Zoom or Google Meet. On-campus applicants may choose an in-person interview.'
        },
        {
          q: 'Are financial aid or merit scholarships available?',
          a: 'Yes, ASDRI offers need-based and merit-based tuition waivers for deserving students and dedicated researchers of Islamic sciences.'
        }
      ],
      ctaCard: {
        badge: 'Admissions Secretariat & Support',
        title: 'Ready to Begin Your Studies?',
        desc: 'Submit your online application today. Our academic admissions officers will guide you through every step of enrollment.',
        btnText: 'Start Online Application',
        btnLink: '/register',
        prospectusBtn: 'Download Prospectus (PDF)',
        prospectusUrl: '',
        helpTitle: 'Need Admission Guidance?',
        phone: '+880 1805-437910',
        email: 'admission@asdri.edu.bd',
        hours: 'Saturday – Thursday: 9:00 AM – 5:00 PM BST',
        notice: 'For admissions counseling or technical help, please reach out to our admission officers directly.'
      },
      content: `Admission Information:
Azan is not merely an announcement; it is a sacred call towards the Almighty. To train muezzins with authentic pronunciation and melody, the 'Azan Training Program (1st Batch-2026)' is commencing.

Key Dates:
• Application Deadline: July 31, 2026
• Viva Voce Examination: August 03, 2026
• Classes Begin: August 08, 2026

Venue & Contact:
As-Sunnah Dawah and Research Institute, Satarkul Campus, Badda, Dhaka.
Phone/WhatsApp: +880 1805-437910`.trim()
    }
  },
  {
    id: 'research',
    title: '5. Research & Publications',
    shortTitle: 'Research & Publications',
    path: 'research',
    guidelines: 'Journal submission guidelines, research board, and publication policies.',
    defaultTemplate: {
      title: 'Research & Publication Guidelines',
      subtitle: 'Quality journals and research policy for authentic Sunnah research',
      bannerImageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=1200&q=80',
      content: `Call for Research Papers & Submission Guidelines:
Articles are invited on contemporary themes for publication in the Institute's regular research journal.

Article Criteria:
• Articles must be based on authentic sources and references.
• Citations and footnotes must be properly cited.
• Priority will be given to presenting Islamic solutions to contemporary challenges.`.trim()
    }
  },
  {
    id: 'faculty',
    title: '6. Faculty & Scholars',
    shortTitle: 'Faculty & Scholars',
    path: 'faculty',
    guidelines: 'Hero banner, header title, department guidelines, and interactive faculty & scholar directory management.',
    defaultTemplate: {
      title: 'Faculty & Scholars Directory',
      subtitle: 'Distinguished scholars, professors, and researchers graduated from the Islamic University of Madinah, Al-Azhar, and leading global institutions.',
      bannerImageUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
      content: `Faculty & Scholars Guidelines and Overview:
All educational and research endeavors at As-Sunnah Dawah and Research Institute are conducted under the direct supervision of experienced scholars and researchers graduated from the Islamic University of Madinah and premier international Islamic universities.

Academic Departments:
• Department of Hadith Sciences & Research
• Department of Advanced Fiqh & Fatwa Research
• Department of Quranic Sciences & Tafsir
• Department of Dawah & Islamic Studies
• Department of Arabic Language & Literature`.trim()
    }
  },
  {
    id: 'library',
    title: '7. Digital Library',
    shortTitle: 'Digital Library',
    path: 'library',
    guidelines: 'Hero banner, titles, Google Sheets/OneDrive/Google Drive cloud vault links, and category cards for 60,000+ books.',
    defaultTemplate: {
      title: 'Central Digital Library & Cloud Vault',
      subtitle: 'Collection of rare Islamic books, Tafsir, Hadith, research journals, and cloud vault of 60,000+ books',
      bannerImageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      libraryIntroTitle: 'Central Digital Library & Mega Archive',
      libraryIntroDesc: 'ASDRI provides students and researchers with access to thousands of authentic classical and contemporary Islamic reference works, Tafsir, Hadith, and research papers.',
      cloudVaultTitle: 'Mega Cloud Vault & Google Sheet Catalog of 60,000+ Books',
      cloudVaultSubtitle: 'Over 60,000 rare and essential books in our digital library are cataloged in Google Sheets. Read and download books directly from Google Drive and OneDrive cloud folders via the links below.',
      googleSheetsUrl: 'https://docs.google.com/spreadsheets',
      oneDriveUrl: 'https://onedrive.live.com',
      googleDriveUrl: 'https://drive.google.com',
      sheetEmbedEnabled: true,
      sheetEmbedUrl: '',
      categories: [
        {
          title: 'Tafsir & Quranic Sciences',
          desc: 'Tafsir al-Tabari, Ibn Kathir, al-Qurtubi, and other authoritative classical and modern Tafsir works.',
          count: '12,500+ Books',
          icon: 'BookOpen',
          driveUrl: 'https://drive.google.com',
          btnText: 'Open Folder & Books'
        },
        {
          title: 'Hadith & Hadith Sciences',
          desc: 'Sihah Sittah, Musnad, Musannaf, and comprehensive commentaries on Hadith scholarship.',
          count: '18,300+ Books',
          icon: 'Bookmark',
          driveUrl: 'https://onedrive.live.com',
          btnText: 'Open Folder & Books'
        },
        {
          title: 'Fiqh & Fatwa Collections',
          desc: 'Primary texts of the four Madhhabs, Usul al-Fiqh, and contemporary Fatwa board research papers.',
          count: '14,200+ Books',
          icon: 'FileText',
          driveUrl: 'https://drive.google.com',
          btnText: 'Open Folder & Books'
        },
        {
          title: 'Seerah & Islamic History',
          desc: 'Authentic biography of Prophet Muhammad (PBUH), lives of the Companions, and history of Islamic civilization.',
          count: '6,500+ Books',
          icon: 'BookMarked',
          driveUrl: 'https://onedrive.live.com',
          btnText: 'Open Folder & Books'
        },
        {
          title: 'Arabic Language, Literature & Grammar',
          desc: 'Nahw, Sarf, Balagah, Arabic dictionaries, and classical literature collections.',
          count: '5,400+ Books',
          icon: 'Library',
          driveUrl: 'https://drive.google.com',
          btnText: 'Open Folder & Books'
        },
        {
          title: 'Aqeedah & Comparative Theology',
          desc: 'Authentic creed texts of the Salaf and refutations of contemporary deviant ideologies.',
          count: '3,800+ Books',
          icon: 'Shield',
          driveUrl: 'https://onedrive.live.com',
          btnText: 'Open Folder & Books'
        }
      ],
      content: `Digital Library Terms & Usage Policy:
1. All books, manuscripts, and research papers stored in our Central Digital Library are open for scholarly research and personal study only.
2. Copying links or re-using content for commercial purposes is strictly prohibited.
3. If you require any specific rare book, please contact the Library In-charge.`.trim()
    }
  },
  {
    id: 'gallery',
    title: '8. Photo & Video Gallery',
    shortTitle: 'Media Gallery',
    path: 'gallery',
    guidelines: 'Hero video/photo, photo gallery, and video documentary section & card editor.',
    defaultTemplate: {
      title: 'Institute Photo & Video Gallery',
      subtitle: 'Photographs and documentaries capturing our serene campus, academic seminars, convocations, and institute events',
      bannerImageUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1600&q=80',
      heroMediaType: 'image',
      heroVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      photosSectionTitle: '📸 Institute Photo Gallery & Highlights',
      photosSectionSubtitle: 'Historic moments from campus life, national seminars, convocations, and academic events',
      galleryPhotos: [
        {
          id: 'p1',
          title: 'Central Campus Architecture',
          category: 'campus',
          date: 'January 2026',
          location: 'Satarkul Campus, Dhaka',
          image: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
          description: 'Central campus building and grounds featuring modern architecture in a peaceful environment.'
        },
        {
          id: 'p2',
          title: 'International Hadith & Research Conference',
          category: 'seminar',
          date: 'December 2025',
          location: 'Auditorium Hall',
          image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
          description: 'International Islamic Research Summit with distinguished scholars and Muhadditheen.'
        },
        {
          id: 'p3',
          title: 'Annual Convocation Ceremony',
          category: 'convocation',
          date: 'November 2025',
          location: 'Main Convention Hall',
          image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
          description: 'Awarding degrees and honors to graduating scholars of Hadith and Fiqh departments.'
        },
        {
          id: 'p4',
          title: 'National Azan Training Workshop',
          category: 'competition',
          date: 'February 2026',
          location: 'Azan Training Lab',
          image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
          description: 'Special practical session for Muezzins practicing authentic Haramain vocal styles.'
        },
        {
          id: 'p5',
          title: 'Central Digital Library & Study Corner',
          category: 'library',
          date: 'Ongoing Session',
          location: 'Library Building, 2nd Floor',
          image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
          description: 'Modern reading hall for researchers and students with rare manuscripts and e-books.'
        }
      ],
      videosSectionTitle: '🎥 Video Gallery & Documentaries',
      videosSectionSubtitle: 'International conferences, Azan training sessions, and special video presentations',
      galleryVideos: [
        {
          id: 'v1',
          title: 'Institute Introduction & Campus Tour',
          category: 'campus',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
          duration: '06:20 mins',
          speaker: 'Media Cell',
          date: 'January 2026',
          description: 'Full documentary covering classrooms, library, and campus environment.'
        },
        {
          id: 'v2',
          title: 'International Hadith Research Conference Speeches',
          category: 'seminar',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
          duration: '25:40 mins',
          speaker: 'Research Faculty Board',
          date: 'December 2025',
          description: 'Keynote speeches on contemporary Hadith research and Takhassus programs.'
        },
        {
          id: 'v3',
          title: 'Annual Convocation & Graduation Ceremony',
          category: 'convocation',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
          duration: '14:30 mins',
          speaker: 'Board of Trustees',
          date: 'November 2025',
          description: 'Highlights from the graduation ceremony and certificate presentation.'
        },
        {
          id: 'v4',
          title: 'Haramain Style Azan Practical Workshop',
          category: 'competition',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          thumbnail: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
          duration: '09:15 mins',
          speaker: 'Chief Qari & Muezzin',
          date: 'February 2026',
          description: 'Practical vocal training class and student performances.'
        }
      ],
      content: `Media Archive & Guidelines:
Photographs and videos of institute events, international seminars, and campus life are preserved here. Commercial reproduction without authorization is strictly prohibited.`.trim()
    }
  },
  {
    id: 'alumni',
    title: '9. Alumni Network',
    shortTitle: 'Alumni Network',
    path: 'alumni',
    guidelines: 'Unified platform for graduates, reunions, and scholar network info.',
    defaultTemplate: {
      title: 'Alumni Association & Network',
      subtitle: 'Unified platform for graduates, scholars, and researchers of As-Sunnah Dawah and Research Institute',
      bannerImageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      content: `Alumni Network Mission & Objectives:
Fostering brotherhood among all graduates and scholars, working unitedly in service to Islam and humanity.`.trim()
    }
  },
  {
    id: 'privacy_policy',
    title: '10. Privacy Policy',
    shortTitle: 'Privacy Policy',
    path: 'privacy',
    guidelines: 'Data protection, privacy, and user security guidelines.',
    defaultTemplate: {
      title: 'Privacy Policy',
      subtitle: 'Guarantee of personal data protection and privacy for students and users',
      bannerImageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
      content: `1. Information Collection & Usage:
As-Sunnah Dawah and Research Institute is committed to maintaining the highest standard of data privacy and security.`.trim()
    }
  },
  {
    id: 'terms_of_service',
    title: '11. Terms of Service',
    shortTitle: 'Terms of Service',
    path: 'terms',
    guidelines: 'Academic discipline and administrative terms of use.',
    defaultTemplate: {
      title: 'Terms of Service',
      subtitle: 'Administrative rules and legal terms governing platform usage',
      bannerImageUrl: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
      content: `1. Agreement to Terms:
By registering an account on this platform, you agree to abide by all academic and administrative regulations of As-Sunnah Dawah and Research Institute.`.trim()
    }
  }
];

export default function PageContentManager() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'bn';
  
  const pageParam = searchParams?.get('page') || 'about';
  const selectedPageId = pageDefinitions.some(p => p.id === pageParam) ? pageParam : 'about';

  const [activeTab, setActiveTab] = useState<'editor' | 'inbox'>('editor');

  const [pageTitle, setPageTitle] = useState('');
  const [pageSubtitle, setPageSubtitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [rawBannerDriveUrl, setRawBannerDriveUrl] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(75);
  const [overlayStyle, setOverlayStyle] = useState<'emerald_gradient' | 'dark_gradient' | 'amber_gradient' | 'solid_dark' | 'subtle'>('emerald_gradient');
  const [showPattern, setShowPattern] = useState<boolean>(true);
  const [showGlow, setShowGlow] = useState<boolean>(true);
  const [badgeText, setBadgeText] = useState<string>('');
  const [badgeTextBn, setBadgeTextBn] = useState<string>('');
  const [badgeTextAr, setBadgeTextAr] = useState<string>('');
  const [applyBtnText, setApplyBtnText] = useState<string>('');
  const [applyBtnLink, setApplyBtnLink] = useState<string>('');
  const [learnBtnText, setLearnBtnText] = useState<string>('');
  const [learnBtnLink, setLearnBtnLink] = useState<string>('');
  const [homeHighlights, setHomeHighlights] = useState<string[]>([
    'আধুনিক ও ধ্রুপদী পাঠ্যক্রম',
    'উচ্চতর দাওয়াহ ও গবেষণা',
    'যোগ্য শিক্ষকমণ্ডলী',
    'আন্তর্জাতিক একাডেমি মান'
  ]);
  const [homeStats, setHomeStats] = useState<{
    id?: string;
    value: string;
    label: string;
    subtitle?: string;
    icon?: string;
  }[]>([
    { id: 'stat-1', value: '15,000+', label: 'Active Students', subtitle: 'Enrolled across all courses', icon: 'GraduationCap' },
    { id: 'stat-2', value: '45+', label: 'Academic Programs', subtitle: 'Higher Islamic curriculum', icon: 'BookOpen' },
    { id: 'stat-3', value: '120+', label: 'Renowned Scholars', subtitle: 'Graduate faculty & researchers', icon: 'Users' },
    { id: 'stat-4', value: '60,000+', label: 'Library Books & Manuscripts', subtitle: 'Central digital repository', icon: 'BookMarked' },
    { id: 'stat-5', value: '99.4%', label: 'Academic Success Rate', subtitle: 'Graduates leading nationwide', icon: 'Award' }
  ]);
  const [bannerSourceMode, setBannerSourceMode] = useState<'preset' | 'drive' | 'url' | 'upload'>('preset');
  const [uploadingBanner, setUploadingBanner] = useState<boolean>(false);

  // Structured Cards State (Mission & Vision)
  const [mission, setMission] = useState({
    title: 'Our Mission',
    desc: 'To nurture skilled, humble, and pious researchers and scholars through authentic Islamic education and research, who will lead the Ummah in addressing contemporary intellectual and real-life challenges based on the Holy Quran and Sahih Sunnah.',
    icon: 'Target'
  });

  const [vision, setVision] = useState({
    title: 'Our Vision',
    desc: 'To establish an international-standard model Islamic Dawah and higher research center, playing a positive and guiding role worldwide in knowledge acquisition and social reform under the guidance of authentic Sunnah.',
    icon: 'Shield'
  });

  // Core Values Cards
  const [coreValuesTitle, setCoreValuesTitle] = useState('Core Values & Distinctions');
  const [coreValues, setCoreValues] = useState<CardItem[]>([
    { title: 'Authenticity', desc: 'Practicing authentic religious knowledge while remaining steadfast on the principles of Quran and Sunnah.', icon: 'BookOpen' },
    { title: 'Excellence', desc: 'Maintaining international academic standards in higher Hadith, Fiqh, and contemporary research.', icon: 'Target' },
    { title: 'Integrity', desc: 'Utmost sincerity, ethics, and accountability in knowledge seeking and religious endeavors.', icon: 'Shield' },
    { title: 'Service', desc: 'Delivering authentic Dawah to all levels of society and serving humanity.', icon: 'Heart' },
  ]);

  // Highlights & Campus Facilities Cards
  const [highlightsTitle, setHighlightsTitle] = useState('Campus Highlights & Academic Features');
  const [highlights, setHighlights] = useState<CardItem[]>([
    { title: 'International Standard Library', desc: 'Rich digital and physical repository of rare Hadith, Fiqh, and research manuscripts.', icon: 'BookMarked' },
    { title: 'Renowned Scholars & Research Faculty', desc: 'Direct instruction by graduate professors from Islamic University of Madinah and world-renowned institutions.', icon: 'GraduationCap' },
    { title: 'Modern Research Cell & Lab', desc: 'Specialized digital research unit for contemporary Fatwa and intellectual analysis.', icon: 'Sparkles' },
    { title: 'Serene & Secure Campus', desc: 'Safe environment for acquiring knowledge in a peaceful, clean, and Sunnah-compliant atmosphere.', icon: 'Building2' },
  ]);

  // Institutional Contact Information
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    address: 'As-Sunnah Dawah and Research Institute, Satarkul Campus, Badda, Dhaka-1212, Bangladesh.',
    phone: '+880 1805-437910, +880 1234-567890',
    email: 'info@asdri.edu.bd / asdri.edu@gmail.com',
    officeHours: 'Saturday - Thursday: 9:00 AM - 5:00 PM (Closed on Friday)'
  });

  // Courses Page Dedicated State (Underneath Hero Intro Text & Highlights)
  const [curriculumSectionTitle, setCurriculumSectionTitle] = useState('Our Curriculum & Syllabus');
  const [curriculumSectionDesc, setCurriculumSectionDesc] = useState('At ASDRI, our curriculum blends classical Islamic scholarship with modern educational methodologies, ensuring authentic, disciplined, and practical education for students.');

  // Generic & Courses Feature Cards
  const [featureCardsTitle, setFeatureCardsTitle] = useState('Key Course Features & Academic Facilities');
  const [featureCards, setFeatureCards] = useState<CardItem[]>([
    { title: 'International Standard Syllabus', desc: 'Formulated in light of the curriculum of Islamic University of Madinah and world-renowned institutions.', icon: 'BookOpen' },
    { title: 'Renowned Scholar Faculty', desc: 'Taught under the direct supervision of senior Hadith and Fiqh research scholars.', icon: 'GraduationCap' },
    { title: 'Online & Offline Batches', desc: 'Opportunity to attend regular and evening classes from anywhere at home or abroad.', icon: 'Sparkles' },
    { title: 'Certification & Advanced Research', desc: 'Institutional certificates and research opportunities for successful course graduates.', icon: 'Award' },
  ]);

  // Library Page Dedicated State (60,000+ Books Google Sheets / OneDrive / Google Drive & Categorized Collections)
  const [libraryIntroTitle, setLibraryIntroTitle] = useState('Central Digital Library & Mega Archive');
  const [libraryIntroDesc, setLibraryIntroDesc] = useState('ASDRI provides students and researchers with access to thousands of authentic classical and contemporary Islamic reference works, Tafsir, Hadith, and research papers.');
  const [cloudVaultTitle, setCloudVaultTitle] = useState('Mega Cloud Vault & Google Sheet Catalog of 60,000+ Books');
  const [cloudVaultSubtitle, setCloudVaultSubtitle] = useState('Over 60,000 rare and essential books in our digital library are cataloged in Google Sheets. Read and download books directly from Google Drive and OneDrive cloud folders via the links below.');
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState('https://docs.google.com/spreadsheets');
  const [oneDriveUrl, setOneDriveUrl] = useState('https://onedrive.live.com');
  const [googleDriveUrl, setGoogleDriveUrl] = useState('https://drive.google.com');
  const [sheetEmbedEnabled, setSheetEmbedEnabled] = useState(true);
  const [sheetEmbedUrl, setSheetEmbedUrl] = useState('');
  const [libraryCategories, setLibraryCategories] = useState<Array<{
    id?: string;
    title: string;
    desc: string;
    count?: string;
    icon?: string;
    driveUrl?: string;
    btnText?: string;
  }>>([
    {
      title: 'Tafsir & Quranic Sciences',
      desc: 'Tafsir al-Tabari, Ibn Kathir, al-Qurtubi, and other authoritative classical and modern Tafsir works.',
      count: '12,500+ Books',
      icon: 'BookOpen',
      driveUrl: 'https://drive.google.com',
      btnText: 'Open Folder & Books'
    },
    {
      title: 'Hadith & Hadith Sciences',
      desc: 'Sihah Sittah, Musnad, Musannaf, and comprehensive commentaries on Hadith scholarship.',
      count: '18,300+ Books',
      icon: 'Bookmark',
      driveUrl: 'https://onedrive.live.com',
      btnText: 'Open Folder & Books'
    },
    {
      title: 'Fiqh & Fatwa Collections',
      desc: 'Primary texts of the four Madhhabs, Usul al-Fiqh, and contemporary Fatwa board research papers.',
      count: '14,200+ Books',
      icon: 'FileText',
      driveUrl: 'https://drive.google.com',
      btnText: 'Open Folder & Books'
    },
    {
      title: 'Seerah & Islamic History',
      desc: 'Authentic biography of Prophet Muhammad (PBUH), lives of the Companions, and history of Islamic civilization.',
      count: '6,500+ Books',
      icon: 'BookMarked',
      driveUrl: 'https://onedrive.live.com',
      btnText: 'Open Folder & Books'
    },
    {
      title: 'Arabic Language, Literature & Grammar',
      desc: 'Nahw, Sarf, Balagah, Arabic dictionaries, and classical literature collections.',
      count: '5,400+ Books',
      icon: 'Library',
      driveUrl: 'https://drive.google.com',
      btnText: 'Open Folder & Books'
    },
    {
      title: 'Aqeedah & Comparative Theology',
      desc: 'Authentic creed texts of the Salaf and refutations of contemporary deviant ideologies.',
      count: '3,800+ Books',
      icon: 'Shield',
      driveUrl: 'https://onedrive.live.com',
      btnText: 'Open Folder & Books'
    }
  ]);

  // Gallery specific states
  const [heroMediaType, setHeroMediaType] = useState<'image' | 'video'>('image');
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [photosSectionTitle, setPhotosSectionTitle] = useState('📸 Institute Photo Gallery & Highlights');
  const [photosSectionSubtitle, setPhotosSectionSubtitle] = useState('Historic moments from campus life, national seminars, convocations, and academic events');
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhotoItem[]>([
    {
      id: 'p1',
      title: 'Central Campus Architecture',
      category: 'campus',
      date: 'January 2026',
      location: 'Satarkul Campus, Dhaka',
      image: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
      description: 'Central campus building and grounds featuring modern architecture in a peaceful environment.'
    },
    {
      id: 'p2',
      title: 'International Hadith & Research Conference',
      category: 'seminar',
      date: 'December 2025',
      location: 'Auditorium Hall',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      description: 'International Islamic Research Summit with distinguished scholars and Muhadditheen.'
    },
    {
      id: 'p3',
      title: 'Annual Convocation Ceremony',
      category: 'convocation',
      date: 'November 2025',
      location: 'Main Convention Hall',
      image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
      description: 'Awarding degrees and honors to graduating scholars of Hadith and Fiqh departments.'
    },
    {
      id: 'p4',
      title: 'National Azan Training Workshop',
      category: 'competition',
      date: 'February 2026',
      location: 'Azan Training Lab',
      image: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
      description: 'Special practical session for Muezzins practicing authentic Haramain vocal styles.'
    },
    {
      id: 'p5',
      title: 'Central Digital Library & Study Corner',
      category: 'library',
      date: 'Ongoing Session',
      location: 'Library Building, 2nd Floor',
      image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80',
      description: 'Modern reading hall for researchers and students with rare manuscripts and e-books.'
    }
  ]);
  const [videosSectionTitle, setVideosSectionTitle] = useState('🎥 Video Gallery & Documentaries');
  const [videosSectionSubtitle, setVideosSectionSubtitle] = useState('International conferences, Azan training sessions, and special video presentations');
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideoItem[]>([
    {
      id: 'v1',
      title: 'Institute Introduction & Campus Tour',
      category: 'campus',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
      duration: '06:20 mins',
      speaker: 'Media Cell',
      date: 'January 2026',
      description: 'Full documentary covering classrooms, library, and campus environment.'
    },
    {
      id: 'v2',
      title: 'International Hadith Research Conference Speeches',
      category: 'seminar',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      duration: '25:40 mins',
      speaker: 'Research Faculty Board',
      date: 'December 2025',
      description: 'Keynote speeches on contemporary Hadith research and Takhassus programs.'
    },
    {
      id: 'v3',
      title: 'Annual Convocation & Graduation Ceremony',
      category: 'convocation',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
      duration: '14:30 mins',
      speaker: 'Board of Trustees',
      date: 'November 2025',
      description: 'Highlights from the graduation ceremony and certificate presentation.'
    },
    {
      id: 'v4',
      title: 'Haramain Style Azan Practical Workshop',
      category: 'competition',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80',
      duration: '09:15 mins',
      speaker: 'Chief Qari & Muezzin',
      date: 'February 2026',
      description: 'Practical vocal training class and student performances.'
    }
  ]);

  // Admission Page Specific State
  const [sessionBadge, setSessionBadge] = useState('Academic Session 2025-2026 | Applications Now Open');
  const [admissionStats, setAdmissionStats] = useState<AdmissionStat[]>([
    { label: 'Delivery Mode', value: 'On-Campus & Live Online', icon: 'Globe' },
    { label: 'Certification', value: 'Verified Diploma & Sanad', icon: 'Award' },
    { label: 'Processing Time', value: '2-4 Working Days', icon: 'Clock' },
    { label: 'Scholarships', value: 'Merit & Need-Based Aid', icon: 'GraduationCap' },
  ]);

  const [processTitle, setProcessTitle] = useState('The 4-Step Admission Roadmap');
  const [processSubtitle, setProcessSubtitle] = useState('Follow our structured, transparent digital admissions pathway to enroll in your desired academic and research program.');
  const [admissionSteps, setAdmissionSteps] = useState<AdmissionStep[]>([
    {
      step: '01',
      badge: 'Stage 1: Portal Setup',
      title: 'Create Your Student Account',
      desc: 'Register securely on our digital portal using your name and email to access your centralized application hub.',
      duration: 'Est. 3-5 Mins',
      points: ['Simple email or Google authentication', 'Dedicated applicant dashboard access', 'Save draft application anytime']
    },
    {
      step: '02',
      badge: 'Stage 2: Form & Credentials',
      title: 'Submit Application & Documents',
      desc: 'Select your program, provide personal and academic information, and upload scanned copies of requisite certifications.',
      duration: 'Est. 10-15 Mins',
      points: ['Program and preferred shift selection', 'Upload educational transcripts & degrees', 'Attach passport photo & National ID']
    },
    {
      step: '03',
      badge: 'Stage 3: Board Review & Viva',
      title: 'Academic Screening & Interview',
      desc: 'Our academic board evaluates your submission. Shortlisted candidates are scheduled for an oral assessment (Viva Voce).',
      duration: '2-3 Business Days',
      points: ['Verification of academic prerequisites', 'Online / in-person viva notification', 'Subject knowledge & aptitude review']
    },
    {
      step: '04',
      badge: 'Stage 4: Enrollment & Seat Confirmation',
      title: 'Fee Payment & Official Registration',
      desc: 'Upon selection, complete your enrollment fee payment to secure your seat and receive your official Student ID and LMS credentials.',
      duration: 'Instant Confirmation',
      points: ['Secure digital payment gateway', 'Official student ID & class schedule', 'Access to online LMS & digital library']
    }
  ]);

  const [reqTitle, setReqTitle] = useState('General Admission Criteria & Eligibility');
  const [reqSubtitle, setReqSubtitle] = useState('Please review the institutional criteria and prerequisites prior to submitting your formal application.');
  const [admissionRequirements, setAdmissionRequirements] = useState<AdmissionRequirement[]>([
    {
      category: 'Faith & Ethics',
      badge: 'Core Religious Standard',
      title: 'Practicing Muslim Adherence',
      desc: 'Applicants must adhere to authentic Islamic tenets based on the Quran and Sunnah and exhibit high moral character and personal integrity.'
    },
    {
      category: 'Academic Background',
      badge: 'Prerequisites',
      title: 'Minimum Academic Credentials',
      desc: 'Candidates must hold relevant prior education (such as Dakhil/SSC/Alim/HSC or recognized Islamic seminary certificates) appropriate for the program.'
    },
    {
      category: 'Quranic Recitation',
      badge: 'Core Competency',
      title: 'Quran Reading with Tajweed',
      desc: 'A foundational competency to recite the Holy Quran with proper Tajweed rules is required for all advanced research and Dawah programs.'
    },
    {
      category: 'Discipline & Attendance',
      badge: 'Mandatory Commitment',
      title: 'Minimum 80% Class Attendance',
      desc: 'Enrolled students must commit to attending at least 80% of scheduled lectures (for both on-campus and interactive live online sessions).'
    }
  ]);

  const [docsTitle, setDocsTitle] = useState('Required Application Documents Checklist');
  const [docsSubtitle, setDocsSubtitle] = useState('Please keep clear digital scans (PDF or JPG format) ready before beginning the online submission:');
  const [admissionDocs, setAdmissionDocs] = useState<AdmissionDoc[]>([
    { title: 'Passport-Sized Color Photographs', desc: '2 recently taken passport photographs with clean background (Max 2MB)', tag: 'JPG/PNG' },
    { title: 'National ID / Birth Certificate', desc: 'Legible scanned copy of applicant National ID card or Birth Registration', tag: 'PDF/JPG' },
    { title: 'Academic Certificates & Transcripts', desc: 'Previous academic certificates, marks sheets, or Alim/Dakhil certifications', tag: 'PDF' },
    { title: 'Recommendation / Tazkiyah Letter', desc: 'From a respected Islamic scholar, teacher, or local Masjid Imam (if applicable)', tag: 'Optional/Required' }
  ]);

  const [faqTitle, setFaqTitle] = useState('Frequently Asked Questions (FAQ)');
  const [faqSubtitle, setFaqSubtitle] = useState('Find instant answers to common questions about enrollment, interviews, and payments.');
  const [admissionFaqs, setAdmissionFaqs] = useState<AdmissionFaq[]>([
    {
      q: 'Can I study online while maintaining my job or university studies?',
      a: 'Yes, ASDRI provides flexible evening and weekend cohorts specifically tailored for working professionals and university students.'
    },
    {
      q: 'What payment methods are supported for admission fees?',
      a: 'We support all major local and international payment methods including bKash, Nagad, Rocket, Visa, MasterCard, and direct bank transfers.'
    },
    {
      q: 'Is the oral assessment (Viva Voce) conducted online or on-campus?',
      a: 'For online cohorts, interviews are conducted remotely via Zoom or Google Meet. On-campus applicants may choose an in-person interview.'
    },
    {
      q: 'Are financial aid or merit scholarships available?',
      a: 'Yes, ASDRI offers need-based and merit-based tuition waivers for deserving students and dedicated researchers of Islamic sciences.'
    }
  ]);

  const [admissionCtaCard, setAdmissionCtaCard] = useState<AdmissionCtaCard>({
    badge: 'Admissions Secretariat & Support',
    title: 'Ready to Begin Your Studies?',
    desc: 'Submit your online application today. Our academic admissions officers will guide you through every step of enrollment.',
    btnText: 'Start Online Application',
    btnLink: '/register',
    prospectusBtn: 'Download Prospectus (PDF)',
    prospectusUrl: '',
    helpTitle: 'Need Admission Guidance?',
    phone: '+880 1805-437910',
    email: 'admission@asdri.edu.bd',
    hours: 'Saturday – Thursday: 9:00 AM – 5:00 PM BST',
    notice: 'For admissions counseling or technical help, please reach out to our admission officers directly.'
  });

  // Messages / Inquiries List from About page
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  // Google Sheet Testing & Sync state for Library
  const [sheetTestLoading, setSheetTestLoading] = useState(false);
  const [sheetTestResult, setSheetTestResult] = useState<any | null>(null);
  const [sheetTestError, setSheetTestError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const selectedDef = pageDefinitions.find(p => p.id === selectedPageId) || pageDefinitions[1];

  const fetchPageData = async (pageId: string) => {
    setLoading(true);
    try {
      const docRef = doc(db, 'site_pages', pageId);
      const docSnap = await getDoc(docRef);
      const def = pageDefinitions.find(p => p.id === pageId);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setPageTitle(data.title ?? def?.defaultTemplate.title ?? '');
        setPageSubtitle(data.subtitle ?? def?.defaultTemplate.subtitle ?? '');
        setPageContent(data.content ?? def?.defaultTemplate.content ?? '');
        setBannerImageUrl(data.bannerImageUrl ?? def?.defaultTemplate.bannerImageUrl ?? '');
        setRawBannerDriveUrl(data.rawBannerDriveUrl || (isGoogleDriveUrl(data.bannerImageUrl || '') ? data.bannerImageUrl : ''));
        setOverlayOpacity(typeof data.overlayOpacity === 'number' ? data.overlayOpacity : 75);
        setOverlayStyle(data.overlayStyle || 'emerald_gradient');
        setShowPattern(data.showPattern !== undefined ? data.showPattern : true);
        setShowGlow(data.showGlow !== undefined ? data.showGlow : true);
        setBadgeText(data.badgeText || '');
        setBadgeTextBn(data.badgeTextBn || '');
        setBadgeTextAr(data.badgeTextAr || '');
        setApplyBtnText(data.applyBtnText || '');
        setApplyBtnLink(data.applyBtnLink || '');
        setLearnBtnText(data.learnBtnText || '');
        setLearnBtnLink(data.learnBtnLink || '');
        if (data.highlights && Array.isArray(data.highlights)) {
          setHomeHighlights(data.highlights);
        }
        if (data.stats && Array.isArray(data.stats) && selectedPageId === 'home') {
          setHomeStats(data.stats);
        } else if (selectedPageId === 'home' && def?.defaultTemplate?.stats) {
          setHomeStats(def.defaultTemplate.stats as any);
        }

        // Mission & Vision
        if (data.mission) {
          setMission({
            title: data.mission.title || 'Our Mission',
            desc: data.mission.desc || '',
            icon: data.mission.icon || 'Target'
          });
        } else if (def?.defaultTemplate.mission) {
          setMission(def.defaultTemplate.mission);
        }

        if (data.vision) {
          setVision({
            title: data.vision.title || 'Our Vision',
            desc: data.vision.desc || '',
            icon: data.vision.icon || 'Shield'
          });
        } else if (def?.defaultTemplate.vision) {
          setVision(def.defaultTemplate.vision);
        }

        // Core Values
        setCoreValuesTitle(data.coreValuesTitle ?? def?.defaultTemplate.coreValuesTitle ?? 'Core Values & Distinctions');
        if (data.coreValues && Array.isArray(data.coreValues)) {
          setCoreValues(data.coreValues);
        } else if (def?.defaultTemplate.coreValues) {
          setCoreValues(def.defaultTemplate.coreValues);
        }

        // Highlights
        setHighlightsTitle(data.highlightsTitle ?? def?.defaultTemplate.highlightsTitle ?? 'Campus Highlights & Academic Features');
        if (data.highlights && Array.isArray(data.highlights)) {
          setHighlights(data.highlights);
        } else if (def?.defaultTemplate.highlights) {
          setHighlights(def.defaultTemplate.highlights);
        }

        // Contact Info
        if (data.contactInfo) {
          setContactInfo({
            address: data.contactInfo.address || def?.defaultTemplate.contactInfo?.address || '',
            phone: data.contactInfo.phone || def?.defaultTemplate.contactInfo?.phone || '',
            email: data.contactInfo.email || def?.defaultTemplate.contactInfo?.email || '',
            officeHours: data.contactInfo.officeHours || def?.defaultTemplate.contactInfo?.officeHours || '',
          });
        } else if (def?.defaultTemplate.contactInfo) {
          setContactInfo(def.defaultTemplate.contactInfo);
        }

        // Courses page specific fields
        if (pageId === 'courses') {
          setCurriculumSectionTitle(data.curriculumSectionTitle ?? def?.defaultTemplate.curriculumSectionTitle ?? 'Our Curriculum & Syllabus');
          setCurriculumSectionDesc(data.curriculumSectionDesc ?? def?.defaultTemplate.curriculumSectionDesc ?? 'At ASDRI, our curriculum blends classical Islamic scholarship with modern educational methodologies, ensuring authentic, disciplined, and practical education for students.');
        }

        // Library page specific fields (60,000+ Books & Cloud Links)
        if (pageId === 'library') {
          setLibraryIntroTitle(data.libraryIntroTitle ?? def?.defaultTemplate.libraryIntroTitle ?? 'Central Digital Library & Mega Archive');
          setLibraryIntroDesc(data.libraryIntroDesc ?? def?.defaultTemplate.libraryIntroDesc ?? 'ASDRI provides students and researchers with access to thousands of authentic classical and contemporary Islamic reference works, Tafsir, Hadith, and research papers.');
          setCloudVaultTitle(data.cloudVaultTitle ?? def?.defaultTemplate.cloudVaultTitle ?? 'Mega Cloud Vault & Google Sheet Catalog of 60,000+ Books');
          setCloudVaultSubtitle(data.cloudVaultSubtitle ?? def?.defaultTemplate.cloudVaultSubtitle ?? 'Over 60,000 rare and essential books in our digital library are cataloged in Google Sheets. Read and download books directly from Google Drive and OneDrive cloud folders via the links below.');
          setGoogleSheetsUrl(data.googleSheetsUrl ?? def?.defaultTemplate.googleSheetsUrl ?? 'https://docs.google.com/spreadsheets');
          setOneDriveUrl(data.oneDriveUrl ?? def?.defaultTemplate.oneDriveUrl ?? 'https://onedrive.live.com');
          setGoogleDriveUrl(data.googleDriveUrl ?? def?.defaultTemplate.googleDriveUrl ?? 'https://drive.google.com');
          setSheetEmbedEnabled(data.sheetEmbedEnabled ?? def?.defaultTemplate.sheetEmbedEnabled ?? true);
          setSheetEmbedUrl(data.sheetEmbedUrl ?? def?.defaultTemplate.sheetEmbedUrl ?? '');
          
          if (data.categories && Array.isArray(data.categories)) {
            setLibraryCategories(data.categories);
          } else if (def?.defaultTemplate.categories) {
            setLibraryCategories(def.defaultTemplate.categories);
          }
        }

        // Gallery
        if (pageId === 'gallery') {
          setHeroMediaType(data.heroMediaType ?? def?.defaultTemplate.heroMediaType ?? 'image');
          setHeroVideoUrl(data.heroVideoUrl ?? def?.defaultTemplate.heroVideoUrl ?? '');
          setPhotosSectionTitle(data.photosSectionTitle ?? def?.defaultTemplate.photosSectionTitle ?? '📸 Institute Photo Gallery & Highlights');
          setPhotosSectionSubtitle(data.photosSectionSubtitle ?? def?.defaultTemplate.photosSectionSubtitle ?? 'Historic moments from campus life, national seminars, convocations, and academic events');
          if (data.photos && Array.isArray(data.photos)) {
            setGalleryPhotos(data.photos);
          } else if (def?.defaultTemplate.galleryPhotos) {
            setGalleryPhotos(def.defaultTemplate.galleryPhotos);
          }

          setVideosSectionTitle(data.videosSectionTitle ?? def?.defaultTemplate.videosSectionTitle ?? '🎥 Video Gallery & Documentaries');
          setVideosSectionSubtitle(data.videosSectionSubtitle ?? def?.defaultTemplate.videosSectionSubtitle ?? 'International conferences, Azan training sessions, and special video presentations');
          if (data.videos && Array.isArray(data.videos)) {
            setGalleryVideos(data.videos);
          } else if (def?.defaultTemplate.galleryVideos) {
            setGalleryVideos(def.defaultTemplate.galleryVideos);
          }
        }

        // Admission page specific fields
        if (pageId === 'admission') {
          setSessionBadge(data.sessionBadge ?? def?.defaultTemplate.sessionBadge ?? 'Academic Session 2025-2026 | Applications Now Open');
          if (data.stats && Array.isArray(data.stats)) {
            setAdmissionStats(data.stats);
          } else if (def?.defaultTemplate.stats) {
            setAdmissionStats(def.defaultTemplate.stats);
          }

          setProcessTitle(data.processTitle ?? def?.defaultTemplate.processTitle ?? 'The 4-Step Admission Roadmap');
          setProcessSubtitle(data.processSubtitle ?? def?.defaultTemplate.processSubtitle ?? 'Follow our structured, transparent digital admissions pathway to enroll in your desired academic and research program.');
          if (data.steps && Array.isArray(data.steps)) {
            setAdmissionSteps(data.steps);
          } else if (def?.defaultTemplate.steps) {
            setAdmissionSteps(def.defaultTemplate.steps);
          }

          setReqTitle(data.reqTitle ?? def?.defaultTemplate.reqTitle ?? 'General Admission Criteria & Eligibility');
          setReqSubtitle(data.reqSubtitle ?? def?.defaultTemplate.reqSubtitle ?? 'Please review the institutional criteria and prerequisites prior to submitting your formal application.');
          if (data.requirements && Array.isArray(data.requirements)) {
            setAdmissionRequirements(data.requirements);
          } else if (def?.defaultTemplate.requirements) {
            setAdmissionRequirements(def.defaultTemplate.requirements);
          }

          setDocsTitle(data.docsTitle ?? def?.defaultTemplate.docsTitle ?? 'Required Application Documents Checklist');
          setDocsSubtitle(data.docsSubtitle ?? def?.defaultTemplate.docsSubtitle ?? 'Please keep clear digital scans (PDF or JPG format) ready before beginning the online submission:');
          if (data.docs && Array.isArray(data.docs)) {
            setAdmissionDocs(data.docs);
          } else if (def?.defaultTemplate.docs) {
            setAdmissionDocs(def.defaultTemplate.docs);
          }

          setFaqTitle(data.faqTitle ?? def?.defaultTemplate.faqTitle ?? 'Frequently Asked Questions (FAQ)');
          setFaqSubtitle(data.faqSubtitle ?? def?.defaultTemplate.faqSubtitle ?? 'Find instant answers to common questions about enrollment, interviews, and payments.');
          if (data.faqs && Array.isArray(data.faqs)) {
            setAdmissionFaqs(data.faqs);
          } else if (def?.defaultTemplate.faqs) {
            setAdmissionFaqs(def.defaultTemplate.faqs);
          }

          if (data.ctaCard) {
            setAdmissionCtaCard({
              badge: data.ctaCard.badge || 'Admissions Secretariat & Support',
              title: data.ctaCard.title || 'Ready to Begin Your Studies?',
              desc: data.ctaCard.desc || 'Submit your online application today. Our academic admissions officers will guide you through every step of enrollment.',
              btnText: data.ctaCard.btnText || 'Start Online Application',
              btnLink: data.ctaCard.btnLink || '/register',
              prospectusBtn: data.ctaCard.prospectusBtn || 'Download Prospectus (PDF)',
              prospectusUrl: data.ctaCard.prospectusUrl || '',
              helpTitle: data.ctaCard.helpTitle || 'Need Admission Guidance?',
              phone: data.ctaCard.phone || '+880 1805-437910',
              email: data.ctaCard.email || 'admission@asdri.edu.bd',
              hours: data.ctaCard.hours || 'Saturday – Thursday: 9:00 AM – 5:00 PM BST',
              notice: data.ctaCard.notice || 'For admissions counseling or technical help, please reach out to our admission officers directly.'
            });
          } else if (def?.defaultTemplate.ctaCard) {
            setAdmissionCtaCard(def.defaultTemplate.ctaCard);
          }
        }

        // Feature Cards for courses / other pages
        setFeatureCardsTitle(data.featureCardsTitle ?? def?.defaultTemplate.featureCardsTitle ?? 'Key Course Features & Academic Facilities');
        if (data.featureCards && Array.isArray(data.featureCards)) {
          setFeatureCards(data.featureCards);
        } else if (def?.defaultTemplate.featureCards) {
          setFeatureCards(def.defaultTemplate.featureCards);
        }

      } else {
        if (def) {
          setPageTitle(def.defaultTemplate.title);
          setPageSubtitle(def.defaultTemplate.subtitle);
          setPageContent(def.defaultTemplate.content);
          setBannerImageUrl(def.defaultTemplate.bannerImageUrl);
          setRawBannerDriveUrl('');
          setOverlayOpacity(75);
          setOverlayStyle('emerald_gradient');
          setShowPattern(true);
          setShowGlow(true);
          setBadgeText('');
          setBadgeTextBn('');
          setBadgeTextAr('');
          setApplyBtnText('');
          setApplyBtnLink('');
          setLearnBtnText('');
          setLearnBtnLink('');

          if (def.id === 'home' && def.defaultTemplate.stats) {
            setHomeStats(def.defaultTemplate.stats as any);
          }

          if (def.defaultTemplate.mission) setMission(def.defaultTemplate.mission);
          if (def.defaultTemplate.vision) setVision(def.defaultTemplate.vision);
          if (def.defaultTemplate.coreValuesTitle) setCoreValuesTitle(def.defaultTemplate.coreValuesTitle);
          if (def.defaultTemplate.coreValues) setCoreValues(def.defaultTemplate.coreValues);
          if (def.defaultTemplate.highlightsTitle) setHighlightsTitle(def.defaultTemplate.highlightsTitle);
          if (def.defaultTemplate.highlights) setHighlights(def.defaultTemplate.highlights);
          if (def.defaultTemplate.contactInfo) setContactInfo(def.defaultTemplate.contactInfo);
          if (def.defaultTemplate.curriculumSectionTitle) setCurriculumSectionTitle(def.defaultTemplate.curriculumSectionTitle);
          if (def.defaultTemplate.curriculumSectionDesc) setCurriculumSectionDesc(def.defaultTemplate.curriculumSectionDesc);
          if (def.defaultTemplate.featureCardsTitle) setFeatureCardsTitle(def.defaultTemplate.featureCardsTitle);
          if (def.defaultTemplate.featureCards) setFeatureCards(def.defaultTemplate.featureCards);

          // Library defaults
          if (def.defaultTemplate.libraryIntroTitle) setLibraryIntroTitle(def.defaultTemplate.libraryIntroTitle);
          if (def.defaultTemplate.libraryIntroDesc) setLibraryIntroDesc(def.defaultTemplate.libraryIntroDesc);
          if (def.defaultTemplate.cloudVaultTitle) setCloudVaultTitle(def.defaultTemplate.cloudVaultTitle);
          if (def.defaultTemplate.cloudVaultSubtitle) setCloudVaultSubtitle(def.defaultTemplate.cloudVaultSubtitle);
          if (def.defaultTemplate.googleSheetsUrl) setGoogleSheetsUrl(def.defaultTemplate.googleSheetsUrl);
          if (def.defaultTemplate.oneDriveUrl) setOneDriveUrl(def.defaultTemplate.oneDriveUrl);
          if (def.defaultTemplate.googleDriveUrl) setGoogleDriveUrl(def.defaultTemplate.googleDriveUrl);
          if (def.defaultTemplate.sheetEmbedEnabled !== undefined) setSheetEmbedEnabled(def.defaultTemplate.sheetEmbedEnabled);
          if (def.defaultTemplate.sheetEmbedUrl !== undefined) setSheetEmbedUrl(def.defaultTemplate.sheetEmbedUrl);
          if (def.defaultTemplate.categories) setLibraryCategories(def.defaultTemplate.categories);

          // Gallery defaults
          if (def.defaultTemplate.heroMediaType) setHeroMediaType(def.defaultTemplate.heroMediaType);
          if (def.defaultTemplate.heroVideoUrl !== undefined) setHeroVideoUrl(def.defaultTemplate.heroVideoUrl);
          if (def.defaultTemplate.photosSectionTitle) setPhotosSectionTitle(def.defaultTemplate.photosSectionTitle);
          if (def.defaultTemplate.photosSectionSubtitle) setPhotosSectionSubtitle(def.defaultTemplate.photosSectionSubtitle);
          if (def.defaultTemplate.galleryPhotos) setGalleryPhotos(def.defaultTemplate.galleryPhotos);
          if (def.defaultTemplate.videosSectionTitle) setVideosSectionTitle(def.defaultTemplate.videosSectionTitle);
          if (def.defaultTemplate.videosSectionSubtitle) setVideosSectionSubtitle(def.defaultTemplate.videosSectionSubtitle);
          if (def.defaultTemplate.galleryVideos) setGalleryVideos(def.defaultTemplate.galleryVideos);

          // Admission defaults
          if (def.defaultTemplate.sessionBadge) setSessionBadge(def.defaultTemplate.sessionBadge);
          if (def.defaultTemplate.stats) setAdmissionStats(def.defaultTemplate.stats);
          if (def.defaultTemplate.processTitle) setProcessTitle(def.defaultTemplate.processTitle);
          if (def.defaultTemplate.processSubtitle) setProcessSubtitle(def.defaultTemplate.processSubtitle);
          if (def.defaultTemplate.steps) setAdmissionSteps(def.defaultTemplate.steps);
          if (def.defaultTemplate.reqTitle) setReqTitle(def.defaultTemplate.reqTitle);
          if (def.defaultTemplate.reqSubtitle) setReqSubtitle(def.defaultTemplate.reqSubtitle);
          if (def.defaultTemplate.requirements) setAdmissionRequirements(def.defaultTemplate.requirements);
          if (def.defaultTemplate.docsTitle) setDocsTitle(def.defaultTemplate.docsTitle);
          if (def.defaultTemplate.docsSubtitle) setDocsSubtitle(def.defaultTemplate.docsSubtitle);
          if (def.defaultTemplate.docs) setAdmissionDocs(def.defaultTemplate.docs);
          if (def.defaultTemplate.faqTitle) setFaqTitle(def.defaultTemplate.faqTitle);
          if (def.defaultTemplate.faqSubtitle) setFaqSubtitle(def.defaultTemplate.faqSubtitle);
          if (def.defaultTemplate.faqs) setAdmissionFaqs(def.defaultTemplate.faqs);
          if (def.defaultTemplate.ctaCard) setAdmissionCtaCard(def.defaultTemplate.ctaCard);
        }
      }
    } catch (error) {
      console.error('Error fetching page data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData(selectedPageId);
  }, [selectedPageId]);

  // Subscribe to received contact inquiries
  useEffect(() => {
    setInquiriesLoading(true);
    const q = query(collection(db, 'contact_messages'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setInquiries(msgs);
      setInquiriesLoading(false);
    }, (err) => {
      console.error('Error fetching contact messages:', err);
      setInquiriesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTestGoogleSheet = async () => {
    if (!googleSheetsUrl || !googleSheetsUrl.trim() || !googleSheetsUrl.startsWith('http')) {
      alert('Please provide a valid Google Sheets URL first.');
      return;
    }
    setSheetTestLoading(true);
    setSheetTestResult(null);
    setSheetTestError(null);
    try {
      const data = await parseGoogleSheetBooks(googleSheetsUrl);
      if (!data.success) {
        throw new Error(data.error || 'Failed to parse data from Google Sheet.');
      }
      setSheetTestResult(data);
    } catch (err: any) {
      setSheetTestError(err.message || 'Could not load Google Sheet. Please ensure the link is publicly accessible.');
    } finally {
      setSheetTestLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      const docRef = doc(db, 'site_pages', selectedPageId);
      
      const payload: any = {
        pageId: selectedPageId,
        title: pageTitle,
        subtitle: pageSubtitle,
        content: pageContent,
        bannerImageUrl,
        rawBannerDriveUrl,
        overlayOpacity: Number(overlayOpacity) || 75,
        overlayStyle: overlayStyle || 'emerald_gradient',
        showPattern: showPattern !== undefined ? showPattern : true,
        showGlow: showGlow !== undefined ? showGlow : true,
        updatedAt: new Date().toISOString()
      };

      if (selectedPageId === 'home') {
        payload.badgeText = badgeText;
        payload.badgeTextBn = badgeTextBn;
        payload.badgeTextAr = badgeTextAr;
        payload.applyBtnText = applyBtnText;
        payload.applyBtnLink = applyBtnLink;
        payload.learnBtnText = learnBtnText;
        payload.learnBtnLink = learnBtnLink;
        payload.highlights = homeHighlights;
        payload.stats = homeStats;
      }

      if (selectedPageId === 'about') {
        payload.mission = mission;
        payload.vision = vision;
        payload.coreValuesTitle = coreValuesTitle;
        payload.coreValues = coreValues;
        payload.highlightsTitle = highlightsTitle;
        payload.highlights = highlights;
        payload.contactInfo = contactInfo;
      }

      if (selectedPageId === 'courses') {
        payload.curriculumSectionTitle = curriculumSectionTitle;
        payload.curriculumSectionDesc = curriculumSectionDesc;
        payload.featureCardsTitle = featureCardsTitle;
        payload.featureCards = featureCards;
      } else if (featureCards.length > 0 && selectedPageId !== 'library') {
        payload.featureCardsTitle = featureCardsTitle;
        payload.featureCards = featureCards;
      }

      if (selectedPageId === 'library') {
        payload.libraryIntroTitle = libraryIntroTitle;
        payload.libraryIntroDesc = libraryIntroDesc;
        payload.cloudVaultTitle = cloudVaultTitle;
        payload.cloudVaultSubtitle = cloudVaultSubtitle;
        payload.googleSheetsUrl = googleSheetsUrl;
        payload.oneDriveUrl = oneDriveUrl;
        payload.googleDriveUrl = googleDriveUrl;
        payload.sheetEmbedEnabled = sheetEmbedEnabled;
        payload.sheetEmbedUrl = sheetEmbedUrl;
        payload.categories = libraryCategories;
        if (sheetTestResult?.books && sheetTestResult.books.length > 0) {
          payload.syncedBooks = sheetTestResult.books.slice(0, 1000);
        }
      }

      if (selectedPageId === 'gallery') {
        payload.heroMediaType = heroMediaType;
        payload.heroVideoUrl = heroVideoUrl;
        payload.photosSectionTitle = photosSectionTitle;
        payload.photosSectionSubtitle = photosSectionSubtitle;
        payload.photos = galleryPhotos;
        payload.videosSectionTitle = videosSectionTitle;
        payload.videosSectionSubtitle = videosSectionSubtitle;
        payload.videos = galleryVideos;
      }

      if (selectedPageId === 'admission') {
        payload.sessionBadge = sessionBadge;
        payload.stats = admissionStats;
        payload.processTitle = processTitle;
        payload.processSubtitle = processSubtitle;
        payload.steps = admissionSteps;
        payload.reqTitle = reqTitle;
        payload.reqSubtitle = reqSubtitle;
        payload.requirements = admissionRequirements;
        payload.docsTitle = docsTitle;
        payload.docsSubtitle = docsSubtitle;
        payload.docs = admissionDocs;
        payload.faqTitle = faqTitle;
        payload.faqSubtitle = faqSubtitle;
        payload.faqs = admissionFaqs;
        payload.ctaCard = admissionCtaCard;
      }

      await setDoc(docRef, payload, { merge: true });

      setSuccessMessage(`All cards, media, and content for "${selectedDef.title}" have been saved successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadDefaultTemplate = () => {
    if (confirm(`Are you sure you want to load default cards and template for "${selectedDef.title}"?`)) {
      setPageTitle(selectedDef.defaultTemplate.title);
      setPageSubtitle(selectedDef.defaultTemplate.subtitle);
      setPageContent(selectedDef.defaultTemplate.content);
      setBannerImageUrl(selectedDef.defaultTemplate.bannerImageUrl);

      if (selectedDef.defaultTemplate.mission) setMission(selectedDef.defaultTemplate.mission);
      if (selectedDef.defaultTemplate.vision) setVision(selectedDef.defaultTemplate.vision);
      if (selectedDef.defaultTemplate.coreValuesTitle) setCoreValuesTitle(selectedDef.defaultTemplate.coreValuesTitle);
      if (selectedDef.defaultTemplate.coreValues) setCoreValues(selectedDef.defaultTemplate.coreValues);
      if (selectedDef.defaultTemplate.highlightsTitle) setHighlightsTitle(selectedDef.defaultTemplate.highlightsTitle);
      if (selectedDef.defaultTemplate.highlights) setHighlights(selectedDef.defaultTemplate.highlights);
      if (selectedDef.defaultTemplate.contactInfo) setContactInfo(selectedDef.defaultTemplate.contactInfo);
      if (selectedDef.defaultTemplate.curriculumSectionTitle) setCurriculumSectionTitle(selectedDef.defaultTemplate.curriculumSectionTitle);
      if (selectedDef.defaultTemplate.curriculumSectionDesc) setCurriculumSectionDesc(selectedDef.defaultTemplate.curriculumSectionDesc);
      if (selectedDef.defaultTemplate.featureCardsTitle) setFeatureCardsTitle(selectedDef.defaultTemplate.featureCardsTitle);
      if (selectedDef.defaultTemplate.featureCards) setFeatureCards(selectedDef.defaultTemplate.featureCards);

      if (selectedDef.defaultTemplate.libraryIntroTitle) setLibraryIntroTitle(selectedDef.defaultTemplate.libraryIntroTitle);
      if (selectedDef.defaultTemplate.libraryIntroDesc) setLibraryIntroDesc(selectedDef.defaultTemplate.libraryIntroDesc);
      if (selectedDef.defaultTemplate.cloudVaultTitle) setCloudVaultTitle(selectedDef.defaultTemplate.cloudVaultTitle);
      if (selectedDef.defaultTemplate.cloudVaultSubtitle) setCloudVaultSubtitle(selectedDef.defaultTemplate.cloudVaultSubtitle);
      if (selectedDef.defaultTemplate.googleSheetsUrl) setGoogleSheetsUrl(selectedDef.defaultTemplate.googleSheetsUrl);
      if (selectedDef.defaultTemplate.oneDriveUrl) setOneDriveUrl(selectedDef.defaultTemplate.oneDriveUrl);
      if (selectedDef.defaultTemplate.googleDriveUrl) setGoogleDriveUrl(selectedDef.defaultTemplate.googleDriveUrl);
      if (selectedDef.defaultTemplate.sheetEmbedEnabled !== undefined) setSheetEmbedEnabled(selectedDef.defaultTemplate.sheetEmbedEnabled);
      if (selectedDef.defaultTemplate.sheetEmbedUrl !== undefined) setSheetEmbedUrl(selectedDef.defaultTemplate.sheetEmbedUrl);
      if (selectedDef.defaultTemplate.categories) setLibraryCategories(selectedDef.defaultTemplate.categories);

      // Gallery
      if (selectedDef.defaultTemplate.heroMediaType) setHeroMediaType(selectedDef.defaultTemplate.heroMediaType);
      if (selectedDef.defaultTemplate.heroVideoUrl !== undefined) setHeroVideoUrl(selectedDef.defaultTemplate.heroVideoUrl);
      if (selectedDef.defaultTemplate.photosSectionTitle) setPhotosSectionTitle(selectedDef.defaultTemplate.photosSectionTitle);
      if (selectedDef.defaultTemplate.photosSectionSubtitle) setPhotosSectionSubtitle(selectedDef.defaultTemplate.photosSectionSubtitle);
      if (selectedDef.defaultTemplate.galleryPhotos) setGalleryPhotos(selectedDef.defaultTemplate.galleryPhotos);
      if (selectedDef.defaultTemplate.videosSectionTitle) setVideosSectionTitle(selectedDef.defaultTemplate.videosSectionTitle);
      if (selectedDef.defaultTemplate.videosSectionSubtitle) setVideosSectionSubtitle(selectedDef.defaultTemplate.videosSectionSubtitle);
      if (selectedDef.defaultTemplate.galleryVideos) setGalleryVideos(selectedDef.defaultTemplate.galleryVideos);

      // Admission
      if (selectedDef.defaultTemplate.sessionBadge) setSessionBadge(selectedDef.defaultTemplate.sessionBadge);
      if (selectedDef.defaultTemplate.stats) setAdmissionStats(selectedDef.defaultTemplate.stats);
      if (selectedDef.defaultTemplate.processTitle) setProcessTitle(selectedDef.defaultTemplate.processTitle);
      if (selectedDef.defaultTemplate.processSubtitle) setProcessSubtitle(selectedDef.defaultTemplate.processSubtitle);
      if (selectedDef.defaultTemplate.steps) setAdmissionSteps(selectedDef.defaultTemplate.steps);
      if (selectedDef.defaultTemplate.reqTitle) setReqTitle(selectedDef.defaultTemplate.reqTitle);
      if (selectedDef.defaultTemplate.reqSubtitle) setReqSubtitle(selectedDef.defaultTemplate.reqSubtitle);
      if (selectedDef.defaultTemplate.requirements) setAdmissionRequirements(selectedDef.defaultTemplate.requirements);
      if (selectedDef.defaultTemplate.docsTitle) setDocsTitle(selectedDef.defaultTemplate.docsTitle);
      if (selectedDef.defaultTemplate.docsSubtitle) setDocsSubtitle(selectedDef.defaultTemplate.docsSubtitle);
      if (selectedDef.defaultTemplate.docs) setAdmissionDocs(selectedDef.defaultTemplate.docs);
      if (selectedDef.defaultTemplate.faqTitle) setFaqTitle(selectedDef.defaultTemplate.faqTitle);
      if (selectedDef.defaultTemplate.faqSubtitle) setFaqSubtitle(selectedDef.defaultTemplate.faqSubtitle);
      if (selectedDef.defaultTemplate.faqs) setAdmissionFaqs(selectedDef.defaultTemplate.faqs);
      if (selectedDef.defaultTemplate.ctaCard) setAdmissionCtaCard(selectedDef.defaultTemplate.ctaCard);
    }
  };

  // Handlers for Library Categories
  const handleAddLibraryCategory = () => {
    setLibraryCategories([
      ...libraryCategories,
      {
        title: 'New Book Category',
        desc: 'Enter category description or books list details...',
        count: '1,000+ Books',
        icon: 'BookOpen',
        driveUrl: googleDriveUrl || 'https://drive.google.com',
        btnText: 'Open Folder & Books'
      }
    ]);
  };

  const handleUpdateLibraryCategory = (index: number, field: string, value: string) => {
    const updated = [...libraryCategories];
    updated[index] = { ...updated[index], [field]: value };
    setLibraryCategories(updated);
  };

  const handleRemoveLibraryCategory = (index: number) => {
    setLibraryCategories(libraryCategories.filter((_, i) => i !== index));
  };

  const handleMoveLibraryCategory = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === libraryCategories.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...libraryCategories];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setLibraryCategories(updated);
  };

  // Handlers for Core Values Cards
  const handleAddCoreValueCard = () => {
    setCoreValues([
      ...coreValues,
      { title: 'New Core Value / Objective', desc: 'Enter card description or core message...', icon: 'BookOpen' }
    ]);
  };

  const handleUpdateCoreValueCard = (index: number, field: keyof CardItem, value: string) => {
    const updated = [...coreValues];
    updated[index] = { ...updated[index], [field]: value };
    setCoreValues(updated);
  };

  const handleRemoveCoreValueCard = (index: number) => {
    setCoreValues(coreValues.filter((_, i) => i !== index));
  };

  const handleMoveCoreValueCard = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === coreValues.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...coreValues];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCoreValues(updated);
  };

  // Handlers for Courses Feature Cards
  const handleAddCourseFeatureCard = () => {
    setFeatureCards([
      ...featureCards,
      { title: 'New Course Feature', desc: 'Enter course facilities or syllabus highlight...', icon: 'BookOpen' }
    ]);
  };

  const handleUpdateCourseFeatureCard = (index: number, field: keyof CardItem, value: string) => {
    const updated = [...featureCards];
    updated[index] = { ...updated[index], [field]: value };
    setFeatureCards(updated);
  };

  const handleRemoveCourseFeatureCard = (index: number) => {
    setFeatureCards(featureCards.filter((_, i) => i !== index));
  };

  const handleMoveCourseFeatureCard = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === featureCards.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...featureCards];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setFeatureCards(updated);
  };

  // Handlers for Highlights & Facilities Cards
  const handleAddHighlightCard = () => {
    setHighlights([
      ...highlights,
      { title: 'New Campus Highlight', desc: 'Enter campus facility or academic specialty...', icon: 'Sparkles' }
    ]);
  };

  const handleUpdateHighlightCard = (index: number, field: keyof CardItem, value: string) => {
    const updated = [...highlights];
    updated[index] = { ...updated[index], [field]: value };
    setHighlights(updated);
  };

  const handleRemoveHighlightCard = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleMoveHighlightCard = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === highlights.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...highlights];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setHighlights(updated);
  };

  // Inquiry message handlers
  const handleMarkAsRead = async (msgId: string) => {
    try {
      await updateDoc(doc(db, 'contact_messages', msgId), { status: 'read' });
    } catch (e) {
      console.error('Error updating message status:', e);
    }
  };

  const handleDeleteInquiry = async (msgId: string) => {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteDoc(doc(db, 'contact_messages', msgId));
        if (selectedInquiry?.id === msgId) {
          setSelectedInquiry(null);
        }
      } catch (e) {
        console.error('Error deleting message:', e);
      }
    }
  };

  // Gallery Photos Handlers
  const handleAddPhoto = () => {
    const newPhoto: GalleryPhotoItem = {
      id: `p_${Date.now()}`,
      title: 'New Photo Title',
      category: 'campus',
      date: '2026',
      location: 'Satarkul Campus, Dhaka',
      image: 'https://images.unsplash.com/photo-1542816417-0983cbe33577?auto=format&fit=crop&w=1200&q=80',
      description: 'Enter brief photo description...'
    };
    setGalleryPhotos([...galleryPhotos, newPhoto]);
  };

  const handleUpdatePhoto = (index: number, field: keyof GalleryPhotoItem, value: any) => {
    const updated = [...galleryPhotos];
    updated[index] = { ...updated[index], [field]: value };
    setGalleryPhotos(updated);
  };

  const handleRemovePhoto = (index: number) => {
    if (galleryPhotos.length <= 1) {
      alert('At least one photo must remain in the list.');
      return;
    }
    setGalleryPhotos(galleryPhotos.filter((_, idx) => idx !== index));
  };

  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === galleryPhotos.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...galleryPhotos];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setGalleryPhotos(updated);
  };

  // Gallery Videos Handlers
  const handleAddVideo = () => {
    const newVideo: GalleryVideoItem = {
      id: `v_${Date.now()}`,
      title: 'New Video Documentary',
      category: 'seminar',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      duration: '10:00 mins',
      speaker: 'Main Speaker',
      date: '2026',
      description: 'Enter brief video description...'
    };
    setGalleryVideos([...galleryVideos, newVideo]);
  };

  const handleUpdateVideo = (index: number, field: keyof GalleryVideoItem, value: any) => {
    const updated = [...galleryVideos];
    updated[index] = { ...updated[index], [field]: value };
    setGalleryVideos(updated);
  };

  const handleRemoveVideo = (index: number) => {
    if (galleryVideos.length <= 1) {
      alert('At least one video must remain in the list.');
      return;
    }
    setGalleryVideos(galleryVideos.filter((_, idx) => idx !== index));
  };

  const handleMoveVideo = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === galleryVideos.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...galleryVideos];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setGalleryVideos(updated);
  };

  // Home Page Statistics Handlers
  const handleAddHomeStat = () => {
    setHomeStats([
      ...homeStats,
      {
        id: `stat-${Date.now()}`,
        value: '100+',
        label: 'New Statistic Metric',
        subtitle: 'Brief description in English',
        icon: 'Award'
      }
    ]);
  };

  const handleUpdateHomeStat = (index: number, field: string, value: string) => {
    const updated = [...homeStats];
    updated[index] = { ...updated[index], [field]: value };
    setHomeStats(updated);
  };

  const handleRemoveHomeStat = (index: number) => {
    if (homeStats.length <= 1) {
      alert('At least one statistics card must remain.');
      return;
    }
    setHomeStats(homeStats.filter((_, i) => i !== index));
  };

  const handleMoveHomeStat = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === homeStats.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...homeStats];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setHomeStats(updated);
  };

  // Admission Page Handlers
  const handleAddAdmissionStat = () => {
    setAdmissionStats([
      ...admissionStats,
      { label: 'New Metric', value: 'Value / Description', icon: 'Award' }
    ]);
  };

  const handleUpdateAdmissionStat = (index: number, field: keyof AdmissionStat, value: string) => {
    const updated = [...admissionStats];
    updated[index] = { ...updated[index], [field]: value };
    setAdmissionStats(updated);
  };

  const handleRemoveAdmissionStat = (index: number) => {
    setAdmissionStats(admissionStats.filter((_, i) => i !== index));
  };

  const handleAddAdmissionStep = () => {
    const nextNum = String(admissionSteps.length + 1).padStart(2, '0');
    setAdmissionSteps([
      ...admissionSteps,
      {
        step: nextNum,
        badge: `Stage ${admissionSteps.length + 1}`,
        title: 'New Admission Stage',
        desc: 'Detailed description of this stage in the roadmap...',
        duration: 'Est. 5 Mins',
        points: ['Action item 1', 'Action item 2']
      }
    ]);
  };

  const handleUpdateAdmissionStep = (index: number, field: keyof AdmissionStep, value: any) => {
    const updated = [...admissionSteps];
    updated[index] = { ...updated[index], [field]: value };
    setAdmissionSteps(updated);
  };

  const handleRemoveAdmissionStep = (index: number) => {
    setAdmissionSteps(admissionSteps.filter((_, i) => i !== index));
  };

  const handleAddStepPoint = (stepIndex: number) => {
    const updated = [...admissionSteps];
    updated[stepIndex].points = [...(updated[stepIndex].points || []), 'New checklist item'];
    setAdmissionSteps(updated);
  };

  const handleUpdateStepPoint = (stepIndex: number, pointIndex: number, value: string) => {
    const updated = [...admissionSteps];
    const pts = [...updated[stepIndex].points];
    pts[pointIndex] = value;
    updated[stepIndex].points = pts;
    setAdmissionSteps(updated);
  };

  const handleRemoveStepPoint = (stepIndex: number, pointIndex: number) => {
    const updated = [...admissionSteps];
    updated[stepIndex].points = updated[stepIndex].points.filter((_, i) => i !== pointIndex);
    setAdmissionSteps(updated);
  };

  const handleAddAdmissionRequirement = () => {
    setAdmissionRequirements([
      ...admissionRequirements,
      {
        category: 'Eligibility Category',
        badge: 'Prerequisite',
        title: 'New Admission Requirement',
        desc: 'Detailed explanation of this admission requirement and eligibility condition...'
      }
    ]);
  };

  const handleUpdateAdmissionRequirement = (index: number, field: keyof AdmissionRequirement, value: string) => {
    const updated = [...admissionRequirements];
    updated[index] = { ...updated[index], [field]: value };
    setAdmissionRequirements(updated);
  };

  const handleRemoveAdmissionRequirement = (index: number) => {
    setAdmissionRequirements(admissionRequirements.filter((_, i) => i !== index));
  };

  const handleAddAdmissionDoc = () => {
    setAdmissionDocs([
      ...admissionDocs,
      {
        title: 'New Required Document',
        desc: 'Document description or scanning instructions (Max 2MB)...',
        tag: 'PDF/JPG'
      }
    ]);
  };

  const handleUpdateAdmissionDoc = (index: number, field: keyof AdmissionDoc, value: string) => {
    const updated = [...admissionDocs];
    updated[index] = { ...updated[index], [field]: value };
    setAdmissionDocs(updated);
  };

  const handleRemoveAdmissionDoc = (index: number) => {
    setAdmissionDocs(admissionDocs.filter((_, i) => i !== index));
  };

  const handleAddAdmissionFaq = () => {
    setAdmissionFaqs([
      ...admissionFaqs,
      {
        q: 'New Admission Question?',
        a: 'Provide a clear, detailed, and helpful answer for prospective students...'
      }
    ]);
  };

  const handleUpdateAdmissionFaq = (index: number, field: keyof AdmissionFaq, value: string) => {
    const updated = [...admissionFaqs];
    updated[index] = { ...updated[index], [field]: value };
    setAdmissionFaqs(updated);
  };

  const handleRemoveAdmissionFaq = (index: number) => {
    setAdmissionFaqs(admissionFaqs.filter((_, i) => i !== index));
  };

  const unreadInquiriesCount = inquiries.filter(m => m.status === 'unread').length;

  if (selectedPageId === 'branding') {
    return (
      <div className="space-y-6 font-sans">
        <SiteBrandingManager 
          locale={locale} 
          onBack={() => {
            window.location.href = `/${locale}/dashboard?tab=content_manager&page=home`;
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Card with Navigation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Page & Content Control Panel
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-bold text-slate-700 font-serif">
              {selectedDef.title}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold font-serif text-[#064e3b]">
            {selectedDef.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {selectedDef.guidelines}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedPageId === 'about' && (
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Content & Cards Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'inbox'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Inbound Messages & Inquiries</span>
                {unreadInquiriesCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-red-500 text-white rounded-full text-[10px] font-bold">
                    {unreadInquiriesCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {selectedPageId === 'faculty' && (
            <Link
              href={`/${locale}/dashboard/faculty`}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span>Full-Screen Faculty Hub</span>
            </Link>
          )}

          <Link
            href={`/${locale}${selectedDef.path ? `/${selectedDef.path}` : ''}`}
            target="_blank"
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
            View Live Page
          </Link>

          <button
            type="button"
            onClick={loadDefaultTemplate}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />
            Reset Default Template
          </button>
        </div>
      </div>

      {/* View 1: Received Inquiries Inbox View */}
      {selectedPageId === 'about' && activeTab === 'inbox' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold font-serif text-[#064e3b] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span>Inquiries & Messages Inbox ({inquiries.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Messages sent by visitors and students via the About Us contact form are displayed here.
              </p>
            </div>
          </div>

          {inquiriesLoading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Loading messages...</span>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-slate-400" />
              <p className="text-sm font-bold text-slate-700">No messages found</p>
              <p className="text-xs text-slate-500">
                Form submissions sent by website visitors from the About Us page will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Message List */}
              <div className="lg:col-span-5 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {inquiries.map((inq) => {
                  const isSelected = selectedInquiry?.id === inq.id;
                  const isUnread = inq.status === 'unread';

                  return (
                    <div
                      key={inq.id}
                      onClick={() => {
                        setSelectedInquiry(inq);
                        if (isUnread) handleMarkAsRead(inq.id);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                        isSelected 
                          ? 'bg-emerald-50/80 border-emerald-300 shadow-xs ring-1 ring-emerald-400' 
                          : isUnread 
                            ? 'bg-amber-50/50 border-amber-200 font-semibold' 
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          {inq.name}
                          {isUnread && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full inline-block"></span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString('bn-BD') : ''}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 font-bold truncate">
                        {inq.subject || 'General Inquiry'}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {inq.message}
                      </p>

                      <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {inq.phone}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Details Viewer */}
              <div className="lg:col-span-7 bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                {selectedInquiry ? (
                  <div className="space-y-5">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                      <div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 inline-block mb-2">
                          {selectedInquiry.subject || 'General Inquiry'}
                        </span>
                        <h4 className="text-lg font-bold text-[#064e3b] font-serif">
                          {selectedInquiry.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Sent at: {selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString('en-US') : 'Unknown'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteInquiry(selectedInquiry.id)}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>

                    {/* Sender Details Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email:</span>
                        <a href={`mailto:${selectedInquiry.email}`} className="font-semibold text-emerald-800 hover:underline flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-emerald-600" />
                          {selectedInquiry.email}
                        </a>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Phone Number:</span>
                        <a href={`tel:${selectedInquiry.phone}`} className="font-semibold text-slate-800 hover:underline flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          {selectedInquiry.phone}
                        </a>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 sm:col-span-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Provided Address:</span>
                        <p className="font-medium text-slate-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {selectedInquiry.address || 'No address provided'}
                        </p>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-700 block border-b border-slate-100 pb-2">
                        Message Details:
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {selectedInquiry.message}
                      </p>
                    </div>

                    {/* Quick Response Actions */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <a
                        href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(`Re: ${selectedInquiry.subject || 'Inquiry Response'} - ASDRI`)}`}
                        className="px-4 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reply via Email
                      </a>
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call Directly
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-2">
                    <Eye className="w-10 h-10 text-slate-300" />
                    <p className="text-xs font-semibold">Click on any message from the left list to view details.</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* View 2: Main Editor View */}
      {activeTab === 'editor' && (
        <>
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <span className="text-xs font-semibold">Loading page and card details...</span>
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-8">
              
              {successMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2.5 text-xs font-bold animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* SECTION 1: Main Header & Banner Info */}
              <div className="space-y-6">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#064e3b] text-white rounded-full text-[10px] flex items-center justify-center font-sans">1</span>
                    Main Page Title, Hero Banner & Overlay Settings
                  </h3>
                  {selectedPageId === 'home' && (
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold rounded-md">
                      Home Hero Section Live Editor
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Main Page Title {selectedPageId === 'home' && '(Hero Heading)'}
                    </label>
                    <input
                      type="text"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder={selectedPageId === 'home' ? 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট' : 'e.g. About ASDRI'}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold focus:border-emerald-600 focus:bg-white transition-all text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Page Subtitle / Tagline {selectedPageId === 'home' && '(Hero Description)'}
                    </label>
                    <input
                      type="text"
                      value={pageSubtitle}
                      onChange={(e) => setPageSubtitle(e.target.value)}
                      placeholder={selectedPageId === 'home' ? 'বিশুদ্ধ ইসলামী জ্ঞান অর্জন, গবেষণা এবং দ্বীনি দাওয়াহ প্রচারের নির্ভরযোগ্য প্রতিষ্ঠান।' : 'Brief page intro or tagline...'}
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium focus:border-emerald-600 focus:bg-white transition-all text-slate-800"
                    />
                  </div>
                </div>

                {/* Home Page Dedicated Hero Badges & Buttons */}
                {selectedPageId === 'home' && (
                  <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-100/80 space-y-4">
                    <span className="text-xs font-bold text-[#064e3b] block">
                      🏛️ Home Page Badges & Call-to-Action Buttons
                    </span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Top Badge (English)
                        </label>
                        <input
                          type="text"
                          value={badgeText}
                          onChange={(e) => setBadgeText(e.target.value)}
                          placeholder="As-Sunnah Dawah & Research Institute"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Top Badge (Bengali)
                        </label>
                        <input
                          type="text"
                          value={badgeTextBn}
                          onChange={(e) => setBadgeTextBn(e.target.value)}
                          placeholder="আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 focus:border-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Top Badge (Arabic)
                        </label>
                        <input
                          type="text"
                          value={badgeTextAr}
                          onChange={(e) => setBadgeTextAr(e.target.value)}
                          placeholder="معهد السنة للدعوة والبحوث الإسلامية"
                          dir="rtl"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg outline-none text-slate-700 focus:border-emerald-600 text-right"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-emerald-100">
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Primary Action Button ("ভর্তি আবেদন")
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={applyBtnText}
                            onChange={(e) => setApplyBtnText(e.target.value)}
                            placeholder="Button Text: ভর্তি আবেদন করুন"
                            className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none text-slate-700"
                          />
                          <input
                            type="text"
                            value={applyBtnLink}
                            onChange={(e) => setApplyBtnLink(e.target.value)}
                            placeholder="Link: /admission"
                            className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Secondary Action Button ("বিস্তারিত জানুন")
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={learnBtnText}
                            onChange={(e) => setLearnBtnText(e.target.value)}
                            placeholder="Button Text: প্রতিষ্ঠান পরিচিতি"
                            className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none text-slate-700"
                          />
                          <input
                            type="text"
                            value={learnBtnLink}
                            onChange={(e) => setLearnBtnLink(e.target.value)}
                            placeholder="Link: /about"
                            className="text-xs p-2 bg-white border border-slate-200 rounded-lg outline-none text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner Background & Google Drive Manager */}
                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                    <div>
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-700" />
                        Hero Banner Image (ছবি ও গুগল ড্রাইভ লিংক ব্যবস্থাপনা)
                      </label>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        গুগল ড্রাইভ লিংক, কম্পিউটার/মোবাইল থেকে আপলোড অথবা যেকোনো ওয়েব ছবির লিংক ব্যবহার করতে পারেন।
                      </p>
                    </div>

                    {/* Source Mode Switcher */}
                    <div className="flex items-center bg-white border border-slate-200 p-1 rounded-lg shadow-2xs gap-1">
                      <button
                        type="button"
                        onClick={() => setBannerSourceMode('drive')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                          bannerSourceMode === 'drive'
                            ? 'bg-[#064e3b] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Cloud className="w-3.5 h-3.5" />
                        Google Drive Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerSourceMode('preset')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                          bannerSourceMode === 'preset'
                            ? 'bg-[#064e3b] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        Presets
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerSourceMode('url')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                          bannerSourceMode === 'url'
                            ? 'bg-[#064e3b] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        Direct URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerSourceMode('upload')}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all flex items-center gap-1 ${
                          bannerSourceMode === 'upload'
                            ? 'bg-[#064e3b] text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload
                      </button>
                    </div>
                  </div>

                  {/* Mode 1: Google Drive Link Parser */}
                  {bannerSourceMode === 'drive' && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-emerald-200/80">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Cloud className="w-4 h-4 text-blue-600" />
                          গুগল ড্রাইভ ইমেজ লিংক দিন (Google Drive Image URL):
                        </label>
                        {isGoogleDriveUrl(rawBannerDriveUrl || bannerImageUrl) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            গুগল ড্রাইভ লিংক চিহ্নিত হয়েছে
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1.5">
                        <input
                          type="url"
                          value={rawBannerDriveUrl}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setRawBannerDriveUrl(val);
                            if (val) {
                              const optimized = getOptimizedImageUrl(val);
                              setBannerImageUrl(optimized);
                            }
                          }}
                          placeholder="https://drive.google.com/file/d/1B2C3D4E5F6G7H8I9J/view?usp=sharing"
                          className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-slate-800 focus:border-emerald-600 focus:bg-white"
                        />
                        <div className="text-[11px] text-slate-500 bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-lg flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-900">টিপস:</span> গুগল ড্রাইভে ছবির শেয়ারিং পারমিশন অবশ্যই <strong>"Anyone with the link can view" (লিংক পাওয়া যে কেউ দেখতে পারবে)</strong> নিশ্চিত করুন। আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে সরাসরি উচ্চমানের হাই-স্পিড সিডিএন লিংক প্রস্তুত করবে।
                          </div>
                        </div>
                      </div>

                      {extractGoogleDriveId(rawBannerDriveUrl || bannerImageUrl) && (
                        <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                          <span className="text-emerald-900 font-mono font-bold">
                            File ID: {extractGoogleDriveId(rawBannerDriveUrl || bannerImageUrl)}
                          </span>
                          <span className="text-emerald-700 font-medium">
                            ✓ Direct HD CDN Thumbnail Activated
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mode 2: Preset Islamic Photos */}
                  {bannerSourceMode === 'preset' && (
                    <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                      <span className="text-[11px] text-slate-600 font-bold block">
                        প্রতিষ্ঠান ও ক্লাসিক ইসলামিক ফটো সিলেক্ট করুন:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {presetBanners.map((banner, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setBannerImageUrl(banner.url);
                              setRawBannerDriveUrl('');
                            }}
                            className={`p-2 rounded-xl text-left border transition-all flex flex-col gap-1.5 group cursor-pointer ${
                              bannerImageUrl === banner.url
                                ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-600/30'
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 relative">
                              <img 
                                src={banner.url} 
                                alt={banner.name} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <span className="text-[11px] font-bold text-slate-800 truncate">
                              {banner.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mode 3: Direct URL */}
                  {bannerSourceMode === 'url' && (
                    <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700">
                        সরাসরি পাবলিক ইমেজ URL পেস্ট করুন:
                      </label>
                      <input
                        type="url"
                        value={bannerImageUrl}
                        onChange={(e) => {
                          setBannerImageUrl(e.target.value);
                          setRawBannerDriveUrl('');
                        }}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-slate-700 focus:border-emerald-600 focus:bg-white"
                      />
                    </div>
                  )}

                  {/* Mode 4: Upload from Device */}
                  {bannerSourceMode === 'upload' && (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                      <label className="block text-[11px] font-bold text-slate-700">
                        কম্পিউটার বা মোবাইল থেকে নতুন ছবি নির্বাচন করুন:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingBanner}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            setUploadingBanner(true);
                            const compressedDataUrl = await compressUploadedImage(file, 1920, 1080, 0.88);
                            setBannerImageUrl(compressedDataUrl);
                            setRawBannerDriveUrl('');
                          } catch (err) {
                            console.error('Image compression failed:', err);
                          } finally {
                            setUploadingBanner(false);
                          }
                        }}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#064e3b] file:text-white hover:file:bg-emerald-800 cursor-pointer"
                      />
                      {uploadingBanner && (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          ছবি প্রসেসিং ও অপটিমাইজেশন চলছে...
                        </div>
                      )}
                    </div>
                  )}

                  {/* SECTION 1.B: OVERLAY SHAPE OPACITY & STYLE CONTROLLER */}
                  <div className="p-4 bg-gradient-to-br from-emerald-950 via-[#064e3b] to-emerald-900 text-white rounded-xl shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-emerald-300" />
                        <div>
                          <span className="text-xs font-bold tracking-wide">
                            ছবির উপরের শেপ ও অপাসিটি নিয়ন্ত্রণ (Overlay Shape & Opacity Controller)
                          </span>
                          <span className="block text-[10px] text-emerald-200/80">
                            হিরো সেকশনের লেখার স্পষ্টতা ও ব্যাকগ্রাউন্ড শেপের গভীরতা নিয়ন্ত্রণ করুন
                          </span>
                        </div>
                      </div>

                      {/* Current Opacity Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-1 bg-white/10 border border-white/20 rounded-lg text-emerald-100">
                          বর্তমান অপাসিটি: <strong className="text-amber-300 font-mono text-xs">{overlayOpacity}%</strong>
                        </span>
                      </div>
                    </div>

                    {/* Range Slider */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-emerald-200 font-medium">
                        <span>0% (সম্পূর্ণ স্বচ্ছ / No Overlay)</span>
                        <span className="text-amber-300 font-bold">
                          {overlayOpacity < 30 && 'হালকা শেপ (ছবি স্পষ্ট)'}
                          {overlayOpacity >= 30 && overlayOpacity < 65 && 'মাঝারি শেপ (ভারসাম্যপূর্ণ)'}
                          {overlayOpacity >= 65 && overlayOpacity <= 85 && 'আদর্শ ইনস্টিটিউট গাঢ় শেপ (লেখার সর্বোচ্চ স্পষ্টতা)'}
                          {overlayOpacity > 85 && 'গভীর ডার্ক শেপ (কালো আভা)'}
                        </span>
                        <span>100% (সম্পূর্ণ গাঢ়)</span>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={overlayOpacity}
                        onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                        className="w-full h-2.5 bg-emerald-900/80 rounded-lg appearance-none cursor-pointer accent-amber-400 focus:outline-none"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-300/80 font-bold block">
                        দ্রুত প্রিসেট নির্বাচন করুন (Quick Presets):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 20, label: '20% হালকা শেপ' },
                          { val: 40, label: '40% সফট শেপ' },
                          { val: 60, label: '60% ব্যালান্সড' },
                          { val: 75, label: '75% স্ট্যান্ডার্ড (প্রস্তাবিত)' },
                          { val: 90, label: '90% গভীর গাঢ়' }
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => setOverlayOpacity(preset.val)}
                            className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                              overlayOpacity === preset.val
                                ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-sm'
                                : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Overlay Gradient Style & Texture Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-200 mb-1.5">
                          শেপের কালার ও গ্রেডিয়েন্ট স্টাইল:
                        </label>
                        <select
                          value={overlayStyle}
                          onChange={(e: any) => setOverlayStyle(e.target.value)}
                          className="w-full text-xs p-2.5 bg-emerald-900/90 border border-emerald-700/60 rounded-xl text-white outline-none focus:border-amber-400"
                        >
                          <option value="emerald_gradient">🟢 ক্লাসিক ইসলামিক ডিপ গ্রিন (#064e3b Gradient)</option>
                          <option value="dark_gradient">⚫ মিডনাইট চারকোল ও স্লেট (Midnight Dark Slate)</option>
                          <option value="amber_gradient">🟡 গোল্ডেন আম্বর ও এমারেল্ড গ্লো (Warm Golden Emerald)</option>
                          <option value="solid_dark">⬛ সলিড ডার্ক মাস্ক (Solid Clean Mask)</option>
                          <option value="subtle">🪟 মিনিমাল সফট ভিনিয়েট (Minimal Vignette)</option>
                        </select>
                      </div>

                      <div className="flex flex-col justify-center gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-emerald-100 font-medium">
                          <input
                            type="checkbox"
                            checked={showPattern}
                            onChange={(e) => setShowPattern(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                          />
                          ইসলামিক জ্যামিতিক নকশা ব্যাকগ্রাউন্ড (Arabesque Texture)
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-emerald-100 font-medium">
                          <input
                            type="checkbox"
                            checked={showGlow}
                            onChange={(e) => setShowGlow(e.target.checked)}
                            className="w-4 h-4 rounded text-emerald-600 accent-emerald-500 cursor-pointer"
                          />
                          কেন্দ্রীয় আলোক আভা (Center Radial Ambient Glow)
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* LIVE REALISTIC HERO PREVIEW */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-emerald-600" />
                        লাইভ প্রিভিউ (Live Hero Preview with Overlay & Image):
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Overlay: {overlayOpacity}% • Style: {overlayStyle}
                      </span>
                    </div>

                    <div className="relative rounded-2xl overflow-hidden shadow-md min-h-[220px] bg-slate-900 border border-slate-300 flex flex-col justify-center p-6 text-white text-center">
                      {/* Live Image */}
                      {bannerImageUrl && (
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={getOptimizedImageUrl(bannerImageUrl)} 
                            alt="Live Hero Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.opacity = '0.1';
                            }}
                          />
                        </div>
                      )}

                      {/* Live Dynamic Overlay Shape */}
                      <div 
                        className="absolute inset-0 z-1 pointer-events-none transition-all duration-300"
                        style={{
                          opacity: overlayOpacity / 100,
                          background: overlayStyle === 'dark_gradient'
                            ? 'linear-gradient(135deg, rgba(2,6,23,0.95) 0%, rgba(15,23,42,0.85) 50%, rgba(2,6,23,0.95) 100%)'
                            : overlayStyle === 'amber_gradient'
                            ? 'linear-gradient(135deg, rgba(6,78,59,0.95) 0%, rgba(120,53,15,0.75) 50%, rgba(6,78,59,0.95) 100%)'
                            : overlayStyle === 'solid_dark'
                            ? 'rgba(0,0,0,0.85)'
                            : overlayStyle === 'subtle'
                            ? 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.7) 100%)'
                            : 'linear-gradient(135deg, rgba(6,78,59,0.95) 0%, rgba(4,47,46,0.85) 50%, rgba(6,78,59,0.95) 100%)'
                        }}
                      />

                      {/* Geometric Texture in Preview */}
                      {showPattern && (
                        <div className="absolute inset-0 opacity-15 bg-arabesque-pattern z-2 pointer-events-none" />
                      )}

                      {/* Content Preview */}
                      <div className="relative z-10 max-w-xl mx-auto space-y-2">
                        {badgeTextBn && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-200">
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            {badgeTextBn}
                          </div>
                        )}
                        <h4 className="text-base sm:text-lg font-bold font-serif text-white leading-tight">
                          {pageTitle || 'আস-সুন্নাহ দাওয়াহ অ্যান্ড রিসার্চ ইনস্টিটিউট'}
                        </h4>
                        <p className="text-[11px] text-emerald-100/90 line-clamp-2 max-w-md mx-auto">
                          {pageSubtitle || 'বিশুদ্ধ ইসলামী জ্ঞান অর্জন, গবেষণা এবং দ্বীনি দাওয়াহ প্রচারের নির্ভরযোগ্য প্রতিষ্ঠান।'}
                        </p>
                        
                        <div className="flex items-center justify-center gap-2 pt-2">
                          <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg shadow-sm">
                            {applyBtnText || 'ভর্তি আবেদন করুন'}
                          </span>
                          <span className="px-3 py-1 bg-white/15 border border-white/25 text-white font-bold text-[10px] rounded-lg">
                            {learnBtnText || 'প্রতিষ্ঠান পরিচিতি'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1.5: Home Page Dynamic Statistics Cards Editor */}
              {selectedPageId === 'home' && (
                <div className="p-5 sm:p-6 bg-gradient-to-br from-emerald-50/60 to-amber-50/40 rounded-2xl border border-emerald-200/80 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 pb-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-[#064e3b] font-serif flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-600" />
                        Hero Section Statistics Cards (পরিসংখ্যান কার্ডসমূহ)
                      </h3>
                      <p className="text-[11px] sm:text-xs text-slate-600 mt-1 leading-relaxed">
                        হিরো সেকশনের নিচে প্রদর্শিত পরিসংখ্যান কার্ডগুলো এখান থেকে সম্পাদনা করুন। সংখ্যা ও লেবেল সবসময় ইংরেজিতে দিন। (মোট কার্ড: {homeStats.length}টি)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHomeStat}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      Add Statistics Card
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {homeStats.map((stat, idx) => (
                      <div
                        key={stat.id || idx}
                        className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-500 transition-all space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Card #{idx + 1}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveHomeStat(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Left/Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHomeStat(idx, 'down')}
                              disabled={idx === homeStats.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                              title="Move Right/Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveHomeStat(idx)}
                              className="p-1 text-red-400 hover:text-red-600 cursor-pointer ml-1"
                              title="Delete Card"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Statistic Number / Metric Value (English):
                          </label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => handleUpdateHomeStat(idx, 'value', e.target.value)}
                            placeholder="e.g. 15,000+ or 99.4%"
                            className="w-full text-xs font-extrabold p-2.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-emerald-950 focus:border-emerald-600 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Metric Title / Label (English):
                          </label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => handleUpdateHomeStat(idx, 'label', e.target.value)}
                            placeholder="e.g. Active Students"
                            className="w-full text-xs font-bold p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-800 focus:border-emerald-600 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Short Subtitle / Description (English):
                          </label>
                          <input
                            type="text"
                            value={stat.subtitle || ''}
                            onChange={(e) => handleUpdateHomeStat(idx, 'subtitle', e.target.value)}
                            placeholder="e.g. Enrolled across all courses"
                            className="w-full text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-600 focus:border-emerald-600 focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Card Icon:
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                              <RenderIcon name={stat.icon || 'Sparkles'} className="w-4 h-4" />
                            </div>
                            <select
                              value={stat.icon || 'Sparkles'}
                              onChange={(e) => handleUpdateHomeStat(idx, 'icon', e.target.value)}
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 focus:border-emerald-600 focus:bg-white"
                            >
                              {availableIcons.map((ic) => (
                                <option key={ic.id} value={ic.id}>{ic.label} ({ic.id})</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Mini Preview Bar of Stats */}
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Live Strip Preview (Cards Placement Simulation):
                    </span>
                    <div className="p-3 bg-[#064e3b] rounded-xl flex flex-wrap justify-center gap-2">
                      {homeStats.map((s, i) => (
                        <div key={i} className="bg-amber-50/95 border border-amber-200 rounded-lg p-2.5 text-center min-w-[110px] flex-1 max-w-[160px] shadow-2xs">
                          <div className="text-sm font-extrabold text-[#064e3b]">{s.value || '0'}</div>
                          <div className="text-[10px] font-bold text-slate-900 truncate">{s.label || 'Metric'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: Dynamic Content & Features for Courses Page */}
              {selectedPageId === 'courses' && (
                <div className="space-y-8 pt-2">
                  
                  {/* Sub-section 2.1: Curriculum Intro & Description (Text Under Hero) */}
                  <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="border-b border-emerald-100 pb-2">
                      <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">2</span>
                        Curriculum & Syllabus Overview Section
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Edit the curriculum section title and overview displayed directly below the hero banner on the Courses page.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Section Main Title (Curriculum Section Title):
                        </label>
                        <input
                          type="text"
                          value={curriculumSectionTitle}
                          onChange={(e) => setCurriculumSectionTitle(e.target.value)}
                          placeholder="e.g. Our Curriculum & Syllabus (Our Curriculum & Structure)"
                          className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800 focus:border-emerald-600 transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Section Description & Overview:
                        </label>
                        <textarea
                          rows={4}
                          value={curriculumSectionDesc}
                          onChange={(e) => setCurriculumSectionDesc(e.target.value)}
                          placeholder="At ASDRI, our curriculum blends classical Islamic scholarship with modern educational methodologies..."
                          className="w-full text-xs p-3 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 leading-relaxed focus:border-emerald-600 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sub-section 2.2: Course Highlights / Academic Pillars Cards */}
                  <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-amber-600 text-white rounded-full text-[10px] flex items-center justify-center font-sans">3</span>
                          Key Course Features & Academic Facility Cards (Total {featureCards.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Add or edit cards highlighting course quality, faculty, syllabus, and certificates.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCourseFeatureCard}
                        className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Feature Card
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Feature Section Title:
                      </label>
                      <input
                        type="text"
                        value={featureCardsTitle}
                        onChange={(e) => setFeatureCardsTitle(e.target.value)}
                        className="w-full max-w-md text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                        placeholder="Key Course Features & Facilities"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {featureCards.map((card, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              Card #{idx + 1}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveCourseFeatureCard(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Up"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveCourseFeatureCard(idx, 'down')}
                                disabled={idx === featureCards.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              {featureCards.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCourseFeatureCard(idx)}
                                  className="text-red-500 hover:text-red-700 text-xs p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                                  title="Delete Card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Card Title:</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => handleUpdateCourseFeatureCard(idx, 'title', e.target.value)}
                                placeholder="e.g. International Standard Syllabus"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Icon:</label>
                              <select
                                value={card.icon || 'BookOpen'}
                                onChange={(e) => handleUpdateCourseFeatureCard(idx, 'icon', e.target.value)}
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                              >
                                {availableIcons.map(ic => (
                                  <option key={ic.id} value={ic.id}>{ic.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Brief Description:</label>
                            <textarea
                              rows={2}
                              value={card.desc}
                              onChange={(e) => handleUpdateCourseFeatureCard(idx, 'desc', e.target.value)}
                              placeholder="Enter card description..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION 2: Dynamic Cards for About Page */}
              {selectedPageId === 'about' && (
                <div className="space-y-8 pt-2">
                  
                  {/* Sub-section 2.1: Mission & Vision Cards Editor */}
                  <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="border-b border-emerald-100 pb-2">
                      <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">2</span>
                        Mission & Vision Cards Editor
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Edit title, description, and icons of the top two main cards on the About Us page.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Mission Card Form */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-[#064e3b] font-serif flex items-center gap-1.5">
                            <Target className="w-3.5 h-3.5 text-emerald-600" />
                            Our Mission Card
                          </span>
                          <select
                            value={mission.icon || 'Target'}
                            onChange={(e) => setMission({ ...mission, icon: e.target.value })}
                            className="text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                          >
                            {availableIcons.map(ic => (
                              <option key={ic.id} value={ic.id}>{ic.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Title:</label>
                          <input
                            type="text"
                            value={mission.title}
                            onChange={(e) => setMission({ ...mission, title: e.target.value })}
                            placeholder="Our Mission"
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Description:</label>
                          <textarea
                            rows={4}
                            value={mission.desc}
                            onChange={(e) => setMission({ ...mission, desc: e.target.value })}
                            placeholder="Enter detailed mission description..."
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none leading-relaxed text-slate-700"
                          />
                        </div>
                      </div>

                      {/* Vision Card Form */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-xs font-bold text-amber-900 font-serif flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            Our Vision Card
                          </span>
                          <select
                            value={vision.icon || 'Shield'}
                            onChange={(e) => setVision({ ...vision, icon: e.target.value })}
                            className="text-[11px] p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                          >
                            {availableIcons.map(ic => (
                              <option key={ic.id} value={ic.id}>{ic.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Title:</label>
                          <input
                            type="text"
                            value={vision.title}
                            onChange={(e) => setVision({ ...vision, title: e.target.value })}
                            placeholder="Our Vision"
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Card Description:</label>
                          <textarea
                            rows={4}
                            value={vision.desc}
                            onChange={(e) => setVision({ ...vision, desc: e.target.value })}
                            placeholder="Enter detailed vision description..."
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none leading-relaxed text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-section 2.2: Core Values Cards Editor (Add, Edit, Delete, Reorder) */}
                  <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-amber-600 text-white rounded-full text-[10px] flex items-center justify-center font-sans">3</span>
                          Core Values Cards (Total {coreValues.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Edit card titles, descriptions, icons or add new custom cards as needed.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCoreValueCard}
                        className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Card
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section Main Title:
                      </label>
                      <input
                        type="text"
                        value={coreValuesTitle}
                        onChange={(e) => setCoreValuesTitle(e.target.value)}
                        className="w-full max-w-md text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                        placeholder="Core Values & Principles"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {coreValues.map((card, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5 text-emerald-600" />
                              Card #{idx + 1}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveCoreValueCard(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Up"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveCoreValueCard(idx, 'down')}
                                disabled={idx === coreValues.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              {coreValues.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveCoreValueCard(idx)}
                                  className="text-red-500 hover:text-red-700 text-xs p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                                  title="Delete Card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Card Title:</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => handleUpdateCoreValueCard(idx, 'title', e.target.value)}
                                placeholder="e.g. Authenticity"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Icon:</label>
                              <select
                                value={card.icon || 'BookOpen'}
                                onChange={(e) => handleUpdateCoreValueCard(idx, 'icon', e.target.value)}
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                              >
                                {availableIcons.map(ic => (
                                  <option key={ic.id} value={ic.id}>{ic.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Brief Description:</label>
                            <textarea
                              rows={2}
                              value={card.desc}
                              onChange={(e) => handleUpdateCoreValueCard(idx, 'desc', e.target.value)}
                              placeholder="Enter card description..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.3: Highlights & Facilities Cards Editor (Add, Edit, Delete, Reorder) */}
                  <div className="p-5 bg-emerald-50/30 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-emerald-600 text-white rounded-full text-[10px] flex items-center justify-center font-sans">4</span>
                          Campus Highlights Cards (Total {highlights.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Create and edit cards highlighting campus facilities, library, and research cells.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddHighlightCard}
                        className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Feature Card
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Section Main Title:
                      </label>
                      <input
                        type="text"
                        value={highlightsTitle}
                        onChange={(e) => setHighlightsTitle(e.target.value)}
                        className="w-full max-w-md text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                        placeholder="Campus Highlights & Facilities"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {highlights.map((card, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              Highlight #{idx + 1}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveHighlightCard(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Up"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveHighlightCard(idx, 'down')}
                                disabled={idx === highlights.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              {highlights.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHighlightCard(idx)}
                                  className="text-red-500 hover:text-red-700 text-xs p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                                  title="Delete Card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Highlight Title:</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => handleUpdateHighlightCard(idx, 'title', e.target.value)}
                                placeholder="e.g. International Standard Library"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Icon:</label>
                              <select
                                value={card.icon || 'Sparkles'}
                                onChange={(e) => handleUpdateHighlightCard(idx, 'icon', e.target.value)}
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                              >
                                {availableIcons.map(ic => (
                                  <option key={ic.id} value={ic.id}>{ic.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Detailed Description:</label>
                            <textarea
                              rows={2}
                              value={card.desc}
                              onChange={(e) => handleUpdateHighlightCard(idx, 'desc', e.target.value)}
                              placeholder="Enter detailed facility description..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.4: Institutional Contact Details Editor */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="border-b border-slate-200 pb-2">
                      <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                        <span className="w-5 h-5 bg-amber-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">5</span>
                        Contact Details & Official Info Editor
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Update campus address, phone numbers, official email, and office hours displayed at the bottom of the About Us page.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600" />
                          Campus Address
                        </label>
                        <textarea
                          rows={2}
                          value={contactInfo.address}
                          onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                          placeholder="As-Sunnah Dawah and Research Institute, Satarkul Campus, Badda, Dhaka-1212..."
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          Mobile / Hotline Numbers
                        </label>
                        <input
                          type="text"
                          value={contactInfo.phone}
                          onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                          placeholder="+880 1805-437910, +880 1234-567890"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-semibold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          Official Email Address
                        </label>
                        <input
                          type="text"
                          value={contactInfo.email}
                          onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                          placeholder="info@asdri.edu.bd / asdri.edu@gmail.com"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Office & Visitor Hours
                        </label>
                        <input
                          type="text"
                          value={contactInfo.officeHours}
                          onChange={(e) => setContactInfo({ ...contactInfo, officeHours: e.target.value })}
                          placeholder="Saturday - Thursday: 9:00 AM - 5:00 PM (Closed Friday)"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-medium text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION 2 (Library): Dynamic Library Manager (Cloud Vault, Google Sheets/OneDrive/Drive Links & Categories) */}
              {selectedPageId === 'library' && (
                <div className="space-y-8 pt-2">
                  
                  {/* Sub-section 2.1: Library Intro & Narrative */}
                  <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="border-b border-emerald-100 pb-2">
                      <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                        <span className="w-5 h-5 bg-emerald-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">2</span>
                        Library Overview & Introduction
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Update the library intro text displayed below the hero banner.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Library Intro Title:
                        </label>
                        <input
                          type="text"
                          value={libraryIntroTitle}
                          onChange={(e) => setLibraryIntroTitle(e.target.value)}
                          placeholder="Central Digital Library & Archive"
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Library Detailed Description:
                        </label>
                        <textarea
                          rows={3}
                          value={libraryIntroDesc}
                          onChange={(e) => setLibraryIntroDesc(e.target.value)}
                          placeholder="ASDRI provides students and researchers with access to thousands of authentic Islamic works..."
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sub-section 2.2: 60,000+ Books Cloud Vault & External Share Links (Google Sheets, OneDrive, Google Drive) */}
                  <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-4">
                    <div className="border-b border-amber-200/80 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-amber-950 font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-amber-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">3</span>
                          Mega Cloud Vault & Sharing Link Connector
                        </h3>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Connect Google Sheets book catalog and Google Drive/OneDrive cloud folder sharing links.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-amber-200 text-amber-900 rounded-lg text-[10px] font-bold self-start sm:self-auto">
                        Cloud Vault Connector
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Cloud Vault Section Title:
                          </label>
                          <input
                            type="text"
                            value={cloudVaultTitle}
                            onChange={(e) => setCloudVaultTitle(e.target.value)}
                            placeholder="Mega Cloud Vault & Google Sheet Catalog of 60,000+ Books"
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            Cloud Vault Subtitle / Description:
                          </label>
                          <input
                            type="text"
                            value={cloudVaultSubtitle}
                            onChange={(e) => setCloudVaultSubtitle(e.target.value)}
                            placeholder="Over 60,000 rare and essential books cataloged in Google Sheets..."
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700"
                          />
                        </div>
                      </div>

                      {/* The 3 Core Cloud Links */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                        {/* 1. Google Sheets */}
                        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            1. Google Sheets Catalog Link
                          </label>
                          <p className="text-[10px] text-slate-500">
                            Sharing link of the Google Sheet containing 60,000+ cataloged books:
                          </p>
                          <input
                            type="url"
                            value={googleSheetsUrl}
                            onChange={(e) => setGoogleSheetsUrl(e.target.value)}
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-emerald-800"
                          />
                          
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleTestGoogleSheet}
                              disabled={sheetTestLoading}
                              className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <RefreshCw className={`w-3 h-3 ${sheetTestLoading ? 'animate-spin' : ''}`} />
                              <span>{sheetTestLoading ? 'Testing...' : 'Test Sheet Connection'}</span>
                            </button>

                            {googleSheetsUrl && (
                              <a
                                href={googleSheetsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" /> Open Link
                              </a>
                            )}
                          </div>

                          {/* Live Sheet Test Results */}
                          {sheetTestResult && (
                            <div className="mt-2 p-3 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between text-emerald-900 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  Sheet Connection Successful!
                                </span>
                                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-[10px]">
                                  Total {sheetTestResult.totalBooks} books detected
                                </span>
                              </div>

                              {sheetTestResult.headers && sheetTestResult.headers.length > 0 && (
                                <div className="text-[10px] text-slate-600">
                                  Detected Columns: <strong className="text-slate-800">{sheetTestResult.headers.filter((h: string) => h).join(', ')}</strong>
                                </div>
                              )}

                              {sheetTestResult.books && sheetTestResult.books.length > 0 && (
                                <div className="space-y-1 pt-1 border-t border-emerald-200">
                                  <div className="text-[10px] font-bold text-slate-700">Sample Books (First 3):</div>
                                  {sheetTestResult.books.slice(0, 3).map((b: any, i: number) => (
                                    <div key={i} className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-emerald-100 flex items-center justify-between gap-1">
                                      <span className="font-bold text-slate-800 truncate">{b.title}</span>
                                      <span className="text-slate-500 shrink-0">{b.author}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {sheetTestError && (
                            <div className="mt-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] rounded-xl flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                              <div>
                                <strong className="block font-bold">Connection Error:</strong>
                                <span>{sheetTestError}</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 2. Microsoft OneDrive */}
                        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-blue-800 flex items-center gap-1.5">
                            <Cloud className="w-4 h-4 text-blue-600" />
                            2. OneDrive Cloud Folder Link
                          </label>
                          <p className="text-[10px] text-slate-500">
                            Shared folder link for Microsoft OneDrive cloud drive:
                          </p>
                          <input
                            type="url"
                            value={oneDriveUrl}
                            onChange={(e) => setOneDriveUrl(e.target.value)}
                            placeholder="https://1drv.ms/... or https://onedrive.live.com/..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-blue-800"
                          />
                          {oneDriveUrl && (
                            <a
                              href={oneDriveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 pt-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Test Link
                            </a>
                          )}
                        </div>

                        {/* 3. Google Drive */}
                        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Database className="w-4 h-4 text-amber-600" />
                            3. Google Drive Cloud Folder Link
                          </label>
                          <p className="text-[10px] text-slate-500">
                            Shared link for main Google Drive library folder:
                          </p>
                          <input
                            type="url"
                            value={googleDriveUrl}
                            onChange={(e) => setGoogleDriveUrl(e.target.value)}
                            placeholder="https://drive.google.com/drive/folders/..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-amber-900"
                          />
                          {googleDriveUrl && (
                            <a
                              href={googleDriveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 pt-1"
                            >
                              <ExternalLink className="w-3 h-3" /> Test Link
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Optional Sheet Embed Settings */}
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="sheetEmbedCheck"
                            checked={sheetEmbedEnabled}
                            onChange={(e) => setSheetEmbedEnabled(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                          />
                          <label htmlFor="sheetEmbedCheck" className="font-bold text-slate-700 cursor-pointer">
                            Display Google Sheet & Cloud Access cards directly on library page
                          </label>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          (Students can browse Google Sheets & Cloud Vault in one click)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-section 2.3: Categorized Book Catalogs & Categories (Add, Edit, Delete, Reorder) */}
                  <div className="p-5 bg-sky-50/40 rounded-2xl border border-sky-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-sky-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-sky-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">4</span>
                          Categorized Book Collections & Category Cards (Total {libraryCategories.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Edit category title, description, book count, icon, and drive link for each subject card.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddLibraryCategory}
                        className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add New Category
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {libraryCategories.map((cat, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                              Category #{idx + 1}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveLibraryCategory(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Up"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveLibraryCategory(idx, 'down')}
                                disabled={idx === libraryCategories.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              {libraryCategories.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLibraryCategory(idx)}
                                  className="text-red-500 hover:text-red-700 text-xs p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category Title:</label>
                              <input
                                type="text"
                                value={cat.title}
                                onChange={(e) => handleUpdateLibraryCategory(idx, 'title', e.target.value)}
                                placeholder="e.g. Tafsir & Quranic Sciences"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Icon:</label>
                              <select
                                value={cat.icon || 'BookOpen'}
                                onChange={(e) => handleUpdateLibraryCategory(idx, 'icon', e.target.value)}
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                              >
                                {availableIcons.map(ic => (
                                  <option key={ic.id} value={ic.id}>{ic.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Book Count Badge:</label>
                              <input
                                type="text"
                                value={cat.count || ''}
                                onChange={(e) => handleUpdateLibraryCategory(idx, 'count', e.target.value)}
                                placeholder="e.g. 12,500+ Books"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-emerald-800 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Button Label:</label>
                              <input
                                type="text"
                                value={cat.btnText || 'Open Folder & Books'}
                                onChange={(e) => handleUpdateLibraryCategory(idx, 'btnText', e.target.value)}
                                placeholder="Open Folder & Books"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Description:</label>
                            <textarea
                              rows={2}
                              value={cat.desc}
                              onChange={(e) => handleUpdateLibraryCategory(idx, 'desc', e.target.value)}
                              placeholder="Specify books included in this category..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                              Category Cloud Folder Link (Google Drive / OneDrive):
                            </label>
                            <input
                              type="url"
                              value={cat.driveUrl || ''}
                              onChange={(e) => handleUpdateLibraryCategory(idx, 'driveUrl', e.target.value)}
                              placeholder="https://drive.google.com/... or https://onedrive.live.com/..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-sky-800"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* ========================================================================= */}
              {/* SECTION 2 (GALLERY PAGE SPECIFIC): HERO VIDEO/IMAGE & PHOTOS/VIDEOS CARDS */}
              {/* ========================================================================= */}
              {selectedPageId === 'gallery' && (
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  
                  {/* Sub-section 2.1: Hero Section Media & Video Controls */}
                  <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
                    <div className="border-b border-emerald-200/60 pb-2 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-emerald-800 text-white rounded-full text-[10px] flex items-center justify-center font-sans">2</span>
                          Gallery Hero Media & Video Configuration
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Set hero banner image, video introduction link, and media display settings.
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                        Hero Media
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Film className="w-3.5 h-3.5 text-emerald-700" />
                          Hero Media Display Type
                        </label>
                        <select
                          value={heroMediaType}
                          onChange={(e) => setHeroMediaType(e.target.value as any)}
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="image">🖼️ Banner Image Background</option>
                          <option value="video">🎥 Video with Popup Player</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-rose-600" />
                          Hero Introduction Video Link (YouTube / Google Drive / MP4)
                        </label>
                        <input
                          type="url"
                          value={heroVideoUrl}
                          onChange={(e) => setHeroVideoUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/..."
                          className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none font-mono text-rose-800"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">
                          Supports YouTube, Google Drive share links, or direct MP4 video URLs.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sub-section 2.2: Photo Gallery Showcase & Cards Editor (Line 1: Photos) */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-amber-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">3</span>
                          Row 1: Photo Gallery & Event Highlights (Total {galleryPhotos.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Horizontally scrollable on the public gallery page and expands into a full grid when clicked.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPhoto}
                        className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Photo
                      </button>
                    </div>

                    {/* Section Titles for Photos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Photo Section Title:</label>
                        <input
                          type="text"
                          value={photosSectionTitle}
                          onChange={(e) => setPhotosSectionTitle(e.target.value)}
                          placeholder="📸 Institute Photo Gallery & Highlights"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Subtitle:</label>
                        <input
                          type="text"
                          value={photosSectionSubtitle}
                          onChange={(e) => setPhotosSectionSubtitle(e.target.value)}
                          placeholder="Campus life, national seminars, convocations..."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Photo Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {galleryPhotos.map((photo, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                              Photo #{idx + 1}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, 'up')}
                                disabled={idx === 0}
                                title="Move Up"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, 'down')}
                                disabled={idx === galleryPhotos.length - 1}
                                title="Move Down"
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              {galleryPhotos.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(idx)}
                                  className="text-red-500 hover:text-red-700 text-xs p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                                  title="Delete Photo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Photo Title:</label>
                              <input
                                type="text"
                                value={photo.title}
                                onChange={(e) => handleUpdatePhoto(idx, 'title', e.target.value)}
                                placeholder="e.g. Central Campus Architecture"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category:</label>
                              <select
                                value={photo.category}
                                onChange={(e) => handleUpdatePhoto(idx, 'category', e.target.value)}
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                              >
                                <option value="campus">Campus & Environment</option>
                                <option value="seminar">Academic Seminars</option>
                                <option value="convocation">Convocation & Graduation</option>
                                <option value="competition">Azan & Vocal Training</option>
                                <option value="library">Library & Research</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Date / Session:</label>
                              <input
                                type="text"
                                value={photo.date || ''}
                                onChange={(e) => handleUpdatePhoto(idx, 'date', e.target.value)}
                                placeholder="e.g. January 2026"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Location / Venue:</label>
                              <input
                                type="text"
                                value={photo.location || ''}
                                onChange={(e) => handleUpdatePhoto(idx, 'location', e.target.value)}
                                placeholder="e.g. Satarkul Campus, Dhaka"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Image URL:</label>
                            <div className="flex gap-2">
                              <input
                                type="url"
                                value={photo.image}
                                onChange={(e) => handleUpdatePhoto(idx, 'image', e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-emerald-800"
                              />
                              {photo.image && (
                                <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                  <img src={photo.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Brief Description (Optional):</label>
                            <textarea
                              rows={2}
                              value={photo.description || ''}
                              onChange={(e) => handleUpdatePhoto(idx, 'description', e.target.value)}
                              placeholder="Enter historical context or details..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.3: Video Gallery Showcase & Cards Editor (Line 2: Videos) */}
                  <div className="p-5 bg-rose-50/40 rounded-2xl border border-rose-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-rose-800 text-white rounded-full text-[10px] flex items-center justify-center font-sans">4</span>
                          Row 2: Video Gallery & Documentaries (Total {galleryVideos.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Horizontally scrollable on the public gallery page; opens full HD modal player when clicked.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVideo}
                        className="px-3.5 py-1.5 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Video
                      </button>
                    </div>

                    {/* Section Titles for Videos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-rose-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Video Section Title:</label>
                        <input
                          type="text"
                          value={videosSectionTitle}
                          onChange={(e) => setVideosSectionTitle(e.target.value)}
                          placeholder="🎥 Video Gallery & Documentaries"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Subtitle:</label>
                        <input
                          type="text"
                          value={videosSectionSubtitle}
                          onChange={(e) => setVideosSectionSubtitle(e.target.value)}
                          placeholder="International conferences, Azan training..."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Video Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {galleryVideos.map((video, idx) => {
                        const parsed = parseVideoUrl(video.videoUrl, video.thumbnail);
                        const thumb = video.thumbnail || parsed.thumbnailUrl;

                        return (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-rose-200/90 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Video className="w-3.5 h-3.5 text-rose-600" />
                                Video #{idx + 1}
                              </span>
                              
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveVideo(idx, 'up')}
                                  disabled={idx === 0}
                                  title="Move Up"
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveVideo(idx, 'down')}
                                  disabled={idx === galleryVideos.length - 1}
                                  title="Move Down"
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                {galleryVideos.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveVideo(idx)}
                                    className="text-red-500 hover:text-red-700 text-xs p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                                    title="Delete Video"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2">
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Video Title:</label>
                                <input
                                  type="text"
                                  value={video.title}
                                  onChange={(e) => handleUpdateVideo(idx, 'title', e.target.value)}
                                  placeholder="e.g. Campus Tour & Documentary"
                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category:</label>
                                <select
                                  value={video.category}
                                  onChange={(e) => handleUpdateVideo(idx, 'category', e.target.value)}
                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none cursor-pointer"
                                >
                                  <option value="campus">Campus & Environment</option>
                                  <option value="seminar">Academic Seminars</option>
                                  <option value="convocation">Convocation & Graduation</option>
                                  <option value="competition">Azan & Vocal Training</option>
                                  <option value="library">Library & Research</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Video Link (YouTube, Google Drive, Vimeo, MP4):
                              </label>
                              <div className="flex gap-2 items-center">
                                <input
                                  type="url"
                                  value={video.videoUrl}
                                  onChange={(e) => handleUpdateVideo(idx, 'videoUrl', e.target.value)}
                                  placeholder="https://www.youtube.com/watch?v=... or https://drive.google.com/..."
                                  className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-rose-800"
                                />
                                {thumb && (
                                  <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-black relative">
                                    <img src={thumb} alt="Preview" className="w-full h-full object-cover" />
                                    <Play className="w-3 h-3 text-white absolute inset-0 m-auto" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Duration:</label>
                                <input
                                  type="text"
                                  value={video.duration || ''}
                                  onChange={(e) => handleUpdateVideo(idx, 'duration', e.target.value)}
                                  placeholder="08:20 mins"
                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Speaker / Presenter:</label>
                                <input
                                  type="text"
                                  value={video.speaker || ''}
                                  onChange={(e) => handleUpdateVideo(idx, 'speaker', e.target.value)}
                                  placeholder="Media Cell"
                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Date / Year:</label>
                                <input
                                  type="text"
                                  value={video.date || ''}
                                  onChange={(e) => handleUpdateVideo(idx, 'date', e.target.value)}
                                  placeholder="2026"
                                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                                Custom Thumbnail URL (Optional):
                              </label>
                              <input
                                type="url"
                                value={video.thumbnail || ''}
                                onChange={(e) => handleUpdateVideo(idx, 'thumbnail', e.target.value)}
                                placeholder="https://images.unsplash.com/..."
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-slate-600"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Brief Description (Optional):</label>
                              <textarea
                                rows={2}
                                value={video.description || ''}
                                onChange={(e) => handleUpdateVideo(idx, 'description', e.target.value)}
                                placeholder="Enter video summary or topic..."
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION: Dynamic Admission Page Management */}
              {selectedPageId === 'admission' && (
                <div className="space-y-8 pt-2">
                  
                  {/* Sub-section 2.1: Session Status & Key Highlight Metrics */}
                  <div className="p-5 bg-emerald-50/40 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-emerald-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">2</span>
                          Session Status Badge & Key Admission Metrics
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Configure the live academic session badge and top metrics banner displayed on the admission page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdmissionStat}
                        className="px-3 py-1.5 bg-[#064e3b] hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Metric
                      </button>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Live Academic Session Status Badge Text
                      </label>
                      <input
                        type="text"
                        value={sessionBadge}
                        onChange={(e) => setSessionBadge(e.target.value)}
                        placeholder="Academic Session 2025-2026 | Applications Now Open"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-emerald-900"
                      />
                    </div>

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {admissionStats.map((st, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-2.5 relative">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                            <span className="text-[11px] font-bold text-slate-700">Metric #{idx + 1}</span>
                            <div className="flex items-center gap-1">
                              <select
                                value={st.icon || 'Award'}
                                onChange={(e) => handleUpdateAdmissionStat(idx, 'icon', e.target.value)}
                                className="text-[10px] p-1 bg-slate-50 border border-slate-200 rounded-md outline-none cursor-pointer"
                              >
                                {availableIcons.map(ic => (
                                  <option key={ic.id} value={ic.id}>{ic.label}</option>
                                ))}
                              </select>
                              {admissionStats.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveAdmissionStat(idx)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                  title="Delete metric"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Label:</label>
                            <input
                              type="text"
                              value={st.label}
                              onChange={(e) => handleUpdateAdmissionStat(idx, 'label', e.target.value)}
                              placeholder="e.g. Delivery Mode"
                              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-700"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Value / Highlight:</label>
                            <input
                              type="text"
                              value={st.value}
                              onChange={(e) => handleUpdateAdmissionStat(idx, 'value', e.target.value)}
                              placeholder="e.g. On-Campus & Online"
                              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-[#064e3b]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.2: The 4-Step Admission Roadmap */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-amber-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">3</span>
                          Admission Roadmap & Application Steps (Total {admissionSteps.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Edit the sequential application stages, timeframe estimates, and action checklists.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdmissionStep}
                        className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Roadmap Step
                      </button>
                    </div>

                    {/* Section Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Title:</label>
                        <input
                          type="text"
                          value={processTitle}
                          onChange={(e) => setProcessTitle(e.target.value)}
                          placeholder="The 4-Step Admission Roadmap"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Subtitle:</label>
                        <input
                          type="text"
                          value={processSubtitle}
                          onChange={(e) => setProcessSubtitle(e.target.value)}
                          placeholder="Follow our structured digital admissions pathway..."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Step Cards */}
                    <div className="space-y-4">
                      {admissionSteps.map((stepItem, sIdx) => (
                        <div key={sIdx} className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-[#064e3b] font-serif flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono flex items-center justify-center font-bold">
                                {stepItem.step || String(sIdx + 1).padStart(2, '0')}
                              </span>
                              Step {sIdx + 1}: {stepItem.title || 'Untitled Step'}
                            </span>
                            {admissionSteps.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAdmissionStep(sIdx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                                title="Delete step"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Step Number (e.g. 01):</label>
                              <input
                                type="text"
                                value={stepItem.step}
                                onChange={(e) => handleUpdateAdmissionStep(sIdx, 'step', e.target.value)}
                                placeholder="01"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Stage Badge:</label>
                              <input
                                type="text"
                                value={stepItem.badge}
                                onChange={(e) => handleUpdateAdmissionStep(sIdx, 'badge', e.target.value)}
                                placeholder="Stage 1: Portal Setup"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-amber-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Estimated Duration:</label>
                              <input
                                type="text"
                                value={stepItem.duration}
                                onChange={(e) => handleUpdateAdmissionStep(sIdx, 'duration', e.target.value)}
                                placeholder="Est. 3-5 Mins"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Step Headline / Title:</label>
                            <input
                              type="text"
                              value={stepItem.title}
                              onChange={(e) => handleUpdateAdmissionStep(sIdx, 'title', e.target.value)}
                              placeholder="Create Your Student Account"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Detailed Description:</label>
                            <textarea
                              rows={2}
                              value={stepItem.desc}
                              onChange={(e) => handleUpdateAdmissionStep(sIdx, 'desc', e.target.value)}
                              placeholder="Register securely on our digital portal..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>

                          {/* Bullet Points Checklist */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold text-slate-600 flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                Action Checklist Points (Bullet Points)
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddStepPoint(sIdx)}
                                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add Point
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              {(stepItem.points || []).map((pt, pIdx) => (
                                <div key={pIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={pt}
                                    onChange={(e) => handleUpdateStepPoint(sIdx, pIdx, e.target.value)}
                                    placeholder="Enter checklist requirement..."
                                    className="flex-1 text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                                  />
                                  {stepItem.points.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStepPoint(sIdx, pIdx)}
                                      className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                                      title="Remove point"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.3: General Admission Criteria & Requirements */}
                  <div className="p-5 bg-teal-50/40 rounded-2xl border border-teal-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-teal-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">4</span>
                          General Admission Criteria & Eligibility Requirements (Total {admissionRequirements.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Set prerequisites including religious criteria, minimum degree qualifications, and attendance requirements.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdmissionRequirement}
                        className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Requirement
                      </button>
                    </div>

                    {/* Section Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-teal-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Title:</label>
                        <input
                          type="text"
                          value={reqTitle}
                          onChange={(e) => setReqTitle(e.target.value)}
                          placeholder="General Admission Criteria & Eligibility"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Subtitle:</label>
                        <input
                          type="text"
                          value={reqSubtitle}
                          onChange={(e) => setReqSubtitle(e.target.value)}
                          placeholder="Please review the institutional criteria and prerequisites..."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Requirement Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {admissionRequirements.map((req, rIdx) => (
                        <div key={rIdx} className="bg-white p-4 rounded-xl border border-teal-200/90 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                            <span className="text-xs font-bold text-teal-900 font-serif flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-teal-600" />
                              Requirement #{rIdx + 1}
                            </span>
                            {admissionRequirements.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAdmissionRequirement(rIdx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                title="Delete requirement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Category:</label>
                              <input
                                type="text"
                                value={req.category}
                                onChange={(e) => handleUpdateAdmissionRequirement(rIdx, 'category', e.target.value)}
                                placeholder="e.g. Faith & Ethics"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Badge / Tag:</label>
                              <input
                                type="text"
                                value={req.badge}
                                onChange={(e) => handleUpdateAdmissionRequirement(rIdx, 'badge', e.target.value)}
                                placeholder="e.g. Core Standard"
                                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-teal-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Title:</label>
                            <input
                              type="text"
                              value={req.title}
                              onChange={(e) => handleUpdateAdmissionRequirement(rIdx, 'title', e.target.value)}
                              placeholder="e.g. Practicing Muslim Identity"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Detailed Description:</label>
                            <textarea
                              rows={3}
                              value={req.desc}
                              onChange={(e) => handleUpdateAdmissionRequirement(rIdx, 'desc', e.target.value)}
                              placeholder="Explanation of criteria..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.4: Required Application Documents Checklist */}
                  <div className="p-5 bg-amber-50/40 rounded-2xl border border-amber-100 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-amber-800 text-white rounded-full text-[10px] flex items-center justify-center font-sans">5</span>
                          Required Documents Checklist (Total {admissionDocs.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          List papers and certificates that applicants must scan and prepare for online upload.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdmissionDoc}
                        className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Document
                      </button>
                    </div>

                    {/* Section Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-amber-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Title:</label>
                        <input
                          type="text"
                          value={docsTitle}
                          onChange={(e) => setDocsTitle(e.target.value)}
                          placeholder="Required Application Documents Checklist"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Subtitle:</label>
                        <input
                          type="text"
                          value={docsSubtitle}
                          onChange={(e) => setDocsSubtitle(e.target.value)}
                          placeholder="Please keep clear digital scans ready..."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    {/* Document Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {admissionDocs.map((docItem, dIdx) => (
                        <div key={dIdx} className="bg-white p-3.5 rounded-xl border border-amber-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <FileCheck className="w-3.5 h-3.5 text-amber-700" />
                              Document #{dIdx + 1}
                            </span>
                            {admissionDocs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAdmissionDoc(dIdx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                title="Delete document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Document Title:</label>
                              <input
                                type="text"
                                value={docItem.title}
                                onChange={(e) => handleUpdateAdmissionDoc(dIdx, 'title', e.target.value)}
                                placeholder="Passport-Sized Color Photographs"
                                className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Format Tag:</label>
                              <input
                                type="text"
                                value={docItem.tag}
                                onChange={(e) => handleUpdateAdmissionDoc(dIdx, 'tag', e.target.value)}
                                placeholder="PDF/JPG"
                                className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-center font-bold text-amber-800"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Description / Specifications:</label>
                            <input
                              type="text"
                              value={docItem.desc}
                              onChange={(e) => handleUpdateAdmissionDoc(dIdx, 'desc', e.target.value)}
                              placeholder="2 recently taken photos with clean background (Max 2MB)..."
                              className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.5: Frequently Asked Questions (FAQ) */}
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
                      <div>
                        <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                          <span className="w-5 h-5 bg-blue-800 text-white rounded-full text-[10px] flex items-center justify-center font-sans">6</span>
                          Admission FAQs (Total {admissionFaqs.length})
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Questions and answers displayed in the interactive expandable accordion on the admission page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAdmissionFaq}
                        className="px-3.5 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add FAQ
                      </button>
                    </div>

                    {/* Section Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Title:</label>
                        <input
                          type="text"
                          value={faqTitle}
                          onChange={(e) => setFaqTitle(e.target.value)}
                          placeholder="Frequently Asked Questions (FAQ)"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Section Subtitle:</label>
                        <input
                          type="text"
                          value={faqSubtitle}
                          onChange={(e) => setFaqSubtitle(e.target.value)}
                          placeholder="Find instant answers to common questions..."
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                        />
                      </div>
                    </div>

                    {/* FAQ Items */}
                    <div className="space-y-3">
                      {admissionFaqs.map((faq, fIdx) => (
                        <div key={fIdx} className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                              FAQ #{fIdx + 1}
                            </span>
                            {admissionFaqs.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveAdmissionFaq(fIdx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                                title="Delete FAQ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Question:</label>
                            <input
                              type="text"
                              value={faq.q}
                              onChange={(e) => handleUpdateAdmissionFaq(fIdx, 'q', e.target.value)}
                              placeholder="e.g. Can I study online while working?"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Answer:</label>
                            <textarea
                              rows={2}
                              value={faq.a}
                              onChange={(e) => handleUpdateAdmissionFaq(fIdx, 'a', e.target.value)}
                              placeholder="Provide clear and helpful answer..."
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sub-section 2.6: Admissions Secretariat & Helpdesk / CTA Card */}
                  <div className="p-5 bg-emerald-900/5 rounded-2xl border border-emerald-300/60 space-y-4">
                    <div className="border-b border-emerald-200 pb-2">
                      <h3 className="text-sm font-bold text-[#064e3b] font-serif flex items-center gap-2">
                        <span className="w-5 h-5 bg-[#064e3b] text-white rounded-full text-[10px] flex items-center justify-center font-sans">7</span>
                        Admissions Secretariat, CTA Card & Helpdesk Contacts
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Configure the bottom call-to-action banner, prospectus download link, helpline numbers, and working hours.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Left: Main CTA Banner Configuration */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <h4 className="text-xs font-bold text-emerald-900 font-serif border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Primary Call-to-Action Card
                        </h4>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Badge:</label>
                            <input
                              type="text"
                              value={admissionCtaCard.badge}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, badge: e.target.value })}
                              placeholder="Admissions Secretariat & Support"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Card Heading:</label>
                            <input
                              type="text"
                              value={admissionCtaCard.title}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, title: e.target.value })}
                              placeholder="Ready to Begin Your Studies?"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Description:</label>
                          <textarea
                            rows={2}
                            value={admissionCtaCard.desc}
                            onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, desc: e.target.value })}
                            placeholder="Submit your online application today..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Primary Button Text:</label>
                            <input
                              type="text"
                              value={admissionCtaCard.btnText}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, btnText: e.target.value })}
                              placeholder="Start Online Application"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-[#064e3b]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Primary Button Link:</label>
                            <input
                              type="text"
                              value={admissionCtaCard.btnLink || '/register'}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, btnLink: e.target.value })}
                              placeholder="/register"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-slate-700"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Prospectus Button Label:</label>
                            <input
                              type="text"
                              value={admissionCtaCard.prospectusBtn}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, prospectusBtn: e.target.value })}
                              placeholder="Download Prospectus (PDF)"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Prospectus File / Drive URL:</label>
                            <input
                              type="url"
                              value={admissionCtaCard.prospectusUrl || ''}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, prospectusUrl: e.target.value })}
                              placeholder="https://drive.google.com/... or /prospectus.pdf"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-mono text-blue-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right: Helpdesk Contacts */}
                      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                        <h4 className="text-xs font-bold text-amber-900 font-serif border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          Helpdesk & Admission Office Contacts
                        </h4>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Helpdesk Card Heading:</label>
                          <input
                            type="text"
                            value={admissionCtaCard.helpTitle}
                            onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, helpTitle: e.target.value })}
                            placeholder="Need Admission Guidance?"
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Helpline Phone:</label>
                            <input
                              type="text"
                              value={admissionCtaCard.phone}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, phone: e.target.value })}
                              placeholder="+880 1805-437910"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-emerald-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Official Admission Email:</label>
                            <input
                              type="email"
                              value={admissionCtaCard.email}
                              onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, email: e.target.value })}
                              placeholder="admission@asdri.edu.bd"
                              className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none font-bold text-emerald-800"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Official Working Hours:</label>
                          <input
                            type="text"
                            value={admissionCtaCard.hours}
                            onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, hours: e.target.value })}
                            placeholder="Saturday – Thursday: 9:00 AM – 5:00 PM BST"
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Guidance Box Notice:</label>
                          <textarea
                            rows={2}
                            value={admissionCtaCard.notice || ''}
                            onChange={(e) => setAdmissionCtaCard({ ...admissionCtaCard, notice: e.target.value })}
                            placeholder="For admissions counseling or technical help, please reach out to our admission officers..."
                            className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-slate-700 leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* SECTION 3: Rich Text Editor for Notice / Additional Institutional Content */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 bg-slate-700 text-white rounded-full text-[10px] flex items-center justify-center font-sans">
                    {selectedPageId === 'about' ? '6' : selectedPageId === 'courses' || selectedPageId === 'library' ? '5' : selectedPageId === 'admission' ? '8' : '2'}
                  </span>
                  {selectedPageId === 'about' 
                    ? 'Additional institutional details, history & policy notice (optional):' 
                    : selectedPageId === 'courses'
                    ? 'Course guidelines, class routine, or special notices (optional):'
                    : selectedPageId === 'library'
                    ? 'Library usage guidelines, research rules, and terms:'
                    : selectedPageId === 'admission'
                    ? 'Admission Circular, Official Guidelines & Important Notices (optional):'
                    : 'Main Page Content & Announcements:'}
                </label>
                <RichTextEditor
                  value={pageContent}
                  onChange={setPageContent}
                  placeholder="Write or paste detailed content here..."
                />
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  Changes will immediately reflect live on the public website.
                </p>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto px-7 py-3 bg-[#064e3b] hover:bg-emerald-900 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-300" /> 
                  {saving ? 'Saving changes...' : `Save All Changes & Cards`}
                </button>
              </div>

            </form>
          )}

          {/* Embedded Live Faculty Manager when faculty page is selected */}
          {selectedPageId === 'faculty' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 sm:p-6 space-y-6 mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Faculty Members Directory
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-bold text-slate-600">
                      Faculty Profiles & Directory Management
                    </span>
                  </div>
                  <h3 className="text-lg font-bold font-serif text-[#064e3b] flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-emerald-800" />
                    <span>Manage Faculty Profiles & Scholars Directory</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add new scholars, edit designations, qualifications, contact info, and manage faculty ordering.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/${locale}/dashboard/faculty`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Dedicated Full Page</span>
                  </Link>
                </div>
              </div>

              <FacultyManager locale={locale} />
            </div>
          )}
        </>
      )}

    </div>
  );
}
