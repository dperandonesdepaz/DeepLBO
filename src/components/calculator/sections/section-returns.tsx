"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt, irrColor, moicColor, irrLabel } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"
import type { ExitScenario } from "@/types/lbo"

const SCENARIO_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  Bear:      { bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700" },
  Base:      { bg: "bg-primary/5",  border: "border-primary/20", text: "text-primary",    badge: "bg-primary/10 text-primary" },
  Bull:      { bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700" },
  Strategic: { bg: "bg-purple-50",  border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
}

function ScenarioCard({ s }: { s: ExitScenario }) {
  const c = SCENARIO_COLORS[s.scenario]
  const irrC = irrColor(s.irr)
  const moicC = moicColor(s.moic)
  return (
    <div className={cn("rounded-xl border p-5 space-y-4", c.bg, c.border)}>
      <div className="flex items-center justify-between">
        <span className={cn("text-xs font-bold uppercase tracking-wider", c.text)}>{s.scenario}</span>
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", c.badge)}>
          {fmt.mult(s.exitMultiple)} x
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[10px] text-muted-foreground">EV Salida</div>
          <div className="text-sm font-bold text-foreground">{fmt.eur(s.evAtExit)}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Equity Salida</div>
          <div className="text-sm font-bold text-foreground">{fmt.eur(s.equityAtExit)}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">IRR</div>
          <div className={cn("text-xl font-bold", irrC.split(" ")[0])}>{fmt.pct(s.irr)}</div>
          <div className={cn("text-[10px] font-medium mt-0.5", irrC.split(" ")[0])}>{irrLabel(s.irr)}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">MOIC</div>
          <div className={cn("text-xl font-bold", moicC.split(" ")[0])}>{fmt.mult(s.moic)}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">{fmt.eur(s.grossGain)} ganancia</div>
        </div>
      </div>
    </div>
  )
}

export function SectionReturns() {
  const { results, inputs } = useAnalysisStore()
  if (!results) return null

  const base = results.scenarios.find(s => s.scenario === "Base")!

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Retornos y Salida</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Escenarios de desinversión, IRR, MOIC y análisis de creación de valor
        </p>
      </div>

      {/* Scenario cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.scenarios.map(s => <ScenarioCard key={s.scenario} s={s} />)}
      </div>

      {/* Detailed table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Tabla Detallada de Retornos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                {["Escenario", "Mult. Salida", "EBITDA Salida", "EV Salida", "Deuda Salida", "Equity Salida", "Ganancia", "MOIC", "IRR"].map(h => (
                  <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.scenarios.map(s => {
                const irrC = irrColor(s.irr)
                const moicC = moicColor(s.moic)
                const c = SCENARIO_COLORS[s.scenario]
                return (
                  <tr key={s.scenario} className="hover:bg-secondary/30 transition-colors">
                    <td className={cn("py-3 px-4 text-xs font-bold", c.text)}>{s.scenario}</td>
                    <td className="py-3 px-4 text-xs font-semibold">{fmt.mult(s.exitMultiple)}</td>
                    <td className="py-3 px-4 text-xs">{fmt.eur(s.ebitdaAtExit)}</td>
                    <td className="py-3 px-4 text-xs font-semibold">{fmt.eur(s.evAtExit)}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">{fmt.eur(s.debtAtExit)}</td>
                    <td className="py-3 px-4 text-xs font-semibold">{fmt.eur(s.equityAtExit)}</td>
                    <td className={cn("py-3 px-4 text-xs font-semibold", s.grossGain >= 0 ? "text-green-600" : "text-red-600")}>
                      {s.grossGain >= 0 ? "+" : ""}{fmt.eur(s.grossGain)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", moicC)}>
                        {fmt.mult(s.moic)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", irrC)}>
                        {fmt.pct(s.irr)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Value Bridge + Equity Build-up side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Value Bridge */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Value Bridge — Caso Base
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              (Equity {fmt.eur(base.equityInvested)} → {fmt.eur(base.equityAtExit)})
            </span>
          </h3>
          <div className="space-y-3">
            {results.valueBridge.map((item, i) => {
              const isTotal = item.color === "total"
              const isNeg   = item.color === "negative"
              const barPct  = item.pct != null ? Math.min(Math.abs(item.pct) * 100, 100) : 100
              return (
                <div key={i} className={cn("space-y-1", isTotal && "pt-3 border-t border-border mt-1")}>
                  <div className="flex items-center justify-between text-xs">
                    <span className={cn("font-medium", isTotal ? "text-primary font-bold" : "text-muted-foreground")}>
                      {item.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.pct != null && (
                        <span className="text-[10px] text-muted-foreground/70">
                          {(item.pct * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className={cn(
                        "font-bold text-right min-w-[56px]",
                        isTotal ? "text-primary" : isNeg ? "text-red-600" : "text-emerald-600"
                      )}>
                        {!isNeg && item.value > 0 ? "+" : ""}{fmt.eur(item.value)}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isTotal ? "bg-primary" : isNeg ? "bg-red-400" : "bg-emerald-400"
                      )}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Return metrics by year */}
        <div className="bg-white rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Retorno por Año de Salida (Caso Base)
          </h3>
          <div className="space-y-2">
            {[3, 4, 5].map(yr => {
              const ebitdaYr = results.yearly[yr]?.ebitda ?? 0
              const debtYr   = results.debtSchedule[yr]?.closingBalance ?? 0
              const evYr     = ebitdaYr * inputs.exitMultiples.base
              const eqYr     = Math.max(0, evYr - debtYr)
              const moicYr   = eqYr / Math.max(base.equityInvested, 0.001)
              const irrYr    = Math.pow(Math.max(moicYr, 0), 1 / yr) - 1
              const irrC     = irrColor(irrYr)
              const moicC    = moicColor(moicYr)
              return (
                <div key={yr} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Año {yr}</div>
                    <div className="text-[11px] text-muted-foreground">
                      EV: {fmt.eur(evYr)} · Deuda: {fmt.eur(debtYr)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", irrC)}>
                      {fmt.pct(irrYr)} IRR
                    </span>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", moicC)}>
                      {fmt.mult(moicYr)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Equity invested callout */}
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="text-xs text-primary font-semibold mb-1">Equity Invertido (Caso Base)</div>
            <div className="text-2xl font-bold text-primary">{fmt.eur(base.equityInvested)}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              EV entrada {fmt.eur(results.ev)} · Deuda {fmt.eur(results.seniorDebt)} · Fees {fmt.eur(results.fees)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
