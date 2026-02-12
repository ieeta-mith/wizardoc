"use client"

import { useMemo, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Save, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { logger } from "@/lib/utils/logger"
import { MetadataTemplateService } from "@/lib/services/metadata-template-service"
import {
  metadataTemplateSchema,
  type MetadataTemplateFormData,
} from "@/lib/schemas/metadata-template-schema"
import type { MetadataFieldDef, MetadataFieldType } from "@/lib/types"

const FIELD_TYPES: MetadataFieldType[] = [
  "text",
  "textarea",
  "number",
  "date",
  "select",
  "multiselect",
  "boolean",
]

const buildOptionsList = (raw?: string) =>
  raw
    ?.split(",")
    .map((option) => option.trim())
    .filter(Boolean) ?? []

const parseDefaultValue = (type: MetadataFieldType, raw?: string, options?: string[]) => {
  if (!raw) return undefined
  switch (type) {
    case "number": {
      const value = Number(raw)
      return Number.isFinite(value) ? value : undefined
    }
    case "boolean":
      if (raw === "true") return true
      if (raw === "false") return false
      return undefined
    case "multiselect": {
      const values = buildOptionsList(raw)
      return values.length > 0 ? values : undefined
    }
    case "select":
      return options?.includes(raw) ? raw : raw
    default:
      return raw
  }
}

const mapImportedField = (field: MetadataFieldDef) => ({
  key: field.key ?? "",
  label: field.label ?? "",
  type: field.type ?? "text",
  required: Boolean(field.required),
  options: field.options?.join(", ") ?? "",
  default:
    field.default === undefined || field.default === null
      ? ""
      : Array.isArray(field.default)
      ? field.default.join(", ")
      : String(field.default),
  min: field.min ?? undefined,
  max: field.max ?? undefined,
  regex: field.regex ?? "",
})

export default function MetadataTemplateNewPage() {
  const router = useRouter()
  const [importError, setImportError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MetadataTemplateFormData>({
    resolver: zodResolver(metadataTemplateSchema),
    defaultValues: {
      name: "",
      version: 1,
      fields: [],
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "fields",
  })

  const fieldValues = watch("fields")

  const onImportFile = async (file: File) => {
    setImportError("")
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid JSON structure")
      }
      if (!Array.isArray(parsed.fields)) {
        throw new Error("Template JSON must include a fields array")
      }

      const mappedFields = parsed.fields.map((field: MetadataFieldDef) => mapImportedField(field))
      setValue("name", parsed.name ?? "")
      setValue("version", parsed.version ?? 1)
      replace(mappedFields)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to import template JSON")
    }
  }

  const validateDuplicateKeys = (fieldsInput: MetadataTemplateFormData["fields"]) => {
    const keyMap = new Map<string, number[]>()
    fieldsInput.forEach((field, index) => {
      if (!field.key) return
      const list = keyMap.get(field.key) ?? []
      list.push(index)
      keyMap.set(field.key, list)
    })

    let hasDuplicates = false
    keyMap.forEach((indexes, key) => {
      if (indexes.length <= 1) return
      hasDuplicates = true
      indexes.forEach((index) => {
        setError(`fields.${index}.key`, {
          type: "manual",
          message: `Duplicate key: ${key}`,
        })
      })
    })

    return hasDuplicates
  }

  const onSubmit = async (data: MetadataTemplateFormData) => {
    setIsSubmitting(true)
    try {
      if (validateDuplicateKeys(data.fields)) {
        return
      }

      const payloadFields = data.fields.map((field) => {
        const options = buildOptionsList(field.options)
        const parsedDefault = parseDefaultValue(field.type, field.default, options)

        return {
          key: field.key,
          label: field.label,
          type: field.type,
          required: Boolean(field.required),
          options: field.type === "select" || field.type === "multiselect" ? options : undefined,
          min: field.min,
          max: field.max,
          regex: field.regex || undefined,
          default: parsedDefault,
        }
      })

      await MetadataTemplateService.create({
        name: data.name,
        version: data.version ?? 1,
        fields: payloadFields,
      })
      router.push("/study/new")
    } catch (error) {
      logger.error("Failed to create metadata template", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const jsonExample = useMemo(
    () =>
      JSON.stringify(
        {
          name: "Observational Metadata",
          version: 1,
          fields: [
            {
              key: "site_count",
              label: "Number of Sites",
              type: "number",
              required: true,
              min: 1,
            },
            {
              key: "region",
              label: "Region",
              type: "select",
              options: ["NA", "EU", "APAC"],
            },
            {
              key: "blinded",
              label: "Blinded",
              type: "boolean",
            },
          ],
        },
        null,
        2
      ),
    []
  )

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Link
          href="/study/new"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Study Setup
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Metadata Template</h1>
        <p className="text-muted-foreground mt-2">
          Create a reusable metadata template for study setup.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Template Builder</CardTitle>
            <CardDescription>Define fields and defaults for the metadata template.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input id="template-name" placeholder="e.g., Observational Metadata" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version</Label>
                <Input
                  id="version"
                  type="number"
                  min={1}
                  {...register("version", {
                    valueAsNumber: true,
                    setValueAs: (value) => (value === "" ? undefined : Number(value)),
                  })}
                />
                {errors.version && <p className="text-sm text-destructive">{errors.version.message}</p>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Fields</h3>
                    <p className="text-xs text-muted-foreground">Add fields to capture study metadata.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() =>
                      append({
                        key: "",
                        label: "",
                        type: "text",
                        required: false,
                        options: "",
                        default: "",
                        min: undefined,
                        max: undefined,
                        regex: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                    Add Field
                  </Button>
                </div>

                {fields.length === 0 && (
                  <p className="text-sm text-muted-foreground">No fields added yet.</p>
                )}

                {fields.map((field, index) => {
                  const currentType = fieldValues?.[index]?.type ?? field.type
                  const showOptions = currentType === "select" || currentType === "multiselect"
                  return (
                    <div key={field.id} className="space-y-4 rounded-md border border-dashed p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Field Key</Label>
                          <Input placeholder="e.g., site_count" {...register(`fields.${index}.key`)} />
                          {errors.fields?.[index]?.key && (
                            <p className="text-sm text-destructive">{errors.fields[index]?.key?.message}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Field Label</Label>
                          <Input placeholder="e.g., Number of Sites" {...register(`fields.${index}.label`)} />
                          {errors.fields?.[index]?.label && (
                            <p className="text-sm text-destructive">{errors.fields[index]?.label?.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Controller
                            name={`fields.${index}.type`}
                            control={control}
                            render={({ field: controllerField }) => (
                              <Select value={controllerField.value} onValueChange={controllerField.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {FIELD_TYPES.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Required</Label>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              {...register(`fields.${index}.required`)}
                            />
                            <span>Mark as required</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Default</Label>
                          <Input placeholder="Optional default" {...register(`fields.${index}.default`)} />
                        </div>
                      </div>

                      {showOptions && (
                        <div className="space-y-2">
                          <Label>Options (comma separated)</Label>
                          <Input placeholder="Option 1, Option 2" {...register(`fields.${index}.options`)} />
                        </div>
                      )}

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Min</Label>
                          <Input
                            type="number"
                            {...register(`fields.${index}.min`, {
                              valueAsNumber: true,
                              setValueAs: (value) => (value === "" ? undefined : Number(value)),
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Max</Label>
                          <Input
                            type="number"
                            {...register(`fields.${index}.max`, {
                              valueAsNumber: true,
                              setValueAs: (value) => (value === "" ? undefined : Number(value)),
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Regex</Label>
                          <Input placeholder="Optional pattern" {...register(`fields.${index}.regex`)} />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button type="button" variant="outline" onClick={() => remove(index)}>
                          Remove Field
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 gap-2" disabled={isSubmitting}>
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save metadata template"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import JSON</CardTitle>
            <CardDescription>Upload a JSON file that matches the metadata template structure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="json-file">Template JSON file</Label>
              <Input
                id="json-file"
                type="file"
                accept="application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) {
                    onImportFile(file)
                  }
                }}
              />
              {importError && <p className="text-sm text-destructive">{importError}</p>}
            </div>
            <div className="space-y-2">
              <Label>Expected JSON format</Label>
              <Textarea value={jsonExample} readOnly rows={12} className="font-mono text-xs" />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                navigator.clipboard.writeText(jsonExample).catch(() => undefined)
              }}
            >
              <Upload className="h-4 w-4" />
              Copy example JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
