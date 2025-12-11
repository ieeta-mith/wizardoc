"use client"

import { Info, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RISK_LEVEL_STYLES, type RiskLevel } from "@/lib/constants/risk"

interface ResultsDisplayProps {
  score: number
  riskLevel: RiskLevel
  recommendations: string[]
  onReset: () => void
}

export function ResultsDisplay({ score, riskLevel, recommendations, onReset }: ResultsDisplayProps) {
  const getRiskColor = (level: RiskLevel) => {
    return RISK_LEVEL_STYLES[level] || "bg-muted text-muted-foreground"
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">Assessment Results</CardTitle>
            <Badge className={getRiskColor(riskLevel)} variant="secondary">
              {riskLevel} Risk
            </Badge>
          </div>
          <CardDescription>Your risk assessment has been completed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Risk Score</p>
              <p className="text-5xl font-bold text-foreground">{score}</p>
              <p className="text-sm text-muted-foreground">out of 100</p>
            </div>
          </div>

          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Recommendations</h3>
              <div className="space-y-2">
                {recommendations.map((recommendation, index) => (
                  <Alert key={index}>
                    <AlertDescription>{recommendation}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This assessment is for informational purposes only and does not constitute medical or professional advice.
              Please consult with a qualified professional for specific guidance.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={onReset} variant="outline" className="w-full gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Start Over
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
