export interface QuestionPool {
  id: string
  name: string
  source: string
  questionCount: number
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  domain: string
  riskType: string
  isoReference: string
}

export interface Study {
  id: string
  name: string
  phase: string
  therapeuticArea: string
  studyQuestion: string
  poolId: string
  createdAt: Date
  updatedAt: Date
}

export interface Assessment {
  id: string
  studyId: string
  name: string
  progress: number
  totalQuestions: number
  answeredQuestions: number
  status: "in-progress" | "completed"
  answers: Record<string, string>
  createdAt: Date
  updatedAt: Date
}
