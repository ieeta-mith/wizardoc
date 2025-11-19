"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { useAssessmentContext } from "@/hooks/use-assessment"
import { usePersistedState } from "@/hooks/use-persisted-state"
import { AssessmentService } from "@/lib/services/assessment-service"
import { logger } from "@/lib/utils/logger"

export default function WizardPage() {
  const router = useRouter()
  const params = useParams()
  const assessmentId = params.id as string

  const { context, loading, error } = useAssessmentContext(assessmentId)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = usePersistedState<Record<number, string>>(
    `assessment-${assessmentId}-answers`,
    {}
  )
  const [isSaving, setIsSaving] = useState(false)

  // Restore progress from assessment if available
  useEffect(() => {
    if (context?.assessment && context.assessment.status === "in-progress") {
      setCurrentQuestion(context.assessment.answeredQuestions)
    }
  }, [context])

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <p>Loading assessment...</p>
      </div>
    )
  }

  if (error || !context) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Assessment not found or no questions available.</p>
            <div className="flex justify-center mt-4">
              <Button asChild>
                <Link href="/my-studies">Back to My Studies</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { assessment, study, questions } = context
  const totalQuestions = questions.length
  const progress = ((currentQuestion + 1) / totalQuestions) * 100
  const currentQuestionData = questions[currentQuestion]

  const handleNext = async () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Complete the assessment
      setIsSaving(true)
      try {
        const answersMap = Object.entries(answers).reduce(
          (acc, [key, value]) => {
            acc[questions[Number(key)].id] = value
            return acc
          },
          {} as Record<string, string>
        )
        await AssessmentService.updateAnswers(assessmentId, answersMap)
        await AssessmentService.complete(assessmentId)
        logger.info("Assessment completed", { assessmentId })
        router.push(`/my-studies/${study.id}`)
      } catch (err) {
        logger.error("Failed to complete assessment", err)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const answersMap = Object.entries(answers).reduce(
        (acc, [key, value]) => {
          acc[questions[Number(key)].id] = value
          return acc
        },
        {} as Record<string, string>
      )
      await AssessmentService.updateAnswers(assessmentId, answersMap)
      logger.info("Assessment progress saved", { assessmentId })
      router.push(`/my-studies/${study.id}`)
    } catch (err) {
      logger.error("Failed to save assessment", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <Link
          href={`/my-studies/${study.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Study
        </Link>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Risk Assessment Wizard</h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {study.name}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Question {currentQuestion + 1} of {totalQuestions}
            </span>
            <span className="font-medium">{Math.round(progress)}% Progress</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            Question {currentQuestion + 1}
            <span className="block text-sm font-normal text-muted-foreground mt-2">{currentQuestionData.text}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            placeholder="Enter your answer here..."
            value={answers[currentQuestion] || ""}
            onChange={(e) =>
              setAnswers({
                ...answers,
                [currentQuestion]: e.target.value,
              })
            }
            rows={8}
            className="resize-none"
          />

          <div className="flex gap-3">
            <Button onClick={handlePrevious} variant="outline" disabled={currentQuestion === 0} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext} className="flex-1" disabled={isSaving}>
              {currentQuestion < totalQuestions - 1 ? (
                <>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : isSaving ? (
                "Completing..."
              ) : (
                "Complete Assessment"
              )}
            </Button>
            <Button onClick={handleSave} variant="outline" className="gap-2 bg-transparent" disabled={isSaving}>
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4 bg-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Domain:</span>
              <p className="text-muted-foreground">{currentQuestionData.domain}</p>
            </div>
            <div>
              <span className="font-medium">Risk Type:</span>
              <p className="text-muted-foreground">{currentQuestionData.riskType}</p>
            </div>
            <div>
              <span className="font-medium">ISO Reference:</span>
              <p className="text-muted-foreground font-mono">{currentQuestionData.isoReference}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
