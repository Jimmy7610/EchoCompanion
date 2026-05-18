# EchoCompanion — Lagringsmigrationsplan

## Nuläge (Build 12)

All användardata lagras i webbläsarens `localStorage` under nycklar med prefixet `echocompanion.*`:

| Nyckel | Innehåll |
|--------|----------|
| `echocompanion.savedChats.v1` | Sparade chattkonversationer (array) |
| `echocompanion.customPrompts.v1` | Egna promptmallar (array) |
| `echocompanion.projectMemory.v1` | Projektanteckningar (array) |
| `echocompanion.appSettings.v1` | Appinställningar (objekt) |
| `echocompanion.useStreaming.v1` | Legacy — migreras automatiskt vid start |

`localStorage` fungerar i både `npm run dev` och `npm run tauri:dev`.  
Gränsen är ~5 MB per ursprung, vilket är tillräckligt för normal användning.

---

## Varför localStorage är OK nu

- Enkel att debugga (DevTools → Application → Storage)
- Fungerar utan Rust/Tauri
- Inga externa beroenden
- Data överlever omstarter av appen (men inte cache-rensning i webbläsarläge)

---

## Framtida alternativ (Build 13+)

### Alternativ A — Tauri FS API (rekommenderat)
Skriv JSON-filer till Tauris app data-katalog (`%APPDATA%\se.jimmyeliasson.echocompanion\`).
- Data överlever cache-rensning
- Lever utanför webbläsarens sandlåda
- Kräver Rust + `@tauri-apps/api/fs`
- Migreringslogik behövs: läs localStorage → skriv till fil → radera localStorage-nyckel

### Alternativ B — SQLite via Tauri plugin
Strukturerad lagring med `tauri-plugin-sql`.
- Bättre för stora datamängder
- Mer komplex setup
- Overkill för nuvarande datavolymer

---

## Säker migreringsprocess (när den tid kommer)

1. **Exportera backup** via Inställningar → Backup och export
2. Implementera skrivfunktioner i `storageAdapter.ts` (Tauri FS API)
3. Implementera läsfunktioner med fallback till localStorage
4. Lägg till migreringsrutin i app-start: localStorage → fil → ta bort gamla nycklar
5. Testa i `npm run tauri:dev` med tom profil och med befintlig data
6. Verifiera att diagnostiksektionen visar rätt backend efter migrering
7. Pusha och bygg ny release

---

## Vad du INTE ska göra

- Byt aldrig nyckelnamn utan migreringsrutin — det raderar användarens data
- Starta inte Tauri FS-implementationen utan fullständig backup
- Implementera inte båda backends parallellt utan feature flag
- Ta inte bort `storageAdapter.ts` — den är förberedd för framtida användning

---

## Filer att uppdatera vid migrering

- `src/features/storage/storageAdapter.ts` — implementera Tauri FS-anrop
- `src/features/storage/storageKeys.ts` — lägg till filsökvägar om nödvändigt
- `src/App.tsx` — anropa migreringsrutin vid start
- `src/features/storage/storageDiagnostics.ts` — uppdatera backend-label
