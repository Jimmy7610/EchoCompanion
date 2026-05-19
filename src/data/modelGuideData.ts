// ============================================================
// modelGuideData.ts — Lokal modellguide för Ollama-modeller
// Data används i Modellguide-sektionen och vid modellval.
// ============================================================

export type PerformanceLevel = "Snabb" | "Medel" | "Tung";

// INSTÄLLNING - Tillgängliga uppgiftskategorier för modellrekommendationer
export type ModelTask =
  | "general-chat"
  | "code"
  | "writing"
  | "analysis"
  | "fast"
  | "project-planning"
  | "vision"
  | "creative"
  | "swedish";

export const MODEL_TASK_LABELS: Record<ModelTask, string> = {
  "general-chat": "Vanlig chat",
  code: "Kod",
  writing: "Skriva text",
  analysis: "Analysera",
  fast: "Snabba svar",
  "project-planning": "Projektplanering",
  vision: "Bildanalys",
  creative: "Kreativt arbete",
  swedish: "Svenska texter",
};

export interface ModelFamily {
  id: string;
  displayName: string;
  emoji: string;
  /** Kortfattad beskrivning på svenska */
  description: string;
  /** Vad modellen passar bäst för */
  bestFor: string;
  /** Konkret tips till användaren */
  tip: string;
  /** Ungefärlig prestanda på konsumenthårdvara */
  performance: PerformanceLevel;
  /** Nycklar för namnmatchning (lowercase) */
  matchKeys: string[];
  /** Uppgiftskategorier som modellen rekommenderas för, i prioritetsordning */
  recommendedTasks?: ModelTask[];
  /** Varning som visas när modellen är aktiv */
  warning?: string;
}

