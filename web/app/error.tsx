"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { logger } from "@/lib/utils/logger"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("Application error", error)
  }, [error])

  return (
    <div className="container max-w-2xl py-16">
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle>Something went wrong</CardTitle>
              <CardDescription>An unexpected error occurred</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-mono text-muted-foreground">{error.message}</p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: <span className="font-mono">{error.digest}</span>
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          <Button onClick={reset} className="flex-1">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/my-studies")} variant="outline" className="flex-1">
            Go to Projects
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
