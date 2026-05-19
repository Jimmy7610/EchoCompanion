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
| 20 | UX polish — welcome suggestions, shorter input placeholders, sidebar chat count, settings index, desktop status updated |
| 21 | Manual Git update workflow — copyable commands in Settings, docs/git-update-workflow.md, no auto-execution |
| 22 | Tauri production build prep — config verified (icons, tauri.conf.json, bundle targets), tauri:build must run locally (sandbox has no Rust in PATH) |
| 23 | Tauri updater foundation — @tauri-apps/plugin-updater installed, tauriUpdater.ts helper, InstallerUpdateSection UI with three modes, Rust plugin registered, capabilities file, docs/tauri-updater-plan.md |
| 24 | Chat UX polish — markdown rendering (paragraphs, lists, bold, code blocks), input auto-focus after send/response/stop |
| 25 | Updater release prep — .gitignore signing secrets, latest.example.json, release-update-workflow.md (Swedish), status checklist in updater UI |
| 26 | v0.1.1 signed release scripts — create-updater-key.ps1, build-signed-release.ps1, create-latest-json.ps1, github-release-v0.1.1-checklist.md, version bump to v0.1.1 |
| 26.1 | Fix PowerShell scripts — rewrite as pure ASCII, save with UTF-8 BOM, fix parser errors in PS 5.1 |

## Upcoming

| Build | Focus |
|-------|-------|
| 27 | Publish v0.1.1 GitHub Release and test updater button end-to-end |

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
