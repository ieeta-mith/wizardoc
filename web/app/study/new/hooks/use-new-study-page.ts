"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { AssessmentService } from "@/lib/services/assessment-service"
import { studySchema, type StudyFormData } from "@/lib/schemas/study-schema"
import { StudyService } from "@/lib/services/study-service"
import { logger } from "@/lib/utils/logger"
import { buildStudyPayload } from "../domain/study-payload"

export function useNewStudyPage() {
  const router = useRouter()
  const { pools, loading: poolsLoading } = useQuestionPools()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      therapeuticArea: "",
      studyQuestion: "",
      poolId: "",
    },
  })

  const saveStudy = async (data: StudyFormData) => {
    setIsSubmitting(true)
    try {
      const study = await StudyService.create(buildStudyPayload(data))
      logger.info("Study created successfully", { studyId: study.id })
      router.push("/my-studies")
    } catch (error) {
      logger.error("Failed to create study", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const launchWizard = async (data: StudyFormData) => {
    setIsSubmitting(true)
    try {
      const study = await StudyService.create(buildStudyPayload(data))
      const assessment = await AssessmentService.create(study.id)
      logger.info("Study created and wizard launched", { studyId: study.id, assessmentId: assessment.id })
      router.push(`/assessment/${assessment.id}/wizard`)
    } catch (error) {
      logger.error("Failed to create study and launch wizard", error)
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
    saveStudy,
  }
}
