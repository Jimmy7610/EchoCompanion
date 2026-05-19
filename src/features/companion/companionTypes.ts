// ============================================================
// companionTypes.ts — Typer och tillståndslogik för companion-avatar
// ============================================================

export type CompanionMood = "idle" | "thinking" | "speaking" | "offline" | "ready" | "error";

export interface CompanionState {
  mood: CompanionMood;
  label: string;
  description: string;
  accent: string;
}

interface CompanionStateInput {
  ollamaConnected: boolean;
  isGenerating: boolean;
  isSpeaking: boolean;
  activeProfileName: string | null;
  activeProjectName: string | null;
}

// INSTÄLLNING - Accentfärger per companion-stämning
const MOOD_ACCENTS: Record<CompanionMood, string> = {
  idle:     "#4a5568",
  offline:  "#4a5568",
  error:    "#ef4444",
  ready:    "#10b981",
  thinking: "#7c3aed",
  speaking: "#0ea5e9",
};

export function getCompanionState(input: CompanionStateInput): CompanionState {
  const { ollamaConnected, isGenerating, isSpeaking } = input;

  if (!ollamaConnected) {
    return {
      mood: "offline",
      label: "Ollama offline",
      description: "Anslut Ollama för att börja chatta",
      accent: MOOD_ACCENTS.offline,
    };
  }

  if (isGenerating) {
    return {
      mood: "thinking",
      label: "Tänker…",
      description: "Genererar svar",
      accent: MOOD_ACCENTS.thinking,
    };
  }

  if (isSpeaking) {
    return {
      mood: "speaking",
      label: "Pratar…",
      description: "Läser upp svar",
      accent: MOOD_ACCENTS.speaking,
    };
  }

  return {
    mood: "ready",
    label: "Redo",
    description: "Redo att chatta",
    accent: MOOD_ACCENTS.ready,
  };
}
