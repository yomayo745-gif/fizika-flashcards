import React, { useState, useMemo } from 'react';
import {
  Sigma,
  Search,
  Play,
  ChevronDown,
} from 'lucide-react';
import type { Flashcard, CardLevel } from '../types';
import { MathView } from './MathView';
import { SECTIONS_DATA } from '../data/sections';

interface FormulaCardsViewProps {
  allCards: Flashcard[];
  onStartStudyWithCards: (cards: Flashcard[], title: string) => void;
}

export const FormulaCardsView: React.FC<FormulaCardsViewProps> = ({
  allCards,
  onStartStudyWithCards,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<number | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<CardLevel | 'ALL'>('ALL');

  // Filter only cards that contain formulas
  const formulaCards = useMemo(() => {
    return allCards.filter(
      (c) => c.formula && c.formula.trim().length > 0
    );
  }, [allCards]);

  // Filter by query, section, level
  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return formulaCards.filter((card) => {
      const matchSection =
        selectedSection === 'ALL' || card.section === selectedSection;
      const matchLevel =
        selectedLevel === 'ALL' || card.level === selectedLevel;

      if (!matchSection || !matchLevel) return false;

      if (!q) return true;

      return (
        card.question.toLowerCase().includes(q) ||
        card.answer.toLowerCase().includes(q) ||
        card.topic.toLowerCase().includes(q) ||
        (card.formula && card.formula.toLowerCase().includes(q)) ||
        (card.symbol_explanation && card.symbol_explanation.toLowerCase().includes(q)) ||
        (card.si_unit && card.si_unit.toLowerCase().includes(q))
      );
    });
  }, [formulaCards, searchQuery, selectedSection, selectedLevel]);

  const handleStudyAllFiltered = () => {
    if (filteredCards.length === 0) return;
    const title =
      selectedSection === 'ALL'
        ? `Formulalar (${filteredCards.length} ta)`
        : `${SECTIONS_DATA.find((s) => s.id === selectedSection)?.shortTitle} Formulalari`;
    onStartStudyWithCards(filteredCards, title);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sigma className="w-4 h-4" />
            <span>Fizika Formulalari Laboratoriyasi</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Formulalar Katalogi ({formulaCards.length} ta)
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Kitobdagi barcha fizik kattaliklar, formulalar, belgilar izohi va SI birliklari chiroyli matematik formatda.
          </p>
        </div>

        {/* Start Study Deck Button */}
        {filteredCards.length > 0 && (
          <button
            onClick={handleStudyAllFiltered}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition-all flex-shrink-0"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Shu formulalarni yodlash ({filteredCards.length})</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6 p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Formula, belgi, mavzu yoki birlik bo‘yicha qidiring (masalan: tezlik, F, N, m/s)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Section Select */}
        <div className="sm:col-span-4 relative">
          <select
            value={selectedSection}
            onChange={(e) =>
              setSelectedSection(
                e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
              )
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-purple-500 appearance-none pr-8 cursor-pointer"
          >
            <option value="ALL">Barcha bo‘limlar ({formulaCards.length})</option>
            {SECTIONS_DATA.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.title}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Level Select */}
        <div className="sm:col-span-2 relative">
          <select
            value={selectedLevel}
            onChange={(e) =>
              setSelectedLevel(e.target.value as CardLevel | 'ALL')
            }
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-purple-500 appearance-none pr-8 cursor-pointer"
          >
            <option value="ALL">Barcha daraja</option>
            <option value="A">A — Shart</option>
            <option value="B">B — Chuqur</option>
            <option value="C">C — Qo‘shimcha</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Formula Cards Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Sigma className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <p className="text-base font-semibold text-slate-300">
            Hech qanday formula topilmadi
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Qidiruv so‘zini o‘zgartirib yoki filtrlarni tozalab ko‘ring.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCards.map((card) => {
            const isLevelA = card.level === 'A';
            const isLevelB = card.level === 'B';

            return (
              <div
                key={card.id}
                className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        isLevelA
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          : isLevelB
                          ? 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/25'
                      }`}
                    >
                      {card.level}-daraja
                    </span>

                    <span className="text-xs text-slate-400 truncate max-w-[150px]">
                      {card.topic}
                    </span>
                  </div>

                  {/* Question / Formula Name */}
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 leading-snug">
                    <MathView text={card.question} />
                  </h3>

                  {/* Main Formula Render */}
                  {card.formula && (
                    <div className="my-3 p-4 rounded-2xl bg-slate-950/90 border border-purple-500/20 text-center shadow-inner group-hover:border-purple-500/40 transition-colors">
                      <MathView
                        math={card.formula}
                        displayMode={true}
                        className="text-xl sm:text-2xl text-purple-200"
                      />
                    </div>
                  )}

                  {/* Variable breakdown */}
                  {card.symbol_explanation && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
                      <strong className="text-purple-400 block mb-1">
                        Belgilar izohi:
                      </strong>
                      <div className="font-mono text-slate-300 whitespace-pre-line">
                        <MathView text={card.symbol_explanation} />
                      </div>
                    </div>
                  )}

                  {/* SI Unit */}
                  {card.si_unit && (
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-teal-300 bg-teal-500/10 border border-teal-500/25 px-2.5 py-1 rounded-lg">
                      <span className="font-semibold text-teal-400">SI:</span>
                      <span className="font-mono font-medium">
                        <MathView text={card.si_unit} />
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span>{card.source_page}-bet</span>
                  <button
                    onClick={() =>
                      onStartStudyWithCards([card], card.topic || 'Formula')
                    }
                    className="text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1 group-hover:underline"
                  >
                    <span>Yodlash</span>
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
