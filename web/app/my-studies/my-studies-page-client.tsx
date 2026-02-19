"use client"

import { Card, CardContent } from "@/components/ui/card"
import { useStudies } from "@/hooks/use-studies"
import { EmptyStudiesState, MyStudiesHeader, StudiesGrid } from "./components"

export function MyStudiesPageClient() {
  const { studies, loading, error } = useStudies()

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Studies</h1>
          <p className="text-muted-foreground mt-2">Loading your studies...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading studies: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <MyStudiesHeader />
      <StudiesGrid studies={studies} />
      {studies.length === 0 && <EmptyStudiesState />}
    </div>
  )
}
