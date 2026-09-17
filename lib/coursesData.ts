import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getOptimizedImageUrl } from '@/lib/imageUtils';
import { COURSES } from '@/lib/constants/courses';

export interface Course {
  id: string;
  title: string;
  titleEn?: string;
  titleBn?: string;
  titleAr?: string;
  code: string;
  duration: string;
  type: string; // 'Core' | 'Elective' | 'Diploma' | 'Specialization' | etc.
  instructor: string;
  instructorRole?: string;
  instructorAvatar?: string;
  studyMode?: string;
  instructionLanguage?: string;
  batchNumber?: string;
  startDate?: string;
  endDate?: string;
  posterUrl?: string;
  description: string;
  descriptionEn?: string;
  descriptionBn?: string;
  descriptionAr?: string;
  curriculum?: string;
  eligibility?: string;
  nextClass?: string;
  students?: number;
  progress?: number;
  fee?: string;
  schedule?: string;
  learningOutcomes?: string[];
  prerequisites?: string;
  certification?: string;
}

export const DEFAULT_COURSES: Course[] = [];

export async function fetchAllCourses(): Promise<Course[]> {
  if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      if (db) {
        const querySnapshot = await getDocs(collection(db, 'courses'));
        if (!querySnapshot.empty) {
          const dbCourses: Course[] = querySnapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              title: data.title || 'Academic Course',
              titleEn: data.titleEn || data.title,
              titleBn: data.titleBn || data.title,
              titleAr: data.titleAr || data.title,
              code: data.code || 'ASDRI-101',
              duration: data.duration || '1 Year',
              type: data.type || 'Core',
              instructor: data.instructor || 'ASDRI Faculty',
              instructorRole: data.instructorRole || '',
              instructorAvatar: data.instructorAvatar ? getOptimizedImageUrl(data.instructorAvatar) : '',
              studyMode: data.studyMode || '',
              instructionLanguage: data.instructionLanguage || '',
              batchNumber: data.batchNumber || 'Batch 01',
              startDate: data.startDate,
              endDate: data.endDate,
              posterUrl: getOptimizedImageUrl(data.posterUrl || data.bannerImageUrl),
              description: data.description || '',
              descriptionEn: data.descriptionEn || data.description,
              descriptionBn: data.descriptionBn || data.description,
              descriptionAr: data.descriptionAr || data.description,
              curriculum: data.curriculum,
              eligibility: data.eligibility,
              nextClass: data.nextClass,
              students: data.students,
              progress: data.progress,
              fee: data.fee,
              schedule: data.schedule,
              learningOutcomes: data.learningOutcomes,
              prerequisites: data.prerequisites,
              certification: data.certification,
            };
          });
          return dbCourses;
        }
      }
    } catch {
      // Return empty array when Firestore is empty or inaccessible
    }
  }
  return [];
}

export async function fetchCourseById(courseId: string): Promise<Course | null> {
  // Check Firestore first if available
  if (typeof window !== 'undefined' || process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      if (db) {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            title: data.title || 'Academic Course',
            titleEn: data.titleEn || data.title,
            titleBn: data.titleBn || data.title,
            titleAr: data.titleAr || data.title,
            code: data.code || 'ASDRI-101',
            duration: data.duration || '1 Year',
            type: data.type || 'Core',
            instructor: data.instructor || 'ASDRI Faculty',
            instructorRole: data.instructorRole || '',
            instructorAvatar: data.instructorAvatar ? getOptimizedImageUrl(data.instructorAvatar) : '',
            studyMode: data.studyMode || '',
            instructionLanguage: data.instructionLanguage || '',
            batchNumber: data.batchNumber || 'Batch 01',
            startDate: data.startDate,
            endDate: data.endDate,
            posterUrl: getOptimizedImageUrl(data.posterUrl || data.bannerImageUrl),
            description: data.description || '',
            descriptionEn: data.descriptionEn || data.description,
            descriptionBn: data.descriptionBn || data.description,
            descriptionAr: data.descriptionAr || data.description,
            curriculum: data.curriculum,
            eligibility: data.eligibility,
            nextClass: data.nextClass,
            students: data.students,
            progress: data.progress,
            fee: data.fee,
            schedule: data.schedule,
            learningOutcomes: data.learningOutcomes,
            prerequisites: data.prerequisites,
            certification: data.certification,
          };
        }
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

export function getCourseCoverImage(course: Partial<Course>): string {
  if (course.posterUrl) {
    return getOptimizedImageUrl(course.posterUrl);
  }
  const idLower = (course.id || '').toLowerCase();
  const codeLower = (course.code || '').toLowerCase();
  const titleLower = (course.title || '').toLowerCase();

  if (idLower.includes('pys') || codeLower.includes('pys') || titleLower.includes('specialization') || titleLower.includes('প্রস্তুতি')) {
    return 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80';
  }
  if (idLower.includes('cis') || codeLower.includes('cis') || titleLower.includes('certificate') || titleLower.includes('সার্টিফিকেট')) {
    return 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=800&q=80';
  }
  if (idLower.includes('dis') || codeLower.includes('dis') || titleLower.includes('diploma') || titleLower.includes('ডিপ্লোমা')) {
    return 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80';
  }
  if (idLower.includes('ife') || codeLower.includes('ife') || titleLower.includes('finance') || titleLower.includes('অর্থনীতি')) {
    return 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80';
  }
  if (idLower.includes('art') || codeLower.includes('art') || titleLower.includes('arabic') || titleLower.includes('আরবি')) {
    return 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80';
  }
  if (idLower.includes('qhs') || codeLower.includes('qhs') || titleLower.includes('hadith') || titleLower.includes('হাদিস')) {
    return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80';
  }

  return 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80';
}
