import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface CreatePoolFormValues {
  name: string
  source: string
}

interface CreatePoolFormProps {
  values: CreatePoolFormValues
  creating: boolean
  onChange: (field: keyof CreatePoolFormValues, value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

export function CreatePoolForm({ values, creating, onChange, onSubmit, onCancel }: CreatePoolFormProps) {
  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="pool-name">Template Name</Label>
            <Input
              id="pool-name"
              value={values.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="e.g., ISO 14155:2020 Medical Devices"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pool-source">Source / Standard</Label>
            <Input
              id="pool-source"
              value={values.source}
              onChange={(event) => onChange("source", event.target.value)}
              placeholder="e.g., ISO 14155"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
