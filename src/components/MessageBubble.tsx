// ============================================================
// MessageBubble.tsx — Visar ett chattmeddelande
// ============================================================

import type { ChatMessage } from "../features/chat/chatTypes";

interface MessageBubbleProps {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
  onStopSpeaking?: () => void;
  ttsEnabled?: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessageBubble({
  message,
  onSpeak,
  onStopSpeaking,
  ttsEnabled,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const showTtsActions = !isUser && ttsEnabled && !message.isStreaming && onSpeak;

  return (
    <div className={`message-row ${isUser ? "user" : "ai"}`}>
      {/* Avatar */}
      <div className={`message-avatar ${isUser ? "user" : "ai"}`}>
        {isUser ? "J" : "⬡"}
      </div>

      {/* Innehåll */}
      <div className="message-content">
        <div className={`message-bubble selectable ${isUser ? "user" : "ai"}`}>
          {message.isStreaming ? (
            <>
              {message.content || (
                <span className="streaming-placeholder-text">
                  EchoCompanion skriver…
                </span>
              )}
              <span className="typing-indicator" style={{ display: "inline-flex", marginLeft: 4 }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
            </>
          ) : (
            message.content
          )}
        </div>

        <div className="message-meta-row">
          <span className="message-time">
            {formatTime(message.timestamp)}
            {message.model && !isUser && (
              <span style={{ marginLeft: 6, opacity: 0.6 }}>
                · {message.model}
              </span>
            )}
          </span>

          {showTtsActions && (
            <div className="message-actions">
              <button
                className="message-action-btn"
                onClick={() => onSpeak(message.content)}
                title="Läs upp detta svar"
              >
                🔊 Läs upp
              </button>
              {onStopSpeaking && (
                <button
                  className="message-action-btn"
                  onClick={onStopSpeaking}
                  title="Stoppa uppläsning"
                >
                  ⏹ Stoppa röst
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
