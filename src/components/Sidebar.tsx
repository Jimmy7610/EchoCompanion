// ============================================================
// Sidebar.tsx — Vänster navigationspanel med chatthistorik
// ============================================================

import React from "react";
import type { SavedChat } from "../features/chat/chatStorage";
import { formatChatDate } from "../features/chat/chatStorage";

// Nav-sektioner som appen stöder
export type NavSection =
  | "chat"
  | "projekt"
  | "prompts"
  | "modellguide"
  | "minne"
  | "installningar";

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

// Enkla SVG-ikoner inbäddade direkt (undviker externa ikonbibliotek)
const Icons = {
  Chat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Projekt: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Prompts: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Modellguide: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Minne: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  Installningar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M4.93 19.07l1.41-1.41M19.07 19.07l-1.41-1.41M2 12h2M20 12h2" />
    </svg>
  ),
  Echo: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  Plus: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Pencil: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
};

// INSTÄLLNING - Ändra ordning eller etiketter på nav-items här
const NAV_ITEMS: NavItem[] = [
  { id: "chat",        label: "Chatt",       icon: <Icons.Chat /> },
  { id: "projekt",     label: "Projekt",     icon: <Icons.Projekt />, badge: "5" },
  { id: "prompts",     label: "Prompts",     icon: <Icons.Prompts /> },
  { id: "modellguide", label: "Modellguide", icon: <Icons.Modellguide /> },
  { id: "minne",       label: "Minne",       icon: <Icons.Minne /> },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "installningar", label: "Inställningar", icon: <Icons.Installningar /> },
];

// ---- Chatthistorik-item ----

interface ChatHistoryItemProps {
  chat: SavedChat;
  isActive: boolean;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}

function ChatHistoryItem({ chat, isActive, onOpen, onRename, onDelete }: ChatHistoryItemProps) {
  return (
    <div
      className={`chat-history-item${isActive ? " active" : ""}`}
      onClick={onOpen}
      title={chat.title}
    >
      <div className="chat-history-item-body">
        <span className="chat-history-item-title">{chat.title}</span>
        <span className="chat-history-item-date">{formatChatDate(chat.updatedAt)}</span>
      </div>
      <div className="chat-history-item-actions">
        <button
          className="chat-history-action-btn"
          onClick={(e) => { e.stopPropagation(); onRename(); }}
          title="Byt namn"
          aria-label="Byt namn på samtal"
        >
          <Icons.Pencil />
        </button>
        <button
          className="chat-history-action-btn delete"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Radera"
          aria-label="Radera samtal"
        >
          <Icons.Trash />
        </button>
      </div>
    </div>
  );
}

// ---- Props ----

interface SidebarProps {
  activeSection: NavSection;
  onSectionChange: (section: NavSection) => void;
  // Bash 3: chatthistorik
  savedChats: SavedChat[];
  currentChatId: string | null;
  onNewChat: () => void;
  onOpenChat: (chatId: string) => void;
  onRenameChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function Sidebar({
  activeSection,
  onSectionChange,
  savedChats,
  currentChatId,
  onNewChat,
  onOpenChat,
  onRenameChat,
  onDeleteChat,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Logotyp */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Icons.Echo />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-name">EchoCompanion</span>
          <span className="sidebar-logo-tagline">Din lokala AI-kompis</span>
        </div>
      </div>

      {/* Navigering (kompakt, ej flex-grow) */}
      <nav className="sidebar-nav sidebar-nav-compact">
        <div className="sidebar-section-label">Navigering</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${activeSection === item.id ? " active" : ""}`}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
            {item.badge && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Chatthistorik (flex-grow, scrollbar) */}
      <div className="sidebar-history">
        {/* Rubrik + Ny chat-knapp */}
        <div className="sidebar-history-header">
          <span className="sidebar-section-label" style={{ marginBottom: 0 }}>
            Samtal
          </span>
          <button
            className="new-chat-btn"
            onClick={onNewChat}
            title="Nytt samtal"
          >
            <Icons.Plus />
            Ny chat
          </button>
        </div>

        {/* Lista */}
        {savedChats.length === 0 ? (
          <div className="chat-history-empty">
            <p>Inga sparade samtal ännu.</p>
            <p>Starta en ny chat för att börja.</p>
          </div>
        ) : (
          <div className="chat-history-list">
            {savedChats.map((chat) => (
              <ChatHistoryItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onOpen={() => onOpenChat(chat.id)}
                onRename={() => onRenameChat(chat.id)}
                onDelete={() => onDeleteChat(chat.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nedre nav (Inställningar) */}
      <div className="sidebar-footer">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item${activeSection === item.id ? " active" : ""}`}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
