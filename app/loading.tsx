import { Card, CardContent } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse bg-muted rounded" />
          <div className="h-4 w-96 animate-pulse bg-muted rounded" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6 space-y-4">
                <div className="h-6 w-3/4 bg-muted rounded" />
                <div className="h-4 w-1/2 bg-muted rounded" />
                <div className="h-20 w-full bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
