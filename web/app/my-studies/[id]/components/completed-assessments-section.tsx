import Link from "next/link"
import { ChevronDown, ChevronUp, FileText, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ASSESSMENT_STATUS_STYLES } from "@/lib/constants/assessment"
import type { Assessment, QuestionPool } from "@/lib/types"
import { AssessmentAnswersTable } from "./assessment-answers-table"
import { DocumentNameEditor } from "./document-name-editor"
import { buildAssessmentAnswerRows } from "../domain"

interface CompletedAssessmentsSectionProps {
  assessments: Assessment[]
  expandedAssessmentId: string | null
  onToggleExpand: (assessmentId: string) => void
  onPopulateDocx: (assessmentId: string) => void
  populatingAssessmentId: string | null
  populateErrors: Record<string, string>
  pool: QuestionPool | null
  poolLoading: boolean
  poolError: Error | null
  onRenameAssessment: (assessmentId: string, name: string) => Promise<boolean>
  renamingAssessmentId: string | null
  renameErrors: Record<string, string>
}

export function CompletedAssessmentsSection({
  assessments,
  expandedAssessmentId,
  onToggleExpand,
  onPopulateDocx,
  populatingAssessmentId,
  populateErrors,
  pool,
  poolLoading,
  poolError,
  onRenameAssessment,
  renamingAssessmentId,
  renameErrors,
}: CompletedAssessmentsSectionProps) {
  if (assessments.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Completed Documents</h3>
      {assessments.map((assessment) => {
        const isExpanded = expandedAssessmentId === assessment.id
        const answerRows = buildAssessmentAnswerRows(assessment, pool)

        return (
          <Card key={assessment.id} className={ASSESSMENT_STATUS_STYLES[assessment.status]}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <DocumentNameEditor
                    assessmentId={assessment.id}
                    name={assessment.name}
                    onRename={onRenameAssessment}
                    isRenaming={renamingAssessmentId === assessment.id}
                    errorMessage={renameErrors[assessment.id]}
                  />
                  <p className="text-sm text-muted-foreground mb-2">Created {assessment.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="ml-4 flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 bg-background"
                      onClick={() => onToggleExpand(assessment.id)}
                    >
                      <FileText className="h-4 w-4" />
                      {isExpanded ? "Hide Answers" : "View Answers"}
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Link href={`/assessment/${assessment.id}`}>
                      <Button className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit Document
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="gap-2 bg-background"
                      onClick={() => onPopulateDocx(assessment.id)}
                      disabled={populatingAssessmentId === assessment.id}
                    >
                      <FileText className="h-4 w-4" />
                      {populatingAssessmentId === assessment.id ? "Generating..." : "Generate file"}
                    </Button>
                  </div>
                  {populateErrors[assessment.id] && <p className="text-xs text-destructive">{populateErrors[assessment.id]}</p>}
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 border-t pt-4 space-y-3">
                  {poolLoading && <p className="text-xs text-muted-foreground">Loading template context...</p>}
                  {poolError && (
                    <p className="text-xs text-destructive">Unable to load template details: {poolError.message}</p>
                  )}

                  {answerRows.length > 0 ? (
                    <AssessmentAnswersTable rows={answerRows} />
                  ) : (
                    <p className="text-sm text-muted-foreground">No answers available for this document.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
