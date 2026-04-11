"use client"

import { useEffect, useState } from "react"
import { Sparkles, X, TrendingUp, AlertTriangle, CheckCircle2, Info, Lightbulb, ChevronDown } from "lucide-react"
import { useAnalysisStore } from "@/store/analysis-store"
import { fmt, irrLabel } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"
import type { LBOResults, LBOInputs } from "@/types/lbo"

// ─── Rule-based AI analysis ──────────────────────────────────────────────────
interface Insight {
  type: "good" | "warning" | "info" | "suggestion"
  title: string
  body: string
  metric?: string
}

function analyzeModel(r: LBOResults, i: LBOInputs): Insight[] {
  const insights: Insight[] = []
  const base = r.scenarios.find(s => s.scenario === "Base")!

  // IRR analysis
  if (base.irr >= 0.40) {
    insights.push({ type: "good", title: "IRR excepcional", metric: fmt.pct(base.irr),
      body: `Un IRR del ${fmt.pct(base.irr)} está muy por encima del umbral típico de PE (25-35%). El deal tiene un perfil de retorno extraordinario.` })
  } else if (base.irr >= 0.30) {
    insights.push({ type: "good", title: "IRR sólido", metric: fmt.pct(base.irr),
      body: `${fmt.pct(base.irr)} IRR base es un retorno atractivo para un deal de PE mid-market. Supera el hurdle rate típico del 25%.` })
  } else if (base.irr >= 0.20) {
    insights.push({ type: "warning", title: "IRR por debajo de benchmark", metric: fmt.pct(base.irr),
      body: `Un IRR del ${fmt.pct(base.irr)} está cerca del límite mínimo aceptable. Considera negociar el precio de entrada o mejorar el plan de creación de valor.` })
  } else {
    insights.push({ type: "warning", title: "IRR bajo — revisar tesis", metric: fmt.pct(base.irr),
      body: `Con ${fmt.pct(base.irr)} de IRR, el deal no cumple el mínimo de retorno de PE (25%). El precio de entrada o el plan operativo necesitan revisión.` })
  }

  // Leverage
  if (r.debtOverEbitda > 6) {
    insights.push({ type: "warning", title: "Apalancamiento muy alto", metric: fmt.mult(r.debtOverEbitda),
      body: `${fmt.mult(r.debtOverEbitda)} Deuda/EBITDA es agresivo. En entornos de tipos altos aumenta el riesgo de covenant breach. Considera reducir a 5-5.5x.` })
  } else if (r.debtOverEbitda < 3.5) {
    insights.push({ type: "info", title: "Apalancamiento conservador", metric: fmt.mult(r.debtOverEbitda),
      body: `${fmt.mult(r.debtOverEbitda)} Deuda/EBITDA es conservador. Hay margen para aumentar la deuda y mejorar el IRR vía equity kick-up.` })
  }

  // Interest coverage
  if (r.interestCoverage < 2.0) {
    insights.push({ type: "warning", title: "Cobertura de intereses ajustada", metric: `${r.interestCoverage.toFixed(1)}x`,
      body: `Con ${r.interestCoverage.toFixed(1)}x EBITDA/Intereses, cualquier deterioro del EBITDA puede comprometer el servicio de la deuda. El banco exigirá covenant de cobertura.` })
  } else if (r.interestCoverage > 4) {
    insights.push({ type: "good", title: "Cobertura de intereses holgada", metric: `${r.interestCoverage.toFixed(1)}x`,
      body: `${r.interestCoverage.toFixed(1)}x de cobertura de intereses ofrece mucho margen frente a deterioro del negocio. Posición cómoda ante el banco.` })
  }

  // EBITDA margin expansion
  const marginEntry = r.yearly[0].ebitdaMargin
  const marginY5    = r.yearly[5].ebitdaMargin
  const expansion   = marginY5 - marginEntry
  if (expansion > 0.08) {
    insights.push({ type: "warning", title: "Expansión de margen muy agresiva", metric: `+${fmt.pct(expansion)}`,
      body: `Una expansión de ${fmt.pct(expansion)} en margen EBITDA a lo largo de 5 años es muy ambiciosa. Justifica con palancas concretas de mejora operativa.` })
  } else if (expansion > 0.03) {
    insights.push({ type: "good", title: "Mejora de márgenes razonable", metric: `+${fmt.pct(expansion)}`,
      body: `Expansión de ${fmt.pct(expansion)} en margen EBITDA es realista con un plan operativo sólido (pricing, mix, eficiencias). Bien fundamentado.` })
  }

  // Revenue CAGR
  const revCAGR = Math.pow(r.yearly[5].revenue / r.yearly[0].revenue, 1/5) - 1
  if (revCAGR > 0.20) {
    insights.push({ type: "warning", title: "CAGR revenue muy elevado", metric: fmt.pct(revCAGR),
      body: `Un CAGR de ${fmt.pct(revCAGR)} anual requiere ejecución perfecta. Revisa si el mercado soporta esa tasa de crecimiento sostenida.` })
  } else if (revCAGR < 0.04) {
    insights.push({ type: "info", title: "Crecimiento de revenue modesto", metric: fmt.pct(revCAGR),
      body: `Con ${fmt.pct(revCAGR)} de CAGR, los retornos dependen principalmente de la expansión de múltiplo y el desapalancamiento. Asegúrate de que el múltiplo de salida es realista.` })
  }

  // Entry multiple vs sector
  const sector = (i.sector ?? "").toLowerCase()
  let sectorBenchmarkMult = 10
  if (sector.includes("software") || sector.includes("saas")) sectorBenchmarkMult = 14
  else if (sector.includes("salud") || sector.includes("farma")) sectorBenchmarkMult = 13
  else if (sector.includes("industrial")) sectorBenchmarkMult = 8
  else if (sector.includes("retail")) sectorBenchmarkMult = 9

  if (i.entryMultiple > sectorBenchmarkMult * 1.2) {
    insights.push({ type: "warning", title: "Múltiplo de entrada premium vs sector", metric: fmt.mult(i.entryMultiple),
      body: `${fmt.mult(i.entryMultiple)} vs benchmark sectorial de ~${fmt.mult(sectorBenchmarkMult)}. Pagas un premium importante. Justifícalo con ventajas competitivas diferenciales.` })
  } else if (i.entryMultiple < sectorBenchmarkMult * 0.85) {
    insights.push({ type: "good", title: "Entrada atractiva vs sector", metric: fmt.mult(i.entryMultiple),
      body: `${fmt.mult(i.entryMultiple)} es un descuento vs benchmark de ~${fmt.mult(sectorBenchmarkMult)}. Margen de seguridad en precio de entrada.` })
  }

  // Value bridge — what's the main driver
  const bridge = r.valueBridge.filter(v => v.color !== "total" && v.color !== "negative" && v.value > 0)
  if (bridge.length > 0) {
    const topDriver = bridge.sort((a, b) => b.value - a.value)[0]
    insights.push({ type: "info", title: `Principal driver: ${topDriver.label}`, metric: `+${fmt.eur(topDriver.value)}`,
      body: `La mayor fuente de creación de valor es ${topDriver.label} (${topDriver.pct != null ? fmt.pct(topDriver.pct) : ""} del total). Asegúrate de que este vector está bien fundamentado.` })
  }

  // FCF generation
  const avgFCF = r.yearly.slice(1, 6).reduce((s, y) => s + y.fcfBeforeDebt, 0) / 5
  if (avgFCF < 0) {
    insights.push({ type: "warning", title: "FCF medio negativo", metric: fmt.eur(avgFCF),
      body: `La empresa consume caja en promedio. El servicio de la deuda dependerá de refinanciación o nuevas inyecciones de capital.` })
  }

  return insights
}

