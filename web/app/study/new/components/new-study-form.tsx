"use client"

import { Controller, type UseFormReturn } from "react-hook-form"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuestionPool } from "@/lib/types"
import type { DocumentFormData } from "@/lib/schemas/document-schema"

interface NewStudyFormProps {
  form: UseFormReturn<DocumentFormData>
  isSubmitting: boolean
  pools: QuestionPool[]
  poolsLoading: boolean
  onLaunchWizard: (data: DocumentFormData) => Promise<void>
}

export function NewStudyForm({ form, isSubmitting, pools, poolsLoading, onLaunchWizard }: NewStudyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(onLaunchWizard)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template">Template</Label>
        <Controller
          name="templateId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={poolsLoading}>
              <SelectTrigger id="template">
                <SelectValue placeholder={poolsLoading ? "Loading templates..." : "Choose a template"} />
              </SelectTrigger>
              <SelectContent>
                {pools.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    {pool.name} — {pool.source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.templateId && <p className="text-sm text-destructive">{errors.templateId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="doc-name">Document name</Label>
        <Input id="doc-name" placeholder="e.g. Feasibility Assessment Q1 2026" {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
        <Play className="h-4 w-4" />
        {isSubmitting ? "Creating..." : "Create Document"}
      </Button>
    </form>
  )
}
