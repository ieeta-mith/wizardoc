import Link from "next/link"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface WizardLockedStateProps {
  lockedBy: string
}

export function WizardLockedState({ lockedBy }: WizardLockedStateProps) {
  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <Lock className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium">Document is currently being edited</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lockedBy} has this document open. Please try again later.
              </p>
            </div>
            <Button asChild variant="outline" className="mt-2">
              <Link href="/my-studies">Back to Documents</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
