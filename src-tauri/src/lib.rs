// ============================================================
// lib.rs — Tauri-appens ingångspunkt (Rust-sidan)
// Kommandohantering och native-integrationer läggs till här.
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Build 23: updater-plugin registrerat — kräver pubkey + latest.json för att aktiveras
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|_app| {
            // Framtida setup: fönster-konfiguration, systemtray, etc.
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Fel vid start av EchoCompanion");
}
