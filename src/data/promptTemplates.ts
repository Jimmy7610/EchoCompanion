// ============================================================
// promptTemplates.ts — Inbyggda promptmallar
// ============================================================

import type { PromptTemplate } from "../features/prompts/promptTypes";

// INSTÄLLNING - Lägg till, ta bort eller redigera inbyggda mallar här
export const BUILT_IN_PROMPT_TEMPLATES: PromptTemplate[] = [
  // ---- Claude Code ----
  {
    id: "builtin-claudecode-safe-patch",
    title: "Säker ändring med Claude Code",
    category: "claude-code",
    description: "Be Claude Code göra en liten, välavgränsad ändring utan att röra resten av koden.",
    tags: ["claude-code", "säker", "patch", "ändring"],
    isBuiltIn: true,
    template: `Du är en försiktig och erfaren senior-utvecklare som hjälper mig med en specifik kodändring.

Uppgift: [BESKRIV ÄNDRINGEN I EN MENING]
Fil: [FILSÖKVÄG, t.ex. src/components/MinKomponent.tsx]

Regler du MÅSTE följa:
- Gör BARA den begärda ändringen, ingenting annat
- Skriv inte om filer som inte behöver ändras
- Rör inte existerande kommentarer eller formattering
- Kontrollera att TypeScript kompilerar rent: npx tsc --noEmit
- Om filen är stor (>200 rader), läs den FÖRST och bekräfta att du förstår strukturen
- Om du är osäker på något, fråga INNAN du ändrar
- Inga kreativa förbättringar — BARA det som efterfrågas

Sammanfatta vilket rader som ändrades när du är klar.`,
  },

  // ---- Antigravity ----
  {
    id: "builtin-antigravity-safe-step",
    title: "Antigravity: Säkert projektsteg",
    category: "antigravity",
    description: "Implementera ett väldefinierat nästa steg i Antigravity-projektet utan oönskade sidoeffekter.",
    tags: ["antigravity", "steg", "säker", "tsc"],
    isBuiltIn: true,
    template: `Implementera ett säkert och väldefinierat nästa steg i projektet.

Steg att implementera:
[BESKRIV STEGET KORTFATTAT — en sak i taget]

Berörda filer (uppskattning):
[LISTA FILSÖKVÄGAR]

Obligatoriska regler:
- Gör BARA det beskrivna steget, inga extra förbättringar
- Kör alltid: npx tsc --noEmit och kontrollera att det är rent
- Testa manuellt i webbläsaren innan du rapporterar klart
- Pusha INTE till main om det finns TypeScript-fel eller visuella regressioner
- Om en fil är stor (>200 rader), läs den FÖRST och bekräfta strukturen
- Beskriv exakt vad som ändrades och i vilka filer

Visa alla ändrade filer i din sammanfattning.`,
  },

  // ---- Taren ----
  {
    id: "builtin-taren-new-experiment",
    title: "Taren: Ny experimentssida",
    category: "project",
    description: "Skapa en ny isolerad Taren-sida med Vanilla HTML/CSS/JS, dark/light mode och versionsnummer.",
    tags: ["taren", "experiment", "vanilla", "html", "css", "js"],
    isBuiltIn: true,
    template: `Skapa en ny isolerad experimentssida för Taren-webbplatsen.

Experiment: [NAMN PÅ EXPERIMENTET]
Beskrivning: [VAD SIDAN SKA GÖRA ELLER VISA]

Regler (MÅSTE följas):
- Placera all kod i en ny isolerad mapp: experiments/[experimentnamn]/
- Använd BARA Vanilla HTML, CSS och JavaScript
- Inga ramverk, inga npm-paket, inga externa dependencies
- Standardspråk är engelska på sidan
- Dark mode och light mode ska finnas (CSS-variabler eller data-theme-attribut)
- Pushnummer/version ska visas tydligt, t.ex. "v0.1 / push 1"
- Sidan ska fungera helt offline

Känsla och ton: märklig, skön, personlig, nyfiken och tillåtande.`,
  },
  {
    id: "builtin-taren-review-rules",
    title: "Taren: Kontrollera regler",
    category: "project",
    description: "Verifiera att en planerad Taren-ändring följer projektets regler innan den implementeras.",
    tags: ["taren", "regler", "kontroll", "review"],
    isBuiltIn: true,
    template: `Kontrollera om den planerade ändringen följer Tarens regler.

Planerad ändring:
[BESKRIV DEN PLANERADE ÄNDRINGEN]

Relevanta filer:
[LISTA FILSÖKVÄGAR OM MÖJLIGT]

Kontrollera mot Tarens regler:
1. Används BARA Vanilla HTML, CSS och JavaScript?
2. Introduceras inga ramverk eller dependencies?
3. Är standardspråket engelska om sidan har text?
4. Finns dark mode och light mode?
5. Är ändringen isolerad i rätt mapp?
6. Visas version/pushnummer om relevant?

Ge ett tydligt svar: Godkänd / Ej godkänd, och förklara exakt varför.`,
  },

  // ---- EchoDraft ----
  {
    id: "builtin-echodraft-piper-setup",
    title: "EchoDraft: Piper TTS-setup",
    category: "project",
    description: "Planera eller implementera lokal Piper TTS för EchoDraft. Budget 0 kr, allt lokalt.",
    tags: ["echodraft", "piper", "tts", "uppläsning", "lokal"],
    isBuiltIn: true,
    template: `Planera eller implementera lokal Piper TTS-integration för EchoDraft.

Mål (välj ett):
[Planera arkitektur / Skriv installationsguide för Piper / Koppla in Piper i appen]

Regler och begränsningar:
- Budget: 0 kr — allt ska vara gratis och lokalt
- Piper är förstavalet för lokal TTS
- Rösten ska fungera utan internetanslutning
- Appen ska kunna läsa upp Markdown-filer och manus-text
- Fokus på svensk röst när möjligt

Min specifika fråga eller uppgift:
[BESKRIV DIN FRÅGA ELLER UPPGIFT]`,
  },

  // ---- Wilma Foto ----
  {
    id: "builtin-wilma-supabase-check",
    title: "Wilma Foto: Supabase-säkerhetskontroll",
    category: "project",
    description: "Kontrollera om en Wilma Foto-ändring kräver SQL, RLS, storage eller schema-ändringar i Supabase.",
    tags: ["wilma", "supabase", "sql", "rls", "storage", "säkerhet"],
    isBuiltIn: true,
    template: `Kontrollera om den planerade Wilma Foto-ändringen kräver uppdateringar i Supabase.

Planerad ändring:
[BESKRIV ÄNDRINGEN]

Kontrollera följande punkter:
1. Påverkas datamodellen? (tabeller, kolumner, datatyper)
2. Behövs nya eller ändrade SQL-migrationer?
3. Påverkas RLS-policies eller säkerhetsregler?
4. Berörs Supabase Storage-buckets eller inställningar?
5. Krävs schema reload i klientkoden?
6. Kan ändringen oavsiktligt påverka befintlig data?
7. Finns risk för att kvoten överskrids?

Ge konkreta instruktioner för varje berörd punkt.
Inkludera exakta filvägar och SQL-kommandon där möjligt.`,
  },

  // ---- Bild ----
  {
    id: "builtin-image-hyperrealistic",
    title: "Bildprompt: Hyperrealistisk cinematic",
    category: "image",
    description: "Generera en engelsk bildprompt med hyperrealistisk cinematic-stil plus svensk beskrivning.",
    tags: ["bild", "prompt", "hyperrealistic", "cinematic", "ai-art"],
    isBuiltIn: true,
    template: `Skapa en detaljerad bildprompt för följande motiv.

Motiv: [BESKRIV MOTIVET PÅ SVENSKA]
Stil: [t.ex. porträtt / landskap / abstrakt / sci-fi / fantasy]
Känsla: [t.ex. dramatisk / lugn / mystisk / levande / mörk]

Generera exakt detta:

1. BILDPROMPT (på engelska):
Börja med: "hyperrealistic, hyperdetailed, cinematic light, 8k resolution,"
Fortsätt med motivet, miljö, ljussättning, kameravinkel och stämning.
Avsluta med lämpligt bildformat, t.ex. "--ar 16:9"

2. SVENSK BESKRIVNING:
Beskriv bilden på svenska (max 2 meningar) för användning som bildtext eller caption.`,
  },

  // ---- Sociala medier ----
  {
    id: "builtin-social-captions",
    title: "Sociala medier: Skapa captions",
    category: "social",
    description: "Generera 10 varierade captions för ett socialt medier-inlägg med valfri ton och plattform.",
    tags: ["social", "captions", "instagram", "tiktok", "ai-art"],
    isBuiltIn: true,
    template: `Skapa 10 captions för ett socialt medier-inlägg.

Innehåll: [BESKRIV BILDEN ELLER INLÄGGET]
Plattform: [Instagram / TikTok / LinkedIn / Facebook / X]
Ton: [t.ex. inspirerande / rolig / professionell / personlig / poetisk]
Hashtags: [JA / NEJ / specificera om du vill ha specifika]
Språk: [SVENSKA / ENGELSKA]

Generera 10 varianter med lite olika ton och längd.
Inkludera relevanta emojis om det passar plattformen.
Numrera varianterna 1–10.`,
  },

  // ---- Kod ----
  {
    id: "builtin-code-explain-file",
    title: "Kodmentor: Förklara fil",
    category: "code",
    description: "Förklara en hel kodfil — syfte, struktur, mönster och ovanliga delar — anpassat för junior nivå.",
    tags: ["kod", "förklaring", "lärande", "junior"],
    isBuiltIn: true,
    template: `Förklara kodfilen nedan för mig.

[KLISTRA IN KODFILEN HÄR]

Förklara:
1. Vad är filens syfte och roll i projektet?
2. Vilka är de viktigaste funktionerna, klasserna eller komponenterna?
3. Finns det designmönster eller arkitekturbeslut att notera?
4. Finns det något ovanligt, komplext eller oväntat i koden?
5. Hur hänger filen ihop med resten av projektet (om du vet)?

Anpassa förklaringen för en junior utvecklare.
Använd konkreta exempel och undvik onödigt jargong.`,
  },
  {
    id: "builtin-code-bugfix-plan",
    title: "Kodmentor: Bugfix-plan",
    category: "code",
    description: "Planera en säker bugfix-strategi med rotorsak, riskanalys och testplan — INNAN någon kod ändras.",
    tags: ["kod", "bugfix", "plan", "riskanalys", "test"],
    isBuiltIn: true,
    template: `Hjälp mig planera en säker bugfix INNAN jag gör några ändringar.

Buggbeskrivning:
[BESKRIV BUGGEN — vad som händer, vad som borde hända, hur man reproducerar]

Relevanta filer / kod:
[LISTA FILER ELLER KLISTRA IN RELEVANT KOD]

Ge mig:
1. Trolig rotorsak (med hög / medel / låg konfidensgrad)
2. Föreslagen fix (beskriv i ord, inga kodändringar ännu)
3. Riskanalys — kan fixet påverka annat i koden?
4. Testplan — hur kontrollerar vi att buggen är löst?
5. Alternativ lösning om din första idé inte fungerar

Ändringar görs INTE förrän vi är överens om planen.`,
  },

  // ---- Skrivande ----
  {
    id: "builtin-writing-chapter-analysis",
    title: "Bokredaktör: Kapitelanalys",
    category: "writing",
    description: "Analysera ett kapitel eller textavsnitt med styrkor, svagheter och konkreta förbättringsförslag.",
    tags: ["skrivande", "analys", "kapitel", "feedback", "redigering"],
    isBuiltIn: true,
    template: `Analysera följande kapitel eller textavsnitt och ge detaljerad feedback.

[KLISTRA IN TEXTEN HÄR]

Ge feedback på:
1. STYRKOR — vad fungerar bra (specifikt, med citat från texten)
2. SVAGHETER — vad kan förbättras (specifikt, med citat)
3. TEMPO OCH RYTM — fungerar det?
4. KARAKTÄRER — är de trovärdiga och konsistenta?
5. DIALOG — naturlig eller konstlad?
6. KONKRETA FÖRSLAG — minst 3 specifika omskrivningar

Var ärlig och konstruktiv. Sann feedback är mer värd än tom bekräftelse.
Skriv feedback på svenska.`,
  },

  // ---- Ollama ----
  {
    id: "builtin-ollama-model-comparison",
    title: "Ollama: Jämför modeller",
    category: "ollama",
    description: "Jämför dina installerade Ollama-modeller för en specifik uppgift och få en rekommendation.",
    tags: ["ollama", "modell", "jämförelse", "rekommendation"],
    isBuiltIn: true,
    template: `Jämför mina installerade Ollama-modeller för en specifik uppgift.

Uppgiften jag vill lösa:
[BESKRIV UPPGIFTEN — t.ex. skriva kod, analysera text, skapa bildprompts, general chat]

Mina installerade modeller:
[LISTA MODELLNAMNEN — eller kör: ollama list]

Bedöm varje modell på:
- Lämplighet för uppgiften (Utmärkt / Bra / Godkänd / Ej lämplig)
- Hastighetsprofil (snabb / medel / långsam)
- Kontextfönster (om du vet)
- Ungefärligt RAM-behov

Ge din rekommendation med motivering.
Nämn om det finns en bättre modell att hämta med: ollama pull [modellnamn]`,
  },
];
