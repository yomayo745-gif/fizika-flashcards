import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  X,
  Play,
  ArrowRight,
} from 'lucide-react';
import type { Flashcard, CardLevel, CardCategory } from '../types';
import { MathView } from './MathView';
import { SECTIONS_DATA } from '../data/sections';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  allCards: Flashcard[];
  onStartStudyWithCards: (cards: Flashcard[], title: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  allCards,
  onStartStudyWithCards,
}) => {
  const [query, setQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<number | 'ALL'>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<CardLevel | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'ALL'>('ALL');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredCards = useMemo(() => {
    const q = query.toLowerCase().trim();

    return allCards.filter((card) => {
      if (selectedSection !== 'ALL' && card.section !== selectedSection) return false;
      if (selectedLevel !== 'ALL' && card.level !== selectedLevel) return false;
      if (selectedCategory !== 'ALL' && card.category !== selectedCategory) return false;

      if (!q) return true;

      return (
        card.question.toLowerCase().includes(q) ||
        card.answer.toLowerCase().includes(q) ||
        card.topic.toLowerCase().includes(q) ||
        card.sectionTitle.toLowerCase().includes(q) ||
        (card.formula && card.formula.toLowerCase().includes(q)) ||
        (card.symbol_explanation && card.symbol_explanation.toLowerCase().includes(q)) ||
        (card.si_unit && card.si_unit.toLowerCase().includes(q))
      );
    });
  }, [allCards, query, selectedSection, selectedLevel, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-base sm:text-lg">
              <Search className="w-5 h-5" />
              <span>Kartalar Qidiruvi ({allCards.length} ta)</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Yopish"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Savol, javob, formula, mavzu yoki fizik atama bo‘yicha qidiring..."
              className="w-full pl-12 pr-10 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Multi-Filters Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Section filter */}
            <select
              value={selectedSection}
              onChange={(e) =>
                setSelectedSection(
                  e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                )
              }
              aria-label="Bo‘lim bo‘yicha filtr"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Barcha bo‘limlar</option>
              {SECTIONS_DATA.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            {/* Level filter */}
            <select
              value={selectedLevel}
              onChange={(e) =>
                setSelectedLevel(e.target.value as CardLevel | 'ALL')
              }
              aria-label="Daraja bo‘yicha filtr"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Barcha daraja</option>
              <option value="A">A — Shart</option>
              <option value="B">B — Chuqur</option>
              <option value="C">C — Qo‘shimcha</option>
            </select>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as CardCategory | 'ALL')
              }
              aria-label="Kategoriya bo‘yicha filtr"
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Barcha turlar</option>
              <option value="definition">Ta’riflar</option>
              <option value="formula">Formulalar</option>
              <option value="law">Qonunlar</option>
              <option value="unit">SI birliklari</option>
              <option value="constant">Doimiylar</option>
              <option value="difference">Farqlar</option>
              <option value="mistake">Xatolar</option>
              <option value="question">Nazorat savollari</option>
            </select>

            {filteredCards.length > 0 && (
              <button
                onClick={() => {
                  onClose();
                  onStartStudyWithCards(
                    filteredCards,
                    `Qidiruv natijalari (${filteredCards.length} ta)`
                  );
                }}
                className="ml-auto px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Natijalarni yodlash ({filteredCards.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredCards.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">
                Hech qanday karta topilmadi
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Boshqa kalit so‘z yoki filtrlarni sinab ko‘ring.
              </p>
            </div>
          ) : (
            filteredCards.slice(0, 50).map((card) => (
              <div
                key={card.id}
                onClick={() => {
                  onClose();
                  onStartStudyWithCards([card], `${card.topic} (${card.sectionTitle})`);
                }}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-400">
                    <span className="font-semibold text-indigo-400">
                      {card.topic}
                    </span>
                    <span>•</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        card.level === 'A'
                          ? 'bg-amber-500/20 text-amber-300'
                          : card.level === 'B'
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}
                    >
                      {card.level}-daraja
                    </span>
                    <span>•</span>
                    <span>{card.source_page}-bet</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors mb-1">
                    <MathView text={card.question} />
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-1">
                    <MathView text={card.answer} />
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {card.formula && (
                    <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-indigo-300">
                      <MathView math={card.formula} />
                    </div>
                  )}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          )}

          {filteredCards.length > 50 && (
            <div className="text-center py-3 text-xs text-slate-500 font-mono">
              + yana {filteredCards.length - 50} ta karta mavjud...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
