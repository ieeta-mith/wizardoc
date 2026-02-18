import { PoolDetailPageClient } from "./pool-detail-page-client"

interface PoolDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { id } = await params
  return <PoolDetailPageClient id={id} />
}
