"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuestionPool } from "@/hooks/use-question-pools"
import { PoolDetailClient } from "./pool-detail-client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PoolDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { pool, loading, error } = useQuestionPool(id)

  if (loading) {
    return (
      <div className="container py-8">
        <p>Loading pool details...</p>
      </div>
    )
  }

  if (error || !pool) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Pool not found or error loading pool</p>
            <Link href="/question-pool" className="mt-4 inline-block">
              <Button>Back to Question Pools</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Link
          href="/question-pool"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Question Pools
        </Link>
      </div>
      <PoolDetailClient pool={pool} />
    </div>
  )
}
