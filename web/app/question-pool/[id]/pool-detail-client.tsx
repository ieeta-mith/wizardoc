"use client"

import { useRef } from "react"
import type { QuestionPool } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActionErrorAlert } from "../components"
import { AddQuestionForm, DocxFilePanel, PoolDetailHeader, PoolDetailToolbar, QuestionsTableCard } from "./components"
import { usePoolDetail } from "./hooks"

export function PoolDetailClient({ pool }: { pool: QuestionPool }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const docxInputRef = useRef<HTMLInputElement | null>(null)
  const {
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
    showAddForm,
    tableColumns,
    toggleAddForm,
    updateQuestionFormField,
    uploadDocx,
    uploadingDocx,
  } = usePoolDetail(pool)

  const handleBatchImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    await importBatchCsv(file)
  }

  const handleDocxUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    await uploadDocx(file)
  }

  const handleAddQuestion = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await addQuestion()
  }

  return (
    <>
      <PoolDetailHeader name={currentPool.name} source={currentPool.source} questionCount={currentPool.questionCount} />

      {actionError && (
        <div className="mb-6">
          <ActionErrorAlert message={actionError} />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions</CardTitle>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleBatchImport}
            />
            <input
              ref={docxInputRef}
              type="file"
              accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleDocxUpload}
            />
            <PoolDetailToolbar
              importing={importing}
              onBatchImportClick={() => fileInputRef.current?.click()}
              onToggleAddForm={toggleAddForm}
            />
          </div>
        </CardHeader>
        <CardContent>
          <DocxFilePanel
            file={currentPool.docxFile}
            uploading={uploadingDocx}
            onUploadClick={() => docxInputRef.current?.click()}
          />

          {showAddForm && (
            <AddQuestionForm
              values={questionForm}
              adding={adding}
              onFieldChange={updateQuestionFormField}
              onSubmit={handleAddQuestion}
              onCancel={closeQuestionForm}
            />
          )}

          <QuestionsTableCard
            columns={tableColumns}
            questions={questions}
            deletingId={deletingId}
            onDeleteQuestion={deleteQuestion}
          />
        </CardContent>
      </Card>
    </>
  )
}
