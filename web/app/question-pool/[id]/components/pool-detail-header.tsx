import { Badge } from "@/components/ui/badge"

interface PoolDetailHeaderProps {
  name: string
  source: string
  questionCount: number
}

export function PoolDetailHeader({ name, source, questionCount }: PoolDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        <p className="text-muted-foreground mt-2">{source}</p>
      </div>
      <Badge variant="secondary" className="text-base px-4 py-2">
        Current Questions: {questionCount}
      </Badge>
    </div>
  )
}
