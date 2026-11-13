import React from 'react';
import {
  Flame,
  Target,
  Search,
  Moon,
  Sun,
  BookOpen,
  LayoutGrid,
  Sigma,
  Clock,
  AlertCircle,
  Star,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { ViewMode, UserStats } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  stats: UserStats;
  dueCount: number;
  mistakesCount: number;
  favoritesCount: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenSearch: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  userName?: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  stats,
  dueCount,
  mistakesCount,
  favoritesCount,
  isDark,
  onToggleTheme,
  onOpenSearch,
  isFullscreen,
  onToggleFullscreen,
  userName,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-900/80 dark:bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <span className="font-extrabold text-white text-lg tracking-tighter">Fz</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">FIZIKA</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">270-sahifalik to‘liq qo‘llanma</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'dashboard'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Asosiy</span>
          </button>

          <button
            onClick={() => onNavigate('sections')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'sections'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Bo‘limlar</span>
          </button>

          <button
            onClick={() => onNavigate('formulas')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'formulas'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sigma className="w-4 h-4" />
            <span>Formulalar</span>
          </button>

          <button
            onClick={() => onNavigate('review')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 relative ${
              currentView === 'review'
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Takrorlash</span>
            {dueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                {dueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('mistakes')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'mistakes'
                ? 'bg-rose-600/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Xatolar</span>
            {mistakesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {mistakesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('favorites')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              currentView === 'favorites'
                ? 'bg-amber-600/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Star className="w-4 h-4 text-amber-400" />
            <span>Sevimli</span>
            {favoritesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {favoritesCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Badges & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Streak Indicator */}
          <div 
            title="Ketma-ket o‘rganish kunlari"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400 animate-pulse" />
            <span>{stats.streak} kun</span>
          </div>

          {/* Daily Goal Badge */}
          <div 
            title={`Bugungi maqsad: ${stats.todayReviewedCount}/${stats.dailyGoal}`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium"
          >
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>{stats.todayReviewedCount}/{stats.dailyGoal}</span>
          </div>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            aria-label="Qidirish"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={onToggleFullscreen}
            aria-label="To‘liq ekran"
            className="hidden sm:flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Mavzuni almashtirish"
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-300" />}
          </button>

          {/* User badge */}
          {userName && (
            <div className="hidden md:flex items-center gap-1.5 pl-1.5 border-l border-slate-800 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="truncate max-w-[100px]">{userName}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
