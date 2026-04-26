"use client"

import { useState } from "react"
import { Bot, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AiSuggestionEvent } from "@/lib/services/ai-service"
import type { AnswerProvenance } from "@/lib/types"

interface WizardAiPanelProps {
  guidance: string
  suggestions: AiSuggestionEvent[]
  dismissed: Set<number>
  error: string | null
  onAccept: (text: string, provenance: AnswerProvenance) => void
  onDismiss: (rank: number) => void
}

export function WizardAiPanel({ guidance, suggestions, dismissed, error, onAccept, onDismiss }: WizardAiPanelProps) {
  const [expanded, setExpanded] = useState(true)
  const hasContent = !!guidance || suggestions.length > 0

  return (
    <Card className="border-dashed border-muted-foreground/30 bg-muted/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Bot className="h-4 w-4" />
            AI Assistance
          </CardTitle>
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
      </CardHeader>

      {error && (
        <CardContent className="pt-0">
          <p className="text-xs text-destructive">{error}</p>
        </CardContent>
      )}

      {hasContent && expanded && (
        <CardContent className="pt-0 space-y-3">
          {guidance && (
            <div className="text-xs text-muted-foreground bg-muted rounded p-2">
              {guidance}
            </div>
          )}
          {suggestions.map((s) =>
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
                    onClick={() => onAccept(s.text, "ai")}
                  >
                    Accept
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => onAccept(s.text, "ai-edited")}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => onDismiss(s.rank)}
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
