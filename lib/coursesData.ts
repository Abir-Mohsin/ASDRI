import { getOptimizedImageUrl } from '@/lib/imageUtils';

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

// Zero dummy courses: real courses come from Firestore
export const DEFAULT_COURSES: Course[] = [];

export async function fetchAllCourses(): Promise<Course[]> {
  if (typeof window !== 'undefined') {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      const querySnapshot = await getDocs(collection(db, 'courses'));
      if (!querySnapshot.empty) {
        const dbCourses: Course[] = querySnapshot.docs.map((d) => {
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
            posterUrl: data.posterUrl ? getOptimizedImageUrl(data.posterUrl) : (data.bannerImageUrl ? getOptimizedImageUrl(data.bannerImageUrl) : ''),
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
    } catch (err) {
      console.warn('Notice fetching courses from Firestore:', err);
    }
  }
  return [];
}

export async function fetchCourseById(courseId: string): Promise<Course | null> {
  // Check Firestore if in browser
  if (typeof window !== 'undefined') {
    try {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
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
          posterUrl: data.posterUrl ? getOptimizedImageUrl(data.posterUrl) : (data.bannerImageUrl ? getOptimizedImageUrl(data.bannerImageUrl) : ''),
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
    } catch (err) {
      console.warn('Notice fetching course by id from Firestore:', err);
    }
  }

  return null;
}

export const DEFAULT_COURSE_COVER = 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=1200&q=80';

export function getCourseCoverImage(course: Partial<Course>): string {
  if (course.posterUrl && typeof course.posterUrl === 'string' && course.posterUrl.trim() !== '') {
    return getOptimizedImageUrl(course.posterUrl.trim(), DEFAULT_COURSE_COVER);
  }
  return DEFAULT_COURSE_COVER;
}
