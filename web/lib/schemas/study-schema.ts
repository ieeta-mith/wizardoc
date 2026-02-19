import { z } from "zod"

export const studySchema = z
  .object({
    projectMode: z.enum(["new", "existing"]),
    projectId: z.string().optional(),
    projectName: z.string().max(100, "Project name must be less than 100 characters").optional(),
    category: z.string().max(50, "Category must be less than 50 characters").optional(),
    projectQuestion: z.string().max(500, "Project objective must be less than 500 characters").optional(),
    templateId: z.string().min(1, "Please select a template"),
  })
  .superRefine((data, ctx) => {
    if (data.projectMode === "new" && !data.projectName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Project name is required",
        path: ["projectName"],
      })
    }

    if (data.projectMode === "existing" && !data.projectId?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select an existing project",
        path: ["projectId"],
      })
    }
  })

export type StudyFormData = z.infer<typeof studySchema>
