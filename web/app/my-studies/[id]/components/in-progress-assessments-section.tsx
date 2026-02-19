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
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-background">
                    {assessment.progress}% Progress ({assessment.answeredQuestions}/{assessment.totalQuestions} Questions)
                  </Badge>
                </div>
              </div>
              <div className="ml-4">
                <Link href={`/assessment/${assessment.id}`}>
                  <Button className="gap-2">Continue Document</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
