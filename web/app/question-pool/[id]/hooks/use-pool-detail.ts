"use client"

import { useEffect, useMemo, useState } from "react"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { Question, QuestionPool } from "@/lib/types"
import { buildQuestionTableColumns, getObjectValue, parseCsvQuestions, toImportQuestionPayload } from "../../domain"

export function usePoolDetail(pool: QuestionPool, canManageTemplates: boolean) {
  const [currentPool, setCurrentPool] = useState(pool)
  const [questions, setQuestions] = useState(pool.questions || [])
  const [importing, setImporting] = useState(false)
  const [clearingEntries, setClearingEntries] = useState(false)
  const [uploadingDocx, setUploadingDocx] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPool(pool)
    setQuestions(pool.questions || [])
    setActionError(null)
  }, [pool])

  const tableColumns = useMemo(
    () => buildQuestionTableColumns(questions, getObjectValue(currentPool, "headers")),
    [currentPool, questions]
  )

  const deleteQuestion = async (questionId: string) => {
    setActionError(null)

    if (!canManageTemplates) {
      setActionError("Only admins can remove questions from templates.")
      return
    }

    setDeletingId(questionId)
    try {
      const updated = await QuestionPoolService.deleteQuestion(currentPool.id, questionId)
      if (!updated) {
        setActionError("Template not found on server.")
        return
      }
      setCurrentPool(updated)
      setQuestions(updated.questions)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const uploadDocx = async (file: File) => {
    if (!canManageTemplates) {
      setActionError("Only admins can upload DOCX templates.")
      return
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      setActionError("Please select a .docx file.")
      return
    }

    setActionError(null)
    setUploadingDocx(true)
    try {
      const updated = await QuestionPoolService.uploadDocx(currentPool.id, file)
      if (!updated) {
        setActionError("Template not found on server.")
        return
      }
      setCurrentPool(updated)
      setQuestions(updated.questions)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setUploadingDocx(false)
    }
  }

  const importBatchCsv = async (file: File) => {
    setActionError(null)

    if (!canManageTemplates) {
      setActionError("Only admins can import questions into templates.")
      return
    }

    setImporting(true)
    try {
      const csvText = await file.text()
      const parsedQuestions = parseCsvQuestions(csvText)
      if (parsedQuestions.length === 0) {
        setActionError("No questions found in CSV.")
        return
      }

      let updatedPool = currentPool
      let importedCount = 0

      for (const row of parsedQuestions) {
        const payload = toImportQuestionPayload(row)
        if (!payload) continue

        const next = await QuestionPoolService.addQuestion(updatedPool.id, payload as Omit<Question, "id">)
        if (!next) {
          setActionError("Template not found on server.")
          return
        }
        updatedPool = next
        importedCount += 1
      }

      if (importedCount === 0) {
        setActionError("No valid rows found in CSV. Required columns: identifier and text.")
        return
      }

      setCurrentPool(updatedPool)
      setQuestions(updatedPool.questions)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setImporting(false)
    }
  }

  const clearEntries = async () => {
    if (!canManageTemplates) {
      setActionError("Only admins can clear template questions.")
      return
    }

    const confirmed = window.confirm("Clear all questions from this template? This action cannot be undone.")
    if (!confirmed) return

    setActionError(null)
    setClearingEntries(true)
    try {
      const updated = await QuestionPoolService.clearEntries(currentPool.id)
      if (!updated) {
        setActionError("Template not found on server.")
        return
      }
      setCurrentPool(updated)
      setQuestions(updated.questions)
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setClearingEntries(false)
    }
  }

  return {
    actionError,
    clearEntries,
    clearingEntries,
    currentPool,
    deleteQuestion,
    deletingId,
    importBatchCsv,
    importing,
    questions,
    tableColumns,
    uploadDocx,
    uploadingDocx,
  }
}
