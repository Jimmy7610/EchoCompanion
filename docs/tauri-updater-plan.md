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

## Nuvarande status (Build 25)

| Steg | Status |
|------|--------|
| `@tauri-apps/plugin-updater` installerat | ✅ v2.10.1 |
| `tauri-plugin-updater` i Cargo.toml | ✅ Tillagt |
| Plugin registrerat i lib.rs | ✅ Tillagt |
| Capabilities-fil med `updater:default` | ✅ Skapad |
| tauri.conf.json endpoints konfigurerat | ✅ Tillagt |
| Pubkey inlagd | ❌ Platshållare — kräver nyckelgenerering |
| Signeringsnyckel genererad | ❌ Inte genererat än |
| `latest.json` skapad | ❌ Inte skapad än |
| GitHub Release med signerad bundle | ❌ Inte publicerat än |
| Uppdateraren är aktiv och funktionell | ❌ Kräver stegen ovan |

Knappen "Sök och installera uppdatering" i appen är kopplad till den riktiga plugin-API:n.
Den visar ett informativt felmeddelande tills pubkey och latest.json finns på plats.

**Build 25 tillagt:**
- `.gitignore` — signeringssekret (`*.key`, `*.key.pub`, `*.sig`, `.tauri-signing/`, `release-work/`, `latest.local.json`) exkluderade
- `docs/latest.example.json` — säker exempelmall med platshållarvärden
- `docs/release-update-workflow.md` — komplett steg-för-steg-guide på svenska
- Inställningar → Uppdateringslägen — statuschecklista visar vad som är klart/saknas

---

## Nästa steg (Build 26 — v0.1.1 signerat test)

1. Generera minisign-nyckelpar: `npm run tauri -- signer generate -w ~/.tauri/echocompanion.key`
2. Byt ut `PLACEHOLDER_REPLACE_WITH_REAL_MINISIGN_PUBKEY` i `tauri.conf.json` med riktig pubkey
3. Bygg med signering: `$env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content ~/.tauri/echocompanion.key -Raw); npm run tauri:build`
4. Kopiera signaturen från `.sig`-filen, skapa `latest.json` med rätt version, URL och signatur
5. Skapa GitHub Release `v0.1.1` och ladda upp installer + zip + sig + latest.json
6. Testa: installera v0.1.0, klicka "Sök uppdatering" — ska hitta och installera v0.1.1

Se fullständig guide: `docs/release-update-workflow.md`

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
