"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { StudyFormDialog } from "@/components/study-form-dialog"
import {
  AssessmentsEmptyState,
  CompletedAssessmentsSection,
  InProgressAssessmentsSection,
  StudyDetailHeader,
  StudyDetailsCard,
  StudyQuestionPoolCard,
} from "./components"
import { useStudyDetailPage } from "./hooks"

interface StudyDetailPageClientProps {
  studyId: string
}

export function StudyDetailPageClient({ studyId }: StudyDetailPageClientProps) {
  const router = useRouter()
  const {
    assessmentDeleteErrors,
    assessmentsError,
    assessmentsLoading,
    completedAssessments,
    deleteAssessment,
    deleteStudy,
    deletingAssessmentId,
    expandedAssessmentId,
    inProgressAssessments,
    isDeletingStudy,
    isSavingStudy,
    pool,
    poolError,
    poolLoading,
    populateDocx,
    populateErrors,
    populatingAssessmentId,
    renameAssessment,
    renameErrors,
    renamingAssessmentId,
    study,
    studyEditError,
    studyError,
    studyLoading,
    toggleAssessmentExpanded,
    totalAssessments,
    updateStudy,
  } = useStudyDetailPage(studyId)

  const [studyEditOpen, setStudyEditOpen] = useState(false)
  const [studyDeleteOpen, setStudyDeleteOpen] = useState(false)
  const [pendingDeleteAssessmentId, setPendingDeleteAssessmentId] = useState<string | null>(null)

  const handleDeleteStudy = async () => {
    const success = await deleteStudy()
    if (success) {
      setStudyDeleteOpen(false)
      router.push("/my-studies")
    }
  }

  const handleDeleteAssessment = async () => {
    if (!pendingDeleteAssessmentId) return
    await deleteAssessment(pendingDeleteAssessmentId)
    setPendingDeleteAssessmentId(null)
  }

  if (studyLoading || assessmentsLoading) {
    return (
      <div className="container py-8">
        <p>Loading project details...</p>
      </div>
    )
  }

  if (studyError || !study) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Project not found or error loading project</p>
            <Link href="/my-studies" className="mt-4 inline-block">
              <Button>Back to Projects</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (assessmentsError) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading documents: {assessmentsError.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <StudyDetailHeader
        study={study}
        onEditClick={() => setStudyEditOpen(true)}
        onDeleteClick={() => setStudyDeleteOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <StudyDetailsCard study={study} />
          <StudyQuestionPoolCard pool={pool} poolLoading={poolLoading} poolError={poolError} />
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>View and manage documents for this project</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <CompletedAssessmentsSection
              assessments={completedAssessments}
              expandedAssessmentId={expandedAssessmentId}
              onToggleExpand={toggleAssessmentExpanded}
              onPopulateDocx={populateDocx}
              populatingAssessmentId={populatingAssessmentId}
              populateErrors={populateErrors}
              pool={pool}
              poolLoading={poolLoading}
              poolError={poolError}
              onRenameAssessment={renameAssessment}
              renamingAssessmentId={renamingAssessmentId}
              renameErrors={renameErrors}
              onDeleteAssessment={setPendingDeleteAssessmentId}
              deletingAssessmentId={deletingAssessmentId}
              assessmentDeleteErrors={assessmentDeleteErrors}
            />

            <InProgressAssessmentsSection
              assessments={inProgressAssessments}
              onRenameAssessment={renameAssessment}
              renamingAssessmentId={renamingAssessmentId}
              renameErrors={renameErrors}
              onDeleteAssessment={setPendingDeleteAssessmentId}
              deletingAssessmentId={deletingAssessmentId}
              assessmentDeleteErrors={assessmentDeleteErrors}
            />

            {totalAssessments === 0 && <AssessmentsEmptyState />}
          </CardContent>
        </Card>
      </div>

      {study && (
        <StudyFormDialog
          study={study}
          open={studyEditOpen}
          onOpenChange={setStudyEditOpen}
          onSave={updateStudy}
          isSaving={isSavingStudy}
          error={studyEditError}
        />
      )}

      <ConfirmDeleteDialog
        open={studyDeleteOpen}
        onOpenChange={setStudyDeleteOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${study.name}"? This will permanently delete the project and all its documents.`}
        onConfirm={handleDeleteStudy}
        isDeleting={isDeletingStudy}
      />

      <ConfirmDeleteDialog
        open={pendingDeleteAssessmentId !== null}
        onOpenChange={(val) => { if (!val) setPendingDeleteAssessmentId(null) }}
        title="Delete Document"
        description="Are you sure you want to delete this document? This action cannot be undone."
        onConfirm={handleDeleteAssessment}
        isDeleting={deletingAssessmentId !== null}
      />
    </div>
  )
}
