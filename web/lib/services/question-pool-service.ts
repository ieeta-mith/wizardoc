import type { QuestionPool, Question } from "@/lib/types"
import { API_BASE_URL } from "./api-base-url"

export class QuestionPoolService {
  /**
   * Get all question pools
   * @returns Array of question pools
   */
  static async getAll(): Promise<QuestionPool[]> {
    const response = await fetch(`${API_BASE_URL}/question-pools`)

    if (!response.ok) {
      throw new Error(`Failed to fetch question pools: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Get a single question pool by ID
   * @param id - The pool ID
   * @returns The pool or null if not found
   */
  static async getById(id: string): Promise<QuestionPool | null> {
    const response = await fetch(`${API_BASE_URL}/question-pools/${id}`, {
      cache: "no-store",
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch question pool: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Create a new question pool
   * @param data - Pool data without id
   * @returns The created pool
   */
  static async create(data: Omit<QuestionPool, "id">): Promise<QuestionPool> {
    const response = await fetch(`${API_BASE_URL}/question-pools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Failed to create question pool: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Add a question to a pool
   * @param poolId - The pool ID
   * @param question - The question to add (without id)
   * @returns The updated pool or null if not found
   */
  static async addQuestion(
    poolId: string,
    question: Omit<Question, "id">
  ): Promise<QuestionPool | null> {
    const pool = await this.getById(poolId)
    if (!pool) return null

    const newQuestion: Question = {
      ...question,
      id: `q${Date.now()}`,
    }

    pool.questions.push(newQuestion)
    pool.questionCount = pool.questions.length

    const response = await fetch(`${API_BASE_URL}/question-pools/${poolId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pool),
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to add question: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Delete a question from a pool
   * @param poolId - The pool ID
   * @param questionId - The question ID
   * @returns The updated pool or null if not found
   */
  static async deleteQuestion(poolId: string, questionId: string): Promise<QuestionPool | null> {
    const pool = await this.getById(poolId)
    if (!pool) return null

    pool.questions = pool.questions.filter((q) => q.id !== questionId)
    pool.questionCount = pool.questions.length

    const response = await fetch(`${API_BASE_URL}/question-pools/${poolId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pool),
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to delete question: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Delete a question pool
   * @param id - The pool ID
   * @returns True if deleted, false if not found
   */
  static async delete(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/question-pools/${id}`, {
      method: "DELETE",
    })

    if (response.status === 404) {
      return false
    }

    if (!response.ok) {
      throw new Error(`Failed to delete question pool: ${response.statusText}`)
    }

    return true
  }

  /**
   * Upload a DOCX file for a question pool
   * @param poolId - The pool ID
   * @param file - The DOCX file
   * @returns The updated pool or null if not found
   */
  static async uploadDocx(poolId: string, file: File): Promise<QuestionPool | null> {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch(`${API_BASE_URL}/question-pools/${poolId}/docx`, {
      method: "POST",
      body: formData,
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to upload DOCX: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Clear all question entries from a pool
   * @param poolId - The pool ID
   * @returns The updated pool or null if not found
   */
  static async clearEntries(poolId: string): Promise<QuestionPool | null> {
    const response = await fetch(`${API_BASE_URL}/question-pools/${poolId}/clear`, {
      method: "POST",
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to clear pool entries: ${response.statusText}`)
    }

    return response.json()
  }
}
