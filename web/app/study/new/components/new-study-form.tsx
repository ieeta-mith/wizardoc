"use client"

import { Controller, type UseFormReturn } from "react-hook-form"
import { Play, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { QuestionPool } from "@/lib/types"
import type { StudyFormData } from "@/lib/schemas/study-schema"

interface NewStudyFormProps {
  form: UseFormReturn<StudyFormData>
  isSubmitting: boolean
  pools: QuestionPool[]
  poolsLoading: boolean
  onSaveStudy: (data: StudyFormData) => Promise<void>
  onLaunchWizard: (data: StudyFormData) => Promise<void>
}

export function NewStudyForm({
  form,
  isSubmitting,
  pools,
  poolsLoading,
  onSaveStudy,
  onLaunchWizard,
}: NewStudyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form

  return (
    <form onSubmit={handleSubmit(onSaveStudy)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="study-name">Study Name</Label>
        <Input id="study-name" placeholder="Enter study name" {...register("studyName")} />
        {errors.studyName && <p className="text-sm text-destructive">{errors.studyName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="therapeutic-area">Therapeutic Area</Label>
        <Input
          id="therapeutic-area"
          placeholder="e.g., Cardiology, Oncology, Neurology"
          {...register("therapeuticArea")}
        />
        {errors.therapeuticArea && <p className="text-sm text-destructive">{errors.therapeuticArea.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="study-question">Study Question</Label>
        <Textarea
          id="study-question"
          placeholder="Describe the primary research question or objective"
          rows={4}
          {...register("studyQuestion")}
        />
        {errors.studyQuestion && <p className="text-sm text-destructive">{errors.studyQuestion.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="pool">Select Pool</Label>
        <Controller
          name="poolId"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} disabled={poolsLoading}>
              <SelectTrigger id="pool">
                <SelectValue placeholder={poolsLoading ? "Loading pools..." : "Choose a question pool"} />
              </SelectTrigger>
              <SelectContent>
                {pools.map((pool) => (
                  <SelectItem key={pool.id} value={pool.id}>
                    {pool.name} - {pool.source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.poolId && <p className="text-sm text-destructive">{errors.poolId.message}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="outline" className="flex-1 gap-2 bg-transparent" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save study"}
        </Button>
        <Button type="button" onClick={handleSubmit(onLaunchWizard)} className="flex-1 gap-2" disabled={isSubmitting}>
          <Play className="h-4 w-4" />
          {isSubmitting ? "Launching..." : "Launch risk assessment wizard"}
        </Button>
      </div>
    </form>
  )
}
