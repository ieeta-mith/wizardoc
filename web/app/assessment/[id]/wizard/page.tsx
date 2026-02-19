import { WizardPageClient } from "./wizard-page-client"

interface WizardPageProps {
  params: Promise<{ id: string }>
}

export default async function WizardPage({ params }: WizardPageProps) {
  const { id } = await params
  return <WizardPageClient assessmentId={id} />
}
