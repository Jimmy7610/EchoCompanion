# EchoCompanion v0.1.2 — GitHub Release-checklista

Checklista för v0.1.2 — första riktiga end-to-end updater-testet.
Starta från installerad v0.1.1 och verifiera att uppdateringsknappen fungerar.

---

## Förberedelser

- [ ] Installerad v0.1.1 finns på testdatorn
- [ ] Bekräfta att appen visar v0.1.1 Build 27 i Inställningar → App-information

---

## Steg 1 — Hämta senaste källkod

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
npm install
```

- [ ] Bekräfta att `src/data/appInfo.ts` visar `APP_VERSION = "v0.1.2"` och `APP_BUILD = "28"`
- [ ] Bekräfta att `src-tauri/tauri.conf.json` version är `"0.1.2"`

---

## Steg 2 — Sätt lösenord om nyckeln har ett

```powershell
# Hoppa över den här raden om nyckeln saknar lösenord
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "DITT_LOSENORD_HAR"
```

---

## Steg 3 — Bygg v0.1.2 med signering

```powershell
.\scripts\build-signed-release.ps1
```

- [ ] Vänta ~5–15 minuter (Rust release-kompilering)
- [ ] Bekräfta att dessa filer finns efter bygget:
  - [ ] `src-tauri\target\release\bundle\nsis\EchoCompanion_0.1.2_x64-setup.exe`
  - [ ] `src-tauri\target\release\bundle\nsis\EchoCompanion_0.1.2_x64-setup.exe.sig`

---

## Steg 4 — Skapa latest.json

```powershell
.\scripts\create-latest-json.ps1
```

- [ ] Bekräfta att `release-work\latest.json` skapades
- [ ] Kontrollera att filen innehåller version `0.1.2` och en signatur (ej tom sträng)

---

## Steg 5 — Skapa GitHub Release v0.1.2

- [ ] Gå till: `https://github.com/Jimmy7610/EchoCompanion/releases/new`
- [ ] Skapa tag: `v0.1.2`
- [ ] Rubrik: `EchoCompanion v0.1.2`
- [ ] Release notes:
  ```
  Testrelease for EchoCompanion updater end-to-end.
  ```
- [ ] Ladda upp **alla** dessa filer:
  - [ ] `EchoCompanion_0.1.2_x64-setup.exe`
  - [ ] `EchoCompanion_0.1.2_x64-setup.exe.sig`
  - [ ] `latest.json` (från `release-work\latest.json`)
- [ ] Publicera releasen

> **Ladda INTE upp:** `.tauri-signing/`-filer, privat nyckel, `src-tauri/target/`-filer
> eller `release-work/latest.json` till git-repot.

---

## Steg 6 — Verifiera endpoint

- [ ] Öppna i webbläsaren:
  `https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json`
- [ ] Bekräfta att JSON-filen returnerar version `0.1.2`
- [ ] Kontrollera att repot är **publikt**

---

## Steg 7 — Testa uppdateringsflödet (end-to-end)

- [ ] Starta den installerade **v0.1.1**-appen
- [ ] Gå till **Inställningar → Uppdatera appen**
- [ ] Klicka **"Sök och installera uppdatering"**
- [ ] Appen ska hitta v0.1.2 och visa nedladdningsknapp
- [ ] Klicka för att installera
- [ ] Starta om appen
- [ ] Verifiera i Inställningar → App-information: visar `v0.1.2 Build 28`
- [ ] Verifiera att Ollama-anslutning fortfarande fungerar
- [ ] Verifiera att chatthistorik är bevarad
- [ ] Verifiera att backup-export fungerar

---

## Felsökning

| Symptom | Trolig orsak | Åtgärd |
|---------|-------------|--------|
| "Ingen ny signerad release hittades" | latest.json hämtas men version matchar installerad | Verifiera att latest.json version är `0.1.2` och att installerad app är `0.1.1` |
| "Updater-kanalen kunde inte läsas" | latest.json nås inte | Verifiera att repot är publikt och att latest.json laddades upp |
| "Signaturen kunde inte verifieras" | Pubkey matchar inte nyckeln | Samma nyckelpar måste användas för signing och tauri.conf.json |
| HTTP 404 | Filnamn i latest.json matchar inte release-filnamnet | Kontrollera att URL i latest.json matchar exakt filnamn på GitHub Releases |

---

## Säkerhetspåminnelser

- Committa ALDRIG `.tauri-signing/echocompanion.key` (privat nyckel)
- Committa ALDRIG `release-work/latest.json`
- Committa ALDRIG `src-tauri/target/`-filer
- Pubkey i `tauri.conf.json` är OK att committa (är inte hemlig)

---

## Relaterade filer

- [`scripts/build-signed-release.ps1`](../scripts/build-signed-release.ps1)
- [`scripts/create-latest-json.ps1`](../scripts/create-latest-json.ps1)
- [`docs/github-release-v0.1.1-checklist.md`](github-release-v0.1.1-checklist.md) — föregående release
- [`docs/release-update-workflow.md`](release-update-workflow.md)
- [`docs/tauri-updater-plan.md`](tauri-updater-plan.md)
