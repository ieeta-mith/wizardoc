import type { StudyFormData } from "@/lib/schemas/study-schema"

export const buildStudyPayload = (data: StudyFormData) => {
  const normalizeValue = (value?: string) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
  }

  return {
    name: normalizeValue(data.projectName),
    category: normalizeValue(data.category),
    studyQuestion: normalizeValue(data.projectQuestion),
    poolId: data.templateId,
  }
}
