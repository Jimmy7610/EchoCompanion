// ============================================================
// backupTypes.ts — Typdefinitioner för backup/export/import
// ============================================================

import type { SavedChat } from "../chat/chatStorage";
import type { PromptTemplate } from "../prompts/promptTypes";
import type { ProjectMemory } from "../projects/projectStorage";

/** Fullständig EchoCompanion-backup */
export interface EchoCompanionBackup {
  appName: "EchoCompanion";
  backupVersion: 1;
  exportedAt: string;      // ISO 8601
  appVersion: string;
  build: string;
  data: {
    savedChats: SavedChat[];
    customPrompts: PromptTemplate[];
    projectMemories: ProjectMemory[];
    settings?: Record<string, unknown>;
  };
}

/** Resultat efter ett importförsök */
export interface BackupImportResult {
  success: boolean;
  message: string;
  importedChats?: number;
  importedPrompts?: number;
  importedProjectMemories?: number;
  errors?: string[];
}
