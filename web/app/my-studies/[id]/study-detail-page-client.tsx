"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AssessmentsEmptyState, CompletedAssessmentsSection, InProgressAssessmentsSection, StudyDetailHeader, StudyDetailsCard, StudyQuestionPoolCard } from "./components"
import { useStudyDetailPage } from "./hooks"

interface StudyDetailPageClientProps {
  studyId: string
}

export function StudyDetailPageClient({ studyId }: StudyDetailPageClientProps) {
  const {
    assessmentsError,
    assessmentsLoading,
    completedAssessments,
    expandedAssessmentId,
    inProgressAssessments,
    pool,
    poolError,
    poolLoading,
    populateDocx,
    populateErrors,
    populatingAssessmentId,
    study,
    studyError,
    studyLoading,
    toggleAssessmentExpanded,
    totalAssessments,
  } = useStudyDetailPage(studyId)

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
      <StudyDetailHeader study={study} />

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
            />

            <InProgressAssessmentsSection assessments={inProgressAssessments} />

            {totalAssessments === 0 && <AssessmentsEmptyState />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
