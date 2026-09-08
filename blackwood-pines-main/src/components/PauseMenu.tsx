import React from 'react';
import { Play, RotateCcw, Volume2, Sliders, X, Home, BookOpen, MapPin, Compass, Save, Download, CheckSquare } from 'lucide-react';
import { Chapter, GameSettings } from '../types';
import { horrorAudio } from '../audio/horrorAudio';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onSaveExpedition?: () => void;
  onLoadExpedition?: () => void;
  onOpenObjectives?: () => void;
  currentChapter?: Chapter;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  onSaveExpedition,
  onLoadExpedition,
  onOpenObjectives,
  currentChapter,
  settings,
  onUpdateSettings,
}) => {
  const handleHover = () => {
    horrorAudio.playMenuHover();
  };

  const handleResume = () => {
    horrorAudio.playMenuSelect();
    onResume();
  };

  const handleRestart = () => {
    horrorAudio.playMenuSelect();
    onRestart();
  };

  const handleMainMenu = () => {
    horrorAudio.playMenuSelect();
    onMainMenu();
  };

  return (
    <div
      id="pause-menu"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md select-none font-mono text-white p-4 animate-fade-in"
    >
      <div className="max-w-lg w-full max-h-[calc(100vh-2rem)] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-6 shadow-2xl">
        {/* Header with Title & Close */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
            <h2 className="text-xl font-bold tracking-wider text-zinc-100 uppercase">
              OPERATION PAUSED
            </h2>
          </div>
          <button
            id="close-pause-btn"
            onClick={handleResume}
            onMouseEnter={handleHover}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Chapter Intel Card */}
        {currentChapter && (
          <div className="pause-chapter-intel bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 tracking-wider uppercase">
                <BookOpen className="h-3.5 w-3.5" />
                <span>{currentChapter.numberString}</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-sans tracking-wide">
                ACTIVE PROGRESSION
              </span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-wide">
              {currentChapter.title}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-sans">
              <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
              <span>{currentChapter.location}</span>
            </div>
            <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-300 font-sans">
              <strong className="text-emerald-300 font-mono text-[10px] uppercase">DIRECTIVE: </strong>
              {currentChapter.objective}
            </div>
          </div>
        )}

        {currentChapter && (
          <div className="mobile-pause-objectives border border-emerald-700/60 bg-emerald-950/30 p-4 rounded-xl space-y-2">
            <div className="text-[10px] font-bold tracking-[0.2em] text-emerald-400 uppercase">
              Current Objectives
            </div>
            <div className="text-sm font-bold text-zinc-100">{currentChapter.title}</div>
            <div className="border-t border-emerald-900/70 pt-2 text-xs leading-relaxed text-emerald-100/80">
              {currentChapter.objective}
            </div>
          </div>
        )}

        {/* Expeditions Quick Save, Load, & Objectives Dossier */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {onSaveExpedition && (
            <button
              id="pause-save-btn"
              onClick={() => {
                horrorAudio.playMenuSelect();
                onSaveExpedition();
              }}
              onMouseEnter={handleHover}
              className="flex items-center justify-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>SAVE EXPEDITION</span>
            </button>
          )}

          {onLoadExpedition && (
            <button
              id="pause-load-btn"
              onClick={() => {
                horrorAudio.playMenuSelect();
                onLoadExpedition();
              }}
              onMouseEnter={handleHover}
              className="flex items-center justify-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-sky-500/40 text-sky-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>LOAD CODE</span>
            </button>
          )}

          {onOpenObjectives && (
            <button
              id="pause-objectives-btn"
              onClick={() => {
                horrorAudio.playMenuSelect();
                onOpenObjectives();
              }}
              onMouseEnter={handleHover}
              className="flex items-center justify-center gap-2 p-2.5 bg-zinc-900 hover:bg-zinc-800 border border-amber-500/40 text-amber-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <CheckSquare className="h-4 w-4" />
              <span>100+ OBJECTIVES</span>
            </button>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2.5">
          <button
            id="resume-btn"
            onClick={handleResume}
            onMouseEnter={handleHover}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-sm tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>RESUME EXPEDITION</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="restart-btn"
              onClick={handleRestart}
              onMouseEnter={handleHover}
              className="flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                <span>RESTART</span>
            </button>

            {/* Menu Button as Requested */}
            <button
              id="menu-btn"
              onClick={handleMainMenu}
              onMouseEnter={handleHover}
              className="flex items-center justify-center gap-2 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              <Home className="h-3.5 w-3.5 text-emerald-400" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>

        {/* Tactical Quick Settings */}
        <div className="pause-settings space-y-3.5 pt-3 border-t border-zinc-900">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold uppercase tracking-wider">
            <Sliders className="h-3.5 w-3.5 text-emerald-400" />
            <span>FIELD CALIBRATION</span>
          </div>

          {/* Look Sensitivity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>LOOK SENSITIVITY</span>
              <span className="text-emerald-400 font-bold">{settings.mouseSensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={settings.mouseSensitivity}
              onChange={(e) => onUpdateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Field of View (FOV) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>FIELD OF VIEW (FOV)</span>
              <span className="text-emerald-400 font-bold">{settings.fov || 75}°</span>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              step="1"
              value={settings.fov || 75}
              onChange={(e) => onUpdateSettings({ fov: parseInt(e.target.value, 10) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Master Audio Volume */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-400">
              <span>MASTER VOLUME</span>
              <span className="text-emerald-400 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value), masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Toggles Row */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400 text-[11px]">HEAD BOB</span>
              <button
                onClick={() => onUpdateSettings({ headBobbing: !settings.headBobbing })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  settings.headBobbing
                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-500'
                }`}
              >
                {settings.headBobbing ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-400 text-[11px]">FILM GRAIN</span>
              <button
                onClick={() => onUpdateSettings({ filmGrain: !settings.filmGrain })}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  settings.filmGrain
                    ? 'bg-emerald-950 border border-emerald-600 text-emerald-300'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-500'
                }`}
              >
                {settings.filmGrain ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Controls Cheatsheet */}
        <div className="pause-cheatsheet text-[10px] text-zinc-400 space-y-1 pt-2 border-t border-zinc-900 bg-zinc-900/40 p-2.5 rounded-xl">
          <p className="font-bold text-zinc-300 text-[11px] mb-1">🎮 CONTROLS REFERENCE</p>
          <p><strong className="text-emerald-400">PC:</strong> [WASD] Move • [Mouse] Look • [E] Interact • [F] Flashlight • [Shift] Sprint • [C] Crouch • [M] Map • [X] Flare • [G] Bottle</p>
          <p><strong className="text-emerald-400">Gamepad:</strong> [Left Stick] Move • [Right Stick] Look • [A] Interact • [Y] Light • [RT] Sprint • [LT] Breath • [B] Crouch • [LB] Bottle • [RB] Flare • [D-Pad Up] Map</p>
        </div>
      </div>
    </div>
  );
};
