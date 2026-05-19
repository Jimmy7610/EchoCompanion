// ============================================================
// ChatArea.tsx — Huvud-chattarea och sektionsvisning
// ============================================================

import React, { useRef, useEffect, useState } from "react";
import type { NavSection } from "./Sidebar";
import type { ChatMessage } from "../features/chat/chatTypes";
import MessageBubble from "./MessageBubble";
import type { TtsSettings } from "../features/tts/ttsTypes";
import type { TtsVoiceInfo } from "../features/tts/ttsTypes";
import { isSpeechSynthesisSupported, speakText, stopSpeaking } from "../features/tts/ttsService";
import { TTS_TEST_PHRASES } from "../features/tts/ttsTestPhrases";
import { MODEL_FAMILIES, findModelFamily } from "../data/modelGuideData";
import type { OllamaStatus, OllamaModel } from "../features/ollama/ollamaService";
import { formatModelSize } from "../features/ollama/ollamaService";
import { COMPANION_PROFILES } from "../features/settings/settingsTypes";
import { buildSystemPrompt, buildProjectContextString } from "../features/settings/systemPrompts";
import { DEFAULT_PROJECTS } from "../features/projects/projectTypes";
import {
  getProjectMemoryById,
  addProjectNote,
  deleteProjectNote,
  resetProjectMemory,
  getProjectMemories,
} from "../features/projects/projectStorage";
import {
  getAllPromptTemplates,
  createCustomPromptTemplate,
  updateCustomPromptTemplate,
  deleteCustomPromptTemplate,
  getCustomPromptTemplates,
} from "../features/prompts/promptStorage";
import {
  CATEGORY_LABELS,
  type PromptCategory,
  type PromptTemplate,
} from "../features/prompts/promptTypes";
import {
  downloadBackupFile,
  exportSavedChatsOnly,
  exportCustomPromptsOnly,
  exportProjectMemoryOnly,
  readAndValidateFile,
  importBackup,
} from "../features/backup/backupService";
import { getSavedChats } from "../features/chat/chatStorage";
import { type AppSettings, DEFAULT_APP_SETTINGS } from "../features/settings/appSettings";
import { APP_NAME, APP_VERSION, APP_BUILD, APP_REPOSITORY } from "../data/appInfo";
import {
  getLocalStorageDiagnostics,
  formatBytes,
  type StorageDiagnostics,
} from "../features/storage/storageDiagnostics";

// ---- Ikoner ----
const SendIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ============================================================
// Chat-sektionen
// ============================================================

interface ChatSectionProps {
  messages: ChatMessage[];
  isLoading: boolean;
  ollamaStatus: OllamaStatus;
  activeModel: string | null;
  draftMessage: string;
  onDraftConsumed: () => void;
  onSendMessage: (text: string) => void;
  onStopGeneration: () => void;
  ttsSettings?: TtsSettings;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
}

