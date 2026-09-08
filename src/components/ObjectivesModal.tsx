import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Circle,
  Compass,
  Search,
  Shield,
  BookOpen,
  Footprints,
  Flame,
  Ghost,
  Package,
  Clock,
  X,
  Sparkles,
} from 'lucide-react';
import { GameObjective, ObjectiveCategory } from '../game/objectivesData';
import { objectivesManager } from '../game/objectivesManager';
import { horrorAudio } from '../audio/horrorAudio';

interface ObjectivesModalProps {
  objectives?: GameObjective[];
  onClose: () => void;
}

export const ObjectivesModal: React.FC<ObjectivesModalProps> = ({ objectives: propObjectives, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<ObjectiveCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const objectives = useMemo(() => {
    return propObjectives && propObjectives.length > 0
      ? propObjectives
      : objectivesManager.getObjectives() || [];
  }, [propObjectives]);

  const completedCount = useMemo(() => (objectives || []).filter((o) => o.completed).length, [objectives]);
  const totalCount = (objectives || []).length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredObjectives = useMemo(() => {
    return (objectives || []).filter((obj) => {
      if (activeCategory !== 'ALL' && obj.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return obj.title.toLowerCase().includes(q) || obj.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [objectives, activeCategory, searchQuery]);

  const categories: { id: ObjectiveCategory | 'ALL'; label: string; icon: React.ReactNode }[] = [
    { id: 'ALL', label: 'ALL MISSIONS', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { id: 'STORY', label: 'MAIN DIRECTIVES', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { id: 'EXPLORATION', label: 'EXPLORATION', icon: <Compass className="h-3.5 w-3.5" /> },
    { id: 'SURVIVAL', label: 'VITALS & THERMAL', icon: <Flame className="h-3.5 w-3.5" /> },
    { id: 'STEALTH', label: 'STEALTH & BEAST', icon: <Ghost className="h-3.5 w-3.5" /> },
    { id: 'SCAVENGING', label: 'SCAVENGING', icon: <Package className="h-3.5 w-3.5" /> },
    { id: 'ENDURANCE', label: 'ENDURANCE', icon: <Clock className="h-3.5 w-3.5" /> },
  ];

  return (
    <div
      id="objectives-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none font-mono text-white animate-fadeIn"
    >
      <div className="max-w-3xl w-full max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-7 flex flex-col space-y-4 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-wider text-zinc-100 uppercase">
                SURVIVAL DOSSIER & DIRECTIVES
              </h2>
              <div className="text-[11px] text-zinc-400 font-sans">
                {completedCount} of {totalCount} Objectives Completed ({percentComplete}%)
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              horrorAudio.playMenuSelect();
              onClose();
            }}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search objectives..."
              className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Categories scrollable pill row */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 border-b border-zinc-800/80 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                horrorAudio.playMenuHover();
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800/60'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Objectives Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[220px]">
          {filteredObjectives.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No objectives matching your search criteria.
            </div>
          ) : (
            filteredObjectives.map((obj) => {
              const isDone = obj.completed;
              const hasProgress = obj.target > 1;
              const progressPct = Math.min(100, Math.round((obj.current / obj.target) * 100));

              return (
                <div
                  key={obj.id}
                  className={`p-3 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isDone
                      ? 'bg-emerald-950/20 border-emerald-600/40 text-zinc-200'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold tracking-wide truncate ${
                          isDone ? 'text-emerald-300 line-through' : 'text-zinc-100'
                        }`}
                      >
                        {obj.title}
                      </h4>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                          isDone
                            ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-500/40'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {isDone ? 'COMPLETED' : hasProgress ? `${obj.current}/${obj.target}` : 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      {obj.description}
                    </p>

                    {hasProgress && !isDone && (
                      <div className="pt-1">
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
