"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useDocuments } from "@/hooks/use-documents"
import { DocumentCard, EmptyStudiesState, MyStudiesHeader } from "./components"

export function MyStudiesPageClient() {
  const { items, loading, error, refresh } = useDocuments()

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
          {items.map(({ assessment, study }) => (
            <DocumentCard
              key={assessment.id}
              item={{ assessment, study }}
              onDeleteSuccess={refresh}
              onRenameSuccess={refresh}
            />
          ))}
        </div>
      )}
    </div>
  )
}
