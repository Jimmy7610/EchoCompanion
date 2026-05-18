// ============================================================
// ollamaService.ts — Tjänst för kommunikation med Ollama API
// Ollama dokumentation: https://github.com/ollama/ollama/blob/main/docs/api.md
//
// VIKTIGT: Ollama måste vara installerat och igång lokalt.
// Ladda ner: https://ollama.com
// ============================================================

// INSTÄLLNING - Ändra bas-URL om Ollama körs på annan adress/port
const OLLAMA_BASE_URL = "http://localhost:11434";

// INSTÄLLNING - Timeout i millisekunder för statusanrop (3000 = 3 sek)
const STATUS_TIMEOUT_MS = 4000;

// INSTÄLLNING - Timeout i millisekunder för chattsvar (120000 = 2 min)
const CHAT_TIMEOUT_MS = 120000;

// ============================================================
// Typer
// ============================================================

export interface OllamaModelDetails {
  format: string;
  family: string;
  families: string[] | null;
  parameter_size: string;
  quantization_level: string;
}

/** En installerad Ollama-modell (svar från /api/tags) */
export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: OllamaModelDetails;
}

/** Enkel statusinformation som skickas som props till komponenter */
export interface OllamaStatus {
  connected: boolean;
  message: string;
  error?: string;
}

/**
 * Rikt returvärde från checkOllamaStatus() —
 * innehåller status + alla hittade modeller.
 */
export interface OllamaStatusResult {
  connected: boolean;
  message: string;
  models: OllamaModel[];
  error?: string;
}

export interface OllamaChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** Alternativ för ett chattsanrop */
export interface OllamaChatOptions {
  // INSTÄLLNING - Kreativitet (0.0 = deterministisk, 1.0 = kreativ, 2.0 = kaotisk)
  temperature?: number;
  // INSTÄLLNING - Kumulativ sannolikhet för nästa token (0.1–1.0)
  top_p?: number;
  // INSTÄLLNING - Max antal tokens i svaret — styr svarslängden, inte kontexten
  num_predict?: number;
  // INSTÄLLNING - Kontextfönsterstorlek — hur mycket historik modellen kan ta hänsyn till
  num_ctx?: number;
}

interface OllamaChatRequest {
  model: string;
  messages: OllamaChatMessage[];
  stream: boolean;
  options?: OllamaChatOptions;
}

interface OllamaChatResponse {
  model: string;
  message: OllamaChatMessage;
  done: boolean;
}

// ============================================================
// Hjälpfunktioner
// ============================================================

/** Returnerar Ollamas bas-URL */
function getBaseUrl(): string {
  // INSTÄLLNING - I framtida version hämtas detta från sparade inställningar
  return OLLAMA_BASE_URL;
}

/** Kontrollerar om ett fel troligen beror på att Ollama inte körs */
function isConnectionError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.name === "TypeError" ||
    err.message.includes("Failed to fetch") ||
    err.message.includes("ECONNREFUSED") ||
    err.message.includes("NetworkError") ||
    err.message.includes("Load failed") ||
    err.message.includes("network")
  );
}

// ============================================================
// API-funktioner
// ============================================================

/**
 * Kontrollerar om Ollama är igång och hämtar installerade modeller.
 * Använder /api/tags som både bekräftar anslutning och listar modeller.
 */
