import React from 'react';
import {
  Compass,
  Cog,
  Flame,
  Zap,
  Activity,
  Eye,
  Atom,
  Telescope,
  Sigma,
  Ruler,
  Scale,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SECTIONS_DATA } from '../data/sections';
import type { Flashcard, CardProgress } from '../types';

interface SectionsViewProps {
  allCards: Flashcard[];
  progressMap: Record<string, CardProgress>;
  onSelectSection: (sectionId: number) => void;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  Cog,
  Flame,
  Zap,
  Activity,
  Eye,
  Atom,
  Telescope,
  Sigma,
  Ruler,
  Scale,
  CheckCircle2,
};

export const SectionsView: React.FC<SectionsViewProps> = ({
  allCards,
  progressMap,
  onSelectSection,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Fizika Kursi Mundarijasi</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          12 ta Asosiy Bo‘lim
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mt-1">
          270 sahifalik kitobdagi barcha mavzular 12 ta tizimli bo‘limga ajratilgan. Istalgan bo‘limni tanlab yodlashni boshlang.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SECTIONS_DATA.map((section) => {
          const sectionCards = allCards.filter((c) => c.section === section.id);
          const totalCards = sectionCards.length;

          // Breakdown by level
          const countA = sectionCards.filter((c) => c.level === 'A').length;
          const countB = sectionCards.filter((c) => c.level === 'B').length;
          const countC = sectionCards.filter((c) => c.level === 'C').length;

          // Mastered cards
          const masteredCount = sectionCards.filter(
            (c) => progressMap[c.id]?.status === 'mastered'
          ).length;
          const percent = totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;

          const IconComponent = ICON_MAP[section.iconName] || Compass;

          return (
            <div
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className="group relative rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden"
            >
              {/* Background soft glow gradient */}
              <div
                className={`absolute top-0 right-0 w-44 h-44 bg-gradient-to-br ${section.bgGradient} rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
              />

              <div>
                {/* Icon & ID */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:border-indigo-500/40 transition-all">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    № {section.id.toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white tracking-tight mb-2 group-hover:text-indigo-300 transition-colors">
                  {section.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {section.description}
                </p>
              </div>

              <div>
                {/* Level badges breakdown */}
                <div className="flex items-center gap-2 mb-4 text-[11px] font-medium">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-400">
                    A: {countA}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/25 text-sky-400">
                    B: {countB}
                  </span>
                  {countC > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/25 text-purple-400">
                      C: {countC}
                    </span>
                  )}
                  <span className="ml-auto text-slate-400 font-semibold">
                    {totalCards} karta
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>O‘zlashtirish</span>
                    <span className="font-semibold text-slate-300">{percent}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <button
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 group-hover:bg-indigo-600 text-slate-200 group-hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Bo‘limni o‘rganish</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
