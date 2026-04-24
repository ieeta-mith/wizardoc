"use client"

import { useState, useEffect, useCallback } from "react"
import type { Assessment, QuestionPool, Study } from "@/lib/types"
import { StudyService } from "@/lib/services/study-service"
import { AssessmentService } from "@/lib/services/assessment-service"
import { QuestionPoolService } from "@/lib/services/question-pool-service"

export interface DocumentItem {
  assessment: Assessment
  study: Study
  pool: QuestionPool | null
}

export function useDocuments() {
  const [items, setItems] = useState<DocumentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const studies = await StudyService.getAll()
      const poolIds = Array.from(new Set(studies.map((study) => study.poolId).filter(Boolean)))
      const poolEntries = await Promise.all(
        poolIds.map(async (poolId) => {
          const pool = await QuestionPoolService.getById(poolId).catch(() => null)
          return [poolId, pool] as const
        })
      )
      const poolsById = new Map(poolEntries)

      const groups = await Promise.all(
        studies.map(async (study) => {
          const assessments = await AssessmentService.getByStudyId(study.id)
          return assessments.map((assessment): DocumentItem => ({
            assessment,
            study,
            pool: poolsById.get(study.poolId) ?? null,
          }))
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
