import React from 'react';
import { AlertCircle, Star, Play, ArrowRight } from 'lucide-react';
import type { Flashcard, CardProgress } from '../types';
import { MathView } from './MathView';

interface CardListViewProps {
  type: 'mistakes' | 'favorites';
  cards: Flashcard[];
  progressMap: Record<string, CardProgress>;
  onStartStudyWithCards: (cards: Flashcard[], title: string, subtitle?: string) => void;
  onCardClick: (card: Flashcard) => void;
}

export const CardListView: React.FC<CardListViewProps> = ({
  type,
  cards,
  progressMap,
  onStartStudyWithCards,
  onCardClick,
}) => {
  const isMistakes = type === 'mistakes';

  const title = isMistakes ? 'Xatolar Ustida Ishlash' : 'Sevimli Kartalar';
  const description = isMistakes
    ? 'Oldin takrorlashda noto‘g‘ri javob berilgan kartalar to‘plami. Ularni qayta o‘rganib 100% natijaga erishing.'
    : 'Siz yulduzcha bilan belgilab olgan va alohida e’tibor qaratmoqchi bo‘lgan maxsus kartalaringiz.';

  const handleStartStudy = () => {
    if (cards.length === 0) return;
    onStartStudyWithCards(cards, title, `${cards.length} ta karta`);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div
            className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider mb-1 ${
              isMistakes ? 'text-rose-400' : 'text-amber-400'
            }`}
          >
            {isMistakes ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Star className="w-4 h-4" />
            )}
            <span>{isMistakes ? 'Xatolar Rejimi' : 'Shaxsiy To‘plam'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {title} ({cards.length} ta)
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {cards.length > 0 && (
          <button
            onClick={handleStartStudy}
            className={`flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm shadow-xl transition-all flex-shrink-0 ${
              isMistakes
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            <Play className={`w-4 h-4 ${isMistakes ? 'fill-white' : 'fill-slate-950'}`} />
            <span>Shu kartalarni o‘rganish ({cards.length})</span>
          </button>
        )}
      </div>

      {/* Cards List or Empty state */}
      {cards.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div
            className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border ${
              isMistakes
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
            }`}
          >
            {isMistakes ? (
              <AlertCircle className="w-8 h-8" />
            ) : (
              <Star className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {isMistakes
              ? 'Ajoyib! Hech qanday xato karta yo‘q'
              : 'Hozircha sevimli kartalar qo‘shilmagan'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            {isMistakes
              ? 'Siz barcha savollarga to‘g‘ri javob bergansiz yoki hali takrorlashda xatolik qayd etilmagan.'
              : 'Kartalarni o‘rganayotganda burchakdagi yulduzcha belgisini bossangiz, ular bu yerda saqlanadi.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cards.map((card) => {
            const progress = progressMap[card.id];
            return (
              <div
                key={card.id}
                onClick={() => onCardClick(card)}
                className={`p-5 rounded-2xl bg-slate-900/80 border transition-all cursor-pointer group flex flex-col justify-between ${
                  isMistakes
                    ? 'border-slate-800 hover:border-rose-500/40'
                    : 'border-slate-800 hover:border-amber-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span
                      className={`font-semibold ${
                        isMistakes ? 'text-rose-400' : 'text-amber-400'
                      }`}
                    >
                      {card.topic}
                    </span>
                    <span>{card.level}-daraja</span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors mb-2 line-clamp-2">
                    <MathView text={card.question} />
                  </h3>

                  {card.formula && (
                    <div className="my-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <MathView math={card.formula} />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-500">
                  <span>
                    {isMistakes
                      ? `Xatolar soni: ${progress?.mistakesCount || 1}`
                      : `${card.sectionTitle} • ${card.source_page}-bet`}
                  </span>
                  <span
                    className={`font-medium group-hover:underline flex items-center gap-1 ${
                      isMistakes ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    <span>Yodlash</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
