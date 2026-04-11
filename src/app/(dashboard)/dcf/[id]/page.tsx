import { DCFLayout } from "@/components/dcf/dcf-layout"

export default async function DCFPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DCFLayout analysisId={id} />
}
