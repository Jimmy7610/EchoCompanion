// ============================================================
// tauriUpdater.ts — Wrapper för Tauri updater-plugin (Build 29)
//
// Degraderar graciöst i webbläsarläge.
// Appen kör inga kommandon automatiskt — uppdatering kräver
// explicit användarinteraktion via knapp.
// ============================================================

import { check } from "@tauri-apps/plugin-updater";

const BROWSER_MSG =
  "Installer-uppdatering fungerar endast i Tauri desktop-läge. Använd Git-uppdatering under utveckling.";

const NO_CHANNEL_MSG =
  "Updater-kanalen kunde inte läsas. Kontrollera att latest.json finns i GitHub Release.";

const BAD_SIGNATURE_MSG =
  "Signaturen kunde inte verifieras. Kontrollera public key och .sig-filen.";

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
    return {
      available: false,
      message: "Ingen ny signerad release hittades. Om du redan kör senaste versionen är detta normalt.",
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes("PLACEHOLDER") || raw.includes("pubkey") || raw.includes("InvalidPublicKey")) {
      return { available: false, message: NO_CHANNEL_MSG };
    }
    if (raw.includes("signature") || raw.includes("InvalidSignature") || raw.includes("verify")) {
      return { available: false, message: BAD_SIGNATURE_MSG };
    }
    if (raw.includes("404") || raw.includes("fetch") || raw.includes("network") || raw.includes("latest.json")) {
      return { available: false, message: NO_CHANNEL_MSG };
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
      message: "Uppdatering installerad. Starta om appen för att aktivera den nya versionen.",
    };
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    if (raw.includes("signature") || raw.includes("InvalidSignature") || raw.includes("verify")) {
      return { success: false, message: BAD_SIGNATURE_MSG };
    }
    return { success: false, message: `Installation misslyckades: ${raw}` };
  }
}
