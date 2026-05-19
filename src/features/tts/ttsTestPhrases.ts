// ============================================================
// ttsTestPhrases.ts — Svenska testfraser för TTS-kalibrering
// ============================================================

export interface TtsTestPhrase {
  label: string;
  text: string;
}

// INSTÄLLNING - Lägg till eller ändra testfraser nedan
export const TTS_TEST_PHRASES: TtsTestPhrase[] = [
  {
    label: "Kort test",
    text: "Hej Jimmy, EchoCompanion kan nu läsa upp svar med en lokal röst.",
  },
  {
    label: "Normalt test",
    text: "Det här är ett lite längre test där vi kontrollerar hastighet, tonhöjd och tydlighet. Fungerar rösten bra för dig?",
  },
  {
    label: "Längre test",
    text: "EchoCompanion är din lokala AI-kompis som körs helt utan molntjänster. All text bearbetas lokalt på din dator, och uppläsningen sker via Windows inbyggda röster. Det kostar ingenting och kräver ingen internetanslutning efter installation.",
  },
  {
    label: "Projekt-test",
    text: "Taren-projektet ska fortsätta vara lokalt, lugnt och märkligt, utan onödiga dependencies. Världen är komplex men appen ska förbli enkel.",
  },
];
