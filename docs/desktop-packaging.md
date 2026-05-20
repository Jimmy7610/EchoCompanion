# EchoCompanion — Desktop Packaging Notes

## Status (Build 11)

Desktop packaging is **not yet finalized**. The app runs well in browser mode via `npm run dev`.
Tauri is configured but requires Rust to build the native binary.

---

## Requirements for Desktop Build

| Tool | Purpose | Install |
|------|---------|---------|
| Rust + Cargo | Compile Tauri/native layer | rustup.rs |
| Tauri CLI | Build commands | included via npm devDependencies |
| Node.js | Frontend build | nodejs.org |

Install Rust:
```
winget install Rustlang.Rustup
# or visit https://rustup.rs
```

After Rust is installed, verify with:
```
rustc --version
cargo --version
```

Then run the desktop app in dev mode:
```
npm run tauri:dev
```

---

## App Icons

Tauri expects icons in `src-tauri/icons/`.

Required files:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS — optional for Windows-only)
- `icon.ico` (Windows)

### Generating placeholder icons

Once Rust and Tauri CLI are installed, you can generate placeholder icons from a source PNG:
```
npm run tauri icon path/to/source-icon.png
```

This auto-generates all required sizes from a single 1024x1024 source image.

### Recommended icon style for EchoCompanion

