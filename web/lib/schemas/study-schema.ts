import { z } from "zod"

export const studySchema = z.object({
  studyName: z.string().min(1, "Study name is required"),
  therapeuticArea: z.string().max(50, "Therapeutic area must be less than 50 characters").optional(),
  studyQuestion: z.string().max(500, "Study question must be less than 500 characters").optional(),
  poolId: z.string().min(1, "Please select a question pool"),
})

export type StudyFormData = z.infer<typeof studySchema>
