"use client"

import { useState } from "react"
import { Bot, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AiService, type AiSuggestionEvent, type SuggestParams } from "@/lib/services/ai-service"
import type { AnswerProvenance } from "@/lib/types"

interface WizardAiPanelProps {
  sessionId: string
  params: SuggestParams
  onAccept: (text: string, provenance: AnswerProvenance) => void
}

interface SuggestionState {
  guidance: string
  suggestions: AiSuggestionEvent[]
  loading: boolean
  error: string | null
  done: boolean
}

const initialState: SuggestionState = {
  guidance: "",
  suggestions: [],
  loading: false,
  error: null,
  done: false,
}

export function WizardAiPanel({ sessionId, params, onAccept }: WizardAiPanelProps) {
  const [state, setState] = useState<SuggestionState>(initialState)
  const [expanded, setExpanded] = useState(true)
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  const fetchSuggestion = async () => {
    setState({ ...initialState, loading: true })
    setDismissed(new Set())

    try {
      for await (const event of AiService.suggest(sessionId, params)) {
        if (event.type === "guidance") {
          setState((prev) => ({ ...prev, guidance: event.text }))
        } else if (event.type === "suggestion") {
          setState((prev) => ({ ...prev, suggestions: [...prev.suggestions, event] }))
        } else if (event.type === "done") {
          setState((prev) => ({ ...prev, loading: false, done: true }))
        } else if (event.type === "error") {
          setState((prev) => ({ ...prev, loading: false, error: event.detail }))
        }
      }
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Failed to fetch suggestion." }))
    }
  }

  const hasContent = state.guidance || state.suggestions.length > 0

  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Bot className="h-4 w-4" />
            AI Assistance
          </CardTitle>
          <div className="flex items-center gap-2">
            {!state.loading && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1"
                onClick={fetchSuggestion}
              >
                <Sparkles className="h-3 w-3" />
                {hasContent ? "Re-suggest" : "Suggest answer"}
              </Button>
            )}
            {state.loading && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Thinking…
              </span>
            )}
            {hasContent && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={() => setExpanded((v) => !v)}
                aria-label={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {state.error && (
        <CardContent className="pt-0">
          <p className="text-xs text-destructive">{state.error}</p>
        </CardContent>
      )}

      {hasContent && expanded && (
        <CardContent className="pt-0 space-y-3">
          {state.guidance && (
            <div className="text-xs text-muted-foreground bg-muted rounded p-2">
              {state.guidance}
            </div>
          )}

          {state.suggestions.map((s) =>
            dismissed.has(s.rank) ? null : (
              <div key={s.rank} className="border rounded p-3 space-y-2 text-sm bg-background">
                <p className="leading-relaxed">{s.text}</p>
                {s.rationale && (
                  <p className="text-xs text-muted-foreground italic">{s.rationale}</p>
                )}
                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    className="h-7 text-xs"
                    onClick={() => {
                      onAccept(s.text, "ai")
                      setState(initialState)
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      onAccept(s.text, "ai-edited")
                      setState(initialState)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => setDismissed((prev) => new Set(prev).add(s.rank))}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )
          )}
        </CardContent>
      )}
    </Card>
  )
}
