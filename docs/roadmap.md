# EchoCompanion — Roadmap

Zero-budget, local-first Windows AI companion. All features use free, open-source, locally-run tools.

## Completed

| Build | Focus |
|-------|-------|
| 1–4 | Foundation: Tauri + React layout, Ollama connection, model listing, chat |
| 5 | Project memory — active project context sent to Ollama |
| 6 | Prompt library — 13 built-in templates, custom CRUD |
| 7 | Backup/export/import — full and partial, merge/replace modes |
| 8 | Streaming responses — NDJSON stream, AbortController stop button |
| 9 | Unified app settings — temperature, top-P, num_predict, streaming toggle, default profile/project |
| 10 | Ollama options cleanup — num_ctx added, labels clarified, streaming and non-streaming parity |
| 11 | Desktop packaging readiness — Tauri config, package scripts, appInfo constants, docs |
| 12 | Local app data storage plan — storage key registry, diagnostics UI, adapter placeholder, migration plan |
| 13 | Windows TTS first version — Web Speech API, voice select, rate/pitch/volume, auto-read, manual "Läs upp" button |
| 14 | TTS polish — improved text cleanup, Swedish voice detection, test phrases, Piper prep section, tts-plan.md |
| 15 | Simple companion avatar panel — CSS/React orb with mood states, thinking/speaking/offline animations |
| 16 | Smart model helper — rule-based model recommendations by task, LLaVA family, model warnings in RightPanel |
| 17 | Update checker — GitHub Releases API, version comparison, notification badge in StatusBar, no auto-install |
| 18 | Tauri desktop testing — Rust check, frontend verified, Desktop-läge UI improved, desktop-test-checklist.md |
| 19.1 | Tauri icon fix — placeholder icons generated (PNG + ICO + ICNS) via PowerShell/GDI+, no external deps |

## Upcoming

| Build | Focus |
|-------|-------|
| 19 | Local file help planning — design doc for safe file context, no shell execution, no broad FS permissions |

## Later

- Tauri desktop mode fully tested (blocked on Rust install on Jimmy's machine)
- Proper app icon (generate with `npm run tauri icon`)
- Windows system tray integration
- Tauri-native file dialogs for backup import/export
- Storage migration: localStorage → Tauri FS API (plan in docs/storage-migration-plan.md)

## Constraints

- Budget: 0 SEK — no paid APIs, services, or dependencies ever
- All AI: Ollama only (local)
- All TTS: local/free only (Web Speech API or Piper)
- All storage: local only (localStorage → Tauri FS)
- No cloud, no subscriptions, no telemetry
