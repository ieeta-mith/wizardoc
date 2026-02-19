import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface WizardQuestionCardProps {
  currentQuestion: number
  totalQuestions: number
  questionText?: string
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
  answer,
  isSaving,
  onAnswerChange,
  onPrevious,
  onNext,
  onSave,
}: WizardQuestionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Question {currentQuestion + 1}
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
              "Complete Assessment"
            )}
          </Button>
          <Button onClick={onSave} variant="outline" className="gap-2 bg-transparent" disabled={isSaving}>
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Progress"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
