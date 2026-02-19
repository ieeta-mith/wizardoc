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
}).catchall(z.union([z.string(), z.number(), z.boolean(), z.null()]))

export type QuestionFormData = z.infer<typeof questionSchema>
