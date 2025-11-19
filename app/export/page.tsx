"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Download, FileText, Plus, BarChart3 } from "lucide-react"
import Link from "next/link"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, Pie, PieChart as RePieChart, Cell, XAxis, YAxis, CartesianGrid } from "recharts"
import { StudyService } from "@/lib/services/study-service"
import { AssessmentService } from "@/lib/services/assessment-service"
import { QuestionPoolService } from "@/lib/services/question-pool-service"
import type { Study, Assessment, QuestionPool } from "@/lib/types"
import { pdf } from "@react-pdf/renderer"
import { AssessmentPDFDocument } from "@/lib/pdf-generator"

export default function ExportPage() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("assessmentId")

  // State for fetched data
  const [study, setStudy] = useState<Study | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [questionPools, setQuestionPools] = useState<QuestionPool[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [studyData, poolsData] = await Promise.all([
          StudyService.getById("1"), // TODO: Get studyId from route params
          QuestionPoolService.getAll(),
        ])

        if (studyData) {
          setStudy(studyData)
          const assessmentsData = await AssessmentService.getByStudyId(studyData.id)
          setAssessments(assessmentsData)
        }

        setQuestionPools(poolsData)
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const completedAssessments = assessments.filter((a) => a.status === "completed")

  const handleExport = async (assessmentId: string, format: string) => {
    const assessment = assessments.find((a) => a.id === assessmentId)
    if (!assessment) return

    let content = ""
    let filename = ""
    let mimeType = ""
    let blob: Blob | null = null

    if (format === "json") {
      content = JSON.stringify(
        {
          assessment,
          study,
          exportDate: new Date().toISOString(),
        },
        null,
        2,
      )
      filename = `assessment-${assessmentId}-${Date.now()}.json`
      mimeType = "application/json"
      blob = new Blob([content], { type: mimeType })
    } else if (format === "csv") {
      // Generate CSV with assessment data
      const headers = ["Question ID", "Domain", "Risk Type", "ISO Reference", "Answer"]
      const rows = Object.entries(assessment.answers).map(([qId, answer]) => {
        // Find question across all pools
        let question = null
        for (const pool of questionPools) {
          question = pool.questions.find((q) => q.id === qId)
          if (question) break
        }
        return [qId, question?.domain || "", question?.riskType || "", question?.isoReference || "", answer]
      })
      content = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
      filename = `assessment-${assessmentId}-${Date.now()}.csv`
      mimeType = "text/csv"
      blob = new Blob([content], { type: mimeType })
    } else if (format === "pdf") {
      // Generate PDF using @react-pdf/renderer
      filename = `assessment-${assessmentId}-${Date.now()}.pdf`
      mimeType = "application/pdf"

      const pdfDoc = <AssessmentPDFDocument assessment={assessment} study={study} questionPools={questionPools} />
      blob = await pdf(pdfDoc).toBlob()
    }

    if (!blob) return

    // Create and download the file
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Calculate dynamic analytics data from all question pools
  const domainData = (() => {
    const domainCounts: Record<string, number> = {}
    questionPools.forEach((pool) => {
      pool.questions.forEach((question) => {
        domainCounts[question.domain] = (domainCounts[question.domain] || 0) + 1
      })
    })

    const colors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
      "hsl(var(--chart-3))",
      "hsl(var(--chart-4))",
      "hsl(var(--chart-5))",
    ]

    return Object.entries(domainCounts).map(([domain, count], index) => ({
      domain,
      count,
      fill: colors[index % colors.length],
    }))
  })()

  const riskTypeData = (() => {
    const riskTypeCounts: Record<string, number> = {}
    questionPools.forEach((pool) => {
      pool.questions.forEach((question) => {
        riskTypeCounts[question.riskType] = (riskTypeCounts[question.riskType] || 0) + 1
      })
    })

    return Object.entries(riskTypeCounts)
      .map(([riskType, count]) => ({
        riskType,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  })()

  const chartConfig = {
    count: {
      label: "Count",
      color: "hsl(var(--chart-1))",
    },
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!study) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Study not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <Link
          href="/my-studies/1"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Study
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Export & Reports</h1>
            <p className="text-muted-foreground mt-2">Generate reports and analyze risk assessment data</p>
          </div>
          <Link href="/assessment/new?studyId=1">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="export" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="export" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <h2 className="text-xl font-semibold">Assessments</h2>

          {assessments.map((assessment) => (
            <Card
              key={assessment.id}
              className={
                assessment.status === "completed" ? "border-success bg-success/5" : "border-warning bg-warning/5"
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{assessment.name}</CardTitle>
                    <CardDescription className="mt-2">
                      Created {assessment.createdAt.toLocaleDateString()} • Last updated{" "}
                      {assessment.updatedAt.toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {assessment.status === "in-progress" && (
                    <Badge variant="outline" className="ml-4 bg-background">
                      {assessment.progress}% Progress ({assessment.answeredQuestions}/{assessment.totalQuestions}{" "}
                      Questions)
                    </Badge>
                  )}
                  {assessment.status === "completed" && (
                    <Badge variant="outline" className="ml-4 bg-background border-success text-success">
                      Completed
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {assessment.status === "completed" ? (
                  <div className="flex gap-2">
                    <Button onClick={() => handleExport(assessment.id, "pdf")} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export as PDF
                    </Button>
                    <Button
                      onClick={() => handleExport(assessment.id, "csv")}
                      variant="outline"
                      className="gap-2 bg-background"
                    >
                      <Download className="h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button
                      onClick={() => handleExport(assessment.id, "json")}
                      variant="outline"
                      className="gap-2 bg-background"
                    >
                      <Download className="h-4 w-4" />
                      Export as JSON
                    </Button>
                  </div>
                ) : (
                  <Link href={`/assessment/${assessment.id}`}>
                    <Button className="gap-2">
                      <FileText className="h-4 w-4" />
                      Continue Assessment
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}

          {assessments.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Create an assessment to generate reports</p>
                <Link href="/assessment/new?studyId=1">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Overview</CardTitle>
                <CardDescription>Summary of all assessments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Assessments</p>
                    <p className="text-2xl font-bold">{assessments.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-success">{completedAssessments.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-warning">
                      {assessments.filter((a) => a.status === "in-progress").length}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg. Completion</p>
                    <p className="text-2xl font-bold">
                      {Math.round(assessments.reduce((acc, a) => acc + a.progress, 0) / assessments.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Questions by Domain</CardTitle>
                <CardDescription>Distribution across risk domains</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px]">
                  <RePieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={domainData} dataKey="count" nameKey="domain" cx="50%" cy="50%" outerRadius={80}>
                      {domainData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Risk Types Distribution</CardTitle>
              <CardDescription>Breakdown of questions by risk type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={riskTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="riskType" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>Detailed view of all assessments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant={assessment.status === "completed" ? "default" : "outline"}
                          className={
                            assessment.status === "completed"
                              ? "bg-success text-success-foreground"
                              : "border-warning text-warning"
                          }
                        >
                          {assessment.status === "completed" ? "Completed" : "In Progress"}
                        </Badge>
                      </TableCell>
                      <TableCell>{assessment.progress}%</TableCell>
                      <TableCell>
                        {assessment.answeredQuestions}/{assessment.totalQuestions}
                      </TableCell>
                      <TableCell>{assessment.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell>{assessment.updatedAt.toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
