# EchoCompanion — Release- och uppdateringsflöde

## Syfte

Det här dokumentet beskriver hur du skapar en signerad GitHub Release och aktiverar
Tauri-uppdateraren för EchoCompanion. Det är en engångsinställning — sedan kan varje
ny version publiceras med samma flöde.

---

## Skillnaden mellan Git-uppdatering och installer-uppdatering

| | Git pull (läge A) | GitHub Releases (läge B) |
|-|-------------------|-----------------------------|
| Målgrupp | Jimmy under utveckling | Slutanvändare med installerad app |
| Kräver Git/Node/Rust | Ja | Nej |
| Kryptografisk signering | Nej | Ja (minisign) |
| Kräver internetaccess | Ja (GitHub SSH/HTTPS) | Ja (GitHub Releases) |
| Verifierar kod automatiskt | Nej | Ja — Tauri verifierar signaturen |

---

## Varför signering krävs

Tauri v2 kräver att varje uppdateringspaket är signerat med ett minisign-nyckelpar.
Den publika nyckeln är inbäddad i appen (`tauri.conf.json`). Innan installation
verifierar Tauri att det nedladdade paketet matchar nyckeln — inget okänt körs.

---

## Vad som ALDRIG ska committas till repot

- `*.key` — privat minisign-nyckel
- `*.key.pub` — publik nyckel (bara pubkey-innehållet läggs i tauri.conf.json)
- `*.sig` — signaturfiler från bygget
- `.tauri-signing/` — nyckelkatalog om du lägger den lokalt
- `release-work/` — lokal arbetskatalog för release-filer
- `latest.local.json` — lokal testfil för latest.json

Dessa är redan tillagda i `.gitignore`.

---

## Förberedelser (engång)

### Krav

- Rust + Cargo installerat (`rustc --version`)
- Tauri CLI tillgänglig via npm (`npm run tauri -- --version`)
- Git konfigurerat med push-rättigheter till `Jimmy7610/EchoCompanion`

---

## Steg 1 — Generera minisign-nyckelpar

Kör **en gång** på Jimmys dator:

```powershell
npm run tauri -- signer generate -w $env:USERPROFILE\.tauri\echocompanion.key
```

Kommandot skapar:
- `~\.tauri\echocompanion.key` — **privat nyckel** (hemlighet — spara säkert, synka **aldrig** till repo eller moln)
- `~\.tauri\echocompanion.key.pub` — publik nyckel (lägg i tauri.conf.json)

Visa pubkey:
```powershell
Get-Content $env:USERPROFILE\.tauri\echocompanion.key.pub
```

---

## Steg 2 — Lägg pubkey i tauri.conf.json

Öppna `src-tauri/tauri.conf.json` och ersätt:
```json
"pubkey": "PLACEHOLDER_REPLACE_WITH_REAL_MINISIGN_PUBKEY"
```
med den faktiska pubkey-strängen (en lång base64-kodad rad som börjar med `dW50cnVzdGVkIGNvbW1lbnQ...` eller liknande).

Pusha ändringen till repot — pubkey är inte hemlig.

---

## Steg 3 — Bygg med signering

Läs in privat nyckel som miljövariabel och bygg:

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content $env:USERPROFILE\.tauri\echocompanion.key -Raw)
# Om nyckeln har lösenord:
# $env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "ditt-lösenord"

npm run tauri:build
```

Vänta ~5–15 minuter (Rust release-kompilering).

---

## Steg 4 — Hitta signaturfilen

Efter bygget finns signaturen i:
```
src-tauri/target/release/bundle/nsis/EchoCompanion_0.1.1_x64-setup.nsis.zip.sig
```

Visa signaturen:
```powershell
Get-Content src-tauri\target\release\bundle\nsis\EchoCompanion_0.1.1_x64-setup.nsis.zip.sig
```

Kopiera hela innehållet — det är värdet för `signature` i latest.json.

---

## Steg 5 — Skapa latest.json

Använd `docs/latest.example.json` som mall. Skapa en **lokal** fil (t.ex. `release-work/latest.json`):

```json
{
  "version": "0.1.1",
  "notes": "Vad som är nytt i version 0.1.1",
  "pub_date": "2026-01-15T12:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "signature": "<innehållet från .sig-filen>",
      "url": "https://github.com/Jimmy7610/EchoCompanion/releases/download/v0.1.1/EchoCompanion_0.1.1_x64-setup.nsis.zip"
    }
  }
}
```

Kontrollera att:
- `version` matchar versionen i `tauri.conf.json` och `appInfo.ts`
- `url` pekar på exakt rätt filnamn i din kommande GitHub Release
- `signature` är kopierad rakt från `.sig`-filen (inga extra radbrytningar)

---

## Steg 6 — Skapa GitHub Release

1. Gå till `https://github.com/Jimmy7610/EchoCompanion/releases/new`
2. Skapa tag: `v0.1.1`
3. Rubrik: `EchoCompanion v0.1.1`
4. Lägg till release notes (samma text som `notes` i latest.json)
5. Ladda upp **alla** dessa filer:
   - `EchoCompanion_0.1.1_x64-setup.exe` (NSIS-installer — vad användaren installerar)
   - `EchoCompanion_0.1.1_x64-setup.nsis.zip` (zip av installer — krävs av Tauri updater)
   - `EchoCompanion_0.1.1_x64-setup.nsis.zip.sig` (signaturfil)
   - `latest.json` (uppdateringsmetadata)
6. Publicera releasen

