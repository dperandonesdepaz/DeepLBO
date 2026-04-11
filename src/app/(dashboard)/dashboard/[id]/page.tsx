import { CalculatorLayout } from "@/components/calculator/calculator-layout"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AnalysisPage({ params }: Props) {
  const { id } = await params
  return <CalculatorLayout analysisId={id} />
}
