# EchoCompanion v0.1.1 — GitHub Release-checklista

Komplett checklista för första signerade test-releasen av EchoCompanion.
Alla steg som kräver Rust, signeringsnyckel eller uppladdning körs lokalt av Jimmy.

---

## Förberedelser

- [x] Installera EchoCompanion v0.1.0 på testdatorn (används för att verifiera uppdateringen)

---

## Steg 1 — Generera signeringsnyckel (engång)

- [x] Kör på Jimmys dator: `.\scripts\create-updater-key.ps1`
- [x] Pubkey kopierad till `src-tauri/tauri.conf.json` och committat
- [x] Privat nyckel sparad lokalt i `.tauri-signing/` (gitignorerad)

---

## Steg 2 — Bygg v0.1.1 med signering

- [x] `.\scripts\build-signed-release.ps1` kördes lokalt
- [x] `EchoCompanion_0.1.1_x64-setup.exe` skapad
- [x] `EchoCompanion_0.1.1_x64-setup.exe.sig` skapad

---

## Steg 3 — Skapa latest.json

- [x] `latest.json` skapad och innehåller rätt version och signatur

---

## Steg 4 — Skapa GitHub Release

- [x] GitHub Release `v0.1.1` publicerad
- [x] `EchoCompanion_0.1.1_x64-setup.exe` uppladdad
- [x] `EchoCompanion_0.1.1_x64-setup.exe.sig` uppladdad
- [x] `latest.json` uppladdad

---

## Steg 5 — Verifiera endpoint

- [x] `latest.json` nåbar via:
  `https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json`
- [x] JSON returnerar version `0.1.1`

---

## Steg 6 — Testa uppdateringsflödet (återstår)

> **OBS:** Eftersom den lokala installerade appen redan kan vara v0.1.1 behöver nästa
> riktiga updater-test antingen göras från en installerad v0.1.0 eller med en ny v0.1.2 release.

- [ ] Starta den installerade **v0.1.0**-appen (eller vänta på v0.1.2)
- [ ] Gå till **Inställningar → Uppdatera appen**
- [ ] Klicka **"Sök och installera uppdatering"**
- [ ] Appen ska hitta ny version och visa nedladdningsknapp
- [ ] Klicka för att installera
- [ ] Starta om appen
- [ ] Verifiera i Inställningar → App-information: visar ny version och nytt Build-nummer
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
