// ============================================================
// promptTypes.ts — Typdefinitioner för promptbiblioteket
// ============================================================

/** Alla tillgängliga kategorier för promptmallar */
export type PromptCategory =
  | "code"
  | "project"
  | "image"
  | "writing"
  | "social"
  | "analysis"
  | "ollama"
  | "claude-code"
  | "antigravity"
  | "general";

/** Svenska visningsnamn för kategorierna */
export const CATEGORY_LABELS: Record<PromptCategory, string> = {
  "code":         "Kod",
  "project":      "Projekt",
  "image":        "Bild",
  "writing":      "Skrivande",
  "social":       "Sociala medier",
  "analysis":     "Analys",
  "ollama":       "Ollama",
  "claude-code":  "Claude Code",
  "antigravity":  "Antigravity",
  "general":      "Allmänt",
};

/** En enskild promptmall */
export interface PromptTemplate {
  id: string;
  title: string;
  category: PromptCategory;
  description: string;
  template: string;    // Det faktiska promptinnehållet
  tags: string[];
  isBuiltIn: boolean;
  createdAt?: string;  // ISO 8601 — sätts vid skapande
  updatedAt?: string;  // ISO 8601 — uppdateras vid redigering
}
