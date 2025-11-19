import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="h-8 w-64 animate-pulse bg-muted rounded mb-2" />
        <div className="h-4 w-96 animate-pulse bg-muted rounded" />
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                <div className="h-4 w-1/2 bg-muted rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="flex gap-2">
                  <div className="h-10 flex-1 bg-muted rounded" />
                  <div className="h-10 flex-1 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
