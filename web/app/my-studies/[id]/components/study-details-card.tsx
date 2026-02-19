import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Study } from "@/lib/types"

interface StudyDetailsCardProps {
  study: Study
}

export function StudyDetailsCard({ study }: StudyDetailsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Project Objective</h4>
          <p className="text-sm text-muted-foreground">{study.studyQuestion || "Not provided"}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Last Updated</h4>
          <p className="text-sm text-muted-foreground">{study.updatedAt.toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
