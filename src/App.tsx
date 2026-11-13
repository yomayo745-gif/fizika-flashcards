import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PHYSICS_FLASHCARDS } from './data/physicsCards';
import type { CardLevel, CardCategory } from './types';
import { initTelegramApp, triggerHaptic } from './utils/telegram';
import { HeaderSwitcher } from './components/HeaderSwitcher';
import { Flashcard3D } from './components/Flashcard3D';
import { SearchModal } from './components/SearchModal';

const FAVORITES_STORAGE_KEY = 'fizika_flashcards_favorites_v2';

export const App: React.FC = () => {
  // Navigation & Filtering
  const [selectedSection, setSelectedSection] = useState<number | 'ALL' | 'FAVORITES' | 'FORMULAS'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<CardLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'ALL'>('ALL');

  // Flashcard State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  // Favorites stored in localStorage
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // App Settings
  const [isDark, setIsDark] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize Telegram Mini App
  useEffect(() => {
    initTelegramApp();
  }, []);

  // Theme handling
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

  // Fullscreen handling
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (cardId: string) => {
    setFavorites((prev) => {
      const next = { ...prev, [cardId]: !prev[cardId] };
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Filter cards based on section, level, category
  const filteredCards = useMemo(() => {
    let result = PHYSICS_FLASHCARDS.filter((card) => {
      // 1. Section Filter
      if (selectedSection === 'FORMULAS') {
        if (!card.formula) return false;
      } else if (selectedSection === 'FAVORITES') {
        if (!favorites[card.id]) return false;
      } else if (selectedSection !== 'ALL') {
        if (card.section !== selectedSection) return false;
      }

      // 2. Level Filter
      if (selectedLevel !== 'ALL' && card.level !== selectedLevel) {
        return false;
      }

      // 3. Category Filter
      if (selectedCategory !== 'ALL' && card.category !== selectedCategory) {
        return false;
      }

      return true;
    });

    if (isShuffled) {
      result = [...result].sort(() => Math.random() - 0.5);
    }

    return result;
  }, [selectedSection, selectedLevel, selectedCategory, isShuffled, favorites]);

  // Reset index and flipped state on filter change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
  }, [selectedSection, selectedLevel, selectedCategory, isShuffled]);

  const currentCard = filteredCards[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    triggerHaptic('light');
    if (currentIndex < filteredCards.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      triggerHaptic('success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [currentIndex, filteredCards.length]);

  const handlePrev = useCallback(() => {
    triggerHaptic('light');
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyF') {
        if (currentCard) {
          handleToggleFavorite(currentCard.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentCard]);

  const favoritesCount = useMemo(() => {
    return Object.values(favorites).filter(Boolean).length;
  }, [favorites]);

  const progressPercent =
    filteredCards.length > 0
      ? Math.round(((currentIndex + 1) / filteredCards.length) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 transition-colors">
      {/* Top Header & Section Switcher */}
      <HeaderSwitcher
        selectedSection={selectedSection}
        onSelectSection={(sec) => setSelectedSection(sec)}
        selectedLevel={selectedLevel}
        onSelectLevel={(lvl) => setSelectedLevel(lvl)}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        isShuffled={isShuffled}
        onToggleShuffle={() => setIsShuffled((prev) => !prev)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenSearch={() => setIsSearchOpen(true)}
        totalCardsCount={PHYSICS_FLASHCARDS.length}
        filteredCount={filteredCards.length}
        favoritesCount={favoritesCount}
      />

      {/* Main Flashcard View */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto px-3 sm:px-6 py-4">
        {filteredCards.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/60 rounded-3xl border border-slate-800">
            <Sparkles className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-200 mb-1">
              Bu parametrlar bo‘yicha kartalar topilmadi
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Iltimos, yuqoridagi filtr yoki bo‘limni almashtirib ko‘ring.
            </p>
            <button
              onClick={() => {
                setSelectedSection('ALL');
                setSelectedLevel('ALL');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Barcha kartalarni ko‘rsatish
            </button>
          </div>
        ) : isFinished ? (
          <div className="text-center py-12 px-4 bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl animate-fade-in max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">
              Barcha kartalar ko‘rib chiqildi!
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Siz ushbu bo‘limdagi {filteredCards.length} ta kartani to‘liq ko‘rib chiqdingiz.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setIsFinished(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Qaytadan boshlash</span>
              </button>
              <button
                onClick={() => {
                  setSelectedSection('ALL');
                  setCurrentIndex(0);
                  setIsFlipped(false);
                  setIsFinished(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Barcha kartalarga o‘tish
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {/* Progress Bar & Counter */}
            <div className="max-w-2xl mx-auto mb-3">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-medium">
                <span>
                  Karta: <strong className="text-white">{currentIndex + 1}</strong> / {filteredCards.length}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 3D Flip Flashcard */}
            <Flashcard3D
              card={currentCard}
              isFlipped={isFlipped}
              onFlip={handleFlip}
              isFavorite={Boolean(favorites[currentCard.id])}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                handleToggleFavorite(currentCard.id);
              }}
              cardIndex={currentIndex}
              totalCards={filteredCards.length}
            />

            {/* Simple Controls (Oldingi, Aylantirish, Keyingi) */}
            <div className="max-w-2xl mx-auto mt-4">
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  aria-label="Oldingi karta"
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-slate-800 transition-all active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleFlip}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isFlipped ? 'Savolga qaytish' : 'Javobni ko‘rish'} (Space)</span>
                </button>

                <button
                  onClick={handleNext}
                  aria-label="Keyingi karta"
                  className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-all active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Keyboard shortcuts hints */}
              <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-2.5 font-mono">
                <span>[Space] Aylantirish</span>
                <span>[←] Oldingi</span>
                <span>[→] Keyingi</span>
                <span>[F] Sevimli</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        allCards={PHYSICS_FLASHCARDS}
        onStartStudyWithCards={(cards) => {
          if (cards.length > 0) {
            const foundCard = cards[0];
            const idx = filteredCards.findIndex((c) => c.id === foundCard.id);
            if (idx !== -1) {
              setCurrentIndex(idx);
            } else {
              setSelectedSection('ALL');
              setSelectedLevel('ALL');
              setSelectedCategory('ALL');
              const allIdx = PHYSICS_FLASHCARDS.findIndex((c) => c.id === foundCard.id);
              if (allIdx !== -1) setCurrentIndex(allIdx);
            }
            setIsFlipped(false);
          }
        }}
      />
    </div>
  );
};

export default App;
