"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { AssessmentService } from "@/lib/services/assessment-service"
import { logger } from "@/lib/utils/logger"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NewAssessmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const studyId = searchParams.get("studyId")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!studyId) {
      setError("No study ID provided")
      return
    }

    const createAssessment = async () => {
      try {
        logger.info("Creating assessment for study", { studyId })
        const assessment = await AssessmentService.create(studyId)

        // Validate assessment was created with a valid ID
        if (!assessment || !assessment.id) {
          logger.error("Assessment created but missing ID", { assessment })
          setError("Failed to create assessment: Invalid response from server")
          return
        }

        logger.info("New assessment created", { assessmentId: assessment.id, studyId })
        router.push(`/assessment/${assessment.id}/wizard`)
      } catch (err) {
        logger.error("Failed to create assessment", err)
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        setError(`Failed to create assessment: ${errorMessage}. Make sure JSON Server is running on port 4000.`)
      }
    }

    createAssessment()
  }, [studyId, router])

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error}</p>
            {studyId && (
              <Link href={`/my-studies/${studyId}`}>
                <Button>Back to Study</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <p>Creating new assessment...</p>
    </div>
  )
}
