"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AssessmentService } from "@/lib/services/assessment-service"
import { logger } from "@/lib/utils/logger"

export function useNewAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studyId = searchParams.get("projectId") ?? searchParams.get("studyId")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studyId) {
      setError("No project ID provided")
      return
    }

    const createAssessment = async () => {
      try {
        logger.info("Creating document for project", { studyId })
        const assessment = await AssessmentService.create(studyId)

        if (!assessment || !assessment.id) {
          logger.error("Document created but missing ID", { assessment })
          setError("Failed to create document: Invalid response from server")
          return
        }

        logger.info("New document created", { assessmentId: assessment.id, studyId })
        router.push(`/assessment/${assessment.id}/wizard`)
      } catch (err) {
        logger.error("Failed to create document", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(`Failed to create document: ${errorMessage}. Ensure the API is running.`)
      }
    }

    createAssessment()
  }, [router, studyId])

  return { error, studyId }
}
