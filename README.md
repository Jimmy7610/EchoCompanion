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
