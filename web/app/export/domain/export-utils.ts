import type { Assessment, QuestionPool, Study } from "@/lib/types"

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
  const headers = ["Question ID", "Domain", "Risk Type", "ISO Reference", "Answer"]
  const rows = Object.entries(assessment.answers).map(([questionId, answer]) => {
    const question = findQuestionAcrossPools(questionId, pools)
    return [questionId, question?.domain || "", question?.riskType || "", question?.isoReference || "", answer]
  })
  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
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

export const buildDomainData = (questionPools: QuestionPool[]) => {
  const domainCounts: Record<string, number> = {}
  questionPools.forEach((pool) => {
    pool.questions.forEach((question) => {
      const domain = question.domain || "Unspecified"
      domainCounts[domain] = (domainCounts[domain] || 0) + 1
    })
  })

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return Object.entries(domainCounts).map(([domain, count], index) => ({
    domain,
    count,
    fill: colors[index % colors.length],
  }))
}

export const buildRiskTypeData = (questionPools: QuestionPool[]) => {
  const riskTypeCounts: Record<string, number> = {}
  questionPools.forEach((pool) => {
    pool.questions.forEach((question) => {
      const riskType = question.riskType || "Unspecified"
      riskTypeCounts[riskType] = (riskTypeCounts[riskType] || 0) + 1
    })
  })

  return Object.entries(riskTypeCounts)
    .map(([riskType, count]) => ({
      riskType,
      count,
    }))
    .sort((a, b) => b.count - a.count)
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
