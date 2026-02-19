"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ActionErrorAlert,
  CreatePoolForm,
  QuestionPoolList,
  QuestionPoolPageHeader,
} from "@/app/question-pool/components"
import { useQuestionPoolPage } from "@/app/question-pool/hooks"

export function QuestionPoolPageClient() {
  const {
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
  } = useQuestionPoolPage()

  const handleCreatePool = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await createPool()
  }

  if (loading) {
    return (
      <div className="container py-8">
        <QuestionPoolPageHeader title="Document Template Manager" subtitle="Loading templates..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading templates: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <QuestionPoolPageHeader
        title="Document Template Manager"
        subtitle="Manage your reusable templates and mapped question definitions"
      />

      <div className="space-y-4">
        {actionError && <ActionErrorAlert message={actionError} />}

        <QuestionPoolList pools={pools} deletingId={deletingId} onDelete={deletePool} />

        {showCreateForm ? (
          <CreatePoolForm
            values={createForm}
            creating={creating}
            onChange={updateCreateFormField}
            onSubmit={handleCreatePool}
            onCancel={resetCreateForm}
          />
        ) : (
          <div className="flex justify-center pt-4">
            <Button size="lg" className="gap-2" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4" />
              Create New Template
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
