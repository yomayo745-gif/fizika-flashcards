export type CardCategory =
  | 'definition'
  | 'formula'
  | 'law'
  | 'unit'
  | 'difference'
  | 'mistake'
  | 'fact'
  | 'question'
  | 'constant';

export type CardLevel = 'A' | 'B' | 'C';

export interface Flashcard {
  id: string;
  section: number;
  sectionTitle: string;
  topic: string;
  category: CardCategory;
  level: CardLevel;
  question: string;
  answer: string;
  formula?: string | null;
  symbol_explanation?: string | null;
  si_unit?: string | null;
  source_page: number;
  difficulty: number;
}

export interface CardProgress {
  cardId: string;
  status: 'new' | 'learning' | 'mastered';
  intervalStep: number; // 0: new, 1: 1d, 2: 3d, 3: 7d, 4: 14d, 5: 30d
  nextReviewDate: number; // timestamp ms
  lastReviewedDate?: number;
  reviewsCount: number;
  mistakesCount: number;
  isFavorite: boolean;
}

export interface UserStats {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoal: number; // default 20
  todayReviewedCount: number;
  totalMastered: number;
  totalLearning: number;
}

export interface SectionMeta {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  color: string;
  bgGradient: string;
  accentBorder: string;
}

export type ViewMode = 
  | 'dashboard' 
  | 'study' 
  | 'sections' 
  | 'formulas' 
  | 'review' 
  | 'mistakes' 
  | 'favorites' 
  | 'search';
