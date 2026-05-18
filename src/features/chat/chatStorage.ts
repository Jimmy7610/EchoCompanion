// ============================================================
// chatStorage.ts — Lokal sparning av chattar via localStorage
//
// Bash 3: Använder localStorage för enkel persistens.
// Framtida version kan migrera till Tauri FS API eller SQLite.
// ============================================================

import type { ChatMessage } from "./chatTypes";

// INSTÄLLNING - Ändra bara om lagringsformatet behöver återställas (raderar gamla chattar)
const SAVED_CHATS_KEY = "echocompanion.savedChats.v1";

// ============================================================
// Typer
// ============================================================

/** Ett enskilt meddelande som det lagras i localStorage */
export interface SavedChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string; // ISO 8601 — Date-objekt konverteras vid in/ut
  model?: string;
}

/** Ett helt sparat samtal */
export interface SavedChat {
  id: string;
  title: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  modelName: string | null;
  profileId: string | null;
  projectId: string | null;
  messages: SavedChatMessage[];
}

/** Sammanfattning av ett samtal utan meddelanden (för sidopanelslistan) */
export type SavedChatSummary = Omit<SavedChat, "messages">;

// ============================================================
// Intern hjälpfunktioner
// ============================================================

function readAllChats(): SavedChat[] {
  try {
    const raw = localStorage.getItem(SAVED_CHATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedChat[];
  } catch (err) {
    console.warn("EchoCompanion: Kunde inte läsa sparade samtal.", err);
    return [];
  }
}

function writeAllChats(chats: SavedChat[]): void {
  try {
    localStorage.setItem(SAVED_CHATS_KEY, JSON.stringify(chats));
  } catch (err) {
    console.error("EchoCompanion: Kunde inte spara samtalet.", err);
  }
}

// ============================================================
// Konvertering ChatMessage ↔ SavedChatMessage
// ============================================================

export function chatMessageToSaved(msg: ChatMessage): SavedChatMessage {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    timestamp: msg.timestamp.toISOString(),
    model: msg.model,
  };
}

export function savedMessageToChatMessage(saved: SavedChatMessage): ChatMessage {
  return {
    id: saved.id,
    role: saved.role,
    content: saved.content,
    timestamp: new Date(saved.timestamp),
    model: saved.model,
  };
}

// ============================================================
// Publika API-funktioner
// ============================================================

/** Returnerar alla sparade chattar sorterade efter senast uppdaterade. */
export function getSavedChats(): SavedChat[] {
  return readAllChats().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/** Hämtar ett specifikt samtal via ID. Returnerar null om det inte finns. */
export function getSavedChatById(id: string): SavedChat | null {
  return readAllChats().find((c) => c.id === id) ?? null;
}

/** Sparar (skapar eller uppdaterar) ett samtal. */
export function saveChat(chat: SavedChat): void {
  const chats = readAllChats();
  const idx = chats.findIndex((c) => c.id === chat.id);
  if (idx >= 0) {
    chats[idx] = chat;
  } else {
    chats.push(chat);
  }
  writeAllChats(chats);
}

/** Skapar ett nytt tomt samtal och sparar det. */
export function createNewChat(options?: {
  modelName?: string | null;
  profileId?: string | null;
  projectId?: string | null;
}): SavedChat {
  const now = new Date().toISOString();
  const chat: SavedChat = {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: "Nytt samtal",
    createdAt: now,
    updatedAt: now,
    modelName: options?.modelName ?? null,
    profileId: options?.profileId ?? null,
    projectId: options?.projectId ?? null,
    messages: [],
  };
  saveChat(chat);
  return chat;
}

/**
 * Uppdaterar meddelanden i ett sparat samtal.
 * Uppdaterar också updatedAt och valfri metadata.
 */
export function updateChatMessages(
  chatId: string,
  messages: SavedChatMessage[],
  metadata?: Partial<Pick<SavedChat, "title" | "modelName" | "profileId" | "projectId">>
): void {
  const chats = readAllChats();
  const idx = chats.findIndex((c) => c.id === chatId);
  if (idx < 0) {
    console.warn(`EchoCompanion: Samtal ${chatId} hittades inte vid sparning.`);
    return;
  }
  chats[idx] = {
    ...chats[idx],
    ...metadata,
    messages,
    updatedAt: new Date().toISOString(),
  };
  writeAllChats(chats);
}

/** Byter namn på ett samtal. */
export function renameChat(chatId: string, newTitle: string): void {
  const chats = readAllChats();
  const idx = chats.findIndex((c) => c.id === chatId);
  if (idx < 0) return;
  chats[idx].title = newTitle.trim();
  chats[idx].updatedAt = new Date().toISOString();
  writeAllChats(chats);
}

/** Raderar ett samtal permanent. */
export function deleteChat(chatId: string): void {
  writeAllChats(readAllChats().filter((c) => c.id !== chatId));
}

/**
 * Genererar en kortfattad titel från det första meddelandet.
 * Används när ett nytt samtal skapas automatiskt.
 */
export function generateChatTitle(firstUserMessage: string): string {
  const cleaned = firstUserMessage.trim().replace(/\s+/g, " ");
  // INSTÄLLNING - Maxlängd på auto-genererade samtalsrubriker
  const MAX_LENGTH = 45;
  if (cleaned.length <= MAX_LENGTH) return cleaned;
  return cleaned.slice(0, MAX_LENGTH).trimEnd() + "…";
}

// ============================================================
// Hjälp för UI: relativ tidsformatering (svenska)
// ============================================================

export function formatChatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just nu";
  if (diffMins < 60) return `${diffMins} min sedan`;
  if (diffHours < 24) return `${diffHours} tim sedan`;
  if (diffDays === 1) return "Igår";
  if (diffDays < 7) return `${diffDays} dagar sedan`;
  return date.toLocaleDateString("sv-SE", { day: "numeric", month: "short" });
}
