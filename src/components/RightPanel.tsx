// ============================================================
// RightPanel.tsx — Höger statuspanel
// ============================================================

import type { OllamaStatus, OllamaModel } from "../features/ollama/ollamaService";
import { formatModelSize } from "../features/ollama/ollamaService";
import { COMPANION_PROFILES } from "../features/settings/settingsTypes";
import { DEFAULT_PROJECTS } from "../features/projects/projectTypes";
import { findModelFamily } from "../data/modelGuideData";

// INSTÄLLNING - Hur många profiler som visas i snabbpanelen (max 4)
const QUICK_PROFILES = COMPANION_PROFILES.slice(0, 4);

// ---- Statusindikator ----

interface StatusIndicatorProps {
  online: boolean | null; // null = okänd/ej kontrollerad
}

function StatusIndicator({ online }: StatusIndicatorProps) {
  const color =
    online === true
      ? "var(--status-online)"
      : online === false
      ? "var(--status-offline)"
      : "var(--status-unknown)";
  return (
    <span
      style={{
        background: color,
        flexShrink: 0,
        width: 7,
        height: 7,
        borderRadius: "50%",
        display: "inline-block",
      }}
    />
  );
}

// ---- Modellväljare ----

interface ModelSelectorProps {
  ollamaConnected: boolean;
  availableModels: OllamaModel[];
  activeModel: string | null;
  onSelectModel: (model: string | null) => void;
}

