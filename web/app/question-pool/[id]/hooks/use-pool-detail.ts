"use client"

import { useEffect, useMemo, useState } from "react"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { Question, QuestionPool } from "@/lib/types"
import { buildQuestionTableColumns, getObjectValue, parseCsvQuestions, toImportQuestionPayload } from "../../domain"
import type { QuestionFormValues } from "../components"

const EMPTY_QUESTION_FORM: QuestionFormValues = {
  identifier: "",
  text: "",
  domain: "",
  riskType: "",
  isoReference: "",
}

export function usePoolDetail(pool: QuestionPool) {
  const [currentPool, setCurrentPool] = useState(pool)
  const [questions, setQuestions] = useState(pool.questions || [])
  const [showAddForm, setShowAddForm] = useState(false)
  const [questionForm, setQuestionForm] = useState<QuestionFormValues>(EMPTY_QUESTION_FORM)
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)
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

  const updateQuestionFormField = (field: keyof QuestionFormValues, value: string) => {
    setQuestionForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetQuestionForm = () => {
    setQuestionForm(EMPTY_QUESTION_FORM)
  }

  const closeQuestionForm = () => {
    resetQuestionForm()
    setShowAddForm(false)
  }

  const toggleAddForm = () => {
    setActionError(null)
    setShowAddForm((prev) => !prev)
  }

  const deleteQuestion = async (questionId: string) => {
    setActionError(null)
    setDeletingId(questionId)
    try {
      const updated = await QuestionPoolService.deleteQuestion(currentPool.id, questionId)
      if (!updated) {
        setActionError("Pool not found on server.")
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

  const addQuestion = async () => {
    setActionError(null)
    if (
      !questionForm.identifier.trim() ||
      !questionForm.text.trim() ||
      !questionForm.domain.trim() ||
      !questionForm.riskType.trim() ||
      !questionForm.isoReference.trim()
    ) {
      setActionError("All fields are required to add a question.")
      return
    }

    setAdding(true)
    try {
      const updated = await QuestionPoolService.addQuestion(currentPool.id, {
        identifier: questionForm.identifier.trim(),
        text: questionForm.text.trim(),
        domain: questionForm.domain.trim(),
        riskType: questionForm.riskType.trim(),
        isoReference: questionForm.isoReference.trim(),
      })
      if (!updated) {
        setActionError("Pool not found on server.")
        return
      }
      setCurrentPool(updated)
      setQuestions(updated.questions)
      closeQuestionForm()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setAdding(false)
    }
  }

  const uploadDocx = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setActionError("Please select a .docx file.")
      return
    }

    setActionError(null)
    setUploadingDocx(true)
    try {
      const updated = await QuestionPoolService.uploadDocx(currentPool.id, file)
      if (!updated) {
        setActionError("Pool not found on server.")
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
          setActionError("Pool not found on server.")
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
      closeQuestionForm()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setImporting(false)
    }
  }

  return {
    actionError,
    addQuestion,
    adding,
    closeQuestionForm,
    currentPool,
    deleteQuestion,
    deletingId,
    importBatchCsv,
    importing,
    questionForm,
    questions,
    setActionError,
    setShowAddForm,
    showAddForm,
    tableColumns,
    toggleAddForm,
    updateQuestionFormField,
    uploadDocx,
    uploadingDocx,
  }
}
