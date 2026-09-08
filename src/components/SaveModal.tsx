import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Copy, Check, X, ShieldAlert, Sparkles, Play } from 'lucide-react';
import { SaveData, exportSaveCode, importSaveCode, loadFromLocalStorage } from '../game/saveSystem';
import { horrorAudio } from '../audio/horrorAudio';

interface SaveModalProps {
  mode?: 'SAVE' | 'LOAD' | 'save' | 'load';
  currentSaveData?: SaveData;
  onSaveRequested?: () => SaveData;
  onLoadSave?: (data: SaveData) => void;
  onLoadRequested?: (data: SaveData) => void;
  onClose: () => void;
}

export const SaveModal: React.FC<SaveModalProps> = ({
  mode = 'SAVE',
  currentSaveData,
  onSaveRequested,
  onLoadSave,
  onLoadRequested,
  onClose,
}) => {
  const isLoadInitial = String(mode).toUpperCase() === 'LOAD';
  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>(isLoadInitial ? 'IMPORT' : 'EXPORT');
  const [saveCode, setSaveCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasAutoSave, setHasAutoSave] = useState<boolean>(false);
  const [activeData, setActiveData] = useState<SaveData | undefined>(currentSaveData);

  useEffect(() => {
    let data = currentSaveData;
    if (!data && onSaveRequested) {
      try {
        data = onSaveRequested();
      } catch {}
    }
    setActiveData(data);
    if (data) {
      const code = exportSaveCode(data);
      setSaveCode(code);
    }
    const auto = loadFromLocalStorage();
    setHasAutoSave(Boolean(auto));
  }, [currentSaveData, onSaveRequested]);

  const handleCopy = async () => {
    if (!saveCode) return;
    try {
      await navigator.clipboard.writeText(saveCode);
      setCopied(true);
      horrorAudio.playSaveSound();
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setErrorMsg('Could not auto-copy. Please manually select and copy the code text.');
    }
  };

  const handleApplyImport = () => {
    setErrorMsg(null);
    if (!inputCode.trim()) {
      setErrorMsg('Please paste a valid Blackwood Pines save code.');
      return;
    }
    const parsed = importSaveCode(inputCode.trim());
    if (!parsed) {
      setErrorMsg('Invalid or corrupted Save Code. Verify you copied the entire string starting with BWP-v1-.');
      return;
    }
    horrorAudio.playSaveSound();
    if (onLoadSave) {
      onLoadSave(parsed);
    } else if (onLoadRequested) {
      onLoadRequested(parsed);
      onClose();
    } else {
      onClose();
    }
  };

  const handleLoadAutoSave = () => {
    const auto = loadFromLocalStorage();
    if (!auto) {
      setErrorMsg('No auto-save found in your browser cache.');
      return;
    }
    horrorAudio.playSaveSound();
    if (onLoadSave) {
      onLoadSave(auto);
    } else if (onLoadRequested) {
      onLoadRequested(auto);
      onClose();
    } else {
      onClose();
    }
  };

  const safeTimeSurvived = Math.floor(activeData?.timeSurvivedSeconds || 0);
  const survMins = Math.floor(safeTimeSurvived / 60);
  const survSecs = safeTimeSurvived % 60;
  const chapterDisplay = activeData?.chapterId ?? 1;
  const fusesDisplay = activeData?.inventory?.fuses ?? 0;

  return (
    <div
      id="save-modal-overlay"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none font-mono text-white animate-fadeIn"
    >
      <div className="max-w-xl w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <Save className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-bold tracking-wider text-zinc-100 uppercase">
              EXPEDITION SAVE SYSTEM
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800">
          <button
            onClick={() => {
              setActiveTab('EXPORT');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'EXPORT'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>SAVE GAME & GET CODE</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('IMPORT');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'IMPORT'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>LOAD SAVE CODE</span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'EXPORT' ? (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Your exact progress (coordinates, chapter, spark plugs, diesel fuel, vitals, and inventory) is converted into an exportable Save Code. Copy and save this string anywhere to resume your expedition anytime on any device.
            </p>

            {activeData && (
              <div className="grid grid-cols-3 gap-2 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-[11px]">
                <div>
                  <span className="text-zinc-500 block text-[9px]">CHAPTER</span>
                  <span className="text-emerald-400 font-bold">CH {chapterDisplay}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px]">TIME SURVIVED</span>
                  <span className="text-zinc-200 font-bold">
                    {survMins}m {survSecs}s
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9px]">FUSES / FUEL</span>
                  <span className="text-amber-400 font-bold">
                    {fusesDisplay}/3 {activeData.inventory?.hasFuelCan ? '• DIESEL' : ''}
                  </span>
                </div>
              </div>
            )}

            <div className="relative">
              <textarea
                readOnly
                value={saveCode}
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl p-3 text-[11px] font-mono text-emerald-300 select-all focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-white" />
                    <span>SAVE CODE COPIED!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>COPY SAVE CODE</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs tracking-wider rounded-xl border border-zinc-700 transition-all cursor-pointer"
              >
                <Play className="h-4 w-4 text-emerald-400" />
                <span>RESUME PLAYING</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              Paste your saved expedition string below to resume exactly where you were. You can also load your most recent browser checkpoint directly.
            </p>

            {hasAutoSave && (
              <button
                onClick={handleLoadAutoSave}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="text-xs font-bold text-zinc-100">QUICK LOAD RECENT CHECKPOINT</div>
                    <div className="text-[10px] text-zinc-400 font-sans">
                      Automatically saved locally from your last session
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono tracking-wider">LOAD &rarr;</span>
              </button>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                PASTE YOUR SAVE CODE:
              </label>
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="Paste code starting with BWP-v1-..."
                rows={4}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/50 border border-red-500/50 text-red-300 text-xs font-sans">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleApplyImport}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wider rounded-xl transition-all shadow-lg cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>LOAD CODE & RESUME EXACT POSITION</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
