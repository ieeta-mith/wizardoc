import type { Assessment, QuestionPool } from "@/lib/types"

export interface AssessmentAnswerRow {
  id: string
  question: QuestionPool["questions"][number] | null
  answer: string
}

export const buildAssessmentAnswerRows = (
  assessment: Assessment,
  pool: QuestionPool | null
): AssessmentAnswerRow[] => {
  const answers = assessment.answers ?? {}
  const answerEntries = Object.entries(answers)
  const questionLookup = new Set(pool?.questions.map((question) => question.id) ?? [])

  const orderedRows =
    pool?.questions
      ?.filter((question) => answers[question.id] !== undefined)
      .map((question) => ({
        id: question.id,
        question,
        answer: answers[question.id],
      })) ?? []

  const extraRows = answerEntries
    .filter(([questionId]) => !questionLookup.has(questionId))
    .map(([questionId, answer]) => ({
      id: questionId,
      question: null,
      answer,
    }))

  return pool ? [...orderedRows, ...extraRows] : extraRows
}
