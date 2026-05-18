// ============================================================
// backupService.ts — Export och import av EchoCompanion-data
// ============================================================

import { getSavedChats } from "../chat/chatStorage";
import type { SavedChat } from "../chat/chatStorage";
import { getCustomPromptTemplates } from "../prompts/promptStorage";
import type { PromptTemplate } from "../prompts/promptTypes";
import { getProjectMemories } from "../projects/projectStorage";
import type { ProjectMemory } from "../projects/projectStorage";
import type { EchoCompanionBackup, BackupImportResult } from "./backupTypes";

// INSTÄLLNING - Appversion och buildnummer som skrivs in i backup-metadata
const APP_VERSION = "v0.1.0";
const BUILD = "7";

// localStorage-nycklar — måste matcha respektive storage-modul
const SAVED_CHATS_KEY = "echocompanion.savedChats.v1";
const CUSTOM_PROMPTS_KEY = "echocompanion.customPrompts.v1";
const PROJECT_MEMORY_KEY = "echocompanion.projectMemory.v1";

// ============================================================
// Hjälpfunktioner
// ============================================================

function formatDateForFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

function downloadJson(data: unknown, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function safeReadJson<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]") as T[];
  } catch {
    return [];
  }
}

// ============================================================
// Export
// ============================================================

export function createFullBackup(): EchoCompanionBackup {
  return {
    appName: "EchoCompanion",
    backupVersion: 1,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    build: BUILD,
    data: {
      savedChats: getSavedChats(),
      customPrompts: getCustomPromptTemplates(),
      projectMemories: getProjectMemories(),
    },
  };
}

/** Skapar och laddar ned en fullständig backup-JSON. */
export function downloadBackupFile(): void {
  const backup = createFullBackup();
  downloadJson(backup, `echocompanion-backup-${formatDateForFilename()}.json`);
}

/** Exporterar bara sparade chattar. */
export function exportSavedChatsOnly(): void {
  const chats = getSavedChats();
  downloadJson(
    { appName: "EchoCompanion", type: "savedChats", exportedAt: new Date().toISOString(), data: chats },
    `echocompanion-chattar-${formatDateForFilename()}.json`
  );
}

/** Exporterar bara egna promptmallar. */
export function exportCustomPromptsOnly(): void {
  const prompts = getCustomPromptTemplates();
  downloadJson(
    { appName: "EchoCompanion", type: "customPrompts", exportedAt: new Date().toISOString(), data: prompts },
    `echocompanion-prompts-${formatDateForFilename()}.json`
  );
}

/** Exporterar bara projektanteckningar. */
export function exportProjectMemoryOnly(): void {
  const memories = getProjectMemories();
  downloadJson(
    { appName: "EchoCompanion", type: "projectMemories", exportedAt: new Date().toISOString(), data: memories },
    `echocompanion-projektminne-${formatDateForFilename()}.json`
  );
}

// ============================================================
// Validering
// ============================================================

export function validateBackup(data: unknown): data is EchoCompanionBackup {
  if (!data || typeof data !== "object") return false;
  const b = data as Record<string, unknown>;
  if (b.appName !== "EchoCompanion") return false;
  if (b.backupVersion !== 1) return false;
  if (!b.data || typeof b.data !== "object") return false;
  return true;
}

// ============================================================
// Import
// ============================================================

/**
 * Importerar en validerad backup.
 * mode "replace" — skriver över befintlig data helt.
 * mode "merge"   — lägger till poster som inte redan finns (matchar på ID/innehåll).
 */
