"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, ClipboardList, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { AssessmentService } from "@/lib/services/assessment-service"
import { ASSESSMENT_STATUS_LABELS, AssessmentStatus } from "@/lib/constants/assessment"
import type { DocumentItem } from "@/hooks/use-documents"

interface DocumentCardProps {
  item: DocumentItem
  onDeleteSuccess: () => void
  onRenameSuccess: () => void
}

export function DocumentCard({ item, onDeleteSuccess, onRenameSuccess }: DocumentCardProps) {
  const { assessment, study } = item
  const isInProgress = assessment.status === "in-progress"

  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [draftName, setDraftName] = useState(assessment.name)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRename = async () => {
    const trimmed = draftName.trim()
    if (!trimmed) return
    setIsRenaming(true)
    setRenameError(null)
    try {
      const updated = await AssessmentService.rename(assessment.id, trimmed)
      if (updated) {
        setRenameOpen(false)
        onRenameSuccess()
      } else {
        setRenameError("Document not found.")
      }
    } catch (err) {
      setRenameError(err instanceof Error ? err.message : "Failed to rename.")
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await AssessmentService.delete(assessment.id)
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
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">{assessment.name}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1.5 text-xs">
                <ClipboardList className="h-3 w-3 shrink-0" />
                {study.name || "Unknown template"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                variant="outline"
                className={isInProgress ? "border-yellow-300 text-yellow-700 bg-yellow-50" : "border-green-300 text-green-700 bg-green-50"}
              >
                {ASSESSMENT_STATUS_LABELS[assessment.status as AssessmentStatus] ?? assessment.status}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setDraftName(assessment.name)
                      setRenameError(null)
                      setRenameOpen(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Rename
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
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Calendar className="h-3 w-3" />
            {assessment.createdAt.toLocaleDateString()}
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          {isInProgress && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{assessment.answeredQuestions}/{assessment.totalQuestions} questions</span>
                <span>{assessment.progress}%</span>
              </div>
              <Progress value={assessment.progress} className="h-1.5" />
            </div>
          )}

          <Link href={`/assessment/${assessment.id}${isInProgress ? "/wizard" : ""}`} className="block">
            <Button className="w-full">
              {isInProgress ? "Continue" : "Edit"}
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          if (!isRenaming) setRenameOpen(open)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="rename-input">Document name</Label>
            <Input
              id="rename-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              maxLength={120}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  void handleRename()
                }
                if (e.key === "Escape") setRenameOpen(false)
              }}
              autoFocus
            />
            {renameError && <p className="text-xs text-destructive">{renameError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={isRenaming}>
              Cancel
            </Button>
            <Button onClick={() => void handleRename()} disabled={isRenaming || !draftName.trim()}>
              {isRenaming ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Document"
        description={`Are you sure you want to delete "${assessment.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  )
}
