"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AssessmentService } from "@/lib/services/assessment-service"
import { logger } from "@/lib/utils/logger"

const inFlightDocumentCreates = new Map<string, Promise<string>>()

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

    let active = true

    const createAssessment = async () => {
      let createPromise = inFlightDocumentCreates.get(studyId)

      if (!createPromise) {
        createPromise = (async () => {
          logger.info("Creating document for project", { studyId })
          const assessment = await AssessmentService.create(studyId)

          if (!assessment || !assessment.id) {
            logger.error("Document created but missing ID", { assessment })
            throw new Error("Invalid response from server")
          }

          logger.info("New document created", { assessmentId: assessment.id, studyId })
          return assessment.id
        })()

        inFlightDocumentCreates.set(studyId, createPromise)
      }

      try {
        const assessmentId = await createPromise
        if (!active) return
        router.replace(`/assessment/${assessmentId}/wizard`)
      } catch (err) {
        if (!active) return
        logger.error("Failed to create document", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(`Failed to create document: ${errorMessage}. Ensure the API is running.`)
      } finally {
        if (inFlightDocumentCreates.get(studyId) === createPromise) {
          inFlightDocumentCreates.delete(studyId)
        }
      }
    }

    createAssessment()
    return () => {
      active = false
    }
  }, [router, studyId])

  return { error, studyId }
}
