"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, FlaskConical, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { StudyFormDialog } from "@/components/study-form-dialog"
import { StudyService } from "@/lib/services/study-service"
import type { Study } from "@/lib/types"

interface StudyCardProps {
  study: Study
  onDeleteSuccess: () => void
  onEditSuccess: () => void
}

export function StudyCard({ study, onDeleteSuccess, onEditSuccess }: StudyCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const handleEdit = async (data: Partial<Study>) => {
    setIsSaving(true)
    setSaveError(null)
    try {
      const updated = await StudyService.update(study.id, data)
      if (updated) {
        onEditSuccess()
        return true
      }
      setSaveError("Project not found.")
      return false
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update project.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await StudyService.delete(study.id)
      setDeleteOpen(false)
      onDeleteSuccess()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-xl">{study.name}</CardTitle>
            <div className="flex items-center gap-1 shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditOpen(true)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <CardDescription className="flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            Created {study.createdAt.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Category:</span>
              <span className="text-muted-foreground">{study.category || "Not set"}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-3">{study.studyQuestion || "No objective provided."}</p>
          </div>
          <Link href={`/my-studies/${study.id}`} className="block">
            <Button className="w-full">Open Project</Button>
          </Link>
        </CardContent>
      </Card>

      <StudyFormDialog
        study={study}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleEdit}
        isSaving={isSaving}
        error={saveError}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Project"
        description={`Are you sure you want to delete "${study.name}"? This will permanently delete the project and all its documents.`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
