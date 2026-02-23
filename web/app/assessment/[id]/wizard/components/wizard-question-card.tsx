import { CircleHelp, ChevronLeft, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface WizardQuestionCardProps {
  currentQuestion: number
  totalQuestions: number
  questionText?: string
  questionInfo?: string
  answer: string
  isSaving: boolean
  onAnswerChange: (value: string) => void
  onPrevious: () => void
  onNext: () => void
  onSave: () => void
}

export function WizardQuestionCard({
  currentQuestion,
  totalQuestions,
  questionText,
  questionInfo,
  answer,
  isSaving,
  onAnswerChange,
  onPrevious,
  onNext,
  onSave,
}: WizardQuestionCardProps) {
  const normalizedQuestionInfo = questionInfo?.trim()

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
          <span className="block text-sm font-normal text-muted-foreground mt-2">{questionText}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          placeholder="Enter your answer here..."
          value={answer}
          onChange={(event) => onAnswerChange(event.target.value)}
          rows={8}
          className="resize-none"
        />

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
