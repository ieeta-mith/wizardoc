import { Card, CardContent } from "@/components/ui/card"
import type { Question } from "@/lib/types"

interface WizardQuestionMetadataProps {
  question: Question
}

const METADATA_KEY_ORDER = ["identifier", "domain", "riskType", "isoReference"]
const EXCLUDED_KEYS = new Set(["id", "text"])

const toLabel = (key: string) => {
  const withSpaces = key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim()
  return withSpaces ? withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1) : key
}

const formatMetadataValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function WizardQuestionMetadata({ question }: WizardQuestionMetadataProps) {
  const questionRecord = question as Record<string, unknown>
  const metadataKeys = Object.keys(questionRecord).filter((key) => !EXCLUDED_KEYS.has(key))
  const orderedKeys = [
    ...METADATA_KEY_ORDER.filter((key) => metadataKeys.includes(key)),
    ...metadataKeys.filter((key) => !METADATA_KEY_ORDER.includes(key)),
  ]

  if (orderedKeys.length === 0) {
    return null
  }

  return (
    <Card className="mt-4 bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {orderedKeys.map((key) => {
            const value = questionRecord[key]
            return (
              <div key={key}>
                <span className="font-medium">{toLabel(key)}:</span>
                <p className="text-muted-foreground break-words">{formatMetadataValue(value)}</p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
