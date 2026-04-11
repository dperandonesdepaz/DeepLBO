"use client"

import { useAnalysisStore } from "@/store/analysis-store"
import { fmt } from "@/lib/lbo-engine"
import { cn } from "@/lib/utils"

function Cell({ value, className }: { value: string; className?: string }) {
  return <td className={cn("py-3 px-4 text-xs", className)}>{value}</td>
}

export function SectionDebt() {
  const { results, inputs } = useAnalysisStore()
  if (!results) return null

  const ds = results.debtSchedule

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Schedule de Deuda</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Evolución del saldo de deuda, amortización e indicadores de cobertura
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Deuda Inicial",
            value: fmt.eur(ds[0].closingBalance),
            sub: `${fmt.mult(ds[0].leverageRatio)} x EBITDA`,
            color: "text-foreground"
          },
          {
            label: "Deuda Final (Y5)",
            value: fmt.eur(ds[5]?.closingBalance ?? 0),
            sub: `${fmt.mult(ds[5]?.leverageRatio ?? 0)} x EBITDA`,
            color: "text-green-600"
          },
          {
            label: "Total Amortizado",
            value: fmt.eur(inputs.amortization.reduce((a, b) => a + b, 0)),
            sub: `${fmt.pct(inputs.amortization.reduce((a, b) => a + b, 0) / Math.max(ds[0].closingBalance, 0.001))} del total`,
            color: "text-primary"
          },
          {
            label: "Tipo de Interés",
            value: fmt.pct(inputs.interestRate),
            sub: `€${(ds.slice(1).reduce((a, d) => a + d.interest, 0)).toFixed(1)}M coste total`,
            color: "text-amber-600"
          },
        ].map(item => (
          <div key={item.label} className="bg-white rounded-xl border border-border p-4">
            <div className="text-[11px] text-muted-foreground font-medium mb-1">{item.label}</div>
            <div className={cn("text-xl font-bold", item.color)}>{item.value}</div>
            <div className="text-[10px] text-muted-foreground/70 mt-0.5">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Main debt schedule table */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Tabla de Amortización (M€)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                {["Período", "Saldo Inicial", "Amortización", "Saldo Final", "Intereses", "Deuda/EBITDA", "EBITDA/Intereses"].map(h => (
                  <th key={h} className="py-2.5 px-4 text-left text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ds.map((row, i) => {
                const isEntry = row.year === 0
                return (
                  <tr key={row.year} className={cn("hover:bg-secondary/30 transition-colors", isEntry && "bg-secondary/20")}>
                    <Cell value={isEntry ? "Entrada" : `Año ${row.year}`}
                      className={cn("font-semibold", isEntry ? "text-muted-foreground" : "text-foreground")} />
                    <Cell value={fmt.eur(row.openingBalance)} />
                    <Cell value={isEntry ? "—" : fmt.eur(row.amortization)} className="text-amber-600" />
                    <Cell value={fmt.eur(row.closingBalance)} className="font-semibold text-foreground" />
                    <Cell value={fmt.eur(row.interest)} className="text-red-500/80" />
                    <Cell
                      value={fmt.mult(row.leverageRatio)}
                      className={cn(
                        "font-semibold",
                        row.leverageRatio > 6 ? "text-red-600" :
                        row.leverageRatio > 5 ? "text-amber-600" : "text-green-600"
                      )}
                    />
                    <Cell
                      value={`${row.coverageRatio.toFixed(1)}x`}
                      className={cn(
                        "font-semibold",
                        row.coverageRatio < 2 ? "text-red-600" :
                        row.coverageRatio < 3 ? "text-amber-600" : "text-green-600"
                      )}
                    />
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual amortization chart */}
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Evolución del Saldo (M€)</h3>
        <div className="space-y-2">
          {ds.map(row => {
            const maxDebt = ds[0].closingBalance
            const pct = maxDebt > 0 ? (row.closingBalance / maxDebt) * 100 : 0
            return (
              <div key={row.year} className="flex items-center gap-3">
                <div className="w-14 text-xs text-muted-foreground shrink-0">
                  {row.year === 0 ? "Entrada" : `Año ${row.year}`}
                </div>
                <div className="flex-1 bg-secondary rounded-full h-5 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-[10px] font-semibold text-white drop-shadow">
                      {fmt.eur(row.closingBalance)}
                    </span>
                  </div>
                </div>
                <div className="w-12 text-right text-xs font-semibold text-muted-foreground">
                  {pct.toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