export function importBackup(
  backup: EchoCompanionBackup,
  mode: "merge" | "replace"
): BackupImportResult {
  const errors: string[] = [];
  let importedChats = 0;
  let importedPrompts = 0;
  let importedProjectMemories = 0;

  // ---- Sparade chattar ----
  try {
    const incoming: SavedChat[] = Array.isArray(backup.data.savedChats)
      ? backup.data.savedChats
      : [];

    if (mode === "replace") {
      localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(incoming));
      importedChats = incoming.length;
    } else {
      const existing = safeReadJson<SavedChat>(SAVED_CHATS_KEY);
      const existingIds = new Set(existing.map((c) => c.id));
      const toAdd = incoming.filter((c) => !existingIds.has(c.id));
      localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify([...existing, ...toAdd]));
      importedChats = toAdd.length;
    }
  } catch {
    errors.push("Kunde inte importera sparade samtal.");
  }

  // ---- Egna promptmallar ----
  try {
    const incoming: PromptTemplate[] = Array.isArray(backup.data.customPrompts)
      ? backup.data.customPrompts
      : [];
    // Tillåt aldrig inbyggda mallar via import
    const safe = incoming.filter((p) => !p.isBuiltIn);

    if (mode === "replace") {
      localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(safe));
      importedPrompts = safe.length;
    } else {
      const existing = safeReadJson<PromptTemplate>(CUSTOM_PROMPTS_KEY);
      const existingIds = new Set(existing.map((p) => p.id));
      const toAdd = safe.filter((p) => !existingIds.has(p.id));
      localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify([...existing, ...toAdd]));
      importedPrompts = toAdd.length;
    }
  } catch {
    errors.push("Kunde inte importera egna promptmallar.");
  }

  // ---- Projektanteckningar ----
  try {
    const incoming: ProjectMemory[] = Array.isArray(backup.data.projectMemories)
      ? backup.data.projectMemories
      : [];

    if (mode === "replace") {
      localStorage.setItem(PROJECT_MEMORY_KEY, JSON.stringify(incoming));
      importedProjectMemories = incoming.length;
    } else {
      const existing = safeReadJson<ProjectMemory>(PROJECT_MEMORY_KEY);
      const merged = [...existing];
      for (const inc of incoming) {
        const idx = merged.findIndex((m) => m.projectId === inc.projectId);
        if (idx < 0) {
          merged.push(inc);
          importedProjectMemories++;
        } else {
          // Lägg till noter som inte redan finns (exakt matchning)
          const existingNotes = new Set(merged[idx].userNotes);
          const newNotes = inc.userNotes.filter((n) => !existingNotes.has(n));
          if (newNotes.length > 0) {
            merged[idx] = {
              ...merged[idx],
              userNotes: [...merged[idx].userNotes, ...newNotes],
              updatedAt: new Date().toISOString(),
            };
            importedProjectMemories++;
          }
        }
      }
      localStorage.setItem(PROJECT_MEMORY_KEY, JSON.stringify(merged));
    }
  } catch {
    errors.push("Kunde inte importera projektanteckningar.");
  }

  const success = errors.length === 0;
  const message =
    errors.length === 0
      ? "Importen är klar."
      : errors.length >= 3
      ? "Importen misslyckades."
      : "Importen slutfördes med varningar.";

  return {
    success,
    message,
    importedChats,
    importedPrompts,
    importedProjectMemories,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Läser och validerar en backup-fil.
 * Returnerar det parsade backup-objektet eller ett felmeddelande.
 */
export function readAndValidateFile(
  file: File
): Promise<{ backup: EchoCompanionBackup | null; error?: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== "string") {
        resolve({ backup: null, error: "Filen kunde inte läsas." });
        return;
      }
      let data: unknown;
      try {
        data = JSON.parse(text);
      } catch {
        resolve({
          backup: null,
          error: "Backup-filen verkar inte vara en EchoCompanion-backup.",
        });
        return;
      }
      if (!validateBackup(data)) {
        resolve({
          backup: null,
          error: "Backup-filen verkar inte vara en EchoCompanion-backup.",
        });
        return;
      }
      resolve({ backup: data });
    };
    reader.onerror = () => {
      resolve({ backup: null, error: "Filen kunde inte läsas." });
    };
    reader.readAsText(file);
  });
}
