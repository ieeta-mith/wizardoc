"use client"

import { useState, useEffect } from "react"
import type { Assessment } from "@/lib/types"
import { AssessmentService, type AssessmentContext } from "@/lib/services/assessment-service"

export function useAssessment(id: string) {
  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    AssessmentService.getById(id)
      .then(setAssessment)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  const updateAnswers = async (answers: Record<string, string>) => {
    try {
      const updated = await AssessmentService.updateAnswers(id, answers)
      if (updated) {
        setAssessment(updated)
      }
    } catch (err) {
      setError(err as Error)
    }
  }

  const complete = async () => {
    try {
      const completed = await AssessmentService.complete(id)
      if (completed) {
        setAssessment(completed)
      }
      return completed
    } catch (err) {
      setError(err as Error)
      return null
    }
  }

  return { assessment, loading, error, updateAnswers, complete }
}

export function useAssessmentContext(id: string) {
  const [context, setContext] = useState<AssessmentContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    AssessmentService.getContextById(id)
      .then(setContext)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  return { context, loading, error }
}

export function useAssessmentsByStudy(studyId: string) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    AssessmentService.getByStudyId(studyId)
      .then(setAssessments)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [studyId])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await AssessmentService.getByStudyId(studyId)
      setAssessments(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { assessments, loading, error, refresh }
}
