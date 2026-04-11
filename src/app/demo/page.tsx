import { CalculatorLayout } from "@/components/calculator/calculator-layout"

export const metadata = {
  title: "Demo | DeepLBO",
  description: "Explora un análisis LBO real sin registrarte. Ve cómo funciona DeepLBO.",
}

export default function DemoPage() {
  return <CalculatorLayout analysisId="demo" />
}
