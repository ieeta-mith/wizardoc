import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { QuestionPool } from "@/lib/types"

interface QuestionPoolCardProps {
  pool: QuestionPool
  deletingId: string | null
  onDelete: (poolId: string) => void
}

export function QuestionPoolCard({ pool, deletingId, onDelete }: QuestionPoolCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle className="text-xl">{pool.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{pool.source}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant="secondary" className="text-sm">
            Questions: {pool.questionCount}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/templates/${pool.id}`} className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => onDelete(pool.id)}
            disabled={deletingId === pool.id}
          >
            {deletingId === pool.id ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
