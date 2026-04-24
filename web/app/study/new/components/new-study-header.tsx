import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function NewStudyHeader() {
  return (
    <div className="mb-8">
      <Link
        href="/my-studies"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Documents
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">New Document</h1>
      <p className="text-muted-foreground mt-2">Choose a template and name your document</p>
    </div>
  )
}
