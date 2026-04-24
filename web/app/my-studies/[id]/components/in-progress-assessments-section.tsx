import Link from "next/link"
import { MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ASSESSMENT_STATUS_STYLES } from "@/lib/constants/assessment"
import type { Assessment } from "@/lib/types"
import { DocumentNameEditor } from "./document-name-editor"

interface InProgressAssessmentsSectionProps {
  assessments: Assessment[]
  onRenameAssessment: (assessmentId: string, name: string) => Promise<boolean>
  renamingAssessmentId: string | null
  renameErrors: Record<string, string>
  onDeleteAssessment: (assessmentId: string) => void
  deletingAssessmentId: string | null
  assessmentDeleteErrors: Record<string, string>
}

export function InProgressAssessmentsSection({
  assessments,
  onRenameAssessment,
  renamingAssessmentId,
  renameErrors,
  onDeleteAssessment,
  deletingAssessmentId,
  assessmentDeleteErrors,
}: InProgressAssessmentsSectionProps) {
  if (assessments.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">In Progress Documents</h3>
      {assessments.map((assessment) => {
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
                  <p className="text-sm text-muted-foreground mb-2">Created {assessment.createdAt.toLocaleDateString()}</p>
                  <Badge variant="outline" className="bg-background text-xs">
                    {assessment.progress}% &middot; {assessment.answeredQuestions}/{assessment.totalQuestions} questions
                  </Badge>
                  {assessmentDeleteErrors[assessment.id] && (
                    <p className="text-xs text-destructive mt-1">{assessmentDeleteErrors[assessment.id]}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild size="sm" className="gap-1.5">
                    <Link href={`/assessment/${assessment.id}`}>Continue</Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon-sm" disabled={isDeleting}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
