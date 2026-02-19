import { ArrowLeft, Calendar, FlaskConical, Plus } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Study } from "@/lib/types"

interface StudyDetailHeaderProps {
  study: Study
}

export function StudyDetailHeader({ study }: StudyDetailHeaderProps) {
  return (
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
  )
}
