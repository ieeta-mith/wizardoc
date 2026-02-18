import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface QuestionFormValues {
  identifier: string
  text: string
  domain: string
  riskType: string
  isoReference: string
}

interface AddQuestionFormProps {
  values: QuestionFormValues
  adding: boolean
  onFieldChange: (field: keyof QuestionFormValues, value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function AddQuestionForm({ values, adding, onFieldChange, onSubmit, onCancel }: AddQuestionFormProps) {
  return (
    <Card className="mb-6 bg-muted/50">
      <CardContent className="pt-6">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="identifier">Identifier</Label>
            <Input
              id="identifier"
              placeholder="e.g., Q-001"
              value={values.identifier}
              onChange={(event) => onFieldChange("identifier", event.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="question-text">Question Text</Label>
            <Input
              id="question-text"
              placeholder="Enter question text"
              value={values.text}
              onChange={(event) => onFieldChange("text", event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="e.g., Study Design"
                value={values.domain}
                onChange={(event) => onFieldChange("domain", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="risk-type">Risk Type</Label>
              <Input
                id="risk-type"
                placeholder="e.g., Protocol Deviation"
                value={values.riskType}
                onChange={(event) => onFieldChange("riskType", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="iso-ref">ISO Reference</Label>
              <Input
                id="iso-ref"
                placeholder="e.g., ISO 10001-3.2"
                value={values.isoReference}
                onChange={(event) => onFieldChange("isoReference", event.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={adding}>
              Cancel
            </Button>
            <Button type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add Question"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
