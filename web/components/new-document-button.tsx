"use client"

import type { ComponentProps } from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssessmentService } from "@/lib/services/assessment-service"
import { logger } from "@/lib/utils/logger"

const inFlightDocumentCreates = new Map<string, Promise<string>>()

interface NewDocumentButtonProps {
  studyId: string
  className?: string
  size?: ComponentProps<typeof Button>["size"]
  variant?: ComponentProps<typeof Button>["variant"]
}

export function NewDocumentButton({
  studyId,
  className,
  size,
  variant,
}: NewDocumentButtonProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const handleClick = async () => {
    if (isCreating) return

    setIsCreating(true)

    let createPromise = inFlightDocumentCreates.get(studyId)

    if (!createPromise) {
      createPromise = (async () => {
        const assessment = await AssessmentService.create(studyId)

        if (!assessment?.id) {
          logger.error("Document created but missing ID", { assessment })
          throw new Error("Invalid response from server")
        }

        return assessment.id
      })()

      inFlightDocumentCreates.set(studyId, createPromise)
    }

    try {
      const assessmentId = await createPromise
      router.push(`/assessment/${assessmentId}/wizard`)
    } catch (error) {
      logger.error("Failed to create document", error)
      setIsCreating(false)
    } finally {
      if (inFlightDocumentCreates.get(studyId) === createPromise) {
        inFlightDocumentCreates.delete(studyId)
      }
    }
  }

  return (
    <Button
      className={className}
      disabled={isCreating}
      onClick={() => void handleClick()}
      size={size}
      variant={variant}
    >
      {isCreating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
      {isCreating ? "Creating..." : "New Document"}
    </Button>
  )
}
