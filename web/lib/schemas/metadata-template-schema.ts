import { z } from "zod"

export const metadataFieldSchema = z.object({
  key: z.string().min(1, "Field key is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "textarea", "number", "date", "select", "multiselect", "boolean"]),
  required: z.boolean().optional(),
  options: z.string().optional(),
  default: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  regex: z.string().optional(),
})

export const metadataTemplateSchema = z.object({
  name: z.string().min(2, "Template name must be at least 2 characters"),
  version: z.number().int().min(1).optional(),
  fields: z.array(metadataFieldSchema),
})

export type MetadataTemplateFormData = z.infer<typeof metadataTemplateSchema>
