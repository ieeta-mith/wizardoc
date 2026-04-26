import type { Study } from "@/lib/types"
import { StudyCard } from "./study-card"

interface StudiesGridProps {
  studies: Study[]
  onDeleteSuccess: () => void
  onEditSuccess: () => void
}

export function StudiesGrid({ studies, onDeleteSuccess, onEditSuccess }: StudiesGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {studies.map((study) => (
        <StudyCard
          key={study.id}
          study={study}
          onDeleteSuccess={onDeleteSuccess}
          onEditSuccess={onEditSuccess}
        />
      ))}
    </div>
  )
}
