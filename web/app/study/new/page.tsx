"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studySchema, type StudyFormData } from "@/lib/schemas/study-schema"
import { StudyService } from "@/lib/services/study-service"
import { AssessmentService } from "@/lib/services/assessment-service"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { useMetadataTemplates } from "@/hooks/use-metadata-templates"
import { logger } from "@/lib/utils/logger"
import type { MetadataFieldDef } from "@/lib/types"
import { useEffect, useMemo, useState } from "react"

const TEMPLATE_NONE = "__none__"

export default function NewStudyPage() {
  const router = useRouter()
  const { pools, loading: poolsLoading } = useQuestionPools()
  const { templates, loading: templatesLoading, error: templatesError } = useMetadataTemplates()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      metadataTemplateId: "",
      metadata: {},
      therapeuticArea: "",
      studyQuestion: "",
      poolId: "",
    },
  })

  const metadataTemplateId = watch("metadataTemplateId")
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === metadataTemplateId) ?? null,
    [templates, metadataTemplateId]
  )

  useEffect(() => {
    if (!selectedTemplate) {
      setValue("metadata", {})
      clearErrors("metadata")
      return
    }

    const defaults: Record<string, unknown> = {}
    selectedTemplate.fields.forEach((field) => {
      if (field.default !== undefined) {
        defaults[field.key] = field.default
      } else if (field.type === "multiselect") {
        defaults[field.key] = []
      }
    })

    setValue("metadata", defaults)
    clearErrors("metadata")
  }, [selectedTemplate, setValue, clearErrors])

  const validateMetadataFields = (fields: MetadataFieldDef[], values: Record<string, unknown>) => {
    const fieldErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = values[field.key]
      const isEmpty =
        value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)

      if (field.required && isEmpty) {
        fieldErrors[field.key] = "This field is required"
        return
      }

      if (isEmpty) return

      switch (field.type) {
        case "text":
        case "textarea": {
          if (typeof value !== "string") {
            fieldErrors[field.key] = "Must be a text value"
            return
          }
          if (field.min !== undefined && value.length < field.min) {
            fieldErrors[field.key] = `Must be at least ${field.min} characters`
          }
          if (field.max !== undefined && value.length > field.max) {
            fieldErrors[field.key] = `Must be at most ${field.max} characters`
          }
          if (field.regex) {
            try {
              const matcher = new RegExp(field.regex)
              if (!matcher.test(value)) {
                fieldErrors[field.key] = "Does not match required format"
              }
            } catch {
              fieldErrors[field.key] = "Invalid field validation pattern"
            }
          }
          return
        }
        case "number": {
          if (typeof value !== "number" || !Number.isFinite(value)) {
            fieldErrors[field.key] = "Must be a number"
            return
          }
          if (field.min !== undefined && value < field.min) {
            fieldErrors[field.key] = `Must be at least ${field.min}`
          }
          if (field.max !== undefined && value > field.max) {
            fieldErrors[field.key] = `Must be at most ${field.max}`
          }
          return
        }
        case "date": {
          if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
            fieldErrors[field.key] = "Must be a valid date"
          }
          return
        }
        case "select": {
          if (typeof value !== "string") {
            fieldErrors[field.key] = "Must be a selection"
            return
          }
          if (field.options && !field.options.includes(value)) {
            fieldErrors[field.key] = "Invalid selection"
          }
          return
        }
        case "multiselect": {
          if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
            fieldErrors[field.key] = "Must be a list of selections"
            return
          }
          if (field.options) {
            const invalid = value.filter((item) => !field.options?.includes(item))
            if (invalid.length > 0) {
              fieldErrors[field.key] = "Contains invalid selections"
            }
          }
          return
        }
        case "boolean": {
          if (typeof value !== "boolean") {
            fieldErrors[field.key] = "Must be true or false"
          }
          return
        }
        default:
          fieldErrors[field.key] = "Unsupported field type"
      }
    })

    return fieldErrors
  }

  const applyMetadataErrors = (fieldErrors: Record<string, string>) => {
    Object.entries(fieldErrors).forEach(([key, message]) => {
      setError(`metadata.${key}` as const, {
        type: "manual",
        message,
      })
    })
  }

  const buildStudyPayload = (data: StudyFormData) => {
    const normalizeValue = (value?: string) => {
      const trimmed = value?.trim()
      return trimmed ? trimmed : undefined
    }

    const payload = {
      name: data.studyName,
      therapeuticArea: normalizeValue(data.therapeuticArea),
      studyQuestion: normalizeValue(data.studyQuestion),
      poolId: data.poolId,
    }

    if (!data.metadataTemplateId) {
      return { payload, errors: null }
    }

    if (!selectedTemplate) {
      return { payload, errors: { metadataTemplateId: "Template not loaded yet." } }
    }

    const metadata = data.metadata ?? {}
    const fieldErrors = validateMetadataFields(selectedTemplate.fields, metadata)
    if (Object.keys(fieldErrors).length > 0) {
      return { payload, errors: fieldErrors }
    }

    return {
      payload: {
        ...payload,
        metadataTemplateId: data.metadataTemplateId,
        metadata,
      },
      errors: null,
    }
  }

  const renderMetadataField = (field: MetadataFieldDef) => {
    const fieldName = `metadata.${field.key}` as const
    const fieldErrors = errors.metadata as Record<string, { message?: string }> | undefined
    const message = fieldErrors?.[field.key]?.message
    const label = field.required ? `${field.label} *` : field.label

    if (field.type === "textarea") {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{label}</Label>
          <Textarea id={field.key} rows={3} {...register(fieldName)} />
          {message && <p className="text-sm text-destructive">{message}</p>}
        </div>
      )
    }

    if (field.type === "select") {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{label}</Label>
          <Controller
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => (
              <Select value={controllerField.value ?? ""} onValueChange={controllerField.onChange}>
                <SelectTrigger id={field.key}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent>
                  {(field.options ?? []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {message && <p className="text-sm text-destructive">{message}</p>}
        </div>
      )
    }

    if (field.type === "multiselect") {
      return (
        <div key={field.key} className="space-y-2">
          <Label>{label}</Label>
          <Controller
            name={fieldName}
            control={control}
            defaultValue={[]}
            render={({ field: controllerField }) => {
              const selected = Array.isArray(controllerField.value) ? controllerField.value : []
              return (
                <div className="space-y-2">
                  {(field.options ?? []).map((option) => {
                    const checked = selected.includes(option)
                    return (
                      <label key={option} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          checked={checked}
                          onChange={() => {
                            const next = checked
                              ? selected.filter((item) => item !== option)
                              : [...selected, option]
                            controllerField.onChange(next)
                          }}
                        />
                        <span>{option}</span>
                      </label>
                    )
                  })}
                </div>
              )
            }}
          />
          {message && <p className="text-sm text-destructive">{message}</p>}
        </div>
      )
    }

    if (field.type === "boolean") {
      return (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{label}</Label>
          <Controller
            name={fieldName}
            control={control}
            render={({ field: controllerField }) => {
              const value = controllerField.value === true ? "true" : controllerField.value === false ? "false" : ""
              return (
                <Select
                  value={value}
                  onValueChange={(next) => {
                    if (next === "") {
                      controllerField.onChange(undefined)
                    } else {
                      controllerField.onChange(next === "true")
                    }
                  }}
                >
                  <SelectTrigger id={field.key}>
                    <SelectValue placeholder="Select yes or no" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              )
            }}
          />
          {message && <p className="text-sm text-destructive">{message}</p>}
        </div>
      )
    }

    const inputType = field.type === "number" ? "number" : field.type === "date" ? "date" : "text"
    const registerOptions =
      field.type === "number"
        ? {
            setValueAs: (value: string) => (value === "" ? undefined : Number(value)),
          }
        : undefined

    return (
      <div key={field.key} className="space-y-2">
        <Label htmlFor={field.key}>{label}</Label>
        <Input
          id={field.key}
          type={inputType}
          min={field.type === "number" ? field.min : undefined}
          max={field.type === "number" ? field.max : undefined}
          {...register(fieldName, registerOptions)}
        />
        {message && <p className="text-sm text-destructive">{message}</p>}
      </div>
    )
  }

  const onSubmit = async (data: StudyFormData) => {
    setIsSubmitting(true)
    try {
      clearErrors("metadata")
      const normalized = { ...data, metadataTemplateId: data.metadataTemplateId || "" }
      const { payload, errors: metadataErrors } = buildStudyPayload(normalized)
      if (metadataErrors) {
        if (metadataErrors.metadataTemplateId) {
          setError("metadataTemplateId", { type: "manual", message: metadataErrors.metadataTemplateId })
        } else {
          applyMetadataErrors(metadataErrors)
        }
        return
      }
      const study = await StudyService.create(payload)
      logger.info("Study created successfully", { studyId: study.id })
      router.push("/my-studies")
    } catch (error) {
      logger.error("Failed to create study", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLaunchWizard = async (data: StudyFormData) => {
    setIsSubmitting(true)
    try {
      clearErrors("metadata")
      const normalized = { ...data, metadataTemplateId: data.metadataTemplateId || "" }
      const { payload, errors: metadataErrors } = buildStudyPayload(normalized)
      if (metadataErrors) {
        if (metadataErrors.metadataTemplateId) {
          setError("metadataTemplateId", { type: "manual", message: metadataErrors.metadataTemplateId })
        } else {
          applyMetadataErrors(metadataErrors)
        }
        return
      }
      const study = await StudyService.create(payload)
      const assessment = await AssessmentService.create(study.id)
      logger.info("Study created and wizard launched", { studyId: study.id, assessmentId: assessment.id })
      router.push(`/assessment/${assessment.id}/wizard`)
    } catch (error) {
      logger.error("Failed to create study and launch wizard", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <Link
          href="/my-studies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Studies
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Study Setup Page</h1>
        <p className="text-muted-foreground mt-2">Create a new observational medical study</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Study</CardTitle>
          <CardDescription>Enter the study details and select which ISO/ICH question set to apply</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="study-name">Study Name</Label>
              <Input id="study-name" placeholder="Enter study name" {...register("studyName")} />
              {errors.studyName && <p className="text-sm text-destructive">{errors.studyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata-template">Metadata Template</Label>
              <Controller
                name="metadataTemplateId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || TEMPLATE_NONE}
                    onValueChange={(value) => {
                      clearErrors("metadataTemplateId")
                      field.onChange(value === TEMPLATE_NONE ? "" : value)
                    }}
                    disabled={templatesLoading}
                  >
                    <SelectTrigger id="metadata-template">
                      <SelectValue
                        placeholder={templatesLoading ? "Loading templates..." : "Select a metadata template"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TEMPLATE_NONE}>No template</SelectItem>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} (v{template.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {templatesError && (
                <p className="text-sm text-destructive">Failed to load templates: {templatesError.message}</p>
              )}
              {errors.metadataTemplateId && (
                <p className="text-sm text-destructive">{errors.metadataTemplateId.message}</p>
              )}
              {!templatesLoading && templates.length === 0 && (
                <Button asChild variant="outline" className="w-fit">
                  <Link href="/metadata-templates/new">Create a metadata template</Link>
                </Button>
              )}
            </div>

            {selectedTemplate && (
              <div className="space-y-4 rounded-md border border-dashed p-4">
                <div>
                  <h3 className="text-sm font-semibold">Metadata Fields</h3>
                  <p className="text-xs text-muted-foreground">
                    Fill out the fields defined by the selected metadata template.
                  </p>
                </div>
                {selectedTemplate.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">This template has no metadata fields.</p>
                ) : (
                  selectedTemplate.fields.map(renderMetadataField)
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="therapeutic-area">Therapeutic Area</Label>
              <Input
                id="therapeutic-area"
                placeholder="e.g., Cardiology, Oncology, Neurology"
                {...register("therapeuticArea")}
              />
              {errors.therapeuticArea && (
                <p className="text-sm text-destructive">{errors.therapeuticArea.message}</p>
              )}
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
                {isSubmitting ? "Saving..." : "Save study metadata"}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(handleLaunchWizard)}
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                <Play className="h-4 w-4" />
                {isSubmitting ? "Launching..." : "Launch risk assessment wizard"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
