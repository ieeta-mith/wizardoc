"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Calendar,
  ClipboardList,
  Download,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"
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
import { DocxPopulationService } from "@/lib/services/docx-population-service"
import { StudyService } from "@/lib/services/study-service"
import { ASSESSMENT_STATUS_LABELS, AssessmentStatus } from "@/lib/constants/assessment"
import type { DocumentItem } from "@/hooks/use-documents"
import { AssessmentAnswersTable } from "../[id]/components/assessment-answers-table"
import { buildAssessmentAnswerRows } from "../[id]/domain"

interface DocumentCardProps {
  item: DocumentItem
  backingStudyDocumentCount: number
  onDeleteSuccess: () => void
  onRenameSuccess: () => void
}

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const isDocumentBackedStudy = (item: DocumentItem, backingStudyDocumentCount: number) => {
  const { assessment, study } = item
  const metadata = study.metadata ?? {}
  const explicitDocumentFirst = metadata.documentFirst === true
  const inferredDocumentFirst =
    backingStudyDocumentCount <= 1 &&
    !study.category &&
    !study.studyQuestion &&
    study.name?.trim() === assessment.name.trim()

  return explicitDocumentFirst || inferredDocumentFirst
}

export function DocumentCard({
  item,
  backingStudyDocumentCount,
  onDeleteSuccess,
  onRenameSuccess,
}: DocumentCardProps) {
  const { assessment, study, pool } = item
  const isInProgress = assessment.status === "in-progress"
  const answerRows = buildAssessmentAnswerRows(assessment, pool)

  const [answersOpen, setAnswersOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [draftName, setDraftName] = useState(assessment.name)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameError, setRenameError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

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
    setDeleteError(null)
    try {
      await AssessmentService.delete(assessment.id)
      if (isDocumentBackedStudy(item, backingStudyDocumentCount)) {
        await StudyService.delete(study.id).catch(() => false)
      }
      setDeleteOpen(false)
      onDeleteSuccess()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete document.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleGenerateFile = async () => {
    setIsGenerating(true)
    setGenerateError(null)
    try {
      const { blob, filename } = await DocxPopulationService.populateAssessmentDocx(assessment.id)
      triggerDownload(blob, filename)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Failed to generate file.")
    } finally {
      setIsGenerating(false)
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
                {pool?.name || "Unknown template"}
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
                  {!isInProgress && (
                    <DropdownMenuItem onClick={() => setAnswersOpen((current) => !current)}>
                      <FileText className="h-4 w-4" />
                      {answersOpen ? "Hide Answers" : "Answers"}
                    </DropdownMenuItem>
                  )}
                  {!isInProgress && (
                    <DropdownMenuItem asChild>
                      <Link href={`/assessment/${assessment.id}/wizard`}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                  )}
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

        <CardContent className="flex flex-1 flex-col space-y-4">
          {(generateError || deleteError) && (
            <p className="text-xs text-destructive">{generateError || deleteError}</p>
          )}

          <div className="flex-1">
            {isInProgress && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{assessment.answeredQuestions}/{assessment.totalQuestions} questions</span>
                <span>{assessment.progress}%</span>
              </div>
              <Progress value={assessment.progress} className="h-1.5" />
            </div>
            )}
          </div>

          {isInProgress && (
            <Button asChild className="w-full gap-1.5">
              <Link href={`/assessment/${assessment.id}/wizard`}>
                <Pencil className="h-4 w-4" />
                Continue
              </Link>
            </Button>
          )}

          {!isInProgress && (
            <Button
              type="button"
              className="w-full gap-1.5"
              onClick={() => void handleGenerateFile()}
              disabled={isGenerating}
            >
              <Download className="h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate File"}
            </Button>
          )}

          {!isInProgress && answersOpen && (
            <div className="overflow-x-auto border-t pt-4">
              {answerRows.length > 0 ? (
                <AssessmentAnswersTable rows={answerRows} />
              ) : (
                <p className="text-sm text-muted-foreground">No answers available for this document.</p>
              )}
            </div>
          )}
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
