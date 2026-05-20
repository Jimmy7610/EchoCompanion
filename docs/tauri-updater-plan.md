# EchoCompanion — Tauri Updater Plan

## Skillnaden mellan Git-uppdatering och installer-uppdatering

### A) Git-uppdatering (utvecklarläge)

Används av Jimmy under aktiv utveckling. Kräver:
- Git installerat
- Node.js och npm
- Rust och Cargo
- Lokalt klonat repo

Flöde:
```powershell
git pull origin main
npm install
npm run typecheck
npm run build
npm run tauri:dev   # eller tauri:build för installer
```

**Passar:** Jimmys dagliga arbete med källkoden.  
**Passar inte:** En slutanvändare med installerad EchoCompanion.exe.

---

### B) Installer-uppdatering via GitHub Releases (installerläge)

Används av en person som har installerat EchoCompanion via `.exe` eller `.msi`.
De har **inget** Git, Node eller Rust installerat — och ska inte behöva det.

Flöde (ur användarens perspektiv):
1. Klicka "Sök och installera uppdatering" i appen
2. Appen kontrollerar `latest.json` på GitHub Releases
3. Om ny version finns: ladda ned signerad installer-bundle
4. Verifiera signaturen mot den inbyggda pubkey
5. Installera — användaren startar om appen

**Varför appen inte ska köra `git pull`:**
- Kräver att Git är installerat
- Kräver att repo är klonat
- Kan inte hantera signaturverifiering
- Bryter mot hur installerade appar normalt fungerar
- Risk för osignerade kodändringar

---

## Vad som krävs för att aktivera uppdateraren

### 1. Signeringsnyckel (minisign)

Tauri kräver att uppdateringspaket signeras med en privat nyckel.
Den publika nyckeln bäddas in i appen (`tauri.conf.json`).

Generera nyckelpar (kräver Tauri CLI + Rust):
```powershell
npm run tauri -- signer generate -w ~/.tauri/echocompanion.key
```

Kommandot skapar:
- `~/.tauri/echocompanion.key` — privat nyckel (HEMLIGHET — spara säkert, aldrig i repo)
- `~/.tauri/echocompanion.key.pub` — publik nyckel (lägg i tauri.conf.json)

Uppdatera `tauri.conf.json`:
```json
"plugins": {
  "updater": {
    "pubkey": "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk...",
    "endpoints": [
      "https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json"
    ],
    "dialog": false
  }
}
```

> ⚠ `PLACEHOLDER_REPLACE_WITH_REAL_MINISIGN_PUBKEY` i nuvarande config är ett platshållarstvärde.
> Uppdateraren är INTE aktiv förrän en riktig nyckel läggs in.

### 2. Signera installer vid bygge

Vid `npm run tauri:build` med privat nyckel i miljövariabel:
```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = "innehållet av .key-filen"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "ditt lösenord"
npm run tauri:build
```

Eller med nyckelfil:
```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content ~/.tauri/echocompanion.key -Raw)
npm run tauri:build
```

Bygget skapar då signerade filer i `src-tauri/target/release/bundle/`.

### 3. latest.json — uppdateringsmetadata

Skapa en `latest.json`-fil med exakt detta schema (Tauri v2):

```json
{
  "version": "0.1.1",
  "notes": "Vad som är nytt i den här versionen",
  "pub_date": "2026-06-01T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "signatursträngen från .sig-filen",
      "url": "https://github.com/Jimmy7610/EchoCompanion/releases/download/v0.1.1/EchoCompanion_0.1.1_x64-setup.nsis.zip"
    }
  }
}
```

Fältet `signature` hämtas från `.sig`-filen som skapas av Tauri build-processen:
```
src-tauri/target/release/bundle/nsis/EchoCompanion_0.1.1_x64-setup.nsis.zip.sig
```

### 4. GitHub Release

1. Skapa en ny release på GitHub (t.ex. tag `v0.1.1`)
2. Ladda upp:
   - `EchoCompanion_0.1.1_x64-setup.exe` (NSIS installer)
   - `EchoCompanion_0.1.1_x64-setup.nsis.zip` (zip av installer — krävs av updater)
   - `EchoCompanion_0.1.1_x64-setup.nsis.zip.sig` (signaturfil)
   - `latest.json` (uppdateringsmetadata)
3. Publice releasen

Den publika `latest.json`-URL:en blir då:
```
https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json
```

> OBS: GitHub Releases kräver att repo är **publikt** för att Tauri updater ska kunna nå filen
> utan autentisering. Om repot är privat behövs en token eller annan lösning.

---

## Nuvarande status (Build 29)

| Steg | Status |
|------|--------|
| `@tauri-apps/plugin-updater` installerat | ✅ v2.10.1 |
| `tauri-plugin-updater` i Cargo.toml | ✅ Tillagt |
| Plugin registrerat i lib.rs | ✅ Tillagt |
| Capabilities-fil med `updater:default` | ✅ Skapad |
| tauri.conf.json endpoints konfigurerat | ✅ Tillagt |
| Pubkey inlagd | ✅ Konfigurerad i tauri.conf.json |
| Signeringsnyckel genererad | ✅ Genererad lokalt (.tauri-signing/, gitignorerad) |
| `latest.json` skapad | ✅ Publicerad i GitHub Release v0.1.2 |
| GitHub Release med signerad bundle | ✅ v0.1.2 publicerad |
| Uppdateraren är aktiv och funktionell | ✅ Sluttest genomfört: v0.1.1 → v0.1.2 lyckades |

