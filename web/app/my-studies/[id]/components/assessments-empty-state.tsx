import { FileText } from "lucide-react"

export function AssessmentsEmptyState() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
      <p className="text-sm">No assessments yet. Create one to get started.</p>
    </div>
  )
}