const INSIGHT_CONFIG = {
  good:       { icon: CheckCircle2, color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  warning:    { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50",  border: "border-amber-200" },
  info:       { icon: Info,          color: "text-blue-600",  bg: "bg-blue-50",   border: "border-blue-200"  },
  suggestion: { icon: Lightbulb,     color: "text-violet-600",bg: "bg-violet-50", border: "border-violet-200"},
}

export function AIPanel({ onClose }: { onClose: () => void }) {
  const { results, inputs } = useAnalysisStore()
  const [expanded, setExpanded] = useState<number | null>(0)

  if (!results) {
    return (
      <div className="fixed right-0 top-14 bottom-0 z-30 w-80 bg-white border-l border-border flex flex-col shadow-xl">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Asistente IA</span>
          </div>
          <button onClick={onClose}><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <Sparkles className="w-8 h-8 text-primary/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Introduce datos financieros para obtener el análisis automático del modelo.</p>
          </div>
        </div>
      </div>
    )
  }

  const insights = analyzeModel(results, inputs)
  const base = results.scenarios.find(s => s.scenario === "Base")!

  return (
    <div className="fixed right-0 top-14 bottom-0 z-30 w-80 bg-white border-l border-border flex flex-col shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Asistente IA</span>
          <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">BETA</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-secondary rounded-lg">
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Summary verdict */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 shrink-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">Veredicto del modelo</div>
        <div className="text-sm font-bold text-foreground">
          {irrLabel(base.irr)} — {fmt.pct(base.irr)} IRR · {fmt.mult(base.moic)} MOIC
        </div>
        <div className="text-xs text-muted-foreground">{insights.filter(i => i.type === "warning").length} alertas · {insights.filter(i => i.type === "good").length} fortalezas</div>
      </div>

      {/* Insights */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {insights.map((insight, idx) => {
          const cfg = INSIGHT_CONFIG[insight.type]
          const Icon = cfg.icon
          const isExpanded = expanded === idx
          return (
            <div key={idx} className={cn("rounded-lg border overflow-hidden", cfg.border)}>
              <button
                className={cn("w-full flex items-center gap-2.5 p-3 text-left transition-colors", isExpanded ? cfg.bg : "hover:" + cfg.bg)}
                onClick={() => setExpanded(isExpanded ? null : idx)}
              >
                <Icon className={cn("w-4 h-4 shrink-0", cfg.color)} />
                <div className="flex-1 min-w-0">
                  <div className={cn("text-xs font-semibold", cfg.color)}>{insight.title}</div>
                  {insight.metric && <div className="text-[10px] text-muted-foreground">{insight.metric}</div>}
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0", isExpanded && "rotate-180")} />
              </button>
              {isExpanded && (
                <div className={cn("px-3 pb-3", cfg.bg)}>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{insight.body}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="px-4 py-2 border-t border-border shrink-0">
        <p className="text-[9px] text-muted-foreground/60 text-center">
          Análisis automático basado en reglas de PE. No sustituye el juicio profesional.
        </p>
      </div>
    </div>
  )
}
