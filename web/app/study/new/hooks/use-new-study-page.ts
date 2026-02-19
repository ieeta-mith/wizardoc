"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { useStudies } from "@/hooks/use-studies"
import { AssessmentService } from "@/lib/services/assessment-service"
import { studySchema, type StudyFormData } from "@/lib/schemas/study-schema"
import { StudyService } from "@/lib/services/study-service"
import { logger } from "@/lib/utils/logger"
import { buildStudyPayload } from "../domain/study-payload"

export function useNewStudyPage() {
  const router = useRouter()
  const { pools, loading: poolsLoading } = useQuestionPools()
  const { studies, loading: studiesLoading } = useStudies()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      projectMode: "new",
      projectId: "",
      projectName: "",
      category: "",
      projectQuestion: "",
      templateId: "",
    },
  })

  const saveProject = async (data: StudyFormData) => {
    if (data.projectMode !== "new") return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const study = await StudyService.create(buildStudyPayload(data))
      logger.info("Project created successfully", { studyId: study.id })
      router.push(`/my-studies/${study.id}`)
    } catch (error) {
      logger.error("Failed to create project", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to create project")
    } finally {
      setIsSubmitting(false)
    }
  }

  const launchWizard = async (data: StudyFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const studyId =
        data.projectMode === "existing"
          ? data.projectId
          : (await StudyService.create(buildStudyPayload(data))).id

      if (!studyId) {
        throw new Error("Missing project context")
      }

      const assessment = await AssessmentService.create(studyId)
      logger.info("Document wizard launched", { studyId, assessmentId: assessment.id })
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
    saveProject,
    studies,
    studiesLoading,
    submitError,
  }
}
