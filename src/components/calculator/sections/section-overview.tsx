"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt, irrColor, moicColor, irrLabel } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"
import {
  TrendingUp, Trophy, Building2, Layers,
  BarChart2, Percent, DollarSign, ArrowRight
} from "lucide-react"

function KPICard({
  label, value, sub, icon: Icon, color, badge
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; color?: string; badge?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-muted-foreground" />
        </div>
        {badge && (
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", color)}>
            {badge}
          </span>
        )}
      </div>
      <div>
        <div className={cn("text-2xl font-bold leading-none", color ?? "text-foreground")}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1 font-medium">{label}</div>
        {sub && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function ScenarioRow({
  label, irr, moic, ev, color
}: { label: string; irr: number; moic: number; ev: number; color: string }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className={cn("w-16 text-xs font-semibold", color)}>{label}</div>
      <div className="flex-1 grid grid-cols-3 gap-2">
        <div>
          <div className="text-xs text-muted-foreground">EV Salida</div>
          <div className="text-sm font-semibold text-foreground">{fmt.eur(ev)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">IRR</div>
          <div className={cn("text-sm font-bold", irrColor(irr).split(" ")[0])}>{fmt.pct(irr)}</div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground">MOIC</div>
          <div className={cn("text-sm font-bold", moicColor(moic).split(" ")[0])}>{fmt.mult(moic)}</div>
        </div>
      </div>
    </div>
  )
}

const SCENARIO_COLORS = {
  Bear: "text-red-500",
  Base: "text-primary",
  Bull: "text-green-600",
  Strategic: "text-purple-600",
}

export function SectionOverview() {
  const { results, inputs, setActiveSection } = useAnalysisStore()

  // Empty state — no data entered yet
  if (!results) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-bold text-foreground">Resumen del Análisis</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visión consolidada de los inputs y retornos del modelo LBO
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-dashed border-border p-16 text-center">
          <div className="w-14 h-14 bg-primary/8 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <BarChart2 className="w-7 h-7 text-primary/50" />
          </div>
          <h3 className="font-semibold text-foreground mb-2">Sin datos todavía</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
            Introduce los financieros de la empresa en la sección <span className="text-foreground font-medium">Empresa</span> para ver el análisis completo aquí.
          </p>
          <button
            onClick={() => setActiveSection("company")}
            className="inline-flex items-center gap-2 h-9 px-5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ir a Empresa <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const base = results.scenarios.find(s => s.scenario === "Base")!
  const y5 = results.yearly[5]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Resumen del Análisis</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visión consolidada de los inputs y retornos del modelo LBO
        </p>
      </div>

      {/* Entry KPIs */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Entrada</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Enterprise Value"
            value={fmt.eur(results.ev)}
            sub={`${fmt.mult(inputs.entryMultiple)} x EBITDA`}
            icon={Building2}
          />
          <KPICard
            label="Equity Invertido"
            value={fmt.eur(results.totalEquityInvested)}
            sub={`Fees: ${fmt.eur(results.fees)}`}
            icon={Layers}
          />
          <KPICard
            label="Deuda Senior"
            value={fmt.eur(results.seniorDebt)}
            sub={`${fmt.mult(results.debtOverEbitda)} x EBITDA`}
            icon={DollarSign}
          />
          <KPICard
            label="Cobertura Intereses"
            value={`${results.interestCoverage.toFixed(1)}x`}
            sub={`${fmt.pct(inputs.interestRate)} tipo interés`}
            icon={Percent}
            color={results.interestCoverage >= 2 ? "text-green-600" : "text-amber-600"}
          />
        </div>
      </div>

      {/* Returns KPIs */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">
          Retornos — Caso Base ({inputs.holdPeriod} años)
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="IRR Caso Base"
            value={fmt.pct(base.irr)}
            sub={irrLabel(base.irr)}
            icon={TrendingUp}
            color={irrColor(base.irr).split(" ")[0]}
            badge={irrLabel(base.irr)}
          />
          <KPICard
            label="MOIC Caso Base"
            value={fmt.mult(base.moic)}
            sub={`${fmt.eur(base.grossGain)} ganancia bruta`}
            icon={Trophy}
            color={moicColor(base.moic).split(" ")[0]}
          />
          <KPICard
            label="EBITDA Y5"
            value={fmt.eur(y5.ebitda)}
            sub={`Margen ${fmt.pct(y5.ebitdaMargin)}`}
            icon={BarChart2}
          />
          <KPICard
            label="Revenue Y5"
            value={fmt.eur(y5.revenue)}
            sub={`CAGR ${fmt.pct(Math.pow(y5.revenue / results.yearly[0].revenue, 1/5) - 1)}`}
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Scenarios table + Value Bridge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scenarios */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Escenarios de Salida</h3>
          {results.scenarios.map(s => (
            <ScenarioRow
              key={s.scenario}
              label={s.scenario}
              irr={s.irr}
              moic={s.moic}
              ev={s.evAtExit}
              color={SCENARIO_COLORS[s.scenario] ?? "text-foreground"}
            />
          ))}
        </div>

        {/* Value Bridge */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Value Bridge — Caso Base
          </h3>
          <div className="space-y-2">
            {results.valueBridge.map((item, i) => {
              const isTotal = item.color === "total"
              const isNeg   = item.color === "negative"
              const barWidth = item.pct != null
                ? Math.min(Math.abs(item.pct) * 100, 100)
                : 100
              return (
                <div key={i} className={cn("flex items-center gap-3", isTotal && "pt-2 border-t border-border mt-2")}>
                  <div className="w-36 text-xs text-muted-foreground shrink-0">{item.label}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-secondary rounded-full h-1.5">
                        <div
                          className={cn("h-1.5 rounded-full", isTotal ? "bg-primary" : isNeg ? "bg-red-400" : "bg-emerald-400")}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <div className={cn(
                        "text-xs font-semibold w-16 text-right",
                        isTotal ? "text-primary" : isNeg ? "text-red-600" : "text-emerald-600"
                      )}>
                        {isNeg ? "" : "+"}{fmt.eur(item.value, 1)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Revenue & EBITDA projection summary */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Proyección Financiera (Resumen)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left pb-2 text-muted-foreground font-medium">Métrica</th>
                {results.yearly.slice(1).map(y => (
                  <th key={y.year} className="text-right pb-2 text-muted-foreground font-medium">Y{y.year}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-2 text-muted-foreground">Revenue (M€)</td>
                {results.yearly.slice(1).map(y => (
                  <td key={y.year} className="py-2 text-right font-medium">{y.revenue.toFixed(1)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">Crecimiento</td>
                {results.yearly.slice(1).map(y => (
                  <td key={y.year} className={cn("py-2 text-right font-medium", y.revenueGrowth != null && y.revenueGrowth > 0 ? "text-green-600" : "text-red-600")}>
                    {y.revenueGrowth != null ? fmt.pct(y.revenueGrowth) : "—"}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">EBITDA (M€)</td>
                {results.yearly.slice(1).map(y => (
                  <td key={y.year} className="py-2 text-right font-medium">{y.ebitda.toFixed(1)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">Margen EBITDA</td>
                {results.yearly.slice(1).map(y => (
                  <td key={y.year} className="py-2 text-right font-medium text-primary">{fmt.pct(y.ebitdaMargin)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-2 text-muted-foreground">FCF (M€)</td>
                {results.yearly.slice(1).map(y => (
                  <td key={y.year} className={cn("py-2 text-right font-medium", y.fcfBeforeDebt >= 0 ? "text-green-600" : "text-red-600")}>
                    {y.fcfBeforeDebt.toFixed(1)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sector Benchmark */}
      <SectorBenchmark />
    </div>
  )
}

// ─── Sector benchmark data ────────────────────────────────────────────────────
const SECTOR_BENCHMARKS: Record<string, {
  entryMultiple: [number, number]
  ebitdaMargin: [number, number]
  revenueCAGR: [number, number]
  leverage: [number, number]
  irr: [number, number]
}> = {
  "Software / SaaS":          { entryMultiple: [12, 18], ebitdaMargin: [0.20, 0.30], revenueCAGR: [0.15, 0.25], leverage: [3.5, 5.0], irr: [0.30, 0.45] },
  "Tecnología":               { entryMultiple: [10, 16], ebitdaMargin: [0.15, 0.25], revenueCAGR: [0.10, 0.20], leverage: [3.5, 5.0], irr: [0.25, 0.40] },
  "Salud / Farma":            { entryMultiple: [11, 15], ebitdaMargin: [0.18, 0.28], revenueCAGR: [0.08, 0.15], leverage: [3.5, 4.5], irr: [0.25, 0.38] },
  "Industria / Manufactura":  { entryMultiple: [7, 11],  ebitdaMargin: [0.12, 0.20], revenueCAGR: [0.04, 0.10], leverage: [4.0, 6.0], irr: [0.20, 0.35] },
  "Retail / Consumo":         { entryMultiple: [7, 12],  ebitdaMargin: [0.08, 0.16], revenueCAGR: [0.06, 0.15], leverage: [4.0, 5.5], irr: [0.22, 0.35] },
  "Distribución / Logística": { entryMultiple: [7, 10],  ebitdaMargin: [0.07, 0.14], revenueCAGR: [0.05, 0.12], leverage: [4.0, 5.5], irr: [0.20, 0.32] },
  "Servicios Financieros":    { entryMultiple: [9, 14],  ebitdaMargin: [0.25, 0.40], revenueCAGR: [0.08, 0.15], leverage: [3.0, 4.5], irr: [0.22, 0.35] },
  "Alimentación & Bebidas":   { entryMultiple: [8, 13],  ebitdaMargin: [0.10, 0.18], revenueCAGR: [0.05, 0.12], leverage: [4.0, 5.5], irr: [0.20, 0.32] },
  "Infraestructura":          { entryMultiple: [10, 16], ebitdaMargin: [0.35, 0.55], revenueCAGR: [0.04, 0.10], leverage: [5.0, 7.0], irr: [0.12, 0.22] },
  "Educación":                { entryMultiple: [9, 14],  ebitdaMargin: [0.15, 0.25], revenueCAGR: [0.08, 0.18], leverage: [3.5, 5.0], irr: [0.22, 0.35] },
}

function SectorBenchmark() {
  const { inputs, results } = useAnalysisStore()
  const sector = inputs.sector
  const bench  = SECTOR_BENCHMARKS[sector]

  if (!bench || !results) return null

  const base = results.scenarios.find(s => s.scenario === "Base")!
  const y5   = results.yearly[5]
  const revCAGR = Math.pow(y5.revenue / Math.max(results.yearly[0].revenue, 0.001), 1/5) - 1

  function status(val: number, [lo, hi]: [number, number]): "above" | "in" | "below" {
    if (val > hi) return "above"
    if (val < lo) return "below"
    return "in"
  }

  const metrics: { label: string; val: number; bench: [number, number]; format: (v: number) => string }[] = [
    { label: "Múltiplo entrada", val: inputs.entryMultiple,   bench: bench.entryMultiple, format: fmt.mult },
    { label: "Margen EBITDA Y5", val: y5.ebitdaMargin,       bench: bench.ebitdaMargin,  format: fmt.pct  },
    { label: "CAGR Revenue",     val: revCAGR,                bench: bench.revenueCAGR,   format: fmt.pct  },
    { label: "Apalancamiento",   val: results.debtOverEbitda, bench: bench.leverage,      format: fmt.mult },
    { label: "IRR Base",         val: base.irr,               bench: bench.irr,           format: fmt.pct  },
  ]

  return (
    <div className="bg-white rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">
          Benchmark Sectorial — <span className="text-primary">{sector}</span>
        </h3>
        <span className="text-[10px] text-muted-foreground">Rangos típicos de mercado</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {metrics.map(m => {
          const s = status(m.val, m.bench)
          const colors = {
            above: "text-blue-600 bg-blue-50 border-blue-200",
            in:    "text-green-600 bg-green-50 border-green-200",
            below: "text-amber-600 bg-amber-50 border-amber-200"
          }
          const labels = { above: "Por encima", in: "En rango", below: "Por debajo" }
          return (
            <div key={m.label} className={cn("rounded-lg border p-3", colors[s])}>
              <div className="text-[10px] text-muted-foreground font-medium mb-1">{m.label}</div>
              <div className="text-base font-bold">{m.format(m.val)}</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {m.format(m.bench[0])} – {m.format(m.bench[1])}
              </div>
              <div className="text-[9px] font-semibold mt-1">{labels[s]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
