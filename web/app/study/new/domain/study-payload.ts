import type { StudyFormData } from "@/lib/schemas/study-schema"

export const buildStudyPayload = (data: StudyFormData) => {
  const normalizeValue = (value?: string) => {
    const trimmed = value?.trim()
    return trimmed ? trimmed : undefined
  }

  return {
    name: data.studyName,
    therapeuticArea: normalizeValue(data.therapeuticArea),
    studyQuestion: normalizeValue(data.studyQuestion),
    poolId: data.poolId,
  }
}
