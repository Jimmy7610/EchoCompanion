# EchoCompanion — TTS Plan

Zero-budget, local-first text-to-speech for Windows.

## Current state (Build 13–14)

**Engine:** Web Speech API (`window.speechSynthesis`)  
**Cost:** 0 kr  
**Works in:** Chrome, Edge, Tauri (Chromium-based)  
**Voices:** Provided by Windows or the browser — no install required

### What is implemented

- `src/features/tts/ttsService.ts` — speak, stop, pause, resume, voice selection, text cleanup
- `src/features/tts/ttsStorage.ts` — localStorage persistence for TTS settings
- `src/features/tts/ttsTypes.ts` — TypeScript types
- `src/features/tts/ttsTestPhrases.ts` — Swedish test phrases for calibration
- Manual "Läs upp" / "Stoppa" buttons on assistant messages (appear on hover)
- Auto-read after assistant responses (optional, off by default)
- Voice selector with Swedish voice preference
- Rate, pitch, and volume sliders
- "Stoppa röst" global button in chat header when TTS is enabled
- Markdown cleanup before speech (code blocks, URLs, symbols removed)
- Max text length (4000 chars) with truncation notice

### Text cleanup pipeline

Before sending text to `speechSynthesis`, the service:
1. Removes fenced code blocks (` ``` ... ``` `)
2. Removes inline code (`` `...` ``)
3. Replaces markdown links with display text
4. Replaces raw URLs with "länk"
5. Removes heading markers (`##`, `###`, etc.)
6. Removes blockquote markers (`>`)
7. Removes bold/italic markers, keeping text content
8. Removes list bullet symbols at line starts
9. Removes leftover markdown symbols
10. Normalises whitespace
11. Truncates at 4000 chars, clipping at last sentence boundary

### Voice selection priority

1. Explicitly selected voice (user setting, if still available)
2. Voice with `lang` starting with `sv`
3. Voice with `name` containing "Swedish" or "Svenska"
4. System default voice
5. First available voice

---

## Why Web Speech first

- Zero installation, zero cost, works today
- Sufficient for basic assistant read-aloud
- Does not require Rust, binaries, or file access
- Voices provided by Windows — Swedish voices available on most Windows 11 installs

---

## Piper TTS — future local option

[Piper](https://github.com/rhasspy/piper) is an offline, open-source, neural TTS engine. Quality is significantly better than Web Speech API for Swedish.

### What Piper will require

- Rust/Tauri shell command API (to invoke the Piper binary)
- Piper binary downloaded locally (≈10 MB)
- Swedish voice model downloaded locally (≈50–100 MB, e.g. `sv_SE-nst-medium`)
- WAV playback from the frontend (Tauri `tauri-plugin-shell` + `tauri-plugin-audio`)
- A separate "TTS engine" setting: Web Speech vs. Piper

### Suggested future build order

1. **Build 13–14** — Web Speech API (done)
2. **Build 15–16** — Avatar/companion panel (visual companion)
3. **Build 17** — Piper folder structure, docs, and manual install guide
4. **Build 18** — Piper binary invocation via Tauri shell
5. **Build 19** — WAV output playback in the UI
6. **Build 20** — Engine selector: Web Speech | Piper; avatar reacts to audio

---

## What NOT to use

These services violate the 0 SEK / local-first constraint and must never be added:

| Service | Reason |
|---------|--------|
| ElevenLabs | Paid, cloud |
| OpenAI TTS | Paid, cloud |
| Azure Cognitive Speech | Paid, cloud |
| Google Cloud TTS | Paid, cloud |
| AWS Polly | Paid, cloud |
| Any API key-based TTS | Paid or requires registration |

---

## Known limitations (Web Speech)

- Voice availability depends on the Windows/browser installation
- No guarantee of a Swedish voice — user must install one via Windows Settings → Time & Language → Speech
- Web Speech API is not available in all browsers (best in Chrome/Edge/Tauri)
- Long texts are truncated at 4000 characters
- Streaming token-by-token read-aloud is not supported (reads only after response completes)
