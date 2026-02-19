"use client"

import { useState } from "react"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { CreatePoolFormValues } from "../components"

const EMPTY_CREATE_FORM: CreatePoolFormValues = {
  name: "",
  source: "",
}

export function useQuestionPoolPage() {
  const { pools, loading, error, refresh } = useQuestionPools()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [createForm, setCreateForm] = useState<CreatePoolFormValues>(EMPTY_CREATE_FORM)
  const [actionError, setActionError] = useState<string | null>(null)

  const updateCreateFormField = (field: keyof CreatePoolFormValues, value: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetCreateForm = () => {
    setCreateForm(EMPTY_CREATE_FORM)
    setShowCreateForm(false)
  }

  const createPool = async () => {
    setActionError(null)

    if (!createForm.name.trim() || !createForm.source.trim()) {
      setActionError("Name and source are required to create a template.")
      return
    }

    setCreating(true)
    try {
      await QuestionPoolService.create({
        name: createForm.name.trim(),
        source: createForm.source.trim(),
        questionCount: 0,
        questions: [],
      })
      await refresh()
      resetCreateForm()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const deletePool = async (id: string) => {
    setActionError(null)
    const confirmed = window.confirm("Delete this template? This cannot be undone.")
    if (!confirmed) return

    setDeletingId(id)
    try {
      await QuestionPoolService.delete(id)
      await refresh()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  return {
    actionError,
    createForm,
    createPool,
    creating,
    deletePool,
    deletingId,
    error,
    loading,
    pools,
    resetCreateForm,
    setShowCreateForm,
    showCreateForm,
    updateCreateFormField,
  }
}
