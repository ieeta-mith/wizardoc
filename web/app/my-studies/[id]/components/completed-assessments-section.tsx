import Link from "next/link"
import { ChevronDown, ChevronUp, Download, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  onDeleteAssessment: (assessmentId: string) => void
  deletingAssessmentId: string | null
  assessmentDeleteErrors: Record<string, string>
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
  onDeleteAssessment,
  deletingAssessmentId,
  assessmentDeleteErrors,
}: CompletedAssessmentsSectionProps) {
  if (assessments.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">Completed Documents</h3>
      {assessments.map((assessment) => {
        const isExpanded = expandedAssessmentId === assessment.id
        const answerRows = buildAssessmentAnswerRows(assessment, pool)
        const isGenerating = populatingAssessmentId === assessment.id
        const isDeleting = deletingAssessmentId === assessment.id

        return (
          <Card key={assessment.id} className={ASSESSMENT_STATUS_STYLES[assessment.status]}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <DocumentNameEditor
                    assessmentId={assessment.id}
                    name={assessment.name}
                    onRename={onRenameAssessment}
                    isRenaming={renamingAssessmentId === assessment.id}
                    errorMessage={renameErrors[assessment.id]}
                  />
                  <p className="text-sm text-muted-foreground">Created {assessment.createdAt.toLocaleDateString()}</p>
                  {(populateErrors[assessment.id] || assessmentDeleteErrors[assessment.id]) && (
                    <p className="text-xs text-destructive mt-1">
                      {populateErrors[assessment.id] || assessmentDeleteErrors[assessment.id]}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                    onClick={() => onToggleExpand(assessment.id)}
                  >
                    <FileText className="h-4 w-4" />
                    {isExpanded ? "Hide" : "Answers"}
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>

                  <Button asChild size="sm" className="gap-1.5">
                    <Link href={`/assessment/${assessment.id}`}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon-sm" disabled={isGenerating || isDeleting}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onPopulateDocx(assessment.id)}
                        disabled={isGenerating}
                      >
                        <Download className="h-4 w-4" />
                        {isGenerating ? "Generating..." : "Generate file"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDeleteAssessment(assessment.id)}
                        disabled={isDeleting}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
