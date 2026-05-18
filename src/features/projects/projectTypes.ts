// ============================================================
// projectTypes.ts — Typdefinitioner och fördefinierade projekt
// ============================================================

/** Ett EchoCompanion-projekt */
export interface Project {
  id: string;
  name: string;
  icon: string;
  shortDescription: string;
  status: string;
  rules: string[];         // Inbyggda regler som skickas till AI
  notes: string[];         // Inbyggda anteckningar om projektet
  suggestedPrompts: string[];
}

// INSTÄLLNING - Lägg till, ta bort eller redigera projekt här
export const DEFAULT_PROJECTS: Project[] = [
  {
    id: "taren",
    name: "Taren",
    icon: "🌿",
    shortDescription: "Kreativ, lugn och märklig webbplats byggd i Vanilla HTML/CSS/JS.",
    status: "Pågår",
    rules: [
      "Endast Vanilla HTML, CSS och JavaScript.",
      "Inga ramverk och inga dependencies om Jimmy inte uttryckligen säger annat.",
      "Engelska är standardspråk på sidorna.",
      "Dark mode och light mode ska finnas på alla sidor.",
      "Alla nya spel och experiment ska vara isolerade i egna mappar.",
      "Pushnummer/version ska synas tydligt på sidan när relevant.",
    ],
    notes: [
      "Taren ska kännas märklig men skön, personlig, nyfiken och tillåtande.",
      "Ton: lugn, poetisk, varm och ibland absurt rolig.",
    ],
    suggestedPrompts: [
      "Skriv en Claude Code-prompt för nästa säkra Taren-steg.",
      "Ge mig en liten experimentidé för Taren.",
      "Kontrollera att detta följer Tarens regler.",
    ],
  },
  {
    id: "echodraft",
    name: "EchoDraft",
    icon: "📝",
    shortDescription: "Lokal bokuppläsarapp med Piper och svensk röst.",
    status: "Planerad / pågår",
    rules: [
      "Budgeten är 0 kr.",
      "All uppläsning ska kunna fungera lokalt.",
      "Piper är förstahandsval för lokal TTS.",
      "Appen ska hjälpa Jimmy läsa upp manus och Markdown-filer.",
    ],
    notes: [
      "EchoDraft ska vara ett författarverktyg.",
      "Fokus är svensk röst och enkel användning.",
    ],
    suggestedPrompts: [
      "Planera nästa steg för EchoDraft.",
      "Skriv en installationsguide för Piper.",
      "Förklara hur lokal TTS ska kopplas in.",
    ],
  },
  {
    id: "jarvisbrain",
    name: "JarvisBrain",
    icon: "🧠",
    shortDescription: "Lokal AI-assistent / hjärna för projekt, idéer och automation.",
    status: "Idé / planering",
    rules: [
      "Budgeten är 0 kr.",
      "Lokala LLM:er och Ollama ska prioriteras.",
      "Inga betalda API:er får krävas.",
      "Säkerhet och tydliga begränsningar är viktigare än full automation.",
    ],
    notes: [
      "JarvisBrain ska inte få fri tillgång till hela datorn.",
      "All verktygsanvändning ska vara tydligt godkänd och begränsad.",
    ],
    suggestedPrompts: [
      "Gör en säker roadmap för JarvisBrain.",
      "Vilka lokala funktioner bör byggas först?",
      "Förklara risker med lokala AI-agenter.",
    ],
  },
  {
    id: "wilma-foto",
    name: "Wilma Foto",
    icon: "📷",
    shortDescription: "Fotosida/projekt där Supabase och bildflöden kan vara relevanta.",
    status: "Pågår",
    rules: [
      "Vid ändringar som påverkar datamodell, sparning, metadata eller Supabase-flöden ska Jimmy påminnas om SQL, kolumner, RLS/policies, storage-inställningar och schema reload.",
      "Undvik stora riskabla ändringar i fungerande delar.",
      "Ge exakta filvägar och konkreta instruktioner.",
    ],
    notes: [
      "Projektet kan påverkas av Supabase-kvoter och databasstruktur.",
    ],
    suggestedPrompts: [
      "Granska denna ändring för Wilma Foto.",
      "Behöver Supabase ändras för detta?",
      "Skriv en säker Claude Code-prompt för Wilma Foto.",
    ],
  },
  {
    id: "synthpixelstudios",
    name: "SynthPixelStudios",
    icon: "🎨",
    shortDescription: "AI-genererad konst, sociala medier, prompts, reels och visuellt innehåll.",
    status: "Pågår",
    rules: [
      "Prompts ska ofta vara hyperrealistic, hyperdetailed, cinematic när det gäller bildgenerering.",
      "Bildprompts ska skrivas på engelska med svensk förklaring efteråt när relevant.",
      "Innehåll ska kunna användas för sociala medier.",
    ],
    notes: [
      "Fokus på AI-konst, reels, captions och visuella idéer.",
    ],
    suggestedPrompts: [
      "Skapa 10 captions för en AI-bild.",
      "Skriv en detaljerad bildprompt.",
      "Planera en reel för SynthPixelStudios.",
    ],
  },
];
