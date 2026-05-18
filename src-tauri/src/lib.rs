// ============================================================
// lib.rs — Tauri-appens ingångspunkt (Rust-sidan)
// Kommandohantering och native-integrationer läggs till här.
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            // Framtida setup: fönster-konfiguration, systemtray, etc.
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Fel vid start av EchoCompanion");
}