> ⚠️ Repot måste vara **publikt** för att Tauri updater ska kunna nå latest.json utan autentisering.

---

## Steg 7 — Verifiera endpoint

Kontrollera att latest.json nås på rätt URL:
```
https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json
```

Öppna URL:en i webbläsaren — den ska returnera din JSON-fil.

---

## Steg 8 — Testa uppdateringsflödet

1. Installera v0.1.0 (den gamla versionen) på en testdator
2. Starta appen
3. Gå till Inställningar → Uppdatera appen
4. Klicka "Sök och installera uppdatering"
5. Appen ska hitta v0.1.1, ladda ned och installera
6. Starta om — ny version ska visas i Inställningar → App-information

---

## Vanliga fel

| Fel | Orsak | Lösning |
|-----|-------|---------|
| `invalid signature` | Signaturen i latest.json stämmer inte med den inbyggda pubkey | Kontrollera att pubkey i tauri.conf.json matchar den privata nyckeln som användes vid bygget |
| `could not fetch latest.json` | URL är fel eller repot är privat | Kontrollera endpoint i tauri.conf.json, verifiera att repot är publikt |
| `version already installed` | Versionsnumret i latest.json är inte högre än installerad version | Öka versionsnumret i tauri.conf.json, package.json och appInfo.ts |
| `PLACEHOLDER` i pubkey | tauri.conf.json har inte uppdaterats med riktig nyckel | Kör steg 1–2 ovan |
| Bygget saknar `.sig`-filer | `TAURI_SIGNING_PRIVATE_KEY` var inte satt | Sätt miljövariabeln och bygg om |

---

## Rollback

Om en uppdatering orsakar problem:

1. Återpublicera en äldre installer som ny release (t.ex. `v0.1.1-rollback`)
2. Uppdatera `latest.json` med det äldre versionsnumret och dess signatur
3. Ladda upp uppdaterad `latest.json` till den nya releasen
4. Användare som klickar "Sök uppdatering" hämtar rollback-versionen

---

## Resultat v0.1.2

Första riktiga end-to-end updater-testet lyckades (Build 29).

- Den installerade appen (v0.1.1) hittade och installerade v0.1.2 via uppdateringsknappen
- `latest.json` och signaturen fungerade korrekt
- Privat nyckel förblev lokal under hela flödet
- Framtida releaser kan följa exakt samma workflow

### Nyckelrotation rekommenderas

Signeringslösenordet exponerades under testningen. Inför en offentlig eller allvarlig
release bör signeringsnyckelparet roteras. Se komplett guide:
[`docs/updater-key-rotation.md`](updater-key-rotation.md)

---

## Nyckelrotation efter test (Build 30)

v0.1.2 var ett lyckat funktionsttest — men test-nyckelparet ska inte användas för
seriösa eller offentliga releaser.

### Vad som ska göras

1. Kör `.\scripts\rotate-updater-key.ps1` lokalt
   - Arkiverar gammal `.tauri-signing/` → `.tauri-signing-old-test-key-DATUM`
   - Genererar nytt nyckelpar i `.tauri-signing/`
2. Kopiera ENBART den nya publika nyckeln till `src-tauri/tauri.conf.json`
3. Committa `tauri.conf.json` — verifiera att ingen privat nyckel är stagad
4. Bygg nästa release (v0.1.3) med det nya nyckelparet
5. Installera v0.1.3 manuellt (befintliga appar med gammal pubkey kan inte ta emot uppdateringen via auto-updater)

### Konsekvens för befintliga installationer

En app byggd med gammal pubkey kan bara acceptera uppdateringar signerade med gammal
privat nyckel. Eftersom v0.1.2 är en testrelease utan offentlig distribution är den
enklaste vägen att installera v0.1.3 manuellt från den nya releasen.

Framtida releaser från v0.1.3 och uppåt fungerar med ny pubkey.

### Vad som ALDRIG ska committas

```
.tauri-signing/
.tauri-signing-old-test-key*/
```

Bägge är gitignorerade. Verifiera med `git status --ignored`.

Se fullständig guide: [`docs/updater-key-rotation.md`](updater-key-rotation.md)

---

## Resultat v0.1.1

GitHub Release v0.1.1 publicerades med följande artefakter:

- `EchoCompanion_0.1.1_x64-setup.exe` — NSIS-installer
- `EchoCompanion_0.1.1_x64-setup.exe.sig` — signaturfil
- `latest.json` — uppdateringsmetadata

`latest.json` är tillgänglig via Tauri updater endpoint:
```
https://github.com/Jimmy7610/EchoCompanion/releases/latest/download/latest.json
```

Den privata nyckeln förblir lokal i `.tauri-signing/` och committas aldrig.

Nästa riktiga updater-test sker antingen från en installerad v0.1.0 eller via en
ny v0.1.2 release. Om installerad app redan är v0.1.1 är det korrekt att knappen
svarar "ingen ny uppdatering finns".

---

## Relaterade filer

- [`docs/latest.example.json`](latest.example.json) — säker exempelfil med platshållarvärden
- [`docs/tauri-updater-plan.md`](tauri-updater-plan.md) — teknisk plan och statustabeller
- [`docs/github-release-v0.1.1-checklist.md`](github-release-v0.1.1-checklist.md) — release-checklista
- [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json) — pubkey och endpoint-konfiguration
- [`src/features/updater/tauriUpdater.ts`](../src/features/updater/tauriUpdater.ts) — TypeScript-wrapper
