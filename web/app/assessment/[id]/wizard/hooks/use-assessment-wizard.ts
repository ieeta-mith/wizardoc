"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAssessmentContext } from "@/hooks/use-assessment"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { AssessmentService } from "@/lib/services/assessment-service"
import type { AnswerProvenance } from "@/lib/types"
import { logger } from "@/lib/utils/logger"
import {
  buildAnswersByQuestionIndex,
  buildAnswersMapByQuestionId,
  calculateWizardProgress,
} from "../domain/wizard"

export function useAssessmentWizard(assessmentId: string) {
  const router = useRouter()
  const { context, loading, error } = useAssessmentContext(assessmentId)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [documentName, setDocumentName] = useState("")
  const [answers, setAnswers] = usePersistedState<Record<number, string>>(
    `assessment-${assessmentId}-answers`,
    {}
  )
  const [provenance, setProvenance] = useState<Record<number, AnswerProvenance>>({})
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

  useEffect(() => {
    if (!context) return

    const persistedAnswerCount = Object.keys(answers).length
    if (persistedAnswerCount > 0) return

    setAnswers(buildAnswersByQuestionIndex(context.assessment.answers ?? {}, context.questions))
  }, [answers, context, setAnswers])

  const totalQuestions = context?.questions.length ?? 0
  const progress = calculateWizardProgress(currentQuestion, totalQuestions)
  const currentQuestionData = context?.questions[currentQuestion]

  const updateCurrentAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }))
  }

  const setAnswerProvenance = (questionIndex: number, prov: AnswerProvenance) => {
    setProvenance((prev) => ({ ...prev, [questionIndex]: prov }))
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

  const _buildProvenanceMap = (): Record<string, AnswerProvenance> => {
    if (!context) return {}
    return Object.entries(provenance).reduce(
      (acc, [indexStr, prov]) => {
        const question = context.questions[Number(indexStr)]
        if (question) acc[question.id] = prov
        return acc
      },
      {} as Record<string, AnswerProvenance>
    )
  }

  const persistAnswers = async () => {
    if (!context) return
    setIsSaving(true)
    try {
      const answersMap = buildAnswersMapByQuestionId(answers, context.questions)
      await AssessmentService.saveDraft(assessmentId, answersMap, _buildProvenanceMap())
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
      await AssessmentService.updateAnswers(assessmentId, answersMap, {
        answerProvenance: _buildProvenanceMap(),
      })
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
    provenance,
    renameDocument,
    renameError,
    setAnswerProvenance,
    setCurrentQuestion,
    totalQuestions,
    updateCurrentAnswer,
    persistAnswers,
  }
}
