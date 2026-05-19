# EchoCompanion — Uppdatera via Git (utvecklingsarbetsflöde)

## Varför Git-uppdatering rekommenderas

Under aktiv utveckling är Git det säkraste och snabbaste sättet att hålla EchoCompanion uppdaterat.
Du behöver inte ladda ned ett installationsprogram — du hämtar bara de senaste ändringarna direkt från GitHub.

Fördelar jämfört med framtida release-installer:
- Inga paketerade filer att ladda ned
- Inga installatörsbehörigheter krävs
- Du ser exakt vilka filer som ändrades (`git diff`, `git log`)
- Enkelt att ångra med `git reset` om något går fel

---

## Exakta PowerShell-kommandon

Öppna PowerShell och kör i ordning:

```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion

git status

git pull origin main

npm install

npm run typecheck

npm run build

npm run tauri:dev
```

> EchoCompanion kör inte dessa kommandon automatiskt.
> Du kör dem själv i PowerShell så att du alltid har full kontroll.

---

## Steg för steg

### 1. Navigera till projektmappen
```powershell
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
```

### 2. Kontrollera lokalt tillstånd
```powershell
git status
```
Visar om du har osparade lokala ändringar. Om allt är rent visas:
`nothing to commit, working tree clean`

### 3. Hämta senaste versionen
```powershell
git pull origin main
```
Hämtar och slår samman senaste commits från GitHub.

### 4. Installera eventuella nya paket
```powershell
npm install
```
Behövs bara om `package.json` ändrats. Skadar inte att köra alltid.

### 5. Kontrollera TypeScript
```powershell
npm run typecheck
```
Verifierar att ingen TypeScript-kod är trasig.

### 6. Bygg frontend
```powershell
npm run build
```
Genererar en produktionsklar version i `dist/`.

### 7. Starta desktop-appen
```powershell
npm run tauri:dev
```
Kompilerar Rust-lagret (snabbare efter första gången) och öppnar Tauri-fönstret.

---

## Felsökning

### git pull säger: "Your local changes would be overwritten"

Du har osparade lokala ändringar. Välj ett alternativ:

**Alternativ A — Spara ändringar tillfälligt med stash:**
```powershell
git stash
git pull origin main
git stash pop
```

**Alternativ B — Kasta lokala ändringar (VARNING: kan inte ångras):**
```powershell
git checkout -- .
git pull origin main
```

### npm install misslyckas

Prova att rensa cache:
```powershell
npm cache clean --force
npm install
```

Om node_modules är korrupt:
```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### npm run tauri:dev misslyckas

**Kontrollera Rust:**
```powershell
rustc --version
cargo --version
```
Om Rust inte hittas: kör `rustup update` eller installera om från https://rustup.rs

**Kontrollera att ikoner finns:**
```powershell
Get-ChildItem src-tauri\icons\
```
Ska innehålla `icon.ico`, `32x32.png`, `128x128.png`, m.fl.

**Rensa Cargo-cache (sista utväg):**
```powershell
cargo clean
npm run tauri:dev
```

---

## Skillnaden mellan uppdateringsmetoder

| Metod | Status | Användning |
|-------|--------|------------|
| **Git pull** | ✅ Rekommenderas nu | Under aktiv utveckling — snabbast, säkrast |
| **GitHub Releases** | 🔍 Planeras | Framtida stabil release — hämtar paketerad installer |
| **Auto-uppdaterare** | ⏳ Planeras senare | Automatisk bakgrundsuppdatering via Tauri updater plugin |

Under Build 21 är Git pull den enda rekommenderade metoden.
EchoCompanion kör inga kommandon automatiskt — varken nu eller i framtiden utan ditt godkännande.

---

## Snabbreferens

Hela uppdateringsflödet på en rad (kör separat, inte som kedja):
```
cd C:\Users\Jimmy\Documents\GitHub\EchoCompanion
git pull origin main
npm install
npm run typecheck
npm run build
npm run tauri:dev
```
