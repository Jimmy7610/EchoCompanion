// ============================================================
// projectStorage.ts — Lokal sparning av projektminne via localStorage
// ============================================================

// INSTÄLLNING - Ändra bara om lagringsformatet behöver återställas (raderar projektminne)
const PROJECT_MEMORY_KEY = "echocompanion.projectMemory.v1";

// ============================================================
// Typer
// ============================================================

/** Användarens egna anteckningar per projekt (utöver inbyggda regler/noter) */
export interface ProjectMemory {
  projectId: string;
  userNotes: string[];
  updatedAt: string; // ISO 8601
}

// ============================================================
// Interna hjälpfunktioner
// ============================================================

function readAll(): ProjectMemory[] {
  try {
    const raw = localStorage.getItem(PROJECT_MEMORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProjectMemory[];
  } catch (err) {
    console.warn("EchoCompanion: Kunde inte läsa projektminne.", err);
    return [];
  }
}

function writeAll(memories: ProjectMemory[]): void {
  try {
    localStorage.setItem(PROJECT_MEMORY_KEY, JSON.stringify(memories));
  } catch (err) {
    console.error("EchoCompanion: Kunde inte spara projektminne.", err);
  }
}

// ============================================================
// Publika API-funktioner
// ============================================================

/** Returnerar alla sparade projektminnen. */
export function getProjectMemories(): ProjectMemory[] {
  return readAll();
}

/**
 * Returnerar projektminne för ett specifikt projekt.
 * Skapar ett tomt minne om inget finns.
 */
export function getProjectMemoryById(projectId: string): ProjectMemory {
  const existing = readAll().find((m) => m.projectId === projectId);
  if (existing) return existing;
  return {
    projectId,
    userNotes: [],
    updatedAt: new Date().toISOString(),
  };
}

/** Sparar (skapar eller uppdaterar) ett projektminne. */
export function saveProjectMemory(memory: ProjectMemory): void {
  const all = readAll();
  const idx = all.findIndex((m) => m.projectId === memory.projectId);
  const updated = { ...memory, updatedAt: new Date().toISOString() };
  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.push(updated);
  }
  writeAll(all);
}

/** Ersätter alla anteckningar för ett projekt. */
export function updateProjectNotes(projectId: string, notes: string[]): void {
  const memory = getProjectMemoryById(projectId);
  saveProjectMemory({ ...memory, userNotes: notes });
}

/** Lägger till en anteckning för ett projekt. */
export function addProjectNote(projectId: string, note: string): void {
  const trimmed = note.trim();
  if (!trimmed) return;
  const memory = getProjectMemoryById(projectId);
  saveProjectMemory({ ...memory, userNotes: [...memory.userNotes, trimmed] });
}

/** Tar bort en anteckning (via index) från ett projekt. */
export function deleteProjectNote(projectId: string, noteIndex: number): void {
  const memory = getProjectMemoryById(projectId);
  const updated = memory.userNotes.filter((_, i) => i !== noteIndex);
  saveProjectMemory({ ...memory, userNotes: updated });
}

/** Återställer användarens anteckningar för ett projekt (tar ej bort inbyggda noter). */
export function resetProjectMemory(projectId: string): void {
  const all = readAll().filter((m) => m.projectId !== projectId);
  writeAll(all);
}
