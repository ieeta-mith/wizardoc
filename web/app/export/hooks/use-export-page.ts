"use client"

import { useEffect, useMemo, useState } from "react"
import React from "react"
import { pdf } from "@react-pdf/renderer"
import { AssessmentPDFDocument } from "@/lib/pdf-generator"
import { AssessmentService } from "@/lib/services/assessment-service"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { Assessment, QuestionPool, Study } from "@/lib/types"
import { buildAssessmentCsv, buildAssessmentJson, buildAssessmentStats, buildDomainData, buildRiskTypeData, downloadBlob } from "../domain"

export function useExportPage(assessmentId: string | null) {
  const [study, setStudy] = useState<Study | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [questionPools, setQuestionPools] = useState<QuestionPool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!assessmentId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [context, poolsData] = await Promise.all([
          AssessmentService.getContextById(assessmentId),
          QuestionPoolService.getAll(),
        ])

        if (context) {
          setStudy(context.study)
          const assessmentsData = await AssessmentService.getByStudyId(context.study.id)
          setAssessments(assessmentsData)
        } else {
          setStudy(null)
          setAssessments([])
        }

        setQuestionPools(poolsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [assessmentId])

  const domainData = useMemo(() => buildDomainData(questionPools), [questionPools])
  const riskTypeData = useMemo(() => buildRiskTypeData(questionPools), [questionPools])
  const stats = useMemo(() => buildAssessmentStats(assessments), [assessments])

  const exportAssessment = async (targetAssessmentId: string, format: "pdf" | "csv" | "json") => {
    const assessment = assessments.find((entry) => entry.id === targetAssessmentId)
    if (!assessment) return

    const timestamp = Date.now()

    if (format === "json") {
      const content = buildAssessmentJson(assessment, study)
      const blob = new Blob([content], { type: "application/json" })
      downloadBlob(blob, `document-${targetAssessmentId}-${timestamp}.json`)
      return
    }

    if (format === "csv") {
      const content = buildAssessmentCsv(assessment, questionPools)
      const blob = new Blob([content], { type: "text/csv" })
      downloadBlob(blob, `document-${targetAssessmentId}-${timestamp}.csv`)
      return
    }

    const pdfDoc = React.createElement(AssessmentPDFDocument, { assessment, study, questionPools })
    const blob = await pdf(pdfDoc as unknown as Parameters<typeof pdf>[0]).toBlob()
    downloadBlob(blob, `document-${targetAssessmentId}-${timestamp}.pdf`)
  }

  return {
    assessments,
    domainData,
    exportAssessment,
    loading,
    questionPools,
    riskTypeData,
    stats,
    study,
  }
}