// INSTÄLLNING - Lägg till nya modellfamiljer här
export const MODEL_FAMILIES: ModelFamily[] = [
  {
    id: "llama",
    displayName: "Llama",
    emoji: "🦙",
    description:
      "Metas populära öppna modellserie. Mångsidig och pålitlig för de flesta uppgifter — bra standardval om du är osäker.",
    bestFor:
      "Generella frågor, sammanfattningar, förklaringar och konversation.",
    tip: "Llama 3.1 8B är ett utmärkt val för daglig användning med bra balans mellan hastighet och kvalitet.",
    performance: "Medel",
    matchKeys: ["llama"],
    recommendedTasks: ["general-chat", "writing", "swedish", "creative", "project-planning", "analysis"],
  },
  {
    id: "qwen",
    displayName: "Qwen",
    emoji: "🧮",
    description:
      "Stark modell för kod, struktur, tekniska instruktioner och logik. Alibabas open-source alternativ med imponerande prestanda.",
    bestFor: "Kod, felsökning, projektplanering och tydliga steg-för-steg-svar.",
    tip: "Välj Qwen när du vill skapa prompts till Claude Code eller analysera kod. Qwen2.5-Coder är specialbyggd för programmering.",
    performance: "Medel",
    matchKeys: ["qwen"],
    recommendedTasks: ["code", "project-planning", "analysis", "general-chat", "swedish"],
  },
  {
    id: "mistral",
    displayName: "Mistral",
    emoji: "💨",
    description:
      "Snabb och effektiv europeisk modell. Utmärkt för resonemang och instruktionföljning med låg resursanvändning.",
    bestFor:
      "Snabba svar, instruktioner, textanalys och uppgifter som kräver låg latens.",
    tip: "Mistral 7B är bland de snabbaste alternativen för lokal körning — perfekt om du har begränsat RAM.",
    performance: "Snabb",
    matchKeys: ["mistral"],
    recommendedTasks: ["fast", "general-chat", "swedish", "writing", "analysis"],
  },
  {
    id: "gemma",
    displayName: "Gemma",
    emoji: "💎",
    description:
      "Googles kompakta öppna modell. Vältränad och säkerhetsfokuserad, bra för allmänna uppgifter på lite hårdvara.",
    bestFor: "Lätta uppgifter, förklaringar och konversation på äldre/enklare datorer.",
    tip: "Gemma 2 2B kan köras på nästan vilken dator som helst. Bra om du har ont om VRAM.",
    performance: "Snabb",
    matchKeys: ["gemma"],
    recommendedTasks: ["fast", "general-chat"],
  },
  {
    id: "deepseek",
    displayName: "DeepSeek",
    emoji: "🔍",
    description:
      "Kraftfull kodmodell från DeepSeek med stark prestanda på kodgenerering och logik. Konkurrerar med mycket större modeller.",
    bestFor: "Avancerad kodgenerering, algoritmer, matematik och logiska problem.",
    tip: "DeepSeek-Coder-V2 är ett av de bästa lokala alternativen för serius programmering. Kräver dock mer minne.",
    performance: "Tung",
    matchKeys: ["deepseek"],
    recommendedTasks: ["code", "analysis"],
  },
  {
    id: "phi",
    displayName: "Phi",
    emoji: "🔬",
    description:
      "Microsofts lilla men kapabla modellserie. Phi-4 levererar häpnadsväckande resultat för sin storlek.",
    bestFor:
      "Resonemang, kod, matematik och uppgifter som kräver precision på begränsad hårdvara.",
    tip: "Phi-4-mini är perfekt om du vill ha kvalitetssvar utan att bränna GPU-minnet. Bra för Claude Code-integration.",
    performance: "Snabb",
    matchKeys: ["phi"],
    recommendedTasks: ["fast", "code", "general-chat"],
  },
  {
    id: "codellama",
    displayName: "CodeLlama",
    emoji: "🦙💻",
    description:
      "Metas Llama finjusterad specifikt för kod. Förstår och genererar kod i många programmeringsspråk.",
    bestFor: "Kodfullbordning, förklaring av kod, refaktorering och debuggning.",
    tip: "Kör CodeLlama 13B om du primärt arbetar med kod och vill ha Llama-kvalitet med kodspecialisering.",
    performance: "Medel",
    matchKeys: ["codellama", "code-llama"],
    recommendedTasks: ["code"],
  },
  {
    id: "starcoder",
    displayName: "StarCoder",
    emoji: "⭐",
    description:
      "Tränad på enorma mängder offentlig kod från GitHub. Stark på kodfullbordning och förståelse av kodstruktur.",
    bestFor: "Kodfullbordning, boilerplate-generering och arbete med okänd kodbas.",
    tip: "StarCoder2 15B ger bra resultat för kodfullbordning men är tung. Prova 3B-varianten för snabbare svar.",
    performance: "Tung",
    matchKeys: ["starcoder", "star-coder"],
    recommendedTasks: ["code"],
  },
  {
    id: "dolphin",
    displayName: "Dolphin",
    emoji: "🐬",
    description:
      "Instruktionsfinjusterad modell utan content-filter. Flexibel och följsam för kreativa och tekniska uppgifter.",
    bestFor:
      "Kreativt skrivande, rollspel, konversation och uppgifter som kräver mer frihet.",
    tip: "Dolphin-Mistral kombinerar Mistrals hastighet med Dolphins flexibilitet. Bra för berättandeprojekt som Taren.",
    performance: "Medel",
    matchKeys: ["dolphin"],
    recommendedTasks: ["creative", "writing", "general-chat"],
  },
  {
    id: "nous",
    displayName: "Nous / Hermes",
    emoji: "🏛️",
    description:
      "Nous Research's finjusteringar av populära basmodeller. Känd för starka instruktionföljande och konversationsförmåga.",
    bestFor: "Komplexa instruktioner, agentic tasks, strukturerade svar och analyser.",
    tip: "Hermes 3 på Llama 3.1 är ett av de bästa open-source alternativen för komplex resonering. Rekommenderat för JarvisBrain.",
    performance: "Medel",
    matchKeys: ["nous", "hermes"],
    recommendedTasks: ["analysis", "project-planning", "writing", "general-chat"],
  },
  {
    id: "mixtral",
    displayName: "Mixtral (MoE)",
    emoji: "🌪️",
    description:
      "Mixture-of-Experts-arkitektur från Mistral. Kombinerar flera expertmodeller för hög kvalitet med relativt effektiv körning.",
    bestFor: "Avancerade uppgifter som kräver bred kunskap: analys, sammanfattning och komplex resonering.",
    tip: "Mixtral 8x7B kräver 32+ GB RAM/VRAM men ger nästan GPT-4-klass svar lokalt. För kraftfulla maskiner.",
    performance: "Tung",
    matchKeys: ["mixtral", "moe"],
    recommendedTasks: ["analysis", "writing", "general-chat"],
  },
  {
    id: "llava",
    displayName: "LLaVA",
    emoji: "👁️",
    description:
      "Large Language and Vision Assistant — en multimodal modell som kan analysera bilder och text tillsammans. Baseras på Llama eller Mistral.",
    bestFor: "Bildanalys, bildtolkning och uppgifter som kombinerar bild och text.",
    tip: "LLaVA passar bäst när du vill beskriva eller fråga om bilder. För ren textchatt ger vanliga modeller bättre resultat.",
    performance: "Medel",
    matchKeys: ["llava"],
    recommendedTasks: ["vision"],
    warning: "LLaVA är en bildmodell och passar bäst för bildanalys. Vid vanlig textchatt kan den ge sämre resultat än en textmodell.",
  },
];

/**
 * Slår upp modellguide-data baserat på modellnamnet.
 * Returnerar null om ingen matchning hittas.
 */
export function findModelFamily(modelName: string): ModelFamily | null {
  const name = modelName.toLowerCase();
  return (
    MODEL_FAMILIES.find((family) =>
      family.matchKeys.some((key) => name.includes(key))
    ) ?? null
  );
}
