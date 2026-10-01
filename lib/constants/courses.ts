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

// Zero dummy courses: real academic programs are published dynamically from Admin portal
export const COURSES: CourseItem[] = [];

export function getLocalizedCourse(course?: CourseItem | null, locale: string = 'en') {
  if (!course) {
    return {
      id: '',
      title: '',
      duration: '',
      type: '',
      eligibility: '',
      fees: {
        admissionFee: 0,
        tuitionFee: 0,
        accommodationFee: 0,
        totalFee: 0,
        isFree: true,
        currency: 'BDT',
        notes: ''
      }
    };
  }
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
