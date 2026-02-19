import { PoolDetailPageClient } from "@/app/question-pool/[id]/pool-detail-page-client"

interface TemplateDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { id } = await params
  return <PoolDetailPageClient id={id} />
}
