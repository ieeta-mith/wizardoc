"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, FlaskConical, FileText, Plus } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useStudy } from "@/hooks/use-studies"
import { useAssessmentsByStudy } from "@/hooks/use-assessment"
import { ASSESSMENT_STATUS_STYLES } from "@/lib/constants/assessment"

export default function StudyDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { study, loading: studyLoading, error: studyError } = useStudy(id)
  const { assessments, loading: assessmentsLoading, error: assessmentsError } = useAssessmentsByStudy(id)

  if (studyLoading || assessmentsLoading) {
    return (
      <div className="container py-8">
        <p>Loading study details...</p>
      </div>
    )
  }

  if (studyError || !study) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Study not found or error loading study</p>
            <Link href="/my-studies" className="mt-4 inline-block">
              <Button>Back to My Studies</Button>
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
            <p className="text-destructive">Error loading assessments: {assessmentsError.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/my-studies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Studies
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{study.name}</h1>
              <Badge variant="secondary">{study.phase}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created {study.createdAt.toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-4 w-4" />
                {study.therapeuticArea}
              </div>
            </div>
          </div>
          <Link href={`/assessment/new?studyId=${study.id}`}>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Study Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Study Question</h4>
              <p className="text-sm text-muted-foreground">{study.studyQuestion}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Last Updated</h4>
              <p className="text-sm text-muted-foreground">{study.updatedAt.toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Assessments</CardTitle>
            <CardDescription>View and manage assessments for this study</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.map((assessment) => (
              <Card key={assessment.id} className={ASSESSMENT_STATUS_STYLES[assessment.status]}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{assessment.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Created {assessment.createdAt.toLocaleDateString()}
                      </p>
                      {assessment.status === "in-progress" && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="bg-background">
                            {assessment.progress}% Progress ({assessment.answeredQuestions}/{assessment.totalQuestions}{" "}
                            Questions)
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      {assessment.status === "completed" ? (
                        <Link href={`/export?assessmentId=${assessment.id}`}>
                          <Button variant="outline" className="gap-2 bg-background">
                            <FileText className="h-4 w-4" />
                            Export
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/assessment/${assessment.id}`}>
                          <Button className="gap-2">Continue</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {assessments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No assessments yet. Create one to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
