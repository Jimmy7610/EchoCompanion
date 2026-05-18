// ============================================================
// StatusBar.tsx — Nedre statusrad
// ============================================================

import type { OllamaStatus } from "../features/ollama/ollamaService";

interface StatusBarProps {
  ollamaStatus: OllamaStatus;
  activeModel: string | null;
  activeProfileName: string | null;
  activeProjectName: string | null;
}

export default function StatusBar({
  ollamaStatus,
  activeModel,
  activeProfileName,
  activeProjectName,
}: StatusBarProps) {
  return (
    <footer className="status-bar">
      {/* Version */}
      <div className="status-bar-item">
        <span className="sb-label">EchoCompanion</span>
        <span className="sb-value">v0.1.0</span>
      </div>

      {/* Build */}
      <div className="status-bar-item">
        <span className="sb-label">Build</span>
        <span className="sb-value">10</span>
      </div>

      {/* Budget */}
      <div className="status-bar-item">
        <span className="sb-label">Budget</span>
        <span className="sb-value" style={{ color: "var(--status-online)" }}>
          0 kr · Local first
        </span>
      </div>

      {/* Ollama */}
      <div className="status-bar-item">
        <span
          className="status-bar-dot"
          style={{
            background: ollamaStatus.connected
              ? "var(--status-online)"
              : "var(--status-offline)",
          }}
        />
        <span className="sb-label">Ollama:</span>
        <span
          className="sb-value"
          style={{
            color: ollamaStatus.connected
              ? "var(--status-online)"
              : "var(--status-offline)",
          }}
        >
          {ollamaStatus.connected ? "Ansluten" : "Ej ansluten"}
        </span>
      </div>

      {/* Aktiv modell (om vald) */}
      {activeModel && (
        <div className="status-bar-item">
          <span className="sb-label">Modell:</span>
          <span className="sb-value" style={{ color: "var(--accent-text)" }}>
            {activeModel}
          </span>
        </div>
      )}

      {/* Aktiv profil (om vald) */}
      {activeProfileName && (
        <div className="status-bar-item">
          <span className="sb-label">Profil:</span>
          <span className="sb-value" style={{ color: "var(--accent-text)" }}>
            {activeProfileName}
          </span>
        </div>
      )}

      {/* Aktivt projekt (om valt) */}
      {activeProjectName && (
        <div className="status-bar-item">
          <span className="sb-label">Projekt:</span>
          <span className="sb-value" style={{ color: "var(--accent-text)" }}>
            {activeProjectName}
          </span>
        </div>
      )}

      {/* Höger: Tauri-information */}
      <div className="status-bar-item" style={{ marginLeft: "auto", borderRight: "none" }}>
        <span className="sb-label" style={{ opacity: 0.5 }}>
          Tauri · React · Local AI
        </span>
      </div>
    </footer>
  );
}
