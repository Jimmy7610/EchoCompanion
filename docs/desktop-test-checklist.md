# EchoCompanion — Desktop Test Checklist

Use this checklist before and during Tauri desktop testing.
Browser mode works without Rust. Desktop mode requires Rust.

---

## Förberedelser

- [ ] `npm install` kördes utan fel
- [ ] `npm run typecheck` passerar utan fel
- [ ] `npm run build` passerar utan fel
- [ ] Rust installerat (`rustc --version` och `cargo --version` fungerar)
  - Installera från https://rustup.rs om det saknas (gratis, ~5 min)
- [ ] Ollama installerat och igång om du vill testa chatt
  - Kontrollera med `ollama list`
- [ ] Minst en Ollama-modell installerad (t.ex. `ollama pull llama3.2`)

---

## Webbläsartest (npm run dev)

Kör: `npm run dev` → öppna http://localhost:1420

- [ ] Appen laddas utan fel i konsolen
- [ ] Välkomstsidan visas korrekt (dark theme, EchoCompanion-rubrik)
- [ ] "Kontrollera Ollama" fungerar i höger panel
- [ ] Modellväljaren visar installerade modeller
- [ ] Skicka ett meddelande → svar kommer tillbaka
- [ ] Streaming fungerar (svar skrivs ut token för token)
- [ ] "Stoppa"-knappen avbryter generering
- [ ] TTS-uppläsning fungerar (om aktiverad i Inställningar)
- [ ] Kompanjonavatar reagerar på status (idle/tänker/pratar/offline)
- [ ] Spara chatt → visas i sidopanelen
- [ ] Öppna sparad chatt → meddelanden laddas
- [ ] Backup-export (Inställningar → Backup och export)
- [ ] Inställningar → Desktop-läge visas korrekt
- [ ] Smart modellhjälp (Modellguide) visar rekommendation

---

## Desktop-devtest (npm run tauri:dev)

**Kräver Rust installerat.**

Kör: `npm run tauri:dev`

- [ ] Tauri-fönstret öppnas (1440×900 eller liknande)
- [ ] Appen laddas i fönstret (dark theme, ingen vit flash)
- [ ] Inga Rust-kompileringsfel i terminalen
- [ ] "Kontrollera Ollama" fungerar i desktop-fönstret
- [ ] Modellväljaren fungerar
- [ ] Skicka ett meddelande → svar via Ollama
- [ ] Streaming fungerar i desktop-läget
- [ ] TTS-uppläsning fungerar (Web Speech i WebView)
  - OBS: röster i WebView kan skilja sig från webbläsaren
- [ ] Inställningssidan öppnas
- [ ] Backup-export fungerar (sparas i nedladdningsmappen)
- [ ] Uppdateringskontroll — knappen öppnar GitHub Releases (ingen auto-install)
- [ ] Fönstret kan minimeras/maximeras/stängas normalt
- [ ] Inga krascher vid normal användning

---

## Desktop-produktionstest (npm run tauri:build)

**Kräver Rust installerat och att tauri:dev fungerar.**

Kör: `npm run tauri:build`

- [ ] Bygget slutförs utan fel
- [ ] Installationspaket skapas i:
  - `src-tauri/target/release/bundle/nsis/` (NSIS .exe)
  - `src-tauri/target/release/bundle/msi/` (MSI .msi)
- [ ] Kör installationsfilen → appen installeras
- [ ] Appen startar från Start-menyn eller skrivbordet
- [ ] Version och build visas korrekt i Inställningar → App-information
- [ ] Inga betaltjänster, molnanrop eller API-nycklar krävs
- [ ] Ollama-chatten fungerar i den installerade appen

---

## Kända begränsningar (Build 18)

- **Web Speech TTS** beror på Windows WebView2-röster — kan skilja sig från webbläsarröster
- **Data i localStorage/WebView** — chattar och inställningar lagras i WebView-storage, inte i vanlig filsystem
  - Migration till Tauri FS API planeras i ett senare build
- **Appikon** — platshållarikon används ännu, ingen riktig EchoCompanion-ikon finns
  - Skapa med: `npm run tauri icon sökväg/till/ikon.png`
- **Auto-uppdatering** — inte implementerad; uppdateringskontrollen öppnar bara GitHub Releases-länken
- **Tauri-fönsterkonfiguration**: 1440×900, minimum 1100×720 (se `src-tauri/tauri.conf.json`)

---

## Versionssync — innan release

Om du ändrar versionsnummer, uppdatera dessa tre filer:

1. `src/data/appInfo.ts` — `APP_VERSION` och `APP_BUILD`
2. `src-tauri/tauri.conf.json` — `version`
3. `package.json` — `version`

---

*Uppdaterat i Build 18 — 2026-05-19*
