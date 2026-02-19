import Link from "next/link"
import { Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Assessment } from "@/lib/types"

interface AssessmentExportCardProps {
  assessment: Assessment
  onExport: (assessmentId: string, format: "pdf" | "csv" | "json") => void
}

export function AssessmentExportCard({ assessment, onExport }: AssessmentExportCardProps) {
  return (
    <Card
      className={assessment.status === "completed" ? "border-success bg-success/5" : "border-warning bg-warning/5"}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{assessment.name}</CardTitle>
            <CardDescription className="mt-2">
              Created {assessment.createdAt.toLocaleDateString()} • Last updated{" "}
              {assessment.updatedAt.toLocaleDateString()}
            </CardDescription>
          </div>
          {assessment.status === "in-progress" && (
            <Badge variant="outline" className="ml-4 bg-background">
              {assessment.progress}% Progress ({assessment.answeredQuestions}/{assessment.totalQuestions} Questions)
            </Badge>
          )}
          {assessment.status === "completed" && (
            <Badge variant="outline" className="ml-4 bg-background border-success text-success">
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {assessment.status === "completed" ? (
          <div className="flex gap-2">
            <Button onClick={() => onExport(assessment.id, "pdf")} className="gap-2">
              <Download className="h-4 w-4" />
              Export as PDF
            </Button>
            <Button onClick={() => onExport(assessment.id, "csv")} variant="outline" className="gap-2 bg-background">
              <Download className="h-4 w-4" />
              Export as CSV
            </Button>
            <Button onClick={() => onExport(assessment.id, "json")} variant="outline" className="gap-2 bg-background">
              <Download className="h-4 w-4" />
              Export as JSON
            </Button>
          </div>
        ) : (
          <Link href={`/assessment/${assessment.id}`}>
            <Button className="gap-2">
              <FileText className="h-4 w-4" />
              Continue Document
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
