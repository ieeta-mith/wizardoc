"use client"

import { useSearchParams } from "next/navigation"
import { BarChart3, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsTab, AssessmentsExportTab, ExportPageHeader } from "./components"
import { useExportPage } from "./hooks"

export function ExportPageClient() {
  const searchParams = useSearchParams()
  const assessmentId = searchParams.get("assessmentId")
  const { assessments, exportAssessment, loading, metadataDistributions, stats, study } = useExportPage(assessmentId)

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
          <p className="text-muted-foreground">Project not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <ExportPageHeader studyId={study.id} />

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

        <TabsContent value="export">
          <AssessmentsExportTab assessments={assessments} studyId={study.id} onExport={exportAssessment} />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab assessments={assessments} metadataDistributions={metadataDistributions} stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
