// ============================================================
// App.tsx — Huvud-appkomponent och global tillståndshantering
// ============================================================

import { useState, useCallback, useEffect, useRef } from "react";
import Sidebar, { type NavSection } from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import RightPanel from "./components/RightPanel";
import StatusBar from "./components/StatusBar";
import {
  checkOllamaStatus,
  sendOllamaChatMessage,
  sendOllamaChatMessageStream,
  type OllamaStatus,
  type OllamaModel,
} from "./features/ollama/ollamaService";
import { createMessage, type ChatMessage } from "./features/chat/chatTypes";
import {
  getSavedChats,
  createNewChat,
  updateChatMessages,
  renameChat,
  deleteChat,
  generateChatTitle,
  chatMessageToSaved,
  savedMessageToChatMessage,
  type SavedChat,
} from "./features/chat/chatStorage";
import { COMPANION_PROFILES } from "./features/settings/settingsTypes";
import { buildSystemPrompt, buildProjectContextString } from "./features/settings/systemPrompts";
import { DEFAULT_PROJECTS } from "./features/projects/projectTypes";
import { getProjectMemoryById } from "./features/projects/projectStorage";
import {
  getAppSettings,
  updateAppSettings,
  resetAppSettings,
  type AppSettings,
} from "./features/settings/appSettings";
import {
  getTtsSettings,
  updateTtsSettings,
  resetTtsSettings,
} from "./features/tts/ttsStorage";
import type { TtsSettings } from "./features/tts/ttsTypes";
import {
  isSpeechSynthesisSupported,
  getAvailableVoices,
  speakText,
  stopSpeaking,
} from "./features/tts/ttsService";
import type { TtsVoiceInfo } from "./features/tts/ttsTypes";

// INSTÄLLNING - Maximalt antal tidigare meddelanden som skickas till Ollama (utöver systemprompt och nytt meddelande)
const MAX_HISTORY_MESSAGES = 20;

