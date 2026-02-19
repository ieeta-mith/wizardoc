import Link from "next/link"
import { Calendar, FlaskConical } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Study } from "@/lib/types"

interface StudyCardProps {
  study: Study
}

export function StudyCard({ study }: StudyCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{study.name}</CardTitle>
          {study.phase && <Badge variant="secondary">{study.phase}</Badge>}
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
            <span className="font-medium">Category:</span>
            <span className="text-muted-foreground">{study.category || "Not set"}</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3">{study.studyQuestion || "No objective provided."}</p>
        </div>
        <Link href={`/my-studies/${study.id}`} className="block">
          <Button className="w-full">Open Project</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
