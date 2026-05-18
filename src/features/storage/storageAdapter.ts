// ============================================================
// storageAdapter.ts — Lagringsadapter (förbereder för Tauri FS API)
//
// NULÄGE (Bash 12):
//   Alla läs- och skrivoperationer går via webbläsarens localStorage.
//   Det fungerar i både npm run dev och npm run tauri:dev.
//
// FRAMTID (Bash 12+):
//   Desktop-versionen bör använda Tauris app data-katalog (JSON-filer)
//   så att datan överlever webbläsar-cache-rensning och lever utanför
//   webbläsarens sandlåda.
//
// MIGRATION:
//   Gör alltid en fullständig backup innan migrering påbörjas.
//   Se docs/storage-migration-plan.md för stegvis plan.
//
// VIKTIG REGEL:
//   Byt inte ut befintliga moduler mot denna adapter förrän Tauri FS
//   API är implementerat och testat. Adaptern är en förberedelse.
// ============================================================

// INSTÄLLNING - Lägg till "tauriAppData" när Tauri FS API implementeras i framtida build
export type StorageBackend = "localStorage" | "tauriAppDataFuture";

/**
 * Kontrollerar om Tauri-runtime är tillgänglig.
 * Returnerar false i webbläsarläge (npm run dev).
 * Returnerar true när appen körs via npm run tauri:dev eller tauri:build.
 */
export function isTauriAvailable(): boolean {
  try {
    return typeof window !== "undefined" && "__TAURI__" in window;
  } catch {
    return false;
  }
}

/**
 * Returnerar aktuellt lagringsbackend.
 * localStorage används i alla lägen under Bash 12.
 */
export function getCurrentStorageBackend(): StorageBackend {
  // INSTÄLLNING - Byt till "tauriAppDataFuture" när Tauri FS API är implementerat
  return "localStorage";
}

/**
 * Läser ett värde från aktuellt lagringsbackend.
 * Returnerar null om nyckeln saknas eller vid fel.
 */
export function readStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Skriver ett värde till aktuellt lagringsbackend.
 * Tyst vid fel — lägg till felhantering vid behov.
 */
export function writeStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Framtida: meddela användaren om localStorage är fullt
  }
}

/**
 * Tar bort en nyckel från aktuellt lagringsbackend.
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignorera — nyckeln saknas förmodligen
  }
}
