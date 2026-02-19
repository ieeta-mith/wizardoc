import { redirect } from "next/navigation"

interface PoolDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PoolDetailPage({ params }: PoolDetailPageProps) {
  const { id } = await params
  redirect(`/templates/${id}`)
}
