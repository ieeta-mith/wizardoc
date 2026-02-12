"use client"

import { useEffect, useState } from "react"
import type { MetadataTemplate } from "@/lib/types"
import { MetadataTemplateService } from "@/lib/services/metadata-template-service"

export function useMetadataTemplates() {
  const [templates, setTemplates] = useState<MetadataTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    MetadataTemplateService.getAll()
      .then(setTemplates)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const refresh = async () => {
    setLoading(true)
    try {
      const data = await MetadataTemplateService.getAll()
      setTemplates(data)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return { templates, loading, error, refresh }
}
