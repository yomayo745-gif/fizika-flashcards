import React from 'react';
import {
  Play,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  Star,
  ChevronRight,
  TrendingUp,
  Brain,
  Zap,
} from 'lucide-react';
import type { Flashcard, CardProgress, UserStats } from '../types';
import { SECTIONS_DATA } from '../data/sections';

interface DashboardViewProps {
  allCards: Flashcard[];
  progressMap: Record<string, CardProgress>;
  stats: UserStats;
  dueCards: Flashcard[];
  mistakeCards: Flashcard[];
  favoriteCards: Flashcard[];
  onStartStudy: (cards: Flashcard[], title: string, subtitle?: string) => void;
  onNavigateSections: () => void;
  onNavigateFormulas: () => void;
  userName?: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  allCards,
  progressMap,
  stats,
  dueCards,
  mistakeCards,
  favoriteCards,
  onStartStudy,
  onNavigateSections,
  onNavigateFormulas,
  userName,
}) => {
  const totalCards = allCards.length;
  const progressList = Object.values(progressMap);

  const masteredCount = progressList.filter((p) => p.status === 'mastered').length;
  const learningCount = progressList.filter((p) => p.status === 'learning').length;
  const unlearnedCount = Math.max(0, totalCards - masteredCount - learningCount);
  const masteryPercentage = Math.round((masteredCount / totalCards) * 100);

  // Level A cards
  const levelACards = allCards.filter((c) => c.level === 'A');

  // Quick continue study handler
  const handleContinueStudy = () => {
    if (dueCards.length > 0) {
      onStartStudy(dueCards, 'Takrorlash vaqti kelgan kartalar', 'Spaced Repetition navbati');
      return;
    }

    // Otherwise unlearned cards or random batch
    const unlearned = allCards.filter((c) => !progressMap[c.id]);
    const batch = unlearned.length > 0 ? unlearned.slice(0, 20) : allCards.slice(0, 20);
    onStartStudy(batch, 'O‘rganishni davom ettirish', 'Bugungi yangi kartalar');
  };

  const handleStudyLevelA = () => {
    onStartStudy(levelACards, 'A Daraja — Mutlaqo Yodlash Shart', 'Eng muhim bazaviy tushunchalar');
  };

  const handleStudyRandom = () => {
    const shuffled = [...allCards].sort(() => Math.random() - 0.5).slice(0, 25);
    onStartStudy(shuffled, 'Tasodifiy 25 ta Karta', 'Aralash sinov rejimi');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 p-6 sm:p-8 mb-8 shadow-2xl shadow-indigo-500/10">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>270-sahifalik «FIZIKA» qo‘llanmasi</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold w-fit">
              <span>🔥 {stats.streak} kunlik streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold w-fit">
              <span>Bugun: {stats.todayReviewedCount}/{stats.dailyGoal}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2">
            Salom{userName ? `, ${userName}` : ''}! Fizikani mukammal yodlaymiz.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">
            Spaced Repetition tizimi, 3D interaktiv kartalar va to‘liq 870+ ta'rif, formula va qonunlar bilan ilmiy asosda yod oling.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleContinueStudy}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/25 transition-all transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>O‘rganishni davom ettirish</span>
            </button>

            {dueCards.length > 0 && (
              <button
                onClick={() =>
                  onStartStudy(dueCards, 'Takrorlash Navbati', 'Bugun takrorlash shart')
                }
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-sm transition-all"
              >
                <Clock className="w-4 h-4" />
                <span>Takrorlash ({dueCards.length})</span>
              </button>
            )}

            <button
              onClick={handleStudyLevelA}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-semibold text-sm transition-all"
            >
              <span>A Daraja ({levelACards.length})</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {/* Total Cards */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Jami Kartalar</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {totalCards}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">{unlearnedCount} ta yangi karta</p>
          </div>
        </div>

        {/* Learned / Mastered */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">O‘rganilgan</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              {masteredCount}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              +{learningCount} ta o‘rganilmoqda
            </p>
          </div>
        </div>

        {/* SRS Due Reviews */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Takrorlash Vaqti</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {dueCards.length}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {dueCards.length > 0 ? 'Bugun takrorlash kutilmoqda' : 'Barchasi takrorlangan'}
            </p>
          </div>
        </div>

        {/* Mastery Percentage */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Umumiy O‘zlashtirish</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">
              {masteryPercentage}%
            </div>
            {/* mini progress bar */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400"
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Mode Launchers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <button
          onClick={handleStudyRandom}
          className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
        >
          <Brain className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-semibold text-white">Tasodifiy Test</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">25 ta aralash karta</p>
        </button>

        <button
          onClick={() =>
            mistakeCards.length > 0
              ? onStartStudy(mistakeCards, 'Xatolar ustida ishlash', 'Noto‘g‘ri javob berilgan kartalar')
              : alert('Hozircha xato qilingan kartalar yo‘q!')
          }
          className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-rose-500/40 text-left transition-all group"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-semibold text-white">Xatolar Mode</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {mistakeCards.length} ta xato karta
          </p>
        </button>

        <button
          onClick={() =>
            favoriteCards.length > 0
              ? onStartStudy(favoriteCards, 'Sevimli Kartalar', 'Yulduzcha qo‘yilganlar')
              : alert('Hozircha sevimli kartalar yo‘q! Karta ustidagi yulduzchani bosing.')
          }
          className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-left transition-all group"
        >
          <Star className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-semibold text-white">Sevimli Kartalar</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {favoriteCards.length} ta saqlangan
          </p>
        </button>

        <button
          onClick={onNavigateFormulas}
          className="p-4 rounded-2xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-purple-500/40 text-left transition-all group"
        >
          <Zap className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
          <h4 className="text-sm font-semibold text-white">Formulalar</h4>
          <p className="text-[11px] text-slate-400 mt-0.5">420+ ta formula katalogi</p>
        </button>
      </div>

      {/* Top Sections Overview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Bo‘limlar bo‘yicha o‘zlashtirish
            </h2>
            <p className="text-xs text-slate-400">
              12 ta bo‘limning joriy holati
            </p>
          </div>
          <button
            onClick={onNavigateSections}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Barchasini ko‘rish</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 6 primary section quick-cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS_DATA.slice(0, 6).map((section) => {
            const sectionCards = allCards.filter((c) => c.section === section.id);
            const total = sectionCards.length;
            const mastered = sectionCards.filter(
              (c) => progressMap[c.id]?.status === 'mastered'
            ).length;
            const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;

            return (
              <div
                key={section.id}
                onClick={() =>
                  onStartStudy(sectionCards, section.title, section.description)
                }
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold text-indigo-400">
                      Bo‘lim {section.id}
                    </span>
                    <span>{total} karta</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-3 line-clamp-1">
                    {section.shortTitle}
                  </h3>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Progress ({mastered}/{total})</span>
                    <span className="font-semibold text-slate-200">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
