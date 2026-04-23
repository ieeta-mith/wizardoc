import { useEffect, useRef, useState } from "react"
import { CircleHelp, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import type { AnswerProvenance, Question } from "@/lib/types"
import type { SuggestParams } from "@/lib/services/ai-service"
import { WizardTableInput } from "./wizard-table-input"
import { WizardAiPanel } from "./wizard-ai-panel"

interface WizardQuestionCardProps {
  currentQuestion: number
  totalQuestions: number
  question?: Question
  answer: string
  isSaving: boolean
  currentProvenance?: AnswerProvenance
  onAnswerChange: (value: string) => void
  onProvenanceChange: (prov: AnswerProvenance) => void
  onPrevious: () => void
  onNext: () => void
  onSave: () => void
  // AI assistance (optional)
  aiSessionId?: string | null
  previousAnswers?: Record<string, string>
  studyMetadata?: Record<string, string | null | undefined>
}

export function WizardQuestionCard({
  currentQuestion,
  totalQuestions,
  question,
  answer,
  isSaving,
  currentProvenance,
  onAnswerChange,
  onProvenanceChange,
  onPrevious,
  onNext,
  onSave,
  aiSessionId,
  previousAnswers = {},
  studyMetadata = {},
}: WizardQuestionCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [draftAnswer, setDraftAnswer] = useState(answer)
  const normalizedQuestionInfo = question?.info?.trim()
  const isTable = question?.type === "table"
  const rawColumns = question?.columns ?? []
  const columns = Array.isArray(rawColumns)
    ? rawColumns
    : (() => { try { return JSON.parse(rawColumns as string) } catch { return [] } })()

  useEffect(() => {
    setDraftAnswer(answer)
  }, [answer, question?.id])

  const handleAnswerChange = (value: string) => {
    setDraftAnswer(value)
    onAnswerChange(value)
  }

  const suggestParams: SuggestParams | null =
    aiSessionId && question && !isTable
      ? {
          questionText: question.text,
          questionIdentifier: question.identifier,
          previousAnswers,
          studyMetadata,
          currentDraft: draftAnswer || undefined,
        }
      : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          <span className="inline-flex items-center gap-2">
            <span>Question {currentQuestion + 1}</span>
            {normalizedQuestionInfo ? (
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Show question details"
                  className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CircleHelp className="h-4 w-4" />
                </button>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-80 -translate-x-1/2 rounded-md border bg-popover px-3 py-2 text-xs font-normal text-popover-foreground shadow-md group-hover:block group-focus-within:block"
                >
                  {normalizedQuestionInfo}
                </span>
              </span>
            ) : null}
          </span>
          <span className="block text-sm font-normal text-muted-foreground mt-2">{question?.text}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isTable && columns.length > 0 ? (
          <WizardTableInput columns={columns} value={draftAnswer} onChange={handleAnswerChange} />
        ) : (
          <Textarea
            ref={textareaRef}
            placeholder="Enter your answer here..."
            value={draftAnswer}
            onChange={(event) => {
              handleAnswerChange(event.target.value)
              // Preserve AI provenance if the user edits an AI-accepted answer
              onProvenanceChange(currentProvenance === "ai" ? "ai-edited" : "user")
            }}
            rows={8}
            className="resize-none"
          />
        )}

        {suggestParams && (
          <WizardAiPanel
            key={question?.id}
            sessionId={aiSessionId!}
            params={suggestParams}
            onAccept={(text, prov) => {
              setDraftAnswer(text)
              onAnswerChange(text)
              onProvenanceChange(prov)
              requestAnimationFrame(() => {
                textareaRef.current?.focus()
                textareaRef.current?.setSelectionRange(text.length, text.length)
              })
            }}
          />
        )}

        <div className="flex gap-3">
          <Button onClick={onPrevious} variant="outline" disabled={currentQuestion === 0} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext} className="flex-1" disabled={isSaving}>
            {currentQuestion < totalQuestions - 1 ? (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            ) : isSaving ? (
              "Completing..."
            ) : (
              "Complete Document"
            )}
          </Button>
          <Button onClick={onSave} variant="outline" className="gap-2 bg-transparent" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
