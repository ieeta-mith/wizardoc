"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewStudyForm, NewStudyHeader } from "./components"
import { useNewStudyPage } from "./hooks"

export function NewStudyPageClient() {
  const { form, isSubmitting, launchWizard, pools, poolsLoading, saveStudy } = useNewStudyPage()

  return (
    <div className="container max-w-3xl py-8">
      <NewStudyHeader />

      <Card>
        <CardHeader>
          <CardTitle>New Study</CardTitle>
          <CardDescription>Enter the study details and select which ISO/ICH question set to apply</CardDescription>
        </CardHeader>
        <CardContent>
          <NewStudyForm
            form={form}
            isSubmitting={isSubmitting}
            pools={pools}
            poolsLoading={poolsLoading}
            onSaveStudy={saveStudy}
            onLaunchWizard={launchWizard}
          />
        </CardContent>
      </Card>
    </div>
  )
}
