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
  const [answers, setAnswers] = usePersistedState<Record<number, string>>(
    `assessment-${assessmentId}-answers`,
    {}
  )
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (context?.assessment?.status === "in-progress") {
      setCurrentQuestion(context.assessment.answeredQuestions)
    }
  }, [context])

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
    error,
    goToNextQuestion,
    goToPreviousQuestion,
    isSaving,
    loading,
    progress,
    setCurrentQuestion,
    totalQuestions,
    updateCurrentAnswer,
    persistAnswers,
  }
}
