"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewStudyForm, NewStudyHeader } from "./components"
import { useNewStudyPage } from "./hooks"

export function NewStudyPageClient() {
  const {
    form,
    isSubmitting,
    launchWizard,
    pools,
    poolsLoading,
    saveProject,
    studies,
    studiesLoading,
    submitError,
  } = useNewStudyPage()

  return (
    <div className="container max-w-3xl py-8">
      <NewStudyHeader />

      <Card>
        <CardHeader>
          <CardTitle>Create New Document</CardTitle>
          <CardDescription>
            Choose a template first, then decide whether this document belongs to an existing project or a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewStudyForm
            form={form}
            isSubmitting={isSubmitting}
            pools={pools}
            poolsLoading={poolsLoading}
            studies={studies}
            studiesLoading={studiesLoading}
            onSaveProject={saveProject}
            onLaunchWizard={launchWizard}
          />
          {submitError && <p className="mt-4 text-sm text-destructive">{submitError}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
