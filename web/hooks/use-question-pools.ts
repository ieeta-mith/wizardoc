"use client"

import { useState, useEffect } from "react"
import type { QuestionPool } from "@/lib/types"
import { QuestionPoolService } from "@/lib/services/question-pool-service"

export function useQuestionPools() {
  const [pools, setPools] = useState<QuestionPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    QuestionPoolService.getAll()
      .then(setPools)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await QuestionPoolService.getAll()
      setPools(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { pools, loading, error, refresh }
}

export function useQuestionPool(id: string) {
  const [pool, setPool] = useState<QuestionPool | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    QuestionPoolService.getById(id)
      .then(setPool)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await QuestionPoolService.getById(id)
      setPool(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { pool, loading, error, refresh }
}
