"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { AssessmentService } from "@/lib/services/assessment-service"
import { documentSchema, type DocumentFormData } from "@/lib/schemas/document-schema"
import { StudyService } from "@/lib/services/study-service"
import { logger } from "@/lib/utils/logger"

export function useNewStudyPage() {
  const router = useRouter()
  const { pools, loading: poolsLoading } = useQuestionPools()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: "",
      templateId: "",
    },
  })

  const launchWizard = async (data: DocumentFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const study = await StudyService.create({
        name: data.name.trim(),
        poolId: data.templateId,
        metadata: {
          documentFirst: true,
        },
      })
      const assessment = await AssessmentService.create(study.id, data.name.trim())
      router.push(`/assessment/${assessment.id}/wizard`)
    } catch (error) {
      logger.error("Failed to create document", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to create document")
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    form,
    isSubmitting,
    launchWizard,
    pools,
    poolsLoading,
    submitError,
  }
}
