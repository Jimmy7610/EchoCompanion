// ============================================================
// ttsStorage.ts — localStorage-hantering för TTS-inställningar
// ============================================================

import type { TtsSettings } from "./ttsTypes";

const TTS_SETTINGS_KEY = "echocompanion.ttsSettings.v1"; // INSTÄLLNING - Change only if TTS settings storage format needs to reset.

export const DEFAULT_TTS_SETTINGS: TtsSettings = {
  enabled: false, // INSTÄLLNING - TTS av som standard
  autoReadAssistant: false, // INSTÄLLNING - Auto-uppläsning av som standard
  selectedVoiceName: null,
  rate: 1, // INSTÄLLNING - Standard talhastighet
  pitch: 1, // INSTÄLLNING - Standard tonhöjd
  volume: 1, // INSTÄLLNING - Standard volym
};

export function getTtsSettings(): TtsSettings {
  try {
    const raw = localStorage.getItem(TTS_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_TTS_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<TtsSettings>;
    return { ...DEFAULT_TTS_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_TTS_SETTINGS };
  }
}

export function saveTtsSettings(settings: TtsSettings): TtsSettings {
  try {
    localStorage.setItem(TTS_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // localStorage kan vara fullt eller blockerat — fortsätt ändå
  }
  return settings;
}

export function updateTtsSettings(partial: Partial<TtsSettings>): TtsSettings {
  const current = getTtsSettings();
  const updated = { ...current, ...partial };
  return saveTtsSettings(updated);
}

export function resetTtsSettings(): TtsSettings {
  try {
    localStorage.removeItem(TTS_SETTINGS_KEY);
  } catch {
    // Ignorera fel
  }
  return { ...DEFAULT_TTS_SETTINGS };
}
