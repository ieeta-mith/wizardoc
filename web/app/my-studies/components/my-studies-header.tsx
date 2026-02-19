import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MyStudiesHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Workspace</h1>
        <p className="text-muted-foreground mt-2">Manage your current and past documents for observational medical studies</p>
      </div>
      <Link href="/study/new">
        <Button size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          New Study
        </Button>
      </Link>
    </div>
  )
}
