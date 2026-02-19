import Link from "next/link"
import { FlaskConical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function EmptyStudiesState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
        <p className="text-sm text-muted-foreground mb-4">Create your first document to get started</p>
        <Link href="/document/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Document
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
