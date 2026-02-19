import { StudyDetailPageClient } from "./study-detail-page-client"

interface StudyDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function StudyDetailPage({ params }: StudyDetailPageProps) {
  const { id } = await params
  return <StudyDetailPageClient studyId={id} />
}
