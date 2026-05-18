// ============================================================
// storageDiagnostics.ts — Diagnostik för localStorage-lagring
//
// Läser kända nycklar och returnerar storlek, antal poster och
// eventuella varningar. Kraschar aldrig — alla fel fångas.
// ============================================================

import { STORAGE_KEYS } from "./storageKeys";

// ============================================================
// Typer
// ============================================================

export interface StorageEntryDiagnostic {
  label: string;
  key: string;
  exists: boolean;
  sizeBytes: number;
  itemCount?: number;
  description: string;
  warning?: string;
}

export interface StorageDiagnostics {
  entries: StorageEntryDiagnostic[];
  totalEstimatedBytes: number;
  backend: string;
  checkedAt: string;
}

// ============================================================
// Interna hjälpfunktioner
// ============================================================

function safeParseArray(raw: string): { count: number; warning?: string } {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return { count: parsed.length };
    return { count: 0, warning: "Förväntat array, fick annat format" };
  } catch {
    return { count: 0, warning: "JSON-parsning misslyckades" };
  }
}

function buildEntry(
  label: string,
  key: string,
  description: string,
  isArray: boolean
): StorageEntryDiagnostic {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return { label, key, exists: false, sizeBytes: 0, description };
    }
    const sizeBytes = new TextEncoder().encode(raw).length;
    if (isArray) {
      const { count, warning } = safeParseArray(raw);
      return {
        label,
        key,
        exists: true,
        sizeBytes,
        itemCount: count,
        description,
        ...(warning ? { warning } : {}),
      };
    }
    return { label, key, exists: true, sizeBytes, description };
  } catch {
    return {
      label,
      key,
      exists: false,
      sizeBytes: 0,
      description,
      warning: "Kunde inte läsa nyckeln",
    };
  }
}

// ============================================================
// Publika funktioner
// ============================================================

/**
 * Returnerar diagnostikinformation för alla kända localStorage-poster.
 * Säker att anropa när som helst — kraschar inte.
 */
export function getLocalStorageDiagnostics(): StorageDiagnostics {
  const entries: StorageEntryDiagnostic[] = [
    buildEntry(
      "Sparade chattar",
      STORAGE_KEYS.savedChats,
      "Sparade chattkonversationer med metadata",
      true
    ),
    buildEntry(
      "Egna prompts",
      STORAGE_KEYS.customPrompts,
      "Egna promptmallar skapade av användaren",
      true
    ),
    buildEntry(
      "Projektminne",
      STORAGE_KEYS.projectMemory,
      "Användaranteckningar per projekt",
      true
    ),
    buildEntry(
      "Appinställningar",
      STORAGE_KEYS.appSettings,
      "Modellbeteende, standardval och övriga inställningar",
      false
    ),
    buildEntry(
      "Streaming (legacy)",
      STORAGE_KEYS.useStreamingLegacy,
      "Gammal streaming-nyckel — migreras automatiskt till appSettings vid start",
      false
    ),
  ];

  return {
    entries,
    totalEstimatedBytes: estimateLocalStorageTotalBytes(),
    backend: "localStorage",
    checkedAt: new Date().toISOString(),
  };
}

/**
 * Uppskattar total storlek för ALLT i localStorage (inte bara echocompanion-nycklar).
 */
export function estimateLocalStorageTotalBytes(): number {
  try {
    let total = 0;
    const encoder = new TextEncoder();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;
      const value = localStorage.getItem(key) ?? "";
      total += encoder.encode(key).length + encoder.encode(value).length;
    }
    return total;
  } catch {
    return 0;
  }
}

/**
 * Formaterar bytes till läsbar storlek (B / KB / MB).
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
