import { z } from "zod"

export const studySchema = z.object({
  studyName: z
    .string()
    .min(3, "Study name must be at least 3 characters")
    .max(100, "Study name must be less than 100 characters"),
  phase: z.enum(["phase-1", "phase-2", "phase-3", "phase-4", "observational"], {
    required_error: "Please select a study phase",
  }),
  therapeuticArea: z
    .string()
    .min(2, "Therapeutic area must be at least 2 characters")
    .max(50, "Therapeutic area must be less than 50 characters"),
  studyQuestion: z
    .string()
    .min(10, "Study question must be at least 10 characters")
    .max(500, "Study question must be less than 500 characters"),
  poolId: z.string().min(1, "Please select a question pool"),
})

export type StudyFormData = z.infer<typeof studySchema>
