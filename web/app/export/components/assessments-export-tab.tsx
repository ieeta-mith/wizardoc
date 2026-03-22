import { FileText } from "lucide-react"
import { NewDocumentButton } from "@/components/new-document-button"
import { Card, CardContent } from "@/components/ui/card"
import type { Assessment } from "@/lib/types"
import { AssessmentExportCard } from "./assessment-export-card"

interface AssessmentsExportTabProps {
  assessments: Assessment[]
  studyId: string
  onExport: (assessmentId: string, format: "pdf" | "csv" | "json") => void
}

export function AssessmentsExportTab({ assessments, studyId, onExport }: AssessmentsExportTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Documents</h2>

      {assessments.map((assessment) => (
        <AssessmentExportCard key={assessment.id} assessment={assessment} onExport={onExport} />
      ))}

      {assessments.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create a document to generate reports</p>
            <NewDocumentButton studyId={studyId} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
