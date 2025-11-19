"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { AssessmentService } from "@/lib/services/assessment-service"
import { logger } from "@/lib/utils/logger"
import { Card, CardContent } from "@/components/ui/card"

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
        const assessment = await AssessmentService.create(studyId)
        logger.info("New assessment created", { assessmentId: assessment.id, studyId })
        router.push(`/assessment/${assessment.id}/wizard`)
      } catch (err) {
        logger.error("Failed to create assessment", err)
        setError("Failed to create assessment")
      }
    }

    createAssessment()
  }, [studyId, router])

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
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
