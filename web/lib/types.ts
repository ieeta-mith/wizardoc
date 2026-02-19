export interface QuestionPool {
  id: string
  name: string
  source: string
  questionCount: number
  questions: Question[]
  docxFile?: DocxFile | null
}

export interface DocxFile {
  filename: string
  contentType: string
  size: number
  uploadedAt: string
}

export interface Question {
  id: string
  identifier?: string
  text: string
  domain?: string
  riskType?: string
  isoReference?: string
  [key: string]: unknown
}

export interface Study {
  id: string
  name?: string | null
  phase?: string | null
  category?: string | null
  studyQuestion?: string | null
  poolId: string
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type StudyCreate = Omit<Study, "id" | "createdAt" | "updatedAt">

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
