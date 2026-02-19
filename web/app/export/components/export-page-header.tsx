import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ExportPageHeaderProps {
  studyId: string
}

export function ExportPageHeader({ studyId }: ExportPageHeaderProps) {
  return (
    <div className="mb-8">
      <Link
        href={`/my-studies/${studyId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Project
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Export & Reports</h1>
          <p className="text-muted-foreground mt-2">Generate reports and analyze document data</p>
        </div>
        <Link href={`/assessment/new?projectId=${studyId}`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </Link>
      </div>
    </div>
  )
}
