import type { CardProgress, UserStats } from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'fizika_flashcards_progress_v1',
  STATS: 'fizika_flashcards_stats_v1',
  SETTINGS: 'fizika_flashcards_settings_v1',
};

// Spaced Repetition System Intervals (in days) as per user requirements:
// 1st: 1d, 2nd: 3d, 3rd: 7d, 4th: 14d, 5th: 30d
export const SRS_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function loadProgress(): Record<string, CardProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading progress from localStorage:', e);
    return {};
  }
}

export function saveProgress(progress: Record<string, CardProgress>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Error saving progress to localStorage:', e);
  }
}

export function loadStats(): UserStats {
  const today = getTodayDateString();
  const defaultStats: UserStats = {
    streak: 1,
    lastActiveDate: today,
    dailyGoal: 20,
    todayReviewedCount: 0,
    totalMastered: 0,
    totalLearning: 0,
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) {
      saveStats(defaultStats);
      return defaultStats;
    }

    const parsed: UserStats = JSON.parse(raw);
    
    // Check if day changed
    if (parsed.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      
      let newStreak = parsed.streak;
      if (parsed.lastActiveDate === yStr) {
        // Active yesterday, maintain streak
      } else {
        // Inactive more than 1 day, reset streak to 1
        newStreak = 1;
      }

      parsed.streak = newStreak;
      parsed.lastActiveDate = today;
      parsed.todayReviewedCount = 0; // Reset daily count for today
      saveStats(parsed);
    }

    return parsed;
  } catch (e) {
    console.error('Error loading stats:', e);
    return defaultStats;
  }
}

export function saveStats(stats: UserStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error('Error saving stats:', e);
  }
}

export function markCardResult(
  cardId: string, 
  known: boolean
): { progress: CardProgress; stats: UserStats } {
  const allProgress = loadProgress();
  const existing = allProgress[cardId] || {
    cardId,
    status: 'new',
    intervalStep: 0,
    nextReviewDate: 0,
    reviewsCount: 0,
    mistakesCount: 0,
    isFavorite: false,
  };

  const now = Date.now();
  let nextStep = existing.intervalStep;
  let status: 'new' | 'learning' | 'mastered' = existing.status;

  if (known) {
    // If known, move up to next SRS step
    nextStep = Math.min(nextStep + 1, SRS_INTERVALS_DAYS.length - 1);
    // At step 3 (7 days) and above, considered mastered
    status = nextStep >= 3 ? 'mastered' : 'learning';
  } else {
    // If failed / forgot, reset back to step 1 (1 day)
    nextStep = 1;
    status = 'learning';
    existing.mistakesCount = (existing.mistakesCount || 0) + 1;
  }

  const daysUntilNext = SRS_INTERVALS_DAYS[nextStep] || 1;
  const nextReviewDate = now + daysUntilNext * 24 * 60 * 60 * 1000;

  const updatedProgress: CardProgress = {
    ...existing,
    status,
    intervalStep: nextStep,
    nextReviewDate,
    lastReviewedDate: now,
    reviewsCount: (existing.reviewsCount || 0) + 1,
  };

  allProgress[cardId] = updatedProgress;
  saveProgress(allProgress);

  // Update Stats
  const stats = loadStats();
  stats.todayReviewedCount += 1;

  // Recalculate totals
  let masteredCount = 0;
  let learningCount = 0;
  Object.values(allProgress).forEach((p) => {
    if (p.status === 'mastered') masteredCount++;
    else if (p.status === 'learning') learningCount++;
  });
  stats.totalMastered = masteredCount;
  stats.totalLearning = learningCount;

  saveStats(stats);

  return { progress: updatedProgress, stats };
}

export function toggleCardFavorite(cardId: string): boolean {
  const allProgress = loadProgress();
  const existing = allProgress[cardId] || {
    cardId,
    status: 'new',
    intervalStep: 0,
    nextReviewDate: 0,
    reviewsCount: 0,
    mistakesCount: 0,
    isFavorite: false,
  };

  existing.isFavorite = !existing.isFavorite;
  allProgress[cardId] = existing;
  saveProgress(allProgress);
  return existing.isFavorite;
}