export default function App() {
  // ---- Navigation ----
  const [activeSection, setActiveSection] = useState<NavSection>("chat");

  // ---- Ollama-status ----
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus>({
    connected: false,
    message: "Ej kontrollerad ännu.",
  });
  const [isCheckingOllama, setIsCheckingOllama] = useState(false);

  // ---- Tillgängliga modeller ----
  const [availableModels, setAvailableModels] = useState<OllamaModel[]>([]);

  // ---- Aktiv modell, profil och projekt ----
  const [activeModel, setActiveModel] = useState<string | null>(null);
  const [activeProfile, setActiveProfile] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  // ---- App-inställningar (Bash 9 — ersätter standalone useStreaming) ----
  const [appSettings, setAppSettings] = useState<AppSettings>(() => getAppSettings());

  // ---- TTS-inställningar (Bash 13) ----
  const [ttsSettings, setTtsSettings] = useState<TtsSettings>(() => getTtsSettings());
  const [availableTtsVoices, setAvailableTtsVoices] = useState<TtsVoiceInfo[]>([]);

  // ---- Utkast från promptbiblioteket ----
  const [draftMessage, setDraftMessage] = useState("");

  // ---- AbortController för pågående streaming ----
  const abortControllerRef = useRef<AbortController | null>(null);

  // ---- Chatt (nuvarande session) ----
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ---- Sparade chattar ----
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);

  // Ladda sparade chattar vid start
  useEffect(() => {
    setSavedChats(getSavedChats());
  }, []);

  // Tillämpa standardvärden för profil och projekt vid start
  useEffect(() => {
    const settings = getAppSettings();
    if (settings.defaultProfileId) setActiveProfile(settings.defaultProfileId);
    if (settings.defaultProjectId) setActiveProject(settings.defaultProjectId);
  }, []);

  // Ladda TTS-röster vid start och lyssna på voiceschanged
  useEffect(() => {
    if (!isSpeechSynthesisSupported()) return;

    function loadVoices() {
      setAvailableTtsVoices(getAvailableVoices());
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  function refreshSavedChats() {
    setSavedChats(getSavedChats());
  }

  // ---- App-inställningar: uppdatera och återställ ----
  const handleUpdateAppSettings = useCallback((partial: Partial<AppSettings>) => {
    const updated = updateAppSettings(partial);
    setAppSettings(updated);
  }, []);

  const handleResetSettings = useCallback(() => {
    const defaults = resetAppSettings();
    setAppSettings(defaults);
  }, []);

  const handleApplyDefaults = useCallback(
    (profileId: string | null, projectId: string | null) => {
      setActiveProfile(profileId);
      setActiveProject(projectId);
    },
    []
  );

  // ---- TTS: uppdatera och återställ ----
  const handleUpdateTtsSettings = useCallback((partial: Partial<TtsSettings>) => {
    const updated = updateTtsSettings(partial);
    setTtsSettings(updated);
  }, []);

  const handleResetTtsSettings = useCallback(() => {
    const defaults = resetTtsSettings();
    setTtsSettings(defaults);
  }, []);

  const handleSpeak = useCallback((text: string) => {
    speakText(text, ttsSettings);
  }, [ttsSettings]);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
  }, []);

  // ---- Skapa ny chat ----
  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCurrentChatId(null);
    setActiveSection("chat");
  }, []);

  // ---- Öppna sparat samtal ----
  const handleOpenChat = useCallback((chatId: string) => {
    const chat = getSavedChats().find((c) => c.id === chatId);
    if (!chat) return;
    const loaded = chat.messages.map(savedMessageToChatMessage);
    setMessages(loaded);
    setCurrentChatId(chatId);
    setActiveSection("chat");
    if (chat.modelName) setActiveModel(chat.modelName);
  }, []);

  // ---- Byt namn på samtal (window.prompt — modal i framtida version) ----
  const handleRenameChat = useCallback((chatId: string) => {
    const chat = getSavedChats().find((c) => c.id === chatId);
    if (!chat) return;
    const newTitle = window.prompt("Nytt namn på samtalet:", chat.title);
    if (!newTitle || !newTitle.trim()) return;
    renameChat(chatId, newTitle.trim());
    refreshSavedChats();
  }, []);

  // ---- Radera samtal ----
  const handleDeleteChat = useCallback(
    (chatId: string) => {
      const confirmed = window.confirm(
        "Vill du radera detta samtal? Detta går inte att ångra."
      );
      if (!confirmed) return;
      deleteChat(chatId);
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
      }
      refreshSavedChats();
    },
    [currentChatId]
  );

  // ---- Kontrollera Ollama ----
  const handleCheckOllama = useCallback(async () => {
    if (isCheckingOllama) return;
    setIsCheckingOllama(true);
    try {
      const result = await checkOllamaStatus();
      setOllamaStatus({
        connected: result.connected,
        message: result.message,
        error: result.error,
      });
      setAvailableModels(result.models);

      // INSTÄLLNING - Styr via appSettings.autoSelectFirstModel om första modellen väljs automatiskt
      const settings = getAppSettings();
      if (settings.autoSelectFirstModel && result.connected && result.models.length > 0 && !activeModel) {
        setActiveModel(result.models[0].name);
      }
      if (
        activeModel &&
        result.models.length > 0 &&
        !result.models.find((m) => m.name === activeModel)
      ) {
        setActiveModel(result.models[0].name);
      }
    } finally {
      setIsCheckingOllama(false);
    }
  }, [isCheckingOllama, activeModel]);

  // ---- Välj modell ----
  const handleSelectModel = useCallback((modelName: string | null) => {
    setActiveModel(modelName);
  }, []);

  // ---- Använd ett utkast från promptbiblioteket ----
  const handleUseDraft = useCallback((text: string) => {
    setDraftMessage(text);
    setActiveSection("chat");
  }, []);

  // ---- Stoppa pågående generering ----
  const handleStopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  // ---- Skicka chattmeddelande ----
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      // Bygg projektkontexten om ett projekt är aktivt
      const activeProjectObj = DEFAULT_PROJECTS.find((p) => p.id === activeProject);
      let projectContext: string | undefined;
      if (activeProjectObj) {
        const projectMemory = getProjectMemoryById(activeProject!);
        projectContext = buildProjectContextString(activeProjectObj, projectMemory.userNotes);
      }
      const systemPrompt = buildSystemPrompt(activeProfile ?? null, projectContext);

      const userMsg = createMessage("user", text);
      const messagesWithUser = [...messages, userMsg];
      setMessages(messagesWithUser);
      setIsLoading(true);

      // Tidiga avvisningar — visa hjälptext men spara inte
      if (!ollamaStatus.connected || !activeModel) {
        const helpMsg = createMessage(
          "assistant",
          ollamaStatus.connected
            ? "Ingen modell är vald. Välj en modell i höger panel och försök igen."
            : 'Ollama verkar inte vara igång.\n\nKlicka på "Kontrollera Ollama" i höger panel, starta Ollama och försök sedan igen.\n\nLadda ned Ollama gratis: https://ollama.com'
        );
        setMessages([...messagesWithUser, helpMsg]);
        setIsLoading(false);
        return;
      }

      // Skapa nytt sparat samtal vid första riktiga meddelandet
      let chatId = currentChatId;
      if (!chatId) {
        const newChat = createNewChat({
          modelName: activeModel,
          profileId: activeProfile,
          projectId: activeProject,
        });
        const title = generateChatTitle(text);
        updateChatMessages(newChat.id, [], { title, modelName: activeModel });
        chatId = newChat.id;
        setCurrentChatId(chatId);
      }

      // Bygg historik för API-anropet
      const apiMessages: { role: "user" | "assistant" | "system"; content: string }[] = [];
      apiMessages.push({ role: "system", content: systemPrompt });
      const historyMessages = messages
        .filter(
          (m) =>
            (m.role === "user" || m.role === "assistant") &&
            m.content.trim().length > 0 &&
            !m.isStreaming
        )
        .slice(-MAX_HISTORY_MESSAGES);
      for (const m of historyMessages) {
        apiMessages.push({ role: m.role, content: m.content });
      }
      apiMessages.push({ role: "user", content: text });

      const ollamaOptions = {
        temperature: appSettings.temperature,
        top_p: appSettings.topP,
        num_predict: appSettings.numPredict,
        num_ctx: appSettings.numCtx,
      };

      if (import.meta.env.DEV || appSettings.showDebugInfo) {
        console.log(
          `[EchoCompanion] ${appSettings.useStreaming ? "Streaming" : "Icke-streaming"} — ${apiMessages.length} meddelanden (${historyMessages.length} historik + 1 system + 1 ny)`,
          ollamaOptions
        );
      }

      if (appSettings.useStreaming) {
        // ---- Streamat svar ----
        const aiMsg = createMessage("assistant", "");
        const aiMsgId = aiMsg.id;
        const streamingPlaceholder: ChatMessage = {
          ...aiMsg,
          isStreaming: true,
          model: activeModel,
        };
        setMessages([...messagesWithUser, streamingPlaceholder]);

        const controller = new AbortController();
        abortControllerRef.current = controller;
        let accumulatedContent = "";
        let tokenCount = 0;

        try {
          await sendOllamaChatMessageStream({
            model: activeModel,
            messages: apiMessages,
            signal: controller.signal,
            options: ollamaOptions,
            onToken: (token) => {
              accumulatedContent += token;
              tokenCount++;
              const snapshot = accumulatedContent;
              setMessages((prev) => {
                const idx = prev.findIndex((m) => m.id === aiMsgId);
                if (idx < 0) return prev;
                const updated = [...prev];
                updated[idx] = { ...updated[idx], content: snapshot };
                return updated;
              });
            },
          });

          if (import.meta.env.DEV || appSettings.showDebugInfo) {
            console.log(`[EchoCompanion] Streaming klar — ${tokenCount} tokens mottagna`);
          }

          const finalAiMsg: ChatMessage = {
            ...streamingPlaceholder,
            content: accumulatedContent,
            isStreaming: false,
          };
          const finalMessages = [...messagesWithUser, finalAiMsg];
          setMessages(finalMessages);
          updateChatMessages(chatId, finalMessages.map(chatMessageToSaved), {
            modelName: activeModel,
            profileId: activeProfile ?? undefined,
            projectId: activeProject ?? undefined,
          });

          // Auto-uppläsning efter fullständigt svar (Bash 13)
          if (ttsSettings.enabled && ttsSettings.autoReadAssistant && accumulatedContent) {
            speakText(accumulatedContent, ttsSettings);
          }
        } catch (err) {
          const wasAborted = err instanceof Error && err.name === "AbortError";

          if (import.meta.env.DEV || appSettings.showDebugInfo) {
            console.log(
              `[EchoCompanion] Streaming ${wasAborted ? "stoppad" : "fel"} — ${tokenCount} tokens mottagna`
            );
          }

          const finalContent = wasAborted
            ? accumulatedContent
              ? `${accumulatedContent}\n\n[Svar stoppat]`
              : "[Svar stoppat]"
            : accumulatedContent || "⚠ Kunde inte läsa streamat svar från Ollama.";

          const finalAiMsg: ChatMessage = {
            ...streamingPlaceholder,
            content: finalContent,
            isStreaming: false,
          };
          const finalMessages = [...messagesWithUser, finalAiMsg];
          setMessages(finalMessages);
          updateChatMessages(chatId, finalMessages.map(chatMessageToSaved), {
            modelName: activeModel,
            profileId: activeProfile ?? undefined,
            projectId: activeProject ?? undefined,
          });
        } finally {
          abortControllerRef.current = null;
          setIsLoading(false);
          refreshSavedChats();
        }
      } else {
        // ---- Icke-streamat svar (fallback) ----
        try {
          const responseText = await sendOllamaChatMessage(activeModel, apiMessages, ollamaOptions);
          const aiMsg = createMessage("assistant", responseText, activeModel);
          const finalMessages = [...messagesWithUser, aiMsg];
          setMessages(finalMessages);
          updateChatMessages(chatId, finalMessages.map(chatMessageToSaved), {
            modelName: activeModel,
            profileId: activeProfile ?? undefined,
            projectId: activeProject ?? undefined,
          });

          // Auto-uppläsning efter fullständigt svar (Bash 13)
          if (ttsSettings.enabled && ttsSettings.autoReadAssistant && responseText) {
            speakText(responseText, ttsSettings);
          }
        } catch (err) {
          const errorText =
            err instanceof Error ? err.message : "Okänt fel vid API-anrop. Försök igen.";
          const errMsg = createMessage("assistant", `⚠ ${errorText}`);
          const finalMessages = [...messagesWithUser, errMsg];
          setMessages(finalMessages);
          updateChatMessages(chatId, finalMessages.map(chatMessageToSaved));
        } finally {
          setIsLoading(false);
          refreshSavedChats();
        }
      }
    },
    [messages, isLoading, ollamaStatus, activeModel, activeProfile, activeProject, currentChatId, appSettings, ttsSettings]
  );

  // Hämta titel på aktuellt samtal (för ChatArea-headern)
  const currentChatTitle = currentChatId
    ? savedChats.find((c) => c.id === currentChatId)?.title ?? null
    : null;

  // Visningsnamn för aktiv profil (med emoji)
  const activeProfileObj = COMPANION_PROFILES.find((p) => p.id === activeProfile);
  const activeProfileName = activeProfileObj
    ? `${activeProfileObj.emoji} ${activeProfileObj.name}`
    : null;

  // Visningsnamn för aktivt projekt (med ikon)
  const activeProjectObj = DEFAULT_PROJECTS.find((p) => p.id === activeProject);
  const activeProjectName = activeProjectObj
    ? `${activeProjectObj.icon} ${activeProjectObj.name}`
    : null;

  return (
    <div className="app-container">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        savedChats={savedChats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onOpenChat={handleOpenChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
      />

      <ChatArea
        activeSection={activeSection}
        messages={messages}
        isLoading={isLoading}
        ollamaStatus={ollamaStatus}
        activeModel={activeModel}
        availableModels={availableModels}
        currentChatTitle={currentChatTitle}
        activeProfileName={activeProfileName}
        activeProfileId={activeProfile}
        activeProjectId={activeProject}
        onSelectProject={setActiveProject}
        onSendMessage={handleSendMessage}
        onCheckOllama={handleCheckOllama}
        onNewChat={handleNewChat}
        draftMessage={draftMessage}
        onDraftConsumed={() => setDraftMessage("")}
        onUseDraft={handleUseDraft}
        onImportComplete={refreshSavedChats}
        onStopGeneration={handleStopGeneration}
        appSettings={appSettings}
        onUpdateAppSettings={handleUpdateAppSettings}
        onResetSettings={handleResetSettings}
        onApplyDefaults={handleApplyDefaults}
        ttsSettings={ttsSettings}
        availableTtsVoices={availableTtsVoices}
        onUpdateTtsSettings={handleUpdateTtsSettings}
        onResetTtsSettings={handleResetTtsSettings}
        onSpeak={handleSpeak}
        onStopSpeaking={handleStopSpeaking}
      />

      <RightPanel
        ollamaStatus={ollamaStatus}
        availableModels={availableModels}
        activeModel={activeModel}
        activeProfile={activeProfile}
        activeProject={activeProject}
        onCheckOllama={handleCheckOllama}
        onSelectModel={handleSelectModel}
        onSelectProfile={setActiveProfile}
        onSelectProject={setActiveProject}
        isCheckingOllama={isCheckingOllama}
        ttsSettings={ttsSettings}
      />

      <StatusBar
        ollamaStatus={ollamaStatus}
        activeModel={activeModel}
        activeProfileName={activeProfileName}
        activeProjectName={activeProjectName}
        ttsSettings={ttsSettings}
      />
    </div>
  );
}
