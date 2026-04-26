import { z } from "zod"

export const documentSchema = z.object({
  name: z.string().min(1, "Please enter a document name").max(120, "Name must be less than 120 characters"),
  templateId: z.string().min(1, "Please select a template"),
})

export type DocumentFormData = z.infer<typeof documentSchema>
