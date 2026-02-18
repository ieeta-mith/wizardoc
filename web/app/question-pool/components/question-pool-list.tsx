import { Card, CardContent } from "@/components/ui/card"
import type { QuestionPool } from "@/lib/types"
import { QuestionPoolCard } from "./question-pool-card"

interface QuestionPoolListProps {
  pools: QuestionPool[]
  deletingId: string | null
  onDelete: (poolId: string) => void
}

export function QuestionPoolList({ pools, deletingId, onDelete }: QuestionPoolListProps) {
  if (pools.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">
          No question pools yet. Create your first pool to begin.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {pools.map((pool) => (
        <QuestionPoolCard key={pool.id} pool={pool} deletingId={deletingId} onDelete={onDelete} />
      ))}
    </div>
  )
}
