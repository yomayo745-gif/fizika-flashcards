import React from 'react';
import { Clock, Play, CheckCircle2, Calendar, Sparkles } from 'lucide-react';
import type { Flashcard, CardProgress } from '../types';
import { MathView } from './MathView';

interface ReviewViewProps {
  dueCards: Flashcard[];
  allCards: Flashcard[];
  progressMap: Record<string, CardProgress>;
  onStartStudyWithCards: (cards: Flashcard[], title: string, subtitle?: string) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  dueCards,
  allCards,
  progressMap,
  onStartStudyWithCards,
}) => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Upcoming cards
  const tomorrowCards = allCards.filter((c) => {
    const p = progressMap[c.id];
    if (!p || !p.nextReviewDate) return false;
    return p.nextReviewDate > now && p.nextReviewDate <= now + dayMs;
  });

  const thisWeekCards = allCards.filter((c) => {
    const p = progressMap[c.id];
    if (!p || !p.nextReviewDate) return false;
    return p.nextReviewDate > now + dayMs && p.nextReviewDate <= now + 7 * dayMs;
  });

  const handleStartReview = () => {
    if (dueCards.length === 0) return;
    onStartStudyWithCards(
      dueCards,
      'Spaced Repetition Takrorlash',
      `${dueCards.length} ta kartani xotirada mustahkamlash`
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" />
            <span>Spaced Repetition System (SRS)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Intervalli Takrorlash Navbati
          </h1>
          <p className="text-sm text-slate-400 max-w-xl mt-1">
            Ebbingauz unutish egri chizig‘iga asoslangan ilmiy usul: 1, 3, 7, 14 va 30 kunlik intervallar.
          </p>
        </div>

        {dueCards.length > 0 && (
          <button
            onClick={handleStartReview}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 transition-all flex-shrink-0"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Barchasini takrorlash ({dueCards.length})</span>
          </button>
        )}
      </div>

      {/* SRS Schedule Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Due Today */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Bugun navbati kelgan</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-400">
              {dueCards.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Darhol takrorlash tavsiya etiladi</p>
          </div>
        </div>

        {/* Due Tomorrow */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Ertaga kutilayotgan</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-sky-400">
              {tomorrowCards.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Ertaga avtomatik navbatga chiqadi</p>
          </div>
        </div>

        {/* Due This Week */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
            <span>Shu hafta davomida</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-purple-400">
              {thisWeekCards.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Uzoq muddatli xotiraga o‘tganlar</p>
          </div>
        </div>
      </div>

      {/* Due Cards List */}
      {dueCards.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/60 border border-slate-800">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Bugungi barcha takrorlashlar bajarilgan!
          </h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
            Ajoyib intizom! Yangi kartalarni o‘rganishni davom ettirishingiz yoki istalgan bo‘limni tanlab bilimingizni sinashingiz mumkin.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>Bugun takrorlanadigan kartalar</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
              {dueCards.length} ta
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dueCards.map((card) => {
              const progress = progressMap[card.id];
              return (
                <div
                  key={card.id}
                  onClick={() =>
                    onStartStudyWithCards([card], card.topic, card.sectionTitle)
                  }
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-emerald-400">
                        {card.topic}
                      </span>
                      <span>{card.level}-daraja</span>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors mb-2 line-clamp-2">
                      <MathView text={card.question} />
                    </h3>

                    {card.formula && (
                      <div className="my-2 p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                        <MathView math={card.formula} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-500">
                    <span>Intervallar bosqichi: {progress?.intervalStep ?? 1}</span>
                    <span className="text-emerald-400 font-medium group-hover:underline">
                      Takrorlash →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
