import { z } from "zod"

export const questionSchema = z.object({
  identifier: z
    .string()
    .min(2, "Identifier must be at least 2 characters")
    .max(50, "Identifier must be less than 50 characters"),
  text: z
    .string()
    .min(10, "Question text must be at least 10 characters")
    .max(500, "Question text must be less than 500 characters"),
  domain: z.string().min(2, "Domain must be at least 2 characters").max(50, "Domain must be less than 50 characters"),
  riskType: z
    .string()
    .min(2, "Risk type must be at least 2 characters")
    .max(50, "Risk type must be less than 50 characters"),
  isoReference: z
    .string()
    .min(5, "ISO reference must be at least 5 characters")
    .max(50, "ISO reference must be less than 50 characters")
    .regex(/^ISO\s+\d+/, "ISO reference must start with 'ISO' followed by a number"),
})

export type QuestionFormData = z.infer<typeof questionSchema>
