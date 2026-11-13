import React from 'react';
import {
  Search,
  Shuffle,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  ChevronDown,
} from 'lucide-react';
import type { CardLevel, CardCategory } from '../types';
import { SECTIONS_DATA } from '../data/sections';

export interface HeaderSwitcherProps {
  selectedSection: number | 'ALL' | 'FAVORITES' | 'FORMULAS';
  onSelectSection: (section: number | 'ALL' | 'FAVORITES' | 'FORMULAS') => void;
  selectedLevel: CardLevel | 'ALL';
  onSelectLevel: (level: CardLevel | 'ALL') => void;
  selectedCategory: CardCategory | 'ALL';
  onSelectCategory: (cat: CardCategory | 'ALL') => void;
  isShuffled: boolean;
  onToggleShuffle: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSearch: () => void;
  totalCardsCount: number;
  filteredCount: number;
  favoritesCount: number;
}

export const HeaderSwitcher: React.FC<HeaderSwitcherProps> = ({
  selectedSection,
  onSelectSection,
  selectedLevel,
  onSelectLevel,
  selectedCategory,
  onSelectCategory,
  isShuffled,
  onToggleShuffle,
  isDark,
  onToggleTheme,
  isFullscreen,
  onToggleFullscreen,
  onOpenSearch,
  totalCardsCount,
  filteredCount,
  favoritesCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/90 dark:bg-slate-950/90 border-b border-slate-800/80 transition-colors">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5">
        {/* Top Brand & Quick Actions Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          {/* Logo & Counter Badge */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <span className="font-black text-white text-base tracking-tighter">Fz</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg text-slate-100 tracking-tight">
                  FIZIKA
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                  FLASHCARDS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                270 sahifa • Jami {totalCardsCount} ta karta
              </p>
            </div>
          </div>

          {/* Action icons */}
          <div className="flex items-center gap-1.5">
            {/* Shuffle toggle */}
            <button
              onClick={onToggleShuffle}
              title={isShuffled ? 'Tasodifiy tartib o‘chirish' : 'Tasodifiy tartibda aralashtirish'}
              className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1 transition-all ${
                isShuffled
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Shuffle className="w-4 h-4" />
              <span className="hidden sm:inline">Tasodifiy</span>
            </button>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              aria-label="Qidirish"
              title="Kartalarni qidirish"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={onToggleFullscreen}
              aria-label="To‘liq ekran"
              title="To‘liq ekran rejimi"
              className="hidden sm:flex p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Dark/Light mode */}
            <button
              onClick={onToggleTheme}
              aria-label="Mavzuni almashtirish"
              title="Kunduzgi / Tungi rejim"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
            </button>
          </div>
        </div>

        {/* Section Selector & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Main Section Dropdown (Ro‘yxatlarni almashtirish) */}
          <div className="sm:col-span-6 relative">
            <select
              value={selectedSection}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'ALL' || val === 'FAVORITES' || val === 'FORMULAS') {
                  onSelectSection(val);
                } else {
                  onSelectSection(Number(val));
                }
              }}
              aria-label="Bo‘limni tanlang"
              className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer hover:border-slate-700 transition-colors"
            >
              <option value="ALL">📚 Barcha 12 ta bo‘lim (877 ta karta)</option>
              <option value="FORMULAS">⚡ Barcha Formulalar (438 ta)</option>
              {favoritesCount > 0 && (
                <option value="FAVORITES">⭐ Sevimli kartalar ({favoritesCount} ta)</option>
              )}
              <optgroup label="Kitob Bo‘limlari">
                {SECTIONS_DATA.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Level Filter Pills (A, B, C, Hammasi) */}
          <div className="sm:col-span-6 flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              onClick={() => onSelectLevel('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevel === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Barcha daraja
            </button>

            <button
              onClick={() => onSelectLevel('A')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevel === 'A'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-900 text-amber-400/90 hover:text-amber-300 border border-slate-800'
              }`}
            >
              A — Shart (535)
            </button>

            <button
              onClick={() => onSelectLevel('B')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevel === 'B'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-900 text-sky-400/90 hover:text-sky-300 border border-slate-800'
              }`}
            >
              B — Chuqur (275)
            </button>

            <button
              onClick={() => onSelectLevel('C')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedLevel === 'C'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-900 text-purple-400/90 hover:text-purple-300 border border-slate-800'
              }`}
            >
              C — Qo‘shimcha (67)
            </button>
          </div>
        </div>

        {/* Category Pills (Optional fast filter) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 text-[11px] font-medium text-slate-400 scrollbar-none">
          <span className="text-slate-500 text-[10px] uppercase font-bold pr-1">Tur:</span>
          {[
            { id: 'ALL', label: 'Barchasi' },
            { id: 'definition', label: 'Ta’riflar' },
            { id: 'formula', label: 'Formulalar' },
            { id: 'law', label: 'Qonunlar' },
            { id: 'unit', label: 'SI Birliklari' },
            { id: 'difference', label: 'Farqlar' },
            { id: 'mistake', label: 'Xatolar' },
            { id: 'question', label: 'Savollar' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as CardCategory | 'ALL')}
              className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-indigo-400 font-bold border border-indigo-500/30'
                  : 'hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-slate-500 font-mono text-[11px]">
            {filteredCount} ta
          </span>
        </div>
      </div>
    </header>
  );
};
