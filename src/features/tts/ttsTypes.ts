// ============================================================
// ttsTypes.ts — Typdefinitioner för text-till-tal (TTS)
// Används av ttsService.ts och ttsStorage.ts
// ============================================================

export interface TtsVoiceInfo {
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

export interface TtsSettings {
  enabled: boolean;
  autoReadAssistant: boolean;
  selectedVoiceName: string | null;
  rate: number;
  pitch: number;
  volume: number;
}

export type TtsStatus = "idle" | "speaking" | "paused" | "unsupported";
