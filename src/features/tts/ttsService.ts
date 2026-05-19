// ============================================================
// ttsService.ts — Web Speech API TTS-tjänst
// Använder window.speechSynthesis — fungerar lokalt, 0 kr
// ============================================================

import type { TtsSettings, TtsVoiceInfo } from "./ttsTypes";

const DEFAULT_TTS_RATE = 1; // INSTÄLLNING - Standard talhastighet (0.5–2.0)
const DEFAULT_TTS_PITCH = 1; // INSTÄLLNING - Standard tonhöjd (0.5–2.0)
const DEFAULT_TTS_VOLUME = 1; // INSTÄLLNING - Standard volym (0.0–1.0)
const MAX_TTS_TEXT_LENGTH = 4000; // INSTÄLLNING - Maximum characters sent to speech synthesis.

// ---- Regex för textstädning ----
// Ta bort kodblock (``` ... ```) inklusive innehållet (uttalas inte)
const CODE_FENCE_RE = /```[\s\S]*?```/g;
// Ta bort inline-kod (` ... `)
const INLINE_CODE_RE = /`[^`]*`/g;
// Ta bort markdown-rubriker (##, ###, etc.)
const HEADING_RE = /^#{1,6}\s+/gm;
// Ta bort citat (> ...)
const BLOCKQUOTE_RE = /^>\s*/gm;
// Ta bort råa URL:er och ersätt med "länk"
const URL_RE = /https?:\/\/[^\s)>\]"']+/g;
// Ta bort markdown-länktext men behåll visningstext: [text](url) → text
const MD_LINK_RE = /\[([^\]]*)\]\([^)]*\)/g;
// Fetstil och kursiv — behåll texten
const BOLD_ITALIC_RE = /\*{1,3}([^*\n]*)\*{1,3}|_{1,3}([^_\n]*)_{1,3}/g;
// Kvarvarande markdown-symboler
const SYMBOL_RE = /[*_~`#>\[\]|\\]/g;
// Listsymboler (-, *, •) i början av raden
const BULLET_RE = /^[\-\*•]\s+/gm;
// Flera blanksteg/rader → enkelt mellanslag
const MULTI_SPACE_RE = /[ \t]{2,}/g;
const MULTI_NEWLINE_RE = /\n{3,}/g;

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getAvailableVoices(): TtsVoiceInfo[] {
  if (!isSpeechSynthesisSupported()) return [];
  return window.speechSynthesis.getVoices().map((v) => ({
    name: v.name,
    lang: v.lang,
    localService: v.localService,
    default: v.default,
  }));
}

function cleanTextForSpeech(text: string): string {
  let clean = text;

  // Ta bort kodblock (innehållet uttalas inte meningsfullt)
  clean = clean.replace(CODE_FENCE_RE, " ");

  // Ta bort inline-kod
  clean = clean.replace(INLINE_CODE_RE, " ");

  // Ersätt markdown-länkar med visningstext
  clean = clean.replace(MD_LINK_RE, "$1");

  // Ersätt råa URL:er med "länk"
  clean = clean.replace(URL_RE, "länk");

  // Ta bort rubriker (## etc.) — behåll texten
  clean = clean.replace(HEADING_RE, "");

  // Ta bort blockcitat-tecken
  clean = clean.replace(BLOCKQUOTE_RE, "");

  // Ta bort fetstil/kursiv-omslutning — behåll texten
  clean = clean.replace(BOLD_ITALIC_RE, (_, bold, italic) => bold ?? italic ?? "");

  // Ta bort listsymboler i radinledning
  clean = clean.replace(BULLET_RE, "");

  // Ta bort kvarvarande markdown-symboler
  clean = clean.replace(SYMBOL_RE, "");

  // Normalisera blanksteg
  clean = clean.replace(MULTI_NEWLINE_RE, "\n");
  clean = clean.replace(MULTI_SPACE_RE, " ");
  clean = clean.trim();

  // Trunkera om texten är för lång
  if (clean.length > MAX_TTS_TEXT_LENGTH) {
    clean = clean.slice(0, MAX_TTS_TEXT_LENGTH).trimEnd();
    // Klipp vid sista meningsslutet om möjligt
    const lastStop = Math.max(
      clean.lastIndexOf("."),
      clean.lastIndexOf("!"),
      clean.lastIndexOf("?")
    );
    if (lastStop > MAX_TTS_TEXT_LENGTH * 0.8) {
      clean = clean.slice(0, lastStop + 1);
    }
    clean += " … Texten är avkortad för uppläsning.";
  }

  return clean;
}

// Välj bästa standardröst (utan ett explicit användarval)
export function getBestDefaultVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  // 1. Svenska via lang
  const svLang = voices.find((v) => v.lang.startsWith("sv"));
  if (svLang) return svLang;

  // 2. Svenska via namn
  const svName = voices.find(
    (v) =>
      v.name.toLowerCase().includes("swedish") ||
      v.name.toLowerCase().includes("svenska")
  );
  if (svName) return svName;

  // 3. Systemets standardröst
  const def = voices.find((v) => v.default);
  if (def) return def;

  // 4. Första tillgängliga
  return voices[0];
}

function findBestVoice(selectedVoiceName: string | null): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Använd vald röst om den fortfarande existerar
  if (selectedVoiceName) {
    const selected = voices.find((v) => v.name === selectedVoiceName);
    if (selected) return selected;
  }

  // INSTÄLLNING - Prioritetsordning: sv-lang → Swedish/Svenska i namn → system-default → första
  return getBestDefaultVoice(voices);
}

export function speakText(text: string, settings: TtsSettings): void {
  if (!isSpeechSynthesisSupported()) return;
  if (!text.trim()) return;

  // Avbryt eventuell pågående uppläsning
  window.speechSynthesis.cancel();

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);

  const voice = findBestVoice(settings.selectedVoiceName);
  if (voice) utterance.voice = voice;

  utterance.rate = settings.rate ?? DEFAULT_TTS_RATE;
  utterance.pitch = settings.pitch ?? DEFAULT_TTS_PITCH;
  utterance.volume = settings.volume ?? DEFAULT_TTS_VOLUME;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.cancel();
}

export function pauseSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.pause();
}

export function resumeSpeaking(): void {
  if (!isSpeechSynthesisSupported()) return;
  window.speechSynthesis.resume();
}

export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) return false;
  return window.speechSynthesis.speaking;
}
