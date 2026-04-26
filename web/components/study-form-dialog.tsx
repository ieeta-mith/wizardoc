"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Study, StudyCreate } from "@/lib/types"

const editStudySchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Must be less than 100 characters"),
  category: z.string().max(50, "Must be less than 50 characters").optional(),
  studyQuestion: z.string().max(500, "Must be less than 500 characters").optional(),
})

type EditStudyFormData = z.infer<typeof editStudySchema>

interface StudyFormDialogProps {
  study: Study
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<StudyCreate>) => Promise<boolean>
  isSaving?: boolean
  error?: string | null
}

export function StudyFormDialog({ study, open, onOpenChange, onSave, isSaving, error }: StudyFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditStudyFormData>({
    resolver: zodResolver(editStudySchema),
    defaultValues: {
      name: study.name ?? "",
      category: study.category ?? "",
      studyQuestion: study.studyQuestion ?? "",
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: study.name ?? "",
        category: study.category ?? "",
        studyQuestion: study.studyQuestion ?? "",
      })
    }
  }, [open, study, reset])

  const onSubmit = async (data: EditStudyFormData) => {
    const success = await onSave({
      name: data.name,
      category: data.category || null,
      studyQuestion: data.studyQuestion || null,
    })
    if (success) onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && onOpenChange(val)}>
      <DialogContent showCloseButton={!isSaving}>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update the project details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Project Name</Label>
            <Input id="edit-name" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Input id="edit-category" placeholder="e.g., Cardiology, Oncology" {...register("category")} />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-objective">Objective</Label>
            <Textarea id="edit-objective" rows={4} {...register("studyQuestion")} />
            {errors.studyQuestion && <p className="text-sm text-destructive">{errors.studyQuestion.message}</p>}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
