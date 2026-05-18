// ============================================================
// promptStorage.ts — Lokal sparning av egna promptmallar via localStorage
// ============================================================

import type { PromptTemplate, PromptCategory } from "./promptTypes";
import { BUILT_IN_PROMPT_TEMPLATES } from "../../data/promptTemplates";

// INSTÄLLNING - Ändra bara om lagringsformatet behöver återställas (raderar egna prompts)
const CUSTOM_PROMPTS_KEY = "echocompanion.customPrompts.v1";

// ============================================================
// Interna hjälpfunktioner
// ============================================================

function readCustomTemplates(): PromptTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_PROMPTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PromptTemplate[];
  } catch (err) {
    console.warn("EchoCompanion: Kunde inte läsa egna promptmallar.", err);
    return [];
  }
}

function writeCustomTemplates(templates: PromptTemplate[]): void {
  try {
    localStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error("EchoCompanion: Kunde inte spara egna promptmallar.", err);
  }
}

// ============================================================
// Publika API-funktioner
// ============================================================

/** Returnerar alla egna (användar-skapade) promptmallar. */
export function getCustomPromptTemplates(): PromptTemplate[] {
  return readCustomTemplates();
}

/**
 * Returnerar alla mallar — inbyggda + egna.
 * Inbyggda visas alltid först.
 */
export function getAllPromptTemplates(): PromptTemplate[] {
  return [...BUILT_IN_PROMPT_TEMPLATES, ...readCustomTemplates()];
}

/** Sparar en ny eller uppdaterar en befintlig egen promptmall. */
export function saveCustomPromptTemplate(template: PromptTemplate): void {
  const all = readCustomTemplates();
  const idx = all.findIndex((t) => t.id === template.id);
  const now = new Date().toISOString();
  const updated = { ...template, updatedAt: now, isBuiltIn: false };
  if (idx >= 0) {
    all[idx] = updated;
  } else {
    all.push({ ...updated, createdAt: updated.createdAt ?? now });
  }
  writeCustomTemplates(all);
}

/** Uppdaterar specifika fält på en befintlig egen promptmall. */
export function updateCustomPromptTemplate(
  templateId: string,
  updates: Partial<Omit<PromptTemplate, "id" | "isBuiltIn" | "createdAt">>
): void {
  const all = readCustomTemplates();
  const idx = all.findIndex((t) => t.id === templateId);
  if (idx < 0) {
    console.warn(`EchoCompanion: Promptmall ${templateId} hittades inte.`);
    return;
  }
  all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
  writeCustomTemplates(all);
}

/** Tar bort en egen promptmall. Inbyggda mallar kan inte tas bort. */
export function deleteCustomPromptTemplate(templateId: string): void {
  const all = readCustomTemplates().filter((t) => t.id !== templateId);
  writeCustomTemplates(all);
}

/** Skapar en ny egen promptmall från indata. */
export function createCustomPromptTemplate(input: {
  title: string;
  category: PromptCategory;
  description: string;
  template: string;
  tags: string[];
}): PromptTemplate {
  const now = new Date().toISOString();
  const newTemplate: PromptTemplate = {
    id: `custom_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };
  saveCustomPromptTemplate(newTemplate);
  return newTemplate;
}