End-to-end-testet (Build 29) lyckades. v0.1.1 hittade och installerade v0.1.2 via
uppdateringsknappen. Privat nyckel forblev lokal under hela flodet.

> ⚠ **Nyckelrotation rekommenderas** infor nasta offentliga release.
> Se `docs/release-update-workflow.md` for instruktioner.

**Build 25 tillagt:**
- `.gitignore` — signeringssekret (`*.key`, `*.key.pub`, `*.sig`, `.tauri-signing/`, `release-work/`, `latest.local.json`) exkluderade
- `docs/latest.example.json` — säker exempelmall med platshållarvärden
- `docs/release-update-workflow.md` — komplett steg-för-steg-guide på svenska
- Inställningar → Uppdateringslägen — statuschecklista visar vad som är klart/saknas

**Build 26 tillagt:**
- Version bumpad till v0.1.1 (`package.json`, `tauri.conf.json`, `appInfo.ts`)
- `"createUpdaterArtifacts": true` tillagd i `tauri.conf.json` bundle-sektion
- `scripts/create-updater-key.ps1`, `build-signed-release.ps1`, `create-latest-json.ps1`
- `docs/github-release-v0.1.1-checklist.md`

**Build 27 tillagt:**
- GitHub Release v0.1.1 publicerad med installer, .sig och latest.json
- Public key konfigurerad i tauri.conf.json
- Statuschecklista i appen uppdaterad: 5 av 6 ✅

**Build 28 tillagt:**
- Version bumpad till v0.1.2
- `scripts/create-latest-json.ps1` uppdaterad för v0.1.2
- `scripts/build-signed-release.ps1` — bugg fixad (TAURI_SIGNING_PRIVATE_KEY rensas korrekt)
- `docs/github-release-v0.1.2-checklist.md` — fullständig checklista för end-to-end-test
- Statuschecklista i appen: release-kanal visar v0.1.1 publicerad, v0.1.2 planeras

**Build 29 tillagt:**
- End-to-end-test genomfört och verifierat: v0.1.1 → v0.1.2 lyckades
- Statuschecklista i appen: alla 6 punkter ✅
- `docs/github-release-v0.1.2-checklist.md` — fullstandigt ifylld med resultat
- `docs/release-update-workflow.md` — "Resultat v0.1.2"-sektion tillagd med nyckelrotationsrekommendation

**Build 30 tillagt:**
- `scripts/rotate-updater-key.ps1` — skapar — arkiverar gammal nyckel och genererar ny
- `docs/updater-key-rotation.md` — komplett rotationsguide pa svenska
- `.gitignore` — `.tauri-signing-old-test-key*/` tillagd
- Statuschecklista i appen: varningsrad om nyckelrotation tillagd
- Test-nyckelparet betraktas som komprometterat — ska inte anvandas for seriosa releaser

---

## Nasta steg (Build 31 — ren release med ny nyckel)

Infor nasta offentliga eller allvarliga release:

1. Kör `.\scripts\rotate-updater-key.ps1` — arkiverar gammal nyckel, genererar ny
2. Kopiera ENBART publik nyckel till `src-tauri/tauri.conf.json`
3. Committa `tauri.conf.json` — verifiera att ingen privat nyckel ar stagad forst
4. Bygg och publicera GitHub Release v0.1.3 med det nya nyckelparet
5. Installera v0.1.3 manuellt (v0.1.2 med gammal pubkey kan inte ta emot uppdateringen)
6. Radera arkivmappen `.tauri-signing-old-test-key-*` nar nya nyckeln ar verifierad

Se fullstandig guide: `docs/updater-key-rotation.md`

---

## Säkerhetsnotering

- Privat nyckel ska **aldrig** läggas i git-repot
- Lägg gärna till `.tauri/*.key` i `.gitignore`
- Publik nyckel är OK i `tauri.conf.json` och i repot
- Tauri verifierar signaturen kryptografiskt innan installation — inget okänt körs
- Appen kör inga shell-kommandon automatiskt vid uppdatering

---

## Git-uppdatering förblir tillgänglig

Git-uppdateringsflödet (se `docs/git-update-workflow.md`) förblir tillgängligt och
rekommenderas för Jimmy under aktiv utveckling. De två metoderna kompletterar varandra:

| | Git pull | GitHub Releases |
|-|----------|-----------------|
| Målgrupp | Jimmy (utvecklare) | Slutanvändare med installerad app |
| Kräver Git/Node/Rust | Ja | Nej |
| Kryptografisk signering | Nej | Ja (minisign) |
| Automatiserbar | Ja (manuell knapp) | Ja (manuell knapp, auto möjlig) |
