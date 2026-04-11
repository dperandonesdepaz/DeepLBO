import { JoinPage } from "@/components/workspace/join-page"

export default async function Join({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  return <JoinPage inviteCode={code} />
}
