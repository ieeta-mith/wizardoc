"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Play } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { studySchema, type StudyFormData } from "@/lib/schemas/study-schema"
import { StudyService } from "@/lib/services/study-service"
import { AssessmentService } from "@/lib/services/assessment-service"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { logger } from "@/lib/utils/logger"
import { useState } from "react"

export default function NewStudyPage() {
  const router = useRouter()
  const { pools, loading: poolsLoading } = useQuestionPools()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudyFormData>({
    resolver: zodResolver(studySchema),
    defaultValues: {
      therapeuticArea: "",
      studyQuestion: "",
      poolId: "",
    },
  })

  const buildStudyPayload = (data: StudyFormData) => {
    const normalizeValue = (value?: string) => {
      const trimmed = value?.trim()
      return trimmed ? trimmed : undefined
    }

    return {
      name: data.studyName,
      therapeuticArea: normalizeValue(data.therapeuticArea),
      studyQuestion: normalizeValue(data.studyQuestion),
      poolId: data.poolId,
    }
  }

  const onSubmit = async (data: StudyFormData) => {
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

  const handleLaunchWizard = async (data: StudyFormData) => {
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

  return (
    <div className="container max-w-3xl py-8">
      <div className="mb-8">
        <Link
          href="/my-studies"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Studies
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Study Setup Page</h1>
        <p className="text-muted-foreground mt-2">Create a new observational medical study</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Study</CardTitle>
          <CardDescription>Enter the study details and select which ISO/ICH question set to apply</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="study-name">Study Name</Label>
              <Input id="study-name" placeholder="Enter study name" {...register("studyName")} />
              {errors.studyName && <p className="text-sm text-destructive">{errors.studyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="therapeutic-area">Therapeutic Area</Label>
              <Input
                id="therapeutic-area"
                placeholder="e.g., Cardiology, Oncology, Neurology"
                {...register("therapeuticArea")}
              />
              {errors.therapeuticArea && (
                <p className="text-sm text-destructive">{errors.therapeuticArea.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="study-question">Study Question</Label>
              <Textarea
                id="study-question"
                placeholder="Describe the primary research question or objective"
                rows={4}
                {...register("studyQuestion")}
              />
              {errors.studyQuestion && <p className="text-sm text-destructive">{errors.studyQuestion.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pool">Select Pool</Label>
              <Controller
                name="poolId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={poolsLoading}>
                    <SelectTrigger id="pool">
                      <SelectValue placeholder={poolsLoading ? "Loading pools..." : "Choose a question pool"} />
                    </SelectTrigger>
                    <SelectContent>
                      {pools.map((pool) => (
                        <SelectItem key={pool.id} value={pool.id}>
                          {pool.name} - {pool.source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.poolId && <p className="text-sm text-destructive">{errors.poolId.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="outline" className="flex-1 gap-2 bg-transparent" disabled={isSubmitting}>
                <Save className="h-4 w-4" />
                {isSubmitting ? "Saving..." : "Save study"}
              </Button>
              <Button
                type="button"
                onClick={handleSubmit(handleLaunchWizard)}
                className="flex-1 gap-2"
                disabled={isSubmitting}
              >
                <Play className="h-4 w-4" />
                {isSubmitting ? "Launching..." : "Launch risk assessment wizard"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
