export interface FatwaItem {
  id: string;
  questionNo: string;
  title: string;
  titleEn?: string;
  titleAr?: string;
  category: string;
  categoryEn?: string;
  categoryAr?: string;
  question: string;
  questionEn?: string;
  questionAr?: string;
  answer: string;
  answerEn?: string;
  answerAr?: string;
  muftiName: string;
  muftiTitle?: string;
  references?: string[];
  date: string;
  isVerified: boolean;
  status: 'published' | 'pending' | 'private';
  views?: number;
}

export const defaultFatwas: FatwaItem[] = [];
