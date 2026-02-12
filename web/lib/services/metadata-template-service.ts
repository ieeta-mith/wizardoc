import type { MetadataTemplate } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api"

export class MetadataTemplateService {
  static async getAll(): Promise<MetadataTemplate[]> {
    const response = await fetch(`${API_BASE_URL}/metadata-templates`)

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata templates: ${response.statusText}`)
    }

    const data = await response.json()

    return data.map((template: any) => ({
      ...template,
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt),
    }))
  }

  static async create(template: Omit<MetadataTemplate, "id" | "createdAt" | "updatedAt">): Promise<MetadataTemplate> {
    const response = await fetch(`${API_BASE_URL}/metadata-templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    })

    if (!response.ok) {
      throw new Error(`Failed to create metadata template: ${response.statusText}`)
    }

    const created = await response.json()

    return {
      ...created,
      createdAt: new Date(created.createdAt),
      updatedAt: new Date(created.updatedAt),
    }
  }
}
