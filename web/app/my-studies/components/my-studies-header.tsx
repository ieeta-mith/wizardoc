import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MyStudiesHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2">Group and manage your generated documents by project</p>
      </div>
      <Link href="/document/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New Document
        </Button>
      </Link>
    </div>
  )
}
