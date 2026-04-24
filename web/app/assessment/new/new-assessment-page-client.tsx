"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNewAssessmentPage } from "./hooks"

export function NewAssessmentPageClient() {
  const { error } = useNewAssessmentPage()

  if (error) {
    return (
      <div className="container py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error}</p>
            <Button asChild>
              <Link href="/my-studies">Back to Documents</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <p>Creating new document...</p>
    </div>
  )
}
