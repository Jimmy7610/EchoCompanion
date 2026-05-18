// ============================================================
// systemPrompts.ts — Systemprompt-byggare för EchoCompanion
// ============================================================

import { COMPANION_PROFILES } from "./settingsTypes";
import type { Project } from "../projects/projectTypes";

// INSTÄLLNING - Basprompten skickas alltid, oavsett vald profil
function getBaseSystemPrompt(): string {
  return `Du är EchoCompanion — en lokal AI-assistent som körs helt på användarens dator utan molntjänster.

Grundregler:
- Svara alltid på svenska om användaren inte specifikt skriver på ett annat språk
- Var koncis och konkret — undvik onödigt långa svar om de inte behövs
- Om du är osäker på något — säg det ärligt istället för att gissa
- Du drivs av en lokal Ollama-modell och har inte tillgång till internet eller externa tjänster

Samtalsminne:
- Kom ihåg information som användaren berättar tidigare i samma samtal och använd den när användaren ställer följdfrågor
- Om användaren berättar sitt namn i samtalet ska du kunna använda namnet senare i samma samtal
- Hela konversationshistoriken finns tillgänglig — använd den för att ge sammanhängande och relevanta svar`;
}

function getProfileSystemPrompt(profileId: string): string | null {
  const profile = COMPANION_PROFILES.find((p) => p.id === profileId);
  return profile?.systemPrompt ?? null;
}

/**
 * Bygger projektkontext-strängen från ett projekt och eventuella
 * användaranteckningar. Returnerar tom sträng om inget projekt.
 */
export function buildProjectContextString(
  project: Project,
  userNotes: string[]
): string {
  const allNotes = [...project.notes, ...userNotes].filter((n) => n.trim().length > 0);

  const lines: string[] = [
    "AKTIVT PROJEKT:",
    `Namn: ${project.name}`,
    `Beskrivning: ${project.shortDescription}`,
    `Status: ${project.status}`,
  ];

  if (project.rules.length > 0) {
    lines.push("\nRegler:");
    project.rules.forEach((r) => lines.push(`- ${r}`));
  }

  if (allNotes.length > 0) {
    lines.push("\nAnteckningar:");
    allNotes.forEach((n) => lines.push(`- ${n}`));
  }

  lines.push(
    "\nAnvänd denna projektkontext när du svarar. Om användaren ber om något som bryter mot projektets regler, påpeka det vänligt och föreslå ett säkrare alternativ."
  );

  return lines.join("\n");
}

/** Bygger det fullständiga systemprompt som skickas till Ollama */
export function buildSystemPrompt(
  profileId: string | null,
  projectContext?: string
): string {
  const parts: string[] = [getBaseSystemPrompt()];

  if (profileId) {
    const profilePrompt = getProfileSystemPrompt(profileId);
    if (profilePrompt) {
      parts.push(profilePrompt);
    }
  }

  // INSTÄLLNING - Projektkontext läggs till sist om den finns
  if (projectContext && projectContext.trim().length > 0) {
    parts.push(projectContext);
  }

  return parts.join("\n\n---\n\n");
}
