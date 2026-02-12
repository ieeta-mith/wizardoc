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
  identifier: string
  text: string
  domain: string
  riskType: string
  isoReference: string
}

export type MetadataFieldType = "text" | "textarea" | "number" | "date" | "select" | "multiselect" | "boolean"

export interface MetadataFieldDef {
  key: string
  label: string
  type: MetadataFieldType
  required?: boolean
  options?: string[]
  min?: number
  max?: number
  regex?: string
  default?: unknown
}

export interface MetadataTemplate {
  id: string
  name: string
  version: number
  fields: MetadataFieldDef[]
  createdAt: Date
  updatedAt: Date
}

export interface Study {
  id: string
  name?: string | null
  phase?: string | null
  therapeuticArea?: string | null
  studyQuestion?: string | null
  poolId: string
  metadataTemplateId?: string | null
  metadata?: Record<string, unknown>
  metadataTemplateSnapshot?: MetadataFieldDef[] | null
  createdAt: Date
  updatedAt: Date
}

export type StudyCreate = Omit<Study, "id" | "createdAt" | "updatedAt" | "metadataTemplateSnapshot">

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
