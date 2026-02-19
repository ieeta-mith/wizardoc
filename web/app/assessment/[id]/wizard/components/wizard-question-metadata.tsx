import { Card, CardContent } from "@/components/ui/card"
import { formatMetadataValue, getQuestionMetadata, toMetadataLabel } from "@/lib/question-metadata"
import type { Question } from "@/lib/types"

interface WizardQuestionMetadataProps {
  question: Question
}

export function WizardQuestionMetadata({ question }: WizardQuestionMetadataProps) {
  const metadata = getQuestionMetadata(question)
  const metadataKeys = Object.keys(metadata)

  if (metadataKeys.length === 0) {
    return null
  }

  return (
    <Card className="mt-4 bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {metadataKeys.map((key) => {
            const value = metadata[key]
            return (
              <div key={key}>
                <span className="font-medium">{toMetadataLabel(key)}:</span>
                <p className="text-muted-foreground break-words">{formatMetadataValue(value)}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
