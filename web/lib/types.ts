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

export interface TableColumn {
  key: string
  label: string
}

export interface Question {
  id: string
  identifier?: string
  text: string
  info?: string
  type?: string
  columns?: TableColumn[]
  [key: string]: unknown
}

export interface StudyCollaborator {
  id: string
  email?: string | null
  name?: string | null
}

export interface Study {
  id: string
  owner_id?: string | null
  name?: string | null
  category?: string | null
  studyQuestion?: string | null
  poolId: string
  metadata?: Record<string, unknown>
  shared_with?: StudyCollaborator[]
  createdAt: Date
  updatedAt: Date
}

export interface ShareableUser {
  id: string
  username?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}

export type StudyCreate = Omit<Study, "id" | "owner_id" | "createdAt" | "updatedAt">

export type AnswerProvenance = "user" | "ai" | "ai-edited"

export interface Assessment {
  id: string
  studyId: string
  name: string
  progress: number
  totalQuestions: number
  answeredQuestions: number
  status: "in-progress" | "completed"
  answers: Record<string, string>
  answerProvenance: Record<string, AnswerProvenance>
  createdAt: Date
  updatedAt: Date
  lock_owner_id?: string | null
  lock_owner_name?: string | null
  lock_expires_at?: string | null
}

export interface LockResponse {
  acquired: boolean
  lock_owner_id: string | null
  lock_owner_name: string | null
  lock_expires_at: string | null
}

export interface CurrentUser {
  id: string
  username?: string | null
  email?: string | null
  is_admin: boolean
}
