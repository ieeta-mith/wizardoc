import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface WizardHeaderProps {
  projectId: string
  projectName?: string | null
  currentQuestion: number
  totalQuestions: number
  progress: number
}

export function WizardHeader({ projectId, projectName, currentQuestion, totalQuestions, progress }: WizardHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={`/my-studies/${projectId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Document Wizard</h1>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {projectName}
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
  )
}
