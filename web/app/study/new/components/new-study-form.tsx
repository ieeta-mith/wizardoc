"use client"

import { Controller, type UseFormReturn } from "react-hook-form"
import { Play, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { QuestionPool, Study } from "@/lib/types"
import type { StudyFormData } from "@/lib/schemas/study-schema"

interface NewStudyFormProps {
  form: UseFormReturn<StudyFormData>
  isSubmitting: boolean
  pools: QuestionPool[]
  poolsLoading: boolean
  studies: Study[]
  studiesLoading: boolean
  onSaveProject: (data: StudyFormData) => Promise<void>
  onLaunchWizard: (data: StudyFormData) => Promise<void>
}

export function NewStudyForm({
  form,
  isSubmitting,
  pools,
  poolsLoading,
  studies,
  studiesLoading,
  onSaveProject,
  onLaunchWizard,
}: NewStudyFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form
  const projectMode = watch("projectMode")
  const selectedProjectId = watch("projectId")
  const selectedProject = studies.find((study) => study.id === selectedProjectId)

  return (
    <form onSubmit={handleSubmit(onLaunchWizard)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="template">Template</Label>
        <Controller
          name="templateId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={poolsLoading || (projectMode === "existing" && Boolean(selectedProject))}
            >
              <SelectTrigger id="template">
                <SelectValue placeholder={poolsLoading ? "Loading templates..." : "Choose a template"} />
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
        {projectMode === "existing" && selectedProject && (
          <p className="text-xs text-muted-foreground">Template is inherited from the selected project.</p>
        )}
        {errors.templateId && <p className="text-sm text-destructive">{errors.templateId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="project-mode">Project Context</Label>
        <Controller
          name="projectMode"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={(value) => {
                field.onChange(value)
                if (value === "new") {
                  setValue("projectId", "")
                }
                if (value === "existing") {
                  setValue("projectName", "")
                  setValue("category", "")
                  setValue("projectQuestion", "")
                }
              }}
            >
              <SelectTrigger id="project-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Create a new project</SelectItem>
                <SelectItem value="existing">Use an existing project</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {projectMode === "existing" ? (
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Controller
            name="projectId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value)
                  const project = studies.find((study) => study.id === value)
                  if (project?.poolId) {
                    setValue("templateId", project.poolId, { shouldValidate: true })
                  }
                }}
                disabled={studiesLoading}
              >
                <SelectTrigger id="project">
                  <SelectValue placeholder={studiesLoading ? "Loading projects..." : "Choose a project"} />
                </SelectTrigger>
                <SelectContent>
                  {studies.map((study) => (
                    <SelectItem key={study.id} value={study.id}>
                      {study.name || "Untitled project"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {!studiesLoading && studies.length === 0 && (
            <p className="text-xs text-muted-foreground">No projects available yet. Switch to creating a new project.</p>
          )}
          {errors.projectId && <p className="text-sm text-destructive">{errors.projectId.message}</p>}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input id="project-name" placeholder="Enter project name" {...register("projectName")} />
            {errors.projectName && <p className="text-sm text-destructive">{errors.projectName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="therapeutic-area">Category</Label>
            <Input
              id="therapeutic-area"
              placeholder="e.g., Cardiology, Oncology, Neurology"
              {...register("category")}
            />
            {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-question">Project Objective</Label>
            <Textarea
              id="project-question"
              placeholder="Describe the objective that applies to this project"
              rows={4}
              {...register("projectQuestion")}
            />
            {errors.projectQuestion && <p className="text-sm text-destructive">{errors.projectQuestion.message}</p>}
          </div>
        </>
      )}

      <div className="flex gap-3 pt-4">
        {projectMode === "new" && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-2 bg-transparent"
            disabled={isSubmitting}
            onClick={handleSubmit(onSaveProject)}
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save project"}
          </Button>
        )}
        <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
          <Play className="h-4 w-4" />
          {isSubmitting ? "Creating..." : "Create document"}
        </Button>
      </div>
    </form>
  )
}
