"use client"

import { useAssessmentWizard } from "./hooks"
import { WizardErrorState, WizardHeader, WizardQuestionCard, WizardQuestionMetadata } from "./components"

interface WizardPageClientProps {
  assessmentId: string
}

export function WizardPageClient({ assessmentId }: WizardPageClientProps) {
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
    renameDocument,
    renameError,
    totalQuestions,
    updateCurrentAnswer,
    persistAnswers,
  } = useAssessmentWizard(assessmentId)

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

  return (
    <div className="container max-w-4xl py-8">
      <WizardHeader
        projectId={context.study.id}
        projectName={context.study.name}
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
        questionText={currentQuestionData.text}
        answer={answers[currentQuestion] || ""}
        isSaving={isSaving}
        onAnswerChange={updateCurrentAnswer}
        onPrevious={goToPreviousQuestion}
        onNext={goToNextQuestion}
        onSave={persistAnswers}
      />

      <WizardQuestionMetadata question={currentQuestionData} />
    </div>
  )
}
