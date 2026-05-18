// ============================================================
// chatTypes.ts — Typdefinitioner för chattfunktionen
// ============================================================

/** En enskild chattroll */
export type MessageRole = "user" | "assistant" | "system";

/** Ett chattmeddelande */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean; // Sann när meddelandet strömmas in
  model?: string;        // Vilken modell som genererade svaret
}

/** En sparad konversation */
export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model?: string;
  profileId?: string;
  projectId?: string;
}

/** Aktuell chattkontext i appen */
export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  currentConversationId: string | null;
  error: string | null;
}

/** Skapar ett nytt meddelande med unikt ID */
export function createMessage(
  role: MessageRole,
  content: string,
  model?: string
): ChatMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: new Date(),
    model,
  };
}
