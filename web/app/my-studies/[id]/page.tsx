"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, ChevronDown, ChevronUp, FileText, FlaskConical, Plus } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useStudy } from "@/hooks/use-studies"
import { useAssessmentsByStudy } from "@/hooks/use-assessment"
import { ASSESSMENT_STATUS_STYLES } from "@/lib/constants/assessment"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import { DocxPopulationService } from "@/lib/services/docx-population-service"
import type { QuestionPool } from "@/lib/types"

const formatFileSize = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }
  const precision = size >= 100 ? 0 : size >= 10 ? 1 : 2
  return `${size.toFixed(precision)} ${units[unitIndex]}`
}

const formatUploadedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export default function StudyDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { study, loading: studyLoading, error: studyError } = useStudy(id)
  const { assessments, loading: assessmentsLoading, error: assessmentsError } = useAssessmentsByStudy(id)
  const [pool, setPool] = useState<QuestionPool | null>(null)
  const [poolLoading, setPoolLoading] = useState(false)
  const [poolError, setPoolError] = useState<Error | null>(null)
  const [expandedAssessmentId, setExpandedAssessmentId] = useState<string | null>(null)
  const [populatingAssessmentId, setPopulatingAssessmentId] = useState<string | null>(null)
  const [populateErrors, setPopulateErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!study?.poolId) {
      setPool(null)
      setPoolLoading(false)
      setPoolError(null)
      return
    }

    let active = true
    setPool(null)
    setPoolLoading(true)
    setPoolError(null)
    QuestionPoolService.getById(study.poolId)
      .then((data) => {
        if (!active) return
        setPool(data)
      })
      .catch((err) => {
        if (!active) return
        setPoolError(err as Error)
      })
      .finally(() => {
        if (!active) return
        setPoolLoading(false)
      })

    return () => {
      active = false
    }
  }, [study?.poolId])

  const questionLookup = useMemo(
    () => new Map(pool?.questions?.map((question) => [question.id, question]) ?? []),
    [pool]
  )
  const completedAssessments = assessments.filter((assessment) => assessment.status === "completed")
  const inProgressAssessments = assessments.filter((assessment) => assessment.status === "in-progress")

  const handlePopulateDocx = async (assessmentId: string) => {
    setPopulatingAssessmentId(assessmentId)
    setPopulateErrors((prev) => ({ ...prev, [assessmentId]: "" }))
    try {
      const { blob, filename } = await DocxPopulationService.populateAssessmentDocx(assessmentId)
      triggerDownload(blob, filename)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to populate DOCX"
      setPopulateErrors((prev) => ({ ...prev, [assessmentId]: message }))
    } finally {
      setPopulatingAssessmentId(null)
    }
  }

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
        <div className="lg:col-span-1 space-y-6">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle>Question Pool</CardTitle>
              <CardDescription>Details for the pool used by this study</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {poolLoading && <p className="text-sm text-muted-foreground">Loading question pool...</p>}
              {poolError && <p className="text-sm text-destructive">Error loading pool: {poolError.message}</p>}
              {!poolLoading && !poolError && !pool && (
                <p className="text-sm text-muted-foreground">Question pool not available.</p>
              )}
              {pool && (
                <>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Pool Name</h4>
                    <p className="text-sm text-muted-foreground">{pool.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Source</h4>
                    <p className="text-sm text-muted-foreground">{pool.source}</p>
                  </div>
                  <div className="rounded-md border border-dashed px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">DOCX file</p>
                      {pool.docxFile ? (
                        <p className="text-xs text-muted-foreground">
                          {pool.docxFile.filename} · {formatFileSize(pool.docxFile.size)} · Uploaded{" "}
                          {formatUploadedAt(pool.docxFile.uploadedAt)}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">No DOCX file uploaded yet.</p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Risk Assessments</CardTitle>
            <CardDescription>View and manage assessments for this study</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {completedAssessments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Completed Assessments</h3>
                {completedAssessments.map((assessment) => {
                  const isExpanded = expandedAssessmentId === assessment.id
                  const answers = assessment.answers ?? {}
                  const answerEntries = Object.entries(answers)
                  const orderedRows =
                    pool?.questions
                      ?.filter((question) => answers[question.id] !== undefined)
                      .map((question) => ({
                        id: question.id,
                        question,
                        answer: answers[question.id],
                      })) ?? []
                  const extraRows = answerEntries
                    .filter(([questionId]) => !questionLookup.has(questionId))
                    .map(([questionId, answer]) => ({
                      id: questionId,
                      question: null,
                      answer,
                    }))
                  const answerRows = pool ? [...orderedRows, ...extraRows] : extraRows
                  return (
                    <Card key={assessment.id} className={ASSESSMENT_STATUS_STYLES[assessment.status]}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{assessment.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              Created {assessment.createdAt.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-4 flex flex-col items-end gap-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                className="gap-2 bg-background"
                                onClick={() =>
                                  setExpandedAssessmentId(isExpanded ? null : assessment.id)
                                }
                              >
                                <FileText className="h-4 w-4" />
                                {isExpanded ? "Hide Answers" : "Consult Answers"}
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                className="gap-2 bg-background"
                                onClick={() => handlePopulateDocx(assessment.id)}
                                disabled={populatingAssessmentId === assessment.id}
                              >
                                <FileText className="h-4 w-4" />
                                {populatingAssessmentId === assessment.id ? "Populating..." : "Populate file"}
                              </Button>
                            </div>
                            {populateErrors[assessment.id] && (
                              <p className="text-xs text-destructive">{populateErrors[assessment.id]}</p>
                            )}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="mt-4 border-t pt-4 space-y-3">
                            {poolLoading && (
                              <p className="text-xs text-muted-foreground">Loading question pool context...</p>
                            )}
                            {poolError && (
                              <p className="text-xs text-destructive">
                                Unable to load question pool details: {poolError.message}
                              </p>
                            )}
                            {answerRows.length > 0 ? (
                              <div className="rounded-md border">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Question ID</TableHead>
                                      <TableHead>Identifier</TableHead>
                                      <TableHead>Question</TableHead>
                                      <TableHead>Answer</TableHead>
                                      <TableHead>Domain</TableHead>
                                      <TableHead>Risk Type</TableHead>
                                      <TableHead>ISO Reference</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {answerRows.map((row) => (
                                      <TableRow key={row.id}>
                                        <TableCell className="font-mono text-sm">{row.id}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                          {row.question?.identifier ?? "—"}
                                        </TableCell>
                                        <TableCell className="max-w-md">{row.question?.text ?? "—"}</TableCell>
                                        <TableCell className="whitespace-pre-wrap">{row.answer || "—"}</TableCell>
                                        <TableCell>{row.question?.domain ?? "—"}</TableCell>
                                        <TableCell>{row.question?.riskType ?? "—"}</TableCell>
                                        <TableCell className="font-mono text-sm">
                                          {row.question?.isoReference ?? "—"}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No answers available for this assessment.</p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {inProgressAssessments.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">In Progress</h3>
                {inProgressAssessments.map((assessment) => (
                  <Card key={assessment.id} className={ASSESSMENT_STATUS_STYLES[assessment.status]}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{assessment.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            Created {assessment.createdAt.toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="bg-background">
                              {assessment.progress}% Progress ({assessment.answeredQuestions}/{assessment.totalQuestions}{" "}
                              Questions)
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link href={`/assessment/${assessment.id}`}>
                            <Button className="gap-2">Continue</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

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