function ChatSection({
  messages,
  isLoading,
  ollamaStatus,
  activeModel,
  draftMessage,
  onDraftConsumed,
  onSendMessage,
  onStopGeneration,
  ttsSettings,
  onSpeak,
  onStopSpeaking,
}: ChatSectionProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scrolla till botten vid nya meddelanden
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Konsumera utkast från promptbiblioteket
  useEffect(() => {
    if (!draftMessage) return;
    setInputValue(draftMessage);
    onDraftConsumed();
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        textareaRef.current.focus();
      }
    }, 0);
  }, [draftMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target;
    setInputValue(el.value);
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  const hasMessages = messages.length > 0;
  // INSTÄLLNING - Ta bort "activeModel"-kravet här om du vill tillåta sändning utan vald modell
  const canSend = inputValue.trim().length > 0 && !isLoading && !!activeModel;

  let placeholder = "Anslut till Ollama i höger panel för att börja chatta…";
  if (ollamaStatus.connected && !activeModel) {
    placeholder = "Välj en modell i höger panel för att börja chatta…";
  } else if (ollamaStatus.connected && activeModel) {
    placeholder = "Skriv ett meddelande… (Enter för att skicka)";
  }

  return (
    <div className="chat-container">
      {/* Meddelandeyta */}
      <div className="chat-messages">
        {!hasMessages ? (
          <div className="chat-welcome">
            <div className="welcome-glow-ring">
              <span className="welcome-icon-inner">⬡</span>
            </div>
            <h1 className="welcome-title">EchoCompanion</h1>
            <p className="welcome-tagline">
              Din lokala AI-kompis för idéer, kod och projekt.
            </p>

            <div className="welcome-status-pills">
              <span
                className={`status-pill ${
                  ollamaStatus.connected ? "online" : "offline"
                }`}
              >
                <span
                  className={`status-dot ${
                    ollamaStatus.connected ? "online" : "offline"
                  }`}
                />
                Ollama: {ollamaStatus.connected ? "Ansluten" : "Ej ansluten"}
              </span>
              <span
                className={`status-pill ${activeModel ? "online" : "neutral"}`}
              >
                <span
                  className={`status-dot ${activeModel ? "online" : "unknown"}`}
                />
                Modell: {activeModel ?? "Ingen vald"}
              </span>
              <span className="status-pill neutral">
                <span className="status-dot unknown" />
                100% Lokalt
              </span>
            </div>

            <p className="welcome-hint">
              {!ollamaStatus.connected
                ? 'Klicka på "Kontrollera Ollama" i höger panel för att ansluta.'
                : !activeModel
                ? "Välj en modell i höger panel och börja chatta."
                : `Redo! Chatta med ${activeModel}.`}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                ttsEnabled={ttsSettings?.enabled}
                onSpeak={onSpeak}
                onStopSpeaking={onStopSpeaking}
              />
            ))}
            {/* Visa bara "tänker"-indikatorn i icke-streamat läge (streaming har egen bubbla) */}
            {isLoading && !messages.some((m) => m.isStreaming) && (
              <div className="message-row ai">
                <div className="message-avatar ai">⬡</div>
                <div className="message-content">
                  <div className="message-bubble ai">
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        marginRight: 8,
                      }}
                    >
                      EchoCompanion tänker…
                    </span>
                    <div className="typing-indicator" style={{ display: "inline-flex" }}>
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Inmatningsyta */}
      <div className="chat-input-area">
        <div className="chat-input-wrapper">
          <textarea
            ref={textareaRef}
            className="chat-input-field"
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              className="chat-send-btn chat-stop-btn"
              onClick={onStopGeneration}
              title="Stoppa generering"
            >
              ⏹
            </button>
          ) : (
            <button
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!canSend}
              title={
                !activeModel
                  ? "Välj en modell i höger panel"
                  : "Skicka meddelande (Enter)"
              }
            >
              <SendIcon />
            </button>
          )}
        </div>
        <div className="chat-input-meta">
          <span className="chat-input-hint">
            {isLoading
              ? messages.some((m) => m.isStreaming)
                ? "EchoCompanion svarar… · Tryck Stoppa för att avbryta"
                : "EchoCompanion tänker…"
              : "Enter för att skicka · Shift+Enter för ny rad"}
          </span>
          {activeModel && (
            <span
              className="chat-input-hint text-mono"
              style={{ color: "var(--accent-text)" }}
            >
              {activeModel}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Platshållare för framtida sektioner
// ============================================================

interface PlaceholderSectionProps {
  icon: string;
  title: string;
  description: string;
  plannedVersion: string;
}

function PlaceholderSection({
  icon,
  title,
  description,
  plannedVersion,
}: PlaceholderSectionProps) {
  return (
    <div className="placeholder-view">
      <div className="placeholder-view-icon">{icon}</div>
      <div className="placeholder-view-title">{title}</div>
      <p className="placeholder-view-text">{description}</p>
      <span className="placeholder-view-badge">Planeras i {plannedVersion}</span>
    </div>
  );
}

// ============================================================
// Modellguide-sektionen
// ============================================================

interface ModellguideSectionProps {
  ollamaStatus: OllamaStatus;
  availableModels: OllamaModel[];
  onCheckOllama: () => void;
}

function ModellguideSection({
  ollamaStatus,
  availableModels,
  onCheckOllama,
}: ModellguideSectionProps) {
  return (
    <div className="section-view">
      <div className="main-header">
        <div className="main-header-title">
          📖 Modellguide
          <span className="main-header-sub">Ollama-modeller förklarade</span>
        </div>
      </div>

      <div className="section-body" style={{ padding: 0, overflow: "auto" }}>

        <div style={{ padding: "16px 20px 8px" }}>
          <div className="guide-section-heading">
            <span>⬇ Installerade modeller</span>
            <span className="guide-section-count">
              {ollamaStatus.connected
                ? `${availableModels.length} st`
                : "Ej kontrollerat"}
            </span>
          </div>
        </div>

        {!ollamaStatus.connected ? (
          <div style={{ padding: "0 20px 16px" }}>
            <div className="guide-empty-state">
              <span style={{ fontSize: 22 }}>🔌</span>
              <p>
                Klicka på "Kontrollera Ollama" i höger panel för att se dina
                installerade modeller.
              </p>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onCheckOllama}
              >
                🔄 Kontrollera Ollama
              </button>
            </div>
          </div>
        ) : availableModels.length === 0 ? (
          <div style={{ padding: "0 20px 16px" }}>
            <div className="guide-empty-state">
              <span style={{ fontSize: 22 }}>📭</span>
              <p>
                Inga modeller installerade ännu. Installera en med t.ex.:
              </p>
              <code className="help-block-code">ollama pull llama3.2</code>
              <button
                className="btn btn-secondary btn-sm"
                onClick={onCheckOllama}
                style={{ marginTop: 6 }}
              >
                🔄 Uppdatera lista
              </button>
            </div>
          </div>
        ) : (
          <div className="model-guide-grid" style={{ paddingTop: 4 }}>
            {availableModels.map((model) => {
              const family = findModelFamily(model.name);
              return (
                <div key={model.name} className="model-card installed-model-card">
                  <div className="model-card-header">
                    <span className="model-card-name">
                      {family ? `${family.emoji} ` : "❓ "}
                      {model.name}
                    </span>
                    <span
                      className={`model-perf-badge ${
                        family ? family.performance.toLowerCase() : "okand"
                      }`}
                    >
                      {family ? family.performance : "Okänd"}
                    </span>
                  </div>

                  <div className="model-card-meta">
                    {formatModelSize(model.size)}
                    {model.details?.parameter_size
                      ? ` · ${model.details.parameter_size}`
                      : ""}
                    {model.details?.quantization_level
                      ? ` · ${model.details.quantization_level}`
                      : ""}
                  </div>

                  {family ? (
                    <>
                      <p className="model-card-desc">{family.description}</p>
                      <p className="model-card-best">
                        <strong>Passar för:</strong> {family.bestFor}
                      </p>
                      <p className="model-card-tip">{family.tip}</p>
                    </>
                  ) : (
                    <p className="model-card-desc" style={{ color: "var(--text-muted)" }}>
                      Okänd modell — EchoCompanion känner inte igen denna
                      modellfamilj ännu, men den kan ändå användas.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ padding: "8px 20px 8px" }}>
          <div className="guide-section-heading" style={{ marginTop: 8 }}>
            <span>📚 Kända modellfamiljer</span>
            <span className="guide-section-count">
              {MODEL_FAMILIES.length} familjer
            </span>
          </div>
        </div>

        <div className="model-guide-grid" style={{ paddingTop: 4 }}>
          {MODEL_FAMILIES.map((family) => (
            <div key={family.id} className="model-card">
              <div className="model-card-header">
                <span className="model-card-name">
                  {family.emoji} {family.displayName}
                </span>
                <span
                  className={`model-perf-badge ${family.performance.toLowerCase()}`}
                >
                  {family.performance}
                </span>
              </div>
              <p className="model-card-desc">{family.description}</p>
              <p className="model-card-best">
                <strong>Passar för:</strong> {family.bestFor}
              </p>
              <p className="model-card-tip">{family.tip}</p>
            </div>
          ))}
        </div>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ============================================================
// TTS-testkontroller (Bash 14) — inline i inställningssektionen
// ============================================================

interface TtsTestControlsProps {
  ttsSettings: TtsSettings;
  onResetTtsSettings: () => void;
}

function TtsTestControls({ ttsSettings, onResetTtsSettings }: TtsTestControlsProps) {
  const [selectedPhraseIndex, setSelectedPhraseIndex] = useState(0);

  return (
    <>
      {/* Testfras-väljare */}
      <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6, marginTop: 14 }}>
        <span className="settings-row-label">Testfras</span>
        <div className="prompt-form-select-wrapper" style={{ width: "100%" }}>
          <select
            className="prompt-form-select"
            value={selectedPhraseIndex}
            onChange={(e) => setSelectedPhraseIndex(parseInt(e.target.value, 10))}
          >
            {TTS_TEST_PHRASES.map((phrase, i) => (
              <option key={i} value={i}>
                {phrase.label}
              </option>
            ))}
          </select>
          <span className="model-select-chevron">▾</span>
        </div>
      </div>

      {/* Knappar */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => speakText(TTS_TEST_PHRASES[selectedPhraseIndex].text, ttsSettings)}
          title="Spela upp vald testfras"
        >
          🔊 Testa röst
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => stopSpeaking()}
          title="Stoppa pågående uppläsning"
        >
          ⏹ Stoppa uppläsning
        </button>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => {
            if (window.confirm("Återställ röstinställningar till standard?")) {
              onResetTtsSettings();
            }
          }}
          title="Återställ alla röstinställningar till standardvärden"
        >
          ↺ Återställ röstinställningar
        </button>
      </div>
    </>
  );
}

// ============================================================
// Inställningar-sektionen (Bash 9)
// ============================================================

interface InstallningarSectionProps {
  ollamaStatus: OllamaStatus;
  onCheckOllama: () => void;
  onImportComplete: () => void;
  appSettings: AppSettings;
  onUpdateAppSettings: (partial: Partial<AppSettings>) => void;
  onResetSettings: () => void;
  activeProfileId: string | null;
  activeProjectId: string | null;
  onApplyDefaults: (profileId: string | null, projectId: string | null) => void;
  ttsSettings: TtsSettings;
  availableTtsVoices: TtsVoiceInfo[];
  onUpdateTtsSettings: (partial: Partial<TtsSettings>) => void;
  onResetTtsSettings: () => void;
}

function InstallningarSection({
  ollamaStatus,
  onCheckOllama,
  onImportComplete,
  appSettings,
  onUpdateAppSettings,
  onResetSettings,
  activeProfileId,
  activeProjectId,
  onApplyDefaults,
  ttsSettings,
  availableTtsVoices,
  onUpdateTtsSettings,
  onResetTtsSettings,
}: InstallningarSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupStatus, setBackupStatus] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [settingsStatus, setSettingsStatus] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [storageDiagnostics, setStorageDiagnostics] = useState<StorageDiagnostics | null>(null);

  function loadDiagnostics() {
    setStorageDiagnostics(getLocalStorageDiagnostics());
  }

  // Ladda diagnostik en gång vid mount
  useEffect(() => {
    loadDiagnostics();
  }, []);

  function showBackupStatus(type: "success" | "error" | "info", text: string) {
    setBackupStatus({ type, text });
    setTimeout(() => setBackupStatus(null), 5000);
  }

  function showSettingsStatus(type: "success" | "error" | "info", text: string) {
    setSettingsStatus({ type, text });
    setTimeout(() => setSettingsStatus(null), 4000);
  }

  function handleExportAll() {
    try {
      const backup = { savedChats: getSavedChats(), prompts: getCustomPromptTemplates(), memories: getProjectMemories() };
      const hasData = backup.savedChats.length > 0 || backup.prompts.length > 0 || backup.memories.length > 0;
      if (!hasData) { showBackupStatus("info", "Inga data hittades att exportera."); return; }
      downloadBackupFile();
      showBackupStatus("success", "Backup exporterad.");
    } catch {
      showBackupStatus("error", "Kunde inte exportera backup.");
    }
  }

  function handleExportChats() {
    try {
      if (getSavedChats().length === 0) { showBackupStatus("info", "Inga data hittades att exportera."); return; }
      exportSavedChatsOnly();
      showBackupStatus("success", "Chattar exporterade.");
    } catch {
      showBackupStatus("error", "Kunde inte exportera chattar.");
    }
  }

  function handleExportPrompts() {
    try {
      if (getCustomPromptTemplates().length === 0) { showBackupStatus("info", "Inga egna promptmallar att exportera."); return; }
      exportCustomPromptsOnly();
      showBackupStatus("success", "Egna promptmallar exporterade.");
    } catch {
      showBackupStatus("error", "Kunde inte exportera promptmallar.");
    }
  }

  function handleExportMemory() {
    try {
      if (getProjectMemories().length === 0) { showBackupStatus("info", "Inga projektanteckningar att exportera."); return; }
      exportProjectMemoryOnly();
      showBackupStatus("success", "Projektanteckningar exporterade.");
    } catch {
      showBackupStatus("error", "Kunde inte exportera projektanteckningar.");
    }
  }

  async function handleImport() {
    if (!selectedFile || isImporting) return;
    setIsImporting(true);
    const { backup, error } = await readAndValidateFile(selectedFile);
    if (!backup) {
      showBackupStatus("error", error ?? "Importen misslyckades.");
      setIsImporting(false);
      return;
    }
    const result = importBackup(backup, importMode);
    if (result.success) {
      const parts = [];
      if ((result.importedChats ?? 0) > 0) parts.push(`${result.importedChats} samtal`);
      if ((result.importedPrompts ?? 0) > 0) parts.push(`${result.importedPrompts} prompts`);
      if ((result.importedProjectMemories ?? 0) > 0) parts.push(`${result.importedProjectMemories} projektminnen`);
      const detail = parts.length > 0 ? ` (${parts.join(", ")})` : "";
      showBackupStatus("success", `Import klar${detail}.`);
      onImportComplete();
    } else {
      showBackupStatus("error", result.errors?.join(" ") ?? result.message);
    }
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsImporting(false);
  }

  // Bygg systempromptförhandsvisning
  function buildPreviewPrompt(): string {
    const proj = DEFAULT_PROJECTS.find((p) => p.id === activeProjectId);
    let projectContext: string | undefined;
    if (proj) {
      const memory = getProjectMemoryById(activeProjectId!);
      projectContext = buildProjectContextString(proj, memory.userNotes);
    }
    return buildSystemPrompt(activeProfileId, projectContext);
  }

  const previewProfileName = activeProfileId
    ? (COMPANION_PROFILES.find((p) => p.id === activeProfileId)?.name ?? "aktiv profil")
    : "standardprofil";
  const previewProjectName = activeProjectId
    ? (DEFAULT_PROJECTS.find((p) => p.id === activeProjectId)?.name ?? "aktivt projekt")
    : null;

  return (
    <div className="section-view">
      <div className="main-header">
        <div className="main-header-title">⚙ Inställningar</div>
      </div>
      <div className="section-body">
        <div className="settings-view">

          {/* Ollama-anslutning */}
          <div className="settings-section">
            <div className="settings-section-title">🔌 Ollama-anslutning</div>
            <div className="settings-row">
              <span className="settings-row-label">Bas-URL</span>
              {/* INSTÄLLNING - Ändra URL i ollamaService.ts om Ollama körs på annan adress */}
              <span className="settings-row-value">http://localhost:11434</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Status</span>
              <span
                className={`settings-row-value ${
                  ollamaStatus.connected ? "text-success" : "text-error"
                }`}
              >
                {ollamaStatus.connected ? "Ansluten" : "Ej ansluten"}
              </span>
            </div>
            {ollamaStatus.message && (
              <div className="settings-row">
                <span className="settings-row-label">Meddelande</span>
                <span className="settings-row-value" style={{ fontSize: 11 }}>
                  {ollamaStatus.message}
                </span>
              </div>
            )}
            {ollamaStatus.error && (
              <div className="settings-row">
                <span className="settings-row-label">Fel</span>
                <span
                  className="settings-row-value text-error"
                  style={{ fontSize: 11 }}
                >
                  {ollamaStatus.error}
                </span>
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-secondary btn-full"
                onClick={onCheckOllama}
              >
                🔄 Kontrollera Ollama
              </button>
            </div>
          </div>

          {/* Modellbeteende (Bash 9) */}
          <div className="settings-section">
            <div className="settings-section-title">⚙ Modellbeteende</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Styr hur modellen genererar svar. Inställningarna gäller nästa meddelande.
            </p>

            {/* Temperatur */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <span>Temperatur</span>
                <span className="settings-control-value">{appSettings.temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                className="settings-slider"
                min="0"
                max="1.5"
                step="0.1"
                value={appSettings.temperature}
                onChange={(e) => onUpdateAppSettings({ temperature: parseFloat(e.target.value) })}
              />
              <div className="settings-slider-hints">
                <span>0.0 Deterministisk</span>
                <span>1.5 Kaotisk</span>
              </div>
              <p className="settings-control-hint">
                Kreativitet och slumpmässighet. Lägre = mer förutsägbart och faktabaserat, högre = mer varierat och kreativt.
              </p>
            </div>

            {/* Top-P */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <span>Top-P</span>
                <span className="settings-control-value">{appSettings.topP.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className="settings-slider"
                min="0.1"
                max="1"
                step="0.05"
                value={appSettings.topP}
                onChange={(e) => onUpdateAppSettings({ topP: parseFloat(e.target.value) })}
              />
              <div className="settings-slider-hints">
                <span>0.1 Fokuserat</span>
                <span>1.0 Brett urval</span>
              </div>
              <p className="settings-control-hint">
                Ordurval och variation. Lägre = modellen väljer bland färre ord, 1.0 = inga filtreringar.
              </p>
            </div>

            {/* Max svarslängd (num_predict) */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <span>Max svarslängd</span>
              </div>
              <input
                type="number"
                className="settings-number-input"
                min="128"
                max="8192"
                step="128"
                value={appSettings.numPredict}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 128) onUpdateAppSettings({ numPredict: val });
                }}
              />
              <p className="settings-control-hint">
                Hur långt svaret maximalt får bli (tokens ≈ ord). Styr <strong>svarslängden</strong> — påverkar inte hur mycket historik modellen ser.
              </p>
            </div>

            {/* Kontextstorlek (num_ctx) */}
            <div className="settings-control-row">
              <div className="settings-control-label">
                <span>Kontextstorlek</span>
              </div>
              <input
                type="number"
                className="settings-number-input"
                min="512"
                max="32768"
                step="512"
                value={appSettings.numCtx}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 512) onUpdateAppSettings({ numCtx: val });
                }}
              />
              <p className="settings-control-hint">
                Hur mycket tidigare konversation modellen kan ta hänsyn till (tokens). Större värde = längre minne men långsammare och mer RAM-krävande.
              </p>
            </div>

            {/* Streaming */}
            <div className="settings-row" style={{ alignItems: "center", marginTop: 10 }}>
              <div style={{ flex: 1 }}>
                <span className="settings-row-label" style={{ display: "block", marginBottom: 2 }}>
                  Streaming-svar
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Token-för-token — snabbare och mer levande känsla
                </span>
              </div>
              <label className="streaming-toggle-label">
                <input
                  type="checkbox"
                  className="streaming-toggle-input"
                  checked={appSettings.useStreaming}
                  onChange={(e) => onUpdateAppSettings({ useStreaming: e.target.checked })}
                />
                <span className="streaming-toggle-track">
                  <span className="streaming-toggle-thumb" />
                </span>
                <span
                  className="streaming-toggle-text"
                  style={{ color: appSettings.useStreaming ? "var(--accent-text)" : "var(--text-muted)" }}
                >
                  {appSettings.useStreaming ? "På" : "Av"}
                </span>
              </label>
            </div>

            {/* Välj första modell automatiskt */}
            <div className="settings-row" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <span className="settings-row-label" style={{ display: "block", marginBottom: 2 }}>
                  Välj första modell automatiskt
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Förhandsväljer första tillgängliga modell vid anslutning
                </span>
              </div>
              <label className="streaming-toggle-label">
                <input
                  type="checkbox"
                  className="streaming-toggle-input"
                  checked={appSettings.autoSelectFirstModel}
                  onChange={(e) => onUpdateAppSettings({ autoSelectFirstModel: e.target.checked })}
                />
                <span className="streaming-toggle-track">
                  <span className="streaming-toggle-thumb" />
                </span>
                <span
                  className="streaming-toggle-text"
                  style={{ color: appSettings.autoSelectFirstModel ? "var(--accent-text)" : "var(--text-muted)" }}
                >
                  {appSettings.autoSelectFirstModel ? "På" : "Av"}
                </span>
              </label>
            </div>

            {/* Debug-logg */}
            <div className="settings-row" style={{ alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <span className="settings-row-label" style={{ display: "block", marginBottom: 2 }}>
                  Debug-logg i konsolen
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                  Loggar API-anrop och token-statistik (alltid på i dev-läge)
                </span>
              </div>
              <label className="streaming-toggle-label">
                <input
                  type="checkbox"
                  className="streaming-toggle-input"
                  checked={appSettings.showDebugInfo}
                  onChange={(e) => onUpdateAppSettings({ showDebugInfo: e.target.checked })}
                />
                <span className="streaming-toggle-track">
                  <span className="streaming-toggle-thumb" />
                </span>
                <span
                  className="streaming-toggle-text"
                  style={{ color: appSettings.showDebugInfo ? "var(--accent-text)" : "var(--text-muted)" }}
                >
                  {appSettings.showDebugInfo ? "På" : "Av"}
                </span>
              </label>
            </div>

            {/* Återställ */}
            <div style={{ marginTop: 14 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (window.confirm("Återställ alla modellbeteende-inställningar till standardvärden?")) {
                    onResetSettings();
                    showSettingsStatus("success", "Inställningar återställda till standard.");
                  }
                }}
              >
                ↺ Återställ standardvärden
              </button>
            </div>

            {settingsStatus && (
              <div className={`backup-status backup-status-${settingsStatus.type}`}>
                {settingsStatus.text}
              </div>
            )}
          </div>

          {/* Röst / uppläsning (Bash 13–14) */}
          <div className="settings-section">
            <div className="settings-section-title">🔊 Röst / uppläsning</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 14 }}>
              EchoCompanion kan använda datorns inbyggda röster via Web Speech API. Detta kostar 0 kr och fungerar lokalt i webbläsaren/Windows-miljön där röster finns installerade.
            </p>

            {!isSpeechSynthesisSupported() ? (
              <div className="tts-warning-box">
                ⚠ Uppläsning stöds inte i denna miljö.
              </div>
            ) : (
              <>
                {/* Aktivera uppläsning */}
                <div className="settings-row" style={{ alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <span className="settings-row-label" style={{ display: "block", marginBottom: 2 }}>
                      Aktivera uppläsning
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      Visar "Läs upp"-knappar på AI-svar
                    </span>
                  </div>
                  <label className="streaming-toggle-label">
                    <input
                      type="checkbox"
                      className="streaming-toggle-input"
                      checked={ttsSettings.enabled}
                      onChange={(e) => onUpdateTtsSettings({ enabled: e.target.checked })}
                    />
                    <span className="streaming-toggle-track">
                      <span className="streaming-toggle-thumb" />
                    </span>
                    <span
                      className="streaming-toggle-text"
                      style={{ color: ttsSettings.enabled ? "var(--accent-text)" : "var(--text-muted)" }}
                    >
                      {ttsSettings.enabled ? "På" : "Av"}
                    </span>
                  </label>
                </div>

                {/* Läs upp AI-svar automatiskt */}
                <div className="settings-row" style={{ alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <span className="settings-row-label" style={{ display: "block", marginBottom: 2 }}>
                      Läs upp AI-svar automatiskt
                    </span>
                    <span style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      Läser upp varje fullständigt svar direkt
                    </span>
                  </div>
                  <label className="streaming-toggle-label">
                    <input
                      type="checkbox"
                      className="streaming-toggle-input"
                      checked={ttsSettings.autoReadAssistant}
                      onChange={(e) => onUpdateTtsSettings({ autoReadAssistant: e.target.checked })}
                    />
                    <span className="streaming-toggle-track">
                      <span className="streaming-toggle-thumb" />
                    </span>
                    <span
                      className="streaming-toggle-text"
                      style={{ color: ttsSettings.autoReadAssistant ? "var(--accent-text)" : "var(--text-muted)" }}
                    >
                      {ttsSettings.autoReadAssistant ? "På" : "Av"}
                    </span>
                  </label>
                </div>

                {/* Röstval */}
                <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6, marginTop: 10 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span className="settings-row-label">Röst</span>
                    {availableTtsVoices.length > 0 && (
                      <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
                        {availableTtsVoices.length} röster tillgängliga
                        {availableTtsVoices.some((v) => v.lang.startsWith("sv")) && (
                          <span style={{ color: "var(--status-online)", marginLeft: 5 }}>
                            · ✓ Svensk röst hittad
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {availableTtsVoices.length === 0 ? (
                    <div className="tts-info-box">
                      Inga röster hittades ännu. Testa att ladda om appen eller kontrollera Windows röstinställningar (Inställningar → Tid och språk → Tal).
                    </div>
                  ) : (
                    <>
                      <div className="prompt-form-select-wrapper" style={{ width: "100%" }}>
                        <select
                          className="prompt-form-select"
                          value={ttsSettings.selectedVoiceName ?? ""}
                          onChange={(e) => onUpdateTtsSettings({ selectedVoiceName: e.target.value || null })}
                        >
                          <option value="">— Automatisk (föredrar svenska) —</option>
                          {availableTtsVoices.map((v) => (
                            <option key={v.name} value={v.name}>
                              {v.name} ({v.lang}){v.lang.startsWith("sv") ? " ★" : ""}
                            </option>
                          ))}
                        </select>
                        <span className="model-select-chevron">▾</span>
                      </div>
                      {ttsSettings.selectedVoiceName && (
                        <span style={{ fontSize: 11, color: "var(--accent-text)" }}>
                          Vald: {ttsSettings.selectedVoiceName}
                        </span>
                      )}
                      <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                        Rösterna kommer från Windows/webbläsaren. Om du saknar svensk röst, kontrollera Windows röstinställningar (Inställningar → Tid och språk → Tal).
                      </p>
                    </>
                  )}
                </div>

                {/* Hastighet */}
                <div className="settings-control-row" style={{ marginTop: 12 }}>
                  <div className="settings-control-label">
                    <span>Hastighet</span>
                    <span className="settings-control-value">{ttsSettings.rate.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    className="settings-slider"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={ttsSettings.rate}
                    onChange={(e) => onUpdateTtsSettings({ rate: parseFloat(e.target.value) })}
                  />
                  <div className="settings-slider-hints">
                    <span>0.5 Långsam</span>
                    <span>1.5 Snabb</span>
                  </div>
                </div>

                {/* Tonhöjd */}
                <div className="settings-control-row">
                  <div className="settings-control-label">
                    <span>Tonhöjd</span>
                    <span className="settings-control-value">{ttsSettings.pitch.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    className="settings-slider"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={ttsSettings.pitch}
                    onChange={(e) => onUpdateTtsSettings({ pitch: parseFloat(e.target.value) })}
                  />
                  <div className="settings-slider-hints">
                    <span>0.5 Låg</span>
                    <span>1.5 Hög</span>
                  </div>
                </div>

                {/* Volym */}
                <div className="settings-control-row">
                  <div className="settings-control-label">
                    <span>Volym</span>
                    <span className="settings-control-value">{ttsSettings.volume.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    className="settings-slider"
                    min="0"
                    max="1"
                    step="0.1"
                    value={ttsSettings.volume}
                    onChange={(e) => onUpdateTtsSettings({ volume: parseFloat(e.target.value) })}
                  />
                  <div className="settings-slider-hints">
                    <span>0 Tyst</span>
                    <span>1.0 Full volym</span>
                  </div>
                </div>

                {/* Testfras-väljare + knappar (Bash 14) */}
                <TtsTestControls ttsSettings={ttsSettings} onResetTtsSettings={onResetTtsSettings} />
              </>
            )}
          </div>

          {/* Piper TTS – planerad lokal röst (Bash 14) */}
          <div className="settings-section">
            <details className="tts-piper-details">
              <summary className="tts-piper-summary">
                🔬 Piper TTS – planerad lokal röst
                <span className="tts-piper-badge">Ej installerad</span>
              </summary>
              <div className="tts-piper-body">
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 12 }}>
                  Piper är en framtida lokal TTS-motor som kan ge bättre offline-röster. Den är <strong>inte installerad eller kopplad</strong> i denna build.
                </p>
                <div style={{ fontSize: 11.5, color: "var(--text-secondary)", fontWeight: 600, marginBottom: 6 }}>
                  Checklista inför framtida Piper-integration:
                </div>
                <ul className="piper-checklist">
                  <li>⬜ Ladda ner Piper (gratis, open source)</li>
                  <li>⬜ Ladda ner svensk Piper-röst (t.ex. sv_SE-nst-medium)</li>
                  <li>⬜ Spara röstfiler lokalt i appens datakatalog</li>
                  <li>⬜ Koppla EchoCompanion till Piper via Tauri shell-API</li>
                  <li>⬜ Testa WAV-uppspelning i appen</li>
                  <li>⬜ Välja Web Speech eller Piper i inställningar</li>
                </ul>
                <p style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 10 }}>
                  Piper kräver Rust/Tauri för att anropa lokala binärer. Implementeras i ett senare build.
                </p>
              </div>
            </details>
          </div>

          {/* Standardval (Bash 9) */}
          <div className="settings-section">
            <div className="settings-section-title">🎯 Standardval</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 14 }}>
              Välj vilken profil och vilket projekt som aktiveras automatiskt vid start.
            </p>

            {/* Standardprofil */}
            <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
              <span className="settings-row-label">Standardprofil</span>
              <div className="prompt-form-select-wrapper" style={{ width: "100%" }}>
                <select
                  className="prompt-form-select"
                  value={appSettings.defaultProfileId ?? ""}
                  onChange={(e) => onUpdateAppSettings({ defaultProfileId: e.target.value || null })}
                >
                  <option value="">Ingen profil</option>
                  {COMPANION_PROFILES.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.emoji} {profile.name}
                    </option>
                  ))}
                </select>
                <span className="model-select-chevron">▾</span>
              </div>
            </div>

            {/* Standardprojekt */}
            <div className="settings-row" style={{ flexDirection: "column", alignItems: "flex-start", gap: 6, marginTop: 10 }}>
              <span className="settings-row-label">Standardprojekt</span>
              <div className="prompt-form-select-wrapper" style={{ width: "100%" }}>
                <select
                  className="prompt-form-select"
                  value={appSettings.defaultProjectId ?? ""}
                  onChange={(e) => onUpdateAppSettings({ defaultProjectId: e.target.value || null })}
                >
                  <option value="">Inget projekt</option>
                  {DEFAULT_PROJECTS.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.icon} {project.name}
                    </option>
                  ))}
                </select>
                <span className="model-select-chevron">▾</span>
              </div>
            </div>

            {/* Tillämpa nu */}
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onApplyDefaults(appSettings.defaultProfileId, appSettings.defaultProjectId);
                  showSettingsStatus("success", "Standardval tillämpade nu.");
                }}
              >
                ✓ Använd standardval nu
              </button>
            </div>
          </div>

          {/* Systemprompt-förhandsvisning (Bash 9) */}
          <div className="settings-section">
            <div className="settings-section-title">🔍 Systemprompt-förhandsvisning</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
              Exakt text som skickas till AI som bakgrundskontext vid varje meddelande.
            </p>
            <details className="system-prompt-preview">
              <summary className="system-prompt-preview-toggle">
                Visa systemprompt för {previewProfileName}
                {previewProjectName ? ` + ${previewProjectName}` : ""}
              </summary>
              <pre className="system-prompt-preview-content">{buildPreviewPrompt()}</pre>
            </details>
          </div>

          <div className="settings-section help-box">
            <div className="settings-section-title">
              💡 Så installerar du en Ollama-modell
            </div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 10 }}>
              Öppna Terminal eller PowerShell och skriv till exempel:
            </p>
            <code className="help-block-code">ollama pull llama3.2</code>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 8 }}>
              Andra bra modeller att börja med:
            </p>
            <code className="help-block-code">ollama pull qwen2.5:7b</code>
            <code className="help-block-code">ollama pull mistral</code>
            <code className="help-block-code">ollama pull phi4-mini</code>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 10 }}>
              Klicka sedan på "Kontrollera Ollama" ovan för att ladda om
              modellistan i appen.
            </p>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">🎭 Kompanjonprofiler</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 10 }}>
              EchoCompanion är inställd på att svara på svenska som standard, oavsett aktiv profil.
              Profiler lägger till extra expertis och ton ovanpå standardbeteendet.
            </p>
            {COMPANION_PROFILES.map((profile) => (
              <div key={profile.id} className="settings-row" style={{ alignItems: "flex-start", gap: 8, flexDirection: "column", padding: "8px 0" }}>
                <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 13 }}>
                  {profile.emoji} {profile.name}
                </span>
                <span style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {profile.description}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Passar för: {profile.suggestedUse}
                </span>
              </div>
            ))}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">ℹ App-information</div>
            <div className="settings-row">
              <span className="settings-row-label">Version</span>
              <span className="settings-row-value">{APP_VERSION}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Build</span>
              <span className="settings-row-value">{APP_BUILD}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Budgetläge</span>
              <span className="settings-row-value">0 kr / Local first</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Språk</span>
              <span className="settings-row-value">Svenska (sv)</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Inställningar sparade</span>
              <span className="settings-row-value" style={{ fontSize: 11 }}>
                echocompanion.appSettings.v1
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Standardvärden</span>
              <span className="settings-row-value" style={{ fontSize: 11 }}>
                temp {DEFAULT_APP_SETTINGS.temperature} · topP {DEFAULT_APP_SETTINGS.topP} · svar {DEFAULT_APP_SETTINGS.numPredict} · ctx {DEFAULT_APP_SETTINGS.numCtx}
              </span>
            </div>
          </div>

          {/* Desktop-läge (Bash 11) */}
          <div className="settings-section">
            <div className="settings-section-title">🖥 Desktop-läge</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 14 }}>
              EchoCompanion kör just nu bra i webbläsaren via Vite. För en riktig Windows-app används Tauri, vilket kräver Rust installerat lokalt.
            </p>

            <div className="settings-row">
              <span className="settings-row-label">App</span>
              <span className="settings-row-value">{APP_NAME}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Version</span>
              <span className="settings-row-value">{APP_VERSION}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Build</span>
              <span className="settings-row-value">{APP_BUILD}</span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Repo</span>
              <span className="settings-row-value" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {APP_REPOSITORY}
              </span>
            </div>

            <div style={{ marginTop: 16, marginBottom: 6 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)" }}>
                Kommandon
              </span>
            </div>
            <code className="help-block-code">npm run dev</code>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 10px" }}>
              Webbläsarläge — startar Vite dev-server på port 1420. Kräver inte Rust.
            </p>
            <code className="help-block-code">npm run typecheck</code>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 10px" }}>
              Kör TypeScript-typkontroll utan att bygga.
            </p>
            <code className="help-block-code">npm run build</code>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 10px" }}>
              Bygger frontend till dist/ (används av Tauri).
            </p>
            <code className="help-block-code">npm run tauri:dev</code>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 10px" }}>
              Desktop-läge med live-reload. Kräver Rust installerat.
            </p>
            <code className="help-block-code">npm run tauri:build</code>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "3px 0 14px" }}>
              Bygger installerbar Windows-app (.exe/.msi). Kräver Rust installerat.
            </p>

            <div className="backup-warning-box" style={{
              background: "rgba(124, 58, 237, 0.06)",
              borderColor: "var(--border-accent)",
              color: "var(--accent-text)",
            }}>
              ℹ Om kommandot tauri:dev inte fungerar behöver Rust installeras från rustup.rs — det är gratis och tar ~5 minuter.
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>
                Inför framtida installer
              </div>
              <ul style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 2.1, paddingLeft: 18, margin: 0 }}>
                <li>Rust installerat (rustup.rs)</li>
                <li>npm run tauri:dev fungerar</li>
                <li>Appikon vald och placerad i src-tauri/icons/</li>
                <li>Versionsnummer uppdaterat i appInfo.ts + tauri.conf.json</li>
                <li>Backup exporterad innan större ändringar</li>
                <li>GitHub-release skapas senare</li>
                <li>Auto-update byggs senare</li>
              </ul>
            </div>
          </div>

          <div className="settings-section help-box">
            <div className="settings-section-title">🧪 Testa samtalsminne</div>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Skriv först: <em>"mitt namn är Jimmy"</em>. Fråga sedan: <em>"vad heter jag?"</em>.
              EchoCompanion ska då kunna använda informationen från samma samtal.
            </p>
            <p style={{ fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.6, marginTop: 6 }}>
              Tips: Minnesfunktionen fungerar bara inom ett och samma samtal. Starta du ett nytt samtal börjar minnet om från noll.
            </p>
          </div>

          {/* Lokal lagring (Bash 12) */}
          <div className="settings-section">
            <div className="settings-section-title">💽 Lokal lagring</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.7, marginBottom: 14 }}>
              EchoCompanion sparar just nu data i webbläsarens localStorage. Det fungerar bra för utveckling. Inför riktig desktop-version kan datan senare flyttas till Tauris app data-katalog.
            </p>

            <div className="settings-row">
              <span className="settings-row-label">Backend</span>
              <span className="settings-row-value" style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
                {storageDiagnostics?.backend ?? "localStorage"}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Total storlek</span>
              <span className="settings-row-value">
                {storageDiagnostics ? formatBytes(storageDiagnostics.totalEstimatedBytes) : "—"}
              </span>
            </div>

            <div style={{ marginTop: 14, marginBottom: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)" }}>
                Kända lagringsposter
              </span>
            </div>

            {storageDiagnostics ? (
              <div className="storage-diagnostic-list">
                {storageDiagnostics.entries.map((entry) => (
                  <div key={entry.key} className="storage-diagnostic-entry">
                    <div className="storage-diag-header">
                      <span className="storage-diag-label">{entry.label}</span>
                      <span className={`storage-diag-badge ${entry.exists ? "exists" : "missing"}`}>
                        {entry.exists ? "Finns" : "Saknas"}
                      </span>
                    </div>
                    {entry.exists && (
                      <div className="storage-diag-meta">
                        <span>{formatBytes(entry.sizeBytes)}</span>
                        {entry.itemCount !== undefined && (
                          <span>· {entry.itemCount} poster</span>
                        )}
                        <span className="storage-diag-key">{entry.key}</span>
                      </div>
                    )}
                    {entry.warning && (
                      <div className="storage-diag-warning">⚠ {entry.warning}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Laddar…</p>
            )}

            <div style={{ marginTop: 12 }}>
              <button className="btn btn-secondary btn-sm" onClick={loadDiagnostics}>
                🔄 Uppdatera lagringsstatus
              </button>
            </div>

            <div className="backup-warning-box" style={{ marginTop: 12 }}>
              ⚠ Exportera alltid backup innan större ändringar av lagringen.
            </div>
          </div>

          {/* Backup och export */}
          <div className="settings-section">
            <div className="settings-section-title">💾 Backup och export</div>
            <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 12 }}>
              Spara en lokal backup av dina chattar, egna prompts och projektminnen.
              Allt sker lokalt på din dator.
            </p>

            <div className="backup-export-grid">
              <button className="btn btn-secondary btn-sm backup-export-btn" onClick={handleExportAll}>
                💾 Exportera allt
              </button>
              <button className="btn btn-secondary btn-sm backup-export-btn" onClick={handleExportChats}>
                💬 Exportera chattar
              </button>
              <button className="btn btn-secondary btn-sm backup-export-btn" onClick={handleExportPrompts}>
                ✦ Exportera egna prompts
              </button>
              <button className="btn btn-secondary btn-sm backup-export-btn" onClick={handleExportMemory}>
                📁 Exportera projektminne
              </button>
            </div>

            <div className="backup-import-area">
              <div className="backup-import-title">Importera backup</div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: "none" }}
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
              <button
                className={`backup-file-selector${selectedFile ? " has-file" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                {selectedFile ? `📄 ${selectedFile.name}` : "📂 Välj backup-fil (.json)…"}
              </button>

              <div className="backup-mode-selector">
                <label className={`backup-mode-option${importMode === "merge" ? " active" : ""}`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === "merge"}
                    onChange={() => setImportMode("merge")}
                  />
                  Slå ihop — lägg till poster som saknas, behåll befintliga
                </label>
                <label className={`backup-mode-option${importMode === "replace" ? " active" : ""}`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                  />
                  Ersätt allt — skriver över nuvarande lokal data
                </label>
              </div>

              {importMode === "replace" && (
                <div className="backup-warning-box">
                  ⚠ Ersätt allt skriver över nuvarande lokal data permanent.
                  Exportera gärna en backup först.
                </div>
              )}

              <button
                className="btn btn-primary btn-sm"
                onClick={handleImport}
                disabled={!selectedFile || isImporting}
                style={{ marginTop: 8 }}
              >
                {isImporting ? "Importerar…" : "⬆ Importera backup"}
              </button>
            </div>

            {backupStatus && (
              <div className={`backup-status backup-status-${backupStatus.type}`}>
                {backupStatus.text}
              </div>
            )}
          </div>

          <div className="settings-section">
            <div className="settings-section-title">🔁 Uppdateringar</div>
            <div className="settings-row">
              <span className="settings-row-label">Nuvarande version</span>
              <span className="settings-row-value">{APP_VERSION} Build {APP_BUILD}</span>
            </div>
            <div style={{ marginTop: 12 }}>
              <button
                className="btn btn-secondary btn-full"
                onClick={() =>
                  alert(
                    "Uppdateringskontroll via GitHub Releases planeras i en framtida version."
                  )
                }
              >
                🔍 Sök efter uppdatering
              </button>
            </div>
            <p className="update-info-text">
              Automatisk uppdatering via GitHub Releases planeras i senare
              version. Inga uppdateringar laddas ned eller installeras
              automatiskt i v0.1.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// Projektminne-sektionen (Bash 5)
// ============================================================

interface ProjectsSectionProps {
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}

function ProjectsSection({ activeProjectId, onSelectProject }: ProjectsSectionProps) {
  const [noteInput, setNoteInput] = React.useState("");
  const [copiedPrompt, setCopiedPrompt] = React.useState<string | null>(null);
  const [, forceUpdate] = React.useState(0);

  const activeProject = DEFAULT_PROJECTS.find((p) => p.id === activeProjectId) ?? null;

  function handleAddNote() {
    if (!activeProjectId || !noteInput.trim()) return;
    addProjectNote(activeProjectId, noteInput.trim());
    setNoteInput("");
    forceUpdate((n) => n + 1);
  }

  function handleDeleteNote(index: number) {
    if (!activeProjectId) return;
    const confirmed = window.confirm("Ta bort anteckningen?");
    if (!confirmed) return;
    deleteProjectNote(activeProjectId, index);
    forceUpdate((n) => n + 1);
  }

  function handleResetMemory() {
    if (!activeProjectId) return;
    const confirmed = window.confirm(
      "Återställ dina anteckningar för det här projektet? Inbyggda regler och noter berörs inte."
    );
    if (!confirmed) return;
    resetProjectMemory(activeProjectId);
    forceUpdate((n) => n + 1);
  }

  function handleCopyPrompt(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedPrompt(text);
    setTimeout(() => setCopiedPrompt(null), 1800);
  }

  const liveMemory = activeProjectId ? getProjectMemoryById(activeProjectId) : null;

  return (
    <div className="section-view">
      <div className="main-header">
        <div className="main-header-title">
          📁 Projektminne
          <span className="main-header-sub">
            Regler och sammanhang skickas automatiskt till AI
          </span>
        </div>
      </div>

      <div className="section-body" style={{ padding: 0, overflow: "auto" }}>
        <div style={{ padding: "16px 20px 8px" }}>
          <div className="guide-section-heading">
            <span>Dina projekt</span>
            <span className="guide-section-count">{DEFAULT_PROJECTS.length} st</span>
          </div>
        </div>

        <div className="project-memory-grid">
          {DEFAULT_PROJECTS.map((project) => {
            const isActive = project.id === activeProjectId;
            return (
              <button
                key={project.id}
                className={`project-card${isActive ? " active" : ""}`}
                onClick={() => onSelectProject(isActive ? null : project.id)}
                title={isActive ? "Avaktivera projektet" : "Välj projekt"}
              >
                <div className="project-card-header">
                  <span className="project-card-icon">{project.icon}</span>
                  <span className="project-card-name">{project.name}</span>
                  <span className={`project-status-badge status-${project.status === "Pågår" ? "active" : project.status === "Idé / planering" || project.status === "Planerad / pågår" ? "planned" : "other"}`}>
                    {project.status}
                  </span>
                </div>
                <p className="project-card-desc">{project.shortDescription}</p>
                <div className="project-card-meta">
                  <span>{project.rules.length} regler</span>
                  <span>·</span>
                  <span>{project.notes.length} noter</span>
                  {isActive && <span className="project-active-tag">● Aktivt</span>}
                </div>
              </button>
            );
          })}
        </div>

        {activeProject && liveMemory && (
          <div style={{ padding: "8px 20px 24px" }}>
            <div className="guide-section-heading" style={{ marginBottom: 14 }}>
              <span>{activeProject.icon} {activeProject.name} — detaljer</span>
            </div>

            {activeProject.rules.length > 0 && (
              <div className="project-detail-block">
                <div className="project-detail-title">📋 Regler (skickas till AI)</div>
                <ul className="project-rules-list">
                  {activeProject.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeProject.notes.length > 0 && (
              <div className="project-detail-block">
                <div className="project-detail-title">💡 Inbyggda anteckningar</div>
                <ul className="project-rules-list">
                  {activeProject.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="project-detail-block">
              <div className="project-detail-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>📝 Dina anteckningar ({liveMemory.userNotes.length})</span>
                {liveMemory.userNotes.length > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleResetMemory}
                    style={{ fontSize: 10, padding: "2px 7px" }}
                  >
                    Rensa
                  </button>
                )}
              </div>

              {liveMemory.userNotes.length > 0 ? (
                <ul className="project-notes-list">
                  {liveMemory.userNotes.map((note, i) => (
                    <li key={i} className="project-note-item">
                      <span className="project-note-text">{note}</span>
                      <button
                        className="project-note-delete"
                        onClick={() => handleDeleteNote(i)}
                        title="Ta bort"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 8 }}>
                  Inga egna anteckningar ännu.
                </p>
              )}

              <div className="project-note-editor">
                <textarea
                  className="project-note-textarea"
                  placeholder="Skriv en anteckning om projektet…"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddNote();
                    }
                  }}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleAddNote}
                  disabled={!noteInput.trim()}
                  style={{ alignSelf: "flex-end" }}
                >
                  + Lägg till anteckning
                </button>
              </div>
            </div>

            {activeProject.suggestedPrompts.length > 0 && (
              <div className="project-detail-block">
                <div className="project-detail-title">✨ Föreslagna prompts</div>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                  Klicka för att kopiera till urklipp.
                </p>
                <div className="project-suggested-prompts">
                  {activeProject.suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      className={`suggested-prompt-btn${copiedPrompt === prompt ? " copied" : ""}`}
                      onClick={() => handleCopyPrompt(prompt)}
                      title="Kopiera till urklipp"
                    >
                      {copiedPrompt === prompt ? "✓ Kopierat!" : prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!activeProject && (
          <div style={{ padding: "0 20px 24px" }}>
            <div className="guide-empty-state">
              <span style={{ fontSize: 24 }}>📁</span>
              <p>
                Välj ett projekt ovan för att se regler, anteckningar och föreslagna prompts.
                Det aktiva projektet skickar sin kontext automatiskt till AI.
              </p>
            </div>
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ============================================================
// Promptbiblioteks-sektionen (Bash 6)
// ============================================================

interface PromptLibrarySectionProps {
  onUseDraft: (text: string) => void;
}

function PromptLibrarySection({ onUseDraft }: PromptLibrarySectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PromptCategory | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [, forceUpdate] = useState(0);

  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<PromptCategory>("general");
  const [formDescription, setFormDescription] = useState("");
  const [formTemplate, setFormTemplate] = useState("");
  const [formTags, setFormTags] = useState("");

  const allTemplates = getAllPromptTemplates();

  const filtered = allTemplates.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  function handleCopy(template: PromptTemplate) {
    navigator.clipboard.writeText(template.template).catch(() => {});
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Ta bort denna promptmall?")) return;
    deleteCustomPromptTemplate(id);
    forceUpdate((n) => n + 1);
  }

  function handleStartEdit(template: PromptTemplate) {
    setEditingId(template.id);
    setFormTitle(template.title);
    setFormCategory(template.category);
    setFormDescription(template.description);
    setFormTemplate(template.template);
    setFormTags(template.tags.join(", "));
    setShowCreateForm(false);
    setExpandedId(null);
  }

  function handleStartCreate() {
    setShowCreateForm(true);
    setEditingId(null);
    setFormTitle("");
    setFormCategory("general");
    setFormDescription("");
    setFormTemplate("");
    setFormTags("");
  }

  function handleSave() {
    if (!formTitle.trim() || !formTemplate.trim()) return;
    const tags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (editingId) {
      updateCustomPromptTemplate(editingId, {
        title: formTitle.trim(),
        category: formCategory,
        description: formDescription.trim(),
        template: formTemplate.trim(),
        tags,
      });
      setEditingId(null);
    } else {
      createCustomPromptTemplate({
        title: formTitle.trim(),
        category: formCategory,
        description: formDescription.trim(),
        template: formTemplate.trim(),
        tags,
      });
      setShowCreateForm(false);
    }
    forceUpdate((n) => n + 1);
  }

  function handleCancelForm() {
    setShowCreateForm(false);
    setEditingId(null);
  }

  const categories: Array<{ value: PromptCategory | "all"; label: string }> = [
    { value: "all", label: "Alla" },
    ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
      value: value as PromptCategory,
      label,
    })),
  ];

  const customCount = allTemplates.filter((t) => !t.isBuiltIn).length;

  return (
    <div className="section-view">
      <div className="main-header">
        <div className="main-header-title">
          ✦ Promptbibliotek
          <span className="main-header-sub">
            {allTemplates.length} mallar · {customCount} egna
          </span>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleStartCreate}
          >
            + Ny mall
          </button>
        </div>
      </div>

      <div className="section-body" style={{ padding: 0, overflow: "auto" }}>

        <div style={{ padding: "12px 20px 4px" }}>
          <input
            className="prompt-search-input"
            type="text"
            placeholder="Sök bland mallar…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="prompt-category-chips">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`prompt-category-chip${activeCategory === cat.value ? " active" : ""}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {(showCreateForm || editingId) && (
          <div className="prompt-form-card">
            <div className="prompt-form-title">
              {editingId ? "✏ Redigera mall" : "+ Skapa ny mall"}
            </div>

            <div className="prompt-form-row">
              <label className="prompt-form-label">Titel</label>
              <input
                className="prompt-form-input"
                type="text"
                placeholder="Mallens namn…"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div className="prompt-form-row">
              <label className="prompt-form-label">Kategori</label>
              <div className="prompt-form-select-wrapper">
                <select
                  className="prompt-form-select"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as PromptCategory)}
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <span className="model-select-chevron">▾</span>
              </div>
            </div>

            <div className="prompt-form-row">
              <label className="prompt-form-label">Beskrivning</label>
              <input
                className="prompt-form-input"
                type="text"
                placeholder="Kort beskrivning av mallen…"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="prompt-form-row">
              <label className="prompt-form-label">Taggar</label>
              <input
                className="prompt-form-input"
                type="text"
                placeholder="t.ex. kod, analys, projekt (kommaseparerat)"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
              />
            </div>

            <div className="prompt-form-row">
              <label className="prompt-form-label">Mall</label>
              <textarea
                className="prompt-form-textarea"
                placeholder="Promptens innehåll… Använd [PLATSHÅLLARE] för fält som fylls i."
                value={formTemplate}
                onChange={(e) => setFormTemplate(e.target.value)}
                rows={7}
              />
            </div>

            <div className="prompt-form-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleCancelForm}
              >
                Avbryt
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSave}
                disabled={!formTitle.trim() || !formTemplate.trim()}
              >
                {editingId ? "Spara ändringar" : "Skapa mall"}
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div style={{ padding: "0 20px 24px" }}>
            <div className="guide-empty-state">
              <span style={{ fontSize: 24 }}>✦</span>
              <p>
                {searchQuery
                  ? `Inga mallar matchar "${searchQuery}".`
                  : "Inga mallar i den här kategorin."}
              </p>
            </div>
          </div>
        ) : (
          <div className="prompt-template-list">
            {filtered.map((template) => (
              <div
                key={template.id}
                className={`prompt-template-card${expandedId === template.id ? " expanded" : ""}`}
              >
                <div
                  className="prompt-template-header"
                  onClick={() =>
                    setExpandedId(expandedId === template.id ? null : template.id)
                  }
                >
                  <div className="prompt-template-meta">
                    <span className="prompt-template-title">{template.title}</span>
                    <span className="prompt-category-tag">
                      {CATEGORY_LABELS[template.category]}
                    </span>
                    {!template.isBuiltIn && (
                      <span className="prompt-custom-tag">Egen</span>
                    )}
                  </div>
                  <span className="prompt-template-expand">
                    {expandedId === template.id ? "▴" : "▾"}
                  </span>
                </div>

                <p className="prompt-template-desc">{template.description}</p>

                {template.tags.length > 0 && (
                  <div className="prompt-template-tags">
                    {template.tags.map((tag) => (
                      <span key={tag} className="prompt-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {expandedId === template.id && (
                  <pre className="prompt-template-content">{template.template}</pre>
                )}

                <div className="prompt-template-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleCopy(template)}
                  >
                    {copiedId === template.id ? "✓ Kopierat!" : "📋 Kopiera"}
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => onUseDraft(template.template)}
                  >
                    ➤ Använd i chatten
                  </button>
                  {!template.isBuiltIn && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStartEdit(template)}
                      >
                        ✏ Redigera
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        🗑 Ta bort
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ============================================================
// Huvud-export
// ============================================================

interface ChatAreaProps {
  activeSection: NavSection;
  messages: ChatMessage[];
  isLoading: boolean;
  ollamaStatus: OllamaStatus;
  activeModel: string | null;
  availableModels: OllamaModel[];
  currentChatTitle: string | null;
  activeProfileName: string | null;
  activeProfileId: string | null;        // Bash 9
  activeProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onSendMessage: (text: string) => void;
  onCheckOllama: () => void;
  onNewChat: () => void;
  draftMessage: string;
  onDraftConsumed: () => void;
  onUseDraft: (text: string) => void;
  onImportComplete: () => void;
  onStopGeneration: () => void;
  appSettings: AppSettings;                                         // Bash 9
  onUpdateAppSettings: (partial: Partial<AppSettings>) => void;    // Bash 9
  onResetSettings: () => void;                                      // Bash 9
  onApplyDefaults: (profileId: string | null, projectId: string | null) => void; // Bash 9
  ttsSettings: TtsSettings;                                         // Bash 13
  availableTtsVoices: TtsVoiceInfo[];                               // Bash 13
  onUpdateTtsSettings: (partial: Partial<TtsSettings>) => void;    // Bash 13
  onResetTtsSettings: () => void;                                   // Bash 13
  onSpeak: (text: string) => void;                                  // Bash 13
  onStopSpeaking: () => void;                                       // Bash 13
}

export default function ChatArea({
  activeSection,
  messages,
  isLoading,
  ollamaStatus,
  activeModel,
  availableModels,
  currentChatTitle,
  activeProfileName,
  activeProfileId,
  activeProjectId,
  onSelectProject,
  onSendMessage,
  onCheckOllama,
  onNewChat,
  draftMessage,
  onDraftConsumed,
  onUseDraft,
  onImportComplete,
  onStopGeneration,
  appSettings,
  onUpdateAppSettings,
  onResetSettings,
  onApplyDefaults,
  ttsSettings,
  availableTtsVoices,
  onUpdateTtsSettings,
  onResetTtsSettings,
  onSpeak,
  onStopSpeaking,
}: ChatAreaProps) {
  const activeProjectObj = DEFAULT_PROJECTS.find((p) => p.id === activeProjectId) ?? null;

  const renderSection = () => {
    switch (activeSection) {
      case "chat":
        return (
          <ChatSection
            messages={messages}
            isLoading={isLoading}
            ollamaStatus={ollamaStatus}
            activeModel={activeModel}
            draftMessage={draftMessage}
            onDraftConsumed={onDraftConsumed}
            onSendMessage={onSendMessage}
            onStopGeneration={onStopGeneration}
            ttsSettings={ttsSettings}
            onSpeak={onSpeak}
            onStopSpeaking={onStopSpeaking}
          />
        );

      case "modellguide":
        return (
          <ModellguideSection
            ollamaStatus={ollamaStatus}
            availableModels={availableModels}
            onCheckOllama={onCheckOllama}
          />
        );

      case "installningar":
        return (
          <InstallningarSection
            ollamaStatus={ollamaStatus}
            onCheckOllama={onCheckOllama}
            onImportComplete={onImportComplete}
            appSettings={appSettings}
            onUpdateAppSettings={onUpdateAppSettings}
            onResetSettings={onResetSettings}
            activeProfileId={activeProfileId}
            activeProjectId={activeProjectId}
            onApplyDefaults={onApplyDefaults}
            ttsSettings={ttsSettings}
            availableTtsVoices={availableTtsVoices}
            onUpdateTtsSettings={onUpdateTtsSettings}
            onResetTtsSettings={onResetTtsSettings}
          />
        );

      case "projekt":
        return (
          <ProjectsSection
            activeProjectId={activeProjectId}
            onSelectProject={onSelectProject}
          />
        );

      case "prompts":
        return <PromptLibrarySection onUseDraft={onUseDraft} />;

      case "minne":
        return (
          <PlaceholderSection
            icon="🧠"
            title="Minne"
            description="Projektminne låter EchoCompanion komma ihåg viktig information om dina projekt mellan konversationer."
            plannedVersion="v0.3"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="main-area">
      {activeSection === "chat" && (
        <div className="main-header">
          <div className="main-header-title">
            💬{" "}
            {currentChatTitle ?? (
              <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                Osparat samtal
              </span>
            )}
            <span className="main-header-sub">
              {activeProfileName ? `${activeProfileName} · ` : ""}
              {activeProjectObj ? `${activeProjectObj.icon} ${activeProjectObj.name} · ` : ""}
              {activeModel
                ? `Modell: ${activeModel}`
                : ollamaStatus.connected
                ? "Välj en modell i höger panel"
                : "Ingen modell vald"}
            </span>
          </div>
          <div className="header-actions">
            {/* Kompakt TTS-knapp i chatheadern när uppläsning är aktiv (Bash 14) */}
            {ttsSettings.enabled && (
              <button
                className="btn btn-secondary btn-sm tts-header-stop-btn"
                onClick={onStopSpeaking}
                title="Stoppa pågående uppläsning"
              >
                ⏹ Stoppa röst
              </button>
            )}
            <button
              className="btn btn-secondary btn-sm"
              onClick={onNewChat}
              title="Starta ett nytt tomt samtal"
            >
              + Ny chat
            </button>
          </div>
        </div>
      )}

      {renderSection()}
    </div>
  );
}
