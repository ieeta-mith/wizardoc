"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNewAssessmentPage } from "./hooks"

export function NewAssessmentPageClient() {
  const { error, studyId } = useNewAssessmentPage()

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error}</p>
            {studyId && (
              <Link href={`/my-studies/${studyId}`}>
                <Button>Back to Study</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <p>Creating new assessment...</p>
    </div>
  )
}
