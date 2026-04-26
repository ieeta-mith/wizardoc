import { ArrowLeft, Calendar, FlaskConical, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { NewDocumentButton } from "@/components/new-document-button"
import { Button } from "@/components/ui/button"
import type { Study } from "@/lib/types"

interface StudyDetailHeaderProps {
  study: Study
  onEditClick: () => void
  onDeleteClick: () => void
}

export function StudyDetailHeader({ study, onEditClick, onDeleteClick }: StudyDetailHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href="/my-studies"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{study.name}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Created {study.createdAt.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              {study.category}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onEditClick} title="Edit project">
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit project</span>
          </Button>
          <Button variant="outline" size="icon" onClick={onDeleteClick} title="Delete project" className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete project</span>
          </Button>
          <NewDocumentButton studyId={study.id} />
        </div>
      </div>
    </div>
  )
}
