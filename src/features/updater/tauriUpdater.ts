// ============================================================
// tauriUpdater.ts — Wrapper för Tauri updater-plugin (Build 23)
//
// Degraderar graciöst i webbläsarläge.
// Appen kör inga kommandon automatiskt — uppdatering kräver
// explicit användarinteraktion via knapp.
// ============================================================

import { check } from "@tauri-apps/plugin-updater";

const BROWSER_MSG =
  "Installer-uppdatering fungerar endast i Tauri desktop-läge. Använd Git-uppdatering under utveckling.";

const NO_KEY_MSG =
  "Uppdateraren är inte aktiverad ännu — signerad latest.json och pubkey krävs. Se docs/tauri-updater-plan.md.";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI__" in window;
}

export function isTauriUpdaterAvailable(): boolean {
  return isTauri();
}

export interface UpdateCheckResult {
  available: boolean;
  version?: string;
  notes?: string;
  message: string;
}

export async function checkForInstallerUpdate(): Promise<UpdateCheckResult> {
  if (!isTauri()) {
    return { available: false, message: BROWSER_MSG };
  }

  try {
    const update = await check();
    if (update) {
      return {
        available: true,
        version: update.version,
        notes: update.body ?? undefined,
        message: `Ny version tillgänglig: ${update.version}`,
      };
    }
    return { available: false, message: "Du har redan den senaste versionen." };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    // Pubkey/endpoint not yet configured — surface a friendly message
    if (raw.includes("pubkey") || raw.includes("signature") || raw.includes("PLACEHOLDER")) {
      return { available: false, message: NO_KEY_MSG };
    }
    return { available: false, message: `Kontroll misslyckades: ${raw}` };
  }
}

export async function installInstallerUpdate(): Promise<{ success: boolean; message: string }> {
  if (!isTauri()) {
    return { success: false, message: BROWSER_MSG };
  }

  try {
    const update = await check();
    if (!update) {
      return { success: false, message: "Ingen uppdatering att installera." };
    }
    await update.downloadAndInstall();
    return {
      success: true,
      message: "Uppdatering nedladdad. Starta om appen för att aktivera den nya versionen.",
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Installation misslyckades: ${raw}` };
  }
}
