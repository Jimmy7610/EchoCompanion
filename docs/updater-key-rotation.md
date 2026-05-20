# EchoCompanion — Nyckelrotation för updater-signering

## Varför nyckelrotation krävs

Under end-to-end-testet av Tauri-uppdateraren (Build 29, v0.1.1 → v0.1.2)
exponerades signeringslösenordet för test-nyckelparet. Testet lyckades, men
test-nyckelparet ska inte användas för seriösa eller offentliga releaser.

Inget lösenord eller privat nyckel dokumenteras i det här filen — de hanteras
enbart lokalt på Jimmys dator.

---

## Vad som hände

- v0.1.2-releasen byggdes och signerades med ett test-nyckelpar
- Signeringslösenordet exponerades oavsiktligt under testning
- Själva test-releasen fungerade som avsett
- Privat nyckel commitades aldrig till repot
- Nyckelrotation rekommenderas innan nästa publika eller seriösa release

---

## Viktiga regler

- **Privat nyckel får ALDRIG committas** till repot
- **Publik nyckel är OK att committa** (läggs i `src-tauri/tauri.conf.json`)
- **Gammal nyckel ska arkiveras eller raderas lokalt** — aldrig återanvändas
- **Ny nyckel används för alla framtida releaser**
- **v0.1.2 betraktas som testrelease** och ska inte distribueras offentligt

---

## Rotationsflöde (steg för steg)

### A. Stäng appen och terminaler som kan ha nyckeln laddad

Kontrollera att `TAURI_SIGNING_PRIVATE_KEY` inte är satt i någon aktiv terminal:
```powershell
$env:TAURI_SIGNING_PRIVATE_KEY = $null
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = $null
```

### B. Kör rotationsskriptet

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
.\scripts\rotate-updater-key.ps1
```

Skriptet gör följande:
1. Kontrollerar att git working tree är rent (inga osparade ändringar)
2. Byter namn på `.tauri-signing` till `.tauri-signing-old-test-key-TIMESTAMP`
3. Anropar `.\scripts\create-updater-key.ps1` för att generera nytt nyckelpar
4. Visar den nya publika nyckeln i terminalen
5. Instruerar om nästa steg

Du kan också göra steg B manuellt:
```powershell
if (Test-Path ".tauri-signing") {
    $ts = Get-Date -Format "yyyyMMdd-HHmmss"
    Rename-Item ".tauri-signing" ".tauri-signing-old-test-key-$ts"
}
.\scripts\create-updater-key.ps1
```

### C. Kopiera ENBART publik nyckel till tauri.conf.json

Öppna `src-tauri/tauri.conf.json` och ersätt befintligt `pubkey`-värde:
```json
"pubkey": "<ny pubkey-sträng från skriptet>"
```

Den gamla test-pubkey-strängen börjar med:
```
dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IENFMURENzEwQzNERkRGNEMK
```
Ersätt hela strängen med den nya.

### D. Verifiera att ingen privat nyckel är stagad

```powershell
git status
git status --ignored
```

Kontrollera att `.tauri-signing/` och `.tauri-signing-old-test-key*/` INTE syns som
stagade filer. Om de gör det: lägg till dem i `.gitignore` och kör `git reset HEAD`.

### E. Committa ENBART säkra filer

```powershell
git add src-tauri/tauri.conf.json
git add docs/updater-key-rotation.md
git add docs/release-update-workflow.md
git add docs/tauri-updater-plan.md
git add README.md
git add src/data/appInfo.ts
git add src/components/ChatArea.tsx
# Lägg till övriga ändrade docs om relevanta
git commit -m "Build 31: rotate updater signing key, use new pubkey"
git push origin main
```

### F. Filer som ALDRIG ska committas

```
.tauri-signing/
.tauri-signing-old-test-key*/
release-work/
src-tauri/target/
*.key
*.key.pub
*.sig
```

Alla dessa är gitignorerade. Verifiera med `git status --ignored`.

### G. Nästa signerade release

Bygg nästa release (v0.1.3 rekommenderas) med det nya nyckelparet:
```powershell
.\scripts\build-signed-release.ps1
.\scripts\create-latest-json.ps1
```

Ladda upp till GitHub Release v0.1.3.

---

## Konsekvens för befintliga installationer

> **Viktigt att förstå:**

Tauri-uppdateraren verifierar signaturen på nedladdad installer mot den pubkey som
är inbyggd i den körande appen. Det betyder:

- En app byggd med **gammal pubkey** kan bara acceptera uppdateringar signerade med
  **gammal privat nyckel**
- Om pubkey roteras och ny release (v0.1.3) publiceras kan **en app med gammal pubkey
  INTE ta emot v0.1.3 via auto-uppdatering**

### Säker väg framåt (testfas)

Eftersom v0.1.2 är en testrelease och inte distribueras offentligt är den enklaste
och säkraste vägen:

1. Rotera nyckelparet nu
2. Bygg v0.1.3 med ny nyckel och ny pubkey inbäddad
3. Installera v0.1.3 manuellt (kör installer direkt)
4. Framtida releaser från v0.1.3 och uppåt fungerar med ny pubkey

Eftersom ingen slutanvändare har installerat från den gamla test-nyckeln uppstår
inget reellt distributionsproblem.

---

## Relaterade filer

- [`scripts/rotate-updater-key.ps1`](../scripts/rotate-updater-key.ps1)
- [`scripts/create-updater-key.ps1`](../scripts/create-updater-key.ps1)
- [`scripts/build-signed-release.ps1`](../scripts/build-signed-release.ps1)
- [`docs/release-update-workflow.md`](release-update-workflow.md)
- [`docs/tauri-updater-plan.md`](tauri-updater-plan.md)
- [`src-tauri/tauri.conf.json`](../src-tauri/tauri.conf.json)
