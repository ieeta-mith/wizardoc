import type { Question } from "@/lib/types"

export const buildAnswersByQuestionIndex = (
  answersByQuestionId: Record<string, string>,
  questions: Question[]
): Record<number, string> =>
  questions.reduce(
    (acc, question, index) => {
      const answer = answersByQuestionId[question.id]
      if (answer === undefined) return acc
      acc[index] = answer
      return acc
    },
    {} as Record<number, string>
  )

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
