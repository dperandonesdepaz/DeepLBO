import { MergerLayout } from "@/components/merger/merger-layout"

export default async function MergerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MergerLayout analysisId={id} />
}
