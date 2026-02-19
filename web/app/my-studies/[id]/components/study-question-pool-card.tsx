import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuestionPool } from "@/lib/types"
import { formatFileSize, formatUploadedAt } from "../domain"

interface StudyQuestionPoolCardProps {
  pool: QuestionPool | null
  poolLoading: boolean
  poolError: Error | null
}

export function StudyQuestionPoolCard({ pool, poolLoading, poolError }: StudyQuestionPoolCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Pool</CardTitle>
        <CardDescription>Details for the pool used by this study</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {poolLoading && <p className="text-sm text-muted-foreground">Loading question pool...</p>}
        {poolError && <p className="text-sm text-destructive">Error loading pool: {poolError.message}</p>}
        {!poolLoading && !poolError && !pool && <p className="text-sm text-muted-foreground">Question pool not available.</p>}
        {pool && (
          <>
            <div>
              <h4 className="text-sm font-medium mb-1">Pool Name</h4>
              <p className="text-sm text-muted-foreground">{pool.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Source</h4>
              <p className="text-sm text-muted-foreground">{pool.source}</p>
            </div>
            <div className="rounded-md border border-dashed px-4 py-3">
              <div>
                <p className="text-sm font-medium">DOCX file</p>
                {pool.docxFile ? (
                  <p className="text-xs text-muted-foreground">
                    {pool.docxFile.filename} · {formatFileSize(pool.docxFile.size)} · Uploaded{" "}
                    {formatUploadedAt(pool.docxFile.uploadedAt)}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No DOCX file uploaded yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
