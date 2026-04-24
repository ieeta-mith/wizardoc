"use client"

import { useState, useEffect, useCallback } from "react"
import type { Assessment, Study } from "@/lib/types"
import { StudyService } from "@/lib/services/study-service"
import { AssessmentService } from "@/lib/services/assessment-service"

export interface DocumentItem {
  assessment: Assessment
  study: Study
}

export function useDocuments() {
  const [items, setItems] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const studies = await StudyService.getAll()
      const groups = await Promise.all(
        studies.map(async (study) => {
          const assessments = await AssessmentService.getByStudyId(study.id)
          return assessments.map((assessment): DocumentItem => ({ assessment, study }))
        })
      )
      const flat = groups
        .flat()
        .sort((a, b) => b.assessment.updatedAt.getTime() - a.assessment.updatedAt.getTime())
      setItems(flat)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return { items, loading, error, refresh: fetchAll }
}
