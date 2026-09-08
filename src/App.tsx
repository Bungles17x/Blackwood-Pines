import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { PauseMenu } from './components/PauseMenu';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { NoteModal } from './components/NoteModal';
import { CCTVModal } from './components/CCTVModal';
import { MapModal } from './components/MapModal';
import { SaveModal } from './components/SaveModal';
import { ObjectivesModal } from './components/ObjectivesModal';
import { HorrorEngine, SaveData } from './game/horrorEngine';
import { objectivesManager } from './game/objectivesManager';
import {
  GameState,
  Inventory,
  FlashlightState,
  LoreNote,
  GameSettings,
  Chapter,
  GAME_CHAPTERS,
  SurvivalVitals,
} from './types';
import { horrorAudio } from './audio/horrorAudio';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HorrorEngine | null>(null);

  // High-level Game State
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [currentChapterId, setCurrentChapterId] = useState<number>(1);
  const [activeChapterCard, setActiveChapterCard] = useState<Chapter | null>(null);
  const [activeNote, setActiveNote] = useState<LoreNote | null>(null);
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [isHiding, setIsHiding] = useState(false);
  const [activeLean, setActiveLean] = useState<'left' | 'right' | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(
    'The woods are quiet... for now. Search the trails for generator spark plugs.'
  );
  const [isDying, setIsDying] = useState<boolean>(false);
  const [showCctv, setShowCctv] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [saveModalMode, setSaveModalMode] = useState<'SAVE' | 'LOAD' | null>(null);
  const [isObjectivesOpen, setIsObjectivesOpen] = useState(false);
  const [hasAutoSave, setHasAutoSave] = useState(false);
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [compassHeading, setCompassHeading] = useState(0);
  const [activeWaypoint, setActiveWaypoint] = useState<
    { label: string; distanceMeters: number; relBearingDeg: number } | undefined
  >(undefined);

  const saveModalModeRef = useRef(saveModalMode);
  saveModalModeRef.current = saveModalMode;
  const isObjectivesOpenRef = useRef(isObjectivesOpen);
  isObjectivesOpenRef.current = isObjectivesOpen;
  const showMapRef = useRef(showMap);
  showMapRef.current = showMap;
  const showCctvRef = useRef(showCctv);
  showCctvRef.current = showCctv;
  const activeNoteRef = useRef(activeNote);
  activeNoteRef.current = activeNote;

  // HUD & Stats
  const [inventory, setInventory] = useState<Inventory>({
    fuses: 0,
    maxFuses: 3,
    hasKeycard: false,
    hasRadioTube: false,
    isRadioRepaired: false,
    hasFuelCan: false,
    isGeneratorFueled: false,
    batteries: 2,
    bottles: 1,
    flares: 1,
    hasMap: false,
    notesRead: [],
  });

  const [flashlight, setFlashlight] = useState<FlashlightState>({
    enabled: true,
    battery: 100,
    isFlickering: false,
    isUVMode: false,
  });

  const [stamina, setStamina] = useState(100);
  const [showStamina, setShowStamina] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const staminaHideTimerRef = useRef<number | null>(null);
  const [distanceToMonster, setDistanceToMonster] = useState(30);
  const [hearingLevel, setHearingLevel] = useState(0);
  const [hearingColor, setHearingColor] = useState<'red' | 'yellow' | 'green'>('green');
  const [timeSurvivedSeconds, setTimeSurvivedSeconds] = useState(0);
  const [isCrouching, setIsCrouching] = useState(false);
  const [isHoldingBreath, setIsHoldingBreath] = useState(false);
  const [breathHoldRatio, setBreathHoldRatio] = useState(1.0);
  const [survivalVitals, setSurvivalVitals] = useState<SurvivalVitals | undefined>(undefined);
  const [isFlashlightTappable, setIsFlashlightTappable] = useState(false);

  // Game Settings
  const [settings, setSettings] = useState<GameSettings>({
    mouseSensitivity: 1.0,
    soundVolume: 0.8,
    ambientVolume: 0.7,
    difficulty: 'normal',
    headBobbing: true,
    filmGrain: true,
  });

  // Check local storage for auto-save on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('blackwood_pines_autosave');
      if (saved) {
        setHasAutoSave(true);
      }
    } catch {}
  }, []);

  // Track run time & periodic background auto-save
  useEffect(() => {
    let timer: number;
    let autoSaveTimer: number;

    if (gameState === 'PLAYING') {
      timer = window.setInterval(() => {
        setTimeSurvivedSeconds((prev) => prev + 1);
      }, 1000);

      autoSaveTimer = window.setInterval(() => {
        if (engineRef.current && !engineRef.current.isDying) {
          try {
            const data = engineRef.current.getSaveData();
            localStorage.setItem('blackwood_pines_autosave', JSON.stringify(data));
            setHasAutoSave(true);
          } catch {}
        }
      }, 40000);
    }
    return () => {
      clearInterval(timer);
      clearInterval(autoSaveTimer);
    };
  }, [gameState]);

  useEffect(() => {
    if (staminaHideTimerRef.current !== null) {
      window.clearTimeout(staminaHideTimerRef.current);
      staminaHideTimerRef.current = null;
    }

    if (!showStamina || isSprinting || stamina < 100) return;

    staminaHideTimerRef.current = window.setTimeout(() => {
      setShowStamina(false);
      staminaHideTimerRef.current = null;
    }, 1500);

    return () => {
      if (staminaHideTimerRef.current !== null) {
        window.clearTimeout(staminaHideTimerRef.current);
        staminaHideTimerRef.current = null;
      }
    };
  }, [isSprinting, showStamina, stamina]);

  const triggerChapterAnnouncement = (chapterId: number) => {
    const chap = GAME_CHAPTERS.find((c) => c.id === chapterId);
    if (!chap) return;
    setActiveChapterCard(chap);
    horrorAudio.playMenuSelect();
    setTimeout(() => {
      setActiveChapterCard((prev) => (prev?.id === chapterId ? null : prev));
    }, 4500);
  };

  // Mount 3D Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new HorrorEngine(containerRef.current);
    engineRef.current = engine;

    // Connect Engine callbacks
    engine.onPromptChange = (p) => setInteractPrompt(p);
    engine.onInventoryChange = (inv) => {
      setInventory(inv);

      // Dynamic Chapter Progression
      setCurrentChapterId((prevId) => {
        if (prevId === 1 && inv.hasKeycard) {
          triggerChapterAnnouncement(2);
          return 2;
        }
        if (prevId === 2 && inv.fuses >= 3) {
          triggerChapterAnnouncement(3);
          return 3;
        }
        return prevId;
      });
    };
    engine.onFlashlightChange = (f) => setFlashlight(f);
    engine.onStaminaChange = (s) => setStamina(s);
    engine.onSprintingChange = (sprinting) => {
      setIsSprinting(sprinting);
      if (sprinting) revealStamina();
    };
    engine.onJump = () => revealStamina();
    engine.onFearChange = (_fr, dist) => {
      setDistanceToMonster(dist);
    };
    engine.onHearingChange = (level) => setHearingLevel(level);
    engine.onHearingColorChange = (color) => setHearingColor(color);
    engine.onHidingChange = (h) => setIsHiding(h);
    engine.onCrouchChange = (c) => setIsCrouching(c);
    engine.onBreathHoldChange = (holding, ratio) => {
      setIsHoldingBreath(holding);
      setBreathHoldRatio(ratio);
    };
    engine.onVitalsChange = (v) => setSurvivalVitals(v);
    engine.onFlashlightTappable = (t) => setIsFlashlightTappable(t);
    engine.onLeanChange = (l) => setActiveLean(l);
    engine.onCompassChange = (heading, waypoint) => {
      setCompassHeading(heading);
      setActiveWaypoint(waypoint);
    };
    engine.onCctvOpen = () => {
      setShowCctv(true);
      engine.setModalOpen(true);
    };
    engine.onMapOpen = () => {
      setShowMap(true);
      engine.setModalOpen(true);
    };
    engine.onOpenObjectives = () => {
      handleOpenObjectivesModal();
    };
    engine.onPauseGame = () => {
      handlePauseGame();
    };
    engine.onNoteOpen = (note) => {
      setActiveNote(note);
      engine.setModalOpen(true);
    };
    engine.onBannerMessage = (msg) => {
      setBannerMessage(msg);
      // If power restored, advance to Chapter 4
      if (engine.isPowerRestored) {
        setCurrentChapterId((prevId) => {
          if (prevId < 4) {
            triggerChapterAnnouncement(4);
            return 4;
          }
          return prevId;
        });
      }
    };
    engine.onDeathStart = () => setIsDying(true);
    engine.onGameOver = () => {
      setIsDying(false);
      setGameState('GAMEOVER');
      engine.pause();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };
    engine.onVictory = () => {
      setGameState('VICTORY');
      engine.pause();
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }
    };

    // Keyboard Shortcuts for Game State
    let hadPointerLock = false;
    const handlePointerLockChange = () => {
      const hasPointerLock = document.pointerLockElement === engine.renderer.domElement;
      setIsPointerLocked(hasPointerLock);
      if (hasPointerLock) {
        hadPointerLock = true;
        return;
      }

      if (hadPointerLock && !engine.isModalOpen && !engine.isDying) {
        hadPointerLock = false;
        setGameState((prev) => {
          if (prev !== 'PLAYING') return prev;
          engine.pause();
          return 'PAUSED';
        });
      } else {
        hadPointerLock = false;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in inputs or textareas (e.g. Save Code box)
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Escape') {
        if (saveModalModeRef.current) {
          handleCloseSaveModal();
          return;
        }
        if (isObjectivesOpenRef.current) {
          handleCloseObjectivesModal();
          return;
        }
        if (showMapRef.current) {
          handleCloseMap();
          return;
        }
        if (showCctvRef.current) {
          handleCloseCctv();
          return;
        }
        if (activeNoteRef.current) {
          handleCloseNote();
          return;
        }

        setGameState((prev) => {
          if (prev === 'PLAYING') {
            engine.pause();
            if (document.pointerLockElement) {
              document.exitPointerLock();
            }
            return 'PAUSED';
          }
          if (prev === 'PAUSED') {
            engine.setModalOpen(false);
            engine.start();
            try {
              engine.renderer.domElement.requestPointerLock();
            } catch {}
            return 'PLAYING';
          }
          return prev;
        });
      }

      if ((e.code === 'KeyK' || e.key === 'k' || e.key === 'K') && !engine.isDying) {
        handleOpenSaveModal();
      }

      if ((e.code === 'KeyL' || e.key === 'l' || e.key === 'L') && !engine.isDying) {
        handleOpenLoadModal();
      }

      if ((e.code === 'KeyO' || e.key === 'o' || e.key === 'O') && !engine.isDying) {
        handleOpenObjectivesModal();
      }
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync settings whenever they change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.settings = settings;
    }
  }, [settings]);

  // Modal close handlers
  const handleCloseNote = () => {
    setActiveNote(null);
    if (engineRef.current) {
      engineRef.current.setModalOpen(false);
      try {
        engineRef.current.renderer.domElement.requestPointerLock();
      } catch {}
    }
  };

  const handleCloseCctv = () => {
    setShowCctv(false);
    if (engineRef.current) {
      engineRef.current.setModalOpen(false);
      try {
        engineRef.current.renderer.domElement.requestPointerLock();
      } catch {}
    }
  };

  const handleCloseMap = () => {
    setShowMap(false);
    if (engineRef.current) {
      engineRef.current.setModalOpen(false);
      try {
        engineRef.current.renderer.domElement.requestPointerLock();
      } catch {}
    }
  };

  const handleOpenSaveModal = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      engineRef.current.setModalOpen(true);
    }
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setSaveModalMode('SAVE');
  };

  const handleOpenLoadModal = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      engineRef.current.setModalOpen(true);
    }
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setSaveModalMode('LOAD');
  };

  const handleOpenObjectivesModal = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      engineRef.current.setModalOpen(true);
    }
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setIsObjectivesOpen(true);
  };

  const requestPointerLock = () => {
    if (!engineRef.current || engineRef.current.isModalOpen) return;
    try {
      engineRef.current.renderer.domElement.requestPointerLock();
    } catch {}
  };

  const handleCloseSaveModal = () => {
    setSaveModalMode(null);
    if (engineRef.current) {
      engineRef.current.setModalOpen(false);
      if (gameState === 'PLAYING') {
        engineRef.current.start();
        requestPointerLock();
      }
    }
  };

  const handleCloseObjectivesModal = () => {
    setIsObjectivesOpen(false);
    if (engineRef.current) {
      engineRef.current.setModalOpen(false);
      if (gameState === 'PLAYING') {
        engineRef.current.start();
        requestPointerLock();
      }
    }
  };

  const handleLoadSaveData = (data: SaveData) => {
    if (!engineRef.current) return;
    horrorAudio.init();

    // Close all open modals and states
    setActiveNote(null);
    setShowCctv(false);
    setShowMap(false);
    setIsObjectivesOpen(false);
    setSaveModalMode(null);
    setIsHiding(false);
    setIsDying(false);
    setActiveLean(null);

    // Apply save data to 3D engine and unblock modals
    engineRef.current.loadSaveData(data);
    engineRef.current.setModalOpen(false);

    // Sync React state
    setCurrentChapterId(data.chapterId || 1);
    setTimeSurvivedSeconds(Math.floor(data.timeSurvivedSeconds || 0));
    setGameState('PLAYING');

    // Run engine loop
    engineRef.current.start();

    // Notify chapter
    triggerChapterAnnouncement(data.chapterId || 1);

    // Attempt pointer lock for immediate playability
    requestPointerLock();

    try {
      localStorage.setItem('blackwood_pines_autosave', JSON.stringify(data));
      setHasAutoSave(true);
    } catch {}
  };

  const handleContinueAutoSave = () => {
    try {
      const saved = localStorage.getItem('blackwood_pines_autosave');
      if (saved) {
        const data: SaveData = JSON.parse(saved);
        handleLoadSaveData(data);
      }
    } catch (e) {
      console.error('Failed to load auto-save:', e);
    }
  };

  // Update Settings in Engine
  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (engineRef.current) {
        engineRef.current.settings = updated;
      }
      if (newSettings.soundVolume !== undefined) {
        horrorAudio.setMasterVolume(newSettings.soundVolume);
      }
      if (newSettings.masterVolume !== undefined) {
        horrorAudio.setMasterVolume(newSettings.masterVolume);
      }
      if (newSettings.sfxVolume !== undefined) {
        horrorAudio.setSFXVolume(newSettings.sfxVolume);
      }
      if (newSettings.ambientVolume !== undefined) {
        horrorAudio.setAmbientVolume(newSettings.ambientVolume);
      }
      return updated;
    });
  };

  const revealStamina = () => {
    setShowStamina(true);
    if (staminaHideTimerRef.current !== null) {
      window.clearTimeout(staminaHideTimerRef.current);
      staminaHideTimerRef.current = null;
    }
  };

  // Start game from title with selected chapter
  const handleStartGame = (chapterId: number = 1) => {
    if (!engineRef.current) return;
    setCurrentChapterId(chapterId);
    setTimeSurvivedSeconds(0);
    setActiveNote(null);
    setInteractPrompt(null);
    setShowCctv(false);
    setShowMap(false);
    setIsHiding(false);
    setIsDying(false);
    setActiveLean(null);

    setGameState('PLAYING');
    horrorAudio.init();
    engineRef.current.resetGame(chapterId);
    engineRef.current.start();
    triggerChapterAnnouncement(chapterId);

    try {
      engineRef.current.renderer.domElement.requestPointerLock();
    } catch {
      // Browser may require user gesture on canvas
    }
  };

  // Resume game from pause
  const handleResumeGame = () => {
    if (!engineRef.current) return;
    setSaveModalMode(null);
    setIsObjectivesOpen(false);
    setShowCctv(false);
    setShowMap(false);
    setActiveNote(null);
    engineRef.current.setModalOpen(false);
    setGameState('PLAYING');
    engineRef.current.start();
    requestPointerLock();
  };

  const handlePauseGame = () => {
    if (!engineRef.current || gameState !== 'PLAYING') return;
    engineRef.current.pause();
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    setGameState('PAUSED');
  };

  // Return to Main Menu from Pause
  const handleReturnToMainMenu = () => {
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }
    if (engineRef.current) {
      engineRef.current.pause();
    }
    horrorAudio.stopHeartbeat();
    horrorAudio.stopRadioStatic();
    setActiveChapterCard(null);
    setShowCctv(false);
    setShowMap(false);
    setActiveNote(null);
    setGameState('TITLE');
  };

  // Restart current chapter after death or from pause
  const handleRestartGame = () => {
    handleTryAgain();
  };

  const handleTryAgain = () => {
    setCurrentChapterId(1);
    setTimeSurvivedSeconds(0);
    setActiveNote(null);
    setInteractPrompt(null);
    setShowCctv(false);
    setShowMap(false);
    setIsHiding(false);
    setIsDying(false);
    setActiveLean(null);
    engineRef.current.resetGame(1);
    setGameState('PLAYING');
    horrorAudio.init();
    engineRef.current.start();
    triggerChapterAnnouncement(1);

    try {
      engineRef.current.renderer.domElement.requestPointerLock();
    } catch {
      // Browser may require user gesture on canvas
    }
  };

  const activeChapterData =
    GAME_CHAPTERS.find((c) => c.id === currentChapterId) || GAME_CHAPTERS[0];

  return (
    <div id="game-root" className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Mount Container */}
      <div
        id="canvas-container"
        ref={containerRef}
        onClick={() => {
          if (gameState === 'PLAYING' && !engineRef.current?.isModalOpen) {
            requestPointerLock();
          }
        }}
        className="w-full h-full cursor-crosshair"
      />

      {/* Cinematic Chapter Announcement Splash Card */}
      {activeChapterCard && (
        <div
          id="chapter-splash-card"
          className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px] transition-all duration-700 animate-fadeIn"
        >
          <div className="text-center space-y-3 p-6 sm:p-10 max-w-xl mx-auto border-y border-emerald-500/50 bg-zinc-950/85 shadow-[0_0_50px_rgba(16,185,129,0.25)] rounded-lg">
            <div className="text-xs text-emerald-400 font-mono font-bold tracking-[0.3em] uppercase">
              {activeChapterCard.numberString}
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-zinc-100 font-mono tracking-widest uppercase drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              {activeChapterCard.title}
            </h2>
            <div className="text-xs sm:text-sm text-zinc-400 font-sans tracking-wide">
              {activeChapterCard.subtitle}
            </div>
            <div className="pt-3 border-t border-zinc-800/90 text-xs text-emerald-300 font-mono">
              <strong className="text-white">DIRECTIVE: </strong>
              {activeChapterCard.objective}
            </div>
          </div>
        </div>
      )}

      {/* In-Game HUD overlay */}
      {(gameState === 'PLAYING' || isDying) && (
        <HUD
          flashlight={flashlight}
          inventory={inventory}
          stamina={stamina}
          showStamina={showStamina}
          distanceToMonster={distanceToMonster}
          hearingLevel={hearingLevel}
          hearingColor={hearingColor}
          prompt={interactPrompt}
          bannerMessage={bannerMessage}
          isDying={isDying}
          isPowerRestored={engineRef.current?.isPowerRestored ?? false}
          isPlayerHiding={isHiding}
          isCrouching={isCrouching}
          activeLean={activeLean}
          isHoldingBreath={isHoldingBreath}
          breathHoldRatio={breathHoldRatio}
          vitals={survivalVitals}
          isFlashlightTappable={isFlashlightTappable}
          compassHeading={compassHeading}
          activeWaypoint={activeWaypoint}
          isPointerLocked={isPointerLocked}
          onLockPointer={requestPointerLock}
          onTapFlashlight={() => engineRef.current?.tapFlashlight()}
          onHoldBreath={(h) => engineRef.current?.setHoldingBreath(h)}
          onToggleFlashlight={() => engineRef.current?.toggleFlashlight()}
          onToggleUV={() => engineRef.current?.toggleUVMode()}
          onUseBattery={() => engineRef.current?.useBattery()}
          onThrowBottle={() => engineRef.current?.throwBottle()}
          onUseFlare={() => engineRef.current?.useFlare()}
          onOpenMap={() => {
            setShowMap(true);
            engineRef.current?.setModalOpen(true);
          }}
          onInteract={() => engineRef.current?.interact()}
          onPause={handlePauseGame}
          onJump={() => {
            engineRef.current?.jump();
          }}
          onToggleCrouch={() => engineRef.current?.toggleCrouch()}
          onHoldSprint={(sprinting) => {
            engineRef.current?.setSprinting(sprinting);
          }}
          onVirtualMove={(f, b, l, r) => engineRef.current?.setVirtualMove(f, b, l, r)}
          onVirtualJoystick={(x, y) => engineRef.current?.setVirtualJoystick(x, y)}
          onLookDelta={(dx, dy) => engineRef.current?.applyLookDelta(dx, dy)}
          onOpenObjectives={handleOpenObjectivesModal}
          onQuickSave={handleOpenSaveModal}
          onQuickLoad={handleOpenLoadModal}
        />
      )}

      {/* CCTV Security Feed Monitor Modal */}
      {showCctv && (
        <CCTVModal
          creaturePosition={engineRef.current?.creature.position ?? new THREE.Vector3()}
          onClose={handleCloseCctv}
        />
      )}

      {/* Forest Trail Topographic Map Modal */}
      {showMap && (
        <MapModal
          playerPosition={engineRef.current?.playerPosition ?? null}
          hasKeycard={inventory.hasKeycard}
          fusesFound={inventory.fuses}
          isPowerRestored={engineRef.current?.isPowerRestored ?? false}
          onClose={handleCloseMap}
        />
      )}

      {/* Lore Note Reader Modal */}
      {activeNote && (
        <NoteModal
          note={activeNote}
          onClose={handleCloseNote}
        />
      )}

      {/* Title Screen */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onLoadSaveClick={handleOpenLoadModal}
          onContinueAutoSave={handleContinueAutoSave}
          hasAutoSave={hasAutoSave}
          onOpenObjectives={handleOpenObjectivesModal}
          settings={settings}
          onUpdateSettings={updateSettings}
        />
      )}

      {/* Pause Menu with Chapter Intel & Main Menu Return */}
      {gameState === 'PAUSED' && (
        <PauseMenu
          onResume={handleResumeGame}
          onRestart={handleRestartGame}
          onMainMenu={handleReturnToMainMenu}
          onSaveExpedition={handleOpenSaveModal}
          onLoadExpedition={handleOpenLoadModal}
          onOpenObjectives={handleOpenObjectivesModal}
          currentChapter={activeChapterData}
          settings={settings}
          onUpdateSettings={updateSettings}
        />
      )}

      {/* Expedition Code Save & Load System Modal (Rendered on top with z-[100]) */}
      {saveModalMode && (
        <SaveModal
          mode={saveModalMode}
          currentSaveData={engineRef.current?.getSaveData()}
          onClose={handleCloseSaveModal}
          onLoadSave={handleLoadSaveData}
          onSaveRequested={() => {
            if (engineRef.current) {
              const data = engineRef.current.getSaveData();
              try {
                localStorage.setItem('blackwood_pines_autosave', JSON.stringify(data));
                setHasAutoSave(true);
              } catch {}
              return data;
            }
            throw new Error('Engine not active');
          }}
          onLoadRequested={handleLoadSaveData}
        />
      )}

      {/* Comprehensive 100+ Survival Objectives Dossier */}
      {isObjectivesOpen && (
        <ObjectivesModal
          objectives={objectivesManager.getObjectives()}
          onClose={handleCloseObjectivesModal}
        />
      )}

      {/* Game Over Screen */}
      {gameState === 'GAMEOVER' && (
        <GameOverModal
          onRetry={handleTryAgain}
          inventory={inventory}
          timeSurvivedSeconds={timeSurvivedSeconds}
          onMainMenu={handleReturnToMainMenu}
        />
      )}

      {/* Victory Screen */}
      {gameState === 'VICTORY' && (
        <VictoryModal
          onPlayAgain={handleTryAgain}
          onBackToMenu={handleReturnToMainMenu}
          inventory={inventory}
          timeTakenSeconds={timeSurvivedSeconds}
        />
      )}
    </div>
  );
}