- Dark circular background (matches the app's dark premium theme)
- Cyan/purple accent glow — matching `--accent-text` and `--status-online` CSS variables
- Central symbol: the ⬡ hexagon motif already used in the welcome screen
- Simple enough to read clearly at 32x32 px
- No text in the icon — just the symbol

### Status

No final icon has been added yet. Placeholder icons may be needed before `tauri:build` succeeds.
If the build fails due to missing icons, use `npm run tauri icon` with any temporary PNG first.

---

## Build Output

After `npm run tauri:build`, the installer will appear in:
```
src-tauri/target/release/bundle/
```

For Windows:
- `nsis/EchoCompanion_0.1.0_x64-setup.exe` (NSIS installer)
- `msi/EchoCompanion_0.1.0_x64_en-US.msi` (MSI installer)

---

## Tauri Config Reference

File: `src-tauri/tauri.conf.json`

Key values to keep in sync with `src/data/appInfo.ts` and `package.json`:
- `version` — app version
- `productName` — display name
- `identifier` — reverse-domain identifier (`se.jimmyeliasson.echocompanion`)
- Window `width` / `height` — default window size
- Window `minWidth` / `minHeight` — minimum window size

---

## Version Sync Checklist

When bumping the version:
1. `src/data/appInfo.ts` — update `APP_VERSION` and `APP_BUILD`
2. `src-tauri/tauri.conf.json` — update `version`
3. `package.json` — update `version`
4. `README.md` — add new build section

---

## Build 19.1 — Placeholder icons added

Placeholder icons were generated programmatically using PowerShell + System.Drawing (GDI+).
No external tools or paid assets required.

Design: dark circle (#08080F bg) · purple glow ring (#8b5cf6) · cyan orb (#06b6d4) · white highlight.

Files created in `src-tauri/icons/`:

| File | Size | Purpose |
|------|------|---------|
| `icon.ico` | ~12 KB | **Windows — required** (16, 32, 48, 256 px embedded PNG) |
| `icon.icns` | ~4 KB | macOS placeholder (128×128 PNG, ic07) |
| `32x32.png` | ~1 KB | Tauri icon list |
| `128x128.png` | ~4 KB | Tauri icon list |
| `128x128@2x.png` | ~9 KB | Tauri icon list (256×256 source) |
| `icon.png` | ~9 KB | General-purpose 256×256 |

To replace with a real icon later:
1. Create a 1024×1024 PNG with your final icon design
2. Run: `npm run tauri icon path/to/your-icon.png`
   (requires Rust + Tauri CLI installed)
3. This regenerates all sizes automatically

The required Windows resource file path is: `src-tauri/icons/icon.ico`

---

## Build 31 — v0.1.3 forberedd som ren basrelease

### Vad som gjordes

- Version bumpad till v0.1.3 i `package.json`, `src-tauri/tauri.conf.json`, `src/data/appInfo.ts`
- `scripts/create-latest-json.ps1` uppdaterad for v0.1.3
- `docs/github-release-v0.1.3-checklist.md` skapad — checklista for ren basrelease med ny nyckel
- Statuschecklista i appen uppdaterad: ny nyckel bekraftad, v0.1.3 vantar publicering
- Inga privata nycklar commitade

### Viktigt om uppdateringskompatibilitet

Appar installerade med gammal pubkey (v0.1.1 eller v0.1.2) kan INTE ta emot v0.1.3
via auto-updater. Installera v0.1.3 manuellt som ny basinstallation.
Framtida updater-test: installerad v0.1.3 → v0.1.4.

---

## Build 30 — Nyckelrotation forbered

### Vad som gjordes

- `scripts/rotate-updater-key.ps1` skapad — arkiverar gammal nyckel och genererar ny
- `docs/updater-key-rotation.md` skapad — komplett rotationsguide pa svenska
- `.gitignore` uppdaterad: `.tauri-signing-old-test-key*/` tillagd
- Statuschecklista i Inställningar: varningsrad om nyckelrotation tillagd (gul ⚠)
- Test-nyckelparet (v0.1.2) betraktas som komprometterat
- Inga privata nycklar commitade, ingen shell-exekvering fran appen

### Lokal körning (Jimmy)

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
.\scripts\rotate-updater-key.ps1
```

Kopiera sedan den nya publika nyckeln till `src-tauri/tauri.conf.json`.
Se `docs/updater-key-rotation.md` for detaljerade instruktioner.

---

## Build 29 — End-to-end updater-test genomfört

### Vad som gjordes

- End-to-end-test lyckades: installerad v0.1.1 hittade och installerade v0.1.2 via uppdateringsknappen
- Statuschecklista i Inställningar uppdaterad: alla 6 punkter gröna
- `docs/github-release-v0.1.2-checklist.md` fullstandigt ifylld med resultat
- `docs/release-update-workflow.md` — "Resultat v0.1.2"-sektion tillagd med nyckelrotationsrekommendation
- Inga nya behorigheter, ingen shell-exekvering, privat nyckel forblev lokal

> ⚠ **Nyckelrotation rekommenderas** infor nasta offentliga release.
> Se `docs/release-update-workflow.md`.

---

## Build 28 — v0.1.2 förberedd för end-to-end updater-test

### Vad som gjordes

- Version bumpad till `v0.1.2` i `package.json`, `src-tauri/tauri.conf.json`, `src/data/appInfo.ts`
- `scripts/create-latest-json.ps1` uppdaterad för v0.1.2 (filnamn, URL, release-tag)
- `scripts/build-signed-release.ps1` — bugg fixad: `TAURI_SIGNING_PRIVATE_KEY` rensas nu korrekt vid fel och efter bygget
- `docs/github-release-v0.1.2-checklist.md` skapad — fullständig checklista för build, release och end-to-end-test
- Statuschecklista i Inställningar → Uppdatera appen uppdaterad för Build 28-tillstånd
- Inga nya behörigheter, ingen shell-exekvering, ingen privat nyckel i repot

### Lokal körning (Jimmy)

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
npm install

# Sätt lösenord om nyckeln har ett:
# $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "DITT_LOSENORD"

.\scripts\build-signed-release.ps1
.\scripts\create-latest-json.ps1
```

Ladda sedan upp till GitHub Release v0.1.2. Se `docs/github-release-v0.1.2-checklist.md`.

---

## Build 27 — v0.1.1 release-kanal dokumenterad

### Vad som gjordes

- GitHub Release v0.1.1 publicerades lokalt av Jimmy med signerad installer och latest.json
- Public key konfigurerad i `src-tauri/tauri.conf.json` (committat)
- Privat nyckel i `.tauri-signing/` — gitignorerad, committas aldrig
- Statuschecklista i Inställningar → Uppdatera appen uppdaterad: 5 av 6 ✅
- `docs/release-update-workflow.md` — "Resultat v0.1.1"-sektion tillagd
- `docs/github-release-v0.1.1-checklist.md` — steg 1–5 markerade som klara
- Inga nya behörigheter, ingen shell-exekvering, inga API-beroenden

### Vad som återstår

Sluttest kräver äldre installerad version (v0.1.0) eller ny release (v0.1.2).
Om installerad app redan är v0.1.1 svarar uppdateringsknappen korrekt att ingen ny version finns.

---

## Build 22 — Production build prep (konfigurationsverifiering)

### Kommando
```powershell
npm run tauri:build
```

### Resultat (Build 22)

Kommandot kördes från sandbox-miljön men blockerades eftersom `cargo` inte finns i sandbox-miljöns PATH.
Rust är installerat på Jimmys lokala dator och fungerar för `tauri:dev`, men sandbox-miljön ärver inte hans PATH.

**Jimmy måste köra `npm run tauri:build` lokalt.**

### Konfigurationsverifiering ✅

Alla konfigurationsfiler kontrollerades och är korrekta:

| Inställning | Värde | Status |
|-------------|-------|--------|
| `productName` | EchoCompanion | ✅ |
| `version` | 0.1.0 | ✅ |
| `identifier` | se.jimmyeliasson.echocompanion | ✅ |
| `bundle.targets` | all (NSIS + MSI) | ✅ |
| `frontendDist` | ../dist | ✅ |
| `beforeBuildCommand` | npm run build | ✅ |

### Ikonstatus ✅

Alla ikonfiler som listas i `bundle.icon` finns i `src-tauri/icons/`:

| Fil | Status |
|-----|--------|
| `icons/32x32.png` | ✅ Finns |
| `icons/128x128.png` | ✅ Finns |
| `icons/128x128@2x.png` | ✅ Finns |
| `icons/icon.icns` | ✅ Finns |
| `icons/icon.ico` | ✅ Finns |

### Förväntad output när Jimmy kör lokalt

```
src-tauri/target/release/bundle/
├── nsis/
│   └── EchoCompanion_0.1.0_x64-setup.exe    ← NSIS-installer
└── msi/
    └── EchoCompanion_0.1.0_x64_en-US.msi    ← MSI-installer
```

Filnamnen kan variera något beroende på Tauri-version och Windows-konfiguration.

### Steg för Jimmy — kör lokalt

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
npm run typecheck
npm run build
npm run tauri:build
```

Vänta ~5–15 min (Rust-kompilering av release-version tar längre tid än dev-version).

### Efter att bygget är klart

1. Öppna `src-tauri/target/release/bundle/` i Utforskaren
2. Kör NSIS-installationsfilen (`*-setup.exe`)
3. Verifiera att EchoCompanion startar från Start-menyn
4. Kontrollera version i Inställningar → App-information (ska visa v0.1.0 Build 22)
5. Testa Ollama-anslutning i den installerade appen
6. Testa backup-export
7. Uppdatera Build 22-tabellen ovan med verkliga testresultat

### Kända begränsningar (Build 22)

- Ikoner är platshållare (ingen riktig EchoCompanion-designad ikon)
- localStorage-data delas inte automatiskt mellan dev-läge och installerad app
- Auto-uppdatering är inte implementerad; uppdatering sker via Git pull
- NSIS-installer kräver att Windows tillåter körning av okänt program (SmartScreen)

---

## Build 26 — v0.1.1 signed release scripts

### Vad som gjordes

- Version bumpad till `v0.1.1` i `package.json`, `src-tauri/tauri.conf.json`, `src/data/appInfo.ts`
- `"createUpdaterArtifacts": true` tillagd i `tauri.conf.json` — aktiverar generering av `.nsis.zip` och `.sig`-filer vid bygge med signering
- `scripts/create-updater-key.ps1` — genererar `.tauri-signing/echocompanion.key` lokalt, visar pubkey i terminal, visar aldrig privat nyckel
- `scripts/build-signed-release.ps1` — kontrollerar att nyckel och pubkey finns, sätter `TAURI_SIGNING_PRIVATE_KEY` från lokal fil, kör `typecheck` + `build` + `tauri:build`
- `scripts/create-latest-json.ps1` — läser `.sig`-fil från bygget, skriver `release-work/latest.json`
- `docs/github-release-v0.1.1-checklist.md` — steg-för-steg-checklista för release och end-to-end-test

### Vad som återstår (Build 27)

Dessa steg kräver Jimmys lokala miljö:

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion

# 1. Generera nyckelpar (engång)
.\scripts\create-updater-key.ps1
# Kopiera pubkey till src-tauri/tauri.conf.json och committa

# 2. Bygg signerad release
.\scripts\build-signed-release.ps1

# 3. Skapa latest.json
.\scripts\create-latest-json.ps1

# 4. Ladda upp till GitHub Releases v0.1.1 (se docs/github-release-v0.1.1-checklist.md)
```

---

## Build 25 — Signeringsflöde och release-dokumentation

### Vad som gjordes

- `.gitignore` utökad med signeringssekret (`*.key`, `*.key.pub`, `*.sig`, `.tauri-signing/`, `release-work/`, `latest.local.json`)
- `docs/latest.example.json` skapad — säker exempelmall, inga riktiga värden
- `docs/release-update-workflow.md` skapad — steg-för-steg på svenska: nyckelgenerering, signering, latest.json, GitHub Release, testflöde, rollback
- Statuschecklista i Inställningar → Uppdateringslägen — visar tydligt vad som är på plats och vad som saknas

### Vad som återstår (Build 26)

Privat nyckel måste genereras lokalt av Jimmy och **aldrig** läggas i repot:

```powershell
npm run tauri -- signer generate -w $env:USERPROFILE\.tauri\echocompanion.key
```

Se [`docs/release-update-workflow.md`](release-update-workflow.md) för komplett guide.

---

## Build 18 Desktop Test Status

| Check | Status |
|-------|--------|
| Rust installed | ❌ Inte installerat på Jimmys dator vid Build 18 |
| `npm run typecheck` | ✅ Passerar |
| `npm run build` | ✅ Passerar |
| `npm run tauri:dev` | ⏳ Fylls i efter lokal test när Rust är installerat |
| `npm run tauri:build` | ⏳ Fylls i efter lokal test när Rust är installerat |
| Tauri-fönster öppnas | ⏳ Fylls i efter lokal test |
| Installer skapad | ⏳ Fylls i efter lokal test |

### Kända blockers (Build 18)

- **Rust saknas** — Desktop-kommandon (`tauri:dev`, `tauri:build`) kan inte köras förrän Rust är installerat.
  Installera från https://rustup.rs (gratis, tar ~5 min på Windows).
- **Appikon saknas** — Platshållarfiler finns i `src-tauri/icons/` men ingen riktig EchoCompanion-ikon är skapad.
  Generera med: `npm run tauri icon sökväg/till/ikon.png` (kräver Tauri CLI + Rust).
- **localStorage/WebView storage** — All data (chattar, inställningar, projektminne) lagras i WebView-storage,
  inte i vanliga filer. Migration till Tauri FS API är planerat till ett senare build.

### Nästa steg för desktop

1. Installera Rust från https://rustup.rs
2. Verifiera med `rustc --version` och `cargo --version`
3. Kör `npm run tauri:dev` och följ checklistan i `docs/desktop-test-checklist.md`
4. Om dev-läget fungerar: kör `npm run tauri:build` och testa installationsfilen
5. Uppdatera denna tabell med verkliga testresultat
