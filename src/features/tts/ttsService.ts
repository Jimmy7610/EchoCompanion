// ============================================================
// ttsService.ts — Web Speech API TTS-tjänst
// Använder window.speechSynthesis — fungerar lokalt, 0 kr
// ============================================================

import type { TtsSettings, TtsVoiceInfo } from "./ttsTypes";

const DEFAULT_TTS_RATE = 1; // INSTÄLLNING - Standard talhastighet (0.5–2.0)
const DEFAULT_TTS_PITCH = 1; // INSTÄLLNING - Standard tonhöjd (0.5–2.0)
const DEFAULT_TTS_VOLUME = 1; // INSTÄLLNING - Standard volym (0.0–1.0)

// Regex för att städa markdown och symboler innan uppläsning
const MARKDOWN_CLEANUP_RE = /```[\s\S]*?```|`[^`]*`|\*{1,3}([^*]*)\*{1,3}|_{1,3}([^_]*)_{1,3}|#{1,6}\s|>\s|\[([^\]]*)\]\([^)]*\)/g;
const SYMBOL_CLEANUP_RE = /[*_~`#>\[\]|\\]/g;
const MULTI_SPACE_RE = /\s{2,}/g;

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
  // Ta bort markdown-kodblock och inline-kod, fetstil, kursiv, rubriker, citat, länkar
  clean = clean.replace(MARKDOWN_CLEANUP_RE, (_match, bold, italic, linkText) => {
    return bold ?? italic ?? linkText ?? "";
  });
  // Ta bort kvarvarande markdown-symboler
  clean = clean.replace(SYMBOL_CLEANUP_RE, "");
  // Normalisera blanksteg
  clean = clean.replace(MULTI_SPACE_RE, " ").trim();
  return clean;
}

function findBestVoice(selectedVoiceName: string | null): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  // Försök med vald röst
  if (selectedVoiceName) {
    const selected = voices.find((v) => v.name === selectedVoiceName);
    if (selected) return selected;
  }

  // INSTÄLLNING - Prioritetsordning för svenska röster: lang sv, namn innehåller Swedish/Svenska
  const swedish = voices.find(
    (v) =>
      v.lang.startsWith("sv") ||
      v.name.toLowerCase().includes("swedish") ||
      v.name.toLowerCase().includes("svenska")
  );
  if (swedish) return swedish;

  // Fallback: standardröst eller första tillgängliga
  return voices.find((v) => v.default) ?? voices[0] ?? null;
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
