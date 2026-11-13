import React from 'react';
import { Star, Volume2, RotateCw, BookOpen, Layers } from 'lucide-react';
import type { Flashcard, CardLevel } from '../types';
import { MathView } from './MathView';
import { triggerHaptic } from '../utils/telegram';

interface Flashcard3DProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  cardIndex: number;
  totalCards: number;
}

const LEVEL_CONFIG: Record<
  CardLevel,
  { label: string; textClass: string; bgClass: string; borderClass: string }
> = {
  A: {
    label: 'A — Mutlaqo shart',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
  },
  B: {
    label: 'B — Chuqur bilish',
    textClass: 'text-sky-400',
    bgClass: 'bg-sky-500/10',
    borderClass: 'border-sky-500/30',
  },
  C: {
    label: 'C — Qo‘shimcha',
    textClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
  },
};

const CATEGORY_NAMES: Record<string, string> = {
  definition: 'Ta’rif',
  formula: 'Formula',
  law: 'Fizik Qonun',
  unit: 'SI Birligi',
  constant: 'Fizik Doimiy',
  difference: 'Farqlar',
  mistake: 'Ehtiyot bo‘ling!',
  question: 'Nazorat Savoli',
  fact: 'Muhim Fakt',
};

export const Flashcard3D: React.FC<Flashcard3DProps> = ({
  card,
  isFlipped,
  onFlip,
  isFavorite,
  onToggleFavorite,
  cardIndex,
  totalCards,
}) => {
  const levelInfo = LEVEL_CONFIG[card.level] || LEVEL_CONFIG.A;
  const categoryName = CATEGORY_NAMES[card.category] || 'Fizika';

  const speakText = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean up math markers for speech
      const cleanText = text.replace(/[$]/g, '').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 taqsim $2');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'uz-UZ';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = () => {
    triggerHaptic('light');
    onFlip();
  };

  return (
    <div className="w-full max-w-2xl mx-auto min-h-[420px] sm:min-h-[460px] perspective-1000 select-none cursor-pointer">
      <div
        onClick={handleCardClick}
        className={`flip-card-inner relative w-full min-h-[420px] sm:min-h-[460px] rounded-3xl transition-transform duration-500 ease-out ${
          isFlipped ? 'is-flipped' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* ==================== FRONT OF CARD (SAVOL) ==================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl backface-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 shadow-2xl shadow-indigo-500/5 flex flex-col justify-between p-6 sm:p-8 hover:border-slate-700 transition-colors"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Top metadata bar */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Level Badge */}
              <span
                className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border ${levelInfo.bgClass} ${levelInfo.textClass} ${levelInfo.borderClass}`}
              >
                {levelInfo.label}
              </span>

              {/* Category Badge */}
              <span className="text-[11px] sm:text-xs font-medium px-2.5 py-1 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                {categoryName}
              </span>
            </div>

            {/* Actions: TTS & Favorite */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => speakText(card.question, e)}
                title="Ovoz chiqarib o‘qish"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onToggleFavorite}
                title="Sevimlilarga saqlash"
                className={`p-2 rounded-xl transition-colors ${
                  isFavorite
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
              </button>
            </div>
          </div>

          {/* Topic & Question Body */}
          <div className="my-auto py-6 sm:py-8 text-center flex flex-col items-center justify-center">
            <span className="text-xs uppercase tracking-widest font-bold text-indigo-400/90 mb-3 block">
              {card.topic}
            </span>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100 tracking-tight leading-snug sm:leading-relaxed max-w-xl">
              <MathView text={card.question} />
            </h3>

            {/* Optional formula teaser if exists */}
            {card.formula && (
              <div className="mt-4 px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800 inline-block">
                <MathView math={card.formula} className="text-lg text-indigo-300" />
              </div>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span>{card.sectionTitle}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-500">{card.source_page}-bet</span>
            </div>

            <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
              <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Javobni ko‘rish uchun bosing</span>
            </div>
          </div>
        </div>

        {/* ==================== BACK OF CARD (JAVOB) ==================== */}
        <div
          className="absolute inset-0 w-full h-full rounded-3xl backface-hidden bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border border-indigo-500/40 shadow-2xl shadow-indigo-500/10 flex flex-col justify-between p-6 sm:p-8"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Top metadata bar */}
          <div className="flex items-center justify-between gap-2 border-b border-indigo-500/20 pb-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                JAVOB
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                {card.topic}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <button
                type="button"
                onClick={(e) => speakText(card.answer, e)}
                title="Javobni o‘qib berish"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-500">
                {cardIndex + 1} / {totalCards}
              </span>
            </div>
          </div>

          {/* Answer Content */}
          <div className="my-auto py-4 overflow-y-auto max-h-[290px] sm:max-h-[320px] pr-1">
            {/* Main formula if present */}
            {card.formula && (
              <div className="mb-4 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center shadow-inner">
                <MathView math={card.formula} displayMode={true} className="text-xl sm:text-2xl text-indigo-200" />
              </div>
            )}

            {/* Answer Text */}
            <div className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal whitespace-pre-line text-left">
              <MathView text={card.answer} />
            </div>

            {/* Symbol explanation if present */}
            {card.symbol_explanation && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs sm:text-sm text-slate-300 text-left">
                <div className="font-semibold text-indigo-400 mb-1.5 flex items-center gap-1.5">
                  <span>Belgilarning ma’nosi:</span>
                </div>
                <div className="font-mono text-slate-300 whitespace-pre-line leading-relaxed">
                  <MathView text={card.symbol_explanation} />
                </div>
              </div>
            )}

            {/* SI unit if present */}
            {card.si_unit && (
              <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm text-slate-300 bg-teal-500/10 border border-teal-500/25 px-3 py-1.5 rounded-xl">
                <span className="font-semibold text-teal-400">SI birligi:</span>
                <span className="font-mono font-medium text-teal-200">
                  <MathView text={card.si_unit} />
                </span>
              </div>
            )}
          </div>

          {/* Bottom Card Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-indigo-500/20 text-xs text-slate-400">
            <span className="text-slate-500">PDF: {card.source_page}-bet</span>
            <span className="text-indigo-400 font-medium">Savolga qaytish uchun bosing</span>
          </div>
        </div>
      </div>
    </div>
  );
};
