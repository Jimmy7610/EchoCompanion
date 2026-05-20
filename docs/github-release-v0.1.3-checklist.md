# EchoCompanion v0.1.3 — GitHub Release-checklista

Första rena signerade releasen efter nyckelrotation.
v0.1.3 är den nya baslinjen — framtida updater-test kör från v0.1.3 till v0.1.4.

> ⚠ **Viktigt:** Appar installerade från v0.1.1 eller v0.1.2 med den gamla public key
> kan INTE ta emot den här uppdateringen via auto-updater (pubkey har ändrats).
> Installera v0.1.3 manuellt som ny basinstallation.

---

## Resultat

- [ ] v0.1.3 signerat bygge skapat lokalt
- [ ] `latest.json` skapad med rätt version och signatur
- [ ] GitHub Release v0.1.3 publicerad med installer, .sig och latest.json
- [ ] v0.1.3 installerad manuellt och verifierad
- [ ] Privat nyckel förblev lokal — ej committat

---

## Förberedelser

- [ ] `git pull origin main` kördes
- [ ] APP_VERSION visar `v0.1.3` och APP_BUILD visar `31` i `src/data/appInfo.ts`
- [ ] `src-tauri/tauri.conf.json` version är `"0.1.3"`
- [ ] Ny public key är konfigurerad i `tauri.conf.json` (roterades i Build 30, commit fa6fa60)
- [ ] `.tauri-signing/echocompanion.key` finns lokalt (ny nyckel efter rotation)

---

## Steg 1 — Hämta senaste källkod

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
npm install
```

- [ ] Bekräftat att `src/data/appInfo.ts` visar `APP_VERSION = "v0.1.3"` och `APP_BUILD = "31"`
- [ ] Bekräftat att `src-tauri/tauri.conf.json` version är `"0.1.3"`

---

## Steg 2 — Sätt lösenord om nyckeln har ett

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "DITT_NYA_LOSENORD_HAR"
```

- [ ] Lösenord för den **nya** nyckeln sattes (om nyckeln har lösenord)

> ⚠ Använd lösenordet för den **nya** roterade nyckeln, inte det gamla test-lösenordet.

---

## Steg 3 — Bygg v0.1.3 med signering

```powershell
.\scripts\build-signed-release.ps1
```

- [ ] Bygget slutfördes utan fel
- [ ] `EchoCompanion_0.1.3_x64-setup.exe` skapad i `src-tauri\target\release\bundle\nsis\`
- [ ] `EchoCompanion_0.1.3_x64-setup.exe.sig` skapad i samma mapp

---

## Steg 4 — Skapa latest.json

```powershell
.\scripts\create-latest-json.ps1
```

- [ ] `release-work\latest.json` skapad med version `0.1.3` och signatur
- [ ] Verifiera att version i JSON är `"0.1.3"` (inte `0.1.2`)

---

## Steg 5 — Skapa GitHub Release v0.1.3

1. Gå till `https://github.com/Jimmy7610/EchoCompanion/releases/new`
2. Skapa tag: `v0.1.3`
3. Rubrik: `EchoCompanion v0.1.3`
4. Release notes: "Clean signed release after updater signing key rotation. First clean baseline for future updater tests."
5. Ladda upp:
   - `EchoCompanion_0.1.3_x64-setup.exe`
   - `EchoCompanion_0.1.3_x64-setup.exe.sig`
   - `latest.json`
6. Publicera releasen

- [ ] GitHub Release `v0.1.3` publicerad
- [ ] `EchoCompanion_0.1.3_x64-setup.exe` uppladdad
- [ ] `EchoCompanion_0.1.3_x64-setup.exe.sig` uppladdad
- [ ] `latest.json` uppladdad

---

## Steg 6 — Verifiera endpoint

```
https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json
```

- [ ] JSON returnerar version `0.1.3`

---

## Steg 7 — Installera v0.1.3 manuellt

Eftersom pubkey ändrats kan befintliga testinstallationer (v0.1.1 eller v0.1.2)
inte ta emot uppdateringen automatiskt. Installera manuellt:

1. Kör `EchoCompanion_0.1.3_x64-setup.exe`
2. Starta appen
3. Gå till Inställningar → App-information
4. Verifiera: `v0.1.3 Build 31`

- [ ] v0.1.3 installerad manuellt
- [ ] App visar `v0.1.3 Build 31`
- [ ] Ollama-anslutning fungerar
- [ ] Chat fungerar
- [ ] Uppdateringsknappen svarar (ingen ny uppdatering = korrekt)

---

## Steg 8 — Nästa updater-test

Framtida updater-test:
- Installerad **v0.1.3** (ny basinstallation med ny pubkey)
- → GitHub Release **v0.1.4** (signerat med ny privat nyckel)

- [ ] v0.1.3 är bekräftad som ny basinstallation

---

## Säkerhetspåminnelser

- Committa ALDRIG `.tauri-signing/` (privat nyckel)
- Committa ALDRIG `.tauri-signing-old-test-key*/`
- Committa ALDRIG `release-work/latest.json`
- Committa ALDRIG `src-tauri/target/`-filer
- Ladda ALDRIG upp `.tauri-signing/echocompanion.key` till GitHub
- Pubkey i `tauri.conf.json` är OK att committa

---

## Relaterade filer

- [`scripts/build-signed-release.ps1`](../scripts/build-signed-release.ps1)
- [`scripts/create-latest-json.ps1`](../scripts/create-latest-json.ps1)
- [`docs/updater-key-rotation.md`](updater-key-rotation.md)
- [`docs/github-release-v0.1.2-checklist.md`](github-release-v0.1.2-checklist.md) — föregående release
- [`docs/release-update-workflow.md`](release-update-workflow.md)
