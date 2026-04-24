"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useAssessmentWizard } from "./hooks"
import {
  WizardAiSetup,
  WizardErrorState,
  WizardHeader,
  WizardQuestionCard,
  WizardQuestionMetadata,
} from "./components"
import { AiService } from "@/lib/services/ai-service"

interface WizardPageClientProps {
  assessmentId: string
}

type Phase = "setup" | "wizard"

export function WizardPageClient({ assessmentId }: WizardPageClientProps) {
  const [phase, setPhase] = useState<Phase>("setup")
  const [aiSessionId, setAiSessionId] = useState<string | null>(null)
  const [aiUnavailable, setAiUnavailable] = useState(false)

  const {
    answers,
    context,
    currentQuestion,
    currentQuestionData,
    documentName,
    error,
    goToNextQuestion,
    goToPreviousQuestion,
    isRenaming,
    isSaving,
    loading,
    progress,
    provenance,
    renameDocument,
    renameError,
    setAnswerProvenance,
    totalQuestions,
    updateCurrentAnswer,
    persistAnswers,
  } = useAssessmentWizard(assessmentId)

  // Destroy AI session when the wizard unmounts
  useEffect(() => {
    return () => {
      if (aiSessionId) AiService.deleteSession(aiSessionId)
    }
  }, [aiSessionId])

  // Watch for AI service going down mid-session
  useEffect(() => {
    if (!aiSessionId) return
    let cancelled = false

    const poll = async () => {
      const ok = await AiService.checkHealth()
      if (!cancelled && !ok) setAiUnavailable(true)
    }
    const id = setInterval(poll, 30_000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [aiSessionId])

  const handleSetupConfirm = (sessionId: string | null) => {
    setAiSessionId(sessionId)
    setPhase("wizard")
  }

  if (phase === "setup") {
    return <WizardAiSetup onConfirm={handleSetupConfirm} />
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <p>Loading document...</p>
      </div>
    )
  }

  if (error || !context || !currentQuestionData) {
    return <WizardErrorState />
  }

  // Build a map of question-text answers for AI context (previous questions only)
  const previousAnswers: Record<string, string> = {}
  context.questions.slice(0, currentQuestion).forEach((q, i) => {
    if (answers[i]) previousAnswers[q.text] = answers[i]
  })

  const studyMetadata: Record<string, string | null | undefined> = {
    name: context.study.name,
    category: context.study.category,
    studyQuestion: context.study.studyQuestion,
  }

  return (
    <div className="container max-w-4xl py-8">
      {aiUnavailable && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          AI-assist unavailable — continuing without suggestions.
        </div>
      )}

      <WizardHeader
        templateName={context.pool.name}
        documentName={documentName}
        isRenaming={isRenaming}
        renameError={renameError}
        onRenameDocument={renameDocument}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        progress={progress}
      />

      <WizardQuestionCard
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        question={currentQuestionData}
        answer={answers[currentQuestion] || ""}
        isSaving={isSaving}
        currentProvenance={provenance[currentQuestion]}
        onAnswerChange={updateCurrentAnswer}
        onProvenanceChange={(prov) => setAnswerProvenance(currentQuestion, prov)}
        onPrevious={goToPreviousQuestion}
        onNext={goToNextQuestion}
        onSave={persistAnswers}
        aiSessionId={aiUnavailable ? null : aiSessionId}
        previousAnswers={previousAnswers}
        studyMetadata={studyMetadata}
      />

      <WizardQuestionMetadata question={currentQuestionData} />
    </div>
  )
}
