"use client"

import { useEffect, useState } from "react"
import { useAssessmentsByStudy } from "@/hooks/use-assessment"
import { useStudy } from "@/hooks/use-studies"
import { DocxPopulationService } from "@/lib/services/docx-population-service"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { QuestionPool } from "@/lib/types"
import { triggerDownload } from "../domain"

export function useStudyDetailPage(studyId: string) {
  const { study, loading: studyLoading, error: studyError } = useStudy(studyId)
  const { assessments, loading: assessmentsLoading, error: assessmentsError } = useAssessmentsByStudy(studyId)
  const [pool, setPool] = useState<QuestionPool | null>(null)
  const [poolLoading, setPoolLoading] = useState(false)
  const [poolError, setPoolError] = useState<Error | null>(null)
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null)
  const [populatingAssessmentId, setPopulatingAssessmentId] = useState<string | null>(null)
  const [populateErrors, setPopulateErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!study?.poolId) {
      setPool(null)
      setPoolLoading(false)
      setPoolError(null)
      return
    }

    let active = true
    setPool(null)
    setPoolLoading(true)
    setPoolError(null)

    QuestionPoolService.getById(study.poolId)
      .then((data) => {
        if (!active) return
        setPool(data)
      })
      .catch((err) => {
        if (!active) return
        setPoolError(err as Error)
      })
      .finally(() => {
        if (!active) return
        setPoolLoading(false)
      })

    return () => {
      active = false
    }
  }, [study?.poolId])

  const completedAssessments = assessments.filter((assessment) => assessment.status === "completed")
  const inProgressAssessments = assessments.filter((assessment) => assessment.status === "in-progress")

  const toggleAssessmentExpanded = (assessmentId: string) => {
    setExpandedAssessmentId((current) => (current === assessmentId ? null : assessmentId))
  }

  const populateDocx = async (assessmentId: string) => {
    setPopulatingAssessmentId(assessmentId)
    setPopulateErrors((prev) => ({ ...prev, [assessmentId]: "" }))
    try {
      const { blob, filename } = await DocxPopulationService.populateAssessmentDocx(assessmentId)
      triggerDownload(blob, filename)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate DOCX"
      setPopulateErrors((prev) => ({ ...prev, [assessmentId]: message }))
    } finally {
      setPopulatingAssessmentId(null)
    }
  }

  return {
    assessmentsError,
    assessmentsLoading,
    completedAssessments,
    expandedAssessmentId,
    inProgressAssessments,
    pool,
    poolError,
    poolLoading,
    populateDocx,
    populateErrors,
    populatingAssessmentId,
    study,
    studyError,
    studyLoading,
    toggleAssessmentExpanded,
    totalAssessments: assessments.length,
  }
}
