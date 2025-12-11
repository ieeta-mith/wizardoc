"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useStudies } from "@/hooks/use-studies"
import { Plus, Calendar, FlaskConical } from "lucide-react"
import Link from "next/link"

export default function MyStudiesPage() {
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Studies</h1>
          <p className="text-muted-foreground mt-2">Manage your observational medical studies</p>
        </div>
        <Link href="/study/new">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Study
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studies.map((study) => (
          <Card key={study.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl">{study.name}</CardTitle>
                <Badge variant="secondary">{study.phase}</Badge>
              </div>
              <CardDescription className="flex items-center gap-2 text-xs">
                <Calendar className="h-3 w-3" />
                Created {study.createdAt.toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FlaskConical className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Therapeutic Area:</span>
                  <span className="text-muted-foreground">{study.therapeuticArea}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{study.studyQuestion}</p>
              </div>
              <Link href={`/my-studies/${study.id}`} className="block">
                <Button className="w-full">Select</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {studies.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FlaskConical className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No studies yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first study to get started</p>
            <Link href="/study/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Study
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
