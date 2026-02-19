import type { Question } from "@/lib/types"

export const buildAnswersMapByQuestionId = (
  answersByIndex: Record<number, string>,
  questions: Question[]
): Record<string, string> =>
  Object.entries(answersByIndex).reduce(
    (acc, [key, value]) => {
      const question = questions[Number(key)]
      if (!question) return acc
      acc[question.id] = value
      return acc
    },
    {} as Record<string, string>
  )

export const calculateWizardProgress = (currentQuestion: number, totalQuestions: number) => {
  if (totalQuestions <= 0) return 0
  return ((currentQuestion + 1) / totalQuestions) * 100
}
