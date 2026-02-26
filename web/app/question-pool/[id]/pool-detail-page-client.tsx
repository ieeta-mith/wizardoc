"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useQuestionPool } from "@/hooks/use-question-pools"
import { PoolDetailClient } from "./pool-detail-client"

interface PoolDetailPageClientProps {
  id: string
}

export function PoolDetailPageClient({ id }: PoolDetailPageClientProps) {
  const { pool, loading, error } = useQuestionPool(id)
  const { isAdmin } = useCurrentUser()

  if (loading) {
    return (
      <div className="container py-8">
        <p>Loading template details...</p>
      </div>
    )
  }

  if (error || !pool) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Template not found or error loading template</p>
            <Link href="/templates" className="mt-4 inline-block">
              <Button>Back to Template Manager</Button>
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
          href="/templates"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>
      </div>
      <PoolDetailClient pool={pool} canManageTemplates={isAdmin} />
    </div>
  )
}
