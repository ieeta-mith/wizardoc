import type { StudyFormData } from "@/lib/schemas/study-schema"

export const buildStudyPayload = (data: StudyFormData) => {
  const normalizeValue = (value?: string) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
  }

  return {
    name: normalizeValue(data.projectName),
    therapeuticArea: normalizeValue(data.therapeuticArea),
    studyQuestion: normalizeValue(data.projectQuestion),
    poolId: data.templateId,
  }
}
