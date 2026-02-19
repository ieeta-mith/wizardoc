import type { Assessment, QuestionPool, Study } from "@/lib/types"
import { formatMetadataValue, getQuestionMetadata, getQuestionMetadataKeys, toMetadataLabel } from "@/lib/question-metadata"

export const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const findQuestionAcrossPools = (questionId: string, pools: QuestionPool[]) => {
  for (const pool of pools) {
    const question = pool.questions.find((entry) => entry.id === questionId)
    if (question) return question
  }
  return null
}

export const buildAssessmentCsv = (assessment: Assessment, pools: QuestionPool[]) => {
  const answerEntries = Object.entries(assessment.answers)
  const metadataKeys = Array.from(
    new Set(
      answerEntries.flatMap(([questionId]) => {
        const question = findQuestionAcrossPools(questionId, pools)
        return getQuestionMetadataKeys(question)
      })
    )
  )

  const headers = [
    "Question ID",
    "Identifier",
    "Question",
    ...metadataKeys.map((key) => toMetadataLabel(key)),
    "Answer",
  ]

  const rows = answerEntries.map(([questionId, answer]) => {
    const question = findQuestionAcrossPools(questionId, pools)
    const metadata = getQuestionMetadata(question)
    return [
      questionId,
      question?.identifier ?? "",
      question?.text ?? "",
      ...metadataKeys.map((key) => formatMetadataValue(metadata[key])),
      answer,
    ]
  })

  const quoteCsv = (cell: unknown) => `"${String(cell ?? "").replace(/"/g, "\"\"")}"`
  return [headers, ...rows].map((row) => row.map((cell) => quoteCsv(cell)).join(",")).join("\n")
}

export const buildAssessmentJson = (assessment: Assessment, study: Study | null) =>
  JSON.stringify(
    {
      assessment,
      study,
      exportDate: new Date().toISOString(),
    },
    null,
    2
  )

export interface MetadataDistribution {
  key: string
  label: string
  values: Array<{ value: string; count: number; fill: string }>
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export const buildMetadataDistributionData = (
  questionPools: QuestionPool[],
  maxFields = 2
): MetadataDistribution[] => {
  const keyCounts = new Map<string, number>()

  questionPools.forEach((pool) => {
    pool.questions.forEach((question) => {
      getQuestionMetadataKeys(question).forEach((key) => {
        keyCounts.set(key, (keyCounts.get(key) ?? 0) + 1)
      })
    })
  })

  const selectedKeys = Array.from(keyCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxFields)
    .map(([key]) => key)

  return selectedKeys.map((key) => {
    const valueCounts: Record<string, number> = {}

    questionPools.forEach((pool) => {
      pool.questions.forEach((question) => {
        const metadata = getQuestionMetadata(question)
        if (!(key in metadata)) return
        const value = formatMetadataValue(metadata[key])
        valueCounts[value] = (valueCounts[value] || 0) + 1
      })
    })

    const values = Object.entries(valueCounts)
      .map(([value, count], index) => ({
        value,
        count,
        fill: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count)

    return {
      key,
      label: toMetadataLabel(key),
      values,
    }
  })
}

export const buildAssessmentStats = (assessments: Assessment[]) => {
  const completedCount = assessments.filter((assessment) => assessment.status === "completed").length
  const inProgressCount = assessments.filter((assessment) => assessment.status === "in-progress").length
  const averageCompletion =
    assessments.length > 0 ? Math.round(assessments.reduce((acc, assessment) => acc + assessment.progress, 0) / assessments.length) : 0

  return {
    averageCompletion,
    completedCount,
    inProgressCount,
    total: assessments.length,
  }
}
