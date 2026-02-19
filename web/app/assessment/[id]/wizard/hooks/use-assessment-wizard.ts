"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAssessmentContext } from "@/hooks/use-assessment"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { AssessmentService } from "@/lib/services/assessment-service"
import { logger } from "@/lib/utils/logger"
import { buildAnswersMapByQuestionId, calculateWizardProgress } from "../domain/wizard"

export function useAssessmentWizard(assessmentId: string) {
  const router = useRouter()
  const { context, loading, error } = useAssessmentContext(assessmentId)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [documentName, setDocumentName] = useState("")
  const [answers, setAnswers] = usePersistedState<Record<number, string>>(
    `assessment-${assessmentId}-answers`,
    {}
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)

  useEffect(() => {
    if (context?.assessment?.status === "in-progress") {
      setCurrentQuestion(context.assessment.answeredQuestions)
    }
  }, [context])

  useEffect(() => {
    if (context?.assessment?.name) {
      setDocumentName(context.assessment.name)
    }
  }, [context?.assessment?.name])

  const totalQuestions = context?.questions.length ?? 0
  const progress = calculateWizardProgress(currentQuestion, totalQuestions)
  const currentQuestionData = context?.questions[currentQuestion]

  const updateCurrentAnswer = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion]: value,
    })
  }

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const renameDocument = async (nextName: string) => {
    const trimmedName = nextName.trim()
    if (!trimmedName) {
      setRenameError("Document name cannot be empty.")
      return false
    }

    setIsRenaming(true)
    setRenameError(null)
    try {
      const updated = await AssessmentService.rename(assessmentId, trimmedName)
      if (!updated) {
        setRenameError("Document not found.")
        return false
      }
      setDocumentName(updated.name)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to rename document"
      setRenameError(message)
      logger.error("Failed to rename document", err)
      return false
    } finally {
      setIsRenaming(false)
    }
  }

  const persistAnswers = async () => {
    if (!context) return
    setIsSaving(true)
    try {
      const answersMap = buildAnswersMapByQuestionId(answers, context.questions)
      await AssessmentService.updateAnswers(assessmentId, answersMap)
      logger.info("Document progress saved", { assessmentId })
      router.push(`/my-studies/${context.study.id}`)
    } catch (err) {
      logger.error("Failed to save document", err)
    } finally {
      setIsSaving(false)
    }
  }

  const goToNextQuestion = async () => {
    if (!context) return

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
      return
    }

    setIsSaving(true)
    try {
      const answersMap = buildAnswersMapByQuestionId(answers, context.questions)
      await AssessmentService.updateAnswers(assessmentId, answersMap)
      await AssessmentService.complete(assessmentId)
      logger.info("Document completed", { assessmentId })
      router.push(`/my-studies/${context.study.id}`)
    } catch (err) {
      logger.error("Failed to complete document", err)
    } finally {
      setIsSaving(false)
    }
  }

  return {
    answers,
    context,
    currentQuestion,
    currentQuestionData,
    documentName,
    error,
    goToNextQuestion,
    goToPreviousQuestion,
    isSaving,
    isRenaming,
    loading,
    progress,
    renameDocument,
    renameError,
    setCurrentQuestion,
    totalQuestions,
    updateCurrentAnswer,
    persistAnswers,
  }
}
