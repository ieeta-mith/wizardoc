"use client"

import { useState, useEffect, useCallback } from "react"
import type { Study } from "@/lib/types"
import { StudyService } from "@/lib/services/study-service"

export function useStudies() {
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    StudyService.getAll()
      .then(setStudies)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await StudyService.getAll()
      setStudies(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { studies, loading, error, refresh }
}

export function useStudy(id: string) {
  const [study, setStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchStudy = useCallback(async () => {
    setLoading(true)
    try {
      const data = await StudyService.getById(id)
      setStudy(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchStudy()
  }, [fetchStudy])

  return { study, loading, error, refresh: fetchStudy }
}
