import { Card, CardContent } from "@/components/ui/card"

interface WizardQuestionMetadataProps {
  domain?: string
  riskType?: string
  isoReference?: string
}

export function WizardQuestionMetadata({ domain, riskType, isoReference }: WizardQuestionMetadataProps) {
  return (
    <Card className="mt-4 bg-muted/50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Domain:</span>
            <p className="text-muted-foreground">{domain}</p>
          </div>
          <div>
            <span className="font-medium">Risk Type:</span>
            <p className="text-muted-foreground">{riskType}</p>
          </div>
          <div>
            <span className="font-medium">ISO Reference:</span>
            <p className="text-muted-foreground font-mono">{isoReference}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
