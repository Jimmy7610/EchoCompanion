// ============================================================
// modelRecommendation.ts — Regelbaserade modellrekommendationer
// Inga externa anrop — all logik är lokal namnmatchning.
// ============================================================

import { findModelFamily, MODEL_TASK_LABELS } from "../../data/modelGuideData";
import type { ModelTask } from "../../data/modelGuideData";
import type { OllamaModel } from "../ollama/ollamaService";

export type { ModelTask };
export { MODEL_TASK_LABELS };

// INSTÄLLNING - Profilernas föredragna uppgiftskategorier
const PROFILE_TASK_MAP: Record<string, ModelTask> = {
  kodmentor: "code",
  bokredaktor: "writing",
  promptmastare: "general-chat",
};

// INSTÄLLNING - Namnmönster som indikerar liten/svag modell
const SMALL_MODEL_PATTERNS = ["0.5b", "1b", "1.5b", "2b", "mini", "tiny", "small"];

/**
 * Returnerar det bäst matchande installerade modellnamnet för given uppgift.
 * Prioritetsordning baseras på familjens recommendedTasks-lista (lägre index = högre prioritet).
 */
export function getModelRecommendationForTask(
  task: ModelTask,
  installedModels: OllamaModel[]
): string | null {
  if (installedModels.length === 0) return null;

  let bestModel: string | null = null;
  let bestScore = -1;

  for (const model of installedModels) {
    const family = findModelFamily(model.name);
    if (!family?.recommendedTasks) continue;
    const idx = family.recommendedTasks.indexOf(task);
    if (idx === -1) continue;
    // Invert index so that first entry (index 0) gets highest score
    const score = 100 - idx;
    if (score > bestScore) {
      bestScore = score;
      bestModel = model.name;
    }
  }

  return bestModel;
}

/**
 * Returnerar rekommenderad modell baserat på aktiv kompanjonprofil.
 */
export function getRecommendedModelForProfile(
  profileId: string | null,
  installedModels: OllamaModel[]
): string | null {
  if (!profileId || installedModels.length === 0) return null;
  const task = PROFILE_TASK_MAP[profileId];
  if (!task) return null;
  return getModelRecommendationForTask(task, installedModels);
}

/**
 * Returnerar en lista med modellens styrkor (uppgiftsetiketter på svenska).
 */
export function getModelStrengths(modelName: string): string[] {
  const family = findModelFamily(modelName);
  if (!family?.recommendedTasks) return [];
  return family.recommendedTasks.map((t) => MODEL_TASK_LABELS[t] ?? t);
}

/**
 * Returnerar eventuella varningar för den valda modellen.
 * Kontrollerar familjevarning samt om modellen ser ut att vara liten.
 */
export function getModelWarnings(modelName: string): string[] {
  const warnings: string[] = [];
  const family = findModelFamily(modelName);
  if (family?.warning) warnings.push(family.warning);

  const nameLower = modelName.toLowerCase();
  if (SMALL_MODEL_PATTERNS.some((p) => nameLower.includes(p))) {
    warnings.push("Liten modell — kan ge kortare eller enklare svar än större varianter.");
  }

  return warnings;
}

/**
 * Sorterar installerade modeller efter lämplighet för given uppgift.
 * Modeller utan matchande familj hamnar sist.
 */
export function rankInstalledModels(
  models: OllamaModel[],
  task: ModelTask
): OllamaModel[] {
  return [...models].sort((a, b) => {
    const fa = findModelFamily(a.name);
    const fb = findModelFamily(b.name);
    const ia = fa?.recommendedTasks?.indexOf(task) ?? -1;
    const ib = fb?.recommendedTasks?.indexOf(task) ?? -1;
    if (ia === -1 && ib === -1) return 0;
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
