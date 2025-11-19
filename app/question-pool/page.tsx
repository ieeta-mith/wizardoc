"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useQuestionPools } from "@/hooks/use-question-pools"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function QuestionPoolPage() {
  const { pools, loading, error } = useQuestionPools()

  if (loading) {
    return (
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Question Pool Manager</h1>
          <p className="text-muted-foreground mt-2">Loading question pools...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading pools: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Question Pool Manager</h1>
        <p className="text-muted-foreground mt-2">Manage your ISO/ICH question sets for risk assessments</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {pools.map((pool) => (
            <Card key={pool.id} className="relative">
              <CardHeader>
                <CardTitle className="text-xl">{pool.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{pool.source}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge variant="secondary" className="text-sm">
                    Current Questions: {pool.questionCount}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Link href={`/question-pool/${pool.id}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit
                    </Button>
                  </Link>
                  <Button variant="destructive" className="flex-1">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center pt-4">
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Pool
          </Button>
        </div>
      </div>
    </div>
  )
}
