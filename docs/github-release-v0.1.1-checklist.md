# EchoCompanion v0.1.1 — GitHub Release-checklista

Komplett checklista för första signerade test-releasen av EchoCompanion.
Alla steg som kräver Rust, signeringsnyckel eller uppladdning körs lokalt av Jimmy.

---

## Förberedelser

- [ ] Installera EchoCompanion v0.1.0 på testdatorn (används för att verifiera uppdateringen)
  - Ladda ned installer från en äldre build eller bygg den lokalt: `npm run tauri:build`
  - Kör `EchoCompanion_0.1.0_x64-setup.exe`
  - Starta appen — verifiera att den visar v0.1.0 Build 25 i Inställningar → App-information

---

## Steg 1 — Generera signeringsnyckel (engång)

- [ ] Kör på Jimmys dator:
  ```powershell
  cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
  .\scripts\create-updater-key.ps1
  ```
- [ ] Scriptet visar din **publika nyckel** i terminalen
- [ ] Kopiera pubkey-strängen (lång base64-rad)
- [ ] Öppna `src-tauri/tauri.conf.json`
- [ ] Ersätt `PLACEHOLDER_REPLACE_WITH_REAL_MINISIGN_PUBKEY` med din pubkey
- [ ] Spara och committa `tauri.conf.json` (pubkey är inte hemlig)
- [ ] **Spara privat nyckel säkert** (t.ex. KeePass) — `.tauri-signing/echocompanion.key` är gitignorerad

---

## Steg 2 — Bygg v0.1.1 med signering

- [ ] Kör på Jimmys dator:
  ```powershell
  cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
  .\scripts\build-signed-release.ps1
  ```
- [ ] Vänta ~5–15 minuter (Rust release-kompilering)
- [ ] Verifiera att dessa filer finns efter bygget:
  - [ ] `src-tauri/target/release/bundle/nsis/EchoCompanion_0.1.1_x64-setup.exe`
  - [ ] `src-tauri/target/release/bundle/nsis/EchoCompanion_0.1.1_x64-setup.nsis.zip`
  - [ ] `src-tauri/target/release/bundle/nsis/EchoCompanion_0.1.1_x64-setup.nsis.zip.sig`

---

## Steg 3 — Skapa latest.json

- [ ] Kör på Jimmys dator:
  ```powershell
  .\scripts\create-latest-json.ps1
  ```
- [ ] Verifiera att `release-work/latest.json` skapades
- [ ] Kontrollera att filen innehåller rätt version (`0.1.1`) och en riktig signatur (ej tom)

---

## Steg 4 — Skapa GitHub Release

- [ ] Gå till: `https://github.com/Jimmy7610/EchoCompanion/releases/new`
- [ ] Skapa tag: `v0.1.1`
- [ ] Rubrik: `EchoCompanion v0.1.1`
- [ ] Release notes (matcha `notes` i latest.json):
  ```
  Testrelease för EchoCompanion updater.
  ```
- [ ] Ladda upp **alla** dessa filer:
  - [ ] `EchoCompanion_0.1.1_x64-setup.exe`
  - [ ] `EchoCompanion_0.1.1_x64-setup.nsis.zip`
  - [ ] `EchoCompanion_0.1.1_x64-setup.nsis.zip.sig`
  - [ ] `latest.json` (från `release-work/latest.json`)
- [ ] Publicera releasen

---

## Steg 5 — Verifiera endpoint

- [ ] Öppna i webbläsaren:
  `https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json`
- [ ] Bekräfta att JSON-filen returneras med version `0.1.1`
- [ ] Kontrollera att repot är **publikt** (annars behövs autentisering för Tauri updater)

---

## Steg 6 — Testa uppdateringsflödet

- [ ] Starta den installerade **v0.1.0**-appen
- [ ] Gå till **Inställningar → Uppdatera appen**
- [ ] Klicka **"Sök och installera uppdatering"**
- [ ] Appen ska hitta v0.1.1 och visa nedladdningsknapp
- [ ] Klicka för att installera
- [ ] Starta om appen
- [ ] Verifiera i Inställningar → App-information: visar `v0.1.1 Build 26`
- [ ] Verifiera att Ollama-anslutning fortfarande fungerar
- [ ] Verifiera att chatthistorik är bevarad
- [ ] Verifiera att backup-export fungerar

---

## Felsökning

| Symptom | Trolig orsak | Åtgärd |
|---------|-------------|--------|
| "Ingen ny signerad release hittades" | Versionen i appen är redan 0.1.1 | Testa från en v0.1.0-installation |
| "Signaturen kunde inte verifieras" | Pubkey matchar inte privat nyckel | Kontrollera att rätt pubkey finns i tauri.conf.json |
| "Updater-kanalen saknar" | latest.json nås inte | Verifiera att repot är publikt och att latest.json laddades upp |
| HTTP 404 | Filnamn i latest.json stämmer inte | Kontrollera URL i latest.json mot verkliga filnamn på GitHub Releases |
| Appen uppdateras inte efter omstart | Tauri-installer kördes inte klart | Kontrollera systemloggar; prova ny installation |

---

## Relaterade filer

- [`scripts/create-updater-key.ps1`](../scripts/create-updater-key.ps1)
- [`scripts/build-signed-release.ps1`](../scripts/build-signed-release.ps1)
- [`scripts/create-latest-json.ps1`](../scripts/create-latest-json.ps1)
- [`docs/release-update-workflow.md`](release-update-workflow.md)
- [`docs/latest.example.json`](latest.example.json)
- [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json)
