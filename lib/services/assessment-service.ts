import type { Assessment, Study, QuestionPool, Question } from "@/lib/types"
import { StudyService } from "./study-service"
import { QuestionPoolService } from "./question-pool-service"

const API_BASE_URL = "/api"

export interface AssessmentContext {
  assessment: Assessment
  study: Study
  pool: QuestionPool
  questions: Question[]
}

export class AssessmentService {
  /**
   * Get all assessments for a study
   * @param studyId - The study ID
   * @returns Array of assessments
   */
  static async getByStudyId(studyId: string): Promise<Assessment[]> {
    const response = await fetch(`${API_BASE_URL}/assessments?studyId=${studyId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch assessments: ${response.statusText}`)
    }

    const data = await response.json()

    // Convert date strings to Date objects
    return data.map((assessment: any) => ({
      ...assessment,
      createdAt: new Date(assessment.createdAt),
      updatedAt: new Date(assessment.updatedAt),
    }))
  }

  /**
   * Get a single assessment by ID
   * @param id - The assessment ID
   * @returns The assessment or null if not found
   */
  static async getById(id: string): Promise<Assessment | null> {
    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      cache: "no-store",
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch assessment: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }
  }

  /**
   * Get assessment with full context (study, pool, questions)
   * @param id - The assessment ID
   * @returns Assessment context or null if not found
   */
  static async getContextById(id: string): Promise<AssessmentContext | null> {
    const assessment = await this.getById(id)
    if (!assessment) return null

    const study = await StudyService.getById(assessment.studyId)
    if (!study) return null

    const pool = await QuestionPoolService.getById(study.poolId)
    if (!pool) return null

    return {
      assessment,
      study,
      pool,
      questions: pool.questions,
    }
  }

  /**
   * Create a new assessment
   * @param studyId - The study ID
   * @param name - Optional name for the assessment
   * @returns The created assessment
   */
  static async create(studyId: string, name?: string): Promise<Assessment> {
    const study = await StudyService.getById(studyId)
    const pool = study ? await QuestionPoolService.getById(study.poolId) : null
    const totalQuestions = pool?.questionCount || 0

    const newAssessment = {
      studyId,
      name: name || `Assessment ${Date.now()}`,
      progress: 0,
      totalQuestions,
      answeredQuestions: 0,
      status: "in-progress" as const,
      answers: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const response = await fetch(`${API_BASE_URL}/assessments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAssessment),
    })

    if (!response.ok) {
      throw new Error(`Failed to create assessment: ${response.statusText}`)
    }

    const created = await response.json()

    return {
      ...created,
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt),
    }
  }

  /**
   * Update assessment answers
   * @param id - The assessment ID
   * @param answers - The answers object
   * @returns The updated assessment or null if not found
   */
  static async updateAnswers(
    id: string,
    answers: Record<string, string>
  ): Promise<Assessment | null> {
    const assessment = await this.getById(id)
    if (!assessment) return null

    const answeredQuestions = Object.keys(answers).length
    const progress = Math.round((answeredQuestions / assessment.totalQuestions) * 100)

    const updatedAssessment = {
      ...assessment,
      answers,
      answeredQuestions,
      progress,
      updatedAt: new Date().toISOString(),
    }

    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedAssessment),
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to update assessment: ${response.statusText}`)
    }

    const updated = await response.json()

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    }
  }

  /**
   * Complete an assessment
   * @param id - The assessment ID
   * @returns The completed assessment or null if not found
   */
  static async complete(id: string): Promise<Assessment | null> {
    const assessment = await this.getById(id)
    if (!assessment) return null

    const completedAssessment = {
      ...assessment,
      status: "completed" as const,
      progress: 100,
      updatedAt: new Date().toISOString(),
    }

    const response = await fetch(`${API_BASE_URL}/assessments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(completedAssessment),
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to complete assessment: ${response.statusText}`)
    }

    const updated = await response.json()

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    }
  }
}
