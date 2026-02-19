import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function WizardErrorState() {
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
