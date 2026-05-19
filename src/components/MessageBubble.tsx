// ============================================================
// MessageBubble.tsx — Visar ett chattmeddelande
// ============================================================

import { Fragment } from "react";
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

// ---- Inline renderer: **bold**, `code` ----

function renderInline(text: string): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return <code key={i} className="msg-inline-code">{part.slice(1, -1)}</code>;
        }
        return part || null;
      })}
    </>
  );
}

// ---- Block renderer: paragraphs, lists, code blocks ----

function renderMarkdown(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];

  // Split on fenced code blocks (handles unclosed blocks gracefully)
  const sections = text.split(/(```[\s\S]*?```)/);

  sections.forEach((section, sIdx) => {
    if (section.startsWith("```") && section.endsWith("```")) {
      const inner = section.slice(3, -3);
      const nl = inner.indexOf("\n");
      // Strip optional language hint on first line
      const code = nl === -1 ? inner : inner.slice(nl + 1);
      nodes.push(
        <pre key={`cb-${sIdx}`} className="msg-code-block">
          <code>{code.trim()}</code>
        </pre>
      );
      return;
    }

    const lines = section.split("\n");
    let i = 0;
    let k = 0; // local key counter per section

    while (i < lines.length) {
      const line = lines[i];

      if (!line.trim()) { i++; continue; }

      // Unordered list
      if (/^[-*] /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && (/^[-*] /.test(lines[i]) || !lines[i].trim())) {
          if (lines[i].trim()) items.push(lines[i].replace(/^[-*] /, ""));
          i++;
        }
        nodes.push(
          <ul key={`${sIdx}-ul-${k++}`} className="msg-list msg-ul">
            {items.map((item, li) => <li key={li}>{renderInline(item)}</li>)}
          </ul>
        );
        continue;
      }

      // Ordered list
      if (/^\d+\. /.test(line)) {
        const items: string[] = [];
        while (i < lines.length && (/^\d+\. /.test(lines[i]) || !lines[i].trim())) {
          if (lines[i].trim()) items.push(lines[i].replace(/^\d+\. /, ""));
          i++;
        }
        nodes.push(
          <ol key={`${sIdx}-ol-${k++}`} className="msg-list msg-ol">
            {items.map((item, li) => <li key={li}>{renderInline(item)}</li>)}
          </ol>
        );
        continue;
      }

      // Regular paragraph — collect until blank line or list start
      const paraLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^[-*] /.test(lines[i]) &&
        !/^\d+\. /.test(lines[i])
      ) {
        paraLines.push(lines[i]);
        i++;
      }
      if (paraLines.length > 0) {
        nodes.push(
          <p key={`${sIdx}-p-${k++}`} className="msg-para">
            {paraLines.map((pl, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {renderInline(pl)}
              </Fragment>
            ))}
          </p>
        );
      }
    }
  });

  return nodes.filter(Boolean);
}

// ---- Rendered content wrapper ----

function MarkdownContent({ text }: { text: string }) {
  return <div className="msg-rendered">{renderMarkdown(text)}</div>;
}

// ---- MessageBubble ----

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
            // Streaming: plain pre-wrap + typing dots
            <>
              <span className="msg-streaming-text">
                {message.content || (
                  <span className="streaming-placeholder-text">
                    EchoCompanion skriver…
                  </span>
                )}
              </span>
              <span className="typing-indicator" style={{ display: "inline-flex", marginLeft: 4 }}>
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
            </>
          ) : isUser ? (
            // User messages: plain pre-wrap
            <span className="msg-user-text">{message.content}</span>
          ) : (
            // AI messages: rendered markdown
            <MarkdownContent text={message.content} />
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
