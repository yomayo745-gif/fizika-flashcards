import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PHYSICS_FLASHCARDS } from './data/physicsCards';
import { SECTIONS_DATA } from './data/sections';
import type { Flashcard, CardProgress, UserStats, ViewMode } from './types';
import {
  loadProgress,
  loadStats,
} from './utils/storage';
import { initTelegramApp, getTelegramUser } from './utils/telegram';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { SectionsView } from './components/SectionsView';
import { FormulaCardsView } from './components/FormulaCardsView';
import { ReviewView } from './components/ReviewView';
import { CardListView } from './components/CardListView';
import { StudyView } from './components/StudyView';
import { SearchModal } from './components/SearchModal';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [progressMap, setProgressMap] = useState<Record<string, CardProgress>>({});
  const [stats, setStats] = useState<UserStats>({
    streak: 1,
    lastActiveDate: '',
    dailyGoal: 20,
    todayReviewedCount: 0,
    totalMastered: 0,
    totalLearning: 0,
  });

  const [isDark, setIsDark] = useState<boolean>(true);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tgUserName, setTgUserName] = useState<string | null>(null);

  // Active study deck state
  const [studyDeck, setStudyDeck] = useState<Flashcard[]>([]);
  const [studyTitle, setStudyTitle] = useState<string>('');
  const [studySubtitle, setStudySubtitle] = useState<string | undefined>();

  // Initialize Telegram WebApp and load progress on mount
  useEffect(() => {
    initTelegramApp();
    const tgUser = getTelegramUser();
    if (tgUser?.first_name) {
      setTgUserName(tgUser.first_name);
    }

    const loadedProg = loadProgress();
    setProgressMap(loadedProg);

    const loadedStats = loadStats();
    setStats(loadedStats);

    // Dark mode check
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  // Theme toggle
  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-slate-50 text-slate-900 min-h-screen selection:bg-indigo-500 selection:text-white';
    }
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Due cards for Spaced Repetition (nextReviewDate <= now)
  const now = Date.now();
  const dueCards = useMemo(() => {
    return PHYSICS_FLASHCARDS.filter((card) => {
      const p = progressMap[card.id];
      if (!p || !p.nextReviewDate) return false;
      return p.nextReviewDate <= now;
    });
  }, [progressMap, now]);

  // Mistakes cards (mistakesCount > 0)
  const mistakeCards = useMemo(() => {
    return PHYSICS_FLASHCARDS.filter((card) => {
      const p = progressMap[card.id];
      return p && (p.mistakesCount || 0) > 0;
    });
  }, [progressMap]);

  // Favorite cards
  const favoriteCards = useMemo(() => {
    return PHYSICS_FLASHCARDS.filter((card) => {
      return progressMap[card.id]?.isFavorite;
    });
  }, [progressMap]);

  // Start study session
  const handleStartStudy = (
    cards: Flashcard[],
    title: string,
    subtitle?: string
  ) => {
    setStudyDeck(cards);
    setStudyTitle(title);
    setStudySubtitle(subtitle);
    setCurrentView('study');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Progress update callback from study view
  const handleProgressUpdate = useCallback(
    (updated: CardProgress, updatedStats: UserStats) => {
      setProgressMap((prev) => ({
        ...prev,
        [updated.cardId]: updated,
      }));
      setStats(updatedStats);
    },
    []
  );

  const handleFavoritesChange = useCallback(() => {
    setProgressMap(loadProgress());
  }, []);

  // Section selection
  const handleSelectSection = (sectionId: number) => {
    const sec = SECTIONS_DATA.find((s) => s.id === sectionId);
    const sectionCards = PHYSICS_FLASHCARDS.filter((c) => c.section === sectionId);
    handleStartStudy(
      sectionCards,
      sec ? sec.title : `Bo‘lim ${sectionId}`,
      sec?.description
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        stats={stats}
        dueCount={dueCards.length}
        mistakesCount={mistakeCards.length}
        favoritesCount={favoriteCards.length}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenSearch={() => setIsSearchOpen(true)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        userName={tgUserName}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentView === 'dashboard' && (
          <DashboardView
            allCards={PHYSICS_FLASHCARDS}
            progressMap={progressMap}
            stats={stats}
            dueCards={dueCards}
            mistakeCards={mistakeCards}
            favoriteCards={favoriteCards}
            onStartStudy={handleStartStudy}
            onNavigateSections={() => setCurrentView('sections')}
            onNavigateFormulas={() => setCurrentView('formulas')}
            userName={tgUserName}
          />
        )}

        {currentView === 'sections' && (
          <SectionsView
            allCards={PHYSICS_FLASHCARDS}
            progressMap={progressMap}
            onSelectSection={handleSelectSection}
          />
        )}

        {currentView === 'formulas' && (
          <FormulaCardsView
            allCards={PHYSICS_FLASHCARDS}
            onStartStudyWithCards={handleStartStudy}
          />
        )}

        {currentView === 'review' && (
          <ReviewView
            dueCards={dueCards}
            allCards={PHYSICS_FLASHCARDS}
            progressMap={progressMap}
            onStartStudyWithCards={handleStartStudy}
          />
        )}

        {currentView === 'mistakes' && (
          <CardListView
            type="mistakes"
            cards={mistakeCards}
            progressMap={progressMap}
            onStartStudyWithCards={handleStartStudy}
            onCardClick={(card) =>
              handleStartStudy([card], card.topic, card.sectionTitle)
            }
          />
        )}

        {currentView === 'favorites' && (
          <CardListView
            type="favorites"
            cards={favoriteCards}
            progressMap={progressMap}
            onStartStudyWithCards={handleStartStudy}
            onCardClick={(card) =>
              handleStartStudy([card], card.topic, card.sectionTitle)
            }
          />
        )}

        {currentView === 'study' && (
          <StudyView
            cards={studyDeck}
            title={studyTitle}
            subtitle={studySubtitle}
            onClose={() => setCurrentView('dashboard')}
            progressMap={progressMap}
            onProgressUpdate={handleProgressUpdate}
            onFavoritesChange={handleFavoritesChange}
          />
        )}
      </main>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allCards={PHYSICS_FLASHCARDS}
        onStartStudyWithCards={handleStartStudy}
      />

      {/* Mobile Bottom Navigation */}
      {currentView !== 'study' && (
        <BottomNav
          currentView={currentView}
          onNavigate={(view) => {
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          dueCount={dueCards.length}
          favoritesCount={favoriteCards.length}
        />
      )}
    </div>
  );
};

export default App;
