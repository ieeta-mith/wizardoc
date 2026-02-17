import type { Study, StudyCreate } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api"

export class StudyService {
  /**
   * Get all studies
   */
  static async getAll(): Promise<Study[]> {
    const response = await fetch(`${API_BASE_URL}/studies`)

    if (!response.ok) {
      throw new Error(`Failed to fetch studies: ${response.statusText}`)
    }

    const data = await response.json()

    // Convert date strings to Date objects
    return data.map((study: any) => ({
      ...study,
      createdAt: new Date(study.createdAt),
      updatedAt: new Date(study.updatedAt),
    }))
  }

  /**
   * Get a single study by ID
   * @param id - The study ID
   * @returns The study or null if not found
   */
  static async getById(id: string): Promise<Study | null> {
    const response = await fetch(`${API_BASE_URL}/studies/${id}`, {
      cache: "no-store",
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch study: ${response.statusText}`)
    }

    const data = await response.json()

    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    }
  }

  /**
   * Create a new study
   * @param data - Study data without id and timestamps
   * @returns The created study
   */
  static async create(data: StudyCreate): Promise<Study> {
    const newStudy = {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const response = await fetch(`${API_BASE_URL}/studies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudy),
    })

    if (!response.ok) {
      throw new Error(`Failed to create study: ${response.statusText}`)
    }

    const created = await response.json()

    return {
      ...created,
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt),
    }
  }

  /**
   * Update an existing study
   * @param id - The study ID
   * @param data - Partial study data to update
   * @returns The updated study or null if not found
   */
  static async update(id: string, data: Partial<StudyCreate>): Promise<Study | null> {
    // First check if the study exists
    const existing = await this.getById(id)
    if (!existing) return null

    const updatedData = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    }

    const response = await fetch(`${API_BASE_URL}/studies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to update study: ${response.statusText}`)
    }

    const updated = await response.json()

    return {
      ...updated,
      createdAt: new Date(updated.createdAt),
      updatedAt: new Date(updated.updatedAt),
    }
  }

  /**
   * Delete a study
   * @param id - The study ID
   * @returns True if deleted, false if not found
   */
  static async delete(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/studies/${id}`, {
      method: "DELETE",
    })

    if (response.status === 404) {
      return false
    }

    if (!response.ok) {
      throw new Error(`Failed to delete study: ${response.statusText}`)
    }

    return true
  }
}
