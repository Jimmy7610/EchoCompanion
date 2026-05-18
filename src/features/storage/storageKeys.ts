// ============================================================
// storageKeys.ts — Centralt register för alla kända localStorage-nycklar
//
// Alla echocompanion.*-nycklar ska deklareras här.
// Ändra aldrig en nyckel utan att skapa en migreringsrutin först —
// det radera användarens data utan varning.
// ============================================================

export const STORAGE_KEYS = {
  // INSTÄLLNING - Sparade chattkonversationer. Ändra ej utan migreringsrutin.
  savedChats: "echocompanion.savedChats.v1",

  // INSTÄLLNING - Egna promptmallar skapade av användaren. Ändra ej utan migreringsrutin.
  customPrompts: "echocompanion.customPrompts.v1",

  // INSTÄLLNING - Projektminne (användaranteckningar per projekt). Ändra ej utan migreringsrutin.
  projectMemory: "echocompanion.projectMemory.v1",

  // INSTÄLLNING - Samlade appinställningar (Bash 9+). Ändra ej utan migreringsrutin.
  appSettings: "echocompanion.appSettings.v1",

  // Legacy — gammal streaming-nyckel. Migreras automatiskt till appSettings vid start.
  useStreamingLegacy: "echocompanion.useStreaming.v1",
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
