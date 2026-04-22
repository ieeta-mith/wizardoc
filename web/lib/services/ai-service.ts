const trimTrailingSlash = (s: string) => (s.endsWith("/") ? s.slice(0, -1) : s)

const resolveAiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_AI_URL) {
    return trimTrailingSlash(process.env.NEXT_PUBLIC_AI_URL)
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:8100/ai"
  }
  return "/ai"
}

const AI_BASE_URL = resolveAiBaseUrl()

export interface AiGuidanceEvent {
  type: "guidance"
  text: string
}

export interface AiSuggestionEvent {
  type: "suggestion"
  rank: number
  text: string
  rationale: string
  sources: string[]
}

export interface AiDoneEvent {
  type: "done"
}

export interface AiErrorEvent {
  type: "error"
  detail: string
}

export type AiSseEvent = AiGuidanceEvent | AiSuggestionEvent | AiDoneEvent | AiErrorEvent

export interface SuggestParams {
  questionText: string
  questionIdentifier?: string
  previousAnswers: Record<string, string>
  studyMetadata: Record<string, string | null | undefined>
}

export class AiService {
  static async createSession(): Promise<string> {
    const response = await fetch(`${AI_BASE_URL}/sessions`, { method: "POST" })
    if (!response.ok) throw new Error("Failed to create AI session")
    const data = await response.json()
    return data.session_id
  }

  static async uploadDocument(sessionId: string, file: File): Promise<void> {
    const form = new FormData()
    form.append("file", file)
    const response = await fetch(`${AI_BASE_URL}/sessions/${sessionId}/documents`, {
      method: "POST",
      body: form,
    })
    if (!response.ok) {
      const text = await response.text().catch(() => "")
      throw new Error(`Document upload failed: ${text}`)
    }
  }

  static async deleteSession(sessionId: string): Promise<void> {
    await fetch(`${AI_BASE_URL}/sessions/${sessionId}`, { method: "DELETE" }).catch(() => {})
  }

  static async *suggest(sessionId: string, params: SuggestParams): AsyncGenerator<AiSseEvent> {
    const response = await fetch(`${AI_BASE_URL}/sessions/${sessionId}/suggest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_text: params.questionText,
        question_identifier: params.questionIdentifier,
        previous_answers: params.previousAnswers,
        study_metadata: Object.fromEntries(
          Object.entries(params.studyMetadata).filter(([, v]) => v != null)
        ),
      }),
    })

    if (!response.ok) {
      yield { type: "error", detail: `AI service returned ${response.status}` }
      return
    }

    if (!response.body) {
      yield { type: "error", detail: "No response body" }
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // Process complete SSE events (delimited by double newline)
      const parts = buffer.split("\n\n")
      buffer = parts.pop() ?? ""

      for (const part of parts) {
        const event = _parseSseBlock(part)
        if (event) yield event
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      const event = _parseSseBlock(buffer)
      if (event) yield event
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${AI_BASE_URL}/health`, {
        signal: AbortSignal.timeout(3000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}

function _parseSseBlock(block: string): AiSseEvent | null {
  let eventType = ""
  let dataLine = ""

  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) {
      eventType = line.slice(7).trim()
    } else if (line.startsWith("data: ")) {
      dataLine = line.slice(6).trim()
    }
  }

  if (!eventType || !dataLine) return null

  try {
    const payload = JSON.parse(dataLine)
    if (eventType === "guidance") return { type: "guidance", text: payload.text }
    if (eventType === "suggestion") return { type: "suggestion", ...payload }
    if (eventType === "done") return { type: "done" }
    if (eventType === "error") return { type: "error", detail: payload.detail }
  } catch {
    return null
  }

  return null
}
