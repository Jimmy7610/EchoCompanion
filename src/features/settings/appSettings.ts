// ============================================================
// appSettings.ts — Enhetlig app-inställningsmodul (Bash 9)
// ============================================================

// INSTÄLLNING - localStorage-nyckel för appens samlade inställningar
export const APP_SETTINGS_KEY = "echocompanion.appSettings.v1";

const LEGACY_STREAMING_KEY = "echocompanion.useStreaming.v1";

export interface AppSettings {
  // Modellbeteende
  temperature: number;       // INSTÄLLNING - Kreativitet (0.0–1.5)
  topP: number;              // INSTÄLLNING - Kumulativ tokensannolikhet (0.1–1.0)
  numPredict: number;        // INSTÄLLNING - Max antal tokens i svaret (svarslängd)
  numCtx: number;            // INSTÄLLNING - Kontextfönsterstorlek — hur mycket historik modellen ser (num_ctx)

  // Svarsläge
  useStreaming: boolean;     // INSTÄLLNING - Token-för-token streaming

  // Standardval (tillämpas vid start)
  defaultProfileId: string | null;  // INSTÄLLNING - Förvald kompanjonprofil
  defaultProjectId: string | null;  // INSTÄLLNING - Förvalt projekt

  // Beteende
  autoSelectFirstModel: boolean;    // INSTÄLLNING - Välj första modell automatiskt vid anslutning
  showDebugInfo: boolean;           // INSTÄLLNING - Logga API-anrop och token-statistik
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
  temperature: 0.7,
  topP: 0.9,
  numPredict: 1024,
  numCtx: 4096,
  useStreaming: true,
  defaultProfileId: null,
  defaultProjectId: null,
  autoSelectFirstModel: true,
  showDebugInfo: false,
};

export function getAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(APP_SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_APP_SETTINGS, ...(JSON.parse(stored) as Partial<AppSettings>) };
    }
    // Migrera gammal streaming-nyckel till den nya samlade strukturen
    const legacyStreaming = localStorage.getItem(LEGACY_STREAMING_KEY);
    if (legacyStreaming !== null) {
      const migrated: AppSettings = {
        ...DEFAULT_APP_SETTINGS,
        useStreaming: JSON.parse(legacyStreaming) as boolean,
      };
      saveAppSettings(migrated);
      localStorage.removeItem(LEGACY_STREAMING_KEY);
      return migrated;
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_APP_SETTINGS };
}

export function saveAppSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(APP_SETTINGS_KEY, JSON.stringify(settings));
  } catch { /* ignore */ }
}

export function updateAppSettings(partial: Partial<AppSettings>): AppSettings {
  const current = getAppSettings();
  const updated = { ...current, ...partial };
  saveAppSettings(updated);
  return updated;
}

export function resetAppSettings(): AppSettings {
  saveAppSettings(DEFAULT_APP_SETTINGS);
  return { ...DEFAULT_APP_SETTINGS };
}
