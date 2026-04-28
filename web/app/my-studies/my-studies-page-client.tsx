"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useDocuments } from "@/hooks/use-documents"
import { useCurrentUser } from "@/hooks/use-current-user"
import { DocumentCard, EmptyStudiesState, MyStudiesHeader } from "./components"

export function MyStudiesPageClient() {
  const { items, loading, error, refresh } = useDocuments()
  const { user } = useCurrentUser()

  const documentCountByStudyId = items.reduce((counts, item) => {
    counts.set(item.study.id, (counts.get(item.study.id) ?? 0) + 1)
    return counts
  }, new Map<string, number>())

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-2">Loading your documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading documents: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <MyStudiesHeader />
      {items.length === 0 ? (
        <EmptyStudiesState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map(({ assessment, study, pool }) => (
            <DocumentCard
              key={assessment.id}
              item={{ assessment, study, pool }}
              backingStudyDocumentCount={documentCountByStudyId.get(study.id) ?? 0}
              onDeleteSuccess={refresh}
              onRenameSuccess={refresh}
              currentUserId={user?.id ?? null}
            />
          ))}
        </div>
      )}
    </div>
  )
}
