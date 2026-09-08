/**
 * Blackwood Pines - Robust Game State Serialization & Save Code Engine
 * Encodes complete game state (player position, camera angles, inventory,
 * world switches, collected items, objectives, creature state, vitals)
 * into a shareable, portable Save Code (and local storage auto-save).
 */

import { Inventory, FlashlightState, SurvivalVitals } from '../types';

export interface SaveData {
  version: 1;
  timestamp: number;
  chapterId: number;
  timeSurvivedSeconds: number;
  difficulty: 'normal' | 'nightmare' | 'story';
  player: {
    x: number;
    y: number;
    z: number;
    yaw: number;
    pitch: number;
    stamina: number;
    isCrouching: boolean;
    isPlayerHiding: boolean;
    bodyTemp: number;
  };
  inventory: Inventory;
  flashlight: FlashlightState;
  world: {
    isPowerRestored: boolean;
    isSubstationUnlocked: boolean;
    isPickupHoodOpen: boolean;
    collectedItemIds: string[];
    notesRead: string[];
    recoilPulls: number;
  };
  creature: {
    x: number;
    y: number;
    z: number;
    isAwakened: boolean;
  };
  stats: {
    distanceTraveledMeters: number;
    chasesEscaped: number;
    bottlesThrown: number;
    flaresUsed: number;
    lockersUsed: number;
    batteriesUsed: number;
  };
  completedObjectiveIds: string[];
}

const SAVE_KEY = 'blackwood_pines_autosave';
const SAVE_PREFIX = 'BWP-v1-';

/**
 * Encode game state into a portable, URL-safe Base64 Save Code
 */
export function exportSaveCode(data: SaveData): string {
  try {
    const json = JSON.stringify(data);
    // Base64 encoding with UTF-8 support
    const b64 = btoa(
      encodeURIComponent(json).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    );
    return `${SAVE_PREFIX}${b64}`;
  } catch (err) {
    console.warn('Failed to generate save code:', err);
    return '';
  }
}

/**
 * Decode and validate a Save Code back into SaveData
 */
export function importSaveCode(rawCode: string): SaveData | null {
  if (!rawCode || typeof rawCode !== 'string') return null;
  const cleanCode = rawCode.trim().replace(/\s+/g, '');
  if (!cleanCode) return null;

  try {
    let b64 = cleanCode;
    if (cleanCode.startsWith(SAVE_PREFIX)) {
      b64 = cleanCode.slice(SAVE_PREFIX.length);
    }
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(json);
    if (parsed && (parsed.version === 1 || parsed.player) && parsed.inventory) {
      return parsed as SaveData;
    }
  } catch {
    // Fallback: test if raw JSON
    const raw = parseRawSave(cleanCode);
    if (raw) return raw;
  }
  return null;
}

function parseRawSave(str: string): SaveData | null {
  try {
    const parsed = JSON.parse(str);
    if (parsed && parsed.player && parsed.inventory) return parsed;
  } catch {}
  return null;
}

/**
 * Auto-save current progress into localStorage
 */
export function saveToLocalStorage(data: SaveData): boolean {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(SAVE_KEY, json);
    localStorage.setItem(`${SAVE_KEY}_timestamp`, Date.now().toString());
    return true;
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
    return false;
  }
}

/**
 * Load auto-saved progress from localStorage
 */
export function loadFromLocalStorage(): SaveData | null {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed && parsed.version === 1 && parsed.player) {
      return parsed as SaveData;
    }
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return null;
}

/**
 * Check if an auto-save exists and get its metadata
 */
export function getAutoSaveInfo(): { exists: boolean; date?: string; chapterId?: number; timeSurvived?: number } {
  try {
    const json = localStorage.getItem(SAVE_KEY);
    if (!json) return { exists: false };
    const parsed = JSON.parse(json) as SaveData;
    return {
      exists: true,
      date: new Date(parsed.timestamp).toLocaleString(),
      chapterId: parsed.chapterId,
      timeSurvived: parsed.timeSurvivedSeconds,
    };
  } catch {
    return { exists: false };
  }
}