function ModelSelector({
  ollamaConnected,
  availableModels,
  activeModel,
  onSelectModel,
}: ModelSelectorProps) {
  // Inte ansluten — visa hint
  if (!ollamaConnected) {
    return (
      <p className="model-no-models-hint">
        Kontrollera Ollama-anslutningen ovan för att se tillgängliga modeller.
      </p>
    );
  }

  // Ansluten men inga modeller
  if (availableModels.length === 0) {
    return (
      <div className="model-no-models-hint">
        Ollama är anslutet men inga modeller är installerade.
        <br />
        Öppna en terminal och kör t.ex.:
        <code className="help-inline-code">ollama pull llama3.2</code>
        Klicka sedan på "Kontrollera Ollama" igen.
      </div>
    );
  }

  // Hitta info om den valda modellen
  const selectedModelData = availableModels.find((m) => m.name === activeModel);
  const family = activeModel ? findModelFamily(activeModel) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Dropdown */}
      <div className="model-select-wrapper">
        <select
          className="model-select"
          value={activeModel ?? ""}
          onChange={(e) => onSelectModel(e.target.value || null)}
          title="Välj Ollama-modell"
        >
          <option value="">— Välj modell —</option>
          {availableModels.map((model) => (
            <option key={model.name} value={model.name}>
              {model.name}
            </option>
          ))}
        </select>
        <span className="model-select-chevron">▾</span>
      </div>

      {/* Info om vald modell */}
      {selectedModelData && (
        <div className="model-select-info">
          <span>
            {formatModelSize(selectedModelData.size)}
            {selectedModelData.details?.parameter_size
              ? ` · ${selectedModelData.details.parameter_size}`
              : ""}
            {selectedModelData.details?.quantization_level
              ? ` · ${selectedModelData.details.quantization_level}`
              : ""}
          </span>
          {family && (
            <span style={{ color: "var(--accent-text)" }}>
              {family.emoji} {family.displayName} · {family.performance}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Props ----

interface RightPanelProps {
  ollamaStatus: OllamaStatus;
  availableModels: OllamaModel[];
  activeModel: string | null;
  activeProfile: string | null;
  activeProject: string | null;
  onCheckOllama: () => void;
  onSelectModel: (model: string | null) => void;
  onSelectProfile: (profileId: string) => void;
  onSelectProject: (projectId: string) => void;
  isCheckingOllama: boolean;
}

export default function RightPanel({
  ollamaStatus,
  availableModels,
  activeModel,
  activeProfile,
  activeProject,
  onCheckOllama,
  onSelectModel,
  onSelectProfile,
  onSelectProject,
  isCheckingOllama,
}: RightPanelProps) {
  const currentProfile = COMPANION_PROFILES.find((p) => p.id === activeProfile);
  const currentProject = DEFAULT_PROJECTS.find((p) => p.id === activeProject);

  return (
    <aside className="right-panel">
      {/* Header */}
      <div className="right-panel-header">
        <div className="right-panel-title">Kompanjon</div>
        <div className="echo-brand">
          <div className="echo-brand-icon">⬡</div>
          <span className="echo-brand-name">EchoCompanion</span>
          <span className="echo-brand-version">v0.1.0</span>
        </div>
      </div>

      {/* Systemstatus */}
      <div className="right-panel-section">
        <div className="right-section-label">Systemstatus</div>

        <div className="status-card">
          <StatusIndicator online={ollamaStatus.connected} />
          <span className="status-card-label">Ollama</span>
          <span
            className={`status-card-value ${
              ollamaStatus.connected ? "online" : "offline"
            }`}
          >
            {ollamaStatus.connected ? "Ansluten" : "Ej ansluten"}
          </span>
        </div>

        <div className="status-card">
          <StatusIndicator online={activeModel ? true : null} />
          <span className="status-card-label">Modell</span>
          <span className="status-card-value">
            {activeModel ?? (
              <span className="text-muted">Ingen vald</span>
            )}
          </span>
        </div>

        <div className="status-card">
          <StatusIndicator online={activeProfile ? true : null} />
          <span className="status-card-label">Profil</span>
          <span className="status-card-value">
            {currentProfile ? (
              `${currentProfile.emoji} ${currentProfile.name}`
            ) : (
              <span className="text-muted">Ingen vald</span>
            )}
          </span>
        </div>

        <div className="status-card">
          <StatusIndicator online={activeProject ? true : null} />
          <span className="status-card-label">Projekt</span>
          <span className="status-card-value">
            {currentProject?.name ?? (
              <span className="text-muted">Inget valt</span>
            )}
          </span>
        </div>
      </div>

      {/* Ollama-kontroll */}
      <div className="right-panel-section">
        <div className="right-section-label">Anslutning</div>
        <button
          className="btn btn-secondary btn-full"
          onClick={onCheckOllama}
          disabled={isCheckingOllama}
          style={{ justifyContent: "flex-start" }}
        >
          {isCheckingOllama ? "⏳ Kontrollerar…" : "🔌 Kontrollera Ollama"}
        </button>

        {/* Status-meddelande efter kontroll */}
        {ollamaStatus.message && (
          <p
            style={{
              marginTop: 6,
              fontSize: 11,
              lineHeight: 1.5,
              color: ollamaStatus.connected
                ? "var(--status-online)"
                : "var(--text-muted)",
            }}
          >
            {ollamaStatus.message}
          </p>
        )}

        {/* Felmeddelande */}
        {ollamaStatus.error && !ollamaStatus.connected && (
          <div className="ollama-error-box">
            {ollamaStatus.error}
          </div>
        )}
      </div>

      {/* Modellväljare */}
      <div className="right-panel-section">
        <div className="right-section-label">Modell</div>
        <ModelSelector
          ollamaConnected={ollamaStatus.connected}
          availableModels={availableModels}
          activeModel={activeModel}
          onSelectModel={onSelectModel}
        />
      </div>

      {/* Kompanjonprofiler */}
      <div className="right-panel-section">
        <div className="right-section-label">Kompanjonprofiler</div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 6px" }}>
          Profilen styr hur EchoCompanion svarar.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {QUICK_PROFILES.map((profile) => (
            <button
              key={profile.id}
              className="status-card"
              style={{
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                border:
                  activeProfile === profile.id
                    ? "1px solid var(--border-accent)"
                    : "1px solid var(--border-subtle)",
                background:
                  activeProfile === profile.id
                    ? "var(--accent-dim)"
                    : "var(--bg-card)",
              }}
              onClick={() =>
                onSelectProfile(activeProfile === profile.id ? "" : profile.id)
              }
              title={profile.description}
            >
              <span style={{ fontSize: 14 }}>{profile.emoji}</span>
              <span
                className="status-card-label"
                style={{
                  flex: 1,
                  color:
                    activeProfile === profile.id
                      ? "var(--accent-text)"
                      : "var(--text-secondary)",
                }}
              >
                {profile.name}
              </span>
              {activeProfile === profile.id && (
                <span
                  style={{
                    fontSize: 9,
                    color: "var(--accent-text)",
                    border: "1px solid var(--border-accent)",
                    borderRadius: 10,
                    padding: "1px 5px",
                  }}
                >
                  Aktiv
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Projekt */}
      <div className="right-panel-section">
        <div className="right-section-label">Projekt</div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 6px" }}>
          Projektet lägger till regler och sammanhang i chatten.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {DEFAULT_PROJECTS.slice(0, 5).map((project) => (
            <button
              key={project.id}
              className="status-card"
              style={{
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                border:
                  activeProject === project.id
                    ? "1px solid var(--border-accent)"
                    : "1px solid var(--border-subtle)",
                background:
                  activeProject === project.id
                    ? "var(--accent-dim)"
                    : "var(--bg-card)",
              }}
              onClick={() =>
                onSelectProject(
                  activeProject === project.id ? "" : project.id
                )
              }
            >
              <span style={{ fontSize: 14 }}>{project.icon}</span>
              <span
                className="status-card-label"
                style={{
                  flex: 1,
                  color:
                    activeProject === project.id
                      ? "var(--accent-text)"
                      : "var(--text-secondary)",
                }}
              >
                {project.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
