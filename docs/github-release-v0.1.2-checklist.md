# EchoCompanion v0.1.2 — GitHub Release-checklista

Checklista för v0.1.2 — första riktiga end-to-end updater-testet.
Starta från installerad v0.1.1 och verifiera att uppdateringsknappen fungerar.

---

## Resultat (Build 29)

- [x] v0.1.2 signerat bygge skapat lokalt
- [x] `latest.json` skapad med rätt version och signatur
- [x] GitHub Release v0.1.2 publicerad med installer, .sig och latest.json
- [x] Updater-test från v0.1.1 till v0.1.2 genomfört och lyckades
- [x] Privat nyckel förblev lokal — ej committat
- [x] Inga build-artefakter committat till repot

> "det funkar" — Jimmy, Build 29

---

## Förberedelser

- [x] Installerad v0.1.1 fanns på testdatorn
- [x] Appen visade v0.1.1 Build 27 i Inställningar → App-information

---

## Steg 1 — Hämta senaste källkod

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
npm install
```

- [x] Bekräftat att `src/data/appInfo.ts` visade `APP_VERSION = "v0.1.2"` och `APP_BUILD = "28"`
- [x] Bekräftat att `src-tauri/tauri.conf.json` version var `"0.1.2"`

---

## Steg 2 — Sätt lösenord om nyckeln har ett

- [x] Lösenord sattes som miljövariabel (visas ej här)

> ⚠️ **Signeringslösenordet exponerades vid testning.**  
> Inför en offentlig eller allvarlig release bör nyckelparet roteras.  
> Se `docs/release-update-workflow.md` för instruktioner om nyckelrotation.

---

## Steg 3 — Bygg v0.1.2 med signering

- [x] `.\scripts\build-signed-release.ps1` kördes
- [x] `EchoCompanion_0.1.2_x64-setup.exe` skapad
- [x] `EchoCompanion_0.1.2_x64-setup.exe.sig` skapad

---

## Steg 4 — Skapa latest.json

- [x] `.\scripts\create-latest-json.ps1` kördes
- [x] `release-work\latest.json` skapad med version `0.1.2` och signatur

---

## Steg 5 — Skapa GitHub Release v0.1.2

- [x] GitHub Release `v0.1.2` publicerad
- [x] `EchoCompanion_0.1.2_x64-setup.exe` uppladdad
- [x] `EchoCompanion_0.1.2_x64-setup.exe.sig` uppladdad
- [x] `latest.json` uppladdad

---

## Steg 6 — Verifiera endpoint

- [x] `latest.json` nåbar via:
  `https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json`
- [x] JSON returnerar version `0.1.2`

---

## Steg 7 — Testa uppdateringsflödet (end-to-end)

- [x] Startade den installerade **v0.1.1**-appen
- [x] Gick till **Inställningar → Uppdatera appen**
- [x] Klickade **"Sök och installera uppdatering"**
- [x] Appen hittade v0.1.2 och visade nedladdningsknapp
- [x] Klickade för att installera
- [x] Startade om appen
- [x] Verifierade att uppdateringen lyckades

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