export async function checkOllamaStatus(): Promise<OllamaStatusResult> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tags`, {
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });

    if (!response.ok) {
      return {
        connected: false,
        message: `Ollama svarade med HTTP-fel ${response.status}.`,
        models: [],
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();
    const models: OllamaModel[] = data.models ?? [];
    const count = models.length;

    return {
      connected: true,
      message:
        count > 0
          ? `Ollama är ansluten — ${count} modell${count !== 1 ? "er" : ""} hittad${count !== 1 ? "e" : ""}.`
          : "Ollama är ansluten men inga modeller är installerade.",
      models,
    };
  } catch (err) {
    const connErr = isConnectionError(err);
    return {
      connected: false,
      message: connErr
        ? "Ollama kunde inte nås. Kontrollera att Ollama är startat."
        : "Anslutningsfel mot Ollama.",
      models: [],
      error: connErr
        ? "Ollama verkar inte vara igång. Starta Ollama och försök igen."
        : err instanceof Error
        ? err.message
        : "Okänt fel",
    };
  }
}

/**
 * Hämtar lista på installerade modeller.
 * Returnerar tom lista vid fel (använd checkOllamaStatus för felhantering).
 */
export async function listOllamaModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/tags`, {
      signal: AbortSignal.timeout(STATUS_TIMEOUT_MS),
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.models ?? [];
  } catch {
    return [];
  }
}

/**
 * Skickar ett chattmeddelande till Ollama och returnerar svaret.
 * Använder stream: false — strömning implementeras i Bash 3.
 */
export async function sendOllamaChatMessage(
  model: string,
  messages: OllamaChatMessage[],
  options?: OllamaChatOptions
): Promise<string> {
  const request: OllamaChatRequest = {
    model,
    messages,
    stream: false,
    options,
  };

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
    });
  } catch (err) {
    if (isConnectionError(err)) {
      throw new Error(
        "Ollama kunde inte nås under chattanropet. Är Ollama fortfarande igång?"
      );
    }
    throw new Error(
      "Modellen svarade inte. Testa en annan modell eller starta om Ollama."
    );
  }

  if (!response.ok) {
    // Ollama returnerar ibland en beskrivande JSON-text vid fel
    let detail = "";
    try {
      const errData = await response.json();
      detail = errData.error ?? "";
    } catch {
      // inget JSON-svar
    }
    throw new Error(
      detail
        ? `Ollama-fel: ${detail}`
        : `Modellen svarade med HTTP ${response.status}. Testa en annan modell.`
    );
  }

  const data: OllamaChatResponse = await response.json();
  return data.message.content;
}

/** Parametrar för streamat chattanrop */
export interface OllamaChatStreamParams {
  model: string;
  messages: OllamaChatMessage[];
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onDone?: () => void;
  options?: OllamaChatOptions;
}

/**
 * Skickar ett chattmeddelande till Ollama och strömmar svaret token för token.
 * Ollama returnerar newline-delimiterad JSON (NDJSON) vid stream: true.
 * Kastar AbortError om signal avbryts, annars annan Error vid nätverks/HTTP-fel.
 */
export async function sendOllamaChatMessageStream(
  params: OllamaChatStreamParams
): Promise<void> {
  const { model, messages, signal, onToken, onDone, options } = params;

  let response: Response;
  try {
    response = await fetch(`${getBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true, options }),
      signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") throw err;
    if (isConnectionError(err)) {
      throw new Error("Ollama kunde inte nås under chattanropet. Är Ollama fortfarande igång?");
    }
    throw new Error("Svarsgenereringen avbröts.");
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errData = await response.json();
      detail = errData.error ?? "";
    } catch { /* inget JSON */ }
    throw new Error(
      detail ? `Ollama-fel: ${detail}` : `Ollama svarade inte korrekt. HTTP ${response.status}.`
    );
  }

  if (!response.body) {
    throw new Error("Ollama svarade inte korrekt.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // Dela på radbrytningar och behåll eventuell ofullständig rad i bufferten
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        let chunk: { message?: { content?: string }; done?: boolean };
        try {
          chunk = JSON.parse(trimmed);
        } catch {
          continue; // hoppa över trasiga rader
        }

        if (chunk.message?.content) {
          onToken(chunk.message.content);
        }
        if (chunk.done) {
          onDone?.();
          return;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  onDone?.();
}

/**
 * Formaterar bytes till läsbar storlek (GB/MB).
 */
export function formatModelSize(bytes: number): string {
  if (!bytes) return "";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${Math.round(mb)} MB`;
}
