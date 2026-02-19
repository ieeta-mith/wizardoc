import { useEffect, useState } from "react"
import { ArrowLeft, Check, Pencil, X } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface WizardHeaderProps {
  projectId: string
  projectName?: string | null
  documentName: string
  isRenaming: boolean
  renameError: string | null
  onRenameDocument: (name: string) => Promise<boolean>
  currentQuestion: number
  totalQuestions: number
  progress: number
}

export function WizardHeader({
  projectId,
  projectName,
  documentName,
  isRenaming,
  renameError,
  onRenameDocument,
  currentQuestion,
  totalQuestions,
  progress,
}: WizardHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(documentName)

  useEffect(() => {
    setNameDraft(documentName)
  }, [documentName])

  const saveName = async () => {
    const ok = await onRenameDocument(nameDraft)
    if (ok) {
      setIsEditingName(false)
    }
  }

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Wizard</h1>
          {isEditingName ? (
            <div className="mt-1 flex max-w-md items-center gap-1">
              <Input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                placeholder="Document name"
                maxLength={120}
                className="h-8"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void saveName()
                  }
                  if (event.key === "Escape") {
                    setNameDraft(documentName)
                    setIsEditingName(false)
                  }
                }}
              />
              <Button type="button" size="icon-sm" onClick={() => void saveName()} disabled={isRenaming}>
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => {
                  setNameDraft(documentName)
                  setIsEditingName(false)
                }}
                disabled={isRenaming}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1">
              <p className="text-sm text-muted-foreground">{documentName}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Edit document name"
                onClick={() => setIsEditingName(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {renameError && <p className="mt-1 text-xs text-destructive">{renameError}</p>}
        </div>
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
