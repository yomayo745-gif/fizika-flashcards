import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Shuffle,
  Trophy,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Flashcard, CardProgress, UserStats } from '../types';
import { Flashcard3D } from './Flashcard3D';
import { markCardResult, toggleCardFavorite } from '../utils/storage';
import { triggerHaptic } from '../utils/telegram';

interface StudyViewProps {
  cards: Flashcard[];
  title: string;
  subtitle?: string;
  onClose: () => void;
  progressMap: Record<string, CardProgress>;
  onProgressUpdate: (updated: CardProgress, stats: UserStats) => void;
  onFavoritesChange: () => void;
}

export const StudyView: React.FC<StudyViewProps> = ({
  cards,
  title,
  subtitle,
  onClose,
  progressMap,
  onProgressUpdate,
  onFavoritesChange,
}) => {
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'A' | 'AB' | 'C'>('ALL');
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionLearnedCount, setSessionLearnedCount] = useState(0);
  const [sessionRepeatCount, setSessionRepeatCount] = useState(0);

  // Filter deck based on level
  useEffect(() => {
    let filtered = [...cards];
    if (levelFilter === 'A') {
      filtered = filtered.filter((c) => c.level === 'A');
    } else if (levelFilter === 'AB') {
      filtered = filtered.filter((c) => c.level === 'A' || c.level === 'B');
    } else if (levelFilter === 'C') {
      filtered = filtered.filter((c) => c.level === 'C');
    }

    if (isShuffled) {
      filtered.sort(() => Math.random() - 0.5);
    }

    setDeck(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
  }, [cards, levelFilter, isShuffled]);

  const currentCard = deck[currentIndex];
  const cardProgress = currentCard ? progressMap[currentCard.id] : undefined;
  const isFavorite = cardProgress?.isFavorite ?? false;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed deck!
      setSessionCompleted(true);
      triggerHaptic('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [currentIndex, deck.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleAnswer = useCallback(
    (known: boolean) => {
      if (!currentCard) return;

      triggerHaptic(known ? 'success' : 'warning');
      const { progress, stats } = markCardResult(currentCard.id, known);
      onProgressUpdate(progress, stats);

      if (known) {
        setSessionLearnedCount((prev) => prev + 1);
      } else {
        setSessionRepeatCount((prev) => prev + 1);
      }

      handleNext();
    },
    [currentCard, handleNext, onProgressUpdate]
  );

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard) return;
    triggerHaptic('medium');
    toggleCardFavorite(currentCard.id);
    onFavoritesChange();
  };

  const handleShuffleToggle = () => {
    triggerHaptic('light');
    setIsShuffled((prev) => !prev);
  };

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
        if (isFlipped) {
          handleAnswer(true);
        } else {
          handleNext();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'KeyF') {
        if (currentCard) {
          toggleCardFavorite(currentCard.id);
          onFavoritesChange();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleAnswer, isFlipped, currentCard, onFavoritesChange]);

  if (deck.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-100 mb-2">Ushbu filtr bo‘yicha kartalar topilmadi</h3>
        <p className="text-sm text-slate-400 mb-6">
          Tanlangan daraja (A, B, C) bo‘yicha kartalar mavjud emas. Filtrlarni almashtirib ko‘ring.
        </p>
        <button
          onClick={() => setLevelFilter('ALL')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors"
        >
          Barcha kartalarni ko‘rsatish
        </button>
      </div>
    );
  }

  // Completion screen
  if (sessionCompleted) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/20 text-slate-950">
          <Trophy className="w-10 h-10" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Ajoyib natija! Dars tugadi
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Siz bu bo‘limdagi barcha kartalarni muvaffaqiyatli ko‘rib chiqdingiz.
        </p>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
            <span className="text-3xl font-black text-emerald-400 block mb-1">
              {sessionLearnedCount}
            </span>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
              Yaxshi o‘zlashtirildi
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center">
            <span className="text-3xl font-black text-rose-400 block mb-1">
              {sessionRepeatCount}
            </span>
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Qayta takrorlashga
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Qaytadan boshlash</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 flex flex-col justify-between min-h-[calc(100vh-5rem)]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        {/* Back Button & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="Orqaga qaytish"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight line-clamp-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-400 line-clamp-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Level Selector & Shuffle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Level Filter Pills */}
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setLevelFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                levelFilter === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Hammasi
            </button>
            <button
              onClick={() => setLevelFilter('A')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                levelFilter === 'A'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              A daraja
            </button>
            <button
              onClick={() => setLevelFilter('AB')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                levelFilter === 'AB'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-sky-400/80 hover:text-sky-300'
              }`}
            >
              A + B
            </button>
          </div>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffleToggle}
            title={isShuffled ? 'Tasodifiy tartib yoniq' : 'Tasodifiy tartibda aralashtirish'}
            className={`p-2 rounded-xl border transition-colors ${
              isShuffled
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Counter */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
          <span>Karta: <strong className="text-slate-200">{currentIndex + 1}</strong> / {deck.length}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Center 3D Flashcard */}
      <div className="my-auto py-2">
        <Flashcard3D
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          cardIndex={currentIndex}
          totalCards={deck.length}
        />
      </div>

      {/* Bottom Controls */}
      <div className="mt-4 pt-2">
        {/* Primary Interaction Buttons */}
        {!isFlipped ? (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              aria-label="Oldingi karta"
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={handleFlip}
              className="flex-1 max-w-sm py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Javobni ko‘rish (Space)</span>
            </button>

            <button
              onClick={handleNext}
              aria-label="Keyingi karta"
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 animate-fade-in">
            <button
              onClick={() => handleAnswer(false)}
              className="flex-1 max-w-xs py-3.5 px-4 rounded-2xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-white border border-rose-500/40 font-semibold text-sm sm:text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10"
            >
              <X className="w-5 h-5" />
              <span>Qayta o‘rganish kerak</span>
            </button>

            <button
              onClick={() => handleAnswer(true)}
              className="flex-1 max-w-xs py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm sm:text-base transition-all transform active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Check className="w-5 h-5" />
              <span>Bilaman (Arrow Right)</span>
            </button>
          </div>
        )}

        {/* Keyboard hints */}
        <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-500 mt-3 font-mono">
          <span>[Space] Aylantirish</span>
          <span>[←] Oldingi</span>
          <span>[→] Keyingi / Bilaman</span>
          <span>[F] Sevimlilar</span>
        </div>
      </div>
    </div>
  );
};
