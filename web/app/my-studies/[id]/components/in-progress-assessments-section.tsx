import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ASSESSMENT_STATUS_STYLES } from "@/lib/constants/assessment"
import type { Assessment } from "@/lib/types"
import { DocumentNameEditor } from "./document-name-editor"

interface InProgressAssessmentsSectionProps {
  assessments: Assessment[]
  onRenameAssessment: (assessmentId: string, name: string) => Promise<boolean>
  renamingAssessmentId: string | null
  renameErrors: Record<string, string>
}

export function InProgressAssessmentsSection({
  assessments,
  onRenameAssessment,
  renamingAssessmentId,
  renameErrors,
}: InProgressAssessmentsSectionProps) {
  if (assessments.length === 0) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">In Progress Documents</h3>
      {assessments.map((assessment) => (
        <Card key={assessment.id} className={ASSESSMENT_STATUS_STYLES[assessment.status]}>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1 xl:min-w-[14rem]">
                <DocumentNameEditor
                  assessmentId={assessment.id}
                  name={assessment.name}
                  onRename={onRenameAssessment}
                  isRenaming={renamingAssessmentId === assessment.id}
                  errorMessage={renameErrors[assessment.id]}
                />
                <p className="text-sm text-muted-foreground mb-2">Created {assessment.createdAt.toLocaleDateString()}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-background">
                    {assessment.progress}% Progress ({assessment.answeredQuestions}/{assessment.totalQuestions} Questions)
                  </Badge>
                </div>
              </div>
              <div className="w-full xl:ml-4 xl:w-auto">
                <Button asChild className="w-full justify-center gap-2 xl:w-auto">
                  <Link href={`/assessment/${assessment.id}`}>Continue Document</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
