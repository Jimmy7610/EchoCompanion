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

## Upcoming

| Build | Focus |
|-------|-------|
| 14 | Piper TTS preparation or simple companion/avatar panel — whichever is safest next |
| 15 | Simple companion/avatar panel — static or CSS-animated companion presence in the right panel |



## Later

- Update checker via GitHub Releases (no auto-install, just notification)
- Proper app icon
- Windows system tray integration
- Tauri-native file dialogs for backup import/export

## Constraints

- Budget: 0 SEK — no paid APIs, services, or dependencies ever
- All AI: Ollama only (local)
- All TTS: local/free only (Web Speech API or Piper)
- All storage: local only (localStorage → Tauri FS)
- No cloud, no subscriptions, no telemetry
