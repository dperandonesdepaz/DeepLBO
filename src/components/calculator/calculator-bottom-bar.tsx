"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt, irrColor, moicColor } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"
import { TrendingUp, Trophy, Building2, Layers, BarChart2 } from "lucide-react"

export function CalculatorBottomBar() {
  const { results, activeSection, setActiveSection } = useAnalysisStore()

  // Show empty bottom bar when no data yet
  if (!results) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Introduce los datos financieros en <button onClick={() => setActiveSection("company")} className="text-primary font-medium hover:underline">Empresa</button> para ver los KPIs del modelo aquí.
          </p>
        </div>
      </div>
    )
  }

  const base = results.scenarios.find(s => s.scenario === "Base")

  const kpis = [
    {
      icon: Building2,
      label: "EV Entrada",
      value: fmt.eur(results.ev),
      sub: `${fmt.mult(results.debtOverEbitda)} Deuda/EBITDA`,
      color: "text-foreground",
    },
    {
      icon: Layers,
      label: "Equity Invertido",
      value: fmt.eur(results.totalEquityInvested),
      sub: `${fmt.eur(results.seniorDebt)} deuda senior`,
      color: "text-foreground",
    },
    {
      icon: TrendingUp,
      label: "IRR Base",
      value: base ? fmt.pct(base.irr) : "—",
      sub: base ? (base.irr >= 0.25 ? "Objetivo cumplido" : "Bajo umbral") : "",
      color: base ? irrColor(base.irr).split(" ")[0] : "text-muted-foreground",
    },
    {
      icon: Trophy,
      label: "MOIC Base",
      value: base ? fmt.mult(base.moic) : "—",
      sub: base ? `€${(base.grossGain).toFixed(1)}M ganancia bruta` : "",
      color: base ? moicColor(base.moic).split(" ")[0] : "text-muted-foreground",
    },
    {
      icon: BarChart2,
      label: "EBITDA Y5",
      value: fmt.eur(results.yearly[5]?.ebitda ?? 0),
      sub: `Margen ${fmt.pct(results.yearly[5]?.ebitdaMargin ?? 0)}`,
      color: "text-foreground",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-border shadow-lg">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-0 overflow-x-auto">
          {kpis.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-4 py-3 border-r border-border shrink-0 min-w-[140px]"
              >
                <div className="w-7 h-7 bg-secondary rounded-md flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground font-medium">{kpi.label}</div>
                  <div className={cn("text-sm font-bold leading-tight", kpi.color)}>{kpi.value}</div>
                  <div className="text-[9px] text-muted-foreground/70 leading-tight">{kpi.sub}</div>
                </div>
              </div>
            )
          })}

          {/* Section quick-nav on the right */}
          <div className="ml-auto flex items-center gap-1 px-4 shrink-0">
            {["overview", "pl", "returns", "sensitivity"].map(s => (
              <button
                key={s}
                onClick={() => setActiveSection(s)}
                className={cn(
                  "px-2.5 py-1 text-[10px] font-medium rounded transition-colors",
                  activeSection === s
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {s === "overview" ? "Resumen" : s === "pl" ? "P&L" : s === "returns" ? "Retornos" : "Sensib."}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
