import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { withBasePath } from "@/lib/base-path"

export function WizardErrorState() {
  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Document not found or no questions available.</p>
          <div className="flex justify-center mt-4">
            <Button asChild>
              <a href={withBasePath("/my-studies")}>Back to Projects</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
