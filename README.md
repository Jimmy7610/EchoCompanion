# ⬡ EchoCompanion

**Din lokala AI-kompis för idéer, kod och projekt.**

EchoCompanion är en Windows skrivbordsapp som låter dig chatta med lokala AI-modeller via [Ollama](https://ollama.com) — helt utan molntjänster, prenumerationer eller API-nycklar.

---

## Principen: Zero Budget · Local First

| Princip | Vad det innebär |
|---|---|
| **0 kr budget** | Inga betalda API:er, prenumerationer eller tjänster |
| **Local first** | All AI körs lokalt på din dator via Ollama |
| **Offline-ready** | Fungerar utan internetanslutning (efter modellladdning) |
| **Open source** | Byggs med gratis öppna verktyg (Tauri, React, Ollama) |

---

## Utvecklingskommandon

| Kommando | Vad det gör | Kräver Rust |
|---|---|---|
| `npm run dev` | Startar Vite dev-server på port 1420 (webbläsarläge) | Nej |
| `npm run typecheck` | Kör TypeScript-typkontroll utan att bygga | Nej |
| `npm run build` | Bygger frontend till `dist/` | Nej |
| `npm run preview` | Förhandsvisar produktionsbygg i webbläsare | Nej |
| `npm run tauri:dev` | Kör appen som Tauri-skrivbordsapp med live-reload | **Ja** |
| `npm run tauri:build` | Bygger installerbar Windows-app (.exe/.msi) | **Ja** |

> **Webbläsarläge** fungerar utan Rust. **Desktop-läge** kräver [Rust](https://rustup.rs) installerat.

---

## Funktioner i v0.1.3 Build 31

### ✅ Klart i Build 31
- **Version bumpad till v0.1.3** — package.json, src-tauri/tauri.conf.json, src/data/appInfo.ts
- **scripts/create-latest-json.ps1** — uppdaterad för v0.1.3 (filnamn, URL, release-tag, release notes)
- **docs/github-release-v0.1.3-checklist.md** — checklista för första rena release med roterad nyckel
- **Statuschecklista** i Inställningar uppdaterad: ny nyckel bekräftad ✅, v0.1.3 väntar publicering ⏳
- Ingen privat nyckel commitad, ingen shell-exekvering från appen
- Build 30 → 31

### Nästa steg (lokalt på Jimmys dator)
```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
npm install
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "DITT_NYA_LOSENORD_HAR"
.\scripts\build-signed-release.ps1
.\scripts\create-latest-json.ps1
```
Ladda sedan upp till GitHub Release v0.1.3:
- `EchoCompanion_0.1.3_x64-setup.exe`
- `EchoCompanion_0.1.3_x64-setup.exe.sig`
- `latest.json`

> Installera v0.1.3 manuellt som ny basinstallation. Äldre testversioner (v0.1.1/v0.1.2)
> med gammal pubkey kan inte ta emot uppdateringen via auto-updater.

Se [docs/github-release-v0.1.3-checklist.md](docs/github-release-v0.1.3-checklist.md).

---
## Funktioner i v0.1.2 Build 30

### ✅ Klart i Build 30
- **scripts/rotate-updater-key.ps1** — nytt skript: arkiverar gammal test-nyckel, genererar nytt nyckelpar, instruerar om pubkey-uppdatering i tauri.conf.json
- **docs/updater-key-rotation.md** — komplett rotationsguide på svenska: varför, vad som hände, exakta steg, konsekvenser för befintliga installationer
- **.gitignore** — `.tauri-signing-old-test-key*/` tillagd för arkiverade nycklar
- **Statuschecklista** i Inställningar: lugn varningsrad "ny signing key rekommenderas innan seriös release"
- **docs/release-update-workflow.md** — "Nyckelrotation efter test"-sektion tillagd
- Privat nyckel commitades aldrig, ingen shell-exekvering från appen
- Build 29 → 30

### Nästa steg (lokalt på Jimmys dator)
```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
.\scripts\rotate-updater-key.ps1
```
Kopiera sedan ENBART den nya publika nyckeln till `src-tauri/tauri.conf.json`.
Se [docs/updater-key-rotation.md](docs/updater-key-rotation.md).

---
## Funktioner i v0.1.2 Build 29

### ✅ Klart i Build 29
- **End-to-end updater-test genomfört** — installerad v0.1.1 hittade och installerade v0.1.2 via uppdateringsknappen
- **Statuschecklista** i Inställningar: alla 6 punkter gröna
- **docs/github-release-v0.1.2-checklist.md** — fullstandigt ifylld med resultat
- **docs/release-update-workflow.md** — "Resultat v0.1.2"-sektion tillagd, nyckelrotation rekommenderas
- **docs/tauri-updater-plan.md** — status uppdaterad till Build 29, alla steg klara
- Privat nyckel forblev lokal under hela flodet
- Build 28 → 29

> ⚠ **Nyckelrotation rekommenderas** infor nasta offentliga release.
> Se [docs/release-update-workflow.md](docs/release-update-workflow.md).

---
## Funktioner i v0.1.1 Build 27

### ✅ Klart i Build 27
- **GitHub Release v0.1.1 publicerad** — installer, signatur och latest.json uppladdade
- **Public key konfigurerad** — src-tauri/tauri.conf.json uppdaterad med riktig minisign pubkey
- **Privat nyckel lokal** — .tauri-signing/echocompanion.key gitignorerad, committas aldrig
- **Statuschecklista uppdaterad** — 5 av 6 punkter gröna: plugin, koppling, signing key, latest.json, release-kanal
- **Felmeddelanden förtydligade** i 	auriUpdater.ts — tydligare svenska texter vid "ingen uppdatering" och kanalfel
- **docs/release-update-workflow.md** — "Resultat v0.1.1"-sektion tillagd
- **docs/github-release-v0.1.1-checklist.md** — steg 1–5 markerade som klara
- Inga nya behörigheter, ingen shell-exekvering, ingen privat nyckel i repot
- Build 26.1 → 27

### ⚠ Sluttest återstår
Om installerad app redan är v0.1.1 svarar uppdateringsknappen korrekt att ingen ny version
finns. Fullt end-to-end-test kräver installerad v0.1.0 eller ny v0.1.2 release.

---
## Funktioner i v0.1.1 Build 26

### ✅ Klart i Build 26
- **Version bumpad till v0.1.1** — package.json, src-tauri/tauri.conf.json, src/data/appInfo.ts
- **"createUpdaterArtifacts": true** tillagd i 	auri.conf.json — aktiverar generering av signerade artefakter vid 	auri:build
- **scripts/create-updater-key.ps1** — genererar lokal minisign-nyckel, visar pubkey, visar aldrig privat nyckel
- **scripts/build-signed-release.ps1** — verifierar förutsättningar, laddar nyckel från lokal fil, kör fullständig signerad build-kedja
- **scripts/create-latest-json.ps1** — läser .sig-filen från bygget, genererar elease-work/latest.json
- **docs/github-release-v0.1.1-checklist.md** — komplett checklista: nyckel → bygg → latest.json → GitHub Release → end-to-end-test
- **Förbättrade felmeddelanden** i uppdateraren (skillnad på kanal-saknas vs signaturfel)
- **Statuschecklista uppdaterad** — visar nu tre ✅ (plugin, knappling, scripts) och tre ❌ (nyckel, latest.json, release)
- Inga privata nycklar i repot, inga shell-kommandon från appen
- Build 25 → 26

### ⚠ Lokala steg krävs för aktiv uppdaterare
Kör dessa på Jimmys dator för att aktivera one-click-uppdateraren:
`powershell
.\scripts\create-updater-key.ps1       # generera nyckelpar
# → kopiera pubkey till tauri.conf.json och committa
.\scripts\build-signed-release.ps1    # bygg signerad v0.1.1
.\scripts\create-latest-json.ps1      # skapa latest.json
# → ladda upp till GitHub Releases v0.1.1
`
Se [docs/github-release-v0.1.1-checklist.md](docs/github-release-v0.1.1-checklist.md) för fullständig guide.

---
## Funktioner i v0.1.0 Build 25

### ✅ Klart i Build 25
- **Signeringssekret skyddade** — .gitignore utökad med *.key, *.key.pub, *.sig, .tauri-signing/, elease-work/, latest.local.json
- **docs/latest.example.json** — säker exempelmall för latest.json-formatet; inga riktiga värden, tydlig kommentar om att inte lägga upp som riktig fil
- **docs/release-update-workflow.md** — komplett steg-för-steg-guide på svenska: nyckelgenerering, signering, latest.json, GitHub Release, testflöde, vanliga fel, rollback
- **Statuschecklista i Inställningar** — Uppdateringslägen visar nu sex kontrollpunkter (✅ plugin, ✅ knappkoppling, ❌ signing key, ❌ latest.json, ❌ release-kanal, ❌ sluttest) med förklarande text om vad som saknas
- Inga nya behörigheter, ingen shell-exekvering, inga API-beroenden
- Build 24 → 25

### ⚠ Uppdateraren är fortfarande inte aktiv
Nästa steg är att Jimmy kör signeringsflödet lokalt (se docs/release-update-workflow.md) och publicerar en GitHub Release v0.1.1.

---
## Funktioner i v0.1.0 Build 24

### ✅ Klart i Build 24
- **Markdown-rendering av AI-svar** — paragrafavstånd, punktlistor, numrerade listor, fetstil (`**text**`), kodblock (` ``` `), inline-kod (`` `kod` ``); ingen `dangerouslySetInnerHTML`, inga externa bibliotek
- **Chattinput auto-fokus** — fokuseras automatiskt: vid öppning av chatten, efter skickad rad, efter mottaget/stoppad svar; bevarar Shift+Enter-rader och Stop-knapp
- Streaming visar fortfarande live-text med `pre-wrap` under generering
- Användarmeddelanden behåller `pre-wrap` för egna radbrytningar
- Inga nya behörigheter, ingen shell-exekvering, inga API-beroenden
- Build 23 → 24

---

## Funktioner i v0.1.0 Build 23

### ✅ Klart i Build 23
- **Tauri updater-plugin tillagd** — `@tauri-apps/plugin-updater` v2.10.1 installerat, `tauri-plugin-updater` i Cargo.toml, plugin registrerat i `lib.rs`
- **`src/features/updater/tauriUpdater.ts`** — TypeScript-helper med `checkForInstallerUpdate()` och `installInstallerUpdate()`; degraderar graciöst i webbläsarläge
- **Inställningar → Uppdateringslägen** — ny sektion med tre tydliga lägen (Git/nu, GitHub Releases/nästa, Auto/senare) + riktig "Sök och installera uppdatering"-knapp kopplad till plugin-API:n
- **`src-tauri/capabilities/default.json`** — capabilities-fil skapad med `core:default` + `updater:default`
- **`tauri.conf.json`** — `plugins.updater` konfigurerat med GitHub Releases endpoint och placeholder pubkey
- **`docs/tauri-updater-plan.md`** — fullständig svensk plan: skillnad Git/installer, latest.json-schema, signeringsflöde, nästa steg
- Inga shell-kommandon, inga extra FS-behörigheter, ingen auto-install
- Build 22.1 → 23

### ⚠ Uppdateraren är inte aktiv ännu
Knappen fungerar men returnerar ett informativt meddelande tills:
1. Minisign-nyckelpar genererats: `npm run tauri -- signer generate`
2. Pubkey lagts in i `tauri.conf.json` (ersätter `PLACEHOLDER_REPLACE_WITH_REAL_MINISIGN_PUBKEY`)
3. `latest.json` skapats och laddats upp till GitHub Releases
4. Bygget körts med `TAURI_SIGNING_PRIVATE_KEY` satt

Se [`docs/tauri-updater-plan.md`](docs/tauri-updater-plan.md) för fullständig guide.

### 🔧 Lokal verifiering krävs
Rust-sidan (plugin-registrering, capabilities) behöver verifieras lokalt:
```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
npm run tauri:dev
```

---

## Funktioner i v0.1.0 Build 22

### ✅ Klart i Build 22
- **Tauri production build-konfiguration verifierad** — alla ikoner finns (`src-tauri/icons/`), `tauri.conf.json` korrekt, bundle-mål: NSIS + MSI
- **Desktop-läge uppdaterat** — ny statusrad "Bundle-konfiguration: Verifierad (Build 22)", samt rader för installer/bundle-skapande
- **`docs/desktop-packaging.md` utökad** — Build 22-sektion med konfigurationstabell, förväntad output-struktur och steg-för-steg lokal körning
- **`docs/desktop-test-checklist.md` uppdaterad** — detaljerat röktestprotokoll för installerad app (Ollama, backup, version, auto-install-kontroll)
- Inget auto-uppdaterat, inga nya behörigheter, ingen shell-exekvering
- Build 21 → 22

### ⚠ Blocker: tauri:build körs lokalt av Jimmy
Sandbox-miljön saknar Rust i PATH. `npm run tauri:build` måste köras på Jimmys dator.

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
npm run tauri:build
```

Förväntad output:
```
src-tauri/target/release/bundle/nsis/EchoCompanion_0.1.0_x64-setup.exe
src-tauri/target/release/bundle/msi/EchoCompanion_0.1.0_x64_en-US.msi
```

Följ röktestprotokollet i [`docs/desktop-test-checklist.md`](docs/desktop-test-checklist.md) efter bygget.

---

## Funktioner i v0.1.0 Build 21

### ✅ Klart i Build 21
- **Manuellt Git-uppdateringsarbetsflöde** — Inställningar → Uppdateringar → ny sektion "Uppdatera via Git"
- **Kopieringsbara PowerShell-kommandon** — tre knappar: Kopiera Git-kommandon (alla), Kopiera bara git pull, Kopiera desktop-start
- **Kommandoblocket** visar alla steg: `cd`, `git status`, `git pull origin main`, `npm install`, `npm run typecheck`, `npm run build`, `npm run tauri:dev`
- **Säkerhetsnotering** — tydlig grön ruta: EchoCompanion kör inga kommandon automatiskt
- **Desktop-läge** — ny notering om rekommenderad uppdateringsmetod via Git
- **`docs/git-update-workflow.md`** — fullständig svensk guide med felsökning, skillnad mellan Git/GitHub Releases/auto-updater
- GitHub Release-kontroll finns kvar (platshållarknapp, planeras i framtida build)
- Ingen auto-install, ingen shell-exekvering, ingen fil-åtkomst
- Build 20 → 21

### 🧪 Att testa manuellt
1. Öppna Inställningar → Uppdateringar — sektionen "Uppdatera via Git" ska visas
2. Klicka "Kopiera Git-kommandon" — statustext "✓ Kopierat" ska visas 2 sek
3. Klistra in i Anteckningar/Notepad och verifiera att alla kommandon är med
4. Klicka "Kopiera bara git pull" — verifiera att bara `cd` + `git pull origin main` kopierades
5. Klicka "Kopiera desktop-start" — verifiera att `cd` + `npm run tauri:dev` kopierades
6. Kontrollera säkerhetsnoteringen (grön ruta längst ned i sektionen)
7. Öppna Desktop-läge i Inställningar — uppdateringsnoteringen ska synas

---

## Funktioner i v0.1.0 Build 20

### ✅ Klart i Build 20
- **Snabbstarter-förslag på välkomstskärmen** — fyra klickbara förslag som fyller chatten med ett utkast (använder befintlig draft-mekanism från promptbiblioteket)
- **Förbättrade input-placeholders** — kortare och kontextbaserade: "Anslut till Ollama…" / "Välj en modell…" / "Skriv ditt meddelande…"
- **Sidopanel: chattantal** — rubrikraden visar "Samtal · 4" när sparade samtal finns
- **Inställningar: sektionsöversikt** — ny indexblock i toppen av Inställningar med beskrivning och chips för alla sektioner
- **Desktop-läge uppdaterat** — teststatus visar nu att Rust är installerat, `tauri:dev` fungerar lokalt och Tauri-fönstret är testat; `tauri:build` är kvar som "Inte testad ännu"
- Build 19.1 → 20

### 🧪 Att testa manuellt
1. Öppna appen och kontrollera välkomstskärmen — fyra förslag ska visas som rundade knappar
2. Klicka ett förslag — texten ska placeras i chattinputen utan att skickas
3. Kontrollera sidopanelen — "Samtal · N" ska visas om det finns sparade samtal
4. Öppna Inställningar — sektionsöversikten ska synas högst upp

---

## Funktioner i v0.1.0 Build 19.1

### ✅ Klart i Build 19.1
- **Tauri-ikoner skapade** — `src-tauri/icons/` var tom och orsakade build-fel; alla krävda filer genererades med PowerShell + System.Drawing (GDI+), utan externa verktyg eller betalda resurser
- **`icon.ico`** — 12 KB, innehåller 16 / 32 / 48 / 256 px inbäddad PNG — krävs av Windows-resourcefilen i Tauri-build
- **`icon.icns`** — 4 KB, macOS-platshållare (ic07, 128×128 PNG i ICNS-container)
- **`32x32.png`, `128x128.png`, `128x128@2x.png`, `icon.png`** — alla genererade med samma design
- **Ikondesign:** mörk bakgrund (#08080F) · lila glow-ring (#8b5cf6) · cyan orb (#06b6d4) · vit highlight
- **`npm run tauri:dev` bör inte längre krascha** på saknad `icons/icon.ico`
- TypeScript-kontroll: passerar · Frontend-build: passerar
- Build 18 → 19.1

### ⚠ Begränsningar i Build 19.1
- Ikonerna är platshållare — ingen riktig EchoCompanion-designad ikon ännu
- Ersätt med `npm run tauri icon sökväg/till/ikon.png` när en final 1024×1024-ikon finns
- Tauri-fönstret är inte bekräftat öppnat — Jimmy måste köra `npm run tauri:dev` lokalt för att verifiera

### 🧪 Att testa manuellt
1. Kör `npm run tauri:dev` i terminalen
2. Vänta ~2–5 min på Rust-kompilering (första gången)
3. Tauri-fönstret ska öppnas utan `icons/icon.ico`-fel
4. Följ [`docs/desktop-test-checklist.md`](docs/desktop-test-checklist.md) för fullständigt test

---

## Funktioner i v0.1.0 Build 18

### ✅ Klart i Build 18
- **Desktop-läge UI förbättrat** — Inställningar → Desktop-läge visar nu en tydlig kommandolista med Rust-krav per kommando, en teststatus-rad per steg och en klarare förklaring av browser- vs desktop-läge
- **`docs/desktop-test-checklist.md`** — fullständig checklista för webbläsar-, desktop-dev- och desktop-produktionstester; inkluderar förberedelser, Ollama-krav och kända begränsningar
- **`docs/desktop-packaging.md` utökad** — Build 18-status: Rust ej installerat, typecheck/build passerar, tauri:dev/tauri:build väntar på Rust
- **Rust-kontroll dokumenterad** — Rust saknas på Jimmys dator vid Build 18; desktop-kommandon kan inte köras förrän `rustup.rs` är installerat
- **TypeScript-kontroll: passerar**
- **Frontend-build: passerar**
- Build 16 → 18 (Build 17 = Update checker)

### ⚠ Begränsningar i Build 18
- Desktop-läge (`npm run tauri:dev`, `npm run tauri:build`) är **inte testat** — Rust saknas
- Ingen ny funktionalitet tillagd — enbart dokumentation och UI-förbättring i Settings
- Tauri-status i Desktop-läge-sektionen är **manuell text** — uppdatera `INSTÄLLNING`-kommentarerna i ChatArea.tsx efter lokal test

### 🧪 Att testa manuellt (efter Rust-installation)
1. Installera Rust från https://rustup.rs
2. Verifiera: `rustc --version` och `cargo --version`
3. Kör `npm run tauri:dev` — Tauri-fönstret ska öppnas
4. Följ checklistan i [`docs/desktop-test-checklist.md`](docs/desktop-test-checklist.md)
5. Om det fungerar: uppdatera teststatus i Inställningar → Desktop-läge (`INSTÄLLNING`-kommentarerna)

---

## Funktioner i v0.1.0 Build 17

### ✅ Klart i Build 17
- **GitHub Releases-kontroll** — hämtar senaste release-tag via GitHub API, jämför med `APP_VERSION`
- **Notifieringsbadge i StatusBar** — visas när en nyare version finns tillgänglig
- **Inget auto-install** — öppnar bara GitHub Releases-länken, inget nedladdas automatiskt
- **Hastighetsbegränsning** — kontrolleras max en gång per app-session
- Build 16 → 17

---

## Funktioner i v0.1.0 Build 15

### ✅ Klart i Build 15
- **Companion-avatar** — visuell status-orb i höger panel med CSS-animationer, inga externa beroenden, 0 kr
- **Stämningslägen** — idle, redo (grön puls), tänker (lila puls + ringar), pratar (cyan puls + ringar + ljudvåg), offline (nedtonad)
- **Realtidsreaktion** — avataren reagerar direkt på Ollama-status, pågående generering och TTS-uppläsning
- **Profil/projekt-chips** — visar aktiv profil och projekt under orben
- **Mini-status i chat-header** — "EchoCompanion tänker…" / "EchoCompanion pratar…" ersätter modell-info under aktiva tillstånd
- **isSpeaking-spårning** — korrekt `onend`/`onerror`-callback i TTS-tjänsten styr speaking-tillståndet
- **Settings-infoblocket** — förklarar att avataren är CSS-baserad, inte en 3D-avatar
- **`src/features/companion/companionTypes.ts`** — `CompanionMood`, `CompanionState`, `getCompanionState()`
- **`src/components/CompanionAvatar.tsx`** — avatar-komponent med orb, ringar och ljudvåg
- Build 14 → 15

### ⚠ Begränsningar i Build 15
- Ingen 3D-avatar — visuell CSS-animation endast
- MuseTalk, VSeeFace och Piper är inte integrerade
- Avatar kopplas inte till röststyrkan ännu

## Funktioner i v0.1.0 Build 14

### ✅ Klart i Build 14
- **Förbättrad textstädning** — kodblock, inline-kod, URL:ar (ersätts med "länk"), rubriker, listsymboler och markdown-symboler rensas ordentligt inför uppläsning
- **Max textlängd** — texter längre än 4 000 tecken trunkeras vid sista meningsgränsen, med ett meddelande om avkortning
- **Förbättrat röstval** — tydligare prioritet: sv-lang → Swedish/Svenska i namn → systemstandard → första röst
- **`getBestDefaultVoice()`** — exporterad hjälpfunktion för röstprioritet
- **`src/features/tts/ttsTestPhrases.ts`** — fyra svenska testfraser: Kort, Normalt, Längre och Projekt-test
- **Testfras-väljare i inställningar** — välj testfras och spela upp direkt
- **Röstinfo** — visar antal röster, "✓ Svensk röst hittad" om en sv-röst finns
- **"★" i röstsväljaren** — markerar svenska röster
- **Vald röst visas** — namn visas under röstsväljaren när en röst är vald
- **Info om Windows röstinställningar** — länk till Inställningar → Tid och språk → Tal
- **"Stoppa röst"-knapp i chatheadern** — syns när uppläsning är aktiverat
- **Piper TTS-sektion** — informationssektion i Inställningar, ej integrerad kod
- **`docs/tts-plan.md`** — fullständig plan för TTS-väg framåt
- Build 13 → 14

### ⚠ Begränsningar i Build 14
- Piper är fortfarande inte integrerat — dokumenterat och förberett men ingen körbar kod
- Röster beror fortfarande på Windows-miljö

## Funktioner i v0.1.0 Build 13

### ✅ Klart i Build 13
- **Web Speech API TTS** — uppläsning med Windows/webbläsarens inbyggda röster, 0 kr, ingen molntjänst
- **Manuell "Läs upp"-knapp** — visas på AI-svar vid hover när uppläsning är aktiverat
- **"Stoppa röst"-knapp** — direkt i varje AI-svar för att avbryta uppläsning
- **Auto-uppläsning** — kan aktiveras för att läsa upp varje AI-svar automatiskt när det är klart
- **Röstval** — välj bland installerade Windows/webbläsarröster; svenska röster prioriteras automatiskt
- **Hastighet, tonhöjd, volym** — justerbara sliders (0.5–1.5 för hastighet/tonhöjd, 0–1 för volym)
- **TTS-inställningar** — ny sektion i Inställningar under "Röst / uppläsning"
- **Testa röst**-knapp — testar med svenska frasen direkt i inställningspanelen
- **TTS-status i höger panel och statusrad** — visar om rösten är På/Av/Auto-På
- **Rena texter** — markdown-kod, symboler och rubriker rensas bort innan uppläsning
- Build 12 → 13

### ⚠ Begränsningar i Build 13
- Tillgängliga röster beror på Windows- och webbläsarmiljö — inga röster garanteras
- Web Speech API fungerar bäst i Chromium-baserade webbläsare och i Tauri-appen
- Piper TTS (offline neural röst) planeras i ett senare build
- Ingen Avatar ännu

## Funktioner i v0.1.0 Build 12

### ✅ Klart i Build 12
- **`src/features/storage/storageKeys.ts`** — centralt register för alla kända `localStorage`-nycklar med versionssuffix (`.v1`)
- **`src/features/storage/storageDiagnostics.ts`** — read-only diagnostik: storlek i bytes, antal poster, eventuella varningar per nyckel
- **`src/features/storage/storageAdapter.ts`** — abstraktionslager förberett för framtida Tauri FS API (alla operationer delegeras till localStorage nu)
- **Ny sektion i Inställningar: "Lokal lagring"** — visar backend, total storlek, status per nyckel med badge (finns/saknas), byte-storlek, antal poster och nyckelnamn; uppdateringsknapp
- **`docs/storage-migration-plan.md`** — plan för framtida migrering från localStorage till Tauri FS API
- Build 11 → 12

### ⚠ Begränsningar i Build 12
- All lagring sker fortfarande i `localStorage` — Tauri FS API är inte implementerat ännu
- Lagringsdiagnostiken är read-only; ingen rensning eller migrering sker i detta build

## Funktioner i v0.1.0 Build 11

### ✅ Klart i Build 11
- **Tauri-konfiguration uppdaterad** — identifier ändrad till `se.jimmyeliasson.echocompanion`; standardfönster 1440×900, minimum 1100×720
- **Package scripts kompletta** — `typecheck`, `tauri:dev` och `tauri:build` tillagda i `package.json`
- **`src/data/appInfo.ts`** — central källa för `APP_NAME`, `APP_VERSION`, `APP_BUILD`, `APP_REPOSITORY`, `APP_TAGLINE` med `INSTÄLLNING`-kommentarer
- **StatusBar och Settings** — hämtar nu version och build-nummer från `appInfo.ts` istället för hårdkodade strängar
- **Ny sektion i Inställningar: "Desktop-läge"** — visar appinfo, alla kommandon med förklaringar, varning om Rust-krav, packaging-checklista
- **`docs/desktop-packaging.md`** — dokumenterar icon-krav, Tauri-byggprocess, version-synk-checklista
- **`docs/roadmap.md`** — kompakt roadmap Build 1–15
- **Utvecklingskommandon i README** — tydlig tabell med alla kommandon och Rust-krav
- Build 10 → 11

### ⚠ Begränsningar i Build 11
- Desktop-läge (Tauri) har inte testats i detta build — Rust är inte installerat på Jimmy's maskin
- Placeholder-ikoner i `src-tauri/icons/` är inte skapade ännu — `tauri:build` kan misslyckas utan dem
- Ingen funktionell förändring i AI-chatten, streaming eller inställningar

## Funktioner i v0.1.0 Build 10

### ✅ Klart i Build 10
- **`num_predict` vs `num_ctx` — tydlig separation** — de två Ollama-parametrarna är nu korrekt separerade: `num_predict` styr svarslängden, `num_ctx` styr kontextfönstret
- **Ny inställning: Kontextstorlek** — `num_ctx` exponeras i Inställningar → Modellbeteende (standard: 4096, intervall 512–32 768)
- **Korrigerad standard för Max svarslängd** — `num_predict` ändrat från 2048 till 1024 (säkrare standard för de flesta modeller)
- **Tydliga UI-labels** — "Max svarslängd" och "Kontextstorlek" ersätter "Max tokens (svar)"; varje inställning har nu en förklarande hjälptext
- **Identiska Ollama-alternativ för streaming och icke-streaming** — `temperature`, `top_p`, `num_predict` och `num_ctx` skickas alltid i båda lägena
- **Hjälptexter för alla modellparametrar** — temperature, top-P, max svarslängd och kontextstorlek har nu separata förklarande rader i UI
- **`num_ctx` i `OllamaChatOptions`** — typdefinitionen i `ollamaService.ts` är uppdaterad med korrekt `INSTÄLLNING`-kommentar
- Build 9 → 10

### ⚠ Begränsningar i Build 10
- Inte alla Ollama-modeller respekterar `num_ctx` — beroende på modellformat och hur den laddades
- Höga `num_ctx`-värden (>8192) kräver mer RAM och kan sakta ner svar avsevärt
- `num_predict = -1` (obegränsat) stöds inte ännu via UI — sätt manuellt via kod vid behov

## Funktioner i v0.1.0 Build 9

### ✅ Klart i Build 9
- **Enhetliga app-inställningar** — ny modul `src/features/settings/appSettings.ts` med `AppSettings`-interface; alla inställningar sparas som ett objekt i `localStorage` (`echocompanion.appSettings.v1`)
- **Automatisk migration** — gammal `echocompanion.useStreaming.v1`-nyckel läses in och migreras automatiskt till det nya systemet vid första start
- **Modellbeteende-kontroller** — temperatur (0.0–1.5), Top-P (0.1–1.0) och max tokens är nu styrningsbara via sliders/input i Inställningar; skickas med varje API-anrop
- **Streaming-toggle integrerad** — "Streaming-svar" är nu en del av Modellbeteende-sektionen (inga separata nyckel längre)
- **Välj första modell automatiskt** — toggle i Inställningar styr om Ollama-anslutning automatiskt förhandsväljer första tillgängliga modell
- **Debug-logg i konsolen** — toggle aktiverar `[EchoCompanion]`-loggning i produktion (alltid aktiv i dev-läge)
- **Återställ standardvärden** — knapp i Modellbeteende återställer alla inställningar till standardvärden med bekräftelsedialog
- **Standardval för profil och projekt** — välj vilken kompanjonprofil och vilket projekt som aktiveras automatiskt vid start
- **"Använd standardval nu"** — tillämpar standardvalen på aktiv session utan restart
- **Systemprompt-förhandsvisning** — kollapsbar `<details>`-block i Inställningar visar exakt vad som skickas till Ollama som systemprompt (baserat på aktiv profil + projekt)
- **Statusmeddelanden i inställningar** — inline-feedback (4 sek) efter återställning och standardval-tillämpning
- **App-info utökad** — visar `appSettings.v1`-nyckel och standardvärden i infoboxen
- **Top-P stöd i ollamaService** — `OllamaChatOptions` har nu `top_p?: number`
- Build 8 → 9

### ⚠ Begränsningar i Build 9
- Inställningar gäller per webbläsarsession — Tauri-versionen kommer använda filbaserad config
- Temperatur och Top-P visas med en decimal/tvådecimal — inte alla modeller respekterar alla parametrar
- Systemprompt-förhandsvisningen uppdateras inte live om du byter profil/projekt i höger panel utan att öppna Inställningar

## Funktioner i v0.1.0 Build 8

### ✅ Klart i Build 8
- **Streaming-svar från Ollama** — svar skrivs ut token för token direkt i chattrutan, ger snabbare och mer levande känsla
- **Stoppknapp** — röd ⏹-knapp ersätter skicka-knappen under generering; avbryter streamen omedelbart
- **Partiellt svar sparas** — om generering stoppas sparas det hittills mottagna svaret + "[Svar stoppat]"
- **Icke-streamat fallback** — toggle i Inställningar → Svarsläge låter dig stänga av streaming och återgå till det gamla `stream: false`-läget
- **Streaming-inställning sparas** — valt läge lagras i `localStorage` (`echocompanion.useStreaming.v1`) och kvarstår efter reload
- **"EchoCompanion skriver…"** — visas i AI-bubblan medan de första tokenerna väntar; typing-dots visas under hela streamen
- **"EchoCompanion svarar…"** — hint-texten under inmatningsfältet uppdateras under generering
- **Icke-streaming "tänker"-indikator** — visas bara i icke-streamat läge (streaming har sin egen bubbla)
- **Konversationshistorik bevaras** — streaming-platshållare filtreras bort från historiken som skickas till Ollama
- **Sparade chattar fungerar** — streaming sparar till localStorage när klart, precis som icke-streaming
- **Dev-loggning** — `[EchoCompanion] Streaming klar — N tokens mottagna` i konsolens DEV-läge
- **Ny funktion: `sendOllamaChatMessageStream()`** i `ollamaService.ts` — NDJSON-läsning via ReadableStream + AbortController
- Build 7 → 8

### ⚠ Begränsningar i Build 8
- Streaming-hastigheten beror på modellen och hårdvaran — långsamma modeller ger en token i taget
- Stoppknappen avbryter nätverksanropet; Ollama kan fortsätta generera internt tills timeout
- Inga markdown-rendering ännu — svarstext visas som ren text

## Funktioner i v0.1.0 Build 7

### ✅ Klart i Build 7
- **Fullständig lokal backup** — exportera allt (chattar + egna prompts + projektminnen) till en JSON-fil
- **Individuella exporter** — exportera chattar, egna promptmallar och projektanteckningar separat
- **Import med filväljare** — välj en backup-JSON direkt i Inställningar och importera med ett klick
- **Slå ihop-läge** — importerar poster som saknas utan att skriva över befintlig data (standard)
- **Ersätt allt-läge** — skriver över lokal data helt med backup-filens innehåll
- **Varning vid Ersätt allt** — tydlig gul varningsruta visas när ersättningsläge är valt
- **Inbyggda mallar skyddas** — `isBuiltIn: true`-mallar importeras aldrig, oavsett backupinnehåll
- **localStorage-säkerhet** — JSON-fel och skrivfel fångas med svenska felmeddelanden, appen kraschar aldrig
- **Statusindikatorer** — inline-statusmeddelanden (grön/röd/lila) visas i 5 sekunder efter varje åtgärd
- **Auto-refresh** — sparade chattar i sidopanelen uppdateras automatiskt efter import; projektminnen och promptmallar läses direkt från localStorage vid nästa render
- **Ny modul: `src/features/backup/backupTypes.ts`** — `EchoCompanionBackup`, `BackupImportResult`
- **Ny modul: `src/features/backup/backupService.ts`** — export/import/validering, filnedladdning
- **Inställningar: ny sektion "Backup och export"** — fyra exportknappar + importformulär
- Build 6 → 7

### ⚠ Begränsningar i Build 7
- Backup-format är `backupVersion: 1` — framtida versioner kan behöva migreringslogik
- Slå ihop-läge för projektanteckningar matchar på exakt notstexten (inga duplikat men inga diff-sammanslagningar)
- Rekommenderat: exportera en backup innan du testar Ersätt allt

## Funktioner i v0.1.0 Build 6

### ✅ Klart i Build 6
- **Promptbibliotek** — ny sektion tillgänglig via "Prompts" i vänster navigation
- **13 inbyggda mallar** täcker: Claude Code, Antigravity, Taren, EchoDraft, Wilma Foto, Bild, Sociala medier, Kod, Skrivande och Ollama
- **Sökning** — filtrera mallar i realtid på titel, beskrivning och taggar
- **Kategoriflikar** — filtrera per kategori eller visa alla
- **Expanderbart mallinnehåll** — klicka rubrikraden för att visa/dölja prompt-texten
- **Kopiera-knapp** — kopierar mallinnehåll till urklipp med "✓ Kopierat!"-feedback
- **Använd i chatten** — placerar mallinnehållet direkt i chattinmatningen och navigerar till chatt-sektionen
- **Skapa egna mallar** — inline-formulär med titel, kategori, beskrivning, taggar och mallinnehåll
- **Redigera egna mallar** — inline-redigering av alla fält
- **Ta bort egna mallar** — med bekräftelsedialog
- **Egna mallar sparas i localStorage** (`echocompanion.customPrompts.v1`) och kvarstår efter reload
- **Inbyggda mallar kan inte redigeras eller tas bort** — skyddade
- **Ny modul: `src/features/prompts/promptTypes.ts`** — `PromptCategory`, `CATEGORY_LABELS`, `PromptTemplate`
- **Ny modul: `src/features/prompts/promptStorage.ts`** — localStorage CRUD för egna mallar
- **Ny datafil: `src/data/promptTemplates.ts`** — 13 inbyggda mallar
- Build 5 → 6

### ⚠ Begränsningar i Build 6
- Ingen import/export av mallsamlingar ännu
- Ingen sortering (inbyggda visas alltid före egna)

## Funktioner i v0.1.0 Build 5

### ✅ Klart i Build 5
- **Projektminne-grund** — projekt kan väljas och är aktiva per samtal
- **Projektväljare i höger panel** — klicka ett projekt för att aktivera det
- **Aktiv projekt visas** i chattrubrik, statusrad och statusindikator i höger panel
- **Projektkontex skickas till Ollama** — regler, beskrivning, status och anteckningar inkluderas i systemprompt
- **Ny sektion: Projektminne** — klicka "Projekt" i vänster nav för fullständig projektvy
- **Projektkort** med namn, ikon, status, regelantal och anteckningsantal
- **Inbyggda regler och noter per projekt** (Taren, EchoDraft, JarvisBrain, Wilma Foto, SynthPixelStudios)
- **Egna anteckningar per projekt** — sparat i localStorage, kvarstår efter reload
- **Radera enskilda anteckningar** eller återställ alla egna anteckningar
- **Föreslagna prompts per projekt** — klicka för att kopiera till urklipp
- **Ny modul: `src/features/projects/projectStorage.ts`** — localStorage-bas för projektminne
- **Uppdaterad `src/features/settings/systemPrompts.ts`** — `buildProjectContextString()` genererar strukturerad projektsektionBuil 4.1 → Build 5

### ⚠ Begränsningar i Build 5
- Inga projektmappar eller filer läses — enbart manuella anteckningar och inbyggda regler
- Anteckningar per projekt är enkel text, ingen markdown-rendering ännu
- Projektminne är per session — öppna sparade chattar återställer inte automatiskt rätt projekt

## Funktioner i v0.1.0 Build 4.1

### ✅ Klart i Build 4.1
- **Åtgärd: konversationshistorik till Ollama** — historik filtreras nu korrekt (bara user/assistant, ej tomma, ej streaming) och skickas alltid med i rätt ordning
- **Historikbegränsning** — max `MAX_HISTORY_MESSAGES = 20` tidigare meddelanden skickas (äldsta tappas, systemprompt och nytt meddelande alltid med)
- **Starkare minnesinstruktion i basprompten** — "Kom ihåg information som användaren berättar tidigare i samma samtal"
- **Namn-minnesinstruktion** — modellen instrueras att kunna använda användarens namn senare i samma samtal
- **Utvecklingsloggning** — `console.log` i DEV-läge visar exakt vad som skickas till Ollama
- **Inställningar: Testa samtalsminne** — hjälpruta som förklarar hur man testar att minnet fungerar
- Build 4 → 4.1

## Funktioner i v0.1.0 Build 4

### ✅ Klart i Build 4
- **Detaljerade kompanjonprofiler** — alla 4 profiler har utförliga svenska systemprompts med tydlig roll, instruktioner och ton
- **Nytt fält `suggestedUse`** på `CompanionProfile` — beskriver när profilen passar bäst
- **Bas-systemprompt alltid aktiv** — EchoCompanion svarar på svenska per default även utan vald profil
- **Ny modul: `src/features/settings/systemPrompts.ts`** — `buildSystemPrompt()` kombinerar bas + profil + projektkonton
- **Full konversationshistorik till Ollama** — alla meddelanden i samtalet skickas med, ger korrekt minnesfunktion
- **Chattrubriken visar aktiv profil** — "💻 Kodmentor · Modell: llama3.2" i headern
- **Statusraden visar profilnamn** med emoji, inte råd ID
- **Inställningar — Profiler-sektion** — lista med alla profiler, beskrivningar och användningsområden
- **Svenska-notering i Inställningar** — "EchoCompanion svarar på svenska som standard, oavsett profil"
- **Hjälptext i höger panel** — "Profilen styr hur EchoCompanion svarar."
- Build 3 → 4 genomgående

## Funktioner i v0.1.0 Build 3

### ✅ Klart i Build 3
- **Sparade chattar** via `localStorage` — chattar sparas automatiskt efter varje svar
- **Chatthistorik i sidopanel** — "SAMTAL"-sektion med scrollbar lista av tidigare samtal
- **Ny chat-knapp** i sidopanel och chattrubriken (+ Ny chat)
- **Auto-titelsättning** — titeln genereras från det första meddelandet (max 45 tecken)
- **Öppna sparat samtal** — klicka i listan för att återöppna ett samtal med alla meddelanden
- **Byt namn** — klicka ✏ vid ett samtal (visar vid hover), bekräfta med prompt
- **Radera samtal** — klicka 🗑 vid ett samtal (hover), bekräfta med dialog
- **Chattrubriken** visar aktuell samtalsrubrik eller "Osparat samtal"
- **Aktiv modell sparas** med samtalet och återställs vid öppning
- **Persisterande efter reload** — chattar finns kvar efter webbläsaruppdatering
- Svenska felmeddelanden och tomma tillstånd genomgående
- Nytt modul: `src/features/chat/chatStorage.ts`

> **OBS:** localStorage används i utvecklingsläge. I Tauri-desktopappen (framtida version)
> kommer chattar sparas i lokala appdata-filer eller SQLite för mer robust lagring.

## Funktioner i v0.1.0 Build 2

### ✅ Klart i Build 2
- **Riktig Ollama-statuskontroll** via `GET /api/tags` — bekräftar anslutning och hämtar modeller i ett anrop
- **Live modellista** — alla installerade Ollama-modeller visas och uppdateras vid varje kontroll
- **Modellväljare** i höger panel — dropdown med alla hittade modeller, inaktiv när Ollama ej är ansluten
- **Automatiskt modellval** — väljer första modellen om ingen är vald efter anslutning
- **Modellinfo** under dropdown — visar filstorlek, parameterantal och kvantiseringsnivå
- **Modellguide — Installerade modeller** — matchas mot kända familjer med svenska beskrivningar
- **Okänd modell-stöd** — modeller utan matchning visas med neutralt meddelande och kan ändå användas
- **Statusmeddelande** efter Ollama-kontroll ("Ollama är ansluten — 3 modeller hittade")
- **Chattfunktion aktiv** — skickar meddelanden till Ollama med `POST /api/chat` (stream: false)
- **Hjälpruta** i Inställningar med exempelkommandon för modellinstallation
- **Svenska felmeddelanden** — tydlig text vid ej ansluten, ingen modell, API-fel
- `INSTÄLLNING`-kommentarer på timeout-värden, modellval och Ollama-URL

### ✅ Klart sedan Build 1
- Komplett dark premium AI-cockpit UI
- Tre-kolumns layout: Sidebar · Chatt · Höger panel
- Navigering: Chatt, Projekt, Prompts, Modellguide, Minne, Inställningar
- Välkomstskärm med live Ollama-statusindikator
- Meddelandebubblor med typing-indikator ("EchoCompanion tänker…")
- 4 kompanjonprofiler: Kodmentor, Promptmästare, Bokredaktör, Projektassistent
- 5 förberedda projekt: Taren, EchoDraft, JarvisBrain, Wilma Foto, SynthPixelStudios
- Modellguide med 11 kända modellfamiljer (lokala beskrivningar på svenska)
- Statusrad med version, build, budgetläge och Ollama-status
- Uppdateringskontroll (UI-platshållare)

### 🔧 Planerat framöver
- Sparade konversationer (Bash 3 / v0.2)
- Chatthistorik per projekt (v0.3)
- Projektminne (v0.3)
- Streaming-svar från Ollama (Bash 3)
- Modellväljare med nedladdningsknapp (v0.2)
- Modellväljare med live-lista från Ollama (Bash 2)
- Lokal TTS (v0.4)

---

## Teknisk stack

| Lager | Teknologi |
|---|---|
| Backend / native | [Tauri v2](https://tauri.app) (Rust) |
| Frontend | [React 18](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Build-verktyg | [Vite 6](https://vitejs.dev) |
| AI-backend | [Ollama](https://ollama.com) (lokalt) |
| Styling | Ren CSS med design tokens |

---

## Kom igång

### Krav
- [Node.js](https://nodejs.org) 18+ (redan installerat)
- [Rust + Cargo](https://rustup.rs) — krävs för att köra Tauri-desktopappen
- [Ollama](https://ollama.com) — för AI-chat

### 1. Installera beroenden

```bash
npm install
```

### 2. Förhandsgranska UI:t i webbläsaren (utan Rust)

```bash
npm run dev
```

Öppna sedan `http://localhost:1420` i webbläsaren.

### 3. Kör som Tauri-desktopapp (kräver Rust)

Installera Rust från https://rustup.rs, sedan:

```bash
npm run tauri dev
```

### 4. Bygg för produktion

```bash
npm run tauri build
```

---

## Projektstruktur

```
EchoCompanion/
├── src/
│   ├── components/          # React UI-komponenter
│   │   ├── Sidebar.tsx      # Vänster navigation
│   │   ├── ChatArea.tsx     # Huvud-chattarea + sektionsvisning
│   │   ├── RightPanel.tsx   # Höger statuspanel
│   │   ├── StatusBar.tsx    # Nedre statusrad
│   │   └── MessageBubble.tsx # Chattmeddelandebubbla
│   ├── features/
│   │   ├── chat/            # Chatt-typer och logik
│   │   ├── models/          # Modellguide-export
│   │   ├── ollama/          # Ollama API-service
│   │   ├── projects/        # Projekttyper och standardprojekt
│   │   └── settings/        # Inställningstyper och profiler
│   ├── data/
│   │   └── modelGuideData.ts # Lokal modellguide-data (11 familjer)
│   ├── styles/
│   │   └── globals.css      # Global stylesheet med design tokens
│   ├── App.tsx              # Huvud-appkomponent
│   └── main.tsx             # React-startpunkt
├── src-tauri/               # Rust/Tauri-backend
│   ├── src/main.rs          # Appens startpunkt
│   ├── src/lib.rs           # Tauri Builder-konfiguration
│   ├── Cargo.toml           # Rust-paketdefinition
│   ├── build.rs             # Tauri-build-script
│   └── tauri.conf.json      # Tauri-appkonfiguration
├── index.html               # HTML-startpunkt
├── package.json             # Node-paket
├── vite.config.ts           # Vite-konfiguration
└── tsconfig.json            # TypeScript-konfiguration
```

---

## Roadmap

| Version | Fokus |
|---|---|
| **v0.1** (nu) | UI-foundation + Ollama-förberedelse |
| **v0.2** | Riktigt Ollama-chatt + sparade konversationer |
| **v0.3** | Kompanjonprofiler + projektminne |
| **v0.4** | Lokal TTS (text-to-speech) |
| **v0.5** | Enkel avatarpanel |
| **v0.6** | Säker lokal filhjälp |
| **v1.0** | Stabil release med uppdateringskontroll via GitHub Releases |

---

## Säkerhetsregler

- Inga API-nycklar eller hemligheter i koden
- Inga molntjänster eller externa API:er
- Ingen automatisk nedladdning eller installation av uppdateringar (ännu)
- Ingen shell-command-execution från appen
- All data stannar lokalt på din dator

---

*Byggt med ❤ av Jimmy Eliasson · Budget: 0 kr · Local first*
